/**
 * @module confluence-editor/tinymce3/plugins/autocomplete/autocomplete-control
 */
define('confluence-editor/tinymce3/plugins/autocomplete/autocomplete-control', [
    'ajs',
    'jquery',
    'confluence/legacy',
    'confluence-editor/tinymce3/plugins/autocomplete/autocomplete-settings',
    'document'
], function(
    AJS,
    $,
    Confluence,
    AutocompleteSettings,
    document
) {
    "use strict";

    /**
     * This element wraps the search text and the trigger (if present).
     */
    var AUTOCOMPLETE_ID = "autocomplete";

    /**
     * This element wraps the trigger character (e.g. @, [, !)
     */
    var AUTOCOMPLETE_TRIGGER_ID = "autocomplete-trigger";

    /**
     * This element contains the text the user is searching for - it should always hold the cursor.
     */
    var AUTOCOMPLETE_SEARCH_TEXT_ID = "autocomplete-search-text";

    /**
     * Selects the word at the cursor and returns the word and the left/top location of the
     * bottom-left corner of the first word.
     *
     * @param options An options map including:
     *     - leadingChar: trigger character used to launch autocomplete
     *     - dontSuggest: Don't search based on text typed in the autocomplete span
     *     - backWords: the number of words to search backwards for
     *     - classNames: an optional string with space-separated classes to add to the main autocomplete control
     *     - insertedFromMenu: an optional boolean that prevents text from being added if the autocomplete is cancelled
     */
    var AutocompleteControl = function (ed, options) {

        var log = AutocompleteSettings.log("Autocompleter.Control");
        var tinymce = require('tinymce');

        /**
         * The Control to be returned.
         */
        var control = {};
        var selection = ed.selection;
        var rng = selection.getRng(true);
        var cursorPos = rng.startOffset;
        var node = rng.startContainer;
        var nodeText = node.nodeValue;
        var leadingChar = options.leadingChar;
        var doc = ed.getDoc();
        var backWords = options.backWords || 0;
        var insertedFromMenu = options.insertedFromMenu || false;
        var settings = AutocompleteSettings.Settings[leadingChar || "["]; // default to link
        var preventStartNodes = (!settings || typeof settings.preventStartNodes === "undefined") ? "div.code, a[href], img, pre" : settings.preventStartNodes;

        if ($("#" + AUTOCOMPLETE_ID, doc).length) {
            AJS.debug("init", "Autocomplete already exists, returning null.");
            return null;
        }
        control.backWords = backWords;
        control.maxResults = options.maxResults || 10;

        // Cursor may be in a <p> just outside of a TextNode, check for child node at startOffset
        if (nodeText == null && rng.collapsed && cursorPos && node.childNodes[cursorPos - 1]) {
            node = node.childNodes[cursorPos - 1];  // to the LEFT of the cursor
            nodeText = node.nodeValue;
            cursorPos = (nodeText && nodeText.length) || 0;
        }
        var text = "";
        // Cursor may still not be in a Text node, in which leave the text empty.
        if (nodeText != null) {
            text = (nodeText + "").substring(0, cursorPos);
            var pnode = node.previousSibling;
            while (pnode && pnode.nodeType === 3) {
                // add the text from any previous TextNodes
                text = pnode.nodeValue + text;
                pnode = pnode.previousSibling;
            }
        }

        function matchAnyExceptions(input, regExExceptions) {
            for (var i = 0, l = regExExceptions.length; i < l; i++) {
                if (regExExceptions[i].test(input)) {
                    return true;
                }
            }
            return false;
        }

        var regExExceptions = [
            // Disable trigger chars at the end of the certain strings e.g. “Hi there!”.
            // The regex allows "'<( left" and left' before the [ trigger and space, zero-width space, &nbsp; and em-dash
            // before all triggers.
            /([("'<\(\u201c\u2018]\[|[\ufeff\u200b\u2014\s\xa0].)$/,

            // allow parenthesis before trigger characters, except for !, as (!) is an emoticon autoformat shortcut
            /(\([^!])$/,

            //CONDEF-21873: allow supporting "//"
            /(\/\/)$/
        ];

        if (!backWords && text && !matchAnyExceptions(text + leadingChar, regExExceptions)) {
            log("init", "Cursor is in wrong word location to start autocomplete, returning null.");
            return null;
        }
        var $node = $(node);
        if ($node.closest(preventStartNodes).length) {
            log("init", "Cursor is in wrong node to start autocomplete, returning null.");
            return null;
        }

        if (Confluence.PropertyPanel && Confluence.PropertyPanel.current) {
            Confluence.PropertyPanel.shouldCreate = false;
            Confluence.PropertyPanel.destroy();
        }

        if (!leadingChar && nodeText == null) {
            AJS.debug("init", "No text available for suggestion, range is", rng);

            // TODO - handle this (and weird TextNodes)
            nodeText = "";
        }

        /**
         * Returns a jQuery-wrapped reference to the autocomplete container.
         */
        control.getContainer = function () {
            return $("#" + AUTOCOMPLETE_ID, doc);
        };

        /**
         * Starting at the given endpoint, search backward through text nodes until the requested number of words are
         * found.
         * @param node
         * @param offset
         * @param backWords
         */
        function findRangeStart(node, offset, backWords) {
            var nodeText;
            var pNode;

            // TODO - not this. See http://stackoverflow.com/questions/273789/is-there-a-version-of-javascripts-string-indexof-that-allows-for-regular-expre
            function regexLastIndexOf(str, regex, startpos) {
                !regex.global && (regex = new RegExp(regex.source, "g" + "i".slice(0, regex.ignoreCase) + "m".slice(0, regex.multiLine)));
                if (startpos == null) {
                    startpos = str.length;
                } else if (startpos < 0) {
                    startpos = 0;
                }
                var stringToWorkWith = str.substring(0, startpos + 1);
                var lastIndexOf = -1;
                var nextStop = 0;
                var result;
                while ((result = regex.exec(stringToWorkWith)) != null) {
                    lastIndexOf = result.index;
                    regex.lastIndex = ++nextStop;
                }
                return lastIndexOf;
            }

            for (var i = 0; i < backWords; i++) {
                nodeText = node.nodeValue.substring(0, offset);
                offset = regexLastIndexOf(nodeText, (/\s+/), offset);
                while (offset == -1) {
                    pNode = node.previousSibling;
                    if (pNode && pNode.nodeType === 3) {
                        node = pNode;
                        nodeText = pNode.nodeValue;
                        if (nodeText) {
                            offset = regexLastIndexOf(nodeText, (/\s+/), nodeText.length);
                        }
                    } else {
                        i = backWords;  // no point looking further
                        break;
                    }
                }
            }

            return {
                node: node,
                offset: offset + 1
            };
        }

        if (rng.collapsed && backWords && nodeText) {
            var rangeStart = findRangeStart(node, cursorPos, backWords);

            // Select from the cursor back to the start of the first word
            if (tinymce.isIE && backWords == 1) {
                var range = selection.getRng();
                range.moveStart("character", rangeStart.offset - cursorPos);
                range.select();
            } else {
                range = selection.getRng(true);
                range.setStart(rangeStart.node, rangeStart.offset);
                range.setEnd(node, cursorPos);
                selection.setRng(range);
            }
        }
        // Use the existing selection as the search term IF IT'S NOT a task list placeholder
        // TODO - html format is failing due to our preProcess on serializer. Fix that.
        var suggestionHtml;

        if (selection && selection.getNode() && selection.getNode().classList.contains('placeholder-inline-tasks')) {
            // We don't want placeholder text to be used as an autocomplete search term
            suggestionHtml = '';
        } else {
            suggestionHtml = selection.getContent({format: 'text'}).replace('\n', '');
        }

        log("init", "suggestionHtml", suggestionHtml);

        var el = AJS("span").attr("id", AUTOCOMPLETE_ID);
        if (options.classNames) {
            el.addClass(options.classNames);
        }

        if (leadingChar) {
            el.append(AJS("span").attr("id", AUTOCOMPLETE_TRIGGER_ID).text(leadingChar));
        }

        var $searchTextSpan = AJS("span").attr("id", AUTOCOMPLETE_SEARCH_TEXT_ID);
        $searchTextSpan.text(AJS.Rte.HIDDEN_CHAR);
        el.append($searchTextSpan);
        selection.setNode(el[0]);

        var autocompleteSpan = control.getContainer();
        control.previousSearchText = "";
        control.settings = settings;

        //Add cache to settings for this completer if it doesn't already exist
        if (settings.cache !== false && !settings.cacheManager) {
            settings.cacheManager = new AJS.Confluence.localStorageCacheManager(settings.ch);
        } else if (settings.cache === false && !settings.cacheManager) {
            //fake cache
            settings.cacheManager = {get: $.noop, put: $.noop};
        }

        // Put the cursor inside the new span, at the end.
        var searchNode = $("#" + AUTOCOMPLETE_SEARCH_TEXT_ID, control.getContainer());
        var selNode = $(doc.createElement("span")).text(suggestionHtml || AJS.Rte.HIDDEN_CHAR);
        searchNode.empty().append(selNode);
        selection.select(selNode[0], true);
        selection.collapse();

        // Events
        var before = function (ed, e) {
            if (control.onBeforeKey && !control.onBeforeKey(e, control.text())) {
                tinymce.dom.Event.cancel(e);
                log("before", "blocked by onBeforeKey: " + e.keyCode);
                return false;
            }
        };
        var after = function (ed, e) {
            var rng = selection.getRng(true);
            var span = control.getContainer();
            var node = rng.startContainer;
            var parent = node.parentNode;
            node.nodeType === 3 && (parent = parent.parentNode);
            var grandpa = parent ? parent.parentNode : null;
            //CONDEF-21873: fix the issue in IE8
            var parentOfGranpd = grandpa ? grandpa.parentNode : null;
            var outsideSearchSpan = (parent !== span[0]) &&
                    (grandpa !== span[0]) &&
                    (parentOfGranpd !== span[0]);
            if (e.keyCode === 27 || outsideSearchSpan) {
                log("after", "dying because of: " + (outsideSearchSpan ? "outside search span" : "escape pressed"));
                control.die();
            } else if (control.onAfterKey && !control.onAfterKey(e, control.text())) {
                tinymce.dom.Event.cancel(e);
                log("after", "blocked by onAfterKey: " + e.keyCode);
                return false;
            }
        };
        var press = function (ed, e) {
            if (control.onKeyPress && !control.onKeyPress(e, control.text())) {
                tinymce.dom.Event.cancel(e);
                log("press", "blocked by onKeyPress: " + e.keyCode);
                return false;
            }
        };
        var click = function (ed, e) {
            if (control.getContainer()[0] != e.target.parentNode) {
                log("click", "Clicked outside of autocomplete, closing.");
                control.die();
            }
        };
        ed.onKeyDown.addToTop(before);
        ed.onKeyUp.addToTop(after);
        ed.onKeyPress.addToTop(press);
        ed.onClick.addToTop(click);


        // For Recent History and certain other searches, ignore the selected text for searching.
        control.word = "";
        if (!options.keepAlias) {
            control.word = suggestionHtml;
        } else {
            log("init", "No suggestion based on previous or selected text");
        }

        AJS.Rte.showElement(autocompleteSpan[0]);

        function positionControl() {
            var position = tinymce.DOM.getPos(autocompleteSpan[0]);
            var height = autocompleteSpan.height();
            control.left = position.x;
            control.top = position.y + height;
        }

        positionControl();
        control.text = function (text) {
            var span = $("#" + AUTOCOMPLETE_SEARCH_TEXT_ID, control.getContainer());
            if (text != null) {
                span.html(text);
                return this;
            } else {
                text = AJS.escapeEntities(span.text());
                return text.replace(AJS.Rte.HIDDEN_CHAR, "");
            }
        };

        control.plainText = function (text) {
            var span = $("#" + AUTOCOMPLETE_SEARCH_TEXT_ID, control.getContainer());
            if (text != null) {
                span.text(text);
                return this;
            } else {
                text = span.text();
                return text.replace(AJS.Rte.HIDDEN_CHAR, "");
            }
        };

        /**
         * Replaces the autocomplete component with the given text, which may be empty.
         * If the given text IS empty, it will always be collapsed.
         * If the collapse parameter is true, the range will be collapsed at the end of the text.
         * @param text  string to replace autocomplete with
         * @param collapse if true, collapse range to end of text, else select text
         */
        var replaceWithTextAndGetRange = function (text, collapseToEnd) {
            var element = control.getContainer();
            return AutocompleteControl.replaceWithTextAndGetRange(element, text, collapseToEnd);
        };

        control.replaceWithSelectedSearchText = function () {
            // Get the autocomplete search text and select the entire autocomplete
            var replaceText = control.text();
            log("replaceWithSelectedSearchText", replaceText);
            replaceWithTextAndGetRange(replaceText, false);
            return replaceText;
        };

        control.die = function (notrigger) {
            if (control.dying) {
                AJS.debug("die", "Already dying, returning.");
                return;
            }
            control.dying = true;
            if (Confluence.PropertyPanel) {
                Confluence.PropertyPanel.shouldCreate = true;
            }
            var container = control.getContainer();
            if (container.length) {
                log("die", "Tearing down autocomplete, cleaning up autocompleter");
                // Replace autocomplete span with its current text
                var replaceText = ((notrigger || options.backWords || insertedFromMenu) ? "" : control.settings.ch) + control.text();
                rng = replaceWithTextAndGetRange(replaceText, true);
            }

            // Removing handlers while actually processing handlers (as is often the case for 'done' calls)
            // can mean certain handlers are skipped (e.g. currently processing handler[0] - once it is removed
            // the older handler[1] becomes handler[0] and will be skipped. (This causes CONFDEV-7485.)
            // Hence, remove the handlers later
            setTimeout(function () {
                log("die", "Removing autocomplete-control keyboard listeners.");
                ed.onKeyDown.remove(before);
                ed.onKeyUp.remove(after);
                ed.onClick.remove(click);
                ed.onKeyPress.remove(press);
            }, 1);

            AJS.Rte.unbindScroll("autocomplete");
            $(document).unbind("click.autocomplete-outside");
            this.onDeath && this.onDeath();
        };

        AJS.Rte.bindScroll("autocomplete", function (e) {
            AJS.debug("scrolling:", e);
            if (!AJS.Rte.isAnyPartShown(autocompleteSpan)) {
                control.die();
            } else {
                control.onScroll();
            }
        });
        $(document).bind("click.autocomplete-outside", function (e) {
            // true if click event corresponds to inserting the date from the "insert more content" menu
            var insertDateFromMenuClicked = e.srcElement && (e.srcElement.id === 'rte-insert-date');
            // ui-datepicker-header is included because jQuery UI is detaching the datepicker header before the event
            // propagates up (preventing the check to see if it's a child of the AUI datepicker)
            if (!$(e.target).closest("#autocomplete-dropdown, .aui-datepicker-dialog, .ui-datepicker-header").length && !insertDateFromMenuClicked) {
                control.die();
            }
        });
        AJS.Rte.getEditor().onBeforeExecCommand.add(function (ed, cmd) {
            if (cmd == "mceConfSavePage") {
                control.die();
            }
        });
        control.update = function (data) {
            AJS.Rte.BookmarkManager.storeBookmark();
            replaceWithTextAndGetRange("", true);
            this.settings.update(this, data);
        };

        control.removeSpan = function () {
            control.getContainer().remove();
        };
        return control;
    };

    /**
     * Finds and removes an orphan autocomplete control. Contents of control are
     * replaced with the text content of the control and the text is then selected in the editor.
     *
     * @return {
     *   leadingChar: trigger character used to launch autocomplete
     *   content: search text contained in control
     * }
     */
    AutocompleteControl.removeOrphanedControl = function () {
        var doc = $(AJS.Rte.getEditor().getDoc());
        var placeholder = doc.find('#' + AUTOCOMPLETE_ID);
        var leadingChar;
        var content;
        if (!placeholder.length) {
            return null;
        }
        leadingChar = doc.find('#' + AUTOCOMPLETE_TRIGGER_ID).text();
        content = doc.find('#' + AUTOCOMPLETE_SEARCH_TEXT_ID).text();

        AutocompleteControl.replaceWithTextAndGetRange(placeholder, content, false);

        return {
            leadingChar: leadingChar,
            content: content
        };
    };

    /**
     * Replaces the autocomplete component with the given text, which may be empty.
     * If the given text IS empty, it will always be collapsed.
     * If the collapse parameter is true, the range will be collapsed at the end of the text.
     * @param text  string to replace autocomplete with
     * @param collapse if true, collapse range to end of text, else select text
     */
    AutocompleteControl.replaceWithTextAndGetRange = function (element, text, collapseToEnd) {
        if (!element.length) {
            AJS.log("replaceWithTextAndGetRange Error: attempting to replace a non-existent element");
            return;
        }
        text = text || "";
        collapseToEnd = collapseToEnd || !text;

        var ed = AJS.Rte.getEditor();
        var rng;
        var parent = element[0].parentNode;
        var cursorPosition = AJS.Rte.Content.getChildIndex(parent, element[0]);
        var offset = collapseToEnd ? 1 : 0;

        rng = ed.selection.getRng(true);
        rng.setStart(parent, cursorPosition + offset);

        rng.setEnd(parent, cursorPosition + 1);
        element.before(text || AJS.Rte.HIDDEN_CHAR).remove();
        ed.selection.setRng(rng);

        return rng;
    };

    return AutocompleteControl;
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/tinymce3/plugins/autocomplete/autocomplete-control', 'Confluence.Editor.Autocompleter.Control');
