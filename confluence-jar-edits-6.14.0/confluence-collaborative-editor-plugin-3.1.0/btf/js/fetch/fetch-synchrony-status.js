define('confluence-collaborative-editor-plugin/btf/fetch/fetch-synchrony-status', [
    'ajs',
    'confluence-collaborative-editor-plugin/btf/ajax/ajax'
], function (AJS,
             Ajax) {
    var ENDPOINT = AJS.contextPath() + '/rest/synchrony-interop/synchrony-status';

    /**
     * Fetches the status of Synchrony
     */
    return function getStatus() {
        var deferred = AJS.$.Deferred();
        Ajax.get(ENDPOINT).done(function (data) {
            deferred.resolve(data);
        }).fail(function () {
            // Fallback
            deferred.resolve({status: 'stopped'});
        });
        return deferred.promise();
    }

});