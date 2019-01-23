/**
 * @module confluence-editor/tinymce3/plugins/autocomplete/autocomplete-manager
 */
define('confluence-editor/tinymce3/plugins/autocomplete/autocomplete-manager', [
    'ajs',
    'jquery',
    'window',
    'confluence-editor/tinymce3/plugins/autocomplete/autocomplete-settings',
    'confluence-editor/tinymce3/plugins/autocomplete/autocomplete-control'
], function(
    AJS,
    $,
    window,
    AutocompleteSettings,
    AutocompleteControl
) {
    "use strict";
    // The namespace has been changed from tinymce.confluence.
    // This is to avoid the fact that the plugin must be available for TinyMCE initialisation yet the
    // tinymce.confluence is set during loading of TinyMCE. It is tricky to arrange scripts such
    // that the autocomplete resources load after tinymce.confluence is set but before TinyMCE
    // initialises.

    var log = AutocompleteSettings.log("Autocompleter.Manager");

    /**
     * There will only be one autoCompleteControl active at a time so a reference to it can be shared across methods.
     */
    var autoCompleteControl;

    /**
     *  The input driven dropdown component that does most of the work.
     */
    var idd;

    /**
     * Called when the user hits a key combination at the end of some text to autocomplete.
     * If there is no text at the cursor, the user's Recent History is displayed instead.
     *
     * options include:
     *  - leadingChar       determines the type of autocomplete, e.g. [ , !
     *  - backWords         the number of words to search backwards for
     *  - selectFirstItem   true/false, whether or not the first item in the drop down should be selected
     *  - dropDownDelay     the delay in milliseconds before the dropdown will be opened. Used to delay AJAX
     *                      requests. Defaults to 200ms.
     *  - minLengthForGetData The minimum number of characters typed in the autocomplete before a change is triggered.
     *                      Defaults to 2.
     *  - displayHandler    a function that returns the HTML of each dropdown item's span element.
     *  - Highlighter       a constructor function returning an alternative to the confluence/highlighter module
     */
    var startAutoComplete = function (options) {
        var synchronyId = 'confluence.autocomplete-plugin';

        var settings = AutocompleteSettings.Settings[options.leadingChar];
        options = $.extend({
            minLengthForGetData: settings.minLengthForGetData,
            displayHandler: settings.displayHandler,
            Highlighter: settings.Highlighter,
            classNames: settings.autocompleteClassNames
        }, options);

        autoCompleteControl = AutocompleteControl(AJS.Rte.getEditor(), options);
        if (!autoCompleteControl) {
            return false;
        }

        AJS.trigger('synchrony.stop', { id: synchronyId });

        function getDropdownItemProperties(itemElement) {
            return $.data(itemElement, "properties");
        }

        var selectionHandler = function (e, selection) {
            e.preventDefault();
            var result = getDropdownItemProperties(selection[0]);
            if (result && typeof result.callback === "function") {
                result.callback(autoCompleteControl);
            } else if (result.className !== "menu-header") {
                autoCompleteControl.update(result);
            }

            autoCompleteControl.die();
        };
        var moveHandler = function (selection, dir) {
            var current = AJS.dropDown.current;
            if (selection && selection.find("a").is(".menu-header")) {
                dir == "up" ? current.moveUp(): current.moveDown();
            }
        };

        var winWidth = $(window).width();
        var preferredPosition;

        var POSITION_ABOVE = 1;
        var POSITION_BELOW = 2;

        var getPreferredPosition = function(spaceAvailable, heightRequired) {
            if(spaceAvailable.below >= heightRequired) {
                return POSITION_BELOW;
            } else if(spaceAvailable.above >= heightRequired) {
                return POSITION_ABOVE;
            }
            // Not enough space - so use biggest space
            return spaceAvailable.below > spaceAvailable.above ? POSITION_BELOW : POSITION_ABOVE;
        };

        var dropDownStillFits = function(spaceAvailable, heightRequired) {
            if(preferredPosition == POSITION_ABOVE) {
                return spaceAvailable.above >= heightRequired;
            }
            return spaceAvailable.below >= heightRequired;
        };

        var placedropdown = function ($dropdown) {
            var $parent = $("#autocomplete-dropdown");
            var anchor = autoCompleteControl.getContainer();
            var spaceAvailable;
            var top;
            var left;
            var offset;
            var overlap;
            var $arrow;
            var gapForArrowY = 10;
            var gapForArrowX = 0;
            var ddHeight;
            var heightRequired;

            if (!$parent.length) {
                $parent = AJS("div").addClass("aui-dd-parent quick-nav-drop-down").attr("id", "autocomplete-dropdown").appendTo("body");
            }

            spaceAvailable = AJS.Position.spaceAboveBelow(AJS.Rte.getEditorFrame(), anchor);

            // Ensure correct styling so height calcs are correct
            $dropdown.find("ol:has(a.menu-header)").addClass("top-menu-item");
            $dropdown.find("ol:empty").hide();
            // Height of dd changes after adding to parent (due to css), so do this first
            $parent.append($dropdown);

            offset = AJS.Rte.Content.offset(anchor);

            overlap = Math.max($parent.width() + offset.left - winWidth + 10, 0);
            left = offset.left - overlap - gapForArrowX;
            ddHeight = $dropdown.outerHeight(true);
            heightRequired = ddHeight + gapForArrowY;

            if(preferredPosition) {
                // Favour current position unless it doesn't fit
                // we don't want the drop down to keep changing relative position.
                if(!dropDownStillFits(spaceAvailable, heightRequired)) {
                    preferredPosition = null;
                }
            }

            if(!preferredPosition) {
                preferredPosition = getPreferredPosition(spaceAvailable, heightRequired);
            }

            $arrow = $parent.find(".autocomplete-dropdown-arrow");
            if (!$arrow.length) {
                $arrow = $("<div>")
                    .addClass("autocomplete-dropdown-arrow")
                    .addClass(autoCompleteControl.settings.autocompleteClassNames);
            }

            if(preferredPosition === POSITION_ABOVE) {
                $arrow.addClass('autocomplete-dropdown-bottom-arrow').css({ top: ddHeight - 1 });
                top = offset.top - ddHeight - gapForArrowY;
            } else {
                $arrow.removeClass('autocomplete-dropdown-bottom-arrow').css('top', '');
                top = offset.top + anchor.height() + gapForArrowY;
            }

            // Append and position the dropdown notch
            $arrow.css({ left: overlap }).appendTo($parent);

            $parent.css({
                position: "absolute",
                top: top,
                left: left
            });
        };

        idd = AJS.inputDrivenDropdown({
            onShow : function (dd) {
                AJS.trigger("rte-autocomplete-on-show", { triggerChar: autoCompleteControl.settings.ch });

                var iframe = AJS.Rte.getEditorFrame();
                iframe && iframe.shim && iframe.shim.hide();

                dd.find("a.menu-header").unbind().click(function (e) {
                    e.preventDefault();
                    autoCompleteControl.die();
                });
                this.reset();

                if (autoCompleteControl.settings.selectFirstItem && dd.find("a:not('.menu-header')").length) {
                    AJS.dropDown.current.moveDown();
                }
            },
            dropdownPlacement : placedropdown,
            onDeath : function () {
                $("#autocomplete-dropdown").remove();
            },
            ajsDropDownOptions: {
                selectionHandler: selectionHandler,
                moveHandler: moveHandler,
                className : "autocomplete " + autoCompleteControl.settings.dropDownClassName,
                displayHandler: options.displayHandler,
                Highlighter: options.Highlighter
            },
            getDataAndRunCallback: function(val) {
                autoCompleteControl && autoCompleteControl.settings.getDataAndRunCallback &&
                autoCompleteControl.settings.getDataAndRunCallback(autoCompleteControl, val,
                        function(matrix, query, restSpecificAdditionLinksCallback, optionalQueryTokens) {
                            matrix.unshift([
                                {
                                    className: "menu-header dropdown-prevent-highlight",
                                    href: "#",
                                    name: autoCompleteControl.settings.getHeaderText(autoCompleteControl, val)
                                }
                            ]);
                            matrix.push(autoCompleteControl.settings.getAdditionalLinks(autoCompleteControl, val, restSpecificAdditionLinksCallback));

                            // If the idd control is still active update it with the new data.
                            idd && idd.show(matrix, query, optionalQueryTokens || [query]);
                        }
                );
            },
            dropDownDelay: autoCompleteControl.settings.dropDownDelay,
            minLengthForGetData: autoCompleteControl.settings.minLengthForGetData
        });

        autoCompleteControl.onBeforeKey = function (e, text) {
            var tinymce = require('tinymce');

            if (e.keyCode === 40 || e.keyCode === 38 || e.keyCode === 13) {
                tinymce.dom.Event.cancel(e);
                return false;
            }
            if (e.keyCode === 27 || e.keyCode === 9 || (e.keyCode === 8 && !text)) {
                // User has key-downed backspace but text is *already* blank - close autocomplete.
                this.die(e.keyCode === 8);
                return false;
            }

            return true;
        };
        // Blocker for browser default actions for up and down keys
        autoCompleteControl.onKeyPress = function (e, text) {
            var tinymce = require('tinymce');

            var ch = $.browser.msie ? e.keyCode : e.which;
            var character = String.fromCharCode(ch);   // charCode back to '@'
            if (e.keyCode === 13) {
                tinymce.dom.Event.cancel(e);
                return false;
            }
            var endCharIndex = AJS.indexOf(this.settings.endChars,character);
            if (endCharIndex !== -1) {
                autoCompleteControl.die();
            }
            return true;
        };

        var minLengthForGetData = options.minLengthForGetData || 2;
        var minLetters = new RegExp("\\S{" + minLengthForGetData + ",}");
        autoCompleteControl.onAfterKey = function (e, text) {
            if (e.keyCode === 40 || e.keyCode === 38 || e.keyCode === 13) {
                var current = AJS.dropDown.current;
                if (!current) {
                    return false;
                }
                if (current.getFocusIndex() == -1 && e.keyCode === 13) {  // user hit enter when nothing selected
                    reset();
                    return true;
                }
                // AJS-609 - the AUI dropdown code expects a jQuery event
                if (!e.which) {
                    e.which = e.keyCode;
                }

                return current.moveFocus(e);
            }

            // User deleted back to zero characters - should display default suggestions again.
            // If text contains Chinese letter, forceUpdate to trigger search. CONFDEV-43744
            var forceUpdate = (e.keyCode === 8 && !text) || containsCJK(text);
            if (forceUpdate || minLetters.test(text)) {
                idd.change(text, forceUpdate);
            }
            return true;
        };

        var containsCJK = function (s) {
            // Regular expression that matches all symbols in the CJK Unified Ideographs block as per Unicode v8.0.0:
            var pattern = /[\u4E00-\u9FFF]/gi;
            return pattern.test(s);
        };

        autoCompleteControl.onDeath = function () {
            if (idd) {
                idd.remove();
                idd.closing = true;
            }
            AJS.trigger('synchrony.start', { id: synchronyId });
        };
        autoCompleteControl.onScroll = function() {
            if (!idd.dd) {
                return; // sometimes, due to race conditions, the onScroll gets removed after the dd.$
            }
            placedropdown(idd.dd.$);
        };

        /**
         * Returns the model object for the currently-selected dropdown item.
         */
        autoCompleteControl.getCurrentItem = function () {
            if (!idd || !idd.dd) {
                return null;
            }

            var dropdown = idd.dd;
            var index = dropdown.getFocusIndex();
            if (index < 0 ) {
                return null;
            }
            return getDropdownItemProperties(dropdown.links[index]);
        };

        // Start the dropdown with no text entered, to display the default suggestions.
        idd.change(autoCompleteControl.text(), "force");
        return true;
    };

    var reset = function () {
        autoCompleteControl.die();
        autoCompleteControl = null;
    };

    var reattach = function() {
        var orphan = AutocompleteControl.removeOrphanedControl();
        orphan && AutocompleteManager.shortcutFired(orphan.leadingChar);
    };

    var AutocompleteManager = {

        getInputDrivenDropdown: function() {
            return idd;
        },

        // keyPress used so we can capture composite keystrokes like Sh-2 == @
        triggerListener: function(ed, e) {
            var tinymce = require('tinymce');

            //We do not want to override any browser shortcuts but we can't
            //catch alt and ctrl keys due to other keyboard layouts like german
            if (e.metaKey) {
                return true;
            }

            var ch = $.browser.msie ? e.keyCode : e.which;

            idd && idd.closing && (idd = null);

            var character = String.fromCharCode(ch);   // charCode back to '@'
            if (!idd && character in AutocompleteSettings.Settings) {

                // Add the suggestion span and kill the event - we'll add the letter manually
                startAutoComplete({
                    leadingChar: character
                }) && tinymce.dom.Event.cancel(e);
            }

            return true;
        },

        /**
         * Called when a Ctrl-Sh-K or Ctrl-Sh-M shortcut is fired, selects the previous word.
         *
         * Multiple shortcuts will select more previous words to narrow the search.
         */
        shortcutFired: function(leadingChar, noBackwordSelection) {
            var backWords = noBackwordSelection ? 0 : 1;
            idd && idd.closing && (idd = null);
            if (idd) {
                backWords = noBackwordSelection ? 0 : autoCompleteControl.backWords + 1;
                // the shortcut itself will be closing the previous autocomplete
                reset();
            }
            return startAutoComplete({
                leadingChar: leadingChar,
                backWords: backWords
            });
        },

        /**
         * Attempt to reattach to an autocomplete span if there is no active control
         * (e.g. on an undo/redo opperation).
         */
        reattach: reattach
    };

    return AutocompleteManager;
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/tinymce3/plugins/autocomplete/autocomplete-manager', 'Confluence.Editor.Autocompleter.Manager');
