/**
 * @module confluence-drag-and-drop/view-content-attachments-client
 */
define('confluence-drag-and-drop/view-content-attachments-client', [
    'ajs'
], function(
    AJS
) {
    "use strict";

    return function($) {
        AJS.DragAndDropUtils.enableDropZoneOn($("body")[0]);
    };
});

require('confluence/module-exporter').safeRequire('confluence-drag-and-drop/view-content-attachments-client', function(ViewContentAttachmentsClient) {
    require('ajs').toInit(ViewContentAttachmentsClient);
});

