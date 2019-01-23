/**
 * @module confluence-editor/tinymce3/plugins/confcursortarget/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/confcursortarget/editor_plugin_src', [
    'jquery',
    'ajs',
    'tinymce',
    'confluence/meta'
], function(
    $,
    AJS,
    tinymce,
    Meta
) {
    "use strict";

    /**
     * A plugin which ensures that there is always somewhere for a user to place their cursor when editing.
     * A typical problem is when there are two macro placeholders following each other then a user is unable to
     * insert the cursor between them.
     *
     * (This functionality originally lived in tinymce-cursor.js but that isn't a TinyMCE plugin and therefore
     * doesn't bind to onSetContent early enough to do the necessary processing.)
     *
     * Copyright 2011, Atlassian
     */

    /** The jQuery selector for the blocks we are interested in fixing. */
    var blocksToFixSelector = ".wysiwyg-macro,.placeholder,table";

    return {
        cursorTarget : {
            addFixSelector: function(sel) {
                blocksToFixSelector += ',' + sel;
            }
        },
        cursorTargetPlugin : {

            /**
             * Initialises the plugin - executed after the plugin has been created.
             * This call is done before the editor instance has finished it's initialisation so use the onInit event
             * of the editor instance to intercept that event.
             *
             * @param {tinymce.Editor} ed Editor instance that the plugin is initialised in.
             * @param {string} url Absolute URL to where the plugin is located.
             */
            init : function (ed, url) {

                /**
                 * Passing true to tinymce.Editor.selection.getRng() returns a W3C range (even in IE - returns tinyMCE's implementation of w3c range over ie's textRange).
                 */
                var W3C_RANGE = true;

                var BLOCK_ELEMENT_SELECTOR = "ol, ul, p, pre, table, blockquote, div, h1, h2, h3, h4, h5, h6";
                var KEY_CODE = $.ui.keyCode;

                /**
                 * Go through the entire editor content and ensure that 'cursor target' paragraphs are added where needed.
                 */
                function addCursorTargetParagraphsToContent(dom, checkEmptiedParagraphs) {
                    $(blocksToFixSelector, dom).each(function (index, element) {
                        addSurroundingCursorTargetParagraph(element, checkEmptiedParagraphs);
                    });
                }

                /**
                 * CONFDEV-4041: Go through the entire editor content and ensure that empty paragraphs are correctly
                 * formatted for the user's browser. Note that our storage format stores empty paragraphs
                 * as <p>&nbsp;</p>, which becomes irritating to the user as there is an extra space.
                 * CONFDEV-4285: Fix spaces in empty table cells as well.
                 */
                function convertEmptyParagraphs(dom) {
                    // IE8 does not support the Gecko/Webkit compatible <p><br/></p>
                    // IE8 should be able to handle empty paragraphs like <p/> but they appear collapsed
                    // Temporary workaround is to keep empty paragraphs in IE as <p>&nbsp;</p>
                    var emptyParagraph = (tinymce.isIE) ? "&nbsp;" : "<br/>";

                    function containsSingleNbsp(element) {
                        return element && element.childNodes && element.childNodes.length === 1 && element.childNodes[0].nodeType === 3 && element.childNodes[0].nodeValue && element.childNodes[0].nodeValue.length === 1 && element.childNodes[0].nodeValue.charCodeAt(0) === 160;
                    }

                    $("p, td.confluenceTd, th.confluenceTh", dom).each(function(index, element) {
                        if (containsSingleNbsp(element)) {
                            $(element).html(emptyParagraph);
                        }
                    });
                }

                function _isCollaborativeEditingPage() {
                    return Meta.getBoolean('shared-drafts') && Meta.get('edit-mode') !== 'limited' && (Meta.get('content-type') === 'page' || Meta.get('content-type') === 'blogpost');
                }

                /**
                 * For the supplied DOM element check if it requires surrounding cursor target paragraphs added.
                 */
                function addSurroundingCursorTargetParagraph(element, checkEmptiedParagraphs) {
                    var $element = $(element);

                    function padEmptyParagraph($paragraphElement) {
                        if ($paragraphElement.length === 0) {
                            throw new Error("no paragraph element specified");
                        }
                        if (_isCollaborativeEditingPage()) {
                            $paragraphElement.addClass('auto-cursor-target');
                        }

                        var paragraphElement = $paragraphElement[0];
                        if (paragraphElement.childNodes.length === 0) {
                            paragraphElement.innerHTML = "<br />";
                        }

                        return paragraphElement;
                    }

                    function isInline(element) {
                        return !$(element).is(BLOCK_ELEMENT_SELECTOR);
                    }

                    function createCursorTargetFor(element, siblingMethod) {
                        var $cursorTarget = $("<p/>");

                        if ($(element.parentNode).is("li, td, th")) { /* CONFDEV-5521 */
                            while (element[siblingMethod] && isInline(element[siblingMethod])) {
                                $cursorTarget[siblingMethod == "previousSibling" ? "prepend" : "append"](element[siblingMethod]);
                            }
                        }

                        return padEmptyParagraph($cursorTarget);
                    }

                    if (!$element.prev().length
                            || $element.prev(blocksToFixSelector).length
                            || ($(element.parentNode).is("li, td, th") && isInline(element.previousSibling)) /* CONFDEV-5521 */) {
                        $element.before(createCursorTargetFor(element, "previousSibling"));
                    }

                    if (!$element.next().length
                            || $element.next('.synchrony-container').length /* WD-409 */
                            || ($(element.parentNode).is("li, td, th") && isInline(element.nextSibling)) /* CONFDEV-5521 */) {
                        $element.after(createCursorTargetFor(element, "nextSibling"));
                    }

                    if (_isCollaborativeEditingPage()) {
                        if ($element.next().length
                            && !$element.next().next().length // Is the next element the last element in the container?
                            && isTextContainerEmpty($element.next()[0])) {
                            $element.next().addClass("auto-cursor-target");
                        }
                    }

                    /**
                     * Cut or keyboard deleted non-collapsed selections can leave unusual structures in the browser such as
                     * a macro place holder with just an empty <br> before or after it. This function deals with the cases
                     * we have encountered and converts these cases into a "proper" cursor target paragraph.
                     *
                     * Other structures encountered are various forms of empty <p> or just multiple <br/> elements.
                     *
                     * @param $blockEl the jQuery wrapped block element to ensure is properly surrounded with cursor-target spacers
                     */
                    function checkForEmptiedParagraphs($blockEl) {

                        /**
                         * If the supplied $structure is of the required type then convert it (in place in the DOM) to
                         * being a cursor target.
                         *
                         * @param $structure
                         */
                        function convertCutStructureToCursorTarget($structure) {
                            // On Firefox you can be left with a <BR> after the cut of a "trailing" paragraph
                            if ($structure[0].nodeName === "BR" || isTextContainerEmpty($structure[0])) {
                                // replace with the correct 'empty' structure (it may already be the correct structure - no matter).
                                $structure.replaceWith(padEmptyParagraph($("<p/>")));
                            }
                        }

                        /**
                         * "is An After Cursor Target" - should the supplied node be a 'cursor target' for after a block element.
                         *
                         * If the node parameter has no next sibling OR the next sibling is a block then the node should be
                         * considered a cursor target.
                         *
                         * If the node has next siblings that are all BRs or Ps then it should also be considered a cursor target.
                         * This unusual case can arise from cut operations on non-collapsed selections in the browser.
                         *
                         * @param $node a jQuery wrapped node
                         * @return true if this node should be considered a cursor target after a block
                         */
                        function isAnAfterCursorTarget($node) {
                            var $next = $node.next();
                            while ($next.length && !$next.is(blocksToFixSelector)) {
                                var next = $next[0];
                                if (next.nodeName !== "BR" && next.nodeName !== "P") {
                                    return false;
                                }

                                $next = $next.next();
                            }

                            return true;
                        }

                        /**
                         * "is A Before Cursor Target" - should the supplied node be a 'cursor target' for before a block element.
                         *
                         * If the node parameter has no previous sibling OR the previous sibling is a block then the node should be
                         * considered a cursor target.
                         *
                         * If the node has previous siblings that are all BRs or Ps then it should also be considered a cursor target.
                         * This unusual case can arise from cut operations on non-collapsed selections in the browser.
                         *
                         * @param $node a jQuery wrapped node
                         * @return true if this node should be considered a cursor target before a block
                         */
                        function isABeforeCursorTarget($node) {
                            var $prev = $node.prev();
                            while ($prev.length && !$prev.is(blocksToFixSelector)) {
                                var prev = $prev[0];
                                if (prev.nodeName !== "BR" && prev.nodeName !== "P") {
                                    return false;
                                }

                                $prev = $prev.prev();
                            }

                            return true;
                        }

                        var $prev = $blockEl.prev();
                        if ($prev.length && isABeforeCursorTarget($prev)) {
                            convertCutStructureToCursorTarget($prev);
                        }

                        var $next = $blockEl.next();
                        if ($next.length && isAnAfterCursorTarget($next)) {
                            convertCutStructureToCursorTarget($next);
                        }
                    }

                    if (checkEmptiedParagraphs) {
                        checkForEmptiedParagraphs($element);
                    }
                }

                /**
                 * Go through the entire editor content and ensure that any empty paragraphs which are single
                 * spacers before or after block content are removed.
                 *
                 * In addition any 'cursor targets' found that are no longer empty will have their marker class removed.
                 *
                 * @param dom the dom to be modified
                 * @return the modified dom
                 */
                function processCursorTargets(dom) {
                    // now find all paragraphs and remove those that are empty and associated with a block
                    // (i.e. are cursor targets only)
                    // do this in 2 steps (mark then delete, otherwise you will end up removing all empty paragraphs on the page :))
                    $("p", dom).each(function(index, element) {
                        if (isTextContainerEmpty(element) && isCursorTarget(element)) {
                            $(element).attr("data-tag", "marked-for-deletion");
                        }
                    });
                    $("p[data-tag=marked-for-deletion]", dom).remove();

                    return dom;
                }

                /**
                 * Check the various different forms of 'empty' that can arise in TinyMCE.
                 * These 'forms of empty' have all been observed in testing. So don't just
                 * go assuming I'm mental and remove checks from here :-)
                 *
                 * Some cases that cause a "non-standard" empty paragraph -
                 * 1) Removing a selection that ranges from part way into a place holder to the end of a document will result in
                 * an 'empty' paragraph which actually contains a &nbsp; (Chrome and Firefox)
                 * 2) Removing a selection that ranges from the last paragraph on a page back to the end of a placeholder body will
                 * result in <P>&nbsp;</p> (IE8 & 9 - this is non-standard for IE).
                 * 3) The steps aren't clear, but on Chrome you can get a <p></p> which is non-standard for non IE browsers.
                 * 4) There are others I haven't pinned down yet.
                 *
                 * @param target the dom object to check.
                 * @return true if empty.
                 */
                function isTextContainerEmpty(target) {
                    /**
                     * Handles:
                     * <p> </p>
                     * <p> <br/></p>
                     * <p><br/> </p>
                     * <p> ... with multiple text nodes that are empty with at least one containing a space ... </p>
                     * <p> ... with multiple text nodes that are empty ... </p>
                     */
                    function _containsOptionalWhiteSpaceOrOptionalBr(container) {
                        var brCount = 0;
                        var whiteSpaceCount = 0;

                        for (var i = 0, l = container.childNodes.length; i < l; i++) {
                            var childNode = container.childNodes[i];
                            if (childNode.nodeName === "BR") {
                                if (++brCount > 1) {
                                    return false;
                                }
                            } else if (/^[\s|\u00A0]$/.test(childNode.nodeValue)) {
                                if (++whiteSpaceCount > 1) {
                                    return false;
                                }
                            } else if (childNode.nodeValue !== "") {
                                return false;
                            }
                        }

                        return true;
                    }

                    return target.nodeType === 1 && target.childNodes.length === 0 || _containsOptionalWhiteSpaceOrOptionalBr(target);
                }

                /**
                 * Checks if the current node is a cursor target.
                 *
                 * @param node the node to check
                 * @return true if the node is a 'cursor target' node
                 */
                function isCursorTarget(node) {
                    if (!node || node.nodeType !== 1) {
                        return false;
                    }

                    var prev = _getSiblingWithinBlockDisregardingNesting(node, false);
                    var next = _getSiblingWithinBlockDisregardingNesting(node, true);

                    var prevIsNullOrBlock = isNullOrCell(prev) || $(prev).is(blocksToFixSelector);
                    var nextIsNullOrBlock = isNullOrCell(next) || $(next).is(blocksToFixSelector);
                    var isBetweenTwoNullsOrCells = isNullOrCell(prev) && isNullOrCell(next);
                    return prevIsNullOrBlock && nextIsNullOrBlock && !isBetweenTwoNullsOrCells;
                }

                function isNullOrCell(node) {
                    if(!node) {
                        return true;
                    } else {
                        return node.className && /cell|header|footer/.test(node.className);
                    }
                }

                /**
                 * Get the next/previous sibling to the one supplied within the current block but coping with nested structures.
                 *
                 * For instance, in the case of next checking, if the current node was an <li> within a <ul> and there is no
                 * next sibling to the <li> then the parent <ul> will be checked for a next sibling instead. If there was another
                 * bullet item just after the <li> then it would be the sibling.
                 *
                 * The checking will stop once any of ".cell, .mceContentBody, td, li" are reached
                 *
                 * @param node the DOM node whose next/previous sibling you are interested in
                 * @param next if true then you want to check for the next sibling. If false then check the previous sibling.
                 * @return the next/previous sibling DOM node or null if there is none.
                 */
                function _getSiblingWithinBlockDisregardingNesting(node, next) {

                    var containerSelector = ".cell, .mceContentBody, td, li";
                    var $currentNode = $(node);

                    // Check for siblings, traversing up the tree from this node
                    do {
                        var sibling = (next) ? $currentNode[0].nextSibling : $currentNode[0].previousSibling;
                        if (sibling) { return sibling; }

                        $currentNode = $currentNode.parent();
                    } while ($currentNode.length > 0 && !$currentNode.is(containerSelector));

                    return null;
                }

                /**
                 * Returns true if the cursor is at the start of the given collapsed selection.
                 *
                 * @param ed the editor
                 * @return true if the cursor is at the start of the selection.
                 */
                function isCursorAtStartOfContainer(range) {
                    var startContainer = range.startContainer;
                    if (startContainer.nodeType === 3) {
                        // deal with un-normalized situations where there could be multiple text nodes.
                        // this can occur when for instance a paragraph and a bullet list are merged (via a delete)
                        var hasPreviousSiblingContent = startContainer.previousSibling &&
                                (startContainer.previousSibling.nodeType === 3 || $(startContainer.previousSibling).is("br"));
                        return !hasPreviousSiblingContent && range.startOffset === 0;
                    } else if (startContainer.nodeType === 1) {
                        return range.startOffset === 0;
                    }

                    return false;
                }

                /**
                 * Returns true of the cursor is at the start of the document
                 * @param range
                 */
                function isCursorAtStartOfDocument(range) {
                    var body = ed.getBody();
                    if(body.childNodes.length) {
                        return range.collapsed && range.startOffset === 0 && body.childNodes[0] == range.startContainer;
                    }
                    return false;
                }

                /**
                 * Returns true if the cursor is at the end of a given collapsed selection.
                 *
                 * @return true if the cursor is at the end of the container.
                 */
                function isCursorAtEndOfContainer(range) {
                    var startContainer = range.startContainer;
                    if (startContainer.nodeType === 3) {
                        // deal with un-normalized situations where there could be multiple text nodes.
                        // this can occur when for instance a paragraph and a bullet list are merged (via a delete)
                        var hasNextSiblingTextNode = startContainer.nextSibling &&
                                (startContainer.nextSibling.nodeType === 3 || $(startContainer.nextSibling).is("br"));
                        return !hasNextSiblingTextNode && range.endOffset == startContainer.nodeValue.length;
                    } else if (startContainer.nodeType === 1) {
                        var nodeAfterCursor = startContainer.childNodes[range.startOffset];
                        // TinyMCE uses <p><br><p> structures for empty paragraphs in some browsers
                        // In such a scenario the cursor will be just before the <br> even though that
                        // is effectively the final position in the <p>
                        if ($(nodeAfterCursor).is("br") && nodeAfterCursor.nextSibling == null) {
                            return true;
                        } else {
                            return range.endOffset == startContainer.childNodes.length;
                        }
                    }

                    return false;
                }

                /**
                 * Returns true if the supplied Element node has non-empty text nodes, not as immediate children
                 * but as a deeper descendant.
                 */
                function doesContainerHaveNestedContent(container) {
                    var children = $(container).children();
                    var i;
                    for (i = 0; i < children.length; i++) {
                        if (isTextContainerEmpty(children[i])) {
                            continue;
                        }

                        if ($(children[i]).contents().filter(function() {
                                    return this.nodeType === 3;
                                }).length || doesContainerHaveNestedContent(children[i])) {
                            return true;
                        }
                    }

                    return false;
                }

                /**
                 * Check if the current cursor position (range) is in one of the positions unique to tables
                 * of immediately before or immediately after the table (on the same 'line' as the table).
                 *
                 * @param before set true if you want to check if the cursor is before the table. If false then check
                 * if the cursor is after the table.
                 * @param range w3c range that provides the current cursor position
                 */
                function isCursorBeforeAfterTable(before, range) {
                    function _isCursorAtTable(before, range) {
                        var currentNodeIndex = range.startOffset;
                        if (!before) {
                            currentNodeIndex--;
                        }

                        return currentNodeIndex >= 0 && currentNodeIndex < range.startContainer.childNodes.length && range.startContainer.childNodes[currentNodeIndex].nodeName === "TABLE";
                    }

                    return range.startContainer == range.endContainer
                            && range.startContainer.nodeType === 1
                            && _isCursorAtTable(before, range);
                }

                function isCursorAtEndOfBottomRightCellInTable(range) {
                    if (!range.collapsed) {
                        return false;
                    }

                    var node = range.startContainer;
                    var nextSibling;

                    if (node.nodeType === 3) {
                        nextSibling = _getSiblingWithinBlockDisregardingNesting(node, true);
                        return range.startOffset == node.nodeValue.length && (nextSibling == null || $(nextSibling).is("br"));
                    } else if (node.nodeType === 1) {
                        if ($(node).is("td, th") && range.startOffset === 0 && node.childNodes.length > 0) {
                            return $(node.childNodes[0]).is("br");
                        } else {
                            var index = (range.startOffset === 0) ? 0 : range.startOffset - 1;
                            nextSibling = _getSiblingWithinBlockDisregardingNesting(node.parentNode.childNodes[index], true);
                            return nextSibling == null || $(nextSibling).is("br");
                        }
                    } else {
                        return false;
                    }
                }

                function containsSoloBrElement(element) {
                    return element && element.childNodes.length === 1 && $(element.childNodes[0]).is("br");
                }

                function shouldCancelDelete(selectedNode, range) {
                    if (tinymce.isWebKit && isCursorBeforeAfterTable(false, range)) {
                        return true;
                    } else if (tinymce.isGecko) {
                        if (isCursorAtEndOfBottomRightCellInTable(range)
                                    /* firefox 3.6 will remove <p><br/></p> and <li><br/></li> on delete */
                                || (isCursorTarget(selectedNode) && range.startOffset === 0 && containsSoloBrElement(selectedNode))) {
                            return true;
                        }
                    }

                    return false;
                }

                function shouldCancelBackspace(selectedNode, range) {
                    /**
                     * In WebKit, when you have <table></table> (or any block content), followed by say <p>foo</p>, if the cursor
                     * is inside and at the _start_ of the P element, hitting backspace will remove the table.
                     *
                     * The desired behaviour is to prevent this. Both MS Word and IE implement this.
                     */
                    if (tinymce.isWebKit &&
                            (isCursorBeforeAfterTable(true, range) ||
                            (isCursorAtStartOfContainer(range) && isCursorTarget(selectedNode)) ||
                            isCursorAtStartOfDocument(range))) {
                        return true;
                    } else if (tinymce.isGecko && isCursorAtStartOfContainer(range) && isCursorTarget(selectedNode) && containsSoloBrElement(selectedNode)) {
                        return true;
                    }

                    return false;
                }

                /**
                 * Backspace and delete suppression involves processing a few different key related events (depending on browsers)
                 * so this method centralising the processing of the events.
                 *
                 * Disallow backspace in a block if -
                 * 1) the cursor is at the start of the block AND
                 * 2) the preceding element is a  pre, div, blockquote or table AND
                 * 3) there is no following element or the following element is a pre, div, blockquote or table
                 *
                 * Disallow delete in a paragraph, pre, blockquote and div if -
                 * 1) the cursor is at the end of the paragraph (empty is a degenerative case) AND
                 * 2) the following element is a 'blocksToFixSelector'
                 *
                 * @param ed the editor firing the event being handled
                 * @param e the event itself.
                 * @return true if the event should be allowed or false if it should be suppressed
                 */
                function deleteAndBackspaceKeyHandling(ed, e) {
                    var keyCode = e.keyCode;
                    if (keyCode !== KEY_CODE.BACKSPACE && keyCode !== KEY_CODE.DELETE) {
                        return true;
                    }

                    if (!ed.selection.isCollapsed()) {
                        addCursorTargetParagraphsToContent(ed.getBody());
                    } else if (keyCode === KEY_CODE.BACKSPACE && shouldCancelBackspace(ed.selection.getNode(), ed.selection.getRng(W3C_RANGE))) {
                        tinymce.dom.Event.prevent(e);
                    } else if (keyCode === KEY_CODE.DELETE && shouldCancelDelete(ed.selection.getNode(), ed.selection.getRng(W3C_RANGE))) {
                        tinymce.dom.Event.prevent(e);
                    }

                    return true;
                }

                var addCursorTargetParagraphsToContentBinder = function() {
                    addCursorTargetParagraphsToContent(ed.getBody(), true);
                };

                var collabEditingCursorTargetRefresh = function(dom) {
                    function convertEmptyIEParagraphs(dom) {
                        var emptyParagraph = "<br />";

                        function nodeEmpty(element) {
                            // This is a relatively simple function as it only checks for IE10
                            return element && element.innerHTML === "";
                        }

                        $("p, td.confluenceTd, th.confluenceTh", dom).each(function(index, element) {
                            if (nodeEmpty(element)) {
                                $(element).html(emptyParagraph);
                            }
                        });
                    }

                    addCursorTargetParagraphsToContent(dom, false);

                    if (tinymce.isIE10) { // because IE
                        convertEmptyIEParagraphs(dom);
                    }
                };

                var isCollabEditingEnabled = function () {
                    function isOnEditScreen() {
                        // Because things like comments and inline comments also use this editor, we need more checks
                        return (AJS.Meta.get("content-type") === "page" || AJS.Meta.get("content-type") === "blog");
                    }

                    var sharedDraftsEnabled = AJS.Meta.get("shared-drafts");
                    return sharedDraftsEnabled && isOnEditScreen() && AJS.Meta.get("edit-mode") === "collaborative";
                };

                if (isCollabEditingEnabled()) {
                    AJS.bind('cursor-target-refresh', function () {
                        collabEditingCursorTargetRefresh(ed.getBody());
                    });
                } else {
                    ed.onSetContent.add(function(ed, o) {
                        addCursorTargetParagraphsToContent(ed.getBody());
                        convertEmptyParagraphs(ed.getBody());
                    });

                    ed.onGetContent.add(function(ed, args) {
                        var startRootNodeString = "<div class='root-node'>";
                        var endRootNodeString = "</div>";
                        var wrappedContent = startRootNodeString + args.content + endRootNodeString;
                        var modifiedDom = processCursorTargets($(wrappedContent));
                        var serialised = AJS.Rte.getEditor().serializer.serialize(modifiedDom[0], args);
                        // remove the root-node wrapper
                        args.content = serialised.substring(startRootNodeString.length, serialised.length - endRootNodeString.length);
                    });

                    // - Investigate: Why are we binding some editor events inside ed.onInit and some outside it ?

                    // The editor only has a selection after it has initialised so hook onto selection events on editor init.
                    // This logic is preserved for when the editor is in fallback mode
                    ed.onInit.add(function() {
                        // Insert macro, table or wiki markup all end up calling selection.setContent.
                        // We should ensure that all necessary cursor targets exist after these operations.
                        ed.selection.onSetContent.add(addCursorTargetParagraphsToContentBinder);

                        // Browser cut event
                        ed.dom.bind(ed.getBody(), "cut", addCursorTargetParagraphsToContentBinder);

                        AJS.bind('cursor-target-refresh', addCursorTargetParagraphsToContentBinder);
                    });

                    // since the editor is now reloadable we need to make sure we do some cleanup.
                    ed.onRemove.add(function(){
                        AJS.unbind('cursor-target-refresh', addCursorTargetParagraphsToContentBinder);
                    });

                    // ATLASSIAN - CONFDEV-5541 - Fix cursor position if enter / return / delete / backspace is pressed.
                    if(tinymce.isGecko) {
                        ed.onKeyDown.add(function(ed, e) {
                            if ((e.keyCode === KEY_CODE.ENTER || e.keyCode === KEY_CODE.BACKSPACE || e.keyCode === KEY_CODE.DELETE)) {
                                // Enter may be broken if the cursor is in the wrong position - fix first
                                ed.selection.normalize();
                            }
                        });
                    }

                    // Webkit will fire keyDown and keyUp for backspace and delete (even if one is suppressed).
                    ed.onKeyDown.add(deleteAndBackspaceKeyHandling);
                    ed.onKeyUp.add(deleteAndBackspaceKeyHandling);

                    // FF will fire all three key events for backspace and delete. If you register this on IE and Chrome
                    // then you get CONFDEV-4062 which is fun.
                    tinymce.isGecko && ed.onKeyPress.add(deleteAndBackspaceKeyHandling);

                    ed.onPaste.add(addCursorTargetParagraphsToContentBinder);
                }

                /**
                 * Expose functions for unit testing
                 */
                $.extend(this, {
                    // public methods
                    isCursorBeforeAfterTable : isCursorBeforeAfterTable,
                    isCursorTarget: isCursorTarget,
                    // private methods
                    _isTextContainerEmpty: isTextContainerEmpty,
                    _processCursorTargets: processCursorTargets,
                    _isCursorAtStartOfContainer: isCursorAtStartOfContainer,
                    _isCursorAtEndOfContainer: isCursorAtEndOfContainer,
                    _getSiblingWithinBlockDisregardingNesting : _getSiblingWithinBlockDisregardingNesting,
                    _doesContainerHaveNestedContent : doesContainerHaveNestedContent,
                    _addCursorTargetParagraphsToContent: addCursorTargetParagraphsToContent,
                    _isCursorAtEndOfBottomRightCellInTable: isCursorAtEndOfBottomRightCellInTable,
                    _shouldCancelDelete: shouldCancelDelete,
                    _shouldCancelBackspace: shouldCancelBackspace,
                    _collabEditingCursorTargetRefresh: collabEditingCursorTargetRefresh
                });

                // TODO cannot detect menu delete in any decent way across different browsers.
                // I either need to run a repeating fix up operation or fallback to keyboard navigation capturing.

                AJS.Rte.Cursor = AJS.Rte.Cursor || {};

                $.extend(AJS.Rte.Cursor, {
                    isTextContainerEmpty: isTextContainerEmpty,
                    fixCursorTargets : addCursorTargetParagraphsToContent
                });

            },

            getInfo : function() {
                return {
                    longname : 'Cursor Target plugin',
                    author : 'Atlassian',
                    authorurl : 'http://www.atlassian.com',
                    version : "1.0"
                };
            }
        }
    };
});

require('confluence/module-exporter')
        .safeRequire('confluence-editor/tinymce3/plugins/confcursortarget/editor_plugin_src', function(CursorTargetModule) {
            require('confluence/module-exporter').namespace('AJS.Rte.CursorTarget', CursorTargetModule.cursorTarget);

            var tinymce = require('tinymce');
            tinymce.create('tinymce.plugins.CursorTargetPlugin', CursorTargetModule.cursorTargetPlugin);
            tinymce.PluginManager.add('cursorTarget', tinymce.plugins.CursorTargetPlugin);
        });
