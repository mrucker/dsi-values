function getAlgorithmSelected() {
    return $('#algorithmSelector').val();
}

function getAlgorithmSelector() {
    
    return '<select id="algorithmSelector">' 
         +    '<option value="0">Random Selection</option>'
         +    '<option value="1">Kernel Projection</option>'
         + '</select>';
}