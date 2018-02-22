$(document).ready( function () {
    AWS.config.region = 'us-east-1';

    //important to protect against memory overflow
    cacheClearWholeCacheIfStale();
    cacheCleanOldShowtimesByDate();
    cacheCleanOldMoviesByShowtimes();

    initMain();
    showSplash();
    hideMain();

    $('#signOut').on('click', onSignOut);
    $('#daySelector').on('change', loadMain);
});

function gapiInit() {

    // don't need this because onSignIn is called everytime
    // gapi.auth2.init().then(function(googleAuth) { 
        // var googleUser = googleAuth.currentUser.get();
        // if(googleUser.isSignedIn()) {
            // onSignIn(googleUser);
        // }
    // });
}

function onSignIn(googleUser) {
            
    setAWSCredentials(googleUser.getBasicProfile().getEmail(), googleUser.getAuthResponse().id_token);    
    
    loadMain();
    
    showMain();
    hideSplash();
};

function onSignOut() {    
            
    gapi.auth2.getAuthInstance().signOut();
    
    hideMain();
    showSplash();
    
    return true;
}

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
    
    getTheaters(function(theaters) {
        theaters.forEach(function(theater) {
            $('#main').append('<div class="theater" id="' + theater.id + '"><a href="' + theater.url + '">' + theater.name + '</a><div class="movies"></div></div>')
        });
    })
}

function loadMain() {

    getTheaters(function(theaters) {
        
        getShowtimes(getDaySelected(), theaters, function(showtimes) {
            
            getMovies(showtimes, function(movies) {
                
                $('.movies').html('');
                
                theaters.map(function(theater) { return theater.id; }).forEach(function(theaterId) {
                    
                    var moviesInTheater = showtimes.filter(function(showtime) { return showtime.theaterId == theaterId}).map(function(showtime) { return showtime.movieId }).filter(onlyUnique);
                    
                    var moviesAsItems = moviesInTheater.map(function(movieId) {
                                                             
                        var movieInfo    = movies.find(function(movie) { return movie.id == movieId; } );
                        var times        = showtimes.filter(function(showtime) { return showtime.movieId == movieId && showtime.theaterId == theaterId; }).map(function(showtime) { return showtime.time });                    
                        var timesAsItems = times.map(function(time) { return '<li>'+time+'</li>'}).join('');
                    
                        return '<li>' + movieInfo.title + '<ul>' + timesAsItems + '</ul>' + '</li>';
                    });
                      
                    $('#' + theaterId + ' .movies').append('<ul>' + moviesAsItems.join('') + '</ul>');
                });
            });
        });
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
    
    return getDayISO861(selectedDay);
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
         +    '<option value="4">' + day4 + '</option>'
         + '</select>';
        
}

function getDayISO861(day) {
    var date = new Date()    
    
    date.setDate(date.getDate() + parseInt(day));
    
    return date.toISOString().substring(0,10);
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

function getTheaters(callback) {    
    callback([ 
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
        {
            'id'  : '9997',
            'name': 'The Paramount Theater',
            'url' : 'https://www.theparamount.net/'
        }
    ]);
}

function getShowtimes(date, theaters, callback) {
    
    var theaterIds      = theaters.map(function(theater) { return theater.id }).filter(onlyUnique);
    var cachedShowtimes = cacheGet('showtimes') || [];
    var showtimes       = cachedShowtimes.filter(function(cachedShowtime) { return cachedShowtime.date == date && theaterIds.includes(cachedShowtime.theaterId) });
    
    if(showtimes.length > 0) {
        callback(showtimes);
        return;
    }
    
    var dynamodb = new AWS.DynamoDB();

    dynamodb.batchGetItem({'RequestItems':{'DSI_Showtimes': { 'Keys': theaterIds.map(function(tid) { return {'Id' : {'S':date+tid } }; })} } }, function(err, data) {

        var showTimes = [];
    
        data.Responses.DSI_Showtimes.forEach(function(item) {
            
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
        
        cacheSet('showtimes', cachedShowtimes.concat(showtimes));
        
        callback(showtimes);
    });
}

function getMovies(showtimes, callback) {    

    var movieIds     = showtimes.map(function(showtime) { return showtime.movieId }).filter(onlyUnique);
    var cachedMovies = cacheGet('movies') || [];
    var movies       = cachedMovies.filter(function(cachedMovie) { return movieIds.includes(cachedMovie.id) });
    
    if(movies.length == movieIds.length) {
        callback(movies);
        return;
    }
    
    var dynamodb = new AWS.DynamoDB();

    dynamodb.batchGetItem({'RequestItems':{'DSI_Movies': { 'Keys': movieIds.map(function(mid) { return {'Id' : {'S':mid } }; })} }}, function(err, data) {

        var movies = [];

        data.Responses.DSI_Movies.forEach(function(item) {
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

        cacheSet('movies', cachedMovies.concat(movies));
        callback(movies);
    });

}

function cacheClearWholeCacheIfStale() {
        
    var oldStorageVersion = cacheGet('storageVersion');
    var newStorageVersion = 1;
    
    if(oldStorageVersion != newStorageVersion) 
    {
        cacheClear();
    }
    
    cacheSet('storageVersion', newStorageVersion);
}

function cacheCleanOldShowtimesByDate() {
    
    var currentDate = getDayISO861(0);    
    var showtimes   = cacheGet('showtimes') || [];
    
    showtimes = showtimes.filter(function(showtime){ return showtime.date >= currentDate });
        
    cacheSet('showtimes', showtimes);
}

function cacheCleanOldMoviesByShowtimes() {

    var showtimes      = cacheGet('showtimes') || [];
    var movies         = cacheGet('movies')    || [];
    var showtimeMovies = showtimes.map(function(showtime) { return showtime.movieId }).filter(onlyUnique);
    
    movies = movies.filter(function(movie) { return showtimeMovies.includes(movie.id); });
    
    cacheSet('movies', movies);
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

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}