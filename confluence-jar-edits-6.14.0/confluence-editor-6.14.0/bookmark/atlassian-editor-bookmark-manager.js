/**
 * @module confluence-editor/atlassian-editor-bookmark-manager
 */
define('confluence-editor/atlassian-editor-bookmark-manager', [
    'tinymce',
    'ajs'
], function(
    tinyMCE,
    AJS
) {
    "use strict";

    var bookmark;

    return {

        /**
         * Stores the currently selected range and scroll position of the editor so we can get back to to it later using
         * restoreBookmark.
         */
        storeBookmark : function() {
            var editor = tinyMCE.activeEditor;
            var vp = tinyMCE.DOM.getViewPort(tinyMCE.activeEditor.getWin());
            var selection;
            var rng;
            var rngCopy;

            // The editor (iframe) should be given focus at this point to ensure browsers (like IE8) can retrieve the selection.
            // See CONFDEV-2454
            editor.focus();
            //ensure the focus doesn't throw off scroll position in IE.
            selection = editor.selection;
            rng = selection.getRng();

            if (rng.cloneRange && typeof rng.cloneRange === "function") {
                rngCopy = rng.cloneRange();
            } else {
                // If an IE TextRange make a copy, else it will be an IE IHTMLControlRange so store it directly as it can't
                //  be copied.
                rngCopy = rng.duplicate && rng.duplicate() || rng;
            }

            bookmark = {
                scrollX : vp.x,
                scrollY : vp.y,
                range : rngCopy
            };
            AJS.log("Storing bookmark");
            AJS.log(bookmark);
        },

        /**
         * Moves the scroll position and selected range in the editor back to where it used to be based on the
         * last call to storeBookmark.
         */
        restoreBookmark : function() {
            var selection = tinyMCE.activeEditor.selection;
            var win = tinyMCE.activeEditor.getWin();

            AJS.log("Restoring bookmark");
            AJS.log(bookmark);
            if (bookmark) {
                win.scrollTo(bookmark.scrollX, bookmark.scrollY);
                win.focus();
                selection.setRng(bookmark.range);
            }
            bookmark = null;
        }
    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/atlassian-editor-bookmark-manager', 'AJS.Rte.BookmarkManager');