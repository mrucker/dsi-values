function getRandomRecommendations(date, times) {
    var seed = (date + AWS.config.credentials.params.LoginId).trim().toLowerCase();
    var rand = new Math.seedrandom(seed);
    
    var timesOnDate = times.filter(function(t) { return t.date == date;});    
    var timesRandom = [];

    for(var i = 0; i < 5; i++) {
        timesRandom.push(timesOnDate[Math.floor(rand() * timesOnDate.length)])
    }
    
    return Promise.resolve(timesRandom);
}