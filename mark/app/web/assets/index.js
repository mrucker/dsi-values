$(document).ready( function () {
    AWS.config.region = 'us-east-1';

    //important to protect against memory overflow
    cacheClearWholeCacheIfStale();
    cacheCleanOldShowtimesByDate();
    cacheCleanOldMoviesByShowtimes();
    
    initMain();
    
    hideSplash();
    hideMain();

    $('#signOut').on('click', onSignOut);
    $('#dateSelector').on('change', loadMain);
});

//events
function gapiInit() {
    
    gapi.auth2.init().then(function(googleAuth) {
        if(googleAuth.currentUser.get().isSignedIn()) {
            showMain();
        }
        else {
            showSplash();
        }
    });
}

function onSignIn() {
    
    amazonGoogleSignIn(googleSignIn());
    
    loadMain();
    hideSplash();
    showMain();
}

function onSignOut() {
    
    googleSignOut();
    amazonSignOut();
    
    cacheSet('storageVersion', 0);
    
}

function onMovieTimeClick() {
    var time      = $(this).data('time')
    var movieId   = $(this).data('movieId');
    var theaterId = $(this).data('theaterId');
    
    var buttons  = getButtons(theaterId, movieId, time);
    var selected = buttons.attr('class') == 'x';
    
    if(selected) {
        historyRmv(theaterId, movieId, getDateSelected(), time).then(historySync).then(function() {
            buttons.toggleClass('x').toggleClass('o');
        });
    }
    else {
        historyPut(theaterId, movieId, getDateSelected(), time).then(historySync).then(function() {
            buttons.toggleClass('x').toggleClass('o');
        });
    }
}

function onRecommendationClick() {
    onMovieTimeClick.call(this);
}
//events

function showSplash() {
    $('#splash').css('display','block');
}

function hideSplash() {
    $('#splash').css('display','none');
}

function showMain() {
    $("#toolbar span").css('display','inline');
    $('#main').css('display','block');
}
    
function hideMain() {
    $("#toolbar span").css('display','none');
    $('#main').css('display','none');
}

function initMain() {
    $('#toolbar .left' ).html('<a href="https://dsi.markrucker.net" class="strong"> Ethical Recommendations </a> <span>' + getDateSelector() + '</span>');
    $('#toolbar .right').html('<a href="https://dsi.markrucker.net" class="hover" id="signOut">Sign out</a>');
    
    $('#main').append('<h1>Recommendations</h1><ol class="recommendations"></ol>');
    $('#main').append('<h1>Showtimes</h1><div class="theaters"></div>')
    
    getTheaters().then(function(theaters) { $('#main .theaters').append(theaters.map(theaterAsHTML)) });
}

function loadMain() {    
    
    var getDate = function() {
        return Promise.resolve({'date': getDateSelected()});
    };
    
    var addTheaters = function(data) {
        return getTheaters().then(function(theaters) { data.theaters = theaters; return data; });
    };
    
    var addTimes = function(data) {
        return getTimes(data.date, data.theaters).then(function(times) { data.times = times; return data; });
    };
    
    var addMovies = function(data) {
        return getMovies(data.times.map(function(t) { return t.movieId }).filter(onlyUnique)).then(function(movies) { data.movies = movies; return data; });
    };
    
    var addHistory = function(data) {
        return historySync().then(historyGet).then(function(history) { data.history = history; return data; } )
    };
    
    var addRecommendations = function(data) {
        return getRecommendations(data.date, data.theaters, data.movies, data.times, data.history).then(function(recommendations) { data.recommendations = recommendations; return data; });
    };
    
    var getData = function() {
        return ;
    };
    
    var loadTimes = function(data) {
        loadTheatersMoviesTimes(data.date, data.theaters, data.movies, data.times, data.history); return data;
    };
    
    var loadRecc = function(data) {
        loadRecommendations(data.date, data.recommendations, data.history); return data;
    };
    
    $('.recommendation').remove();
    $('.theaters .movie').remove();
    
    $('.recommendations').append(loadingAsHTML());
    $('.theaters .theater').append(loadingAsHTML());
    
    return getDate().then(addTheaters).then(addTimes).then(addMovies).then(addHistory).then(loadTimes).then(addRecommendations).then(loadRecc);
}

function loadRecommendations(date, recommendations, history) {
    
    var currentDate = getDateISO861(0);
    var currentTime = getTimeISO861();
    
    $('.recommendations .loading').remove();
    $('.recommendations').append(recommendations.filter(function(r) { return date > currentDate || r.time > currentTime }).map(recommendationAsHTML));
    $('.recommendations button').on('click', onRecommendationClick);
    
    history.filter(function(h) { return h.date == date }).forEach(function(h) { getButtons(h.theaterId, h.movieId, h.time).removeClass('o x').addClass('x'); })
}

