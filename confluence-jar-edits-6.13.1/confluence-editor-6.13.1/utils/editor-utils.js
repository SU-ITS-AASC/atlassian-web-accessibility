/**
 * @module confluence-editor/utils/editor-utils
 */
define('confluence-editor/utils/editor-utils', [
    'jquery',
    'tinymce'
], function(
    $,
    tinymce
) {
    "use strict";

    /**
     * EditorUtils to encapsulate useful and often repeated logic for editor operations (e.g. cursor logic).
     */
    var SHALLOW = true;

    function isEmptyTextNode(node) {
        return node && node.nodeType === 3 && node.nodeValue.length === 0;
    }

    var that = {
        /**
         * Returns true if the cursor is at the start and there are no previous siblings within the specified context.
         *
         * @param node (required) a DOM element
         * @param range (required) the range
         */
        isCursorAtStartOf: function (node, range) {
            return range.collapsed && that.isRangeAtStartOf(node, range);
        },

        /**
         * "Start Of" is defined as: if there is no element preceeding where the range begins (in the context or confines of the specified node)
         *
         * This can be used for collpased or non-collapsed ranges.
         *
         * @param node the node
         * @param range the range
         */
        isRangeAtStartOf: function (node, range) {
            if (!range || !range.startContainer) {
                throw new Error("range is invalid. received: " + range);
            }

            if (!node || !node.nodeType) {
                throw new Error("context is invalid. received: " + node);
            }

            var startContainer = range.startContainer;
            var nodeAfterCursor;

            if (startContainer.nodeType === 3) {
                if (range.startOffset !== 0) { // cursor is not at the start of the text node
                    return false;
                }

                nodeAfterCursor = startContainer;
            } else {
                nodeAfterCursor = startContainer.childNodes[range.startOffset];

                //CONF-32529:
                //nodeAfterCursor === undefined when startContainer has no child
                //or actually there is no element after cursor
                if (nodeAfterCursor === undefined &&
                    startContainer.childNodes.length > 0) {
                    //mean that there is at least one element before the current range
                    return false;
                }
            }

            var walker = new tinymce.dom.TreeWalker(nodeAfterCursor, node);
            var nodeBeforeCursor;

            /**
             * Skip past any empty text nodes (text nodes with nodeValue of length 0).
             */
            do {
                nodeBeforeCursor = walker.prev(SHALLOW);
            } while (isEmptyTextNode(nodeBeforeCursor))

            return nodeBeforeCursor === undefined;
        },

        /**
         * Returns true if the cursor is at the end and there are no next siblings within the specified context.
         *
         * @param node (required) a DOM node
         * @param range (required) the range
         */
        isCursorAtEndOf: function (node, range) {
            return range.collapsed && that.isRangeAtEndOf(node, range);
        },

        /**
         * "End Of" is defined as: if there is no element that comes after where the range ends (in the context or confines of the specified node)
         *
         * This can be used for collpased or non-collapsed ranges.
         *
         * @param node the node
         * @param range the range
         */
        isRangeAtEndOf: function (node, range) {
            if (!range || !range.endContainer) {
                throw new Error("range is invalid. received: " + range);
            }

            if (!node || !node.nodeType) {
                throw new Error("container is invalid. received: " + node);
            }

            var endContainer = range.endContainer;
            var nodeBeforeCursor;

            if (endContainer.nodeType === 3) {
                if (range.endOffset != endContainer.nodeValue.length) { // cursor is in the middle of the text node
                    return false;
                }

                nodeBeforeCursor = endContainer;
            } else {
                nodeBeforeCursor = endContainer.childNodes[range.endOffset === 0 ? range.endOffset : range.endOffset - 1];
            }

            var walker = new tinymce.dom.TreeWalker(nodeBeforeCursor, node);
            var nodeAfterCursor;

            /**
             * Skip past any empty text nodes (text nodes with nodeValue of length 0).
             */
            do {
                nodeAfterCursor = walker.next(SHALLOW);
            } while (isEmptyTextNode(nodeAfterCursor))

            return nodeAfterCursor === undefined
                /**
                 * Some browsers (like FF and webkit) can terminate a P with a BR element. If this is BR element is the last child
                 * and the cursor is before it, we still consider a cursor in this position to be "at the end".
                 */
                || (nodeAfterCursor.nodeName === "BR" && walker.next(SHALLOW) === undefined);
        },

        /**
         * Sets the cursor at the start of the contents of the specified element.
         *
         * If the element is a text node, the cursor will be set inside and at the beginning of the text node.
         *
         * If the element is a DOM element with child nodes, the first text node in this list of child nodes will be selected as the one to contain the cursor.
         * The cursor will be set inside and at the start of this text node.
         *
         * @param element the element
         */
        setCursorAtStartOfContents: function (element) {
            if (!element) {
                throw new Error("element is required.");
            }
            if (element.nodeType !== 1 && element.nodeType !== 3) {
                throw new Error("invalid argument: expected a DOM element or text node, got: " + element);
            }

            var editor = tinymce.activeEditor;
            var range = editor.dom.createRng();

            if ($(element).is("br, img")) {
                range.setStartBefore(element);
                range.setEndBefore(element);
                editor.selection.setRng(range);
            } else {
                editor.selection.select(element, true);
                editor.selection.collapse(true);
            }
        }
    };

    return that;

});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/utils/editor-utils', 'AJS.EditorUtils');