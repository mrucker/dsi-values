function cognitoSync(datasetName) {
    
    return new Promise(function(resolve, reject) {
        callback = {
            onSuccess : function(dataset, updates) { console.log("cognitoSynced"); resolve(); },
            onFailure : function(err) { reject(err); },
            onConflict: cognitoConflict
        };
        
        console.log("cognitoSyncing");
        AWS.config.credentials.get(function() {
            new AWS.CognitoSyncManager().openOrCreateDataset(datasetName, function(err, dataset) {
                dataset.synchronize(callback);
            });
        });
    });
}

function cognitoGetAll(datasetName) {
    
    return new Promise(function(resolve, reject) {
        AWS.config.credentials.get(function() {
            new AWS.CognitoSyncManager().openOrCreateDataset(datasetName, function(err, dataset) {
                dataset.getAllRecords(function(err, records) {
                    if(err) reject(err);                    
                    else resolve(records.filter(function(r) { return r.value != ''; }).map(function(r) { return JSON.parse(r.value); }));
                });
            });
        });
    });
}

function cognitoGetKey(datasetName, key) {
    
    return new Promise(function(resolve, reject) {
        AWS.config.credentials.get(function() {
            new AWS.CognitoSyncManager().openOrCreateDataset(datasetName, function(err, dataset) {
                dataset.get(key, function(err, value) {
                    if(err) reject(err); else resolve(value);
                });
            });
        });
    });
}

function cognitoPut(datasetName, key, value) {

    return new Promise(function(resolve, reject) {
        AWS.config.credentials.get(function() {
            new AWS.CognitoSyncManager().openOrCreateDataset(datasetName, function(err, dataset) {
                dataset.put(key, value, function(err, record) {
                    if(err) reject(err); else resolve(record);
                });
            });
        });
    });

}

function cognitoRemove(datasetName, key) {

    return new Promise(function(resolve, reject) {
        AWS.config.credentials.get(function() {
            new AWS.CognitoSyncManager().openOrCreateDataset(datasetName, function(err, dataset) {
                dataset.remove(key, function(err, record) {
                    if(err) reject(err); else resolve(record);
                });
            });
        });
    });
}

function cognitoConflict(dataset, conflicts, callback) {
    var resolved = [];
    
    for (var i=0; i<conflicts.length; i++) {

        // Take remote version.
        //resolved.push(conflicts[i].resolveWithRemoteRecord());

        // Or... take local version.
        resolved.push(conflicts[i].resolveWithLocalRecord());

        // Or... use custom logic.
        // var newValue = conflicts[i].getRemoteRecord().getValue() + conflicts[i].getLocalRecord().getValue();
        // resolved.push(conflicts[i].resolveWithValue(newValue);

    }

    dataset.resolve(resolved, function() {
        console.log("cognitoSynced");
        return callback(true);
    });
}