/**
 * @module confluence-editor/editor/atlassian-editor-content
 */
define('confluence-editor/editor/atlassian-editor-content', [
    "jquery",
    "ajs"
], function(
    $,
    AJS
) {
    "use strict";

    return {
        /**
         * Returns the offset of the element in relation to the parent frame.
         * @param element
         */
        offset: function (element) {
            var $node = $(element);
            // offset of the element in relation to the frame
            var offset = $node.offset();
            // offset of the editor
            var frame = $(AJS.Rte.getEditorFrame());
            var frameOffset = frame.offset();
            // Needed because IE doesn't like $body.scrollTop/Left()
            var frameDoc = frame[0].contentWindow.document;
            var $body = $(AJS.Rte.getEditor().getBody());
            var scrollOffset = {
                top : ($.support.boxModel && frameDoc.documentElement.scrollTop  || $body.scrollTop()),
                left : ($.support.boxModel && frameDoc.documentElement.scrollLeft  || $body.scrollLeft())
            };
            return {
                top: offset.top - scrollOffset.top + frameOffset.top,
                left: offset.left - scrollOffset.left + frameOffset.left
            };
        },

        /**
         * Returns the text currently selected in the RTE
         */
        getSelectedText : function(){
            var ed = AJS.Rte.getEditor();
            var selection = ed.selection;
            return selection.getRng().text || (selection.getSel() && selection.getSel().toString && selection.getSel().toString()) || "";
        },

        /**
         * put the text in newValue into the editor. This is called when the editor needs new
         * content -- it is *not* called to set the initial content. That should be done either by providing the
         * editor with the content as part of the initial HTML, or by calling javascript from editorOnLoad()
         * @param newValue the html to set the content to.
         */
        setHtml : function (newValue) {
            if (newValue) {
                AJS.Rte.getEditor().setContent(newValue);
            }
        },

        /**
         * @returns the current HTML contents of the editor. This *must* return a JavaScript string,
         * not a JavaObject wrapping a java.lang.String
         */
        getHtml : function () {
            return "" + AJS.Rte.getEditor().getContent();
        },

        /**
         * @returns true if there is no content (other than spaces or &nbsp;). False if there is content.
         */
        isEmpty: function() {
            var content = AJS.Rte.getEditor().getContent().replace("&nbsp;", "").replace("<br />", "");
            return $.trim(content) === "<p></p>";
        },

        /**
         * @returns true if the contents of the editor has been modified by the user since
         * the last time editorResetContentChanged()
         */
        editorHasContentChanged : function () {
            return AJS.Rte.getEditor().isDirty();
        },

        /**
         * Resets the contents change indicator
         */
        editorResetContentChanged : function () {
            AJS.Rte.getEditor().setDirty(false);
        },

        /**
         * Finds the index of the supplied childNode in the parentNode
         * @returns the index of the child node in the parent node. If the child
         * cannot be found in the parent -1 is returned.
         */
        getChildIndex: function(parentNode, childNode) {
            var children = parentNode.childNodes;
            for (var i = 0, len = children.length; i < len; i++) {
                if (children[i] == childNode) {
                    return i;
                }
            }
            return -1;
        }
    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/editor/atlassian-editor-content', 'AJS.Rte.Content');
