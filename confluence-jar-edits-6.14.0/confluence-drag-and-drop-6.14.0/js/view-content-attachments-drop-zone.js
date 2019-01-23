/**
 * @module confluence-drag-and-drop/view-content-attachments-drop-zone
 */
define('confluence-drag-and-drop/view-content-attachments-drop-zone', [
    'ajs'
], function(
    AJS
) {
    "use strict";

    return function($) {

        var $extensionContainer = $("#extension-container");
        if ($extensionContainer.length) {

            var $dropZone = $(AJS.DragAndDrop.Templates.dropZone());
            $extensionContainer.append($dropZone);

            /**
             * IE fires dragenter and dragleave continuously when the user's mouse is over the drop target producing a flickering effect.
             * (the highlight class being toggled rapidly). The other unwanted side effect is crashing IE due to the memory
             * consumed from binding callbacks continously.
             */
            if (!$.browser.msie) {
                AJS.DragAndDropUtils.bindDragEnter($dropZone[0], function () {
                    $dropZone.addClass("drop-zone-on-hover");
                });
                AJS.DragAndDropUtils.bindDragOver($dropZone[0], function () {
                    $dropZone.addClass("drop-zone-on-hover");
                });
                AJS.DragAndDropUtils.bindDragLeave($dropZone[0], function () {
                    $dropZone.removeClass("drop-zone-on-hover");
                });
            }

        }
    };
});

require('confluence/module-exporter').safeRequire('confluence-drag-and-drop/view-content-attachments-drop-zone', function(ViewContentAttachmentsDropZone) {
    require('ajs').toInit(ViewContentAttachmentsDropZone);
});
