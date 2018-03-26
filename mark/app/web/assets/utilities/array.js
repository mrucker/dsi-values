Array.prototype.toFlat = function() {
    return [].concat.apply([], this);
};

Array.prototype.toDistinct = function(map) {
    
    if(map && typeof(map) != "function") {
        throw "Illegal map value (" + key + ", " + typeof(map) + ")"; 
    }

    var areEqual = (!map) ? ((v1,v2) => v1==v2) : (map.length == 1) ? ((v1,v2) => map(v1) == map(v2)) : map;

    return this.filter((v1, index) => this.findIndex(v2 => areEqual(v1,v2)) === index);
};

Array.prototype.toDict = function(key, map) {

    if(!key || typeof(key) != "string" || typeof(key) != "function") {
       throw "Illegal key (" + key + ", " + typeof(key) + ")";
    }

    var toKey = (typeof(key) == "string") ? (item => item[key]) : (item => key(item));
    var toObj = map || (item => item);

    return this.reduce(function(dict, item) {
        dict[toKey(item)] = dict[toKey(item)] || [];
        dict.push(toObj(item));
        return dict;
    }, {});
}

Array.prototype.pull = function(value) {
    
    return this.filter(item => item != value);
}

function onlyMoviesWithTimes(times) {    
    return movie => times.some(time => time.movieId == movie.id);
}