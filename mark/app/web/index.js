$(document).ready( function () {
    AWS.config.region = 'us-east-1';
    
    initMain();
    
    showSplash();
    hideMain();
});

function gapiInit() {

    // don't need this because onSignIn is called everytime
    // gapi.auth2.init().then(function(googleAuth) { 
        // var googleUser = googleAuth.currentUser.get();
        // if(googleUser.isSignedIn()) {
            // onSignIn(googleUser);
        // }
    // });
}

function onSignIn(googleUser) {
            
    setAWSCredentials(googleUser.getBasicProfile().getEmail(), googleUser.getAuthResponse().id_token);
    
    var dynamodb = new AWS.DynamoDB();
    
    dynamodb.scan({'TableName':'DSI_Theaters'}, function(err, data) {
    
    });

    showMain();
    hideSplash();
};

function onSignOut() {    
            
    gapi.auth2.getAuthInstance().signOut();
    
    hideMain();
    showSplash();
    
    return true;
}

function setAWSCredentials(loginEmail, googleToken) {
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({ 
      // either IdentityPoolId or IdentityId is required
      // See the IdentityPoolId param for AWS.CognitoIdentity.getID (linked below)
      // See the IdentityId param for AWS.CognitoIdentity.getCredentialsForIdentity
      // or AWS.CognitoIdentity.getOpenIdToken (linked below)
      //IdentityId: ''
      IdentityPoolId: 'us-east-1:6aa9214b-3ab3-4c20-b9aa-44b939e7fac6',

      // optional, only necessary when the identity pool is not configured
      // to use IAM roles in the Amazon Cognito Console
      // See the RoleArn param for AWS.STS.assumeRoleWithWebIdentity (linked below)
      //RoleArn: 'arn:aws:iam::1234567890:role/MYAPP-CognitoIdentity',

      // optional tokens, used for authenticated login
      // See the Logins param for AWS.CognitoIdentity.getID (linked below)
      Logins: {
        //'graph.facebook.com': 'FBTOKEN',
        //'www.amazon.com': 'AMAZONTOKEN',
        'accounts.google.com': googleToken,
        //'api.twitter.com': 'TWITTERTOKEN',
        //'www.digits.com': 'DIGITSTOKEN'
      },

      // optional name, defaults to web-identity
      // See the RoleSessionName param for AWS.STS.assumeRoleWithWebIdentity (linked below)
      RoleSessionName: 'web',

      // optional, only necessary when application runs in a browser
      // and multiple users are signed in at once, used for caching
      LoginId: loginEmail
    });
}

function showSplash() {
    $('#splash').css('display','block');
}

function hideSplash() {
    $('#splash').css('display','none');
}

function initMain() {
    $('#toolbar .left' ).html('<a href="https://dsi.markrucker.net" class="strong"> Ethical Recommendations </a> <span>' + getDateSelect() + '</span>');
    $('#toolbar .right').html('<a href="https://dsi.markrucker.net" class="hover" onclick="onSignOut();">Sign out</a>');
    
    getTheaters().forEach(function(theater) {
        $('#main').append('<div class="theater"><a href="' + theater.Url + '">' + theater.Name + '</a></div>')
    });
}

function showMain() {
    $("#toolbar span").css('display','inline');
    $('#main').css('display','block');
}
    
function hideMain() {
    $("#toolbar span").css('display','none');
    $('#main').css('display','none');
}

function getDateSelect() {
    
    var day0 = 'Today';
    var day1 = 'Tomorrow';
    var day2 = dayAsText(new Date().getDay() + 2);
    var day3 = dayAsText(new Date().getDay() + 3);
    var day4 = dayAsText(new Date().getDay() + 4);
    
    
    return '<select>' 
         +    '<option>' + day0 + '</option>'
         +    '<option>' + day1 + '</option>'
         +    '<option>' + day2 + '</option>'
         +    '<option>' + day3 + '</option>'
         +    '<option>' + day4 + '</option>'
         + '</select>';
        
}

function dayAsText(day) {

    day = day % 7;

    if(day == 0) return 'Sunday';
    if(day == 1) return 'Monday';
    if(day == 2) return 'Tuesday';
    if(day == 3) return 'Wednesday';
    if(day == 4) return 'Thursday';
    if(day == 5) return 'Friday';
    
    return 'Saturday';
}

function getTheaters() {
    return [ 
        {
            'Id'  : '11542',
            'Name': 'Alamo Drafthouse Cinema',
            'Url' : 'https://drafthouse.com/charlottesville'
        },
        {
            'Id'  : '11237',
            'Name': 'Violet Crown Charlottesville',
            'Url' : 'https://charlottesville.violetcrown.com/'
        },
        {
            'Id'  : '10657',
            'Name': 'Regal Stonefield Stadium 14',
            'Url' : 'https://www.regmovies.com/theaters/regal-stonefield-stadium-14-imax/C00318790965'
        }
    ];
}