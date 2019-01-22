/**
 * @module confluence-quick-edit/handlers/view
 */
define('confluence-quick-edit/handlers/view', [
    'jquery',
    'ajs',
    'window'
], function ($, AJS, window) {
    'use strict';

    return function () {
        var viewPort;
        if (sessionStorage.viewPort) {
            viewPort = JSON.parse(sessionStorage.viewPort);
        }
        if (viewPort && viewPort.pageId == AJS.params.pageId) {
            var $element;
            var $mainContent = $('#main-content');
            var $header = $('#header');

            if (viewPort.blockIndex !== -1) { // Page has page layout
                // Get page layout column jQuery element in viewport by using its index
                var $columns = $mainContent.children().first().children().eq(viewPort.blockIndex).find('.innerCell');
                // Get jQuery element in viewport by using its index
                $element = $columns.eq(viewPort.columnIndex).children().eq(viewPort.index);
            } else { // Page without page layout
                $element = $mainContent.children().eq(viewPort.index);
            }

            // Scroll to the above element position
            window.scrollTo(0, $element.offset().top + viewPort.offset - $header.outerHeight());
        }

        delete sessionStorage.viewPort;
    };
});

require('confluence/module-exporter').safeRequire('confluence-quick-edit/handlers/view', function (ViewHandler) {
    require('ajs').toInit(ViewHandler);
});