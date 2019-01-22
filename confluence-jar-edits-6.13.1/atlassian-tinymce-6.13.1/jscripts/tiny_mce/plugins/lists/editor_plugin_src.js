/**
 * editor_plugin_src.js
 *
 * Copyright 2011, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 *
 * @module atlassian-tinymce/plugins/lists/editor_plugin_src
 */
define('atlassian-tinymce/plugins/lists/editor_plugin_src', [
    'tinymce',
    'ajs',
    'jquery'
], function(
    tinymce,
    AJS,
    $
) {
    var BLANK_LI_STYLE = 'list-style-type: none; background-image: none;';

    var INLINE_NODES = 'a,b,i,em,strong,u,span,s,sub,sup,code,br';

    var each = tinymce.each;
    var Event = tinymce.dom.Event;
    var bookmark;

    // Skips text nodes that only contain whitespace since they aren't semantically important.
    function skipWhitespaceNodes(e, next) {
        while (e && (e.nodeType === 8 || (e.nodeType === 3 && /^[ \t\n\r]*$/.test(e.nodeValue)))) {
            e = next(e);
        }
        return e;
    }

    function skipWhitespaceNodesBackwards(e) {
        return skipWhitespaceNodes(e, function(e) {
            return e.previousSibling;
        });
    }

    function skipWhitespaceNodesForwards(e) {
        return skipWhitespaceNodes(e, function(e) {
            return e.nextSibling;
        });
    }

    function hasParentInList(ed, e, list) {
        return ed.dom.getParent(e, function(p) {
            return tinymce.inArray(list, p) !== -1;
        });
    }

    function isList(e) {
        return e && (e.tagName === 'OL' || e.tagName === 'UL');
    }

    /**
     * ATLASSIAN - CONFDEV-27112
     *
     * This method can return undefined when selecting a paragraph and lists and trying to indent/outdent them together
     *
     * @param element
     * @param dom
     * @returns {htmlElement|undefined}
     */
    function splitNestedLists(element, dom) {
        var tmp;
        var nested;
        var wrapItem;
        tmp = skipWhitespaceNodesBackwards(element.lastChild);
        while (isList(tmp)) {
            nested = tmp;
            tmp = skipWhitespaceNodesBackwards(nested.previousSibling);
        }
        if (nested) {
            wrapItem = dom.create('li', { style: BLANK_LI_STYLE });
            dom.split(element, nested);
            dom.insertAfter(wrapItem, nested);
            wrapItem.appendChild(nested);
            wrapItem.appendChild(nested);
            element = wrapItem.previousSibling;
        }
        return element;
    }

    function attemptMergeWithAdjacent(e, allowDifferentListStyles, mergeParagraphs) {
        e = attemptMergeWithPrevious(e, allowDifferentListStyles, mergeParagraphs);
        return attemptMergeWithNext(e, allowDifferentListStyles, mergeParagraphs);
    }

    function attemptMergeWithPrevious(e, allowDifferentListStyles, mergeParagraphs) {
        var prev = skipWhitespaceNodesBackwards(e.previousSibling);
        if (prev) {
            return attemptMerge(prev, e, allowDifferentListStyles ? prev : false, mergeParagraphs);
        } else {
            return e;
        }
    }

    function attemptMergeWithNext(e, allowDifferentListStyles, mergeParagraphs) {
        var next = skipWhitespaceNodesForwards(e.nextSibling);
        if (next) {
            return attemptMerge(e, next, allowDifferentListStyles ? next : false, mergeParagraphs);
        } else {
            return e;
        }
    }

    function attemptMerge(e1, e2, differentStylesMasterElement, mergeParagraphs) {
        if (canMerge(e1, e2, !!differentStylesMasterElement, mergeParagraphs)) {
            return merge(e1, e2, differentStylesMasterElement);
        } else if (e1 && e1.tagName === 'LI' && isList(e2)) {
            // Fix invalidly nested lists.
            e1.appendChild(e2);
        }
        return e2;
    }

    function canMerge(e1, e2, allowDifferentListStyles, mergeParagraphs) {
        if (!e1 || !e2) {
            return false;
        } else if (e1.tagName === 'LI' && e2.tagName === 'LI') {
            return e2.style.listStyleType === 'none' || containsOnlyAList(e2);
        } else if (isList(e1)) {
            return (e1.tagName === e2.tagName && e1.className === e2.className && (allowDifferentListStyles || e1.style.listStyleType === e2.style.listStyleType)) || isListForIndent(e2);
        } else { return mergeParagraphs && e1.tagName === 'P' && e2.tagName === 'P'; }
    }

    function isListForIndent(e) {
        var firstLI = skipWhitespaceNodesForwards(e.firstChild);
        var lastLI = skipWhitespaceNodesBackwards(e.lastChild);
        return firstLI && lastLI && isList(e) && firstLI === lastLI && (isList(firstLI) || firstLI.style.listStyleType === 'none' || containsOnlyAList(firstLI));
    }

    function containsOnlyAList(e) {
        var firstChild = skipWhitespaceNodesForwards(e.firstChild);
        var lastChild = skipWhitespaceNodesBackwards(e.lastChild);
        return firstChild && lastChild && firstChild === lastChild && isList(firstChild);
    }

    function merge(e1, e2, masterElement) {
        var lastOriginal = skipWhitespaceNodesBackwards(e1.lastChild);
        var firstNew = skipWhitespaceNodesForwards(e2.firstChild);
        if (e1.tagName === 'P') {
            e1.appendChild(e1.ownerDocument.createElement('br'));
        }
        while (e2.firstChild) {
            e1.appendChild(e2.firstChild);
        }
        if (masterElement) {
            e1.style.listStyleType = masterElement.style.listStyleType;
        }
        e2.parentNode.removeChild(e2);
        attemptMerge(lastOriginal, firstNew, false);
        return e1;
    }

    function findItemToOperateOn(e, dom) {
        var item;
        if (!dom.is(e, 'li,ol,ul')) {
            item = dom.getParent(e, 'li');
            if (item) {
                e = item;
            }
        }
        return e;
    }

    return {
        init: function(ed) {
            var LIST_TABBING = 'TABBING';
            var LIST_EMPTY_ITEM = 'EMPTY';
            var LIST_ESCAPE = 'ESCAPE';
            var LIST_UNKNOWN = 'UNKNOWN';
            var state = LIST_UNKNOWN;

            function isTabInList(e) {
                // Don't indent on Ctrl+Tab or Alt+Tab
                return e.keyCode === tinymce.VK.TAB && !(e.altKey || e.ctrlKey) &&
                        (ed.queryCommandState('InsertUnorderedList') || ed.queryCommandState('InsertOrderedList')
                        || ed.queryCommandState('InsertInlineTaskList') || ed.queryCommandState('InsertInlineTaskListNoToggle'));
            }

            // If we are at the end of a paragraph in a list item, pressing enter should create a new list item instead of a new paragraph.
            function isEndOfParagraph() {
                var node = ed.selection.getNode();
                var isLastParagraphOfLi = node.tagName === 'P' && node.parentNode.tagName === 'LI' && node.parentNode.lastChild === node;

                return ed.selection.isCollapsed()
                        && isLastParagraphOfLi
                        /**
                         * ATLASSIAN: use our own because tinymce's isCursorAtEndOfContainer() doesn't work with <li>I<br/></li> (where I is the cursor)
                         */
                        && AJS.EditorUtils.isCursorAtEndOf(node, ed.selection.getRng(true));
            }

            function isOnLastListItem() {
                var li = getLi();
                // ATLASSIAN - getLi() can return null
                if (li) {
                    var grandParent = li.parentNode.parentNode;
                    var isLastItem = li.parentNode.lastChild === li;
                    return isLastItem && !isNestedList(grandParent) && isEmptyListItem(li);
                }
                return false;
            }

            function isNestedList(grandParent) {
                if (isList(grandParent)) {
                    return grandParent.parentNode && grandParent.parentNode.tagName === 'LI';
                } else {
                    return  grandParent.tagName === 'LI';
                }
            }

            function isInEmptyListItem() {
                return ed.selection.isCollapsed() && isEmptyListItem(getLi());
            }

            function getLi() {
                var n = ed.selection.getStart();
                // ATLASSIAN - make sure this returns an LI all the time. null if there is no li.
                // Get start will return BR if the LI only contains a BR or an empty element as we use these to fix caret position
                return (n.tagName == 'LI') ? n : ed.dom.getParent(n, "li");
            }

            // ATLASSIAN - a list item is empty if:
            // there's only spaces AND only inline elements AND at most 1 <br>
            // it is not empty if it contains block elements (e.g. ul, ol, bq, table, etc) or
            // things like an img.
            function isEmptyListItem(li) {
                // ATLASSIAN - getLi can be null
                if (li) {
                    var $li = $(li);
                    var allDescendants = $li.find('*');
                    var inlineDescendants = allDescendants.filter(INLINE_NODES);

                    if(allDescendants.length !== inlineDescendants.length) {
                        return false; // block child elements
                    }

                    // treat whitespace as empty
                    var text = AJS.trim($li.text());

                    // blank / empty; allow 1 <br>
                    return text.length === 0 && inlineDescendants.filter('br').length <= 1;
                }
                return false;
            }

            // ATLASSIAN - CONFDEV-5574 - Remove extraneous empty #text nodes that break the isEmpty check (and seem to grow with each indent/outdent)
            function cleanLi(li) {
                if(li && (tinymce.isGecko || tinymce.isWebKit)) {
                    var children = li.childNodes;
                    var numChildren = children.length;
                    var child;

                    // Go right to left so the removal of Nodes from DOM doesn't affect parts of the children array we're iterating over
                    for(var i = (numChildren - 1); i >= 0; i--) {
                        child = children[i];
                        if(child.nodeType === 3 && !child.length) {
                            ed.dom.remove(child);
                        }
                    }
                }
            }
            function isEnter(e) {
                return e.keyCode === tinymce.VK.ENTER;
            }

            function isEnterWithoutShift(e) {
                return isEnter(e) && !e.shiftKey;
            }

            function isBackspaceDelete(e) {
                return e.keyCode === tinymce.VK.BACKSPACE || e.keyCode === tinymce.VK.DELETE;
            }

            function getListKeyState(e) {
                if (isTabInList(e)) {
                    return LIST_TABBING;
                } else if (isEnterWithoutShift(e) && isOnLastListItem()) {
                    return LIST_ESCAPE;
                } else if (isEnterWithoutShift(e) && isInEmptyListItem()) {
                    return LIST_EMPTY_ITEM;
                } else {
                    return LIST_UNKNOWN;
                }
            }

            function cancelDefaultEvents(ed, e) {
                // list escape is done manually using outdent as it does not create paragraphs correctly in td's
                if (state == LIST_TABBING || state == LIST_EMPTY_ITEM || (tinymce.isGecko || tinymce.isWebKit) && state == LIST_ESCAPE) {
                    Event.cancel(e);
                }
            }

            /*
             * If we are at the end of a list item surrounded with an element, pressing enter should create a
             * new list item instead without splitting the element e.g. don't want to create new P or H1 tag
             */
            function isEndOfListItem() {
                var node = ed.selection.getNode();
                var validElements = 'h1,h2,h3,h4,h5,h6,p,div';
                var isLastParagraphOfLi = ed.dom.is(node, validElements) && node.parentNode.tagName === 'LI' && node.parentNode.lastChild === node;
                /**
                 * ATLASSIAN: use our own because tinymce's isCursorAtEndOfContainer() doesn't work with <li>I<br/></li> (where I is the cursor)
                 */
                var isCursorAtEndOfContainer = AJS.EditorUtils.isCursorAtEndOf(node, ed.selection.getRng(true));

                return ed.selection.isCollapsed() && isLastParagraphOfLi && isCursorAtEndOfContainer;
            }

            // Creates a new list item after the current selection's list item parent
            function createNewLi(ed, e) {
                if (isEnterWithoutShift(e) && isEndOfListItem()) {
                    /**
                     * ATLASSIAN: ensure we capture the cursor and add an undo step so we can nicely "undo" this operation
                     */
                    ed.undoManager.beforeChange();
                    ed.undoManager.add();

                    var node = ed.selection.getNode();

                    /**
                     * ATLASSIAN: ensure LI has a BR. All new empty list items in FF contain a BR. Creating one without a BR is atypical and leads to unexpected behaviour.
                     */
                    var li = ed.dom.create("li", {}, !tinymce.isIE ? "<br data-mce-bogus=\"true\">" : "");
                    var parentLi = ed.dom.getParent(node, 'li');
                    ed.dom.insertAfter(li, parentLi);

                    // Move caret to new list element.
                    if (tinymce.isIE6 || tinymce.isIE7 || tinymce.isIE8) {
                        li.appendChild(ed.dom.create("&nbsp;")); // IE needs an element within the bullet point
                        ed.selection.setCursorLocation(li, 1);
                    } else if (tinymce.isGecko) {
                        // This setTimeout is a hack as FF behaves badly if there is no content after the bullet point
                        setTimeout(function () {
                            ed.selection.setCursorLocation(li, 0);
                        }, 0);
                    } else {
                        ed.selection.setCursorLocation(li, 0);
                    }

                    ed.undoManager.add();

                    e.preventDefault();
                }
            }

            function imageJoiningListItem(ed, e) {
                var prevSibling;

                if (!tinymce.isGecko) {
                    return;
                }

                var n = ed.selection.getStart();
                if (e.keyCode != tinymce.VK.BACKSPACE || n.tagName !== 'IMG') {
                    return;
                }

                function lastLI(node) {
                    var child = node.firstChild;
                    var li = null;
                    do {
                        if (!child) {
                            break;
                        }

                        if (child.tagName === 'LI') {
                            li = child;
                        }
                    } while (child = child.nextSibling);

                    return li;
                }

                function addChildren(parentNode, destination) {
                    while (parentNode.childNodes.length > 0) {
                        destination.appendChild(parentNode.childNodes[0]);
                    }
                }

                // Check if there is a previous sibling
                prevSibling = n.parentNode.previousSibling;
                if (!prevSibling) {
                    return;
                }

                var ul;
                if (prevSibling.tagName === 'UL' || prevSibling.tagName === 'OL') {
                    ul = prevSibling;
                } else if (prevSibling.previousSibling && (prevSibling.previousSibling.tagName === 'UL' || prevSibling.previousSibling.tagName === 'OL')) {
                    ul = prevSibling.previousSibling;
                } else {
                    return;
                }

                var li = lastLI(ul);

                // move the caret to the end of the list item
                var rng = ed.dom.createRng();
                rng.setStart(li, 1);
                rng.setEnd(li, 1);
                ed.selection.setRng(rng);
                ed.selection.collapse(true);

                // save a bookmark at the end of the list item
                var bookmark = ed.selection.getBookmark();

                // copy the image an its text to the list item
                var clone = n.parentNode.cloneNode(true);
                if (clone.tagName === 'P' || clone.tagName === 'DIV') {
                    addChildren(clone, li);
                } else {
                    li.appendChild(clone);
                }

                // remove the old copy of the image
                n.parentNode.parentNode.removeChild(n.parentNode);

                // move the caret where we saved the bookmark
                ed.selection.moveToBookmark(bookmark);
            }

            // fix the cursor position to ensure it is correct in IE
            function setCursorPositionToOriginalLi(li) {
                var list = ed.dom.getParent(li, 'ol,ul');
                if (list != null) {
                    var lastLi = list.lastChild;
                    //ATLASSIAN - CONFDEV-22940: should not use "ed.getDoc().createElement('')" as http://www.w3.org/TR/dom/
                    //will throw an exception "InvalidCharacterError" in IEs
                    lastLi.appendChild(ed.getDoc().createTextNode(AJS.Rte.HIDDEN_CHAR));
                    ed.selection.setCursorLocation(lastLi, 0);
                }
            }

            this.ed = ed;
            ed.addCommand('Indent', this.indent, this);
            ed.addCommand('Outdent', this.outdent, this);
            ed.addCommand('InsertUnorderedList', function() {
                this.applyList('UL', 'OL');
            }, this);
            ed.addCommand('InsertOrderedList', function() {
                this.applyList('OL', 'UL');
            }, this);
            ed.addCommand('InsertInlineTaskList', function() {
                if (AJS.Rte.Support.inlineTasks()) {
                    this.applyList('UL', 'OL', 'inline-task-list', {
                        attributesOnItems: {'data-inline-task-id' : ''},
                        placeholderText : AJS.I18n.getText("tinymce.confluence.placeholder.inline.tasks")
                    });
                }
            }, this);
            // The command below is used by the insert menu (we don't want the usual toggle behaviour when we 'insert' an inline task list
            ed.addCommand('InsertInlineTaskListNoToggle', function() {
                if (AJS.Rte.Support.inlineTasks()) {
                    this.applyList('UL', 'OL', 'inline-task-list', {
                        attributesOnItems: {'data-inline-task-id' : ''},
                        placeholderText : AJS.I18n.getText("tinymce.confluence.placeholder.inline.tasks"),
                        noToggle : true
                    });
                }
            }, this);

            ed.onInit.add(function() {
                ed.editorCommands.addCommands({
                    'outdent': function() {
                        var sel = ed.selection;
                        var dom = ed.dom;

                        function hasStyleIndent(n) {
                            n = dom.getParent(n, dom.isBlock);
                            return n && (parseInt(ed.dom.getStyle(n, 'margin-left') || 0, 10) + parseInt(ed.dom.getStyle(n, 'padding-left') || 0, 10)) > 0;
                        }

                        return hasStyleIndent(sel.getStart()) || hasStyleIndent(sel.getEnd())
                                || ed.queryCommandState('InsertOrderedList')
                                || ed.queryCommandState('InsertUnorderedList')
                                || ed.queryCommandState('InsertInlineTaskList');
                    }
                }, 'state');
            });

            ed.onKeyUp.add(function(ed, e) {
                if (state == LIST_TABBING) {
                    ed.execCommand(e.shiftKey ? 'Outdent' : 'Indent', true, null);
                    cleanLi(getLi());  // ATLASSIAN
                    state = LIST_UNKNOWN;
                    return Event.cancel(e);
                } else if (state == LIST_EMPTY_ITEM) {
                    var li = getLi();
                    var shouldOutdent =  ed.settings.list_outdent_on_enter === true || e.shiftKey;
                    ed.execCommand(shouldOutdent ? 'Outdent' : 'Indent', true, null);
                    if (tinymce.isIE) {
                        setCursorPositionToOriginalLi(li);
                    }
                    cleanLi(li);  // ATLASSIAN
                    // ATLASSIAN - CONFDEV-3749 - make sure new element is visible
                    AJS.Rte.showSelection();

                    return Event.cancel(e);
                } else if (state == LIST_ESCAPE) {
                    if (tinymce.isIE6 || tinymce.isIE7 || tinymce.isIE8) {
                        // append a zero sized nbsp so that caret is positioned correctly in IE8 after escaping and applying formatting.
                        // if there is no text then applying formatting for e.g a H1 to the P tag immediately following list after
                        // escaping from it will cause the caret to be positioned on the last li instead of staying the in P tag.
                        var n = ed.getDoc().createTextNode(AJS.Rte.HIDDEN_CHAR);
                        ed.selection.getNode().appendChild(n);
                    } else if (tinymce.isIE9 || tinymce.isIE10 || tinymce.isIE11 || tinymce.isGecko || tinymce.isWebKit) {
                        // IE9/IE10/IE11 does not escape the list so we use outdent to do this and cancel the default behaviour
                        // Gecko does not create a paragraph outdenting inside a TD so default behaviour is cancelled and we outdent ourselves
                        // Webkit inserts a div instead of a paragraph in some cases (e.g. table cells). (CONF-25369)
                        ed.execCommand('Outdent');
                        return Event.cancel(e);
                    }
                }
            });

            function fixDeletingFirstCharOfList(ed, e) {
                function listElements(list, li) {
                    var elements = [];
                    var walker = new tinymce.dom.TreeWalker(li, list);
                    for (var node = walker.current(); node; node = walker.next()) {
                        if (ed.dom.is(node, 'ol,ul,li')) {
                            elements.push(node);
                        }
                    }
                    return elements;
                }

                if (e.keyCode == tinymce.VK.BACKSPACE) {
                    var li = getLi();
                    if (li) {
                        var list = ed.dom.getParent(li, 'ol,ul');
                        if (list && list.firstChild === li) {
                            var elements = listElements(list, li);
                            ed.execCommand("Outdent", false, elements);
                            ed.undoManager.add();
                            return Event.cancel(e);
                        }
                    }
                }
            }

            function fixDeletingEmptyLiInWebkit(ed, e) {
                var li = getLi();
                // ATLASSIAN - getLi() can return null
                if (li && e.keyCode === tinymce.VK.BACKSPACE && ed.dom.is(li, 'li') && li.parentNode.firstChild!==li) {
                    if (ed.dom.select('ul,ol', li).length === 1) {
                        var prevLi = li.previousSibling;
                        ed.dom.remove(ed.dom.select('br', li));
                        ed.dom.remove(li, true);
                        var textNodes = tinymce.grep(prevLi.childNodes, function(n){ return n.nodeType === 3; });
                        if (textNodes.length === 1) {
                            var textNode = textNodes[0];
                            ed.selection.setCursorLocation(textNode, textNode.length);
                        }
                        ed.undoManager.add();
                        return Event.cancel(e);
                    }
                }
            }

            /**
             * CONF-39943: in webkit, after inserting a list into a table cell, press backspace key
             * to delete the first empty li of the root list takes no effect
             * <td class="confluenceTd"><ul><li><br data-mce-bogus="1">Let the cursor here and press backspace</li></ul></td>
             * It's because Webkit doesn't handle execute 'Delete' correctly
             */
            function fixDeletingFirstLiOfListInWebkit(ed, e) {
				if (e.keyCode === tinymce.VK.BACKSPACE && tinymce.isWebKit) {
					var li = getLi();
					if (li) {
						var list = ed.dom.getParent(li, 'ol,ul');
                        var rng  = ed.selection.getRng();
                        //if cursor is at the start of the first li in list and there is no content selection
                        //and cursor is not right after a br in that li (Ex: <li>abc<br/>[cursor]def</li>)
                        //rng.startOffset === 1 && rng.startContainer.textContent === '' condition is to fix for the case
                        //that cannot remove the bullet after repeating these steps
                        //- Click on a table cell (1)
                        //- Insert a bullet and click on the start of that list item (2)
                        //- Press backspace. After that click on another cell
                        //
                        //Then click on the previous cell, repeat (1) and (2). But now when pressing backspack key,
                        //bullet cannot be removed anymore. It's because cursor is at the start of the li but rng.startOffset is 1

						if (list && list.firstChild === li
                                 && (rng.startOffset === 0 || ( rng.startOffset === 1 && rng.startContainer.textContent === '' ))
                                 && !ed.selection.getContent().trim()
                                 && rng.startContainer.textContent === li.textContent) {

                            ed.execCommand("Outdent", false, li);
                            ed.undoManager.add();
							return Event.cancel(e);
						}
					}
				}
			}

            /**
             * ATLASSIAN - CONF-23844 - Pre-empt the situations in which a nested list may become
             * the first child of a list item, and attempt to prevent the two lists from being 'collapsed'
             * due to there being no real content before the nested list.
             */
            function defendAgainstCollapsedNestedLists(ed, cm, n) {
                var parentList;
                if (n && n.nodeType === 1 && ed.dom.is(n, 'li')) {
                    parentList = n.parentNode;
                    tinymce.each(ed.dom.select('li>ul,li>ol',parentList), function(list) {
                        // Don't do anything if the list is deliberately nested as the first child of an li.
                        if (ed.dom.getAttrib(list.parentNode, 'data-mce-style')) { return; }

                        var prevNode = list.previousSibling;
                        if (!prevNode) {
                            list.parentNode.insertBefore(ed.dom.doc.createElement('br'), list);
                        }
                    });
                }
            }

            /**
             * ATLASSIAN - Improvement to handling of list item creation to prevent double bullets.
             * @see https://github.com/tinymce/tinymce/pull/100
             */
            function defendAgainstEmptyListItems(ed, e) {
                var li = getLi();
                var rng;
                var contentNode;
                var nextContentNode;

                function shiftCursorInIE(node) {
                    var spacer = ed.dom.doc.createTextNode(String.fromCharCode(160));
                    var prevNode = node.previousSibling;
                    var newRng = (tinymce.isIE6 || tinymce.isIE7 || tinymce.isIE8) ? rng : ed.getDoc().createRange();

                    // If the element before the nested list is a text node and it ends with a spacer,
                    // do a bit of rejigging of the cursor position to take advantage of it.
                    if (prevNode && prevNode.nodeType === 3
                            && prevNode.nodeValue[prevNode.length-1] == spacer.nodeValue) {
                        newRng.setStart(prevNode, prevNode.length-1);
                        newRng.setEnd(prevNode, prevNode.length-1);
                        newRng.collapse(true);
                        ed.selection.setRng(newRng);
                    } else {
                        // Insert an empty text node before the nested list
                        nextContentNode.parentNode.insertBefore(spacer, node);
                        // Move the caret to the left of the spacer text node
                        newRng.setStartBefore(spacer);
                        newRng.setEndBefore(spacer);
                        newRng.collapse(true);
                        ed.selection.setRng(newRng);
                    }
                }

                if (li && (isEnterWithoutShift(e) || isBackspaceDelete(e))) {
                    rng = ed.selection.getRng(true);
                    contentNode = rng.endContainer; // check the end; this accounts for both caret & selections
                    if (contentNode.nodeType === 3) {
                        if (rng.endOffset !== contentNode.length) {
                            // There's text to the right of the cursor, so the new li won't be empty.
                            return;
                        }
                        nextContentNode = contentNode.nextSibling;
                    } else if (contentNode.nodeType === 1) {
                        // Grab a reference to the nodes to the right of the caret.
                        nextContentNode = contentNode.childNodes[rng.endOffset];
                    } else {
                        // If the cursor ended up anywhere else, bail.
                        return;
                    }

                    if (nextContentNode && ed.dom.is(nextContentNode, 'ul,ol')) {
                        // Ensure that there'll be something to the right of the cursor
                        // that will end up being placed in the new list item.
                        if (tinymce.isIE) {
                            shiftCursorInIE(nextContentNode);
                        } else {
                            nextContentNode.parentNode.insertBefore(ed.dom.create('br'), nextContentNode);
                        }
                    }
                }
            }

            /**
             * ATLASSIAN - CONF-23578 - Avoid certain situations in which a nested list
             * can be incorrectly nested inside an empty -- hence un-editable -- list item.
             */
            function fixEmptyLiWithNestedList(ed) {
                var li = getLi();

                // Bail unless we're working within a list item.
                if (!li) { return; }
                var parentList = li.parentNode;

                function nestListProperly(list) {
                    var oldParent = list.parentNode;
                    var properParent = oldParent.previousSibling;
                    var oldRng;

                    cleanLi(oldParent);

                    if (oldParent.childNodes[0] === list) {
                        // Don't do anything if the list is deliberately nested as the first child of an li.
                        if (ed.dom.getAttrib(oldParent, 'data-mce-style')) { return; }

                        if (ed.selection.getStart().parentNode == list) {
                            oldRng = ed.selection.getRng(true);
                            oldRng = {
                                startOffset: oldRng.startOffset,
                                startContainer: oldRng.startContainer
                            };
                        }

                        if (properParent) {
                            // Add a proper separator between the li and the new nested list.
                            //properParent.appendChild(ed.dom.create('br'));
                            properParent.appendChild(list);
                        } else {
                            properParent = ed.dom.create('li', { style: BLANK_LI_STYLE });
                            properParent.appendChild(list);
                            oldParent.parentNode.insertBefore(properParent, oldParent);
                        }

                        if (oldRng) {
                            // replace the selection
                            ed.selection.setCursorLocation(oldRng.startContainer || list.firstChild, oldRng.startOffset);
                        }

                        // Destroy the old parent list item if it is now empty.
                        if (isEmptyListItem(oldParent)) {
                            ed.dom.remove(oldParent);
                        }
                    }
                }

                // This behaviour can occur within:
                // the current list...
                tinymce.grep(ed.dom.select('li>ul, li>ol', parentList), nestListProperly);
                // the parent list item...
                if (ed.dom.is(parentList.parentNode, 'li')) {
                    nestListProperly(parentList);
                }
                // ...or an adjacent list, should we be working inside the last list item of this list.
                if (li === parentList.lastChild && parentList.nextSibling
                        && ed.dom.is(parentList.nextSibling, 'ul, ol')) {
                    tinymce.grep(ed.dom.select('li>ul, li>ol', parentList.nextSibling), nestListProperly);
                }
            }

            ed.onKeyDown.add(function(_, e) { state = getListKeyState(e); });
            ed.onKeyDown.add(cancelDefaultEvents);
            ed.onKeyDown.add(imageJoiningListItem);
            ed.onKeyDown.add(createNewLi);

            // ATLASSIAN - CONFEXT-35 commented out since this snippet is outdenting the entire list.
            //if (tinymce.isGecko || tinymce.isWebKit) {
            //  ed.onKeyDown.add(fixDeletingFirstCharOfList);
            //}

            // ATLASSIAN - CONF-23578
            if (tinymce.isWebKit) {
                ed.onNodeChange.add(fixEmptyLiWithNestedList); // Needs to be called before defendAgainstCollapsedNestedLists
                ed.onKeyUp.add(fixEmptyLiWithNestedList);
            }

            // ATLASSIAN - CONF-23844, CONF-23578
            if (!tinymce.isIE) {
                ed.onNodeChange.add(defendAgainstCollapsedNestedLists);
                if (tinymce.isGecko) {
                    ed.onKeyDown.add(defendAgainstEmptyListItems);
                }
            } else {
                ed.onKeyDown.add(defendAgainstEmptyListItems);
            }


            // ATLASSIAN - CONFDEV-5383 - In Gecko deleting an empty li results the li being replaced by a p, it should remove the li
            // and move the cursor down to the next li.
            function deleteEmptyLi(ed, e) {
                if (e.keyCode === 46 && !e.shiftKey) { // delete key
                    var li = getLi();
                    if (li && (li.childNodes.length === 0 || (li.childNodes.length === 1 && li.firstChild.nodeName === 'BR'))) {
                        var nextLi;
                        var textNode;
                        var w;
                        var rng;
                        if (nextLi = li.nextSibling) {
                            w = ed.dom.doc.createTreeWalker(nextLi, NodeFilter.SHOW_TEXT, null, false);
                            textNode = w.nextNode();

                            rng = ed.getDoc().createRange();
                            rng.setStart(textNode, 0);
                            rng.setEnd(textNode, 0);
                            ed.selection.setRng(rng);

                            // Remove the li
                            ed.dom.remove(li);
                            ed.undoManager.add();

                            Event.cancel(e);
                        }
                    }
                }
            }

            if (tinymce.isGecko) {
                ed.onKeyDown.add(deleteEmptyLi);
            }

            if (tinymce.isWebKit) {
                ed.onKeyDown.add(fixDeletingFirstLiOfListInWebkit);
            }
        },

        /**
         * Transforms the selected elements into a list.
         * @param targetListType the node name for the list, e.g. 'UL' or 'OL'
         * @param oppositeListType the node name to transform, if present.
         * @param listClass a CSS class name to assign to the node
         * @param options a set of options:<ul>
         * <li>attributesOnItems true if data-inline-task-id must be present on the elements (otherwise, removes the attribute from all elements)</li>
         * <li>placeholderText a text to display for newly created tasks</li>
         * <li>noToggle true if no attempt should be made to remove the list.</li>
         * </ul>
         */
        applyList: function(targetListType, oppositeListType, listClass, options) {
            var t = this;
            var ed = t.ed;
            var dom = ed.dom;
            var applied = [];
            var hasSameType = false;
            var hasOppositeType = false;
            var hasNonList = false;
            var hasSameClass = false;
            var actions;
            var selectedBlocks = ed.selection.getSelectedBlocks();

            listClass = listClass || '';
            options = options || {};
            var attributesOnItems = options.attributesOnItems;
            var placeholderText = options.placeholderText;
            var noToggle = options.noToggle;

            function cleanupBr(e) {
                if (e && e.tagName === 'BR') {
                    dom.remove(e);
                }
            }

            // ATLASSIAN - remove any extra classes or attributes (see CONFDEV-8994) before making changes to LI element
            function cleanupLi(e) {
                if (e && e.tagName === 'LI') {
                    dom.removeClass(e, 'checked');
                    e.removeAttribute('data-inline-task-id');
                }
            }

            // ATLASSIAN - If attributesOnItems, add the attributes to the li element.
            function applyAttributes(e) {
                if (attributesOnItems && e && e.tagName === 'LI') {
                    for (var attributeKey in attributesOnItems) {
                        e.setAttribute(attributeKey, attributesOnItems[attributeKey]);
                    }
                }
            }

            function makeList(element) {
                var list = dom.create(targetListType);
                var li;

                if (listClass != '') {
                    list.className = listClass;
                }

                function adjustIndentForNewList(element) {
                    // If there's a margin-left, outdent one level to account for the extra list margin.
                    if (element.style.marginLeft || element.style.paddingLeft) {
                        t.adjustPaddingFunction(false)(element);
                    }
                }

                if (element.tagName === 'LI') {
                    // This case happens is several situations, sometimes the makeList is called after the 'li' is created:
                    // - When creating a list in a table cell
                    // - When the previous/following paragraphs wrap their content in a span.
                    applyAttributes(element);
                } else if (element.tagName === 'P' || element.tagName === 'DIV' || element.tagName === 'BODY') {
                    processBrs(element, function(startSection, br) {
                        doWrapList(startSection, br, element.tagName === 'BODY' ? null : startSection.parentNode);
                        li = startSection.parentNode;
                        adjustIndentForNewList(li);
                        // CONFDEV-16789 - Need to maintain the BR in Chrome or we won't be able to set the focus if the only
                        // child is a empty tag, like: <li><strong></strong></li>

                        // CONF-39943: Only maintain the BR in Chrome if BR's parentNode is not a code block
                        // for preventing a lot of redundant BR would be appeared when makeList was called and element is not LI
                        // if BR's parentNode is a code block, it is safe to be cleaned, because in #process function,
                        // Selection#moveToBookmark will be executed, and a new bogus BR will be added into this BR parentNode.
                        // So we are able to set the focus.
                        if (!tinymce.isChrome || (tinymce.isChrome && br && br.parentNode && dom.isBlock(br.parentNode))){
                            cleanupBr(br);
                        }
                    });
                    if (li) {
                        if (li.tagName === 'LI' && (element.tagName === 'P' || selectedBlocks.length > 1)) {
                            if (placeholderText && t.isEmptyElement(li)) {
                                var placeholder = document.createTextNode(placeholderText);
                                var span = dom.create('span');
                                span.appendChild(placeholder);
                                li.appendChild(span);

                                // Select placeholder after the selection is moved to the bookmark in this.process
                                setTimeout(function() {
                                    ed.selection.select(placeholder);
                                }, 0);

                                // ATLASSIAN - CONFDEV-9087 ensure the li has height even if placeholder is deleted
                                if (tinymce.isIE7 || tinymce.isIE8) {
                                    li.appendChild(ed.dom.create('br', {'_mce_bogus' : '1'}));
                                }

                                function removePlaceholder(editor, keyboardEvent) {
                                    // If the user types '@' like a mention
                                    if ((keyboardEvent.which || keyboardEvent.keyCode) == 64) {
                                        if (placeholder.textContent == placeholderText) {
                                            placeholder.textContent = " ";
                                        } else if (placeholder.data == placeholderText) {
                                            // IE8 uses the "data" and has no textContent.
                                            placeholder.data = " ";
                                        }
                                    }

                                    // We can't remove it directly because the list is being iterated on.
                                    window.setTimeout(function() {
                                        ed.onKeyPress.remove(removePlaceholder);
                                    }, 0);
                                }
                                // Must happen before the autocomplete
                                ed.onKeyPress.addToTop(removePlaceholder);
                            }
                            dom.split(li.parentNode.parentNode, li.parentNode);
                        }
                        attemptMergeWithAdjacent(li.parentNode, true);
                        applyAttributes(li);
                    }
                    return;
                } else {
                    // Put the list around the element.
                    li = dom.create('li');
                    applyAttributes(li);
                    dom.insertAfter(li, element);
                    li.appendChild(element);
                    adjustIndentForNewList(element);
                    element = li;
                }
                dom.insertAfter(list, element);
                list.appendChild(element);
                attemptMergeWithAdjacent(list, true);
                applied.push(element);
            }

            function doWrapList(start, end, template) {
                var li;
                var n = start;
                var tmp;
                while (!dom.isBlock(start.parentNode) && start.parentNode !== dom.getRoot()) {
                    start = dom.split(start.parentNode, start.previousSibling);
                    start = start.nextSibling;
                    n = start;
                }
                if (template) {
                    li = template.cloneNode(true);
                    start.parentNode.insertBefore(li, start);
                    while (li.firstChild) { dom.remove(li.firstChild); }
                    li = dom.rename(li, 'li');
                } else {
                    li = dom.create('li');
                    start.parentNode.insertBefore(li, start);
                }
                // ATLASSIAN - if there is only a br in the block, append it to the li anyway.
                // You need to keep the br since it is used to find the li later on.
                // Add an additional br since the existing one will be removed.
                if (n && n == end) {
                    var additionalBr = dom.create('br');
                    dom.setAttrib(additionalBr, "data-mce-bogus", 1);
                    li.appendChild(n);
                    dom.insertAfter(additionalBr, n);
                }

                while (n && n != end) {
                    tmp = n.nextSibling;
                    li.appendChild(n);
                    n = tmp;
                }
                if (li.childNodes.length === 0) {
                    li.innerHTML = '<br _mce_bogus="1" />';
                }
                makeList(li);
            }

            function processBrs(element, callback) {
                var startSection;
                var previousBR;
                var END_TO_START = 3;
                var START_TO_END = 1;
                var breakElements = 'br,ul,ol,p,div,h1,h2,h3,h4,h5,h6,table,blockquote,address,pre,form,center,dl';

                function isAnyPartSelected(start, end) {
                    var r = dom.createRng();
                    var sel;
                    bookmark.keep = true;
                    ed.selection.moveToBookmark(bookmark);
                    bookmark.keep = false;
                    sel = ed.selection.getRng(true);
                    if (!end) {
                        end = start.parentNode.lastChild;
                    }
                    r.setStartBefore(start);
                    r.setEndAfter(end);
                    return !(r.compareBoundaryPoints(END_TO_START, sel) > 0 || r.compareBoundaryPoints(START_TO_END, sel) <= 0);
                }

                function nextLeaf(br) {
                    if (br.nextSibling) {
                        return br.nextSibling;
                    }
                    if (!dom.isBlock(br.parentNode) && br.parentNode !== dom.getRoot()) {
                        return nextLeaf(br.parentNode);
                    }
                }

                // Split on BRs within the range and process those.
                startSection = element.firstChild;
                // First mark the BRs that have any part of the previous section selected.
                var trailingContentSelected = false;
                each(dom.select(breakElements, element), function(br) {
                    if (br.hasAttribute && br.hasAttribute('_mce_bogus')) {
                        return true; // Skip the bogus Brs that are put in to appease Firefox and Safari.
                    }
                    if (isAnyPartSelected(startSection, br)) {
                        dom.addClass(br, '_mce_tagged_br');
                        startSection = nextLeaf(br);
                    }
                });
                trailingContentSelected = (startSection && isAnyPartSelected(startSection, undefined));
                startSection = element.firstChild;
                each(dom.select(breakElements, element), function(br) {
                    // Got a section from start to br.
                    var tmp = nextLeaf(br);
                    if (br.hasAttribute && br.hasAttribute('_mce_bogus')) {
                        return true; // Skip the bogus Brs that are put in to appease Firefox and Safari.
                    }
                    if (dom.hasClass(br, '_mce_tagged_br')) {
                        callback(startSection, br, previousBR);
                        previousBR = null;
                    } else {
                        previousBR = br;
                    }
                    startSection = tmp;
                });
                if (trailingContentSelected) {
                    callback(startSection, undefined, previousBR);
                }
            }

            function wrapList(element) {
                processBrs(element, function(startSection, br, previousBR) {
                    // Need to indent this part
                    doWrapList(startSection, br);
                    cleanupBr(br);
                    cleanupBr(previousBR);
                });
            }

            function changeList(element) {
                cleanupLi(element);

                if (tinymce.inArray(applied, element) !== -1) {
                    return;
                }
                if (element.parentNode.tagName === oppositeListType || !hasSameClass) {
                    dom.split(element.parentNode, element);
                    makeList(element);
                    attemptMergeWithNext(element.parentNode, false);
                }
                if (listClass != '') {
                    element.parentNode.className = listClass;
                }

                applyAttributes(element);
                applied.push(element);
            }

            function convertListItemToParagraph(element) {
                cleanupLi(element);

                var child;
                var nextChild;
                var mergedElement;
                var splitLast;
                if (tinymce.inArray(applied, element) !== -1) {
                    return;
                }
                element = splitNestedLists(element, dom);
                if(!element) { // ATLASSIAN - CONFDEV-27112
                    return;
                }
                while (dom.is(element.parentNode, 'ol,ul,li')) {
                    dom.split(element.parentNode, element);
                }
                // Push the original element we have from the selection, not the renamed one.
                applied.push(element);
                element = dom.rename(element, 'p');
                mergedElement = attemptMergeWithAdjacent(element, false, ed.settings.force_br_newlines);
                if (mergedElement === element) {
                    // Now split out any block elements that can't be contained within a P.
                    // Manually iterate to ensure we handle modifications correctly (doesn't work with tinymce.each)
                    child = element.firstChild;
                    while (child) {
                        if (dom.isBlock(child)) {
                            child = dom.split(child.parentNode, child);
                            splitLast = true;
                            nextChild = child.nextSibling && child.nextSibling.firstChild;
                        } else {
                            nextChild = child.nextSibling;
                            if (splitLast && child.tagName === 'BR') {
                                dom.remove(child);
                            }
                            splitLast = false;
                        }
                        child = nextChild;
                    }
                }
            }

            function findListToOperateOn(elem, dom) {
                var e = findItemToOperateOn(elem, dom);
                var list = e.tagName === 'LI' ? e.parentNode : e;
                return list;
            }

            each(selectedBlocks, function(e) {
                e = findListToOperateOn(e, dom);
                hasSameClass = (e.className === listClass);
                if (e.tagName === oppositeListType) {
                    hasOppositeType = true;
                } else if (e.tagName === targetListType) {
                    hasSameType = true;
                } else {
                    hasNonList = true;
                }
            });

            if (hasNonList && !hasSameType || hasOppositeType || !hasSameClass || selectedBlocks.length === 0) {
                actions = {
                    'LI': changeList,
                    'H1': makeList,
                    'H2': makeList,
                    'H3': makeList,
                    'H4': makeList,
                    'H5': makeList,
                    'H6': makeList,
                    'P': makeList,
                    'BODY': makeList,
                    'DIV': selectedBlocks.length > 1 ? makeList : wrapList,
                    defaultAction: wrapList,
                    elements: this.selectedBlocks()
                };
            } else if (!noToggle) {
                actions = {
                    defaultAction: convertListItemToParagraph,
                    elements: this.selectedBlocks()
                };
            } else {
                actions = {};
            }
            this.process(actions);
        },

        indent: function() {
            var ed = this.ed;
            var dom = ed.dom;
            var indented = [];

            function createWrapItem(element) {
                var wrapItem = dom.create('li', { style: BLANK_LI_STYLE });
                dom.insertAfter(wrapItem, element);
                return wrapItem;
            }

            function createWrapList(element) {
                var wrapItem = createWrapItem(element);
                var list = dom.getParent(element, 'ol,ul');
                var listType = list.tagName;
                var listStyle = dom.getStyle(list, 'list-style-type');
                var listClassName = list.className || '';
                var attrs = {};
                var wrapList;
                if (listStyle !== '') {
                    attrs.style = 'list-style-type: ' + listStyle + ';';
                }
                wrapList = dom.create(listType, attrs);
                if (listClassName != '') {
                    wrapList.className = listClassName;
                }
                wrapItem.appendChild(wrapList);
                return wrapList;
            }

            function indentLI(element) {
                if (!hasParentInList(ed, element, indented)) {
                    element = splitNestedLists(element, dom);
                    if(!element) { // ATLASSIAN - CONFDEV-27112
                        return;
                    }
                    var wrapList = createWrapList(element);

                    // ATLASSIAN - CONFDEV-9087 ensure the li has height
                    if (tinymce.isIE7 || tinymce.isIE8) {
                        element.appendChild(ed.dom.create('br', {'_mce_bogus' : '1'}));
                    }

                    wrapList.appendChild(element);
                    attemptMergeWithAdjacent(wrapList.parentNode, false);
                    attemptMergeWithAdjacent(wrapList, false);
                    indented.push(element);
                }
            }

            this.process({
                'LI': indentLI,
                defaultAction: this.adjustPaddingFunction(true),
                elements: this.selectedBlocks()
            });

        },

        outdent: function(ui, elements) {
            var t = this;
            var ed = t.ed;
            var dom = ed.dom;
            var outdented = [];

            function outdentLI(element) {
                var listElement;
                var targetParent;
                var align;
                if (!hasParentInList(ed, element, outdented)) {
                    if (dom.getStyle(element, 'margin-left') !== '' || dom.getStyle(element, 'padding-left') !== '') {
                        return t.adjustPaddingFunction(false)(element);
                    }
                    align = dom.getStyle(element, 'text-align', true);
                    if (align === 'center' || align === 'right') {
                        dom.setStyle(element, 'text-align', 'left');
                        return;
                    }
                    element = splitNestedLists(element, dom);
                    if(!element) { // ATLASSIAN - CONFDEV-27112
                        return;
                    }
                    listElement = element.parentNode;
                    targetParent = element.parentNode.parentNode;
                    if (targetParent.tagName === 'P') {
                        dom.split(targetParent, element.parentNode);
                    } else {
                        dom.split(listElement, element);
                        if (targetParent.tagName === 'LI') {
                            // Nested list, need to split the LI and go back out to the OL/UL element.
                            dom.split(targetParent, element);
                        } else if (!dom.is(targetParent, 'ol,ul')) {
                            dom.rename(element, 'p');
                        }
                    }

                    if (dom.hasClass(element.parentNode, 'inline-task-list')) {
                        if (!element.hasAttribute('data-inline-task-id')) {
                            element.setAttribute('data-inline-task-id', '');
                        }
                    } else {
                        element.removeAttribute('data-inline-task-id');
                    }
                    outdented.push(element);
                }
            }

            var listElements = elements && tinymce.is(elements, 'array') ? elements : this.selectedBlocks();
            this.process({
                'LI': outdentLI,
                defaultAction: this.adjustPaddingFunction(false),
                elements: listElements
            });

            each(outdented, attemptMergeWithAdjacent);
        },

        isEmptyElement: function(element) {
            var dom = this.ed.dom;
            var excludeBrsAndBookmarks = tinymce.grep(element.childNodes, function(n) {
                return !(n.nodeName === 'BR' || n.nodeName === 'SPAN' && dom.getAttrib(n, 'data-mce-type') == 'bookmark'
                || n.nodeType === 3 && (n.nodeValue == String.fromCharCode(160) || n.nodeValue == ''));
            });
            return excludeBrsAndBookmarks.length === 0;
        },

        process: function(actions) {
            var t = this;
            var sel = t.ed.selection;
            var dom = t.ed.dom;
            var selectedBlocks;
            var r;

            function processElement(element) {
                // ATLASSIAN - CONFDEV-9087 remove extraneous <br> before we attempt to process a LI
                if (tinymce.isIE7 || tinymce.isIE8) {
                    $(element).find("br[_mce_bogus='1']").remove();
                }

                dom.removeClass(element, '_mce_act_on');
                if (!element || element.nodeType !== 1 || selectedBlocks.length > 1 && t.isEmptyElement(element)) {
                    return;
                }
                element = findItemToOperateOn(element, dom);
                var action = actions[element.tagName];
                if (!action) {
                    action = actions.defaultAction;
                }
                action(element);
            }

            function recurse(element) {
                t.splitSafeEach(element.childNodes, processElement);
            }

            function brAtEdgeOfSelection(container, offset) {
                return offset >= 0 && container.hasChildNodes() && offset < container.childNodes.length &&
                        container.childNodes[offset].tagName === 'BR';
            }

            function isInTable() {
                var n = sel.getNode();
                var p = dom.getParent(n, 'td');
                return p !== null;
            }

            // CONFDEV-32673 No formatting should be applied to the numbering column
            if (dom.select('td.mceSelected.numberingColumn').length) {
                return;
            }

            selectedBlocks = actions.elements;

            r = sel.getRng(true);
            if (!r.collapsed) {
                if (brAtEdgeOfSelection(r.endContainer, r.endOffset - 1)) {
                    r.setEnd(r.endContainer, r.endOffset - 1);
                    sel.setRng(r);
                }
                if (brAtEdgeOfSelection(r.startContainer, r.startOffset)) {
                    r.setStart(r.startContainer, r.startOffset + 1);
                    sel.setRng(r);
                }
            }


            if (tinymce.isIE7 || tinymce.isIE8) {
                // append a zero sized nbsp so that caret is restored correctly using bookmark
                var s = t.ed.selection.getNode();
                if (s.tagName === 'LI' && !(s.parentNode.lastChild === s)) {
                    var i = t.ed.getDoc().createTextNode(AJS.Rte.HIDDEN_CHAR);
                    s.appendChild(i);
                }
            }

            bookmark = sel.getBookmark();
            actions.OL = actions.UL = recurse;
            t.splitSafeEach(selectedBlocks, processElement);
            sel.moveToBookmark(bookmark);
            bookmark = null;

            // we avoid doing repaint in a table as this will move the caret out of the table in Firefox 3.6
            if (!isInTable()) {
                // Avoids table or image handles being left behind in Firefox.
                t.ed.execCommand('mceRepaint');
            }
        },

        splitSafeEach: function(elements, f) {
            if (tinymce.isGecko && (/Firefox\/[12]\.[0-9]/.test(navigator.userAgent) ||
                    /Firefox\/3\.[0-4]/.test(navigator.userAgent))) {
                this.classBasedEach(elements, f);
            } else {
                each(elements, f);
            }
        },

        classBasedEach: function(elements, f) {
            var dom = this.ed.dom;
            var nodes;
            var element;
            // Mark nodes
            each(elements, function(element) {
                dom.addClass(element, '_mce_act_on');
            });
            nodes = dom.select('._mce_act_on');
            while (nodes.length > 0) {
                element = nodes.shift();
                dom.removeClass(element, '_mce_act_on');
                f(element);
                nodes = dom.select('._mce_act_on');
            }
        },

        adjustPaddingFunction: function(isIndent) {
            var indentAmount;
            var indentUnits;
            var ed = this.ed;
            indentAmount = ed.settings.indentation;
            indentUnits = /[a-z%]+/i.exec(indentAmount);
            indentAmount = parseInt(indentAmount, 10);
            return function(element) {
                var currentIndent;
                var newIndentAmount;
                currentIndent = parseInt(ed.dom.getStyle(element, 'margin-left') || 0, 10) + parseInt(ed.dom.getStyle(element, 'padding-left') || 0, 10);
                if (isIndent) {
                    newIndentAmount = currentIndent + indentAmount;
                } else {
                    newIndentAmount = currentIndent - indentAmount;
                }
                ed.dom.setStyle(element, 'padding-left', '');
                ed.dom.setStyle(element, 'margin-left', newIndentAmount > 0 ? newIndentAmount + indentUnits : '');
            };
        },

        selectedBlocks: function() {
            var ed = this.ed;
            var selectedBlocks = ed.selection.getSelectedBlocks();
            return selectedBlocks.length === 0 ? [ ed.dom.getRoot() ] : selectedBlocks;
        },

        getInfo: function() {
            return {
                longname : 'Lists',
                author : 'Moxiecode Systems AB',
                authorurl : 'http://tinymce.moxiecode.com',
                infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/lists',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };

});

require('confluence/module-exporter').safeRequire('atlassian-tinymce/plugins/lists/editor_plugin_src', function(Lists) {
    var tinymce = require('tinymce');
    tinymce.create('tinymce.plugins.Lists', Lists);
    tinymce.PluginManager.add("lists", tinymce.plugins.Lists);
});