function getAlgorithmSelected() {
    return $('#algorithmSelector').val();
}

function getAlgorithmSelector() {
    
    return '<select id="algorithmSelector">' 
         +    '<option value="0">Random Selection</option>'
         +    '<option value="1">Linear Projection</option>'
         +    '<option value="2">Kernel Projection</option>'
         + '</select>';
}

function setAlgorithmSelector(callback) {
    $('#algorithmSelector').on('change', callback);
}

function updateAlgorithmSelector(data){
    
    Session.getAlgorithm().then(function(algorithm) {
        $('#algorithmSelector').val(algorithm);
    });
    
    return data;
}