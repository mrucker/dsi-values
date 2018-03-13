$(document).ready( function () {
    AWS.config.region = 'us-east-1';    

    initMain();
    
    hideSplash();
    hideMain();
    
    $('#main').append(loadingCSS());

    $('#signOut').on('click', onSignOut);
    $('#dateSelector').on('change', loadMain);
    $('#algorithmSelector').on('change', loadMain);
});

//Events
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
//Splash

//Main
function showMain() {
    $("#toolbar span").css('display','inline');
    $('#main').css('display','block');
}
    
function hideMain() {
    $("#toolbar span").css('display','none');
    $('#main').css('display','none');
}

function initMain() {
    $('#toolbar .left' ).html('<a href="https://dsi.markrucker.net" class="strong"> Ethical Recommendations </a> <span>' + getDateSelector() + '</span><span>' + getAlgorithmSelector() + '</span>');
    $('#toolbar .right').html('<a href="https://dsi.markrucker.net" class="hover" id="signOut">Sign out</a>');
    
    $('#main').append('<h1>Recommendations</h1><ol class="recommendations"></ol>');
    $('#main').append('<h1>Showtimes</h1><div class="theaters"></div>')
    
    getTheaters().then(function(theaters) { $('#main .theaters').append(theaters.map(theaterAsHTML)) });
}

function loadMain(skipTimes) {
    
    var getDate = function() {
        return Promise.resolve({'date': getDateSelected()});
    };
    
    var getAlgorithm = function(data) {
        data.algorithm = getAlgorithmSelected();
        return data;
    };
    
    var sleepHalfSecond = function(data) {
        return new Promise(function(resolve,reject) {
            setTimeout(function(){ resolve(data); }, 100);
        });
    };
    
    var addHistory = function(data) {
        return History.sync().then(History.get).then(function(history) { 
            //not perfect, but put here to reduce the number of syncs required
            Cache.cleanCache();
            Time .cleanCache(Date.currentDate(), history);
            Movie.cleanCache(Time.getCache());
                        
            data.history = history; return data; 
        });
    };
    
    var addTheaters = function(data) {
        return getTheaters().then(function(theaters) { data.theaters = theaters; return data; });
    };
    
    var addTimes = function(data) {
        var dates      = data.history.map(function(h) { return h.date; }).concat([data.date]).filter(onlyUnique);
        var theaterIds = data.theaters.map(function(t) { return t.id; });
        
        return Time.getCacheOrSource(dates, theaterIds).then(function(times) { data.times = times; return data; });
    };
    
    var addMovies = function(data) {
        return Movie.getCacheOrSource(data.times.map(function(t) { return t.movieId })).then(function(movies) { data.movies = movies; return data; });
    };   
        
    var loadTimes = function(data) {
        if(!skipTimes) { loadTheatersMoviesTimes(data.date, data.theaters, data.movies, data.times, data.history); } return data;
    };
    
    var addRecommendations = function(data) {
        return getRecommendations(data.algorithm, data.date, data.theaters, data.movies, data.times, data.history).then(function(recommendations) { data.recommendations = recommendations; return data; });
    };
    
    var loadRecommend = function(data) {
        loadRecommendations(data.date, data.recommendations, data.history); return data;
    };
        
    if(!skipTimes) {
        $('.theaters .movie').remove();
        $('.theaters .theater').append(loadingHTML());
    }

    $('.recommendation').remove();
    $('.recommendations').append(loadingHTML());
    
    return getDate().then(getAlgorithm)
                    .then(sleepHalfSecond)
                    .then(addHistory)
                    .then(addTheaters)
                    .then(addTimes)
                    .then(addMovies)
                    .then(loadTimes)
                    .then(addRecommendations)
                    .then(loadRecommend);
}
//Main

//Recommend
function loadRecommendations(date, recommendations, history) {
    
    var currentDate = Date.currentDate();
    var currentTime = Date.currentTime();
    
    $('.recommendations .loading').remove();
    $('.recommendations').append(recommendations.filter(function(r) { return date > currentDate || r.time > currentTime || r.time == '' }).map(recommendationAsHTML));
    $('.recommendations button').on('click', onRecommendationClick);
    
    history.filter(function(h) { return h.date == date }).forEach(function(h) { buttonQuery(h.theaterId, h.movieId, h.time).removeClass('o x').addClass('x'); });
}

function recommendationAsHTML(recommendation) {
    return '<li class="recommendation">'+ buttonLarge(recommendation) + '</li>';
}

function onRecommendationClick() {
    onTimeClick.call(this);
}
//Recommend

//List
function loadTheatersMoviesTimes(date, theaters, movies, times, history) {
    
    var currentDate = Date.currentDate();
    var currentTime = Date.currentTime();
    
    theaters.forEach(function(theater) {

        var theaterTimes  = times.filter(function(time) { return time.date == date && time.theaterId == theater.id && (time.date > currentDate || time.time >= currentTime) });
        var theaterMovies = movies.filter(onlyMoviesWithTimes(theaterTimes));
        var augmentMovies = theaterMovies.map(function(movie){ return Object.assign(movie,{ 'times': theaterTimes.filter(function(time) { return time.movieId == movie.id }) }); });
        var sortedMovies  = augmentMovies.sort(function(x,y) { return y.times.length - x.times.length; });                

        $('#' + theater.id + ' .loading').remove();
        $('#' + theater.id + ' .movies').append(sortedMovies.map(movieAsHTML).join(''));
        $('#' + theater.id + ' .times button').on('click', onTimeClick);
    });
    
    history.filter(function(h) { return h.date == date }).forEach(function(h) { buttonQuery(h.theaterId, h.movieId, h.time).removeClass('o x').addClass('x'); })
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
    var selected = buttons.attr('class') == 'x';
    
    if(selected) {
        History.rmv(theaterId, movieId, getDateSelected(), time).then(History.sync).then(function() {
            buttons.toggleClass('x').toggleClass('o');
        }).then(function(){loadMain(true);});
    }
    else {
        History.put(theaterId, movieId, getDateSelected(), time).then(History.sync).then(function() {
            buttons.toggleClass('x').toggleClass('o');
        }).then(function(){loadMain(true);});
    }
}
//List