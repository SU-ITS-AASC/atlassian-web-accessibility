/**
 * @module confluence-drag-and-drop/image-dialog-drop-zone
 */
define('confluence-drag-and-drop/image-dialog-drop-zone', [
    'ajs',
    'confluence/legacy'
], function(
    AJS,
    Confluence
) {
    "use strict";

    return function ($) {

        // CONF-17781: If creating content for an anonymous user, don't display
        if (!(AJS.Meta.get('remote-user'))) {
            AJS.debug("Skipping image attachment drop-zone for anonymous user creating new content");
            return;
        }

        var attachmentPanelComponent = Confluence.Editor.ImageDialog.findPanelComponentById("attachments");
        if (!attachmentPanelComponent) {
            // Fairly unlikely to ever happen...
            AJS.log("Skipping image attachment drop-zone - no Image Dialog attachment panel");
            return;
        }

        $(attachmentPanelComponent).bind('afterThumbnail', function(event, imageContainer) {

            if (imageContainer.find(".image-dialog-drop-zone-container").length) {
                // drag-and-drop zone already created and not removed (e.g. on search panel)
                return;
            }

            // Create a fake 'attached-image' with a drop-zone to be added to the start of the attached-images container.
            var fauxImage = $('<li/>').addClass("attached-image");
            var dropContainer = $('<div/>').addClass("image-dialog-drop-zone-container image-container");
            $('<div/>').addClass("drop-zone-image").attr("title", AJS.I18n.getText("dnd.drop.zone.text")).appendTo(dropContainer);
            $('<div/>').addClass("drop-zone-text").text(AJS.I18n.getText("dnd.drop.here")).appendTo(dropContainer);
            dropContainer.appendTo(fauxImage);
            imageContainer.prepend(fauxImage);

            if (!$.browser.msie) {
                AJS.DragAndDropUtils.bindDragEnter(dropContainer[0], function () {
                    dropContainer.addClass("drop-zone-on-hover");
                });
                AJS.DragAndDropUtils.bindDragOver(dropContainer[0], function () {
                    dropContainer.addClass("drop-zone-on-hover");
                });
                AJS.DragAndDropUtils.bindDragLeave(dropContainer[0], function () {
                    dropContainer.removeClass("drop-zone-on-hover");
                });
            }
        });
    };
});

require('confluence/module-exporter').safeRequire('confluence-drag-and-drop/image-dialog-drop-zone', function(ImageDialogDropZone) {
    require('ajs').toInit(ImageDialogDropZone);
});
