//THIS IS CORRECTLY HITTING THEIR API. THE PROBLEM IS THAT MY KEY STATUS IS IN WAITING.
//FROM THE FOLLOWING POST I DON'T THINK THEY'll EVER ACTIVATE THE KEY (http://takeip.com/how-to-use-fandango-apis.html)
//BULK OF THIS CODE COMES FROM (https://developer.fandango.com/API__Sample_Code_nodejs)

function Fandango() {

    var apiKey       = '';
    var sharedSecret = '';
    var baseURI      = 'https://api.fandango.com'
    var apiVersion   = '2';

    this.test = function () { getResponseFromParameters("zipcode=22903&startDateTime='2018-02-15'"); };

    function stringFormat(s) {
        
        i = arguments.length;
        
        while ((--i) != 0) {
            s = s.replace(new RegExp('\\{' + (i-1) + '\\}', 'gm'), arguments[i]);
        }
        return s;
    }

    function sha256Encode(stringToEncode) {
        
        //node.js version; note this is a synchronous method/hash
        //var crypto = require('crypto');
        //var result = crypto.createHash('sha256').update(stringToEncode).digest('hex');
        //return result;
        
        //browser version; note this is an asynchronous method/hash
        var buffer = new TextEncoder("utf-8").encode(stringToEncode);
        return crypto.subtle.digest("SHA-256", buffer).then(function (hash) { return toHex(hash); });   
    }

    function buildAuthorizationParameters() {
        
        var seconds        = Math.floor(new Date() / 1000);
        var paramsToEncode = apiKey + sharedSecret + seconds;
        
        //node.js version
        //var encodedParams = sha256Encode(paramsToEncode);
        //var result = stringFormat('apikey={0}&sig={1}', apiKey, encodedParams);
        
        //browser version
        result = sha256Encode(paramsToEncode).then(function(encodedParams) { return stringFormat('apikey={0}&sig={1}', apiKey, encodedParams) });
        
        return result;
    }

    function getResponseFromParameters(parameters, serverRes) {
        
        //node.js version
        //var authorizationParameters = buildAuthorizationParameters();    
        //var requestUri = stringFormat('{0}/v{1}/?{2}&{3}', baseUri, apiVersion, parameters, authorizationParameters);
        //var http = require('http');
        //var response = '';
        
        //http.get(requestUri, function(apiRes) {
        //         apiRes.on('data', function(data) {
        //                response += data;
        //                });
        //         
        //         apiRes.on('end', function() {
        //                   serverRes.end(response);
        //                });
        //         });
        
        //browser version
        buildAuthorizationParameters().then(function(authorizationParameters){
            
            var requestUri = stringFormat('{0}/showtimes/v{1}/?{2}&{3}', baseUri, apiVersion, parameters, authorizationParameters);
            
            $.ajax({
                url        : requestUri,
                method     : "GET",
                contentType: "text/plain"
            });
        });
        
        return 'done';
    }

    function toHex(buffer) {
      
      var hexCodes = [];
      var view = new DataView(buffer);
      
      for (var i = 0; i < view.byteLength; i += 4) {
        // Using getUint32 reduces the number of iterations needed (we process 4 bytes each time)
        var value = view.getUint32(i)
        // toString(16) will give the hex representation of the number without padding
        var stringValue = value.toString(16)
        // We use concatenation and slice for padding
        var padding = '00000000'
        var paddedValue = (padding + stringValue).slice(-padding.length)
        
        hexCodes.push(paddedValue);
      }

      // Join all the hex strings into one
      return hexCodes.join("");
    }

}
