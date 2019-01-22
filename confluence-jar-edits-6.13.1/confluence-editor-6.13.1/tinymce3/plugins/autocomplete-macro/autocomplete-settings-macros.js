/**
 * @module confluence-editor/tinymce3/plugins/autocomplete-macro/autocomplete-settings-macros
 */
define('confluence-editor/tinymce3/plugins/autocomplete-macro/autocomplete-settings-macros', [
    'jquery',
    'underscore',
    'ajs',
    'tinymce',
    'confluence/legacy'
], function(
    $,
    _,
    AJS,
    tinymce,
    Confluence
) {

    "use strict";

    function AutoCompleteSettingsMacro() {

        function toggleSpinner(visible) {
            $("#autocomplete-dropdown .top-menu-item").spin(visible);
        }

        function retryLoadMacros() {
            AJS.MacroBrowser.reset();
            AJS.MacroBrowser.preLoadMacro();
        }

        var dropdownSelectionMade = function (autoCompleteControl, options) {
            var macroMetadata = options.presetMacroMetadata;

            autoCompleteControl.replaceWithSelectedSearchText();

            if (!macroMetadata) {
                tinymce.confluence.macrobrowser.macroBrowserToolbarButtonClicked(options);
            } else {
                // only open the macro browser if there are required parameters
                if (AJS.MacroBrowser.hasRequiredParameters(macroMetadata) || !!macroMetadata.alwaysShowConfig) {
                    tinymce.confluence.macrobrowser.macroBrowserToolbarButtonClicked(options);
                } else {
                    AJS.Rte.BookmarkManager.storeBookmark();

                    tinymce.confluence.MacroUtils.insertMacro({
                        contentId: AJS.Meta.get('content-id') || "0",
                        macro: {
                            name: macroMetadata.macroName,
                            body: ""
                        }
                    });
                }
            }
        };

        var makeMacroDropdownItem = function (summary) {
            if (summary.hidden && !AJS.MacroBrowser.isHiddenMacroShown(summary)) {
                return null;    // macros like {viewfile} hidden from the browser should be hidden from the dropdown
            }

            var item = {
                className: "autocomplete-macro-" + summary.macroName,
                callback: function (autoCompleteControl) {
                    dropdownSelectionMade(autoCompleteControl, {
                        ignoreEditorSelection: true,       // the selected text will be the search term, ignore it
                        presetMacroMetadata: summary
                    });
                }
            };

            if (summary.icon) {
                item.name = summary.title;
                item.href = "#";
                item.icon = (summary.icon.relative ? AJS.params.staticResourceUrlPrefix : "") + summary.icon.location;
            } else {
                item.html = Confluence.Editor.Autocompleter.Util.dropdownLink(summary.title);
            }

            return item;
        };

        // Macro settings.
        Confluence.Editor.Autocompleter.Settings["{"] = {

            ch: "{",
            cache: false,
            endChars: ["}", ":", "{"],
            dropDownClassName: "autocomplete-macros",
            dropDownDelay: 0, // No delay needed because there is no AJAX request involved
            selectFirstItem: true,

            getHeaderText: function (autoCompleteControl, value) {
                return AJS.I18n.getText("editor.autocomplete.macros.header.text");
            },

            getAdditionalLinks: function (autoCompleteControl, value) {
                return [
                    {
                        className: "dropdown-insert-macro",
                        html: Confluence.Editor.Autocompleter.Util.dropdownLink(
                            AJS.I18n.getText("editor.autocomplete.macros.dialog.browse"), "dropdown-prevent-highlight", "editor-icon"),
                        callback: function (autoCompleteControl) {
                            var searchText = autoCompleteControl.text();
                            dropdownSelectionMade(autoCompleteControl, { searchText: searchText });
                        }
                    }
                ];
            },

            getDataAndRunCallback: function (autoCompleteControl, val, callback) {

                var promiseMetaData = AJS.MacroBrowser.getMetadataPromise();
                var self = this;
                var args = arguments;

                function populateEmpty(metadataList) {
                    var dropdownItems = [];
                    $("#macro-insert-list li").each(function () {
                        var $li = $(this);
                        var macroMetaData = _.find(metadataList, function (macroMetaData) {
                            return macroMetaData.macroName === $li.attr("data-macro-name");
                        });

                        if (macroMetaData) {
                            var dropdownItem = makeMacroDropdownItem(macroMetaData);
                            dropdownItem && dropdownItems.push(dropdownItem);
                        }
                    });
                    return dropdownItems;
                }

                function populateWithValue(value) {
                    var dropdownItems = [];
                    var summaries = AJS.MacroBrowser.searchSummaries(value, { keywordsField: "keywordsNoDesc" });

                    for (var i = 0, ii = summaries.length; i < ii; i++) {
                        var dropdownItem = makeMacroDropdownItem(summaries[i]);
                        if (dropdownItem && dropdownItems.push(dropdownItem) == autoCompleteControl.maxResults) {
                            break;
                        }
                    }
                    return dropdownItems;
                }

                /**
                 * Will be called when macroBrowser has metadata
                 */
                function populate() {
                    var dropdownItems;
                    if (!val) {
                        dropdownItems = populateEmpty(AJS.MacroBrowser.metadataList);
                    } else {
                        dropdownItems = populateWithValue(val);
                    }

                    toggleSpinner(false);

                    callback([dropdownItems], val);
                }

                function retryLoading(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    AJS.trigger("analytics", {name: "autocomplete-macrobrowser.load-retry"});

                    // retry to fetch the data
                    retryLoadMacros();

                    // call getDataAndRunCallback again with same arguments
                    self.getDataAndRunCallback.apply(self, args);
                }

                // making sure it is only called once
                if (!self.alreadyBinded) {
                    self.alreadyBinded = true;

                    promiseMetaData.always(function () {
                        populate();
                        self.alreadyBinded = false; // if its called again we need to re-attach handlers again to the new promise
                    });

                    promiseMetaData.fail(function () {
                        AJS.trigger("analytics", {name: "autocomplete-macrobrowser.fail-to-load"});

                        AJS.messages.warning("#autocomplete-dropdown ol:nth(1)", {
                            title: AJS.I18n.getText("editor.autocomplete.macros.error.load.header"),
                            body: '<p><a id="macro-retry-link" href="#">' + AJS.I18n.getText("editor.autocomplete.macros.error.load.retrylink") + '</a></p>'
                        });

                        $("#macro-retry-link").click(retryLoading);

                        // this is where the error message gets populated to
                        $("#autocomplete-dropdown ol:nth(1)").show();
                    });
                }

                if (promiseMetaData.state() === "pending") {
                    callback([], val); //
                    toggleSpinner(true);
                }
            },

            update: function (autoCompleteControl, data) {
                throw new Error("All items in the Macro Autocomplete dropdown must have a callback function");
            }
        };
    }

    return AutoCompleteSettingsMacro;
});
