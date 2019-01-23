define('confluence-collaborative-editor-plugin/btf/fetch/fetch-collab-status', [
    'ajs',
    'confluence-collaborative-editor-plugin/btf/ajax/ajax'
], function (AJS,
             Ajax) {
    var ENDPOINT = AJS.contextPath() + '/rest/synchrony-interop/status';

    /**
     * Gets the current status of collab editing
     */
    return function getStatus() {
        var deferred = AJS.$.Deferred();
        Ajax.get(ENDPOINT).done(function (data) {
            deferred.resolve(data);
        });
        return deferred.promise();
    }
});