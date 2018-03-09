function googleSignIn() {
    return gapi.auth2.getAuthInstance().currentUser.get();
}

function googleSignOut() {
    gapi.auth2.getAuthInstance().signOut();
}