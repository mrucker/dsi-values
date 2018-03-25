function getRandomRecommendations(date, times) {
    var seed = (date + AWS.config.credentials.params.LoginId).trim().toLowerCase();
    var rand = new Math.seedrandom(seed);
    
    var dateTimes = times.filter(function(t) { return t.date == date;});    
    var randTimes = [];

    for(var i = 0; i < 5; i++) {
        randTimes.push(dateTimes[Math.floor(rand() * dateTimes.length)])
    }
    
    return Promise.resolve(randTimes);
}