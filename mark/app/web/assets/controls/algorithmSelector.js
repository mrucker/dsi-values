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

function updateAlgorithmSelector(){
    
    Session.getAlgorithm().then(function(algorithm) {
        $('#algorithmSelector').val(algorithm);
        updateAlgorithmSelectorMenu();
    });

}

function updateAlgorithmSelectorMenu() {
    $('#RewardFeedback').remove();
    
    if(getAlgorithmSelected() != 0) {
        $('#toolbar .left' ).append('<button id="RewardFeedback"> Feedback </button>');
    }
}