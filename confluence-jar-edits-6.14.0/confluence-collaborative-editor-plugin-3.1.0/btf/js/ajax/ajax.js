define('confluence-collaborative-editor-plugin/btf/ajax/ajax', [
    'ajs'
], function (AJS) {
    /**
     * Function to run on a fail callback
     * @param {object} response The response from the server
     * @private
     */
    function _failHandler(response) {
        if (response.status === 401) {
            return window.location.reload();
        }

        AJS.flag({
            type: 'error',
            close: 'manual',
            title: AJS.I18n.getText('collab.admin.btf.error.unexpected.title'),
            body: AJS.I18n.getText('collab.admin.btf.error.unexpected.body')
        });
    }

    /**
     * Ajax wrapper functions that handles failures gracefully.
     */
    return {
        ajax: function (options) {
            return AJS.$.ajax(options).fail(_failHandler);
        },
        get: function (url) {
            return AJS.$.get(url).fail(_failHandler);
        }
    }
});