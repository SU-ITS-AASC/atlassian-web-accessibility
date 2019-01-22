/**
 * Utility functions used by pushed-navigation.js to check if popstate or hashchange events (used by IE9) should be
 * ignored and handled by the previewer.  If we do not filter out the events related to previewer URLs then we can
 * get undesirable page refreshes when navigating through or closing the Confluence previewer.
 *
 * @module confluence-quick-edit/view-content/pushed-navigation-util
 */
define('confluence-quick-edit/view-content/pushed-navigation-util', [
    'ajs',
    'jquery',
    'window'
], function(
    AJS,
    $,
    window
) {
    "use strict";

    var previousHash = window.location.hash;
    var previousSearch = window.location.search;

    function isPreviewerHash(hash) {
        return hash && hash.indexOf('#!') === 0;
    }

    function hasPreviewerParam(search) {
        var regex = RegExp('[?&]preview=([^&]*)');
        return regex.test(search);
    }

    function isInEditPage() {
        return AJS.Rte && AJS.Rte.getEditor() && !!$('#editpageform').length;
    }

    return {

        isInEditPage: isInEditPage,

        filterPreviewHashChange: function() {
            var proceed = isInEditPage() ||
                          window.history.pushState ||
                         (!isPreviewerHash(window.location.hash) && !isPreviewerHash(previousHash));

            previousHash = window.location.hash;

            return proceed;
        },

        filterPreviewNavigationEvent: function() {
            var proceed = isInEditPage() ||
                          (!hasPreviewerParam(window.location.search) && !hasPreviewerParam(previousSearch));

            previousSearch = window.location.search;

            return proceed;
        }
    };

});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-quick-edit/view-content/pushed-navigation-util', 'Confluence.Editor.PushedNavUtil');
