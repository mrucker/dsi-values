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
        /* https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiauth2clientconfig */
        client_id     : '689948340204-prtmkdg63i0lrl6v4nn7vo9cd96chefq.apps.googleusercontent.com',    
        scope         : 'profile email',
        //cookie_policy : 'none',    //neither of these settings have any impact on the 3rd party cookie problem
        //ux_mode       : 'redirect' //neither of these settings have any impact on the 3rd party cookie problem
    }).then(function(googleAuth) {
        if(googleAuth.currentUser.get().isSignedIn()) {            
            initMain();
            onSignIn();
        }
        else {
            initMain();
            initSplash();
            showSplash();
        }
    }).catch(function(e) {
        initError();
        showError();
    });
}

function onSignIn() {
    
    googleSignIn().then(amazonGoogleUserSignIn).then(Session.sync).then(Session.getHistory).then(function(history) {

        Cache.cleanCache();
        Time .cleanCache(Date.currentDate(), history);
        Movie.cleanCache(Time.getCache());

        updateAlgorithmSelector();        
        updateDateSelectorHistory();

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
    $('#splash').append('<div id="signin"></div>');
    
    gapi.signin2.render('signin', {onsuccess: onSignIn});
}
//Splash

//Main
function showMain() {
    $("#toolbar .content").css('display','inline');
    $('#main').css('display','block');
}
    
function hideMain() {
    $("#toolbar .content").css('display','none');
    $('#main').css('display','none');
}

function initMain() {
    
    $('#toolbar .left' ).append('<a href="https://dsi.markrucker.net" class="strong"> Ethical Recommendations </a>');
    $('#toolbar .left' ).append('<span>' + getDateSelector() + '</span>');
    $('#toolbar .left' ).append('<span>' + getAlgorithmSelector() + '</span>');
    $('#toolbar .right').append('<a href="https://dsi.markrucker.net" class="hover" id="signout">Sign out</a>');
    
    $('#signout').on('click', onSignOut);
    
    $('#main').append('<h1 style="display:inline">Recommendations</h1>');
    $('#main').append('<span>' + getRefreshButton() + '</span>');
    $('#main').append('<ol class="recommendations"></ol>');
    
    $('#main').append('<h1>Showtimes</h1>')
    $('#main').append('<div class="theaters"></div>')
    
    $('#main .theaters').append(Theater.getCache().map(theaterAsHTML));
    
    setDateSelector(refreshMain);
    setRefreshButton(refreshRecommendations);
    setAlgorithmSelector(changeRecommendationAlgorithm);
}

function refreshMain() {

    //refreshingTimes();
    //refreshingRecommendations();
    
    return refreshTimes().then(refreshRecommendations);
    
    //return loadTimes().thenSleepFor(100).then(showTimes).thenSleepFor(0).then(loadRecommendations).then(showRecommendations);
}
//Main

//Error
function showError() {
    $('#error').css('display','block');
}

function hideError() {
    $('#error').css('display','none');
}

function initError() {
    $('#error').append('<h1>Ethical Recommendations</h1>');
    $('#error').append("<h2>Sorry, but it is not curretly possible to use our site without 3rd party cookies enabled.</h2>");
    $('#error').append("<h2>If you'd like to use this site, you can may re-enable these and then refresh this page.</h2>");
}
//Error

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
    
    return Promise.resolve().thenSleepFor(10).then(loadRecommendations).then(showRecommendations);
}

function refreshingRecommendations() {
    $('.recommendation').remove();
    $('.recommendations .loading').remove();
    $('.recommendations').append(loadingHTML());
}

function changeRecommendationAlgorithm() {
    
    updateAlgorithmSelectorMenu();
    
    Session.setAlgorithm(getAlgorithmSelected()).then(Session.sync).then(refreshRecommendations);
}

function recommendationAsHTML(recommendation) {    
    if(recommendation.message) {
        return "<div class='recommendation'>" + recommendation.message + "</div>";
    }
    else {
        return "<li class='recommendation'>"+ buttonLarge(recommendation) + '</li>';
    }
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
        return Session.getHistory().then(function(history) { data.history = history; return data; });
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
    
    return Promise.resolve().thenSleepFor(10).then(getDate).then(addHistory).then(addTheaters).then(addTimes).then(addMovies);
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
    
    return loadTimes().then(showTimes);
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
    var date      = getDateSelected();
    var time      = $(this).data('time')    
    var movieId   = $(this).data('movieId');
    var theaterId = $(this).data('theaterId');    
    var isFuture  = date + "-" + time > Date.currentDateTime();
    
    
    var buttons  = buttonQuery(theaterId, movieId, time);
    var selected = buttons.attr('class') == 'o';

    var updateHistory = selected ? Session.addHistory : Session.rmvHistory;
    var toggleButtons = function() { buttons.toggleClass('x').toggleClass('o') };
    
    var updateGladTimes = (selected && isFuture) ? Session.addGladTimes : Session.rmvGladTimes;    
        
    updateGladTimes(date, time).then(updateHistory(theaterId, movieId, date, time)).then(Session.sync).then(toggleButtons).then(updateDateSelectorHistory);
}
//Times

function oldestDateTimeToShow() {
    // return Date.currentDate()+Date.currentTime();
    return "2000-02-0100:00";
}