function getDateSelected() {
    return $('#datepicker').datepicker("getDate").toMyDateString();
}

function getDateSelector() {
    return '<input type="text" id="datepicker">';
}

function setDateSelector(callback) {
    $('#datepicker').datepicker({
        onSelect     : callback,
        minDate      : new Date("2/25/2018"),
        maxDate      : "+3D",        
    });
    $('#datepicker').datepicker("setDate", new Date());
}

function updateDateSelectorHistory() {
    
    Session.getHistory().then(function(history) {
        
        $('#datepicker').datepicker("option", {
            beforeShowDay: function(date) {
                
                var historyOnDate = history.filter(function(h) { return h.date == date.toMyDateString(); });
                var moviesOnDate  = historyOnDate.map(function(h) { return movieTitle(h.movieId) + " ~ " + theaterName(h.theaterId) + " @" + h.time });
                
                var classes = [];
                
                if(date.toMyDateString() == Date.currentDate()) {
                    classes.push("datepicker-today");
                }
                
                if(historyOnDate.length > 0) {
                    classes.push("datepicker-history");
                }
                
                return [true, classes.join(" "), moviesOnDate.join("\r\n")];
            }
        });
    });    
}

function movieTitle(movieId) {
    var movie = Movie.getCache(movieId)[0];
    return movie ? movie.title : "unknown";
}

function theaterName(theaterId) {
    return Theater.getCache(theaterId)[0].name;
}

function getDateSelectedOld() {
    return $('#dateSelector').val();
}

function setDateSelectorOld(callback) {
    $('#dateSelector').on('change', callback);
}

function getDateSelectorOld() {

    var day0 = 'Today';
    var day1 = 'Tomorrow';
    var day2 = Date.nowPlusDays(2).toDayString(); 
    var day3 = Date.nowPlusDays(3).toDayString();
    var day4 = Date.nowPlusDays(4).toDayString();
    
    return '<select id="dateSelector">' 
         +    '<option value="'+Date.nowPlusDays(0).toMyDateString()+'">' + day0 + '</option>'
         +    '<option value="'+Date.nowPlusDays(1).toMyDateString()+'">' + day1 + '</option>'
         +    '<option value="'+Date.nowPlusDays(2).toMyDateString()+'">' + day2 + '</option>'
         +    '<option value="'+Date.nowPlusDays(3).toMyDateString()+'">' + day3 + '</option>'
         + '</select>';
}