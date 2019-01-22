/**
 * @module confluence-editor/tinymce3/plugins/autocomplete-media/autocomplete-settings-media
 * @tainted tinymce
 * @tainted Confluence
 */
define('confluence-editor/tinymce3/plugins/autocomplete-media/autocomplete-settings-media', [
    'jquery',
    'ajs',
    'confluence-editor/utils/attachments-insert-utils',
    'confluence/legacy',
    'tinymce',
    'confluence/macro-js-overrides'
], function(
    $,
    AJS,
    AttachmentsInsertUtils,
    Confluence,
    tinymce,
    MacroJsOverrides
) {
    "use strict";

    function AutocompleteSettingsMedia() {
        var getUrl = function (val) {
            var parentId = AJS.params.attachmentSourceContentId || AJS.Meta.get('content-id');
            if (val) {
                return AJS.contextPath() + "/rest/prototype/1/search.json";
            } else if (+parentId) {
                return AJS.contextPath() + "/rest/prototype/1/content/" + parentId + "/attachments.json";
            }

            return null;
        };

        var getParams = function (autoCompleteControl, val) {
            // these types match those in the Java Attachment.Type enum
            var embeddableAttachmentTypes = AJS.MacroBrowser.getMacroMetadata('view-file') ? [] : ["image", "word", "excel", "pdf", "powerpoint", "multimedia"];
            return val ?
            {
                type: "attachment",
                attachmentType: embeddableAttachmentTypes,
                search: "name",
                "max-results": autoCompleteControl.maxResults,
                query: val
            } : {
                attachmentType: embeddableAttachmentTypes,
                "max-results": autoCompleteControl.maxResults
            };
        };

        // Media settings
        Confluence.Editor.Autocompleter.Settings["!"] = {
            ch: "!",
            cache: false,
            endChars: ["!"],

            dropDownClassName: "autocomplete-media",
            selectFirstItem: true,

            getHeaderText: function (autoCompleteControl, value) {
                return AJS.MacroBrowser.getMacroMetadata('view-file')
                        ? AJS.I18n.getText("editor.autocomplete.file.header.text")
                        : AJS.I18n.getText("editor.autocomplete.media.header.text");
            },

            getAdditionalLinks: function (autoCompleteControl, value) {
                var text = AJS.I18n.getText("editor.autocomplete.media.files.dialog.browse");

                return [
                    {
                        className: "dropdown-insert-image",
                        html: Confluence.Editor.Autocompleter.Util.dropdownLink(
                            text, "dropdown-prevent-highlight", "editor-icon"),
                        callback: function (autoCompleteControl) {
                            autoCompleteControl.replaceWithSelectedSearchText();
                            Confluence.Editor.defaultInsertImageDialog();
                        }
                    },
                    {
                        className: "dropdown-insert-macro",
                        html: Confluence.Editor.Autocompleter.Util.dropdownLink(
                            AJS.I18n.getText("editor.autocomplete.media.macros.dialog.browse"), "dropdown-prevent-highlight", "editor-icon"),
                        callback: function (autoCompleteControl) {
                            autoCompleteControl.replaceWithSelectedSearchText();
                            tinymce.confluence.macrobrowser.macroBrowserToolbarButtonClicked({
                                selectedCategory: "media"
                            });
                        }
                    }
                ];
            },

            getDataAndRunCallback: function (autoCompleteControl, val, callback) {
                Confluence.Editor.Autocompleter.Util.getRestData(autoCompleteControl, getUrl, getParams, val, callback, "attachment");
            },

            update: function (autoCompleteControl, data) {
                AJS.trigger('rte-autocomplete-on-insert', { triggerChar: '!', selectedFile: data });

                var restObj = data.restObj;
                var linkDetails = AJS.REST.wikiLink(restObj);
                var name = restObj && restObj.title || data.name;

                if (restObj.niceType == "Image") {
                    // leading ^ is not needed for images attached to the current page
                    var destination = linkDetails.destination && linkDetails.destination.replace(/^\^/, "");
                    var propertyMap = $.extend({
                        filename: name,
                        contentId: data.ownerId || restObj.ownerId
                    }, linkDetails.params);
                    tinymce.confluence.ImageUtils.insertFromProperties(propertyMap);

                } else {
                    var haveVFM = !!AJS.MacroBrowser.getMacroMetadata('view-file');
                    var contentType = restObj.contentType;
                    var inCloud = AJS.Meta.get("confluence-flavour") !== "VANILLA";
                    var isMP3or4 = contentType && (contentType === "audio/mp3" || contentType === "video/mp4");
                    var isSWF = contentType && contentType === "application/x-shockwave-flash";
                    if (haveVFM && ((inCloud && !isSWF) || (isMP3or4 || restObj.niceType !== "Multimedia"))) {
                        var params = {
                            name: name,
                            page: restObj.parentTitle,
                            space: restObj.space ? restObj.space.key : "",
                            date: restObj.datePath,
                            ownerId: restObj.ownerId
                        };

                        AttachmentsInsertUtils.insertFilePlaceholder(params);
                    } else {
                        this._insertFile(name, data, linkDetails);
                    }
                }
            },

            _insertFile: function(fileName, data, linkDetails) {
                // Other embeddable content, such as a viewfile macro variant
                var macroName;
                switch (data.restObj.niceType) {
                    case 'PDF Document':
                        macroName = "viewpdf";
                        break;
                    case 'Word Document':
                        macroName = "viewdoc";
                        break;
                    case 'Excel Spreadsheet':
                        macroName = "viewxls";
                        break;
                    case 'PowerPoint Presentation':
                        macroName = "viewppt";
                        break;
                    case 'Multimedia':
                        macroName = "multimedia";
                        break;
                }
                var spacePage = linkDetails.destination.substring(0, linkDetails.destination.indexOf("^"));
                var macroParams = {
                    page: spacePage,
                    name: fileName
                };
                MacroJsOverrides.get("viewdoc").beforeParamsRetrieved(macroParams);  // tweak for macro expected format
                // The Office Connector JS should really strip the page param if it is empty, but
                // it doesn't and making a new OC release just for that one line change is too painful to contemplate.
                if (!macroParams.page) {
                    delete macroParams.page;
                }
                var macroRenderRequest = {
                    contentId: AJS.Meta.get('content-id') || "0",
                    macro: {
                        name: macroName,
                        params: macroParams,
                        body: ""
                    }
                };
                tinymce.confluence.MacroUtils.insertMacro(macroRenderRequest);
            }
        };
    }

    return  AutocompleteSettingsMedia;
});

require('confluence/module-exporter').safeRequire('confluence-editor/tinymce3/plugins/autocomplete-media/autocomplete-settings-media');