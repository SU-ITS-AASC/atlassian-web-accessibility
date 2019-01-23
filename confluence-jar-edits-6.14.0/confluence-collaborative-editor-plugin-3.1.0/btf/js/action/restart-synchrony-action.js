define('confluence-collaborative-editor-plugin/btf/action/restart-synchrony-action', [
    'ajs',
    'confluence-collaborative-editor-plugin/btf/ajax/ajax'
], function (AJS,
             Ajax) {
    var ENDPOINT = AJS.contextPath() + '/rest/synchrony-interop/restart';

    /**
     * Sends a request to the server to restart synchrony.
     */
    return function restartSynchrony() {
        return Ajax.ajax({
            type: 'POST',
            url: ENDPOINT,
            data: JSON.stringify({atl_token: AJS.Meta.get('atl-token')}),
            contentType: 'application/json',
            dataType: 'json'
        });
    }
});