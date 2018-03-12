'use strict';

const https    = require('https');
const aws_sdk  = require('aws-sdk');
const dynamodb = new aws_sdk.DynamoDB();

let omdbCache = {};

/**
 * Pass the data to send as `event.data`, and the request options as
 * `event.options`. For more information see the HTTPS module documentation
 * at https://nodejs.org/api/https.html.
 *
 * Will succeed with the response body.
 */
exports.handler = (event, context, callback) => {
    
    getTmsData().then(tmsData => {
        writeTmsMoviesData(tmsData);
        writeTmsMoviesShowtimesData(tmsData);
        writeTmsMoviesTheatersData(tmsData);
    });
};

function writeTmsMoviesData(tmsMovies) {
    tmsMovies.forEach(tmsMovie => {
                
        getOmdbData(tmsMovie).then(omdbMovie => {
            writeMovieData(cleanTmsMovie(tmsMovie), cleanOmdbMovie(omdbMovie));
        });
        
    });
}

function writeTmsMoviesShowtimesData(tmsMovies) {
    
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
    
    let moviesShowtimes = tmsMovies.map(toMovieShowtimes).reduce(toFlat,[]).reduce(toGroup,{});
    
    Object.keys(moviesShowtimes).forEach(k => { /*console.log("key: ", k);*/ writeMovieShowtimesData(k, moviesShowtimes[k]); });
}

function writeTmsMoviesTheatersData(tmsMovies) {
    // There are only three theaters in Charlottesville
    // so for now I'm going to be lazy and add them manually
}

function writeMovieData(tmsData, omdbData) {
    let params = 
    {
        Item: {
            "Id"         : {"S" : tmsData.tmsId       },
            "RootId"     : {"S" : tmsData.rootId      },
            "Title"      : {"S" : tmsData.title       },
            "ReleaseDate": {"S" : tmsData.releaseDate },
            "Advisory"   : {"S" : tmsData.advisory    },
            "Directors"  : {"SS": tmsData.directors   },
            "Genres"     : {"SS": tmsData.genres      },
            "TopCast"    : {"SS": tmsData.topCast     },
            "Runtime"    : {"S" : omdbData.Runtime    },
            "IMDbScore"  : {"S" : omdbData.imdbRating },
            "MetaScore"  : {"S" : omdbData.Metascore  },
            "RottenScore": {"S" : omdbData.RottenScore},

        },
        TableName          : "DSI_Movies",
        //ConditionExpression: "attribute_not_exists(Id)"
    };

    dynamodb.putItem(params, function(err,data) { 
        if(err && err.code != "ConditionalCheckFailedException") {
            console.log('Movie: %s; Error: ', tmsData.title, err);
        }
    });
}

function writeMovieShowtimesData(id, list) {
    
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

function cleanTmsMovie(tmsData) {
    tmsData.directors   = tmsData.directors   || ["NA"];
    tmsData.genres      = tmsData.genres      || ["NA"];
    tmsData.topCast     = tmsData.topCast     || ["NA"];
    tmsData.releaseDate = tmsData.releaseDate || "NA";
    tmsData.advisory    = tmsData.ratings ? tmsData.ratings[0].code : "NA" ;

    return tmsData;
}

function cleanOmdbMovie(omdbData) {
    if(omdbData.Response == "True" ) {
        omdbData.Rotten      = omdbData.Ratings ? omdbData.Ratings.find(r => r.Source == "Rotten Tomatoes") : undefined;
        omdbData.RottenScore = omdbData.Rotten  ? omdbData.Rotten.Value.replace("%",""): "NA";
        omdbData.Runtime     = omdbData.Runtime ? omdbData.Runtime.replace(" min", "") : "NA";
        
        return omdbData;
    }
    else {
        return {
            "imdbRating" : "NA",
            "Metascore"  : "NA",
            "RottenScore": "NA",
            "Runtime"    : "NA",
        };
    }
}

function getTmsData() {
    return new Promise((resolve, reject) => {
        
        const req = https.request(getTmsUrl(), res => {
            let body = '';
        
            res.setEncoding('utf8');            
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => { resolve(JSON.parse(body)); });
        });
        
        req.on('error', reject);
        req.end();
    });
}

function getOmdbData(tmsMovie) {
    return new Promise((resolve, reject) => {
        
        var url = getOmdbUrl(tmsMovie.title, tmsMovie.releaseYear);
        
        if(omdbCache[url]) {
            resolve(omdbCache[url]);
            return;
        }
        
        const req = https.request(url, res => {
            let body = '';
        
            res.setEncoding('utf8');
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => { 
                omdbCache[url] = JSON.parse(body);
                resolve(omdbCache[url]);
            });
        });

        req.on('error', reject);
        req.end();
    });
}

function getTmsUrl() {
    let domain    = process.env.tmsApiDomain;
    let version   = process.env.tmsApiVersion;
    let key       = process.env.tmsApiKey;
    let zip       = process.env.tmsZip;
    let numDays   = process.env.tmsNumDays;
    let startDate = getStartDate();

    let path  = `/v${version}/movies/showings`;
    let query = `?api_key=${key}&startDate=${startDate}&zip=${zip}&numDays=${numDays}`;

    return `${domain}${path}${query}`;
}

function getOmdbUrl(tmsTitle, tmsReleaseYear) {

    //This assumes two things: tms follows their historical naming convention and the title of the movie doesn't have 3D in it.
    //Neither of these things are guaranteed, but looking through the history it looks like a small small fraction violate them.
    let title   = encodeURIComponent(tmsTitle.replace(" 3D", "").replace(": The IMAX 2D Experience", ""));
    let domain  = process.env.omdbApiDomain;
    let version = process.env.omdbApiVersion;
    let key     = process.env.omdbApiKey;
    let year    = encodeURIComponent(tmsReleaseYear);

    let path  = `/`;
    let query = `?apikey=${key}&type=movie&t=${title}&y=${year}&v=${version}`;

    return `${domain}${path}${query}`;
}

function getStartDate() {
    var date  = new Date();
    var month = date.getUTCMonth() + 1; //months from 1-12
    var day   = date.getUTCDate();
    var year  = date.getUTCFullYear();

    return `${year}-${month}-${day}`;
}