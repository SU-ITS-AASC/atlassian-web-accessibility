/**
 * @module conf/confluence-drag-and-drop/drag-and-drop-overlay
 */
define("confluence-drag-and-drop/drag-and-drop-overlay", [
    "ajs",
    "jquery"
], function (
    AJS,
    $
){
    "use strict";

    var $globalOvl;

    function getDragOverlay() {
        if (!$globalOvl) {
            var div = AJS.DragAndDrop.Templates.dragOverlay();
            $globalOvl = $(div);
        }

        return $globalOvl;
    }

    function showDragOverlay($el, isTransparent, zIndex) {
        var $ovl = getDragOverlay();

        if ($ovl.parent()[0] !== $el[0]) {
            // display overlay in a small area: quick comment, inline comment and file annotation comment.
            var isInSmallArea = $el.closest('.quick-comment-container, .ic-container, .cp-editor').length > 0;
            $ovl.toggleClass("dnd-small", isInSmallArea);

            var $message = $ovl.find('.overlay-center p');
            if (isInSmallArea) {
                $message.text(AJS.I18n.getText('dnd.drop.zone.overlay.text.short'));
            } else {
                $message.text(AJS.I18n.getText('dnd.drop.zone.overlay.text'));
            }

            $ovl.toggleClass("dnd-overlay-transparent", isTransparent);
            // overlay fills the padding area of the target element
            var elStyle = getComputedStyle($el[0]);

            $ovl.css({"z-index": zIndex});

            $ovl.css({
                "margin-left": "-" + elStyle.paddingLeft,
                "margin-top": "-" + elStyle.paddingTop,
                width: $el.innerWidth() + "px",
                height: $el.innerHeight() + "px"
            }).prependTo($el);

            // those events were ideally bound in #getDragOverlay(), but it somehow didn't work
            // so we bind it here
            $ovl.off("dragleave").on("dragleave", function(e) {
                // WebKit doesn't populate relatedTarget
                if (!e.relatedTarget || !$.contains($ovl[0], e.relatedTarget)) {
                    $ovl.remove();
                }
            });

            $ovl.off("drop").on("drop", function() {
                $ovl.remove();
            });
        }
    }

    /**
     * Show file drag drop overlay whenever files are dragged over element(s)
     *
     * @param {Object} [options] has attributes bellow
     * @param {jQuery element(s)} [options.$dragZone] that triggers overlay when files are dragged over. Can be more than 1 element,
     * in case the elements are overlapped (like in the page editor).
     * @param {jQuery element(s)} [options.$overlayZone] position overlay on top of this jQuery element. If $dragZone is an editable iframe, then
     * $overlayZone should be the wrapper div of that iframe. Normally, this param is left undefined, default to the
     * first element in $dragZone.
     * @param {Boolean} [isTransparent=false] if it is true, the blanket is transparent and the center message box is moved to top
     * of overlay.
     * @param {Integer} [zIndex=1] defines which layer drag over should be put.
     */
    function bindFileDragOverlay(options) {
        var $dragZone = options.$dragZone;
        var $overlayZone = options.$overlayZone || $dragZone.eq(0);
        var isTransparent = options.isTransparent || false;
        var zIndex = options.zIndex || 1;

        $dragZone.on("dragover", function(e) {
            var dragTypes = e.originalEvent.dataTransfer.types;
            if ($.inArray("Files", dragTypes) !== -1 // also true when dragging web images in FF, so next test
                && (!$.browser.mozilla || $.inArray("application/x-moz-file", dragTypes) !== -1)) {
                showDragOverlay($overlayZone, !!isTransparent, zIndex);
            }
        });
    }

    return {
        bindFileDragOverlay: bindFileDragOverlay
    };

});