function buttonLarge(recommendation) {
    return '<button class="o" ' + dataAttributes(recommendation.theaterId, recommendation.movieId, recommendation.time) + '>'
         +     '<div>  ' + recommendation.movie   + '</div>'
         +     '<div>  ' + recommendation.theater + '</div>'
         +     '<div> @' + recommendation.time    + '</div>'
         + '</button>'
}

function buttonSmall(time) {
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