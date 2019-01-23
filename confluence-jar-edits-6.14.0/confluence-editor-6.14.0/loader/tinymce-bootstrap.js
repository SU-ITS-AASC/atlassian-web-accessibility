/**
 * Initialises the editor
 *
 * @module confluence-editor/loader/tinymce-bootstrap
 */
define('confluence-editor/loader/tinymce-bootstrap', [
    'ajs',
    'underscore',
    'jquery',
    'document',
    'confluence/meta',
    'confluence-editor/support/atlassian-editor-support'
], function (AJS,
             _,
             $,
             document,
             Meta,
             EditorSupport) {
    "use strict";

    var defaultSettings = {
        atlassian: true,
        keep_values: true,
        convert_urls: true,
        relative_urls: false,
        // CONFDEV-1555 - Required for IE and SSL to ensure complete URLs for inline style urls. Otherwise IE displays security warnings.
        remove_script_host: false,
        button_tile_map: true,
        gecko_spellcheck: true,
        apply_source_formatting: false, //we don't want new lines between html elements when serialized and sent to the backend
        list_outdent_on_enter: true,

        // table settings
        visual: false,
        confluence_table_style: "confluenceTable",
        confluence_table_cell_style: "confluenceTd",
        confluence_table_heading_style: "confluenceTh",
        confluence_table_default_rows: 4,
        confluence_table_default_cols: 3,
        confluence_table_default_heading: true,

        // output settings
        cleanup: true,
        /**
         * This is to ensure that any empty elements that require padding are padded with an &nbsp; (say PRE, P, DIV etc.)
         * These spaces are an editor concern and should not be persisted to our storage.
         */
        cleanup_on_startup: true,

        /**
         * This must be false since browsers depend on broken list markup to provide working bullet functionality.
         * We fix up the broken list markup on the server side before we save it so its not necessary here anyway.
         */
        fix_list_elements: false,
        fix_table_elements: true,
        valid_elements: _validElements(), // Theoretically, most elements are allowed to have a wysiwyg parameter set.  See ExternallyDefinedConverter

        extended_valid_elements: "img[*],time[class|datetime|contenteditable|onselectstart|unselectable|oncontrolselect]",

        //white list the removeformat elements we want to support
        formats: {
            removeformat: [
                {
                    selector: 'h1,h2,h3,h4,h5,h6,pre',
                    remove: 'all', split: true, expand: false, block_expand: true, deep: true, block: '*'
                },
                {
                    selector: 'address,article,b,big,blockquote,center,cite,code,date,dd,del,dfn,dl,dt,em,embed,font,footer,' +
                    'header,hgroup,i,ins,kbd,link,menu,nav,object,param,q,s,samp,script,' +
                    'section,small,strike,strong,style,sub,sup,time,tt,u,var',
                    remove: 'all', split: true, expand: false, block_expand: true, deep: true
                },
                {
                    selector: 'span',
                    attributes: ['style', 'class'],
                    remove: 'empty',
                    split: true,
                    expand: false,
                    deep: true
                }, // colored text
                {
                    selector: 'table',
                    attributes: ['cellpadding', 'cellspacing', 'border'],
                    split: false,
                    expand: false,
                    deep: true
                },
                {
                    selector: '*',
                    attributes: ['style', 'color', 'bgcolor', 'title', 'lang'],
                    split: false,
                    expand: false,
                    deep: true
                }
            ]
        },

        forced_root_block: 'p',
        force_p_newlines: true, // default
        force_br_newlines: false, // default

        oninit: "AJS.Rte.BootstrapManager.onInit",

        /**
         * Disable resize controls on tables and images in firefox. They render out of place when margins are applied to the table.
         */
        object_resizing: false,

        //Trigger a pre paste event that can be captured by the Confluence paste plugin
        paste_preprocess: function (pl, o) {
            $(document).trigger('prePaste', [pl, o]);
        },
        // add class=" confluence-embedded-image" to images so that we get the image property panel if image clicked.
        // The 'not' operation is to avoid the property panel applying to copy and pasted emoticons and macro placeholders.
        paste_postprocess: function (pl, o) {
            $("img", o.node)
                .not('[data-emoticon-name]')
                .not('.editor-inline-macro')
                .not('.confluence-embedded-image')
                .not('.template-variable')
                .addClass("confluence-embedded-image confluence-external-resource");
            //Trigger a post paste event that can be captured by the confluence paste plugin
            $(document).trigger('postPaste', [pl, o]);
        }
    };

    function _validElements() {
        var validElements = '@[id|class|style|title|wysiwyg|dir<ltr?rtl|lang|xml::lang|onclick|ondblclick|onmousedown|onmouseup|onmouseover|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],';
        /* We add extra link attributes to help conversion to wiki markup */
        validElements += 'a[*],';
        validElements += 'strong/b,em/i,s,u,';
        /* User paragraphs indicate a blank line.  See DefaultWysiwygConverter.isUserNewline */
        validElements += '#p[align|user],';
        validElements += '-ol[type|compact],-ul[type|compact],li,br,';
        /* The ImageConverter uses an imagetext attribute */
        validElements += 'img[imagetext|longdesc|usemap|src|border|alt=|title|hspace|vspace|width|height|align],';
        validElements += '-sub,-sup,';
        /* the markup tag is used to distinguish bq. markup from {quote}s.  See BlockQuoteConverter.java */
        validElements += '-blockquote[cite|markup],';
        validElements += '-table[*],';
        validElements += '-tr[rowspan|width|height|align|valign|bgcolor|background|bordercolor],tbody,thead,tfoot,';
        validElements += '#td[colspan|rowspan|width|height|align|valign|bgcolor|background|bordercolor|scope],';
        validElements += '#th[colspan|rowspan|width|height|align|valign|scope],caption,';
        validElements += 'div[*],';
        /**
         * CONFDEV-48486
         * In the past, pattern was #span[*] which means if SPAN is empty, we appended &nbsp; into it
         * Prefix # tells tinyMCE to check if a SPAN is empty
         * Now we change from &nbsp; to BR (WD-567), SPAN with BR inside make no sense
         * We remove # so tinyMCE won't check for emptiness of a SPAN
         */
        validElements += 'span[*],';
        validElements += '-code,#pre[*],address,-h1,-h2,-h3,-h4,-h5,-h6,hr[size|noshade],';
        validElements += '-font[face|size|color],dd,dl,dt,cite,abbr,acronym,del[datetime|cite],ins[datetime|cite],object[classid|width|height|codebase|*],param[name|value],';
        validElements += 'embed[type|width|height|src|*],map[name],area[shape|coords|href|alt|target],bdo,button,col[align|char|charoff|span|valign|width],';
        validElements += 'colgroup[align|char|charoff|span|valign|width],dfn,fieldset,form[action|accept|accept-charset|enctype|method],';
        validElements += 'input[accept|alt|checked|disabled|maxlength|name|readonly|size|src|type|value],kbd,label[for],legend,noscript,';
        validElements += 'optgroup[label|disabled],option[disabled|label|selected|value],q[cite],samp,select[disabled|multiple|name|size],small,';
        validElements += 'textarea[cols|rows|disabled|name|readonly],tt,var,big';

        return validElements;
    }

    /**
     * This can be called at any point once the TinyMCELang and the tinymce.Editor are available.
     */
    var initialiseTranslations = function (languagePrefix) {
        var tinymce = require('tinymce');
        var TinyMCELang = require('confluence-editor/i18n/translations.i18n');

        AJS.debug("Bootstrap: set locale translations");
        if (typeof TinyMCELang == undefined) {
            AJS.log("ERROR: could not find the TinyMCE language pack");
        }

        var ctrlTrans = new RegExp(TinyMCELang.ctrl_key + "\\+", 'g');
        var shiftTrans = new RegExp(TinyMCELang.shift_key + "\\+", 'g');

        // helper to make tool-tips mac friendly
        var replaceForMac = function (str) {
            return str.replace(ctrlTrans, "\u2318").replace(shiftTrans, "\u21E7");
        };

        for (var key in TinyMCELang) {
            var langGroup = TinyMCELang[key];
            if (typeof langGroup === "object") {
                for (var strKey  in langGroup) {
                    if (tinymce.isMac) {
                        langGroup[strKey] = replaceForMac(langGroup[strKey]);
                    }
                }
            }

            tinymce.EditorManager.addI18n(languagePrefix + "." + key, TinyMCELang[key]);
        }

        // fix up the the tooltips on the toolbar
        if (tinymce.isMac) {
            $("#rte-toolbar .toolbar-item, #rte-toolbar .dropdown-item, #rte-savebar .aui-button").each(function () {
                var $this = $(this);
                var title = $this.attr("title");
                var dataTooltip = $this.attr("data-tooltip");
                if (title) {
                    $this.attr("title", replaceForMac(title));
                }
                if (dataTooltip) {
                    $this.attr("data-tooltip", replaceForMac(dataTooltip));
                }
            });
        }
    };

    /**
     * Resolve plugins to be initialized with editor
     *
     * @param {string} originalPlugins The original plugins before initialization
     * @param {Array} includePlugins List of additional plugins to be included
     * @param {Array} excludePlugins List of plugins to be excluded, plugins in this list will override plugins from the parameter before
     */
    function resolvePlugins(originalPlugins, includePlugins, excludePlugins) {
        var editorPlugins = originalPlugins.split(',');
        // Underscore will conveniently do the parameters validation when processing arrays
        editorPlugins = _.chain(editorPlugins).union(includePlugins).difference(excludePlugins).value();

        return editorPlugins.join(',');
    }

    var BootstrapManager = {
        /**
         * Non interface methods & variables
         */
        _tinyMceHasInit: false,
        _beforeInitCallbacks: [],
        _tinymcePluginInits: [],
        /**
         * The settings used (or to be used) for initialising
         */
        _settings: null,

        /**
         * @return true when TinyMCE has initialised. Note that this does not
         * mean there is an Editor active, it simply means that TinyMCE is in
         * a state where it could activate an editor.
         */
        isInitComplete: function () {
            return this._tinyMceHasInit;
        },

        /**
         * @return true if there is currently an Editor active.
         */
        isEditorActive: function () {
            var tinymce = require('tinymce');
            return this.isInitComplete() && tinymce && tinymce.activeEditor;
        },

        onInit: function () {
            this._tinyMceHasInit = true;
            var ed = AJS.Rte.getEditor();

            /* CONFDEV-43719: we want to prevent google form translating content inside editor */
            $(ed.getBody()).addClass("notranslate");

            // At this point, the editor may not be fully initialised yet
            // Please use "rte-ready" to bind editor initialisation related events
            // "init.rte" will be eventually deprecated
            AJS.trigger("init.rte", {editor: ed});

            // get editor-auto-focus parameter.
            // This parameter is optional and defaults to true, unless it is explicitly set to false.
            var autoFocus = AJS.Meta.get('editor-auto-focus') !== false;
            if (autoFocus) {
                AJS.Rte.editorFocus(ed);
            }
            else {
                AJS.debug("Bootstrap: editor-auto-focus=false. Do not focus the editor automatically.");
            }
        },

        /**
         * Adds a callback that will be executed after this editor instance has been initialised.
         * @param callback
         * @deprecated since 4.1 use AJS.bind("init.rte", callback);
         */
        addOnInitCallback: function (callback) {
            if ($.isFunction(callback)) {
                if (this._tinyMceHasInit) {
                    callback();
                }
                else {
                    AJS.bind("init.rte", callback);
                }
            } else {
                throw new Error('Attempt made to register an oninit callback that is not a function. Received: ' + callback);
            }
        },

        /**
         * Add a function to be called immediately before AJS.Rte.BootstrapManager.initialise. A typical usage would
         * be to refresh any settings that may have changed or become available since AJS.Rte.BootstrapManager.preInitialise.
         *
         * @param func the function to be called before initialise. This function can take a single parameter which will
         * be the TinyMCE settings object.
         */
        addBeforeInitCallback: function (func) {
            this._beforeInitCallbacks.push(func);
        },

        addTinyMcePluginInit: function (func) {
            this._tinymcePluginInits.push(func);
        },

        /**
         * This prepares for TinyMCE initialisation although it does not instigate the initialisation.
         *
         * @param settings - tinymce settings to be used when initialise is later called.
         */
        preInitialise: function (settings) {
            this._settings = $.extend(defaultSettings, settings);
        },

        /**
         * Initialises the TinyMCE editor. The HTML for the Editor must be available at the point
         * you call this function.
         *
         * @param options {object}
         * @param options.plugins {Array} List of additional plugins to load the editor with
         * @param options.excludePlugins {Array} List of loaded plugins to be excluded from the editor
         * @param options.onInitialise {Function} Callback to be executed right after TinyMCE was initialised
         */
        initialise: function (options) {
            AJS.Confluence.debugTime("confluence.editor.tinymce");
            var tinymce = require('tinymce');

            if (!this._settings) {
                AJS.log("Bootstrap:initialise: No settings found. Has preInitialise been called?");
                return;
            }

            options = $.extend({}, options); // copy to prevent reference mutation
            var settings = $.extend({}, this._settings); // copy to prevent reference mutation

            AJS.Rte.isQuickEdit = options.isQuickEdit || false;

            AJS.debug("Bootstrap:initialise: Initialising TinyMce version " + tinymce.majorVersion + "." + tinymce.minorVersion);

            // Some settings are taken from the DOM for the Editor. This isn't necessary available until this point.
            // (You can't initialise without the DOM being available.)
            // This is really an artifact of the fact that we either use the Editor from a full page load, or we
            // load it dynamically after the initial page load. It is assumed that in the future the Editor will
            // always be dynamically initiated which means this mechanism can be replaced with something more
            // appropriate.
            $.each(this._beforeInitCallbacks, function (index, func) {
                func(settings);
            });

            // plugin point for tinymce plugins to configure settings
            for (var i = 0, ii = this._tinymcePluginInits.length; i < ii; i++) {
                if (typeof this._tinymcePluginInits[i] === "function") {
                    this._tinymcePluginInits[i](settings);
                }
            }

            initialiseTranslations(settings.language);

            // configure toolbar
            var toolbarManager = new AJS.Confluence._ToolbarConfigurationManager($('#toolbar'));
            toolbarManager.configureToolbar(options.toolbar);

            settings.plugins = resolvePlugins(settings.plugins, options.plugins, options.excludePlugins);

            /**
             * CONFDEV-37087
             * provide ability to setup some handlers right after editor is initialised
             * can not rely on postInitialise, b/c it is too late, some events had been triggered before postInitialise (e.g onLoad)
             */
            settings.setup = options.onInitialise;

            /**
             * CONF-45248
             * If synchrony is enabled, add attribute to iframe to disable grammarly
             */
            if (Meta.getBoolean("shared-drafts") && (Meta.get("content-type") === "page" || Meta.get("content-type") === "blogpost") && Meta.get("edit-mode") !== "limited") {
                settings.iframe_attr = {
                    "data-synchrony": "true"
                };
            }

            /**
             * tinyMCE initialisation
             */
            tinymce.init(settings);

            // so we don't trigger drafts due to macro manipulation
            AJS.Rte.Content.editorResetContentChanged();

            /*
             * Add a tab index to the Editor. The Save button will be given 101
             */
            $(AJS.Rte.getEditorFrame()).attr("tabindex", 100);

            if (tinymce.isIE) {
                $(AJS.Rte.getEditorFrame()).attr("hidefocus", "hidefocus");
            }

            // At this point, the editor is ready to be used.
            // Please use rte-ready to bind editor initialisation related events
            AJS.Confluence.debugTimeEnd("confluence.editor.tinymce");
            AJS.trigger("rte-ready");

            // Content-type can be changed from page to comment on view-page, so we need to check both properties
            if (EditorSupport.isCollaborativeContentType()) {
                AJS.trigger('rte-begin-collab-editing');
            }
        }
    };

    return BootstrapManager;
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/loader/tinymce-bootstrap', 'AJS.Rte.BootstrapManager');