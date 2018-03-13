function projectionRecommendation(date, theaters, movies, times, history) {
    
    var movieRoot = movies.reduce(function(dict,movie) { dict[movie.id] = movie.rootId; return dict; }, {})
    var histDates = history.map(function(h) { return h.date; }).toDistinct();

    var addRootId = function(o){ return Object.assign({}, o, {"rootId": movieRoot[o.movieId]}); };
    
    var allTimes = times.filter(function(t) { return histDates.includes(t.date) || t.date == date; }).map(addRootId);
    var oldPicks = history.map(addRootId);
    var nowPicks = allTimes.filter(function(t) { return t.date == date; });
    
    var allTimeI = allTimes.reduce(function(dict, rt, i) { dict[key(rt)] = i; return dict;  }, {});

    var venueFeats = venuesToFeatures(theaters);
    var movieFeats = moviesToFeatures(movies, oldPicks);
    var timeFeats  = timesToFeatures(allTimes);
    var dateFeats  = datesToFeatures(allTimes);
    
    var states = [];
    var stateI = {};

    var toStateVal = function(o) { return venueFeats[o.theaterId].concat(timeFeats[o.time]); };
    var toStateKey = function(o) { return JSON.stringify(toStateVal(o)) };
    
    allTimes.forEach(function(t) {
        
        var stateVal = toStateVal(t);
        var stateKey = toStateKey(t);
        
        if(stateI[stateKey] != undefined) {
            return;
        }
        
        stateI[stateKey] = states.length;
        states.push(stateVal);
    });

    var addStateIndex = function(o) { return Object.assign({}, o, {"stateIndex": stateI[toStateKey(o)]}); }
    
    allTimes = allTimes.map(addStateIndex);
    oldPicks = oldPicks.map(addStateIndex);
    nowPicks = nowPicks.map(addStateIndex);

    var structure  = oldPicks.map(function(p) { return allTimes.filter(function(t) { return t.date == p.date; }).map(function(t) { return t.stateIndex; }).toDistinct(); });
    var trajectory = oldPicks.map(function(p) { return p.stateIndex; });
    
    return Promise.resolve(projectionAlgorithm(states, structure, trajectory, nowPicks));
}

function projectionAlgorithm(states, structure, trajectory, choices) {
    
    var scalar = ma.dl.scalar;
    var vector = ma.dl.vector;
    var matrix = ma.dl.matrix;
    
    var epsilon     = .001;
    var discount    = .9;
    
    states = new matrix(states).trn(); //the way I populate states is backwards so I transpose here
    
    var cE = trajectory;                   
    var sE = Array(states.size(1)).fill(0);
    
    for(var i = 0; i < cE.length; i++) {
        sE[cE[i]] += Math.pow(discount, cE.length-i-1);
    };
    
    sE = new vector(sE);
    
    var rand_r = Array(states.size(1)).fill().map(function() { return Math.random(); });
    var rand_s = stateExpectation(rand_r, structure, discount);
    
    var rs = [rand_r];
    var ss = [rand_s];
    var sb = [rand_s];
    
    var ts = [undefined];
    
    var ff = k(states);
    
    rs[1] = ff.mul(sE.sub(sb[0])).toArray();
    ss[1] = stateExpectation(rs[1], structure, discount);
    
    //ts[1] = sqrt(sE'*ff*sE + sb[0]'*ff*sb[0] - 2*sE'*ff*sb[0]);
    ts[1] = Math.sqrt(sE.trn().mul(ff).mul(sE).add(sb[0].trn().mul(ff).mul(sb[0])).sub(sE.trn().mul(ff).mul(sb[0]).mul(new scalar(2))).toNumber());
        
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
        ts[i] = Math.sqrt(sE.trn().mul(ff).mul(sE).add(sb[i-1].trn().mul(ff).mul(sb[i-1])).sub(sE.trn().mul(ff).mul(sb[i-1]).mul(new scalar(2))).toNumber());

        console.log('Completed IRL iteration, i=%d, t=%f\n',i, Math.abs(ts[i] - ts[i-1]));
        
        if(i == 100) break;
    }

    console.log(sE.toArray());
    console.log(ss[i-1].toArray());
    
    if(trajectory.length < 3) {
        return 'Please Select At Least Three Times To Receive a Recommendation'
    }
    
    return choices.sort(function (a,b) { return rs[i-1][b.stateIndex] - rs[i-1][a.stateIndex] }).slice(0,5);
}

