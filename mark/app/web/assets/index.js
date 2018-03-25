$(document).ready( function () {
    AWS.config.region = 'us-east-1';
    
    $('head').append(loadingCSS());    
});

//Events
function gapiLoad() {
    //<!-- api.j       is google's core api that is able to load other js libraries async     -->
    //<!-- client.js   is google's core api that connects their api's in a client application -->
    //<!-- auth2.js    is google's OAuth API for authentication with google identity          -->
    //<!-- platform.js is google's google+ API that we use only to render the signin button   -->

    gapi.load('client:auth2', gapiInit);
}

function gapiInit() {
            
    gapi.auth2.init({
        client_id   : '689948340204-prtmkdg63i0lrl6v4nn7vo9cd96chefq.apps.googleusercontent.com',
        cookiepolicy: 'single_host_origin',
        scope       : 'profile email'
    }).then(function(googleAuth) {
        if(googleAuth.currentUser.get().isSignedIn()) {            
            initMain();
            showMain();
            onSignIn();
        }
        else {
            initMain();
            initSplash();
            showSplash();
        }
    });
}

function onSignIn() {
    
    googleSignIn().then(amazonGoogleUserSignIn).then(History.sync).then(History.get).then(function(history) {

        Cache.cleanCache();
        Time .cleanCache(Date.currentDate(), history);
        Movie.cleanCache(Time.getCache());
    
        refreshMain();
        hideSplash();
        showMain();

    });
}

function onSignOut() {
    
    googleSignOut();
    amazonSignOut();
    
    Cache.clear();
}
//Events

//Splash
function showSplash() {
    $('#splash').css('display','block');
}

function hideSplash() {
    $('#splash').css('display','none');
}

function initSplash() {
    $('#splash').append('<h1>Ethical Recommendations</h1>');
    $('#splash').append('<div id="signin"></div>');//render login button
    
    gapi.signin2.render('signin', {onsuccess: onSignIn});
}

//Splash

//Main
function showMain() {
    $("#toolbar").css('display','inline');
    $('#main').css('display','block');
}
    
function hideMain() {
    $("#toolbar").css('display','none');
    $('#main').css('display','none');
}

function initMain() {
    $('#toolbar .left' ).html('<a href="https://dsi.markrucker.net" class="strong"> Ethical Recommendations </a> <span>' + getDateSelector() + '</span><span>' + getAlgorithmSelector() + '</span>');
    $('#toolbar .right').html('<a href="https://dsi.markrucker.net" class="hover" id="signout">Sign out</a>');
    
    $('#signout').on('click', onSignOut);
    
    $('#main').append('<h1 style="display:inline">Recommendations</h1>' + getRefreshButton() + '<ol class="recommendations"></ol>');
    $('#main').append('<h1>Showtimes</h1><div class="theaters"></div>')
    
    $('#main .theaters').append(Theater.getCache().map(theaterAsHTML));
    
    
    
    setDateSelector(refreshMain);
    setRefreshButton(refreshRecommendations);
    setAlgorithmSelector(refreshRecommendations);
    
}

function refreshMain() {

    refreshingTimes();
    refreshingRecommendations();
    
    return loadTimes().thenSleepFor(100).then(showTimes).then(loadRecommendations).then(showRecommendations).then(updateDateSelectorHistory);
}
//Main

//Recommend
function loadRecommendations() {

    var addAlgorithm = function(data) {
        data.algorithm = getAlgorithmSelected();
        return data;
    };

    var addRecommendations = function(data) {
        return getRecommendations(data.algorithm, data.date, data.theaters, data.movies, data.times, data.history).then(function(recommendations) { data.recommendations = recommendations; return data; });
    };

    return loadTimes().then(addAlgorithm).then(addRecommendations);
}

function showRecommendations(data) {
    
    var date            = data.date;
    var recommendations = data.recommendations;
    var history         = data.history;
    
    $('.recommendations .loading').remove();
    $('.recommendations').append(recommendations.filter(function(r) { return r.time == '' || r.date+r.time > oldestDateTimeToShow() }).map(recommendationAsHTML));
    $('.recommendations button').on('click', onRecommendationClick);
    
    history.filter(function(h) { return h.date == date }).forEach(function(h) { buttonQuery(h.theaterId, h.movieId, h.time).removeClass('o x').addClass('x'); });
    
    return data;
}

function refreshRecommendations() {
    refreshingRecommendations();
    
    Promise.resolve().thenSleepFor(10).then(loadRecommendations).then(showRecommendations);
}

