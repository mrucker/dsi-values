function projectionRecommendation() {
    var epsilon     = .001;
    var discount    = .9;
    var states      = new ma.matrix([[],[],[],[]]);     //features for each state
    var structure   = [[0,1,3],[0,1,2],[3,1],[0,1],[0,1]] //should be same length as tE
    
    var finalChoices = [0,2,3];
    
    var tE  = [0, 2, 3, 1, 0];                            //expert state trajectory 
    var sE = Array(states.size(1)).fill(0);
    
    
    for(var i = 0; i < tE.length; i++) {
        sE[tE[i]] += Math.pow(discount, tE.length-i-1);
    };
    
    sE = new ma.vector(sE);
    
    var rand_r = Array(states.size(1)).fill().map(function() { return Math.random(); });
    var rand_s = stateExpectation(rand_r, structure, discount);
    
    var rs = [rand_r];
    var ss = [new ma.vector(rand_s)];
    var sb = [new ma.vector(rand_s)];
    
    var ts = [undefined];
    
    var ff = k(states, states);
    
    rs[1] = ff.mul(sE.sub(sb[0])).toArray();
    ss[1] = stateExpectation(rs[1], structure, discount);
    
    //ts[1] = sqrt(sE'*ff*sE + sb[0]'*ff*sb[0] - 2*sE'*ff*sb[0]);
    ts[1] = Math.sqrt(sE.trn().mul(ff).mul(sE).add(sb[0].trn().mul(ff).mul(sb[0]).sub(sE.trn().mul(ff).mul(sb[0])).mul(2)).toNumber());
        
    for(var i = 2; !(Math.abs(ts[i-1] - ts[i-2]) < epsilon); i++) {

    //  Compute t and w using projection.
    //  sn      = (ss[i-1]-sb[i-2])'*ff*(sE-sb[i-2]);
    //  sd      = (ss[i-1]-sb[i-2])'*ff*(ss[i-1]-sb[i-2]);
    //  sc      = sn/sd;
    //  sb[i-1] = sb[i-2] + sc*(ss[i-1]-sb[i-2]);
        sn      = ss[i-1].sub(sb[i-2]).trn().mul(ff).mul(sE.sub(sb[i-2]));    
        sd      = ss[i-1].sub(sb[i-2]).trn().mul(ff).mul(ss[i-1].sub(sb[i-2]));
        sc      = sn.div(sd);
        sb[i-1] = sb[i-2].add(sc.mul(ss[i-1].sub(sb[i-2])));
        
    //  Recompute optimal policy using new weights.        
    //  rs[i] = ff*(sE-sb[i-1]);
    //  ss[i] = stateExpectation(rs[i], structure, discount);
    //  ts[i] = sqrt(sE'*ff*sE + sb[i-1]'*ff*sb[i-1] - 2*sE'*ff*sb[i-1]);    
        rs[i] = ff.mul(sE.sub(sb[i-1])).toArray();
        ss[i] = stateExpectation(rs[i], structure, discount);
        ts[i] = Math.sqrt(sE.trn().mul(ff).mul(sE).add(sb[i-1].trn().mul(ff).mul(sb[i-1]).sub(sE.trn().mul(ff).mul(sb[0])).mul(2)).toNumber());
        
        //console.log(1,'Completed IRL iteration, i=%d, t=%f\n',i,ts[i]);
    }
    
    return rs[i-1];
}

function stateExpectation(rewards, structure, discount) {
    var expectation = Array(rewards.length).fill(0);
    var toBestState = function(maxSoFar, nextState) { return rewards[nextState] >= rewards[maxSoFar||nextState] ? nextState : maxSoFar }
    
    for(var i = 0; i < structure.length; i++) {
        expectation[structure[i].reduce(toBestState)] += Math.pow(discount, structure.length-i-1);
    };
    
    return new ma.vector(expectation);
}

function k(states, states) {
    return states.mul(states);
    //return dotProduct(states,states);//or something like this
}