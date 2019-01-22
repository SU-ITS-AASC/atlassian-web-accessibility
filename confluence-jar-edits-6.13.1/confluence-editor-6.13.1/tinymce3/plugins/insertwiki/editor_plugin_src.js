/**
 * @module confluence-editor/tinymce3/plugins/insertwiki/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/insertwiki/editor_plugin_src', [
    'jquery',
    'ajs',
    'confluence/legacy',
    'tinymce',
    'underscore',
    'confluence/api/constants'
], function(
    $,
    AJS,
    Confluence,
    tinymce,
    _,
    CONSTANTS
) {
    "use strict";

    // we flipped the switch, so if the key is found it means that the feature is DISABLED
    var WIKI_MARKDOWN_DIALOG_ENABLED = !AJS.DarkFeatures.isEnabled("editor.insert-wiki-markdown");

    // supported wiki types and their respective rest apis.
    var SUPPORTED_WIKI_TYPES = {
        DEFAULT: null,
        HELP_REST_API: AJS.contextPath() + "/plugins/tinymce/helplink.action",
        WIKI: {
            CONFLUENCE: {
                val: 'CONFLUENCE',
                label: AJS.I18n.getText("tinymce.confluence.conf_wikimarkup_confluence_label"),
                helpLink: "help.insert.wiki.markup",
                restApi: '/rest/tinymce/1/wikixhtmlconverter'
            },
            MARKDOWN: {
                val: 'MARKDOWN',
                label: AJS.I18n.getText("tinymce.confluence.conf_wikimarkup_markdown_label"),
                helpLink: "help.insert.wiki.markup.markdown",
                restApi: '/rest/tinymce/1/markdownxhtmlconverter'
            }
        }
    };

    var localStorageCacheManager = new Confluence.localStorageCacheManager("insert-wiki-markup-dialog");

    return {
        init : function(ed, url) {
            // Register commands
            ed.addCommand('InsertWikiMarkup', function() {

                var settings = {
                    dialog: {
                        id: "insert-wiki-markup-dialog",
                        content : WIKI_MARKDOWN_DIALOG_ENABLED ?
                                Confluence.Templates.InsertWiki.wikiMarkupDialog() :
                                Confluence.Templates.InsertWiki.originalDefaultTempWikiMarkupDialog(),
                        width : 980,
                        height : 500,
                        popup : false,
                        name : "confluence.conf_wikimarkup_desc"
                    },
                    markupEditId: 'insert-wiki-textarea',
                    previewAreaId: 'insert-wiki-textarea-preview',
                    selectionMenuId: 'wiki-parser-selection-tool',
                    serverRequestTimer: 300,
                    entityId :  AJS.Meta.get("content-id"),
                    spaceKey : AJS.Meta.get("space-key")
                };

                // set confluence wiki markup as the default parser or get a previously selected user renderer.
                SUPPORTED_WIKI_TYPES.DEFAULT = SUPPORTED_WIKI_TYPES.WIKI[localStorageCacheManager.get("parser") || "CONFLUENCE"];

                var cachedElement = {

                    /**
                     * Caches jQuery elements selector.
                     *
                     * eg:
                     * cachedElement.getElement('#selector');
                     *
                     * @param selector
                     * @returns {*}
                     */
                    getElement: function(selector) {
                        cachedElement[selector] =  cachedElement[selector] || $(selector);

                        return cachedElement[selector];
                    }
                };

                // the body reference on the preview iframe.
                var $previewIframeBody = null;


                /**
                 * Creates the wiki selector menu from the template and returns reference to it
                 *
                 * @param parentId
                 * @returns {*|HTMLElement} - the select jquery html reference
                 */
                var createWikiSelectorMenu = function(parentId) {

                    var wikiSelectorMenuTemplate = $(Confluence.Templates.InsertWiki.wikiParserSelector(SUPPORTED_WIKI_TYPES));
                    var menuBar =  cachedElement.getElement("#insert-wiki-insert-title");

                    menuBar.append(wikiSelectorMenuTemplate);

                    return cachedElement.getElement('#'+settings.selectionMenuId);
                };


                /**
                 * Creates the preview area by adding a new iframe with the same resources as the editor.
                 *
                 * @param parentId
                 * @returns {*|HTMLElement} - the iframe body reference
                 */
                var createPreviewArea = function(parentId) {

                    // getting resources from the editor
                    var context = $("#wysiwygTextarea_ifr").contents().find("head").html();
                    var template = Confluence.Templates.InsertWiki.previewWikiIframeContent();
                    var iframe = $("<iframe tabindex='-1' id='insert-wiki-markup-preview' />");
                    var iframeRef;
                    var doc;
                    var body;

                    // add iframe to the preview area
                    cachedElement.getElement("#"+parentId).append(iframe);

                    // once the iframe is added to the dom we can refer to it
                    iframeRef = iframe.contents();

                    // get the correct reference for 'document'.
                    doc = iframeRef[0];

                    // write the html template to the document
                    doc.open();
                    doc.write(template);
                    doc.close();

                    // add html Resources to the iFrame head element.
                    iframeRef.find("head").html(context);

                    // store the body reference
                    $previewIframeBody = iframeRef.find("body");
                };

                /**
                 * Return the current active parser
                 *
                 * @returns {string|string}
                 */
                var getSelectedParser = function() {
                    var optionMenu = cachedElement.getElement('#'+settings.selectionMenuId);
                    var wikiKey = optionMenu.length ? optionMenu.val() : SUPPORTED_WIKI_TYPES.DEFAULT.val;

                    return wikiKey;
                };


                /**
                 * Return the API rest interface for the specified wiki type, defaults to confluence wiki.
                 * It will get the right wiki format type form the menu. If the menu doesn't exist, it will user
                 * the default value.
                 *
                 * @returns {string|string}
                 */
                var getParserRestApi = function() {
                    return CONSTANTS.CONTEXT_PATH + SUPPORTED_WIKI_TYPES.WIKI[getSelectedParser()].restApi;
                };


                /**
                 * Get the converted text form the conversion service.
                 *
                 * @param option.textToConvert - Text to convert
                 * @param option.API - Conversion service full URL
                 * @param option.successCallback
                 * @param option.errorCallback
                 */
                var getConvertedText = function(option) {

                    option = option || {};

                    if(option.setBusy) {
                        ed.windowManager.setBusy(settings.dialog.id, true);
                    }

                    var conversionData = {
                        wiki : option.textToConvert,
                        entityId :  settings.entityId,
                        spaceKey : settings.spaceKey
                    };

                    $.ajax( {
                        type : "POST",
                        contentType : "application/json; charset=utf-8",
                        url: option.API,
                        data : $.toJSON(conversionData),
                        dataType : "text", // if this is switched back to json be sure to use "text json". See CONFDEV-4799 for details.
                        success : option.successCallback,
                        error: option.errorCallback || function(e){
                            AJS.logError(e);
                        },
                        timeout: 7500
                    });
                };


                /**
                 * Enables the property panel for image manipulation by giving a class to images.
                 *
                 * @param {string} data
                 * @returns {string} transformed data
                 */
                var enableImageProperyPanel = function(originalData) {
                    var $data;
                    var transformedData;

                    $data = $(originalData);
                    $data.find("img").addClass("confluence-embedded-image"); // CONFDEV-20109 - Enabling the property panel by post processing.

                    // We need now to convert it back to a string
                    // NOTE: the reason why we don't use .outerHTML is because it would only work for a single node and not for
                    // a collection of nodes example "</p>foo</p><h1>bar</h1>" since we can't call the outerHTML of that.
                    transformedData = $('<div>').append($data.clone()).html();

                    return transformedData;
                };


                /**
                 * Insert the transformed content into the editor itself and close window
                 *
                 * @param data
                 */
                var insertToEditorAndCloseWindow = function(data) {

                    var dialogId = settings.dialog.id;
                    var parser = getSelectedParser();

                    ed.windowManager.setBusy(dialogId, false);

                    tinymce.EditorManager.activeEditor.windowManager.close(dialogId);

                    if(WIKI_MARKDOWN_DIALOG_ENABLED) {
                        // Track how many users are using wiki/markdown.
                        AJS.trigger("analytics", {name: "insert-wiki-markup-dialog." + parser});

                        if(parser === "MARKDOWN") {
                            data = enableImageProperyPanel(data);
                        }
                    }

                    ed.execCommand('mceInsertContent', false, data);
                    splitParas(ed);
                };


                /**
                 * Handle error by displaying a inline dialog message when the server returns an invalid response or
                 * the request times out.                 *
                 *
                 * @param XMLHttpRequest
                 * @param textStatus
                 * @param errorThrown
                 */
                var erroredConversion = function(XMLHttpRequest, textStatus, errorThrown) {
                    ed.windowManager.setBusy(settings.dialog.id, false);

                    var errorMessage = {
                        warningMessage: tinymce.EditorManager.activeEditor.getLang("confluence.conf_wikimarkup_errors"),
                        exceptionMessage: textStatus === "timeout" ?
                                tinymce.EditorManager.activeEditor.getLang("confluence.conf_wikimarkup_timeout") :
                        AJS.escapeHtml(textStatus) + " : " + AJS.escapeHtml(errorThrown)
                    };

                    var errorTemplate = Confluence.Templates.InsertWiki.wikiErrorSubDialog(errorMessage);

                    tinymce.EditorManager.activeEditor.windowManager.alert(errorTemplate);
                };


                /**
                 * Updates the preview with the parsed result from the text response from the rest conversion API.
                 * In case there is an empty value on the markupEditArea than update the preview accordingly without
                 * doing a server an unnecessary request.
                 *
                 */
                var updatePreview = function() {
                    var renderElement = cachedElement.getElement("#"+settings.markupEditId);
                    var text = renderElement.val();
                    if(!$.trim(text)) {
                        $previewIframeBody.html(text);
                    } else { // we only try to parse if we have non empty values
                        getConvertedText({
                            API: getParserRestApi(),
                            textToConvert: text,
                            successCallback: function(data) {
                                $previewIframeBody.html(data);
                            },
                            errorCallback: function() {
                                $previewIframeBody.html(renderElement.val());
                            }
                        });
                    }
                };

                /**
                 * Adds the appropriate hash for the helpLink of the current selected parser.
                 * @param {String} selectedParser - Key value for the current selected parser.
                 */
                var updateHelpLink = function(selectedParser) {
                    var helpLinkElement = cachedElement.getElement('#'+settings.dialog.id).find('.dialog-help-link');
                    var helpLink = SUPPORTED_WIKI_TYPES.WIKI[selectedParser].helpLink;

                    helpLinkElement.load(SUPPORTED_WIKI_TYPES.HELP_REST_API, { linkUrlKey : helpLink });
                };

                /**
                 * Add to Storage user selected parser and also updated preview.
                 */
                var updateParser = function() {
                    var selectedParser = getSelectedParser();

                    localStorageCacheManager.put("parser", selectedParser);
                    updateHelpLink(selectedParser);
                    updatePreview();
                };


                /**
                 * The problem is that we currently insert the HTML we generate straight
                 * inside a P tag (where the cursor is currently in).
                 *
                 * refer to CONFDEV-1548.
                 *
                 * @param editor
                 * @param params
                 */
                var splitParas = function(editor, params) {
                    tinymce.each(editor.dom.select('p > p'), function (p) {
                        try {
                            editor.dom.split(p.parentNode, p);
                        } catch (ex) {
                            // IE can sometimes fire an unknown runtime error so we just ignore it
                            AJS.logError('insertwikimarkup - splitParas()', ex);
                        }
                    });
                };

                // Creates the main dialog
                ed.windowManager.open(settings.dialog, {
                    buttons : [{
                        label : "confluence.conf_insert_button_title",
                        action : function() {
                            getConvertedText({
                                API: getParserRestApi(),
                                successCallback: insertToEditorAndCloseWindow,
                                errorCallback: erroredConversion,
                                textToConvert: cachedElement.getElement("#"+settings.markupEditId).val(),
                                setBusy: true
                            });
                        }
                    }],
                    plugin_url : url,
                    helpLink : SUPPORTED_WIKI_TYPES.DEFAULT.helpLink,
                    hintText : "confluence.conf_wikimarkup_hint",
                    cssClass : "insert-wiki-markup-panel"
                });

                if(WIKI_MARKDOWN_DIALOG_ENABLED) {

                    // the preview area need to be created as an iframe in order to share same resources as the editor.
                    createPreviewArea(settings.previewAreaId);

                    // create the selection menu and attach events to update the preview
                    createWikiSelectorMenu(settings.dialog.id).on('change', updateParser);

                    // add events to the markupEdit area to update the preview
                    cachedElement.getElement('#'+settings.markupEditId).on('keydown', _.debounce(updatePreview, settings.serverRequestTimer));
                }
            });

            ed.addButton('insertwikimarkup', {title : 'confluence.conf_wikimarkup_desc', cmd : 'InsertWikiMarkup'});

        },

        getInfo : function() {
            return {
                longname : 'InsertWikiMarkip',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                infourl : 'http://www.atlassian.com/',
                version : "1.1"
            };
        }
    };
});

require('confluence/module-exporter')
        .safeRequire('confluence-editor/tinymce3/plugins/insertwiki/editor_plugin_src', function(InsertWikiMarkupPlugin) {
            var tinymce = require('tinymce');

            tinymce.create('tinymce.plugins.InsertWikiMarkupPlugin', InsertWikiMarkupPlugin);

            // Register plugin
            tinymce.PluginManager.add('insertwikimarkup', tinymce.plugins.InsertWikiMarkupPlugin);
        });