function loadTheatersMoviesTimes(date, theaters, movies, times, history) {
    
    var currentDate = getDateISO861(0);
    var currentTime = getTimeISO861();
    
    theaters.forEach(function(theater) {

        var theaterTimes  = times.filter(function(time) { return time.theaterId == theater.id && (time.date > currentDate || time.time >= currentTime) });
        var theaterMovies = movies.filter(onlyMoviesWithTimes(theaterTimes));
        var augmentMovies = theaterMovies.map(function(movie){ return Object.assign(movie,{ 'times': theaterTimes.filter(function(time) { return time.movieId == movie.id }) }); });
        var sortedMovies  = augmentMovies.sort(function(x,y) { return y.times.length - x.times.length; });                

        $('#' + theater.id + ' .loading').remove();
        $('#' + theater.id + ' .movies').append(sortedMovies.map(movieAsHTML).join(''));
        $('#' + theater.id + ' .times button').on('click', onMovieTimeClick);
    });
    
    history.filter(function(h) { return h.date == date }).forEach(function(h) { getButtons(h.theaterId, h.movieId, h.time).toggleClass('o').toggleClass('x'); })
}


function getButtons(theaterId, movieId, time) {
    return $('button[data-theater-id="'+theaterId+'"][data-movie-id="'+movieId+'"][data-time="'+time+'"]')
}

function getDateSelections() {
    var days = $('#dateSelector option').map(function() { return parseInt(this.value); } ).toArray();
    
    return days.map(getDateISO861);
}

function getDateSelected() {
    var selectedDay = $('#dateSelector').val();
    
    return getDateISO861(selectedDay);    
}

function getDateSelector() {

    var day0 = 'Today';
    var day1 = 'Tomorrow';
    var day2 = getDateAsText(new Date().getDate() + 2);
    var day3 = getDateAsText(new Date().getDate() + 3);
    var day4 = getDateAsText(new Date().getDate() + 4);
    
    return '<select id="dateSelector">' 
         +    '<option value="0">' + day0 + '</option>'
         +    '<option value="1">' + day1 + '</option>'
         +    '<option value="2">' + day2 + '</option>'
         +    '<option value="3">' + day3 + '</option>'
         //+    '<option value="4">' + day4 + '</option>'
         + '</select>';
}

function getDateISO861(daysAhead) {
    var date = new Date()
    
    var year  = String(date.getFullYear());
    var month = String(date.getMonth()+1).padStart(2, '0');
    var day   = String(date.getDate()+parseInt(daysAhead)).padStart(2, '0');
    
    return year + "-" + month + "-" + day;
}

function getTimeISO861() {
    return new Date().toTimeString().substring(0,5);//will break if person calls website from outside of EST
}

function getDateAsText(day) {

    day = day % 7;

    if(day == 0) return 'Sunday';
    if(day == 1) return 'Monday';
    if(day == 2) return 'Tuesday';
    if(day == 3) return 'Wednesday';
    if(day == 4) return 'Thursday';
    if(day == 5) return 'Friday';
    
    return 'Saturday';
}

//cache methods
function cacheClearWholeCacheIfStale() {
        
    var oldStorageVersion = cacheGet('storageVersion');
    var newStorageVersion = new Date().getDate(); //forces a cache refresh every day
    
    if(oldStorageVersion != newStorageVersion) 
    {
        cacheClear();
    }
    
    cacheSet('storageVersion', newStorageVersion);
}

function cacheCleanOldShowtimesByDate() {
    
    var currentDate     = getDateISO861(0);    
    var cachedShowtimes = cacheGet('showtimes') || [];

    cachedShowtimes = cachedShowtimes.filter(onlyUniqueShowtimes()).filter(function(s1) { return s1.date >= currentDate });

    cacheSet('showtimes', cachedShowtimes);
}

function cacheCleanOldMoviesByShowtimes() {

    var cachedShowtimes  = cacheGet('showtimes') || [];
    var cachedMovies     = cacheGet('movies')    || []; 

    cachedMovies = cachedMovies.filter(onlyUniqueMovies()).filter(onlyMoviesWithTimes(cachedShowtimes));
    
    cacheSet('movies', cachedMovies);
}
//cache methods

//map methods
function recommendationAsHTML(recommendation) {
    return '<li class="recommendation">'
         +   '<button class="o" ' + buttonDataAttributes(recommendation.theater.id, recommendation.movie.id, recommendation.time) + '>'
         +     '<div> ' + recommendation.movie.title                                   + '</div>'
         +     '<div> ' + recommendation.theater.name.split(' ').splice(0,2).join(' ') + '</div>'
         +     '<div>@' + recommendation.time                                          + '</div>'
         +   '</button>'
         + '</li>';
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
    return '<li class="time" data-time="' + time + '">'
         +   '<button class="o" ' + buttonDataAttributes(time.theaterId, time.movieId, time.time) + '>'
         +      time.time
         +   '</button>'
         + '</li>';
}

function buttonDataAttributes(theaterId, movieId, time) {
    return 'data-theater-id="' + theaterId + '" data-movie-id="' + movieId + '" data-time="' + time + '"';
}
//map methods