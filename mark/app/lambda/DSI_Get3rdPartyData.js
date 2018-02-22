'use strict';

const https    = require('https');
const aws_sdk  = require('aws-sdk');
const dynamodb = new aws_sdk.DynamoDB();

/**
 * Pass the data to send as `event.data`, and the request options as
 * `event.options`. For more information see the HTTPS module documentation
 * at https://nodejs.org/api/https.html.
 *
 * Will succeed with the response body.
 */
exports.handler = (event, context, callback) => {
    
    let url = getUrl();
    
    //console.log('Url:', url);
    
    const req = https.request(url, requestCallback);
    
    req.on('error', callback);
    req.end();
};

function requestCallback(res) {
    let body = '';
    
    res.setEncoding('utf8');
    
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        
        let movies = JSON.parse(body);
        
        writeMoviesData(movies);
        writeMoviesShowtimesData(movies);
        writeMoviesTheatersData(movies);
    });
}

function writeMoviesData(movies) {
    movies.forEach(writeMovieData);
}

function writeMovieData(movie) {
    let params = 
    {
        Item: {
            "Id"       : {"S" : movie.tmsId },
            "Title"    : {"S" : movie.title },
            "Genres"   : {"SS": movie.genres  || ["NA"]},
            "TopCast"  : {"SS": movie.topCast || ["NA"] },
            "Advisory" : {"S" : movie.ratings ? movie.ratings[0].code : "NA" },
        },
        TableName          : "DSI_Movies",
        //ConditionExpression: "attribute_not_exists(Id)"
    };
    
    dynamodb.putItem(params, function(err,data) { 
        if(err && err.code != "ConditionalCheckFailedException") {
            console.log('Movie: %s; Error: %o', movie.title, err);
        }
    });
}

function writeMoviesShowtimesData(movies) {
    
    let toMovieShowtime  = (m,s) => { 
        return {
            'movieId'  : m.tmsId, 
            'theaterId': s.theatre.id,
            'date'     : s.dateTime.substring(0,10), 
            'time'     : s.dateTime.substring(11), 
            'matinee'  : s.barg || false
        };
    };
    
    let toMovieShowtimes = (m)   => m.showtimes.map(s => toMovieShowtime(m,s));
    let key              = (ms)  => ms.date + ms.theaterId;
    let toFlat           = (l,x) => l.concat(x);
    let toGroup          = (d,x) => {(d[key(x)] = (d[key(x)] || [])).push(x); return d;};
    
    let moviesShowtimes = movies.map(toMovieShowtimes).reduce(toFlat,[]).reduce(toGroup,{});
    
    Object.keys(moviesShowtimes).forEach(k => writeMovieShowtimesData(k, moviesShowtimes[k]));
}

function writeMovieShowtimesData(id, list) {
    
    //console.log(id);
    
    let toDbList = (i) => {
        return { "M": {
                "MovieId": {"S"   : i.movieId},
                "Time"   : {"S"   : i.time   },
                "Matinee": {"BOOL": i.matinee}
            }
        };
    };
    
    let params = 
    {
        Item: {
            "Id"        : {"S": id                  },
            "TheaterId" : {"S": list[0].theaterId   },
            "Date"      : {"S": list[0].date        },
            "Showtimes" : {"L": list.map(toDbList)  },
        },
        TableName          : "DSI_Showtimes",
        //ConditionExpression: "attribute_not_exists(Id)"
    };
    
    dynamodb.putItem(params, function(err,data) { 
        if(err && err.code != "ConditionalCheckFailedException") {
            console.log(params);
            console.log(err);
        }
    });
}

function writeMoviesTheatersData(movies) {
    // There are only three theaters in Charlottesville
    // so for now I'm going to be lazy and add them manually
}

function getUrl() {
    let baseURI    = process.env.baseURI;
    let apiVersion = process.env.apiVersion;
    let apiKey     = process.env.apiKey;
    let zip        = process.env.zip;
    let numDays    = process.env.numDays;
    let startDate  = getStartDate();

    let path  = `v${apiVersion}/movies/showings`;
    let query = `startDate=${startDate}&numDays=${numDays}&zip=${zip}&api_key=${apiKey}`;
    
    return `${baseURI}/${path}?${query}`;
}

function getStartDate() {
    var date  = new Date();
    var month = date.getUTCMonth() + 1; //months from 1-12
    var day   = date.getUTCDate();
    var year  = date.getUTCFullYear();

    return `${year}-${month}-${day}`;
}

function getId () {
    //r1 = Final value represents a number between 0 and 4.295 billion (we remove characters and convert to hex to save space)
    //r2 = Final value represents a number between 0 and 795.36 days worth of miliseconds (we remove characters and convert to hex to save space)
    var r1 = Math.floor(Math.random()*Math.pow(10,16)).toString(16).substring(0,8); 
    var r2 = Date.now().toString(16).substring(2);

    return r1 + r2;
}