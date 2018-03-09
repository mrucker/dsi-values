function Time() {
}

Time.getCacheOrSource = function(date, theaterIds) {
    var cachedTimes = Time.getCache(date, theaterIds);
    
    if(cachedTimes.length != 0) 
        return Promise.resolve(cachedTimes);
    else
        return Time.getSource(date, theaterIds).then(Time.setCache);
}

Time.getSource = function(date, theaterIds) {
    var toDynamoKeys = function (theaterId) { return {'Id' : {'S':date+theaterId } }; };
    
    return dynamoBatchGet('DSI_Showtimes', theaterIds.filter(onlyUnique).map(toDynamoKeys)).then(function(items) {
        
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

Time.getCache = function(date, theaterIds) {
    var getAll  = function(time) { return date      == null && theaterIds == null; };
    var getThis = function(time) { return time.date == date && theaterIds.includes(time.theaterId); };
    
    return Cache.get('times', []).filter(function(time) { return getAll(time) || getThis(time); });
}

Time.setCache = function(times) {
    Cache.set('times', Time.getCache().concat(times).filter(onlyUniqueTimes()));
    return times;
}

Time.cleanCache = function(date, history) {
    return Time.setCache(Time.getCache().filter(onlyUniqueTimes()).filter(function(time) { return time.date >= date }));
}