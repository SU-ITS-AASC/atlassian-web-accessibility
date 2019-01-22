/**
 * @module confluence-editor/tinymce3/plugins/searchreplace/searchreplace
 */
define('confluence-editor/tinymce3/plugins/searchreplace/searchreplace', [
    'confluence/legacy',
    'jquery',
    'tinymce',
    'confluence/api/browser',
    'confluence-editor/tinymce3/plugins/searchreplace/search-ms-edge'
], function(
    Confluence,
    $,
    tinymce,
    Browser,
    EdgeSearch
) {
    "use strict";

    var browser = Browser(window.navigator.userAgent);

    // Constants
    var MARK_START = "<mark data-searching class=\"find-current\">";
    var MARK_END = "</mark>";

    /**
     * Responsible for driving the logic of searching.
     *
     * @param t
     *            the toolbar id
     */
    var SearchManager = function(t) {

        var toolbarId = t;
        var ui = null;
        var markManager = null;
        var searchImpl = null;
        var savedFindText = null;
        var savedReplaceText = null;

        var clearSavedValues = function() {
            savedFindText = null;
            savedReplaceText = null;
        };

        /**
         * CONFDEV-6638
         * Modify the supplied XML formatted String so that any marks from a find are removed.
         * This has an implication in that the bookmark could become invalidated if it was
         * marking within the removed mark. Not much that can be done about that.
         */
        var removeMarksFromUndoLevel = function(undoManager, level) {
            level.content = level.content.replace(new RegExp(MARK_START, 'g'), "");
            level.content = level.content.replace(new RegExp(MARK_END, 'g'), "");
        };

        /* ------------------------- public methods ------------------------- */
        var self = {};

        self.initialised = false;

        /**
         * Perform a find.
         *
         * @param backwards if true then search backwards
         * @param onFound the function to run after a match
         * @param onNotFound the function to run if no match
         */
        self.find = function(backwards, onFound, onNotFound) {
            var text = ui.getFindInput().val();
            var findResult = searchImpl.findText(text, true, backwards);

            if (findResult && onFound) {
                onFound();
            } else if (!findResult && onNotFound) {
                onNotFound();
            }
        };

        /**
         * Apply a click of the replace button, getting the replace text from
         * the toolbar.
         *
         * @param onFound the function to run when the replace completes and successfully finds a new match
         * @param onNotFound the function to run when the replace fails to find a new match
         */
        self.replace = function(onFound, onNotFound) {
            var findInput = ui.getFindInput();
            var replaceInput = ui.getReplaceInput();
            var replacementText = "";
            if (replaceInput) {
                replacementText = replaceInput.val();
            }

            var foundNext = searchImpl.replaceText(findInput.val(), replacementText, true);
            if (foundNext && onFound) {
                onFound();
            } else if (!foundNext && onNotFound) {
                onNotFound();
            }
        };

        /**
         * Apply a click of the replace all button, getting the replace text
         * from the toolbar
         *
         * @param focusAfter the function to set focus after the find
         */
        self.replaceAll = function(onReplaced, onNotReplaced) {
            var findInput = ui.getFindInput();
            var replaceInput = ui.getReplaceInput();
            var replacementText = "";
            if (replaceInput) {
                replacementText = replaceInput.val();
            }

            var replaced = searchImpl.replaceAll(findInput.val(), replacementText);
            if (replaced && onReplaced) {
                onReplaced();
            } else if (!replaced && onNotReplaced) {
                onNotReplaced();
            }
        };

        /**
         * Typically called when a find operation was required (perhaps via
         * keyboard shortcut) but the search manager is not in a state to
         * perform it. Respond by moving focus to the default field in the
         * searchbar.
         */
        self.focus = function() {
            ui.focusFindTextBox();
        };

        self.isVisible = function() {
            return ui != null;
        };

        /**
         * Called when the toolbar is to be displayed
         *
         */
        self.init = function() {
            ui = SearchManager.UI(toolbarId, savedFindText, savedReplaceText);
            markManager = new SearchManager.MarkManager();
            markManager.addListener(ui);

            searchImpl = null;
            if (tinymce.isIE) {
                searchImpl = new SearchManager.implIE(ui);
            } else {
                searchImpl = new SearchManager.impl(ui,markManager);
            }

            tinymce.activeEditor.undoManager.onAdd.add(removeMarksFromUndoLevel);
        };

        /**
         * When the search toolbar is initialising the keyboard is blocked and any keystrokes buffered.
         * This method is provided so that any buffered characters can be appended after initialisation.
         *
         * @param text any text to be appended to the current value of the findText. May be null.
         */
        self.onVisible = function(text) {
            if (text != null && text.length > 0) {
                var input = ui.getFindInput();
                var currentVal = input.val();
                input.val(currentVal + text);
            }

            ui.onVisible();
        };

        /**
         * Called when the searchbar is hidden.
         */
        self.onHide = function() {
            // save values
            savedFindText = ui.getFindInput().val();
            savedReplaceText = ui.getReplaceInput().val();

            searchImpl.destroy();
            searchImpl = null;

            ui.destroy();
            ui = null;
            markManager.destroy();
            markManager = null;

            tinymce.activeEditor.undoManager.onAdd.remove(removeMarksFromUndoLevel);
        };

        /**
         * Expose functions for testing
         */
        self._clearSavedValues = clearSavedValues;

        return self;
    };

    SearchManager.utils = {

        /**
         * A utility function for IE and Firefox specifically that will move the cursor to the
         * end of the supplied textbox control.
         *
         * Webkit has a more sensible behaviour on focus so doesn't need this.
         */
        moveCursorToEnd: function(textbox) {
            if (tinymce.isIE) {
                var range = textbox.createTextRange();
                range.execCommand("SelectAll");
                range.move("textedit");
                range.select();
            } else if (tinymce.isGecko) {
                var length = $(textbox).val().length;
                textbox.setSelectionRange(length, length);
            }
        },

        /**
         * A utility to abstract IE createText range, more specifically since IE11 dropped support for document.selection
         *
         * @param {HTMLobject} doc - reference to document
         * @param {Object} ed - reference to the editor
         *
         * @return {Range|TextRange} - Returns a text range object
         */
        createTextRange: function(doc, ed) {

            // CONF-31610 - IE11 has deprecated support for 'selection'
            // http://msdn.microsoft.com/en-us/library/ie/ms535869(v=vs.85).aspx
            return doc.selection ?
                    doc.selection.createRange() :
                    ed.getBody().createTextRange();
        }
    };

    /* --- The standard (Webkit/Gecko) find and replace implementation. ---- */
    SearchManager.impl = function(uiManager, mManager) {

        var encodingWriter = new tinymce.html.Writer();
        var markManager = mManager;
        var ui = uiManager;
        // Indicate the position where the current selection begins.
        // Initially, no selection or found keyword so the value is -1
        var searchFrom = -1;

        /**
         * Find and highlight the supplied text within the editor.
         *
         * If the cursor is not positioned in the editor then find will start at
         * the beginning of the document. Otherwise the find will be from the
         * current point in the document.
         *
         * @param text
         *            the String to find
         * @param wrap
         *            true indicates the find should wrap
         * @param backwards
         *            true indicates the search should be backwards.
         * @return true if there was a match or false if there was none.
         */
        var findText = function(text, wrap, backwards) {
            if (!text) {
                return false;
            }

            var ed = tinymce.activeEditor;
            var se = ed.selection;
            var w = ed.getWin();

            if (markManager.isCursorAtCurrentMark()) {
                // select the current mark and then collapse so that we can
                // place the cursor before or
                // after depending on search direction.
                se = markManager.selectCurrentMark();
            }

            // if searching backwards then collapse to the start to avoid
            // finding the same match again
            // if forwards then collapse to the end for the same reason
            if (!se.isCollapsed()) {
                se.collapse(backwards);
            }

            function onSuccessfulFind() {
                markManager.markCurrentlySelectedRange();
                return true;
            }

            function onUnsuccessfulFind() {
                markManager.removeCurrentMark(true);

                // collapse selection from a previous find to avoid the user
                // confusing the visual indication of selection with a find result
                if (!tinymce.activeEditor.selection.isCollapsed()) {
                    tinymce.activeEditor.selection.collapse();
                }

                return false;
            }

            if (tinymce.isGecko) {
                // Gecko doesn't respect the wrap parameter. Need to manually
                // implement wrapping.
                if (w.find(text, false, backwards)) {
                    return onSuccessfulFind();
                } else if (wrap) {
                    se.select(ed.getBody(), false);
                    se.collapse(!backwards);
                    return findText(text, false, backwards);
                } else {
                    return onUnsuccessfulFind();
                }
            } else if (browser.isMSEdge()) {
                // In MS Edge createTextRange() is used on document body
                // And window.find() has not been supported yet
                var result = EdgeSearch.search(se, text, searchFrom, ed.getBody(), backwards);
                searchFrom = result[1];
                if (result[0]) {
                    return onSuccessfulFind();
                }
            } else if (w.find(text, false, backwards, true, false, false, false)) {
                return onSuccessfulFind();
            } else {
                return onUnsuccessfulFind();
            }
        };

        /**
         * Encapsulates the logic involved in a replace operation.
         *
         * If the 'find' text is not currently selected then a find will be
         * performed and no replacement will take place. (Hopefully the UI
         * actually prevents this case but handle it for back up.) If the 'find'
         * text is currently selected then a replace will be performed followed
         * by another 'find'.
         *
         * @param wrap
         *            a flag indicating whether the implicit find operation
         *            should wrap around.
         * @return true if the implicit find operation performed finds a match
         */
        var replaceText = function(fText, replacementText, wrap) {
            if (!markManager.hasCurrentMark()) {
                return findText(fText, wrap);
            }

            var replacementNode = markManager.replaceCurrentMark(replacementText);

            if (replacementNode) {
                tinymce.activeEditor.selection.select(replacementNode);
            }
            return findText(fText, wrap);
        };

        /**
         * Simply replace any currently selected text with the new value.
         */
        var replaceSelectedText = function(replaceText) {
            var ed = tinymce.activeEditor;
            encodingWriter.text(replaceText);

            ed.selection.setContent(encodingWriter.getContent(), {format : 'raw'});
            encodingWriter.reset();

            // move the cursor to just beyond the current selection (so as not
            // to apply again to the replacement text).
            ed.selection.collapse(true); // collapse selection to end
        };

        /**
         * @return the number of replacements made
         */
        var replaceAll = function(fText, replacementText) {
            var ed = tinymce.activeEditor;
            var se = ed.selection;
            var w = ed.getWin();
            var undo = ed.undoManager;

            markManager.removeCurrentMark(false);

            //set selection to start of document
            ed.execCommand('selectAll');
            ed.selection.collapse(true);

            var replacedCount = 0;

            if (browser.isMSEdge()) {
                var startFrom = -1;
                while (true) {
                    var result = EdgeSearch.search(se, fText, startFrom, ed.getBody(), false);
                    var found = result[0];
                    if (found) {
                        startFrom = result[1];
                        replaceSelectedText(replacementText);
                        replacedCount++;
                    } else {
                        break;
                    }
                }
            } else {
                while (w.find(fText, false, false, false, false, false, false)) {
                    replaceSelectedText(replacementText);
                    replacedCount++;
                }
            }
            ed.undoManager.add();

            if (replacedCount === 0) {
                Confluence.EditorNotification.notify("info", ed.getLang("searchreplace_dlg.notfound"));
            } else if (replacedCount === 1) {
                Confluence.EditorNotification.notify("success", ed.getLang("searchreplace_dlg.allreplacedsingular"));
            } else if (replacedCount > 1) {
                var msg = ed.getLang("searchreplace_dlg.allreplacedplural");
                Confluence.EditorNotification.notify("success", msg.replace("{0}", replacedCount));
            }

            return replacedCount;
        };

        var destroy = function() {
            ui = null;
            markManager = null;
            encodingWriter = null;
        };

        var impl = {};

        impl.findText = findText;
        impl.replaceText = replaceText;
        impl.replaceAll = replaceAll;
        impl.destroy = destroy;

        return impl;
    };

    /* --------- The IE specific find and replace implementation. ---------- */
    SearchManager.implIE = function(uiManager) {
        var self = {};

        var ui = uiManager;
        var lastMatchTextRange = null;
        var encodingWriter = new tinymce.html.Writer();
        var createTextRange = SearchManager.utils.createTextRange;

        /**
         * Find and highlight the supplied text within the editor.
         *
         * If no previous find has been performed then find will start at the
         * beginning of the document. Otherwise the find will be from the
         * previously highlighted match. IE has no support for searching from
         * you current cursor position in the document. This is due to the bug
         * http://www.tinymce.com/develop/bugtracker_view.php?id=4215
         *
         * @param text
         *            the String to find
         * @param wrap
         *            true indicates the find should wrap
         * @param backwards
         *            true indicates the search should be backwards.
         * @return true if there was a match or false if there was none.
         */
        var findText = function(text, wrap, backwards) {
            if (!text) {
                return false;
            }

            var ed = tinymce.activeEditor;
            var doc = ed.getDoc();

            var textRange = self.storedRange = self.storedRange || doc.body.createTextRange();

            ed.focus();
            if (lastMatchTextRange) {
                // select so that the next find will be from the previous match
                // location (instead of the top of the document)
                lastMatchTextRange.select();
            }

            ed.selection.collapse(!backwards);

            clearMarks();

            // backwards searching is flakey on IE. Needs some special lovin'
            if (backwards && lastMatchTextRange) {
                // need to manually expand the TextRange to the start of the document
                var startOfDocTextRange = doc.body.createTextRange();
                startOfDocTextRange.moveToElementText($("p:first", ed.getBody())[0]);

                textRange.setEndPoint("StartToStart", startOfDocTextRange);

                // if the previous match was for the a lead part of a word or sentence then
                // lastMatchTextRange will contain the trailing part. In this scenario trimming
                // a word is not a guarantee of removing enough.
                var lastMatchText = lastMatchTextRange.text;
                if (lastMatchText.length) {
                    lastMatchText = lastMatchText.replace(/s+$/, "");

                    if (lastMatchText.length) {
                        textRange.moveEnd("character", -lastMatchText.length);
                    }
                }

                var rangeLength = textRange.text.length;
                textRange.moveEnd("word", -1);

                // if the last match had multiple markup around it e.g. it was bold AND italic then the
                // text range gets pretty corrupt and ends with heavily repeating tags.
                // You can detect this scenario by checking whether the previous move had any effect. If it didn't then
                // a second attempt at removing a character will have effect.
                if (textRange.text.length >= rangeLength) {
                    textRange.moveEnd("character", -1);
                }

                textRange.select();
                textRange.collapse(false);
            }

            lastMatchTextRange = null;

            if (textRange.findText(text, backwards ? -1 : 1, 0)) {
                textRange.scrollIntoView();
                textRange = mark(textRange);
                textRange.select();
                lastMatchTextRange = textRange;
                return true;
            } else if (wrap) {
                ed.selection.select(tinymce.activeEditor.getBody(), true);
                ed.selection.collapse(!backwards);
                return findText(text, false, backwards);
            } else {
                self.storedRange = null;
            }
        };

        /**
         * When a mark has been made in the editor listen for any changes to the
         * editor content and remove the mark.
         *
         * @param ed
         * @param cm
         *            the command that caused the event
         * @param e
         */
        var contentChangeListener = function(ed, cm, e) {
            clearMarks();
        };

        /**
         * Register Listeners to handle the clean up of marks a necessary
         */
        var registerMarkCleanUp = function() {
            var ed = tinymce.activeEditor;
            ed.onChange.add(contentChangeListener);
            ed.onBeforeSetContent.add(contentChangeListener);
        };

        /**
         * Undo any registration performed by registerMarkCleanUp. Typically
         * because there are no longer any marks in the content.
         */
        var unregisterMarkCleanUp = function() {
            var ed = tinymce.activeEditor;
            ed.onChange.remove(contentChangeListener);
            ed.onBeforeSetContent.remove(contentChangeListener);
        };

        /**
         * Add a mark around the entire textRange supplied
         *
         * @return the marked TextRange.
         */
        var mark = function(textRange) {
            var foundHtml = textRange.htmlText;
            textRange.pasteHTML(MARK_START + foundHtml + MARK_END);
            ui.marked();
            registerMarkCleanUp();
            return textRange;
        };

        var clearMarks = function() {
            unregisterMarkCleanUp();
            var ed = tinymce.activeEditor;

            var $marks = $("mark", ed.getDoc());

            if ($marks.length) {
                // is current selection inside a mark
                var cursorInMark = false;
                var container = ed.selection.getRng(true).commonAncestorContainer;

                var $container = $(container).closest("mark");
                if ($container.length) {
                    cursorInMark = true;
                }

                $marks.each(function(index, markElement) {
                    var $markElement = $(markElement);
                    $markElement.contents().each(function(index, content) {
                        $markElement.before(content);
                    });
                }).remove();

                // if IE and the cursor (selection) was in the mark, and return was pressed
                // then a yellow span will be surrounding the text being entered.
                // This fix is a little destructive in that you might be continuing a bold
                // word and you will lose that format.
                if (cursorInMark) {
                    ed.execCommand("RemoveFormat");
                }
            }

            // raise this regardless of whether a mark was removed by us
            // it could be that a block of content (e.g. a table) which contained the
            // mark was already removed and is the cause of this call.
            ui.markRemoved();
        };

        /**
         * Encapsulates the logic involved in a replace operation.
         *
         * If the 'find' text is not currently selected then a find will be
         * performed and no replacement will take place. (Hopefully the UI
         * actually prevents this case but handle it for back up.) If the 'find'
         * text is currently selected then a replace will be performed followed
         * by another 'find'.
         *
         * @param wrap
         *            a flag indicating whether the implicit find operation
         *            should wrap around.
         * @return true if the implicit find operation performed finds a match
         */
        var replaceText = function(fText, replacementText, wrap) {
            var ed = tinymce.activeEditor;

            if (lastMatchTextRange) {
                var textNode = ed.getDoc().createTextNode(replacementText);
                var $mark = $("mark", ed.getDoc());

                // remove the mark before we record the new undo level
                $mark.parent()[0].replaceChild(textNode, $mark[0]);
                ed.undoManager.add();

                // re-instate a mark around the replaced text put the mark back since the next find needs it to know where to
                // apply from
                var mark = ed.getDoc().createElement("mark");
                mark.setAttribute("class", "current");
                mark.dataset.searching = true;
                textNode.parentNode.insertBefore(mark, textNode);
                mark.appendChild(ed.getDoc().createTextNode(replacementText));
                mark.parentNode.removeChild(textNode);
            }

            return findText(fText, wrap);
        };


        /**
         * @return the number of replacements made
         */
        var replaceAll = function(fText, replacementText) {
            var ed = tinymce.activeEditor;
            var se = ed.selection;
            var w = ed.getWin();
            var undo = ed.undoManager;
            var doc = ed.getDoc();

            clearMarks();
            // set selection to start of document
            se.select(ed.getBody(), false);
            se.collapse(true);

            ed.focus();

            var r = createTextRange(doc, ed);

            var replacedCount = 0;

            while (r.findText(fText, 1, 0)) {
                r.scrollIntoView();
                r.select();

                encodingWriter.text(replacementText);
                ed.selection.setContent(encodingWriter.getContent(), {format : 'raw'});
                encodingWriter.reset();
                replacedCount++;

                // set replacementText as the basis for the next find to avoid
                // finding the same thing again when the replace text contains
                // the find term.
                r.moveStart("character", replacementText.length);
            }

            undo.add();

            if (replacedCount == 0) {
                Confluence.EditorNotification.notify("info", ed.getLang("searchreplace_dlg.notfound"));
            } else if (replacedCount == 1) {
                Confluence.EditorNotification.notify("success", ed.getLang("searchreplace_dlg.allreplacedsingular"));
            } else if (replacedCount > 1) {
                var msg = ed.getLang("searchreplace_dlg.allreplacedplural");
                Confluence.EditorNotification.notify("success", msg.replace("{0}", replacedCount));
            }

            return replacedCount;
        };

        var removeMarkOnSaveListener = function(ed, o) {
            clearMarks();
        };

        var init = function() {
            tinymce.activeEditor.onBeforeGetContent.add(removeMarkOnSaveListener);
        };

        var destroy = function() {
            tinymce.activeEditor.onBeforeGetContent.remove(removeMarkOnSaveListener);
            clearMarks();
            ui = null;
            lastMatchTextRange = null;
            encodingWriter = null;
        };

        self.findText = findText;
        self.replaceText = replaceText;
        self.replaceAll = replaceAll;
        self.destroy = destroy;

        init();

        return self;
    };

    /* --------------------------- The UI Object --------------------------- */

    /**
     * Responsible for the UI components and functionality of the SearchManager
     *
     * @param toolbarId
     *            the dom id for the toolbar
     * @param initialFindText
     *            any initial text to be populated in the find text box
     */
    SearchManager.UI = function(toolbarId, initialFindText, initialReplaceText) {

        var toolbarDom = null;
        var moveCursorToEnd = SearchManager.utils.moveCursorToEnd;

        // In unit testing the customtoolbar plugin doesn't necessarily exist
        if (tinymce.activeEditor && tinymce.activeEditor.plugins && tinymce.activeEditor.plugins.customtoolbar) {
            toolbarDom = tinymce.activeEditor.plugins.customtoolbar.getToolbarRow(toolbarId);
        }

        /**
         * @return the input field as a jQuery wrapped object.
         */
        var getFindInput = function() {
            var input = $(".toolbar-find-input", toolbarDom);
            if (!input.length) {
                return null;
            }

            return input;
        };

        var focusFindTextBox = function() {
            top.focus(); // required or else it will only work for button
            // presses (and not when activated with ctrl + F or
            // enter)
            getFindInput().focus();
        };

        /**
         * @return the input field as a jQuery wrapped object.
         */
        var getReplaceInput = function() {
            var input = $(".toolbar-replace-input", toolbarDom);
            if (!input.length) {
                return null;
            }

            return input;
        };

        /**
         * The function called when events that could affect the state of the
         * find button occur
         */
        var findButtonListener = function(event) {
            if (event.type === "input" || event.type === "propertychange") {
                var input = getFindInput();
                var enabled = (input != null) && (input.val().length > 0);
                toggleFindOperation(enabled);
                toggleDefaultButtonHighlight(enabled);
            }
        };

        /**
         * The function called when events that could affect the state of the
         * 'replace all' button occur
         */
        var replaceAllButtonListener = function(event) {
            var findInput = getFindInput();
            toggleReplaceAllOperation(findInput && findInput.val());
        };

        var bindListeners = function() {
            function bindInputChange(control, listener) {
                if (!control) {
                    return;
                }

                // IE9 requires attachEvent for binding the propertychange event
                if (tinymce.isIE9) {
                    control[0].attachEvent("onpropertychange", listener);
                } else {
                    var eventName = tinymce.isIE8 ? "propertychange" : "input";
                    control.bind(eventName, listener);
                }
            }

            // set focus in the find text box
            var findInput = getFindInput();
            bindInputChange(findInput, findButtonListener);
            bindInputChange(findInput, replaceAllButtonListener);

            $(toolbarDom).focusin(function(e) {
                toggleDefaultButtonHighlight(true);
            }).focusout(function(e) {
                toggleDefaultButtonHighlight(false);
            });

            // hiding then reshowing the searchbar does not cause a focusin on
            // the toolbar
            // but we automatically focus on the find input so use this event as
            // back up.
            findInput.focus(function(e) {
                toggleDefaultButtonHighlight(true);
            });
        };

        /**
         * @param enabled
         *            if true then enable the find button
         */
        var toggleFindOperation = function(enabled) {
            if (enabled) {
                tinymce.activeEditor.plugins.customtoolbar.enableToolbarButton("search-toolbar-find-next-button");
                tinymce.activeEditor.plugins.customtoolbar.enableToolbarButton("search-toolbar-find-previous-button");
            } else {
                tinymce.activeEditor.plugins.customtoolbar.disableToolbarButton("search-toolbar-find-next-button");
                tinymce.activeEditor.plugins.customtoolbar.disableToolbarButton("search-toolbar-find-previous-button");
            }
        };

        /**
         * Toggle whether the default search button should be highlighted or
         * not.
         */
        var toggleDefaultButtonHighlight = function(enable) {
            var findInput = getFindInput();
            getFindNextButton().toggleClass("default-action", enable && findInput.val().length > 0);
        };

        /**
         * @return the replace button as a jQuery wrapped object.
         */
        var getFindNextButton = function() {
            var buttonEl = $(".search-toolbar-find-next-button", toolbarDom).closest(".aui-button");
            if (!buttonEl.length) {
                return null;
            }

            return buttonEl;
        };

        /**
         * Called by the MarkManager when a mark is removed from the editor.
         * This method responds by disabling the replace button if it is active.
         */
        var markRemoved = function() {
            toggleReplaceOperation(false);
        };

        /**
         * Called by the MarkManager when a mark is made in the editor. This
         * method responds by activating the replace button.
         */
        var marked = function() {
            toggleReplaceOperation(true);
        };

        /**
         * @param enabled
         *            if true then enable the replace button and shortcut;
         *            otherwise disable
         */
        var toggleReplaceOperation = function(enabled) {
            var toolbar = tinymce.activeEditor.plugins.customtoolbar;
            var buttonClass = "search-toolbar-replace-button";

            if (enabled) {
                toolbar.enableToolbarButton(buttonClass);
            } else {
                toolbar.disableToolbarButton(buttonClass);
            }
        };

        /**
         * @param enabled
         *            if true then enable the replace all button and shortcut;
         *            otherwise disable
         */
        var toggleReplaceAllOperation = function(enabled) {
            var toolbar = tinymce.activeEditor.plugins.customtoolbar;
            var buttonClass = "search-toolbar-replaceall-button";

            if (enabled) {
                toolbar.enableToolbarButton(buttonClass);
            } else {
                toolbar.disableToolbarButton(buttonClass);
            }
        };

        /**
         * Initialise the UI parts.
         */
        var init = function(findText, replaceText) {
            var findInput = getFindInput();
            var enableButtons = false;
            if (findText && findText.length) {
                findInput.val(findText);
                enableButtons = true;
            }

            if (replaceText && replaceText.length) {
                var replaceInput = getReplaceInput();
                replaceInput.val(replaceText);
            }

            bindListeners();

            toggleFindOperation(enableButtons);
            toggleReplaceAllOperation(enableButtons);
            // replace always disabled on init since there will be no marks in
            // the document (closing the searchbar removes any marks).
            toggleReplaceOperation(false);
        };

        var onVisible = function() {
            var findInput = getFindInput();
            findInput.focus();

            if (findInput.val().length > 0) {
                moveCursorToEnd(findInput[0]);
                toggleFindOperation(true);
                toggleReplaceAllOperation(true);
            }
        };

        /**
         * Called when the UI (search bar) has been closed and should unbind any
         * listeners that are still attached.
         */
        var destroy = function() {
            // nothing doing
        };

        /*
         * ---- Public methods (for the SearchManager instance) ----
         */
        var SearchManagerUI = {};

        SearchManagerUI.getFindInput = getFindInput;
        SearchManagerUI.getReplaceInput = getReplaceInput;
        SearchManagerUI.focusFindTextBox = focusFindTextBox;
        SearchManagerUI.onVisible = onVisible;
        SearchManagerUI.destroy = destroy;

        /*
         * ----------------------- MarkManager Listener methods ----------------------
         */
        SearchManagerUI.marked = marked;
        SearchManagerUI.markRemoved = markRemoved;

        /*
         * ------------------------ initialise the UI object -------------------------
         */

        init(initialFindText, initialReplaceText);
        return SearchManagerUI;
    };

    /**
     * Manage the marking (and removal of marks) within the editor contents.
     *
     * Only one mark is possible at a time and this manager will ensure that
     * this contract is maintained.
     *
     * A mark will be removed as soon as any change (onChange) occurs within the
     * editor.
     *
     */
    SearchManager.MarkManager = function() {

        /** jQuery wrapped current mark element. There may be multiple mark elements within this jQuery object */
        var currentMark = null;
        var encodingWriter = new tinymce.html.Writer();

        /**
         * If unable to mark the last match then currentMark will be null but this field will record the text
         * matched so that we can check Editor selection is still a match.
         */
        var unMarkableSearchTerm = null;

        var listeners = [];

        /**
         * When a mark has been made in the editor listen for any changes to the
         * editor content and remove the mark.
         *
         * @param ed
         * @param cm
         *            the command that caused the event
         * @param e
         */
        var contentChangeListener = function(ed, cm, e) {
            // A return keypress in a mark will split the mark into
            // two even before this listener gets called. So remove all
            // marks to cover the case where multiple marks have been
            // created.
            removeAllMarks();
        };

        /**
         * Add a listener to be called when a mark is removed.
         *
         * @param listener
         *            the listener which should implement the functions
         *            markRemoved() and marked().
         */
        var addListener = function(listener) {
            listeners.push(listener);
        };

        /**
         * Select the current mark in the Editor if there is one. Otherwise
         * nothing will be done.
         *
         * @return the editor selection if there was a mark, otherwise null.
         */
        var selectCurrentMark = function() {
            if (!currentMark) {
                return null;
            }

            var ed = tinymce.activeEditor;

            ed.selection.select(currentMark[0]);
            return ed.selection;
        };

        /**
         * Mark the currently selected range in the Editor.
         */
        var markCurrentlySelectedRange = function() {
            var ed = tinymce.activeEditor;

            if (currentMark) {
                // store and re set the find result selection since
                // removing the mark can lose the selection in some
                // browsers in some cases
                var bookmark = ed.selection.getBookmark();
                removeCurrentMark(false);
                ed.selection.moveToBookmark(bookmark);
            }

            unMarkableSearchTerm = null;

            var range = ed.selection.getRng(true);

            currentMark = $(MARK_START + MARK_END, ed.getDoc());

            // A find result can encompass only part of a non text node. e.g. in the term ban<b>ana</b>
            // if the find matched the text 'banan' then you are unable to wrap this in a single
            // <mark> element. See http://www.w3.org/TR/DOM-Level-2-Traversal-Range/ranges.html#Level-2-Range-Surrounding.
            try {
                range.surroundContents(currentMark[0]);
                registerMarkCleanUp(false);
            } catch (err) {
                if (err.code == 1) {
                    // the match will be selected, so we will put the MarkManager into a
                    // mode where it knows the currentMark is actually just a selection
                    // matching a particular search term. i.e. no explicit <mark>
                    // can be used in this scenario.
                    unMarkableSearchTerm = range.toString();
                    currentMark = null;
                    registerMarkCleanUp(true);
                }
            }

            $.each(listeners, function(index, listener) {
                listener.marked();
            });

            if (!unMarkableSearchTerm) {
                // Now select inside the mark (but collapse so that it doesn't appear selected).
                // This is so that for subsequent finds we can decide whether to
                // continue from the last mark or instead from the cursor position i.e. the user
                // may have clicked their cursor elsewhere in the document to skip some text.
                selectCurrentMark().collapse();
            }

            // if unmakableMatch then leave the match selected which is the best we can do by way
            // of a highlight
        };

        var isCursorAtCurrentMark = function() {
            if (!currentMark) {
                return false;
            }

            var ed = tinymce.activeEditor;
            var selection = ed.selection;

            if (!selection.isCollapsed()) {
                selection.collapse();
            }

            var range = selection.getRng(true);
            if (range.startContainer.nodeType === 3) {
                // a substring find match will usually result in an element in
                // bad need of normalization (loads of empty text nodes)
                range.startContainer.parentNode.normalize();
                return range.startContainer.nextSibling === currentMark[0] || range.startContainer.previousSibling === currentMark[0];
            } else if (range.startContainer.nodeType === 1) {
                var childNodes = range.startContainer.childNodes;
                var selectionOffset = range.startOffset;
                if (selectionOffset > 0 && childNodes[selectionOffset - 1] === currentMark[0]) {
                    return true;
                }

                if ((selectionOffset + 1) < childNodes.length && childNodes[selectionOffset + 1 === currentMark[0]]) {
                    return true;
                }

                return false;
            }
        };

        /**
         * Remove the current mark if set.
         *
         * @param select
         *            if true then the browser selection will be set immediately
         *            after the mark. if false then the original browser
         *            selection will be maintained.
         */
        var removeCurrentMark = function(select) {
            unregisterMarkCleanUp();

            if (removeMark(currentMark, select) || (unMarkableSearchTerm && tinymce.activeEditor.selection.getRng(true).toString() == unMarkableSearchTerm)) {
                currentMark = null;
                unMarkableSearchTerm = null;

                $.each(listeners, function(index, listener) {
                    listener.markRemoved();
                });
            }
        };

        var removeAllMarks = function() {
            unregisterMarkCleanUp();
            $("mark", tinymce.activeEditor.getDoc()).each(function(index, markElement) {
                var removed = removeMark($(markElement), false);
            });

            currentMark = null;
            unMarkableSearchTerm = null;

            $.each(listeners, function(index, listener) {
                listener.markRemoved();
            });
        };

        /**
         * Remove the supplied mark.
         *
         * @param mark
         *            a jQuery wrapped mark element
         * @param select
         *            if true then the browser selection will be set to the
         *            content of the mark
         * @return true if mark removed or false otherwise
         */
        var removeMark = function(mark, select) {
            var currentSelectionRange = tinymce.activeEditor.selection.getRng(true);

            if (!mark) {
                return false;
            }

            function isCurrentSelectionInMark(selRange, mark) {
                // Firefox doesn't support intersectsNode
                if (selRange.intersectsNode) {
                    return selRange.intersectsNode(mark);
                } else {
                    var markRange = tinymce.activeEditor.getDoc().createRange();
                    markRange.selectNodeContents(mark);

                    if (selRange.compareBoundaryPoints(Range.START_TO_END, markRange) <= 0 ||
                            selRange.compareBoundaryPoints(Range.END_TO_START, markRange) >= 0) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }

            var selectionInMark = isCurrentSelectionInMark(currentSelectionRange,mark[0]);

            var firstContent = null;
            var lastContent = null;
            mark.contents().each(function(index, content) {
                mark.before(content);

                if (!firstContent) {
                    firstContent = content;
                }

                lastContent = content;
            });

            if (selectionInMark || select) {
                // the selection will have been lost so re-instate
                var range = tinymce.activeEditor.selection.getRng(true);
                range.setStartBefore(firstContent);
                range.setEndAfter(lastContent);

                if (!select) {
                    range.collapse(false);
                }

                tinymce.activeEditor.selection.setRng(range);
            }

            mark.remove();
            return true;
        };

        var hasCurrentMark = function() {
            if (currentMark) {
                return true;
            }

            if (unMarkableSearchTerm) {
                return tinymce.activeEditor.selection.getRng(true).toString() == unMarkableSearchTerm;
            }
        };

        /**
         * Replace the current mark if we have a valid unMarkableSearchTerm matching a selection.
         *
         * @return the true if replacement occurred or false otherwise.
         */
        var replaceCurrentMarkWhenUnmarkable = function(text) {
            if (currentMark || !hasCurrentMark()) {
                return false;
            }

            var ed = tinymce.activeEditor;

            encodingWriter.text(text);
            ed.selection.setContent(encodingWriter.getContent(), {format : 'raw'});
            encodingWriter.reset();
            ed.undoManager.add();

            removeCurrentMark(false);
            return true;
        };

        /**
         * Replace the current mark with the supplied text. If
         * there is no current mark then no action will be taken.
         *
         * The current mark is removed by this function.
         *
         * @param text the text to set as the content of the current mark
         * @return the DOM Node representing the new text added or null if no current mark
         */
        var replaceCurrentMark = function(text) {
            if (replaceCurrentMarkWhenUnmarkable(text)) {
                return null;
            }

            if (!currentMark) {
                return null;
            }

            // get the content of the current mark
            var markedContent = [];
            currentMark.contents().each(function(index, element) {
                markedContent.push(element);
            });

            // remove the mark
            removeCurrentMark(false);

            var ed = tinymce.activeEditor;

            // add the new text node as a previous sibling of the first mark content
            var replacement = $(markedContent[0]).before(ed.getDoc().createTextNode(text))[0].previousSibling;

            // remove each of the current mark content
            for (var i = markedContent.length - 1; i >= 0; i--) {
                $(markedContent[i]).remove();
            }

            ed.undoManager.add();

            return replacement;
        };

        var removeMarkOnSaveListener = function(ed, o) {
            removeAllMarks();
        };


        var mouseListener = function(ed, e) {
            unregisterMarkCleanUp();
            $.each(listeners, function(index, listener) {
                listener.markRemoved();
            });
        };

        /**
         * Register Listeners to handle the clean up of marks a necessary
         *
         * @param unmarkable if true then no mark element was created.
         */
        var registerMarkCleanUp = function(unmarkable) {
            var ed = tinymce.activeEditor;
            ed.onChange.add(contentChangeListener);
            ed.onBeforeSetContent.add(contentChangeListener);

            if (unmarkable) {
                // then we are relying on editor selection for a mark
                // if the user clicks away in the Editor then the selection
                // changes
                ed.onClick.add(mouseListener);
                ed.onDblClick.add(mouseListener);
            }
        };

        /**
         * Undo any registration performed by registerMarkCleanUp. Typically
         * because there are no longer any marks in the content.
         */
        var unregisterMarkCleanUp = function() {
            var ed = tinymce.activeEditor;
            ed.onChange.remove(contentChangeListener);
            ed.onBeforeSetContent.remove(contentChangeListener);

            ed.onClick.remove(mouseListener);
            ed.onDblClick.remove(mouseListener);
        };

        var init = function() {
            tinymce.activeEditor.onBeforeGetContent.add(removeMarkOnSaveListener);
        };

        var destroy = function() {
            removeCurrentMark(true);
            tinymce.activeEditor.onBeforeGetContent.remove(removeMarkOnSaveListener);
        };

        /* ------------------------- public methods ------------------------- */
        var MarkManager = {};

        MarkManager.markCurrentlySelectedRange = markCurrentlySelectedRange;
        MarkManager.removeCurrentMark = removeCurrentMark;
        MarkManager.removeAllMarks = removeAllMarks;
        MarkManager.selectCurrentMark = selectCurrentMark;
        MarkManager.isCursorAtCurrentMark = isCursorAtCurrentMark;
        MarkManager.hasCurrentMark = hasCurrentMark;
        MarkManager.replaceCurrentMark = replaceCurrentMark;
        MarkManager.addListener = addListener;
        MarkManager.destroy = destroy;

        init();
        return MarkManager;
    };

    return SearchManager;
});

require('confluence/module-exporter')
        .exportModuleAsGlobal('confluence-editor/tinymce3/plugins/searchreplace/searchreplace', 'Confluence.Editor.SearchManager');
