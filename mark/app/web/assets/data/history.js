function History() {

}

function historySync() {
    return cognitoSync('History');
}

function historyPut(theaterId, movieId, date, time) {

    var key = historyKey(theaterId, movieId, date, time);
    var val = historyVal(theaterId, movieId, date, time);

    return cognitoPut('History', key, val);
}

function historyRmv(theaterId, movieId, date, time) {

    var key = historyKey(theaterId, movieId, date, time);

    return cognitoRemove('history', key);
}

function historyGet() {
    return cognitoGet('history');
}

function historyKey(theaterId, movieId, date, time) {
    return theaterId+movieId+date+time;
}

function historyVal(theaterId, movieId, date, time) {
    return JSON.stringify({'theaterId':theaterId, 'movieId':movieId, 'date':date, 'time':time});
}