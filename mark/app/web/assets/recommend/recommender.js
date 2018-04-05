function getRecommendations(algorithm, date, theaters, movies, times, history) {
    
    var timesToReccObject = function(times) { 
        
        if(typeof(times) == "string") {
            return [{ 'message': times, 'movie'  : '', 'theater': '', 'time'   : '' }]; 
        }
        
        return times.map(function(time) {
            return {
                
                'movieId'  : time.movieId,
                'theaterId': time.theaterId,
                'movie'    : movies.find(function(m){ return m.id == time.movieId}).title,
                'theater'  : theaters.find(function(t) { return t.id == time.theaterId}).name.split(' ').splice(0,2).join(' '),
                'time'     : time.time
            };
        });
    };
    
    //remove times without movie data so that we don't recommend them.
    times = times.filter(t => t && movies.some(m => m.id == t.movieId));
    
    
    if(algorithm == 0) {
        return getRandomRecommendations(date, times).then(timesToReccObject);
    }
    
    if(algorithm == 1) {
        return projectionRecommendation(date, theaters, movies, times, history, Kernel.dot).then(timesToReccObject);
    }
    
    if(algorithm == 2) {        
        return projectionRecommendation(date, theaters, movies, times, history, Kernel.gau).then(timesToReccObject);
    }
}