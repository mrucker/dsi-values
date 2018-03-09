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