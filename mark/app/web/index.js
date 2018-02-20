$(document).ready( function () {
    AWS.config.region = 'us-east-1';
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
    
    $("#toolbar .left" ).html('<a href="#"> Ethical Recommendations </a>');
    $("#toolbar .right").html('<a href="#" onclick="onSignOut();">Sign out</a>');
    
    $("#splash").css("display","none");
};

function onSignOut() {    
    gapi.auth2.getAuthInstance().signOut().then(function () { console.log('User signed out.'); });
    
    $("#toolbar .left" ).html('');
    $("#toolbar .right").html('');
    
    $("#splash").css("display","block");
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