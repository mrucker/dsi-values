function cacheGetOrDefault(key, d) {
    return cacheGet(key) || d;
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
