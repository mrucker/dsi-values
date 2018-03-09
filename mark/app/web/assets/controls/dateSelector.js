function getDateSelected() {
    return $('#dateSelector').val();
}

function getDateSelector() {

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