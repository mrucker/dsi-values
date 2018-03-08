function getMovies(movieIds) {
    
    var cachedMovies = cacheGetOrDefault('movies', []).filter(function(movie) { return movieIds.includes(movie.id); });
    
    if(cachedMovies.length == movieIds.length) {
        return Promise.resolve(cachedMovies);
    }
    
    return dynamoBatchGet('DSI_Movies', movieIds.map(toDynamoKeys)).then(function(items) {
        var movies = items.filter(function(item) { return item; }).map(function(item) {
            return {
                'id'      : item.Id.S,
                'title'   : item.Title.S,
                'genres'  : item.Genres.SS,
                'topCast' : item.TopCast.SS,
                'advisory': item.Advisory.S
            };
        });
        
        return Promise.resolve(movies);
    });
}

function toDynamoKeys(movieId) {
    return {'Id' : {'S':movieId } };
}