function stateExpectation(rewards, structure, discount) {
    var expectation = Array(rewards.length).fill(0);
    var toBestState = function(maxSoFar, nextState) { return rewards[nextState] >= rewards[maxSoFar||nextState] ? nextState : maxSoFar }
    
    for(var i = 0; i < structure.length; i++) {
        expectation[structure[i].reduce(toBestState)] += Math.pow(discount, structure.length-i-1);
    };
    
    return new ma.dl.vector(expectation);
}

function k(states) {    
    return states.trn().mul(states);
    //return dotProduct(states,states);//or something like this
}

//3x{0,1}   for theater
function venuesToFeatures(theaters) {
    
    var featuresByTheaterId = {}
    
    theaters.forEach(function(t) {
        var oneHotTheater = theaters.map(function(th) { return (th.id == t.id) ? 1 : 0 });
        
        featuresByTheaterId[t.id] = oneHotTheater;
    });
    
    return featuresByTheaterId;
}

//nx{0,1}   for genres
//nx{0,1}   for actors
//nx{0,1}   for directors
//3x[0,1]   for imdb/rotten/meta
//1x[0,inf] for days old
//1x[0,inf] for runtime
function moviesToFeatures(movies, rootHistory) {
    var pastRoots = rootHistory.map(function(h) { return h.rootId; }).toDistinct();
    var genres    = movies.map(function(m) { return m.genres;    }).toFlat().toDistinct();
    var actors    = movies.map(function(m) { return m.actors;    }).toFlat().toDistinct();
    var directors = movies.map(function(m) { return m.directors; }).toFlat().toDistinct();
    
    var featuresByRootId = {}
    
    movies.forEach(function(m) {
        var oneHotGenre    = genres   .map (function(gn) { return (m.genres.includes(gn)) ? 1 : 0 });
        var oneHotActor    = actors   .map (function(at) { return (m.actors.includes(at)) ? 1 : 0 });
        var oneHotDirector = directors.map (function(dt) { return (m.directors.includes(dt)) ? 1 : 0 });
        var oneHotPast     = pastRoots.includes(m.rootId)? [1] : [0];
        
        var binaryFeatures = oneHotGenre.concat(oneHotActor).concat(oneHotDirector).concat(oneHotPast);
        
        var imdb0to1           = m.imdbScore/10;
        var rotten0to1         = m.rottenScore/100;
        var meta0to1           = m.metaScore/100;
        var runtime            = m.runtime/60; //runhours
        
        //this seems to be causing problems. May add it back later.
        //var daysOld            = Date.daysBetween(new Date(m.releaseDate.replace("-","/")), new Date(Date.currentDate().replace("-","/")));
        
        var continuousFeatures = [imdb0to1, rotten0to1, meta0to1, runtime];
        
        featuresByRootId[m.rootId] = binaryFeatures.concat(continuousFeatures);
    });
    
    return featuresByRootId;
}

//4x{0,1}   for morning/afternoon/evening/party
function timesToFeatures(times) {
    
    var tods = [{min:"08:00", max:"12:59"}, {min:"13:00", max:"17:59"}, {min:"18:00", max:"23:59"}, {min:"00:00", max:"07:59"}];

    var featuresByTime = {}

    times.forEach(function(t) {

        var oneHotTOD = tods.map (function(td) { return (td.min <= t.time && t.time <= td.max) ? 1 : 0});

        featuresByTime[t.time] = oneHotTOD;
    });
    
    return featuresByTime;
}

//7x{0,1}   for dow
function datesToFeatures(times) {

    var dows = [0, 1, 2, 3, 4, 5, 6];

    var featuresByDate = {};

    times.forEach(function(t) {

        var oneHotDOW = dows.map (function(dw) { return (dw == new Date(t.date.replace("-","/")).getDay()) ? 1 : 0 });

        featuresByDate[t.date] = oneHotDOW;
    });

    return featuresByDate;
}


function key(rootTime) {
    return rootTime.date + rootTime.time + rootTime.theaterId + rootTime.rootId;
}