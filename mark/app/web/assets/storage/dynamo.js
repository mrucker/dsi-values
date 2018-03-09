function dynamoBatchGet(tableName, keys) {
    
    var requestItems  = {};
    var requestObject = {'RequestItems':addRequestItem(requestItems, tableName, keys)};
    
    return new Promise(function(resolve, reject) {
        console.log('queried ' + tableName)
        new AWS.DynamoDB().batchGetItem(requestObject, function(err, response) {
            if(err) {
                reject(err);
            }
            else {
                resolve(response.Responses[tableName]);
            }
        });
        
    });
}

function addRequestItem(requestItems, tableName, keys) {
    
    requestItems[tableName] = {'Keys': keys};

    return requestItems;
}