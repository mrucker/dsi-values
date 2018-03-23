Kernel = function () {
}

Kernel.dot = function(x) {
    var mat = (new ma.dl.matrix(x)).trn();
            
    return mat.trn().mul(mat); 
}

Kernel.gau = function(x) {
    var dmat = Kernel.dmat2(x);
    var sigm = new ma.dl.scalar(1);
    var neg  = new ma.dl.scalar(-1);
    
    return dmat.pow(2).div(sigm).mul(neg).exp();
}

//yuck, slow
Kernel.dmat1 = function(x) {
    var dmat = Array(x.length).fill().map(function() { return []; });

    var vectors = x.map(function(s) {
        return new ma.dl.vector(s);
    });
    
    for(var i = 0; i < vectors.length; i++) {
        for(var j = i; j < vectors.length; j++) {
            var norm = vectors[i].sub(vectors[j]).norm().toNumber();
            
            dmat[i][j] = norm;
            dmat[j][i] = norm;
        }
    }

    return new ma.dl.matrix(dmat);
}

Kernel.dmat2 = function(x) {
    var dmat = Array(x.length).fill().map(function() { return []; });
    
    var matrix = new ma.dl.matrix(x);
    
    var norms = matrix.getTensor().norm('euclidean', 1).square().dataSync();
    var trans = matrix.mul(matrix.trn());
        
    for(var i = 0; i < norms.length; i++) {
        for(var j = i; j < norms.length; j++) {
            dmat[j][i] = dmat[i][j] = norms[i] + norms[j];
        }
    }
    
    return (new ma.dl.matrix(dmat)).sub(trans.mul(new ma.dl.scalar(2))).sqrt();
}