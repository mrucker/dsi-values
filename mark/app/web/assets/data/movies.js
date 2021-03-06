function Movie() {

}

Movie.getCacheOrSource = function(movieIds) {
    
    var cachedMovies = Movie.getCache(movieIds);
    
    if(cachedMovies.length == movieIds.toDistinct().length) 
        return Promise.resolve(cachedMovies);
    else
        return Movie.getSource(movieIds).then(Movie.setCache);    
}

Movie.getSource = function(movieIds) {
    var toDynamoKeys = function(movieId) { return {'Id' : {'S':movieId } }; };
    
    return dynamoBatchGet('DSI_Movies', movieIds.toDistinct().map(toDynamoKeys)).then(function(items) {
        var movies = items.filter(function(item) { return item; }).map(function(item) {
            return {
                'id'         : item.Id.S,
                'rootId'     : item.RootId.S,
                'imdbId'     : item.ImdbId.S,
                'title'      : item.Title.S,
                'releaseDate': item.ReleaseDate.S,
                'advisory'   : item.Advisory.S,
                'directors'  : item.Directors.SS,
                'genres'     : item.Genres.SS,
                'actors'     : item.TopCast.SS,
                'runtime'    : parseInt(item.Runtime.S),
                'imdbScore'  : parseInt(item.IMDbScore.S),
                'metaScore'  : parseInt(item.MetaScore.S),
                'rottenScore': parseInt(item.RottenScore.S)  
            };
        });
        return movies;
    });
}

Movie.getCache = function(movieIds) {
    return Cache.get('movies', []).filter(function(movie) { return movieIds == null || movieIds == movie.id || movieIds.includes(movie.id); });
}

Movie.setCache = function(movies) {
    Cache.set('movies', Movie.getCache().concat(movies).toDistinct(m => m.id)); 
    return movies;
}

Movie.cleanCache = function(times) {
    return Movie.setCache(Movie.getCache().toDistinct(m => m.id).filter(onlyMoviesWithTimes(times)));
}