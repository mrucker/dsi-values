function History() {

}

History.obj = function(theaterId, movieId, date, time) {
    return {'theaterId':theaterId, 'movieId':movieId, 'date':date, 'time':time};
}

History.areEqual = function(h1,h2) {
    return h1.theaterId == h2.theaterId && h1.movieId == h2.movieId && h1.date == h2.date && h1.time == h2.time;
}