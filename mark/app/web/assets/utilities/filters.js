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