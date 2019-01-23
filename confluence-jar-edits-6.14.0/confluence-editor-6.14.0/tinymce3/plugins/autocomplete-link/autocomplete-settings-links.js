/**
 * @module confluence-editor/tinymce3/plugins/autocomplete-link/autocomplete-settings-links
 * @tainted tinymce
 * @tainted Confluence
 */
define('confluence-editor/tinymce3/plugins/autocomplete-link/autocomplete-settings-links', [
    'jquery',
    'ajs',
    'confluence/legacy'
],
function(
    $,
    AJS,
    Confluence
) {

    "use strict";

    function AutocompleteSettingsLink() {
        var autoComplete = Confluence.Editor.Autocompleter;

        var getUrl = function(val) {
            if (val) {
                return AJS.contextPath() + "/rest/prototype/1/search.json";
            } else if (AJS.Meta.get('remote-user')) {
                return AJS.contextPath() + "/rest/prototype/1/session/history.json";
            }

            return null;
        };

        var getParams = function(autoCompleteControl, val) {
            var params = {
                "max-results": autoCompleteControl.maxResults
            };
            if (val) {
                params.query = Confluence.unescapeEntities(val);
                params.search = "name";
                params.preferredSpaceKey = AJS.Meta.get('space-key');
            }
            return params;
        };

        // Link settings.
        Confluence.Editor.Autocompleter.Settings["["] = {

            ch: "[",
            cache: false,
            endChars: ["]"],

            dropDownClassName: "autocomplete-links",
            selectFirstItem: true,

            getHeaderText: function (autoCompleteControl, value) {
                return AJS.I18n.getText("editor.autocomplete.links.header.text");
            },

            getAdditionalLinks: function (autoCompleteControl, value, restSpecificAdditionLinksCallback) {
                var searchPrompt;
                if (value) {
                    var message = AJS.I18n.getText("editor.autocomplete.links.dialog.search");
                    searchPrompt = AJS.format(message, value);
                } else {
                    searchPrompt = AJS.I18n.getText("editor.autocomplete.links.dialog.search.no.text");
                }
                var LinkBrowser = Confluence.Editor.LinkBrowser;
                var additionalLinks = [
                    {
                        className: "search-for",
                        name: searchPrompt,
                        href: "#",
                        callback: function (autoCompleteControl) {
                            autoCompleteControl.replaceWithSelectedSearchText();
                            var lb = LinkBrowser.open({
                                panelKey: LinkBrowser.SEARCH_PANEL
                            });
                            lb.doSearch(lb.getLocationPresenter().getRawLinkText());
                        }
                    },
                    {
                        className: "dropdown-insert-link",
                        html: autoComplete.Util.dropdownLink(AJS.I18n.getText("editor.autocomplete.links.web.link"), "dropdown-prevent-highlight", "editor-icon"),
                        callback: function (autoCompleteControl) {
                            autoCompleteControl.replaceWithSelectedSearchText();
                            LinkBrowser.open({
                                panelKey: LinkBrowser.WEBLINK_PANEL
                            });
                        }
                    }
                ];

                restSpecificAdditionLinksCallback && restSpecificAdditionLinksCallback(value, additionalLinks);

                return additionalLinks;
            },

            getDataAndRunCallback: function (autoCompleteControl, val, callback) {
                function getRestSpecificAdditionLinks(matrix, value, additionalLinks) {
                    function doesPageAlreadyExist() {
                        var pages = matrix[1];
                        var firstEntry = pages[0].restObj;

                        if (firstEntry.type === "page") {
                            return firstEntry.space.key == AJS.Meta.get('space-key') && firstEntry.title.toLowerCase() === value.toLowerCase();
                        }

                        return false;
                    }

                    if (value) {
                        if (matrix.length < 2 || !doesPageAlreadyExist()) {
                            additionalLinks.push({
                                className: "insert-create-page-link",
                                html: autoComplete.Util.dropdownLink(AJS.I18n.getText("editor.autocomplete.links.create.link"), "dropdown-prevent-highlight", "editor-icon"),
                                callback: function (autoCompleteControl) {
                                    var title = Confluence.unescapeEntities(value);
                                    var link = Confluence.Link.createLinkToNewPage(title, AJS.Meta.get('space-key'));
                                    autoCompleteControl.update(link);
                                }
                            });
                        }
                    }
                }

                Confluence.Editor.Autocompleter.Util.getRestData(autoCompleteControl, getUrl, getParams, val, callback, "content", getRestSpecificAdditionLinks);
            },

            update: function (autoCompleteControl, link) {
                if (link.restObj) {
                    link = Confluence.Link.fromREST(link.restObj);
                }
                link.insert();
            }
        };

    }

    return AutocompleteSettingsLink;
});
