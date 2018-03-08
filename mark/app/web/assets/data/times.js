function getTimes(date, theaters) {
    
    var theaterIds = theaters.map(function(theater) { return theater.id; });
    var cachedTimes = cacheGetOrDefault('times', []).filter(function(time) { return time.date == date && theaterIds.includes(time.theaterId) });
    
    if(cachedTimes.length > 0) {
        return Promise.resolve(cachedTimes);
    }
    
    var toDynamoKeys = function (theaterId) { return {'Id' : {'S':date+theaterId } }; };
    
    return dynamoBatchGet('DSI_Showtimes', theaterIds.map(toDynamoKeys)).then(function(items) {
        
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
        
        return Promise.resolve(times);
    });
}

