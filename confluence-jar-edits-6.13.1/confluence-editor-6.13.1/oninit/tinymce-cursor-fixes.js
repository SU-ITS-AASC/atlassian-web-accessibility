/**
 * @module confluence-editor/oninit/tinymce-cursor-fixes
 */
define('confluence-editor/oninit/tinymce-cursor-fixes', [
    "jquery",
    "tinymce",
    "ajs"
], function(
    $,
    tinymce,
    AJS
) {
    "use strict";
    //
    // This file should probably be converted into a tinymce plugin
    //

    /**
     * @return false if the table cell containing the supplied text node contains any other text nodes prior to this one.
     * If the text node is not within a table then just return true.
     */
    function isTextNodeFirstInCell(textNode) {
        if ($(textNode).closest("td").length === 0) {
            return true;
        }

        var currentContainer = textNode.parentNode;

        while (currentContainer.nodeName.toLowerCase() !== "td" ) {
            var previousTextNodes = $(currentContainer).prevAll().contents().filter(function () {
                return this.nodeType === 3;
            });

            if (previousTextNodes.length) {
                return false; // there are text nodes in the previous siblings so this node isn't first
            }

            currentContainer = currentContainer.parentNode;
        }

        return true; // we didn't find any previous text nodes within this cell
    }

    /**
     * Returns true if the cursor is at the start of the given range.
     */
    function isCursorAtStart(ed, rng, selectedNode) {
        // compareEndPoints is only supported by <= IE8
        if (rng.compareEndPoints) {
            var tempTextRange = ed.getBody().createTextRange();
            tempTextRange.moveToElementText(selectedNode);
            tempTextRange.collapse(1);
            return rng.compareEndPoints("StartToStart", tempTextRange) === 0 && isTextNodeFirstInCell(selectedNode);
        }

        if (!ed.selection.getSel().isCollapsed) {
            return false;
        }

        function isTextNodeContainingNewLineCharacter(node) {
            return node.nodeType === 3 && node.nodeValue == "\n";
        }

        var startContainer = rng.startContainer;
        if (startContainer.nodeType === 3) {
            return !startContainer.previousSibling && rng.startOffset === 0 && isTextNodeFirstInCell(startContainer);
        } else if ($(startContainer).is("p:first-child")) { // we occasionally get a range with the startContainer being a P with offset 0 when the cursor is inside <p><br/></p>
            return rng.startOffset === 0;
        } else if ($(startContainer).is(".wysiwyg-macro-body")) { // the first block element inside a macro body placeholder is always preceded by a textnode (containing a newline character) in FF and Webkit
            return rng.startOffset == 1 && isTextNodeContainingNewLineCharacter(rng.startContainer.childNodes[0]);
        }
    }
    /**
     * Returns true if the cursor is at the end of the given range.
     */
    function isCursorAtEnd(ed, rng, node) {
        // compareEndPoints is only supported by <= IE8
        if (rng.compareEndPoints) {
            var tempTextRange = ed.getBody().createTextRange();
            tempTextRange.moveToElementText(node);
            tempTextRange.collapse(0);
            return rng.compareEndPoints("EndToEnd", tempTextRange) === 0;
        }

        if (!ed.selection.getSel().isCollapsed) {
            return false;
        }

        var endContainer = rng.endContainer;
        if (endContainer.nodeType === 3) {
            return (endContainer.wholeText.length == rng.endOffset);
        }

        var elementAfterCursor = endContainer.childNodes[rng.endOffset];
        return $(elementAfterCursor).is(":last-child");
    }

    /**
     * Inserts a paragraph before/after the given element
     */
    function insertParagraph(ed, $element, insertAfter) {
        var p = ed.dom.create('p', 0, tinymce.isIE ? '&nbsp;' : '<br data-mce-bogus="1" />');

        if(insertAfter) {
            $element.after(p);
        }
        else {
            $element.before(p);
        }

        ed.selection.select(p, true);
        ed.selection.collapse();
    }

    /**
     * Returns true if the given paragraph is emtpy. It is also considered emtpy if
     * only contains a BR or a non breaking space.
     */
    function isEmptyParagraph($p) {
        var contents = $p.contents();
        if (!contents.length) {
            return true;
        }

        if (contents.length === 1) {
            if (contents.is("br")) {
                return true;
            } else if (contents.html() == "&nbsp;" || contents.text().charCodeAt(0) === 160) {
                return true;
            } else if (contents[0].nodeType === 3 && contents[0].nodeValue == AJS.Rte.HIDDEN_CHAR) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns true if the given element is the first child of the editor body
     */
    function isFirstBodyElement(ed, element) {
        return ed.getBody().firstChild == element;
    }

    /**
     * Returns true if the given element is the last child of the editor body
     */
    function isLastBodyElement(ed, element) {
        return ed.getBody().lastChild == element;
    }

    function bindCursorFixes() {
        var ed = AJS.Rte.getEditor();

        /*
         * In IE, hitting ENTER on the first paragraph inside a macro body placeholder produces a weird issue.
         * In addition to creating a new paragraph, IE adds white space ABOVE the FIRST paragraph. There is no
         * actual element there, just white space that I couldn't for the life of me remove.
         * <p>
         * Solution: don't trust IE to insert the second paragraph after the first. Intercept the ENTER key event
         * and insert one ourselves.
         */
        tinymce.isIE && ed.onKeyPress.add(function(ed, e) {
            var selection = ed.selection;
            var selectedNode = selection.getNode();

            if (e.keyCode === 13 && selectedNode.nodeName === 'P' && ed.dom.is(selectedNode, ":first-child") && tinymce.confluence.MacroUtils.isInMacro(selectedNode)) {
                var newParagraph = ed.dom.create("p", "&#x200b");
                ed.dom.insertAfter(newParagraph, selectedNode);
                selection.select(newParagraph, 1);
                selection.collapse();
                return tinymce.dom.Event.cancel(e);
            }
        });

        tinymce.isGecko && ed.onKeyPress.add(function (ed, e) {
            var selectedNode;
            var anchor;
            var rng;

            if (e.charCode == $.ui.keyCode.SPACE) {
                selectedNode = ed.selection.getNode();
                anchor = $(selectedNode).closest("a");
                rng = ed.selection.getRng();

                if (anchor.length && isCursorAtEnd(ed, ed.selection.getRng(), selectedNode)) {
                    rng.setStartAfter(anchor[0]);
                    rng.setEndAfter(anchor[0]);
                    ed.selection.setRng(rng);
                    ed.selection.collapse();
                }
            }
        });

        // Handle Enter key for blockquote and preformat.
        // - if cursor is at start of the format, insert new p before
        // - if double enter (i.e. enter on empty p) insert a new p after
        ed.onKeyPress.addToTop(function(ed, e) {
            if (e.keyCode === 13 && !e.shiftKey) {
                var selectedNode = ed.selection.getNode();
                var pre = $(selectedNode).closest("pre");

                // handle pre before blockquote, cause pre can be in a blockquote
                if(pre.length && !tinymce.confluence.MacroUtils.isInMacro(pre) && isCursorAtEnd(ed, ed.selection.getRng(), selectedNode)) {
                    insertParagraph(ed, pre, true);
                    return tinymce.dom.Event.cancel(e);
                }

                var blockquote = $(selectedNode).closest("blockquote");

                if (blockquote.length) {
                    var $p = $(selectedNode).closest("p");

                    if ($p.is(":first-child") && isCursorAtStart(ed, ed.selection.getRng(), selectedNode)) {
                        insertParagraph(ed, blockquote, false);
                        return tinymce.dom.Event.cancel(e);
                    }

                    if ($p.is(":last-child") && isEmptyParagraph($p)) {
                        ed.dom.remove($p[0], false);
                        insertParagraph(ed, blockquote, true);
                        return tinymce.dom.Event.cancel(e);
                    }
                }
            }
            return true;
        });
    }

    return {
        insertParagraph: insertParagraph,
        isCursorAtStart: isCursorAtStart,
        isCursorAtEnd: isCursorAtEnd,
        bindCursorFixes: bindCursorFixes
    };
});

require('confluence/module-exporter').safeRequire('confluence-editor/oninit/tinymce-cursor-fixes', function(tinymceCursorFixes) {
    var AJS = require('ajs');
    var $ = require('jquery');

    AJS.Rte = AJS.Rte || {};
    AJS.Rte.Cursor = AJS.Rte.Cursor || {};

    $.extend(AJS.Rte.Cursor, {
        insertParagraph: tinymceCursorFixes.insertParagraph,
        isCursorAtStart: tinymceCursorFixes.isCursorAtStart,
        isCursorAtEnd: tinymceCursorFixes.isCursorAtEnd
    });

    AJS.bind("init.rte", tinymceCursorFixes.bindCursorFixes);
});