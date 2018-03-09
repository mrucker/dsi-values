function getRandomRecommendations(date, theaters, movies, times) {
        var seed = (date + AWS.config.credentials.params.LoginId).trim().toLowerCase();
        var rand = new Math.seedrandom(seed);
        
        var randomTimes = [];

        for(var i = 0; i < 5; i++) {
            randomTimes.push(times[Math.floor(rand() * times.length)])
        }

        var recommendations = randomTimes.map(function(time) {
            return {
                'movie'  : movies.find(function(m){ return m.id == time.movieId}),
                'theater': theaters.find(function(t) { return t.id == time.theaterId}),
                'time'   : time.time
            }; 
        });
        
        return Promise.resolve(recommendations);
}