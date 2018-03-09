function Movie() {

}

Movie.getCacheOrSource = function(movieIds) {
    
    var cachedMovies = Movie.getCache(movieIds);
    
    if(cachedMovies.length == movieIds.filter(onlyUnique).length) 
        return Promise.resolve(cachedMovies);
    else
        return Movie.getSource(movieIds).then(Movie.setCache);    
}

Movie.getSource = function(movieIds) {
    var toDynamoKeys = function(movieId) { return {'Id' : {'S':movieId } }; };
    
    return dynamoBatchGet('DSI_Movies', movieIds.filter(onlyUnique).map(toDynamoKeys)).then(function(items) {
        var movies = items.filter(function(item) { return item; }).map(function(item) {
            return {
                'id'      : item.Id.S,
                'title'   : item.Title.S,
                'genres'  : item.Genres.SS,
                'topCast' : item.TopCast.SS,
                'advisory': item.Advisory.S
            };
        });

        return movies;
    });
}

Movie.getCache = function(movieIds) {
    return Cache.get('movies', []).filter(function(movie) { return movieIds == null || movieIds.includes(movie.id); });
}

Movie.setCache = function(movies) {
    Cache.set('movies', Movie.getCache().concat(movies).filter(onlyUniqueMovies())); 
    return movies;
}

Movie.cleanCache = function(times) {
    return Movie.setCache(Movie.getCache().filter(onlyUniqueMovies()).filter(onlyMoviesWithTimes(times)));
}