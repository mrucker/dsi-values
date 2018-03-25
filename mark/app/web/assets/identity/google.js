// https://developers.google.com/api-client-library/javascript/samples/samples#authorizing-and-making-authorized-requests

function googleSignIn() {
    if(gapi.auth2.getAuthInstance().currentUser.get().isSignedIn()) {
        return Promise.resolve(gapi.auth2.getAuthInstance().currentUser.get());
    }
    else {
        return gapi.auth2.getAuthInstance().signIn();
    }
}

function googleSignOut() {
    gapi.auth2.getAuthInstance().signOut();
}