function refreshingRecommendations() {
    $('.recommendation').remove();
    $('.recommendations .loading').remove();
    $('.recommendations').append(loadingHTML());
}

function recommendationAsHTML(recommendation) {    
    return '<li class="recommendation">'+ buttonLarge(recommendation) + '</li>';
}

function onRecommendationClick() {
    onTimeClick.call(this);
}
//Recommend

//Times
function loadTimes() {
    var getDate = function() {
        return Promise.resolve({'date': getDateSelected()});
    };
    
    var addHistory = function(data) {
        return History.get().then(function(history) { data.history = history; return data; });
    };
    
    var addTheaters = function(data) {
        return Theater.getCacheOrSource().then(function(theaters) { data.theaters = theaters; return data; });
    };
    
    var addTimes = function(data) {
        var dates      = data.history.map(function(h) { return h.date; }).concat([data.date]).toDistinct();
        var theaterIds = data.theaters.map(function(t) { return t.id; });
        
        return Time.getCacheOrSource(dates, theaterIds).then(function(times) { data.times = times; return data; });
    };
    
    var addMovies = function(data) {
        return Movie.getCacheOrSource(data.times.map(function(t) { return t.movieId })).then(function(movies) { data.movies = movies; return data; });
    };
    
    return getDate().then(addHistory).then(addTheaters).then(addTimes).then(addMovies);
}

function showTimes(data) {
    
    var date     = data.date;
    var theaters = data.theaters;
    var movies   = data.movies;
    var times    = data.times;
    var history  = data.history;
    
    theaters.forEach(function(theater) {

        var theaterTimes  = times.filter(function(time) { return time.date == date && time.theaterId == theater.id && time.date+time.time > oldestDateTimeToShow() });
        var theaterMovies = movies.filter(onlyMoviesWithTimes(theaterTimes));
        var augmentMovies = theaterMovies.map(function(movie){ return Object.assign(movie,{ 'times': theaterTimes.filter(function(time) { return time.movieId == movie.id }) }); });
        var sortedMovies  = augmentMovies.sort(function(x,y) {
            return y.times.length - x.times.length != 0 ? y.times.length - x.times.length : x.title.compare(y.title); 
        });                

        $('#' + theater.id + ' .loading').remove();
        $('#' + theater.id + ' .movies').append(sortedMovies.map(movieAsHTML).join(''));
        $('#' + theater.id + ' .times button').on('click', onTimeClick);
    });
    
    history.filter(function(h) { return h.date == date }).forEach(function(h) { buttonQuery(h.theaterId, h.movieId, h.time).removeClass('o x').addClass('x'); })
    
    return data;
}

function refreshTimes() {
    
    refreshingTimes();    
    
    loadTimes().then(showTimes);
}

function refreshingTimes() {
    $('.theaters .movie').remove();
    $('.theaters .loading').remove();
    $('.theaters .theater').append(loadingHTML());
}

function theaterAsHTML(theater) {
    
    return '<div class="theater" id="' + theater.id + '" data-theater-id="' + theater.id + '">'
         +   '<a href="' + theater.url + '" class="title">' 
         +     theater.name 
         +   '</a>'
         +   '<div class="movies">'
         + '</div></div>'
}

function movieAsHTML(movie) {
    return '<li class="movie" data-movie-id="' + movie.id + '">'
         +    '<span class="title">'
         +       movie.title
         +    '</span>'
         +    '<ul class="times">'
         +        movie.times.map(timeAsHTML).join('')
         +    '</ul>'
         + '</li>';
}

function timeAsHTML(time) {
    return '<li class="time" data-time="' + time + '">' + buttonSmall(time) + '</li>';
}

function onTimeClick() {
    var time      = $(this).data('time')
    var movieId   = $(this).data('movieId');
    var theaterId = $(this).data('theaterId');
    
    var buttons  = buttonQuery(theaterId, movieId, time);
    var selected = buttons.attr('class') == 'o';
        
    var updateHistory = selected ? History.put : History.rmv;
    var toggleButtons = function() { buttons.toggleClass('x').toggleClass('o') };
    
    updateHistory(theaterId, movieId, getDateSelected(), time).then(History.sync).then(toggleButtons).then(updateDateSelectorHistory);
}
//Times

function oldestDateTimeToShow() {
    // return Date.currentDate()+Date.currentTime();
    return "2000-02-0100:00";
}