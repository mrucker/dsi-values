function Theater() {
}

Theater.getCacheOrSource = function(theaterIds) {
    return Promise.resolve(Theater.getCache(theaterIds));
}

Theater.getCache = function(theaterIds) {
    
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
    
    if(theaterIds && !theaterIds.includes) {
        theaterIds = [theaterIds];
    }
    
    if(theaterIds) {
        theaterIds = theaterIds.map(String);
    }
    
    return theaters.filter(function(t) { return theaterIds == null || theaterIds.includes(t.id)});
}

