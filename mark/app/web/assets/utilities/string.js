String.prototype.compare = function(str) {
    if(this == str) return 0;
    if(this <  str) return -1;
    if(this >  str) return 1;
}