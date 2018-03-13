function getRecommendations(algorithm, date, theaters, movies, times, history) {
    
    var timesToReccObject = function(times) { 
        
        if(typeof(times) == "string") {
            return [{ 'movie'  : '', 'theater': times, 'time'   : '' }]; 
        }
        
        return times.map(function(time) {
            return {
                'movie'  : movies.find(function(m){ return m.id == time.movieId}).title,
                'theater': theaters.find(function(t) { return t.id == time.theaterId}).name.split(' ').splice(0,2).join(' '),
                'time'   : '@'+time.time
            };
        });
    };
    
    if(algorithm == 0) {
        return getRandomRecommendations(date, times).then(timesToReccObject);
    }
    
    if(algorithm == 1) {
        return projectionRecommendation(date, theaters, movies, times, history).then(timesToReccObject);
    }
    
    if(algorithm == 2) {
        return Promise.resolve("Sorry but this algorithm hasn't been implemented yet.").then(timesToReccObject);
    }
}