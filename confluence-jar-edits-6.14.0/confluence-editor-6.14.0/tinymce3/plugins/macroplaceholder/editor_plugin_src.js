/**
 * @module confluence-editor/tinymce3/plugins/macroplaceholder/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/macroplaceholder/editor_plugin_src', [
    'jquery',
    'ajs',
    'tinymce'
], function(
    $,
    AJS,
    tinymce
) {
    "use strict";

    /**
     * Macro placeholders.
     *
     * Copyright 2010, Atlassian
     */
    var VK = tinymce.VK;

    return {
        /**
         * Initializes the plugin, this will be executed after the plugin has been created.
         * This call is done before the editor instance has finished it's initialization so use the onInit event
         * of the editor instance to intercept that event.
         *
         * param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
         * param {string} url Absolute URL to where the plugin is located.
         */
        init : function(ed) {

            var t = this;

            /**
             * Ensure that placeholders inserted inside P's are moved out as P's should only contain inline content.
             */
            ed.onInit.add(function (ed) {
                /**
                 * ed.selection is initialized until after the editor has completed initialization.
                 * Hence the registering of this listener be added to the 'onInit' event.
                 */
                ed.selection.onSetContent.add(function (ed) {
                    tinymce.each(ed.dom.select('p > .wysiwyg-macro'), function (macroPlaceholderNode) {
                        var parentParagraphNode = ed.dom.getParent(macroPlaceholderNode.parentNode, 'p');
                        try {
                            ed.dom.split(parentParagraphNode, macroPlaceholderNode);
                        } catch (ex) {
                            // IE can sometimes fire an unknown runtime error so we just ignore it
                        }
                    });
                });
            });

            /**
             * TinyMCE will strip empty <PRE> blocks (which causes problems for plain text
             * macros - CONFDEV-3998). Ensure that each <pre> inside a macro
             * has a <br>
             */
            ed.onSetContent.add(function (ed) {
                tinymce.each(ed.dom.select('.wysiwyg-macro[data-macro-body-type="PLAIN_TEXT"] .wysiwyg-macro-body'), function (macroBody) {
                    var pre = ed.dom.select('pre', macroBody);
                    if (!pre.length) {
                        if (tinymce.isIE) {
                            ed.dom.setHTML(macroBody, "<pre></pre>");
                        } else {
                            ed.dom.setHTML(macroBody, "<pre><br /></pre>");
                        }
                    }
                });
            });

            /**
             * CONFDEV-4357
             * If the user selects a bodied macro in its entirety (by clicking its title)
             * and starts typing, the text should go inside its body.
             * Does not preserve the macro when content is pasted over it.
             */
            ed.onKeyDown.add(function(ed, e) {
                var selection = ed.selection;
                var selectedNode;
                var body;

                /**
                 * Figure out if the combination of keys pressed would result in
                 * a content-modifying operation or not.
                 * FIXME: Extraction of abstraction is the key to happiness.
                 * Find all this key-wrangling detection behaviour a nicer home.
                 */
                var ignoreKeys = [VK.BACKSPACE, VK.DELETE, VK.ENTER, VK.ESCAPE];

                function isModifierKey(e) {
                    var isModifier = false;
                    if (e.charCode === 0) {
                        isModifier = ($.inArray(e.keyCode, [VK.SHIFT, VK.CTRL, VK.ALT, VK.META]) != -1);
                    }
                    return isModifier;
                }

                // Don't save the macro if a deletion action is about to occur.
                // We only need to care if there's an active selection.
                // NOTE: Pressing enter to replace the macro is also a valid approach to deleting it.
                if ($.inArray(e.keyCode, ignoreKeys) != -1 || isModifierKey(e) || selection.isCollapsed()) {
                    return;
                }

                if (e.ctrlKey || e.metaKey || (!tinymce.isMac && e.altKey)) {
                    // If one of these keys is held down,
                    // it's likely to not be a content-related operation.
                    return;
                }
                /* end key-wrangling detection behaviour */

                selectedNode = selection.getNode();

                if (tinymce.confluence.macrobrowser.isMacroWithBody(selectedNode)) {
                    var $macroBody = $(".wysiwyg-macro-body", selectedNode);

                    if ($macroBody.length > 0) {
                        AJS.debug("MacroPlaceholderPlugin: Adjusting text selection to only include macro's body.");
                        selection.select($macroBody[0], true);
                    }
                }
            });

            /**
             * Allow the user to double-click the title area of a macro placeholder to quickly open
             * the dialog to edit it.
             */
            ed.onDblClick.add(function(ed, e) {
                var $target = $(e.target);
                var macroPlaceholderEl = function ($element) {
                    return $element.closest("[data-macro-name]");
                };
                var $macroNode = macroPlaceholderEl($target);

                if ($macroNode.length) {
                    AJS.debug("Double-click triggered inside a macro.");

                    // This prevents people double-clicking arbitrary content inside macros and getting the dialog.
                    // Only proceed if we're dealing with the container element of the macro itself.
                    // inline macros have no macro body and no macro-body-type.
                    if ($macroNode.attr("data-macro-body-type")) {
                        // Allow clicking inside the table cell in IE8 to give it a chance of allowing double-click.
                        if (tinymce.isIE) {
                            if ($target.hasClass("wysiwyg-macro-body") || $target.hasClass("wysiwyg-macro")) {
                                AJS.debug("Double-click inside macro body, but its IE so its OK I guess...");
                            } else {
                                AJS.debug("Double-click was inside bodied macro content, even in IE. Skipping.");
                                return;
                            }
                        }
                        // For every normal browser that allows padding inside tables, ignore all clicks inside the content area.
                        else if ($target.closest(".wysiwyg-macro-body").length) {
                            AJS.debug("Double-click was inside bodied macro content. Skipping.");
                            return;
                        }
                    }

                    tinymce.confluence.macrobrowser.editMacro($macroNode);
                    // Because the user has essentially bypassed the property-panel, we should close it.
                    if (AJS.Confluence.PropertyPanel && AJS.Confluence.PropertyPanel.current) {
                        AJS.Confluence.PropertyPanel.destroy();
                    }
                }
            });

            /**
             * When the user is inside a plain text macro body placeholder, we do not want to expose any of the
             * rich text controls in the browser.
             */
            ed.onNodeChange.addToTop(function(ed) {
                var selectedNode = ed.selection.getNode();
                if (selectedNode.nodeName === 'PRE' && $(selectedNode).closest('.wysiwyg-macro').length) {
                    t._setTinymceControlsState(ed, 0);
                } else {
                    t._setTinymceControlsState(ed, 1);
                }
            });

            ed.addCommand("mceConfRemoveMacro", function(macroNode) {
                $(macroNode).remove();
                if (tinymce.isGecko) {
                    // Repaint to clear the image handles from their old positions.
                    AJS.Rte.getEditor().execCommand('mceRepaint', false);
                }
            });

            /**
             * Registers a key listener in a such a way as to ensure that when a user presses and holds the key,
             * that the default action can be effectively cancelled across webkit and firefox.
             *
             * Webkit is actually not fussy: registering against keydown is sufficient.
             *
             * On Firefox, one needs to register against keypress and keyup in addition to keydown.
             *
             * param listener a key listener
             */
            function registerKeyListener(listener) {
                ed.onKeyDown.add(listener);

                if (tinymce.isGecko) {
                    ed.onKeyPress.add(listener);
                    ed.onKeyUp.add(listener);
                }
            }

            /**
             * Determines if the node is an empty node (in the sense that it contains only a single child BR node.
             *
             * param node the node to test
             * param selector the specified node must pass this css selector
             */
            function nodeContainsSoloBrElementAndMatchesSelector(node, selector) {
                return node && node.childNodes.length === 1 && $(node).is(selector) && $(node.firstChild).is("br");
            }

            /**
             * Checks to see if the cursor is inside a node that is the only child of its parent (and the parent is the only
             * child of it's parent and so and so on until the placeholder body element (marked with class="wysiwyg-macro-body" is encountered).
             * If we can traverse successfully to the placeholder body element return true, otherwise return false.
             *
             * For example, for the following nested structure:
             *
             * <td class="wysiwyg-macro-body>
             *     <p>
             *         <strong>
             *             <u>
             *                 <em>CURSOR HERE text<br/></em>
             *             </u>
             *         </strong>
             *     </p>
             * </td>
             *
             * Will return true if the cursor is there.
             *
             * Note that:
             * <ul>
             *     <li>the cursor is inside an element that is the only child of its parent, and the parent is also the only child of it's parent, and so and so forth
             *     <li>the EM element that we are testing has to be the only child of it's parent. However, the EM element itself is permitted to have multiple children.
             * </ul>
             *
             * param range
             */
            function isCursorInMostNestedElement(range) {
                if (!range.collapsed) {
                    return false;
                }

                var node = range.startContainer.nodeType === 3 ? range.startContainer.parentNode : range.startContainer;

                if (!node || !node.parentNode) {
                    return false;
                }

                while (node && !$(node).is(".wysiwyg-macro-body")) {
                    if (node.previousSibling || node.nextSibling) { // if node is only child (don't use :only-child as it does not respect text nodes)
                        return false;
                    }
                    node = node.parentNode;
                }

                return true;
            }
            t._isCursorInMostNestedElement = isCursorInMostNestedElement;

            /**
             * Prevent the last empty P or PRE in a placeholder from being deleted (emulating MS word behaviour)
             */
            (function () {
                (tinymce.isWebKit || tinymce.isGecko) && registerKeyListener(function (ed, e) {
                    if (e.keyCode === 46 && isCursorInLastParagraphOrPre(ed.selection.getRng(true))) {
                        return tinymce.dom.Event.cancel(e);
                    }
                });

                function isCursorInLastParagraphOrPre(range) {
                    if (!range.collapsed) {
                        return false;
                    }

                    var node = range.startContainer.nodeType === 3 ? range.startContainer.parentNode : range.startContainer;

                    return node.previousSibling && !node.nextSibling && nodeContainsSoloBrElementAndMatchesSelector(node, "p, pre");
                }
                t._isCursorInLastParagraphOrPre = isCursorInLastParagraphOrPre;
            })();

            /**
             * This will prevent a delete or backspace key event from removing the whole placeholder when the cursor is inside
             * a nested element. For example:
             *
             * <table ...>
             *     ...
             *     <td class="wysiwyg-macro-body>
             *         <p>
             *             <strong><em><u>CURSOR HERE<br/></u></em></strong>
             *         </p>
             *     </td>
             *     ...
             * </table>
             *
             * This does does not prevent backspace when the cursor is inside an a LI element intentionally
             * (as we would prefer to allow the user to outdent in this scenario)
             */
            (function () {
                tinymce.isWebKit && registerKeyListener(function (ed, e) {
                    if (e.keyCode !== 8 && e.keyCode !== 46) {
                        return true;
                    }

                    var range = ed.selection.getRng(true);
                    var node = range.startContainer.nodeType === 3 ? range.startContainer.parentNode : range.startContainer;

                    if (isCursorInNestedElementContainingSoloBr(range)
                        && (e.keyCode === 8 ? !$(node).is("li") : true) /* LI and keyCode 8 is handled by another handler */) {
                        return tinymce.dom.Event.cancel(e);
                    }

                    return true;
                });

                function isCursorInNestedElementContainingSoloBr(range) {
                    if (!range.collapsed) {
                        return false;
                    }

                    var node = range.startContainer.nodeType === 3 ? range.startContainer.parentNode : range.startContainer;

                    return isCursorInMostNestedElement(range) && node.childNodes.length === 1 && $(node.firstChild).is("br");
                }
            })();

            /**
             * Pressing delete when inside a bullet item inside a table cell should remove the bullet item.
             *
             * Currently, if you are in a placeholder, hitting delete removes the whole placeholder including the bullet.
             *
             * Also, if you are inside a table cell in a normal table, hitting delete will not remove the bullet but just
             * move the cursor to the previous cell.
             *
             * <table ...>
             *     ...
             *     <td>
             *         <p>
             *             <ul><li>CURSOR HERE<br/></li></ul>
             *         </p>
             *     </td>
             *     ...
             * </table>
             *
             * This does not handle nested LI elements intentionally (as we would prefer to allow the user to unindent in this scenario)
             */
            (function () {
                tinymce.isWebKit && registerKeyListener(function (ed, e) {
                    if (e.keyCode !== 8) {
                        return true;
                    }

                    if (isCursorInsideMacroPlacholderInsideListItemContainingSoloBr(ed.selection.getRng(true))) {
                        ed.execCommand("Outdent");
                        return tinymce.dom.Event.cancel(e);
                    }

                    return true;
                });

                function isCursorInsideMacroPlacholderInsideListItemContainingSoloBr(range) {
                    if (!range.collapsed) {
                        return false;
                    }

                    var node = range.startContainer.nodeType === 3 ? range.startContainer.parentNode : range.startContainer;

                    return range.startOffset === 0 && $(node).is(".wysiwyg-macro-body > ul > li") && node.childNodes.length === 1 && $(node.firstChild).is("br");
                }
                t._isCursorInsideMacroPlacholderInsideListItemContainingSoloBr = isCursorInsideMacroPlacholderInsideListItemContainingSoloBr;
            })();

            /**
             * Webkit removes the whole table-based placeholder when its body only contains the following:
             *
             * <p>CURSOR HERE<br/></p>
             * <p><br/></p>
             *
             * And the user hits delete
             */
            (function () {
                tinymce.isWebKit && registerKeyListener(function(ed, e) {
                    if (e.keyCode !== 46) {
                        return true;
                    }

                    var range = ed.selection.getRng(true);
                    var node = range.startContainer.nodeType === 3 ? range.startContainer.parentNode : range.startContainer;
                    var $node = $(node);

                    if (isCursorInFirstParagraphWhenThereAreTwoEmptyParagraphs(range)) {
                        var nextSibling = node.nextSibling;
                        $node.remove();
                        ed.selection.select(nextSibling, true);

                        return tinymce.dom.Event.cancel(e);
                    }
                });

                function isCursorInFirstParagraphWhenThereAreTwoEmptyParagraphs(range) {
                    var node = range.startContainer.nodeType === 3 ? range.startContainer.parentNode : range.startContainer;
                    var $node = $(node);

                    return range.startOffset === 0
                        && nodeContainsSoloBrElementAndMatchesSelector(node, "p, pre")
                        && $node.parent().is("td.wysiwyg-macro-body")
                        && !node.previousSibling
                        && node.nextSibling
                        && nodeContainsSoloBrElementAndMatchesSelector(node.nextSibling, "p, pre");
                }
                t._isCursorInFirstParagraphWhenThereAreTwoEmptyParagraphs = isCursorInFirstParagraphWhenThereAreTwoEmptyParagraphs;
            })();

            /**
             * Webkit removes the whole table-based placeholder when its body only contains the following:
             *
             * <p><br/></p>
             * <p>CURSOR HERE<br/></p>
             *
             * And the user hits backspace.
             */
            (function () {
                tinymce.isWebKit && registerKeyListener(function(ed, e) {
                    if (e.keyCode !== 8) {
                        return true;
                    }

                    var range = ed.selection.getRng(true);
                    var node = range.startContainer.nodeType === 3 ? range.startContainer.parentNode : range.startContainer;
                    var $node = $(node);

                    if (isCursorInSecondParagraphWhenThereAreTwoEmptyParagraphs(range)) {
                        var previousSibling = node.previousSibling;
                        $node.remove();
                        ed.selection.select(previousSibling, true);

                        return tinymce.dom.Event.cancel(e);
                    }
                });

                function isCursorInSecondParagraphWhenThereAreTwoEmptyParagraphs(range) {
                    var node = range.startContainer.nodeType === 3 ? range.startContainer.parentNode : range.startContainer;
                    var $node = $(node);

                    return range.startOffset === 0 && nodeContainsSoloBrElementAndMatchesSelector(node, "p, pre")
                        && $node.parent().is("td.wysiwyg-macro-body")
                        && !node.nextSibling // is this the last child
                        && node.previousSibling
                        && !node.previousSibling.previousSibling // the previousSibling has not previousSibling, meaning this will determine whether the previousSibling is in fact the first child
                        && nodeContainsSoloBrElementAndMatchesSelector(node.previousSibling, "p, pre");
                }
                t._isCursorInSecondParagraphWhenThereAreTwoEmptyParagraphs = isCursorInSecondParagraphWhenThereAreTwoEmptyParagraphs;
            })();

            /**
             * Do not allow a single <p><br/></p> or <pre><br/></pre> inside a macro placeholder body to be deleted by backspace or delete
             */
            (function () {
                (tinymce.isWebKit || tinymce.isGecko) && registerKeyListener(function (ed, e) {
                    if (e.keyCode !== 8 && e.keyCode !== 46) {
                        return true;
                    }

                    if (isCursorInSoloParagraphOrPreInsidePlaceholder(ed.selection.getRng(true))) {
                        return tinymce.dom.Event.cancel(e);
                    }
                });

                function isCursorInSoloParagraphOrPreInsidePlaceholder(range) {
                    if (!range.collapsed) {
                        return false;
                    }

                    var node = range.startContainer.nodeType === 3 ? range.startContainer.parentNode : range.startContainer;
                    var $node = $(node);

                    if (!node || range.startOffset > 0) {
                        return false;
                    }

                    /**
                     * this will remove any empty text nodes that proceed the BR element (I've personally encountered when I outdented a single bullet item inside a placeholder)
                     * Empty text nodes interfere with the :only-child check that we will perform in the rest of the logic in this function
                     */
                    tinymce.confluence.NodeUtils.normalize(node);

                    return node && range.startOffset === 0
                        && nodeContainsSoloBrElementAndMatchesSelector(node, "p, pre")
                        && $node.parent().is("td.wysiwyg-macro-body")
                        && !node.previousSibling && !node.nextSibling; // p or pre is the only child
                }
                t._isCursorInSoloParagraphOrPreInsidePlaceholder = isCursorInSoloParagraphOrPreInsidePlaceholder;
            })();

            /**
             * Webkit deletes the whole table-based placeholder when the last character or element (excluding the BR) is removed via
             * backspace or delete.
             *
             * Firefox inserts a <BR/> element outside of the P when the last character is deleted. That is you get:
             *
             * <td>
             *     <p><br/></p>
             *     <br/>
             * </td>
             *
             * This is problematic markup and its confusing behaviour.
             *
             * The following code checks for the condition where this is only one text node or one element left
             * and manually performs the removal of the node and cancels the backspace or delete key event (hence bypassing the
             * default browser handling which causes the above mentioned problems).
             */
            (function () {

                function isTrailingBR(node) {
                    return node && node.parentNode && node.nodeName === "BR" && node === node.parentNode.lastChild;
                }

                (tinymce.isWebKit || tinymce.isGecko) && registerKeyListener(function(ed, e) {
                    if (e.keyCode !== 8 && e.keyCode !== 46) {
                        return true;
                    }

                    var range = ed.selection.getRng(true);
                    var node = range.startContainer.nodeType === 3 ? range.startContainer.parentNode : range.startContainer;

                    // Don't run if the cursor isn't inside a macro.
                    if (!$(node).closest(".wysiwyg-macro-body").size()) {
                        return true;
                    }

                    tinymce.confluence.NodeUtils.normalize(node);

                    if ((e.keyCode === 46 && (isCursorBehindOnlyCharacterInNestedElement(range) || isCursorBehindOnlyChildInNestedElement(range)))
                        || (e.keyCode === 8 && (isCursorAfterOnlyCharacterInNestedElement(range) || isCursorAfterOnlyChildInNestedElement(range)))) {

                        if (node.lastChild && !$(node.lastChild).is("br")) {
                            $(node).append("<br/>"); // this is required so we have a place to put the cursor
                        }

                        $(node.firstChild).remove();
                        ed.selection.select(node, 1);

                        return tinymce.dom.Event.cancel(e);
                    }

                    return true;
                });

                function isCursorBehindOnlyCharacterInNestedElement(range) {
                    if (!range.collapsed) {
                        return false;
                    }

                    var node = range.startContainer;

                    return node && range.startOffset === 0
                        && node.nodeType === 3
                        && isCursorInMostNestedElement(range)
                        && node.nodeValue.length === 1
                        && !node.previousSibling && (!node.nextSibling || isTrailingBR(node.nextSibling));
                }

                function isCursorAfterOnlyCharacterInNestedElement(range) {
                    if (!range.collapsed) {
                        return false;
                    }

                    var node = range.startContainer;

                    return node && range.startOffset === 1
                        && node.nodeType === 3
                        && isCursorInMostNestedElement(range)
                        && node.nodeValue.length === 1
                        && !node.previousSibling && (!node.nextSibling || isTrailingBR(node.nextSibling));
                }

                function isCursorBehindOnlyChildInNestedElement(range) {
                    if (!range.collapsed) {
                        return false;
                    }

                    var node = range.startContainer;

                    return node && range.startOffset === 0
                        && node.nodeType === 1
                        && node.childNodes.length === 1
                        && isCursorInMostNestedElement(range)
                        && !node.previousSibling && !node.nextSibling;
                }

                function isCursorAfterOnlyChildInNestedElement(range) {
                    if (!range.collapsed) {
                        return false;
                    }

                    var node = range.startContainer;

                    return node && range.startOffset === 1
                        && node.nodeType === 1
                        && node.childNodes.length === 1
                        && isCursorInMostNestedElement(range)
                        && !node.previousSibling && !node.nextSibling;
                }

                t._isCursorBehindOnlyCharacterInNestedElement = isCursorBehindOnlyCharacterInNestedElement;
                t._isCursorAfterOnlyCharacterInNestedElement = isCursorAfterOnlyCharacterInNestedElement;
                t._isCursorBehindOnlyChildInNestedElement = isCursorBehindOnlyChildInNestedElement;
                t._isCursorAfterOnlyChildInNestedElement = isCursorAfterOnlyChildInNestedElement;
            })();

            (function () {
                tinymce.isWebKit && registerKeyListener(function(ed, e) {
                    if (e.keyCode !== 8 && e.keyCode !== 46) {
                        return true;
                    }

                    var range = ed.selection.getRng(true);
                    if (isMacroBodySelected(range)) {
                        var $macroBody = $(range.startContainer).closest(".wysiwyg-macro-body");

                        if ($macroBody.length > 0) {
                            var isPlainTextMacro = $($macroBody[0].firstChild).is("pre"); //plain text macros will always have one or more PRE elements

                            ed.undoManager.add();
                            $macroBody.empty();

                            var $container;
                            if (isPlainTextMacro) {
                                $container = $("<pre><br/></pre>").appendTo($macroBody);
                            } else {
                                $container = $("<p><br/></p>").appendTo($macroBody);
                            }

                            ed.selection.select($container[0], true);

                            return tinymce.dom.Event.cancel(e);
                        }
                    }

                    return true;
                });

                function isMacroBodySelected(range) {
                    if (range.collapsed) {
                        return false;
                    }

                    var isFirstChild = function (n) {
                        return !n.previousSibling;
                    };
                    var isLastChild = function (n) {
                        return !n.nextSibling;
                    };

                    return range.startOffset === 0
                        && isMacroBodyElementReachableViaSelector(range.startContainer, isFirstChild)
                        && isOffsetAtEndOfNode(range.endContainer, range.endOffset)
                        && isMacroBodyElementReachableViaSelector(range.endContainer, isLastChild);
                }
                t._isMacroBodySelected = isMacroBodySelected;

                /**
                 * Returns true if the macro body element can be reached from the specified node.
                 *
                 * SPECIAL CASE:
                 *
                 * Return true if the specified node "is" the macro body element.
                 *
                 * param node the node
                 * param f function used to test parent nodes on the way to the macro body element
                 */
                function isMacroBodyElementReachableViaSelector(node, f) {
                    if (!node) {
                        return false;
                    }

                    if ($(node).is(".wysiwyg-macro-body")) {
                        return true;
                    }

                    do {
                        if (!f(node)) {
                            return false;
                        }
                        node = node.parentNode;
                    } while (node && !$(node).is(".wysiwyg-macro-body"));

                    return true;
                }

                function isOffsetAtEndOfNode(node, offset) {
                    if (!node) {
                        return false;
                    }

                    if (node.nodeType === 3) {
                        return offset === node.nodeValue.length;
                    } else if (node.nodeType === 1) {
                        if (node.childNodes.length === 1 && $(node.firstChild).is("br")) {
                            return offset === 0; // SPECIAL CASE: Return true if the endContainer is a node containing a BR like <XXX><br/></XXX>, where the endOffset is 0.
                        } else {
                            return offset === node.childNodes.length;
                        }
                    } else {
                        return false;
                    }
                }

            })();

            /**
             * Prevent the delete key when the cursor is:
             * ... miscellaneous content ...
             * <p>CURSOR HERE<br/></p>
             * ... placeholder markup ...
             *
             * If we don't, webkit will "select" the placeholder for a split second (you will see light blue cover
             * face of the placeholder, and then the selection will go away and the cursor is no where to be seen.
             * Focus is lost from the editor.
             */
            (function () {
                tinymce.isWebKit && registerKeyListener(function (ed, e) {
                    if (e.keyCode === 46 && isCursorInEmptyParagraphPrecedingPlaceholder(ed.selection.getRng(true))) {
                        return tinymce.dom.Event.cancel(e);
                    }
                });

                function isCursorInEmptyParagraphPrecedingPlaceholder(range) {
                    if (!range.collapsed) {
                        return false;
                    }

                    var node = range.startContainer.nodeType === 3 ? range.startContainer.parentNode : range.startContainer;
                    var $node = $(node);

                    return range.startOffset === 0 && nodeContainsSoloBrElementAndMatchesSelector(node, "p") && $node.next().is("table");
                }
                t._isCursorInEmptyParagraphPrecedingPlaceholder = isCursorInEmptyParagraphPrecedingPlaceholder;
            })();

            // CONFDEV-4248
            (function() {
                tinymce.isWebKit && tinymce.isMac && registerKeyListener(function(ed, e) {
                    var currentRange = ed.selection.getRng();

                    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.keyCode === VK.LEFT) {
                        var range = _selectTillStart(currentRange);
                        if (range !== currentRange) {
                            ed.selection.setRng(range);
                            return tinymce.dom.Event.cancel(e);
                        }
                    }
                });

                function _findTextContainer(node) {
                    if (!node || $(node.parentNode).is(".wysiwyg-macro td")) {
                        return null;
                    }
                    if ($(node.parentNode).is("p")) {
                        return node.parentNode;
                    }

                    return _findTextContainer(node.parentNode);
                }

                function _findFirstTextNode(node) {
                    if (!node) {
                        return null;
                    }
                    if (node.nodeType === 3) {
                        return node;
                    }

                    return _findFirstTextNode(node.firstChild) || _findFirstTextNode(node.nextSibling);
                }

                function _findNearestPrecedingBr(node) {
                    if (!node || node.nodeName === "PRE" || node.nodeName === "TD") {
                        return null;
                    }
                    if (node.nodeName === "BR") {
                        return node;
                    }

                    return _findNearestPrecedingBr(node.previousSibling) || _findNearestPrecedingBr(node.parentNode);
                }

                /**
                 * webkit, at the time of writing, selects too much when a user hits CMD+SHIFT+LEFT inside the macro body.
                 * Instead of selecting just text, webkit will also include the placeholder in the selection.
                 * If the user deletes, the whole placeholder is deleted instead.
                 *
                 * To resolve this, we modify the start of the range on the fly.
                 * If there are any BR tags preceding the cursor, we want to fall back to the browser's default handling.
                 */
                function _selectTillStart(range) {
                    var firstTextNode;
                    var $pre;

                    if ($(range.commonAncestorContainer).closest(".wysiwyg-macro td").length > 0) {
                        if (!_findNearestPrecedingBr(range.startContainer)) {
                            firstTextNode = _findFirstTextNode(_findTextContainer(range.startContainer));
                        }
                    }

                    if (($pre = $(range.commonAncestorContainer).closest(".wysiwyg-macro td > pre")).length > 0) {
                        if (!_findNearestPrecedingBr(range.startContainer)) {
                            firstTextNode = _findFirstTextNode($pre[0]);
                        }
                    }

                    if (firstTextNode) {
                        range = range.cloneRange();
                        range.setStart(firstTextNode, 0);
                    }

                    return range;
                }

                t._selectTillStart = _selectTillStart; // expose for testing
            })();

            (function () {
                ed.onKeyDown.add(function(ed, e) {
                    if (e.keyCode !== tinymce.VK.TAB) {
                        return;
                    }

                    var range = ed.selection.getRng(1);
                    var node = range.startContainer.nodeType === 3 ? range.startContainer.parentNode : range.startContainer;

                    if ($(node).is(".wysiwyg-macro-body > pre")) {
                        ed.undoManager.beforeChange();
                        ed.undoManager.add();

                        var tabSpace = ed.getDoc().createTextNode('\t');
                        range.insertNode(tabSpace);
                        ed.selection.setCursorLocation(tabSpace, 1);

                        ed.undoManager.add();

                        return tinymce.dom.Event.prevent(e);
                    }
                });
            })();
        },

        _setTinymceControlsState: function (ed, state) {
            tinymce.each(ed.controlManager.controls, function(c) {
                c.setDisabled(!state);
            });
        },

        getInfo : function() {
            return {
                longname : 'Macro Place Holder plugin',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                version : "1.0"
            };
        }
    };
});

require('confluence/module-exporter')
    .safeRequire('confluence-editor/tinymce3/plugins/macroplaceholder/editor_plugin_src', function(MacroPlaceHolderPlugin) {
        var tinymce = require('tinymce');
        tinymce.create('tinymce.plugins.MacroPlaceHolderPlugin', MacroPlaceHolderPlugin);
        tinymce.PluginManager.add('macroplaceholder', tinymce.plugins.MacroPlaceHolderPlugin);
    });