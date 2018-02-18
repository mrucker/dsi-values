//THIS WORKS

function Gracenote() {
    
    var apiKey     = 'e3rbxbs6mjp8mhk9wfz8e6gv';
    var baseURI    = 'https://data.tmsapi.com';
    var apiVersion = '1.1'
    
    this.test = function() {
        $.ajax({
            url        : baseURI + "/v"+ apiVersion + "/movies/showings?startDate=2018-02-15&zip=22903&api_key=" + apiKey,
            method     : "GET",
            contentType: "text/plain",
        });
    };
}