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