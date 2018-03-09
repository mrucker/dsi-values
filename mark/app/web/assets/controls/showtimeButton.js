function buttonLarge(recommendation) {
    return '<button class="o" ' + dataAttributes(recommendation.theater.id, recommendation.movie.id, recommendation.time) + '>'
         +     '<div> ' + recommendation.movie.title                                   + '</div>'
         +     '<div> ' + recommendation.theater.name.split(' ').splice(0,2).join(' ') + '</div>'
         +     '<div>@' + recommendation.time                                          + '</div>'
         + '</button>'
}

function buttonSmall(time, onClick) {
    return '<button class="o" ' + dataAttributes(time.theaterId, time.movieId, time.time) + '>'
         +     time.time
         + '</button>'
}

function buttonQuery(theaterId, movieId, time){
    return $('button[data-theater-id="'+theaterId+'"][data-movie-id="'+movieId+'"][data-time="'+time+'"]')
}

function dataAttributes(theaterId, movieId, time) {
    return 'data-theater-id="' + theaterId + '" data-movie-id="' + movieId + '" data-time="' + time + '"';
}