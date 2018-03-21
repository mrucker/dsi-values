Promise.prototype.thenSleepFor = function(milliseconds) {
    return this.then(function(data) { return new Promise(function(resolve,reject) { setTimeout(function(){ resolve(data); }, 100); }); } );
};

        