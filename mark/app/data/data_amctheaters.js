//I CAN'T GET THIS TO WORK. IT DOESN'T WORK IN BROWSER BECAUSE THE SERVERS DON't SUPPORT THE 'OPTIONS' VERB.
//I CAN'T GET THIS TO WORK WITH CURL BECAUSE I KEEP GETTING A 403 FORBIDDEN
//  curl.exe -v "https://api.amctheatres.com/v2/theatres/amc-studio-30" --header "X-AMC-Vendor-Key: 7900EC65-85E1-4652-95D3-14F444F4211B"

function AMCtheaters() {

    var apiKey     = "7900EC65-85E1-4652-95D3-14F444F4211B";
    var apiVersion = '2';
    var baseURI    = 'https://api.amctheatres.com'
    
    
    this.test = function () {
        $.ajax({
            url        : baseURI + "/v" + apiVersion + "/movies",
            method     : "GET",
            contentType: "text/plain",
            headers    : {"X-AMC-Vendor-Key": apiKey}
        });
    };
}