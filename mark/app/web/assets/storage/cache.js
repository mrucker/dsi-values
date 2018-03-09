function Cache() {
}

Cache.get = function(key, d) {
    return JSON.parse(window.localStorage.getItem(key)) || d;
}

Cache.set = function(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
    
    return value;
}

Cache.clear = function() {
    window.localStorage.clear();
}

Cache.cleanCache = function() {
    
    //refresh first load of site each day    
    if(Cache.get('version') != Date.currentDate()) 
    {
        Cache.clear();
        Cache.set('version', Date.currentDate());
    }
}