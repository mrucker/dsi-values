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
    //omdbCache = {};
    
    //getTmsDataFromDynamo().then(tmsData => {
    getTmsDataFromWeb().then(tmsData => {
         //writeTmsMoviesData(tmsData);
         writeTmsMoviesShowtimesData(tmsData);
         //writeTmsMoviesTheatersData(tmsData);
     }).catch(console.log);
};

function writeTmsMoviesData(tmsMovies) {
    tmsMovies.forEach(tmsMovie => {
        console.log(tmsMovie.title);
        
        getOmdbDataFromWeb(tmsMovie.title, tmsMovie.releaseYear, tmsMovie.subType).then(omdbMovie => {
            writeMovieData(cleanTmsMovie(tmsMovie), cleanOmdbMovie(omdbMovie));
        }).catch(console.log);
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
    
    Object.keys(moviesShowtimes).forEach(k => { writeMovieShowtimesData(k, moviesShowtimes[k]); });
}

function writeTmsMoviesTheatersData(tmsMovies) {
    // There are only three theaters in Charlottesville
    // so for now I'm going to be lazy and add them manually
}

function writeMovieData(tmsData, omdbData) {

    let params = 
    {
        Item: {
            "Id"         : {"S" : tmsData.tmsId        || "NA"   },
            "RootId"     : {"S" : tmsData.rootId       || "NA"   },
            "Title"      : {"S" : tmsData.title        || "NA"   },
            "Type"       : {"S" : tmsData.subType       || "NA"   },

            "ReleaseDate": {"S" : tmsData.releaseDate  || omdbData.Released  || "NA" },
            "Advisory"   : {"S" : tmsData.advisory     || omdbData.Rated     || "NA" },            
            "Directors"  : {"SS": tmsData.directors    || omdbData.Directors || ["NA"] },
            "Genres"     : {"SS": tmsData.genres       || omdbData.Genres    || ["NA"] },
            "TopCast"    : {"SS": tmsData.topCast      || omdbData.Actors    || ["NA"] },

            "ImdbId"     : {"S" : omdbData.imdbId      || "NA" },
            "Runtime"    : {"S" : omdbData.Runtime     || "NA" },
            "IMDbScore"  : {"S" : omdbData.imdbRating  || "NA" },
            "MetaScore"  : {"S" : omdbData.Metascore   || "NA" },
            "RottenScore": {"S" : omdbData.RottenScore || "NA" },
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
    
    //console.log(JSON.stringify(id));
    //theaters:
    //  11542 -- Alamo 
    //  11237 -- Violet
    //  10657 -- Regal
    
    dynamodb.putItem(params, function(err,data) { 
        if(err && err.code != "ConditionalCheckFailedException") {
            console.log(params);
            console.log(err);
        }
    });
}

function cleanTmsMovie(tmsData) {
    tmsData.directors   = tmsData.directors   || undefined;
    tmsData.genres      = tmsData.genres      || undefined;
    tmsData.topCast     = tmsData.topCast     || undefined;
    tmsData.releaseDate = tmsData.releaseDate || undefined;
    tmsData.advisory    = tmsData.ratings ? tmsData.ratings[0].code : undefined;

    tmsData.directors   = !isNa(tmsData.directors  ) ? tmsData.directors   : undefined;
    tmsData.genres      = !isNa(tmsData.genres     ) ? tmsData.genres      : undefined;
    tmsData.topCast     = !isNa(tmsData.topCast    ) ? tmsData.topCast     : undefined;
    tmsData.releaseDate = !isNa(tmsData.releaseDate) ? tmsData.releaseDate : undefined;
    tmsData.advisory    = !isNa(tmsData.advisory   ) ? tmsData.advisory    : undefined;

    return tmsData;
}

function cleanOmdbMovie(omdbData) {
    if(omdbData.Response == "True" ) {
        
        omdbData.Rotten      = omdbData.Ratings  ? omdbData.Ratings.find(r => r.Source == "Rotten Tomatoes"): undefined;
        omdbData.RottenScore = omdbData.Rotten   ? omdbData.Rotten.Value.replace("%","")                    : undefined;
        omdbData.Runtime     = omdbData.Runtime  ? omdbData.Runtime.replace(" min", "")                     : undefined;
        omdbData.imdbId      = omdbData.imdbID   ? omdbData.imdbID                                          : undefined;
        omdbData.Genres      = omdbData.Genre    ? omdbData.Genre.split(",").map(s => s.trim())             : undefined;
        omdbData.Actors      = omdbData.Actors   ? omdbData.Actors.split(",").map(s => s.trim()).slice(0,3) : undefined;
        omdbData.Directors   = omdbData.Director ? omdbData.Director.split(",").map(s => s.trim())          : undefined;
        omdbData.Released    = toDateString(omdbData.Released)
        
        omdbData.Rated       = !isNa(omdbData.Rated      ) ? omdbData.Rated       : undefined;
        omdbData.imdbRating  = !isNa(omdbData.imdbRating ) ? omdbData.imdbRating  : undefined;
        omdbData.Metascore   = !isNa(omdbData.Metascore  ) ? omdbData.Metascore   : undefined;
        omdbData.RottenScore = !isNa(omdbData.RottenScore) ? omdbData.RottenScore : undefined;
        omdbData.Runtime     = !isNa(omdbData.Runtime    ) ? omdbData.Runtime     : undefined;
        omdbData.imdbId      = !isNa(omdbData.imdbId     ) ? omdbData.imdbId      : undefined;
        omdbData.Released    = !isNa(omdbData.Released   ) ? omdbData.Released    : undefined;
        omdbData.Genres      = !isNa(omdbData.Genres     ) ? omdbData.Genres      : undefined;
        omdbData.Actors      = !isNa(omdbData.Actors     ) ? omdbData.Actors      : undefined;
        omdbData.Directors   = !isNa(omdbData.Directors  ) ? omdbData.Directors   : undefined;
        
        return omdbData;
    }
    else {
        return { };
    }
}

function getTmsDataFromWeb() {
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

function getOmdbDataFromWeb(tmsTitle, tmsYear, tmsType) {
    
    tmsYear  = tmsYear >= 2000 ? tmsYear : undefined;
    tmsTitle = tmsTitle.trim().toLowerCase().replace("  ", " ");
    tmsTitle = tmsTitle.replace(": the imax 2d experience", "").replace(" -- an imax 3d experience", "").replace(" 3d", "");
    
    if(tmsTitle == "") {
        return Promise.resolve({"Response":"False","Error":"Title was blank."});
    }
    
    if(tmsType == "Theatre Event") {
        return Promise.resolve({"Response":"False","Error":"Not a movie type."});
    }
    
    return new Promise((resolve, reject) => {

        var url = getOmdbUrl(tmsTitle, tmsYear);
        
        if(omdbCache[url]) {
            if(areSameTitle(tmsTitle, omdbCache[url].Title)){
                resolve(clone(omdbCache[url]));
            }
            else { 
                getOmdbDataFromWeb(removeLastWord(tmsTitle), tmsYear).then(resolve);
            }

            return;
        }

        const req = https.request(url, res => {
            let body = '';

            res.setEncoding('utf8');
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {                 
                
                omdbCache[url] = JSON.parse(body);
                
                if(areSameTitle(tmsTitle, omdbCache[url].Title)){
                    resolve(clone(omdbCache[url]));
                }
                else { 
                    getOmdbDataFromWeb(removeLastWord(tmsTitle), tmsYear).then(resolve);
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

function getTmsDataFromDynamo() {
    return new Promise((resolve, reject) => {
        dynamodb.scan({TableName:"DSI_Movies"}, (err,data) => {
            
            if(err) { reject(err); return; }
            
            resolve(data.Items.map(i => { 
                return {
                    "tmsId"      : i.Id.S,   
                    "title"      : i.Title.S,
                    "rootId"     : i.RootId      ? i.RootId.S              : undefined,
                    "subType"    : i.Type        ? i.Type.S                : undefined,
                    "releaseDate": i.ReleaseDate ? i.ReleaseDate.S         : undefined,
                    "ratings"    : i.Advisory    ? [{"code":i.Advisory.S}] : undefined,
                    "genres"     : i.Genres      ? i.Genres.SS             : undefined,
                    "directors"  : i.Directors   ? i.Directors.SS          : undefined,
                    "topCast"    : i.TopCast     ? i.TopCast.SS            : undefined,
                };
            }));
        });
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

function getOmdbUrl(tmsTitle, tmsYear) {

    //This assumes two things: tms follows their historical naming convention and the title of the movie doesn't have 3D in it.
    //Neither of these things are guaranteed, but looking through the history it looks like a small small fraction violate them.
    let title   = encodeURIComponent(tmsTitle);
    let domain  = process.env.omdbApiDomain;
    let version = process.env.omdbApiVersion;
    let key     = process.env.omdbApiKey;
    let year    = encodeURIComponent(tmsYear); //this may be undefined. That's ok. In that case year="undefined" and omdb ignores it.

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

function areSameTitle(title1, title2) {
    
    title1 = (title1 || "empty").toLowerCase();
    title2 = (title2 || "empty").toLowerCase();
    
    return title1.split(" ").length == title2.split(" ").length;
}

function removeLastWord(string) {
    return string.substring(0, string.lastIndexOf(" "));
}

function isNa(item) {
    var naList = ["NA", "N/A"];
    return naList.includes(item) || item && item.length == 1 && naList.includes(item[0]);
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function toDateString(dateString) {
    return Date.parse(dateString) ? new Date(dateString).toISOString().substring(0,10) : undefined;
}
