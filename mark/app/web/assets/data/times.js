function Time() {
}

Time.getCacheOrSource = function(dates, theaterIds) {
    var oldCachedTimes = Time.getCache(dates, theaterIds);
    var oldCachedDates = oldCachedTimes.map(function(t) { return t.date; }).toDistinct();        
    var notCachedDates = dates.filter(function(d) { return !oldCachedDates.includes(d); });
    
    if(notCachedDates.length == 0) 
        return Promise.resolve(oldCachedTimes);
    else
        return Time.getSource(notCachedDates, theaterIds).then(Time.setCache).then(function(newCachedTimes) { return oldCachedTimes.concat(newCachedTimes); });
}

Time.getSource = function(dates, theaterIds) {
    var toDynamoKeys = function (theaterId) { return dates.map(function(date) { return {'Id' : {'S':date+theaterId } }; }); };
    
    return dynamoBatchGet('DSI_Showtimes', theaterIds.toDistinct().map(toDynamoKeys).toFlat()).then(function(items) {
        
        var times = [];
        
        items.filter(function(item) { return item; }).forEach(function(item) {
                        
            item.Showtimes.L.forEach(function(showtime) {
                
                times.push({
                    "theaterId": item.TheaterId.S,
                    "movieId"  : showtime.M.MovieId.S,
                    "date"     : item.Date.S,
                    "time"     : showtime.M.Time.S,
                    "matinee"  : showtime.M.Matinee.BOOL,
                });
            });

        });
        
        return times;
    });

}

Time.getCache = function(dates, theaterIds) {
    var getAll  = function(time) { return dates == null && theaterIds == null; };
    var getThis = function(time) { return dates.includes(time.date) && theaterIds.includes(time.theaterId); };
    
    return Cache.get('times', []).filter(function(time) { return getAll(time) || getThis(time); });
}

Time.setCache = function(times) {
    Cache.set('times', Time.getCache().concat(times).toDistinct(Time.areEqual));
    return times;
}

Time.cleanCache = function(date, history) {
    var historyDates = history.map(function(h) { return h.date; });
    
    return Time.setCache(Time.getCache().toDistinct(Time.areEqual).filter(function(time) { return time.date >= date || historyDates.includes(time.date) }));
}

Time.areEqual = function(t1, t2) {
    return t1.theaterId == t2.theaterId && t1.movieId == t2.movieId && t1.time == t2.time && t1.date == t2.date
}