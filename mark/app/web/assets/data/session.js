function Session() {
}

Session.sync = function() {
    return cognitoSync('session'); //this costs $0.15 per 10,000
}

Session.getAlgorithm = function() {

    return cognitoGetKey('session', 'algorithm');
}

Session.setAlgorithm = function(value) {

    return cognitoPut('session', 'algorithm', value);
}

Session.getGladTimes = function() {
    return cognitoGetKey('session', 'gladTimes').then(function(gladTimes) { return JSON.parse(gladTimes || "[]"); });
}

Session.addGladTimes = function(date, time) {
    
    var value = {"date":date, "time":time};
    
    return Session.getGladTimes().then(function(gladTimes) {
        return cognitoPut('session', 'gladTimes', JSON.stringify(gladTimes.concat([value])));
    });
}

Session.rmvGladTimes = function(date, time) {

    return Session.getGladTimes().then(function(gladTimes) { 
        return cognitoPut('session', 'gladTimes', JSON.stringify(gladTimes.filter(t => t.date != date || t.time != time)));
    });
}

Session.getHistory = function() {
    return cognitoGetKey('session', 'history').then(function(history) { return JSON.parse(history || "[]"); });
}

Session.addHistory = function(theaterId, movieId, date, time) {
    
    var value = History.obj(theaterId, movieId, date, time);
    
    return Session.getHistory().then(function(history) { 
        return cognitoPut('session', 'history', JSON.stringify(history.concat([value])) );
    });
}

Session.rmvHistory = function(theaterId, movieId, date, time) {
    
    var value = History.obj(theaterId, movieId, date, time);
    
    return Session.getHistory().then(function(history) { 
        return cognitoPut('session', 'history', JSON.stringify(history.filter(h => !History.areEqual(h,value))));
    });
}

