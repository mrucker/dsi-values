function getRefreshButton() {
    return '<button id="recommend-refresh" class="ui-button" title="Refresh"><span class="ui-icon ui-icon-refresh"></span></button>';
}

function setRefreshButton(callback) {
    $('#recommend-refresh').on('click', callback);
}