$(document).ready( function () {
    AWS.config.region = 'us-east-1';

    //important to protect against memory overflow
    cacheClearWholeCacheIfStale();
    cacheCleanOldShowtimesByDate();
    cacheCleanOldMoviesByShowtimes();

    hideMain();
    hideSplash();
    
    initMain();

    $('#signOut').on('click', onSignOut);
    $('#daySelector').on('change', loadMain);
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

function onSignIn(googleUser) {
            
    setAWSCredentials(googleUser.getBasicProfile().getEmail(), googleUser.getAuthResponse().id_token);
    
    loadMain();
    
    hideSplash();
    showMain();
};

function onSignOut() {
    gapi.auth2.getAuthInstance().signOut();
    cacheSet('storageVersion', 0);
}

function onMovieTimeClick() {
    var time    = $(this).html();    
    var movie   = $(this).closest(".movie").find(".title").html();
    var theater = $(this).closest(".theater").find(".title").html()
    
    $(this).toggleClass('x').toggleClass('o');
}

function onRecommendationClick() {    
    $(this).toggleClass('x').toggleClass('o');
}
//events

function setAWSCredentials(loginEmail, googleToken) {
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({ 
      // either IdentityPoolId or IdentityId is required
      // See the IdentityPoolId param for AWS.CognitoIdentity.getID (linked below)
      // See the IdentityId param for AWS.CognitoIdentity.getCredentialsForIdentity
      // or AWS.CognitoIdentity.getOpenIdToken (linked below)
      //IdentityId: ''
      IdentityPoolId: 'us-east-1:6aa9214b-3ab3-4c20-b9aa-44b939e7fac6',

      // optional, only necessary when the identity pool is not configured
      // to use IAM roles in the Amazon Cognito Console
      // See the RoleArn param for AWS.STS.assumeRoleWithWebIdentity (linked below)
      //RoleArn: 'arn:aws:iam::1234567890:role/MYAPP-CognitoIdentity',

      // optional tokens, used for authenticated login
      // See the Logins param for AWS.CognitoIdentity.getID (linked below)
      Logins: {
        //'graph.facebook.com': 'FBTOKEN',
        //'www.amazon.com': 'AMAZONTOKEN',
        'accounts.google.com': googleToken,
        //'api.twitter.com': 'TWITTERTOKEN',
        //'www.digits.com': 'DIGITSTOKEN'
      },

      // optional name, defaults to web-identity
      // See the RoleSessionName param for AWS.STS.assumeRoleWithWebIdentity (linked below)
      RoleSessionName: 'web',

      // optional, only necessary when application runs in a browser
      // and multiple users are signed in at once, used for caching
      LoginId: loginEmail
    });
}

function showSplash() {
    $('#splash').css('display','block');
}

function hideSplash() {
    $('#splash').css('display','none');
}

function initMain() {
    $('#toolbar .left' ).html('<a href="https://dsi.markrucker.net" class="strong"> Ethical Recommendations </a> <span>' + getDaySelector() + '</span>');
    $('#toolbar .right').html('<a href="https://dsi.markrucker.net" class="hover" id="signOut">Sign out</a>');
    
    $('#main').append('<h1>Recommendations</h1><ol class="recommendations"></ol>');
    $('#main').append('<h1>Showtimes</h1><div class="theaters"></div>')
    
    getTheaters().then(function(data) {
        data.theaters.forEach(function(theater) {
            $('#main .theaters').append('<div class="theater" id="' + theater.id + '"><a href="' + theater.url + '" class="title">' + theater.name + '</a><div class="movies"></div></div>')
        });
    })
}

function loadMain() {    

    $('.recommendation').remove();
    $('.theaters .movie').remove();
    
    $('.recommendations').append(loadingAsHTML());
    $('.theaters .theater').append(loadingAsHTML());

    return getDaySelected().then(getTheaters).then(getTimes).then(getMovies).then(function(data) {
         return new Promise(function(resolve, reject) {
            loadTheatersMoviesTimes(data.theaters, data.movies, data.times);
            resolve(data);
         });        
    }).then(getRecommendations).then(function(data) {
        loadRecommendations(data.recommendations);
    });
}

function loadRecommendations(recommendations) {
    
    $('.recommendations .loading').remove();
    $('.recommendations').append(recommendations.map(recommendationAsHTML));
    $('.recommendations button').on('click', onRecommendationClick);
}

function loadTheatersMoviesTimes(theaters, movies, times) {
    
    var currentDate = getDayISO861(0);
    var currentTime = getTimeISO861();
    
    theaters.map(function(theater) { return theater.id; }).forEach(function(theaterId) {

        var theaterTimes  = times.filter(function(time) { return time.theaterId == theaterId && (time.date > currentDate || time.time >= currentTime) });
        var theaterMovies = movies.filter(onlyMoviesWithTimes(theaterTimes));
        var augmentMovies = theaterMovies.map(function(movie){ return Object.assign(movie,{'times': theaterTimes.filter(function(time) { return time.movieId == movie.id }) }); });
        var sortedMovies  = augmentMovies.sort(function(x,y) { return y.times.length - x.times.length; });                

        $('#' + theaterId + ' .loading').remove();
        $('#' + theaterId + ' .movies').append(sortedMovies.map(movieAsHTML).join(''));
        $('#' + theaterId + ' .times button').on('click', onMovieTimeClick);
    });
}

function showMain() {
    $("#toolbar span").css('display','inline');
    $('#main').css('display','block');
}
    
function hideMain() {
    $("#toolbar span").css('display','none');
    $('#main').css('display','none');
}

function getDaySelections() {
    var days = $('#daySelector option').map(function() { return parseInt(this.value); } ).toArray();
    
    return days.map(getDayISO861);
}

function getDaySelected() {
    var selectedDay = $('#daySelector').val();
    
    return new Promise(function(resolve, reject) { 
        resolve({'date':getDayISO861(selectedDay)});
    });
}

function getDaySelector() {

    var day0 = 'Today';
    var day1 = 'Tomorrow';
    var day2 = getDayAsText(new Date().getDay() + 2);
    var day3 = getDayAsText(new Date().getDay() + 3);
    var day4 = getDayAsText(new Date().getDay() + 4);
    
    return '<select id="daySelector">' 
         +    '<option value="0">' + day0 + '</option>'
         +    '<option value="1">' + day1 + '</option>'
         +    '<option value="2">' + day2 + '</option>'
         +    '<option value="3">' + day3 + '</option>'
         //+    '<option value="4">' + day4 + '</option>'
         + '</select>';
}

function getDayISO861(day) {
    var date = new Date()
    
    date.setDate(date.getDate() + parseInt(day));
    
    return date.toISOString().substring(0,10);
}

function getTimeISO861() {
    return new Date().toTimeString().substring(0,5);//will break if person calls website from outside of EST
}

function getDayAsText(day) {

    day = day % 7;

    if(day == 0) return 'Sunday';
    if(day == 1) return 'Monday';
    if(day == 2) return 'Tuesday';
    if(day == 3) return 'Wednesday';
    if(day == 4) return 'Thursday';
    if(day == 5) return 'Friday';
    
    return 'Saturday';
}

function getTheaters(data) {
    return new Promise(function(resolve, reject) {
        
        var theaters = [
            {
                'id'  : '11542',
                'name': 'Alamo Drafthouse Cinema',
                'url' : 'https://drafthouse.com/charlottesville'
            },
            {
                'id'  : '11237',
                'name': 'Violet Crown Charlottesville',
                'url' : 'https://charlottesville.violetcrown.com/'
            },
            {
                'id'  : '10657',
                'name': 'Regal Stonefield Stadium 14',
                'url' : 'https://www.regmovies.com/theaters/regal-stonefield-stadium-14-imax/C00318790965'
            },
            /*{
                'id'  : '9997',
                'name': 'The Paramount Theater',
                'url' : 'https://www.theparamount.net/'
            }*/
        ];
        
        resolve(Object.assign({}, data, {'theaters':theaters}));
    });
}

function getTimes(data) {
    
    var theaters    = data.theaters;
    var date        = data.date;
    var theaterIds  = theaters.map(function(theater) { return theater.id }).filter(onlyUnique);
    var cachedTimes = cacheGet('showtimes') || [];
    var showtimes   = cachedTimes.filter(function(cachedShowtime) { return cachedShowtime.date == date && theaterIds.includes(cachedShowtime.theaterId) });
    
    return new Promise(function(resolve, reject) {
    
        if(showtimes.length > 0) {
            resolve(Object.assign({}, data, {'times':showtimes})); return;
        }
        
        console.log('hit remote Showtimes');
        new AWS.DynamoDB().batchGetItem({'RequestItems':{'DSI_Showtimes': { 'Keys': theaterIds.map(function(tid) { return {'Id' : {'S':date+tid } }; })} } }, function(err, db) {

            var showtimes = [];
        
            db.Responses.DSI_Showtimes.forEach(function(item) {
                
                if(item) {
                    
                    showtimes = showtimes.concat(item.Showtimes.L.map(function(showtime) {
                        return {
                            "theaterId": item.TheaterId.S,
                            "movieId"  : showtime.M.MovieId.S,
                            "date"     : item.Date.S,
                            "time"     : showtime.M.Time.S,
                            "matinee"  : showtime.M.Matinee.BOOL,
                        };
                    }));
                }
                
            });
            
            cacheSet('showtimes', cachedTimes.concat(showtimes).filter(onlyUniqueShowtimes()));
            resolve(Object.assign({}, data, {'times':showtimes}));
        });
    });
}

function getMovies(data) {    
    
    var movieIds     = data.times.map(function(showtime) { return showtime.movieId }).filter(onlyUnique);
    var cachedMovies = cacheGet('movies') || [];
    var movies       = cachedMovies.filter(onlyMoviesWithTimes(data.times));
    
    return new Promise(function(resolve, reject) {
        
        if(movies.length == movieIds.length) {
            resolve(Object.assign({}, data, {'movies':movies})); return;
        }    

        console.log('hit remote Movies');
        new AWS.DynamoDB().batchGetItem({'RequestItems':{'DSI_Movies': { 'Keys': movieIds.map(function(mid) { return {'Id' : {'S':mid } }; })} }}, function(err, db) {

            var movies = [];

            db.Responses.DSI_Movies.forEach(function(item) {
                if(item) {

                    movies = movies.concat({
                        'id'      : item.Id.S,
                        'title'   : item.Title.S,
                        'genres'  : item.Genres.SS,
                        'topCast' : item.TopCast.SS,
                        'advisory': item.Advisory.S
                    });
                }
            });

            cacheSet('movies', cachedMovies.concat(movies).filter(onlyUniqueMovies()));
            resolve(Object.assign({}, data, {'movies':movies})); return;
        });
    });

}

function getRecommendations(data) {
    return getRandomRecommendations(data);
}

function getRandomRecommendations(data) {       
    return new Promise(function(resolve, reject) {
        
        //var seed = parseInt(data.date.replace("-","").replace("-",""));
        var rand = new Math.seedrandom(data.date);
        
        var randomCount = Math.floor(rand() * 10);
        var randomTimes = [];
        
        for(var i = 0; i < randomCount; i++) {
            randomTimes.push(data.times[Math.floor(rand() * data.times.length)])
        }
        
        recommendations = randomTimes.map(function(time) { 
            return {
                'movie'  : data.movies.find(function(m){ return m.id == time.movieId}).title, 
                'theater': data.theaters.find(function(t) { return t.id == time.theaterId}).name.split(' ').splice(0,2).join(' '), 
                'time'   : time.time
            }; 
        });
        
        resolve(Object.assign({}, data, {'recommendations':recommendations})); return;
    });
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
    
    var currentDate     = getDayISO861(0);    
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

function cacheGet(key) {
    return JSON.parse(window.localStorage.getItem(key));
}

function cacheSet(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
}

function cacheClear() {
    window.localStorage.clear();
}
//cache methods

//map methods
function recommendationAsHTML(recommendation) {
    return '<li class="recommendation">'
         +   '<button class="o">'
         +     '<div>' + recommendation.movie + '</div>'
         +     '<div>' + recommendation.theater + '</div>'
         +     '<div>@ ' + recommendation.time + '</div>'
         +   '</button>'
         + '</li>';
}

function timeAsHTML(time) {
    return '<li class="time">'
         +   '<button class="o">'
         +      time
         +   '</button>'
         + '</li>';
}

function movieAsHTML(movie) {
    return '<li class="movie">'
         +    '<span class="title">'
         +       movie.title
         +    '</span>'
         +    '<ul class="times">'
         +        movie.times.map(function(t){return t.time;}).map(timeAsHTML).join('')
         +    '</ul>'
         + '</li>';
}

function loadingAsHTML() {
    return '<div class="loading lds-css ng-scope" style="width: 100px; height: 100px;">'
         +   '<div class="lds-spinner" style="100%;height:100%">'
         +     '<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>'
         +   '</div>'
         + '<style type="text/css">'
         +   '@keyframes lds-spinner {'
         +     '0% {'
         +       'opacity: 1;'
         +     '}'
         +     '100% {'
         +       'opacity: 0;'
         +     '}'
         +   '}'
         +   '@-webkit-keyframes lds-spinner {'
         +     '0% {'
         +       'opacity: 1;'
         +     '}'
         +     '100% {'
         +       'opacity: 0;'
         +     '}'
         +   '}'
         +   '.lds-spinner {'
         +     'position: relative;'
         +   '}'
         +   '.lds-spinner div {'
         +     'left: 97px;'
         +     'top: 48px;'
         +     'position: absolute;'
         +     '-webkit-animation: lds-spinner linear 1s infinite;'
         +     'animation: lds-spinner linear 1s infinite;'
         +     'background: #CCA43B;'
         +     'width: 6px;'
         +     'height: 24px;'
         +     'border-radius: 20%;'
         +     '-webkit-transform-origin: 3px 52px;'
         +     'transform-origin: 3px 52px;'
         +   '}'
         +   '.lds-spinner div:nth-child(1) {'
         +     '-webkit-transform: rotate(0deg);'
         +     'transform: rotate(0deg);'
         +     '-webkit-animation-delay: -0.909090909090909s;'
         +     'animation-delay: -0.909090909090909s;'
         +   '}'
         +   '.lds-spinner div:nth-child(2) {'
         +     '-webkit-transform: rotate(32.72727272727273deg);'
         +     'transform: rotate(32.72727272727273deg);'
         +     '-webkit-animation-delay: -0.818181818181818s;'
         +     'animation-delay: -0.818181818181818s;'
         +   '}'
         +   '.lds-spinner div:nth-child(3) {'
         +     '-webkit-transform: rotate(65.45454545454545deg);'
         +     'transform: rotate(65.45454545454545deg);'
         +     '-webkit-animation-delay: -0.727272727272727s;'
         +     'animation-delay: -0.727272727272727s;'
         +   '}'
         +   '.lds-spinner div:nth-child(4) {'
         +     '-webkit-transform: rotate(98.18181818181819deg);'
         +     'transform: rotate(98.18181818181819deg);'
         +     '-webkit-animation-delay: -0.636363636363636s;'
         +     'animation-delay: -0.636363636363636s;'
         +   '}'
         +   '.lds-spinner div:nth-child(5) {'
         +     '-webkit-transform: rotate(130.9090909090909deg);'
         +     'transform: rotate(130.9090909090909deg);'
         +     '-webkit-animation-delay: -0.545454545454545s;'
         +     'animation-delay: -0.545454545454545s;'
         +   '}'
         +   '.lds-spinner div:nth-child(6) {'
         +     '-webkit-transform: rotate(163.63636363636363deg);'
         +     'transform: rotate(163.63636363636363deg);'
         +     '-webkit-animation-delay: -0.454545454545455s;'
         +     'animation-delay: -0.454545454545455s;'
         +   '}'
         +   '.lds-spinner div:nth-child(7) {'
         +     '-webkit-transform: rotate(196.36363636363637deg);'
         +     'transform: rotate(196.36363636363637deg);'
         +     '-webkit-animation-delay: -0.363636363636364s;'
         +     'animation-delay: -0.363636363636364s;'
         +   '}'
         +   '.lds-spinner div:nth-child(8) {'
         +     '-webkit-transform: rotate(229.0909090909091deg);'
         +     'transform: rotate(229.0909090909091deg);'
         +     '-webkit-animation-delay: -0.272727272727273s;'
         +     'animation-delay: -0.272727272727273s;'
         +   '}'
         +   '.lds-spinner div:nth-child(9) {'
         +     '-webkit-transform: rotate(261.8181818181818deg);'
         +     'transform: rotate(261.8181818181818deg);'
         +     '-webkit-animation-delay: -0.181818181818182s;'
         +     'animation-delay: -0.181818181818182s;'
         +   '}'
         +   '.lds-spinner div:nth-child(10) {'
         +     '-webkit-transform: rotate(294.54545454545456deg);'
         +     'transform: rotate(294.54545454545456deg);'
         +     '-webkit-animation-delay: -0.090909090909091s;'
         +     'animation-delay: -0.090909090909091s;'
         +   '}'
         +   '.lds-spinner div:nth-child(11) {'
         +     '-webkit-transform: rotate(327.27272727272725deg);'
         +     'transform: rotate(327.27272727272725deg);'
         +     '-webkit-animation-delay: 0s;'
         +     'animation-delay: 0s;'
         +   '}'
         +   '.lds-spinner {'
         +     'width: 200px !important;'
         +     'height: 200px !important;'
         +     '-webkit-transform: translate(-100px, -100px) scale(.5) translate(100px, 100px);'
         +     'transform: translate(-100px, -100px) scale(.5) translate(100px, 100px);'
         +   '}'
         +   '</style>'
         + '</div>';
}
//map methods

//filter,reduce methods
function onlyUnique(value, index, list) {
    return list.indexOf(value) === index;
}

function onlyUniquePredciate(isEqual) {
    return function (v1, index, list) {
        return list.findIndex(function(v2) { return isEqual(v1,v2); }) == index;
    };
}

function onlyUniqueMovies() {
    return onlyUniquePredciate(function(m1,m2) { return m1.id == m2.id });
}

function onlyUniqueShowtimes() {
    return onlyUniquePredciate(function(s1,s2) { return s1.theaterId == s2.theaterId && s1.movieId == s2.movieId && s1.time == s2.time && s1.date == s2.date });
}

function onlyMoviesWithTimes(times) {    
    return function(movie) { return times.some(function(time) { return time.movieId == movie.id}); };
}

function onlyMovieTimes(movie) {
    
    return function(showtime) {
        return showtime.movieId == movie.id;
    }
}

function group (items, key, map) {
    
    map = map || function(item) { return item; };
    
    return items.reduce(function(dict, item) { (dict[item[key]] = dict[item[key]] || []).push(map(item)); return dict; }, {});
};
//filter,reduce methods