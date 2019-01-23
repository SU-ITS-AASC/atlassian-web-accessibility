define('confluence-collaborative-editor-plugin/btf/fetch/fetch-synchrony-configuration', [
    'ajs',
    'confluence-collaborative-editor-plugin/btf/ajax/ajax'
], function (AJS,
             Ajax) {
    var ENDPOINT = AJS.contextPath() + '/rest/synchrony-interop/configuration';
    var promise;

    /**
     * Fetches the current Synchrony configuration
     */
    return function getConfiguration() {
        // Cache for page life since these don't change without a restart of Confluence
        if (promise) {
            return promise;
        }
        promise = AJS.$.Deferred();
        Ajax.get(ENDPOINT).done(function (data) {
            promise.resolve(data);
        });
        return promise.promise();
    }
});
