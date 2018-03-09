function cognitoSync(datasetName) {
    
    return new Promise(function(resolve, reject) {
        callback = {
            onSuccess : function(dataset, updates) { resolve(); },
            onFailure : function(err) { reject(err); },
            onConflict: cognitoConflict
        };
        
        new AWS.CognitoSyncManager().openOrCreateDataset(datasetName, function(err, dataset) {
            dataset.synchronize(callback);
        });
    });
}

function cognitoGet(datasetName) {
    return new Promise(function(resolve, reject) {
        new AWS.CognitoSyncManager().openOrCreateDataset(datasetName, function(err, dataset) {
            dataset.getAllRecords(function(err, records) {
                if(err) reject(err); 
                else resolve(records.filter(function(r) { return r.value != ''; }).map(function(r) { return JSON.parse(r.value); }));
            });
        });
    });
}

function cognitoPut(datasetName, key, value) {

    return new Promise(function(resolve, reject) {
        new AWS.CognitoSyncManager().openOrCreateDataset(datasetName, function(err, dataset) {
            dataset.put(key, value, function(err, record) {
                if(err) reject(err); else resolve(record);
            });
        });
    });

}

function cognitoRemove(datasetName, key) {
    
    return new Promise(function(resolve, reject) {
        new AWS.CognitoSyncManager().openOrCreateDataset(datasetName, function(err, dataset) {
            dataset.remove(key, function(err, record) {
                if(err) {
                    reject(err); 
                }
                else {
                    resolve(record);
                }
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
        return callback(true);
    });
}