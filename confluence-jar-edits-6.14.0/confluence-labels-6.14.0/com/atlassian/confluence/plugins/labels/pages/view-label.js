/**
 * @module confluence-labels/labels/pages/view-label
 */
define('confluence-labels/labels/pages/view-label', [
    'jquery'
], function(
    $
) {
    "use strict";

    return function () {
        $("#view-all-content-with-label").click(function () {
//        window.location = Confluence.getContextPath() + "/label/" +
            return false;
        });
    };
});

require('confluence/module-exporter').safeRequire('confluence-labels/labels/pages/view-label', function(ViewLabel) {
    require('ajs').toInit(ViewLabel);
});
