function getRandomRecommendations(date, times) {
    var seed = (date + AWS.config.credentials.params.LoginId).trim().toLowerCase();
    var rand = new Math.seedrandom(seed);
    
    var reccTimes = times.filter(function(t) { return t.date == date;});
    
    var randomTimes = [];

    for(var i = 0; i < 5; i++) {
        randomTimes.push(times[Math.floor(rand() * times.length)])
    }
    
    return Promise.resolve(randomTimes);
}