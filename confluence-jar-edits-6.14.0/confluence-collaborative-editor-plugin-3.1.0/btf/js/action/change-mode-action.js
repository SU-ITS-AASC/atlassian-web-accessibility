define('confluence-collaborative-editor-plugin/btf/action/change-mode-action', [
    'ajs',
    'confluence-collaborative-editor-plugin/btf/ajax/ajax',
    'confluence-collaborative-editor-plugin/btf/state/state',
    'confluence-collaborative-editor-plugin/btf/static/constants'
], function (AJS,
             Ajax,
             state,
             Constant) {
    var BASE_ENDPOINT = AJS.contextPath() + '/rest/synchrony-interop';
    var ENABLE_ENDPOINT = BASE_ENDPOINT + '/enable';
    var DISABLE_ENDPOINT = BASE_ENDPOINT + '/disable';
    var LIMITED_ENDPOINT = BASE_ENDPOINT + '/limited';

    /**
     * Changes Collaborative Editing mode to ON/ENABLED
     * @returns {*}
     */
    function enable() {
        return _configureMode(Constant.COLLAB_STATUS_ENABLED);
    }

    /**
     * Changes Collaborative Editing mode to OFF/DISABLED
     * @returns {*}
     */
    function disable() {
        return _configureMode(Constant.COLLAB_STATUS_DISABLED);
    }

    /**
     * Changes Collaborative Editing mode to LIMITED
     * @returns {*}
     */
    function limited() {
        return _configureMode(Constant.COLLAB_STATUS_LIMITED);
    }

    /**
     * Abstract handler to change the status of Collaborative Editing
     * @param {string} mode Mode to set it to. One of { Constant.COLLAB_STATUS_ENABLED,
     *                          Constant.COLLAB_STATUS_DISABLED, Constant.COLLAB_STATUS_LIMITED }
     * @returns {jQuery.Deferred} with result
     * @private
     */
    function _configureMode(mode) {
        return Ajax.ajax({
            type: 'POST',
            url: _endpointSelector(mode),
            data: JSON.stringify({atl_token: AJS.Meta.get('atl-token')}),
            contentType: 'application/json',
            dataType: 'json'
        });
    }

    /**
     * Selects the correct endpoint to use based on the status we want to set Collab Editing to
     * @param {string} mode   Mode to set it to. One of { Constant.COLLAB_STATUS_ENABLED,
     *                          Constant.COLLAB_STATUS_DISABLED, Constant.COLLAB_STATUS_LIMITED }
     * @returns {string}
     * @throws An Error if the status is not understood
     * @private
     */
    function _endpointSelector(mode) {
        switch (mode) {
            case Constant.COLLAB_STATUS_ENABLED:
                return ENABLE_ENDPOINT;
            case Constant.COLLAB_STATUS_DISABLED:
                return DISABLE_ENDPOINT;
            case Constant.COLLAB_STATUS_LIMITED:
                return LIMITED_ENDPOINT;
        }
        throw new Error('What are you doing!');
    }

    return {
        enable: enable,
        disable: disable,
        limited: limited
    }
});