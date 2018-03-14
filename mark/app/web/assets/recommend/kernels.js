Kernel = function () {
}

Kernel.dot = function(x) {
    var mat = (new ma.dl.matrix(x)).trn();
            
    return mat.trn().mul(mat); 
}

Kernel.gau = function(x) {
    var dmat = Kernel.dmat(x);
    var sigm = new ma.dl.scalar(1);
    var neg  = new ma.dl.scalar(-1);
    
    return dmat.pow(2).div(sigm).mul(neg).exp();
}

Kernel.dmat = function(x) {
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