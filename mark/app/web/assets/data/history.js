function History() {

}

History.sync = function() {
    return cognitoSync('history'); //this costs $0.15 per 10,000
}

History.put = function(theaterId, movieId, date, time) {

    var key = History.key(theaterId, movieId, date, time);
    var val = History.val(theaterId, movieId, date, time);

    return cognitoPut('history', key, val);
}

History.rmv = function(theaterId, movieId, date, time) {

    var key = History.key(theaterId, movieId, date, time);

    return cognitoRemove('history', key);
}

History.get = function() {
    return cognitoGet('history');
}

History.key = function(theaterId, movieId, date, time) {
    return theaterId+movieId+date+time;
}

History.val = function(theaterId, movieId, date, time) {
    return JSON.stringify({'theaterId':theaterId, 'movieId':movieId, 'date':date, 'time':time});
}