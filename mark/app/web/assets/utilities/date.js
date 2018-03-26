Date.prototype.toMyDateString = function() {
    var year  = String(this.getFullYear());
    var month = String(this.getMonth()+1).padStart(2, '0');
    var day   = String(this.getDate()).padStart(2, '0');
    
    return year + "-" + month + "-" + day;   
}

Date.prototype.toMyTimeString = function() {
    return this.toTimeString().substring(0,5);
}

Date.prototype.toDayString = function() {
    var day = this.getDay();
    
    if(day == 0) return 'Sunday';
    if(day == 1) return 'Monday';
    if(day == 2) return 'Tuesday';
    if(day == 3) return 'Wednesday';
    if(day == 4) return 'Thursday';
    if(day == 5) return 'Friday';
    
    return 'Saturday';
}

Date.nowPlusDays = function(days) {
    var date = new Date();
    
    return new Date(date.setDate(date.getDate() + parseInt(days)));
}

Date.currentDate = function() {
    return new Date().toMyDateString();
}

Date.currentTime = function() {
    return new Date().toMyTimeString();
}

Date.currentDateTime = function() {       
    return Date.currentDate() + "-" + Date.currentTime();
}

Date.daysBetween = function(date1, date2 ) {   
    var one_day_ms    = 1000*60*60*24;
    var date1_ms      = date1.getTime();
    var date2_ms      = date2.getTime();
    var difference_ms = Math.abs(date2_ms - date1_ms);
    
    return Math.floor(difference_ms/one_day_ms); 
 } 