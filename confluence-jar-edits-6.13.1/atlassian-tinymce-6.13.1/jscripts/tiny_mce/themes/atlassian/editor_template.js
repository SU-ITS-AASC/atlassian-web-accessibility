/**
 * @module atlassian-tinymce/themes/atlassian/editor_template
 */
define('atlassian-tinymce/themes/atlassian/editor_template', [
    'ajs',
    'confluence/legacy',
    'jquery',
    'tinymce',
    'underscore'
], function(
        AJS,
        Confluence,
        $,
        tinymce,
        _
) {
    "use strict";

    return function() {
        var DOM = tinymce.DOM;
        var each = tinymce.each;
        var explode = tinymce.explode;
        var extend = tinymce.extend;
        var PageEditor;

        /**
         * Represents the page editor (which renders the page title input field over the tinymce
         * iframe).
         *
         * @param ed - Tinymce editor instance
         * @constructor
         */
        PageEditor = function (ed) {
            // Guarantees that we run setup and init exactly once per instance as we replace
            // the function definitions with their boolean results
            this.init = this.init(ed);
        };

        /**
         * This is a list of TinyMCE plugins that are incompatible with the page editor theme - they will
         * be suppressed when the theme is initialised. Please note that this should only be used to
         * blacklist plugins that we have no control over (e.g. third-party plugins). In other cases,
         * AJS.Confluence.Editor._Profiles should be used to control which editor plugins are loaded
         * based on the editing context.
         */
        PageEditor.INCOMPATIBLE_PLUGINS = [
            'dfe' // 'Distraction free editor' that we used to bundle (com.atlassian.confluence.plugins.confluence-editor-hide-tools)
        ];

        PageEditor.shouldInit = function () {
            var $body = $("body");
            return ($body.hasClass("edit") || $body.hasClass("create") || $body.hasClass("copy-page"));
        };

        PageEditor.suppressIncompatiblePlugins = function () {
            var noop = function () {};
            for (var i = 0, len = PageEditor.INCOMPATIBLE_PLUGINS.length; i < len; i++) {
                tinymce.PluginManager.lookup[PageEditor.INCOMPATIBLE_PLUGINS[i]] = noop;
            }
        };

        PageEditor.prototype.init = function (ed) {
            var keyCodeManager = $.ui.keyCode;
            var toolBar = ed.plugins.customtoolbar;

            var $contentTitle = $("#content-title");
            var $contentWrap = $("form.editor");
            var $editorBody = $(ed.getBody());
            var $editorDoc = $(ed.getDoc());
            var $editorPrecursor = $("#editor-precursor");
            var $editorWindow = $(ed.getWin());
            var $toolbar = $("#toolbar");

            var initialScroll = $editorDoc.scrollTop();
            var bodyTopPadding = parseInt($editorBody.css("padding-top"), 10) + parseInt($editorBody.css("margin-top"), 10);
            var precursorTopPadding = parseInt($editorPrecursor.css("padding-top"), 10);

            var animationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

            setupTitleToolbar();
            startEditorPrecursorRepositionFrame(animationFrame);

            function startEditorPrecursorRepositionFrame(animationFrame) {
                /*
                 The toolbar above the precursor has contextual sections that animate
                 without triggering events that we can listen for (e.g. find and replace).
                 */
                (function animloop() {
                    animationFrame(animloop);
                    reposition();
                })();

                /*
                 CONFDEV-27352 - repositioning of precursor is delayed when scrolling with the
                 trackpad in Safari if we rely on request animation frame alone.

                 This extra event handling has a low enough impact that we should apply it to all
                 browsers (so that if it causes any problems in the future, we'll notice them sooner).
                 */
                $editorBody.on('scroll mousewheel', function () {
                    setTimeout(reposition, 0);
                });
            }

            function toggleToolBarDisabledState(state) {
                toolBar.toggleToolbarButtons(state, state, state, function () {
                    // filter to exclude close buttons.
                    return !$(this).parent().hasClass("close");
                });
            }

            function setupTitleToolbar() {
                $contentTitle
                        .on('keydown', function (e) {
                            var code = e.keyCode || e.which;

                            if (code === keyCodeManager.ENTER || code === keyCodeManager.DOWN) {
                                e.preventDefault();
                                e.stopPropagation();
                                ed.focus();
                            }
                        })
                        .on("focus click", function () {
                            // When title receives focus, toolbar buttons should be disabled until user focus on the editor again.
                            toggleToolBarDisabledState(true);
                        });

                $editorWindow.on("focus", function () {
                    toggleToolBarDisabledState(false);
                });
            }

            /**
             * Executed in a tight loop - keep this optimised for performance.
             * For example - perform all DOM 'reads' before any 'writes'.
             */
            function reposition() {
                var amountOfIframeScroll = initialScroll - $editorDoc.scrollTop();
                var heightAboveToolbar = $toolbar.offset().top - $contentWrap.offset().top; // e.g. merge conflict resolution
                var heightOfPrecursor = $editorPrecursor.outerHeight();
                var heightOfToolbar = $toolbar.outerHeight();

                $editorPrecursor.css('top', (heightAboveToolbar + heightOfToolbar + amountOfIframeScroll + precursorTopPadding) + 'px');
                $editorBody.css('padding-top', (heightOfPrecursor + bodyTopPadding) + 'px');
            }

            return true;
        };

        var ConfluenceThemeOptions = {
            controlHandlers: {},

            controls: {
                bold: 'Bold',
                italic: 'Italic',
                underline: 'Underline',
                strikethrough: 'Strikethrough',
                justifyleft: 'JustifyLeft',
                justifycenter: 'JustifyCenter',
                justifyright: 'JustifyRight',
                bullist: 'InsertUnorderedList',
                numlist: 'InsertOrderedList',
                tasklist: 'InsertInlineTaskList',
                outdent: 'Outdent',
                indent: 'Indent',
                cut: 'Cut',
                copy: 'Copy',
                paste: 'Paste',
                undo: 'Undo',
                redo: 'Redo',
                removeformat: 'RemoveFormat',
                sub: 'subscript',
                sup: 'superscript',
                forecolor: 'ForeColor',
                forecolorpicker: 'mceForeColor',
                backcolor: 'HiliteColor',
                backcolorpicker: 'mceBackColor',
                charmap: 'mceCharMap',
                visualaid: 'mceToggleVisualAid',
                anchor: 'mceInsertAnchor',
                newdocument: 'mceNewDocument',
                blockquote: 'mceBlockQuote'
            },

            //things whose state needs to be reflected in the toolbar (active inactive)
            stateControls: ['bold', 'italic', 'underline', 'bullist', 'numlist', 'tasklist', 'justifyleft', 'justifycenter', 'justifyright', 'strikethrough', 'sub', 'sup', 'monospace'],

            init: function (ed, url) {
                var shouldInitPageEditor = PageEditor.shouldInit();
                var t = this;

                shouldInitPageEditor && PageEditor.suppressIncompatiblePlugins();

                t.editor = ed;
                t.url = url;

                // Default settings
                t.settings = extend({
                    theme_advanced_toolbar_location: 'bottom',
                    theme_advanced_buttons1: "formatselect,bold,italic,underline,strikethrough,forecolor,separator," +
                    "table,row_before,row_after,delete_row,col_before,col_after,delete_col,delete_table,separator," +
                    "bullist,numlist,tasklist,outdent,indent,blockquote,justifyleft,justifycenter,justifyright,justifyfull,separator,sup,sub,separator," +
                    "undo,redo,separator," +
                    "conflink,oldlinkbrowserButton,confimage,conf_macro_browser,separator," +
                    "search,code,customtoolbar, monospace" +
                    "p,h1,h2,h3,h4,h5,h6,pre,blockquote",
                    readonly: ed.settings.readonly
                }, ed.settings);

                // Init editor
                ed.onInit.add(function () {
                    if (!ed.settings.readonly) {
                        ed.onNodeChange.add(t.nodeChanged, t);
                        ed.onKeyUp.add(t._updateUndoStatus, t);
                        ed.onMouseUp.add(t._updateUndoStatus, t);
                        ed.dom.bind(ed.dom.getRoot(), 'dragend', function () {
                            t._updateUndoStatus(ed);
                        });

                        shouldInitPageEditor && new PageEditor(ed);
                    }
                });
            },

            execCommand: function (cmd, ui, val) {
                var f = this['_' + cmd];

                if (f) {
                    f.call(this, ui, val);
                    return true;
                }

                return false;
            },

            renderUI: function (o) {
                var sc;
                this.bindControls();
                return {
                    iframeContainer: DOM.get("rte"),
                    editorContainer: 'wysiwyg',
                    sizeContainer: sc,
                    deltaHeight: o.deltaHeight
                };
            },

            getInfo: function () {
                return {
                    longname: 'Confluence theme',
                    author: 'Atlassian',
                    authorurl: 'http://tinymce.moxiecode.com',
                    version: tinymce.majorVersion + "." + tinymce.minorVersion
                };
            },

            /**
             * Binds event handlers for each theme_advanced_button.
             *
             * @param toolBar String representing the toolbar (ex. "formatDropdown, bold, italic, underline")
             */
            bindControls: function () {
                var t = this;
                var s = t.settings;

                // Register dispatchers that toolbar uses to show button state
                each(explode(s['theme_advanced_buttons1']), function (element) {
                    //things added via editor.addButton()
                    if (t.createEditorButtons(element)) {
                        return;
                    }

                    //special cases handled by their own methods
                    switch (element) {
                        case "formatselect":
                            t.createBlockFormats();
                    }
                });
                t.bindControlHandlers();
                t.renderToolbarButtons();
            },

            /**
             * Render all buttons in registered button list ("editor.buttons") in toolbars.
             * Just render button which specify "locationGroup".
             * If a button does not specify "weight", it will be appended at the last of button group.
             * If weight of button is 0, it will be added at the beginning of button group.
             * @example
             * //Adding button
             * ed.addButton('confluence-insert-files', {
             *     //default value of "toolbar" is "toolbar-primary"
             *     title : AJS.I18n.getText("tinymce.confluence.conf_file"),
             *     tooltip: AJS.I18n.getText("tinymce.confluence.conf_file_desc"),
             *     cmd: "mceConfimage",
             *     className: "insert-files",
             *     locationGroup: "rte-toolbar-group-link",
             *     weight: 1 //weight of the new button in group
             * });
             */
            renderToolbarButtons: function () {
                var t = this;
                var templateToolbarButton = Confluence.Templates.Editor.Toolbar.toolbarButton;

                var SUPPORTED_TOOLBARS = ['toolbar-primary'];
                var DEFAULT_BUTTON_SETTING = {
                    toolbar: "toolbar-primary",
                    title: "",
                    tooltip: "",
                    cmd: "",
                    className: "",
                    locationGroup: null,
                    weight: Infinity,
                    onclick: null
                };

                //"editor.buttons" is a map, so convert a map to list for sorting easily
                var listButtons = _.map(this.editor.buttons, function (btnSetting, btnKey) {
                    btnSetting = _.extend({}, DEFAULT_BUTTON_SETTING, btnSetting);
                    //keep track id of button into its setting
                    btnSetting.id = btnKey;
                    btnSetting.weight = _.isNumber(btnSetting.weight) ? btnSetting.weight : Infinity;
                    return btnSetting;
                });

                //just render button which has "locationGroup" property,
                listButtons = _.filter(listButtons, function (btnSetting) {
                    return !!btnSetting.locationGroup;
                });

                _.each(SUPPORTED_TOOLBARS, function (toolbar) {
                    var $toolbar = $("." + toolbar);
                    var currentButtons = _.where(listButtons, {toolbar: toolbar});

                    currentButtons = _.sortBy(currentButtons, "weight");

                    _.each(currentButtons, function (btnSetting) {
                        t.createEditorButtons(btnSetting.id);
                        var $group = $toolbar.find("." + btnSetting.locationGroup);
                        var $button = $(templateToolbarButton({
                            button: btnSetting
                        }));

                        $group
                                .append($button)
                                .removeClass("hidden");
                    });
                });
            },

            createEditorButtons: function (buttonName) {
                var button = this.editor.buttons[buttonName];
                if (button) {
                    if (button.cmd) {
                        this.controls[buttonName] = button.cmd;
                    } else {
                        this.controls[buttonName] = button.onclick;
                    }
                } else {
                    return false;
                }
            },

            bindControlHandlers: function () {
                var t = this;
                t.controlHandlers['buttons'] = {};
                t.controlHandlers['buttons']['state'] = new tinymce.util.Dispatcher();
                t.controlHandlers['buttons']['click'] = new tinymce.util.Dispatcher();
                t.controlHandlers['buttons']['click'].add(function (format) {
                    var controlAction = t.controls[format];
                    var controlActionType = (typeof controlAction);
                    if (controlActionType === "string") {
                        AJS.Rte.getEditor().execCommand(t.controls[format]);
                    } else if (controlActionType === "function") {
                        controlAction();
                    } else {
                        // unsupported controlAction
                    }
                });
            },

            createBlockFormats: function () {
                var t = this;
                t.controlHandlers['formatselect'] = {};
                t.controlHandlers['formatselect']['state'] = new tinymce.util.Dispatcher();
                t.controlHandlers['formatselect']['click'] = new tinymce.util.Dispatcher();
                t.controlHandlers['formatselect']['click'].add(function (format) {
                    AJS.Rte.getEditor().execCommand('FormatBlock', false, format);
                });
            },

            createForeColorMenu: function () {
                return true;
            },

            _updateUndoStatus: function (ed) {
                var um = ed.undoManager;
                this.controlHandlers['buttons']['state'].dispatch('undo', "disabled", !um.hasUndo() && !um.typing);
                this.controlHandlers['buttons']['state'].dispatch('redo', "disabled", !um.hasRedo());
            },

            nodeChanged: function (ed, cm, n, co, ob) {
                var t = this;
                var p;

                each(t.stateControls, function (buttonName) {
                    t.controlHandlers['buttons']['state'].dispatch(buttonName, "active", !!ed.queryCommandState(t.controls[buttonName]));
                });

                function getParent(func) {
                    var i;
                    var parents = ob.parents;
                    for (i = 0; i < parents.length; i++) {
                        if (func(parents[i])) {
                            return parents[i];
                        }
                    }
                }

                t._updateUndoStatus(ed);
                t.controlHandlers['buttons']['state'].dispatch('outdent', "disabled", !ed.queryCommandState('Outdent'));

                p = getParent(DOM.isBlock);
                if (p) {
                    t.controlHandlers['formatselect']['state'].dispatch(p.nodeName.toLowerCase());
                }
            }
        };

        return {
            Editor: PageEditor,
            ThemeOptions: ConfluenceThemeOptions
        };
    };
});

require('confluence/module-exporter').safeRequire('atlassian-tinymce/themes/atlassian/editor_template', function(EditorTemplate) {
    require('ajs').toInit(function() {
        var tinymce = require('tinymce');

        var editorTemplate = EditorTemplate();
        // Tell it to load theme specific language pack(s)
        tinymce.ThemeManager.requireLangPack('advanced');
        tinymce.create('tinymce.themes.ConfluenceTheme', editorTemplate.ThemeOptions);
        tinymce.ThemeManager.add('atlassian', tinymce.themes.ConfluenceTheme);

        window.requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
    });
});