function amazonGoogleUserSignIn(googleUser) {
    var token = googleUser.getAuthResponse().id_token;
    var email = googleUser.getBasicProfile().getEmail();
    var login = {'accounts.google.com': token };
    
    return amazonSignIn(email, login);
}

function amazonSignIn(email, login) {
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
      Logins: login,
      //{
        //'graph.facebook.com': 'FBTOKEN',
        //'www.amazon.com': 'AMAZONTOKEN',
        //'accounts.google.com': googleToken,
        //'api.twitter.com': 'TWITTERTOKEN',
        //'www.digits.com': 'DIGITSTOKEN'
      //},

      // optional name, defaults to web-identity
      // See the RoleSessionName param for AWS.STS.assumeRoleWithWebIdentity (linked below)
      RoleSessionName: 'web',

      // optional, only necessary when application runs in a browser
      // and multiple users are signed in at once, used for caching
      LoginId: email
    });
    
    //See use case 17 in this readme (https://github.com/aws/aws-amplify/tree/master/packages/amazon-cognito-identity-js);
    return new Promise(function(resolve, reject) {
        AWS.config.credentials.refresh(function(error) {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

function amazonSignOut() {
    new AWS.CognitoSyncManager().wipeData();
    AWS.config.credentials = null;
}