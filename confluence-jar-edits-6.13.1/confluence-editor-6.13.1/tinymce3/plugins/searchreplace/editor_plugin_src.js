/**
 * @module confluence-editor/tinymce3/plugins/searchreplace/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/searchreplace/editor_plugin_src', [
    'jquery',
    'ajs',
    'confluence/legacy',
    'document',
    'tinymce'
], function(
    $,
    AJS,
    Confluence,
    document,
    tinymce
) {
    "use strict";

    var toolbarId = "searchreplace";

    /** A buffer of key codes pressed while waiting for the search bar to slide out */
    var keycodeBuffer = null;

    /** A flag to protect against successive opening or closing - e.g. fast clicks of button, or double press of ctrl + f. */
    var toolbarStateChanging = false;

    var cancelKeyboardFunction = function(ed, e) {
        e.preventDefault();
        e.stopPropagation();
    };

    /**
     * Buffer any character codes the user is typing but also prevent
     * the event that is instigating them.
     */
    var bufferTextFunction = function(ed, e) {
        cancelKeyboardFunction(ed, e);

        var keyCode = e.which;
        // IE8 doesn't have charCode for keypress event
        if (!keyCode) {
            keyCode = e.charCode ? e.charCode : e.keyCode;
        }

        // Firefox and Opera wrongly raise keypress for control characters
        if (keyCode < 48) {
            return;
        }

        keycodeBuffer.push(keyCode);
    };

    // Handle UTF-16 surrogate pair character codes
    var surrogatePairFixedFromCharCode = function(code) {
        if (code > 0xFFFF) {
            code -= 0x10000;
            return String.fromCharCode(0xD800 + (code >> 10), 0xDC00 +  (code & 0x3FF));
        }
        else {
            return String.fromCharCode(code);
        }
    };

    /**
     * Block keypresses in the editor and buffers them.
     */
    var block = function () {
        var ed = AJS.Rte.getEditor();

        keycodeBuffer = [];

        ed.onKeyDown.add(bufferTextFunction);
        ed.onKeyPress.add(cancelKeyboardFunction);
        ed.onKeyUp.add(cancelKeyboardFunction);
    };

    /**
     * Activate or deactivate the toolbar button for find and replace.
     * There is no visual indication of the button being active or not,
     * it's click handler is simply blocked.
     *
     * This is used to prevent multiple clicks during the delayed search bar
     * open or hide animation.
     *
     * @param active if true then the button should be active
     */
    var changeButtonActiveState = function(active) {
        var buttonLink = $("#rte-button-searchreplace a");

        if (buttonLink.length) {
            if (active) {
                buttonLink.unbind("click", false);
            } else {
                buttonLink.bind("click", false);
            }
        }
    };

    /**
     * Unblock the keyboard events and return any buffered text.
     */
    var unblock = function () {
        var ed = AJS.Rte.getEditor();
        ed.onKeyDown.remove(bufferTextFunction);
        ed.onKeyPress.remove(cancelKeyboardFunction);
        ed.onKeyUp.remove(cancelKeyboardFunction);

        var bufferedText = "";
        for (var i = 0; i < keycodeBuffer.length; i++) {
            bufferedText += surrogatePairFixedFromCharCode(keycodeBuffer[i]);
        }

        return bufferedText.toLowerCase();
    };

    var toggleToolbar = function() {

        if (toolbarStateChanging) {
            return;
        }

        toolbarStateChanging = true;

        var button = $("#rte-button-searchreplace");
        var enable = !button.hasClass("active");
        var body = $("body");
        var animate = ! body.hasClass("no-tools") || body.hasClass("no-tools-toolbars-visible");

        if (enable) {
            button.addClass("active");

            if (!Confluence.Editor.searchManager) {
                Confluence.Editor.searchManager = new Confluence.Editor.SearchManager(toolbarId);
            }

            $(document).trigger("createContextToolbarRow.Toolbar", {
                id: toolbarId,
                buttons: Confluence.Editor.searchToolbar.Buttons,
                topToolbar: true,
                editorAdjacent: true,
                animate: animate,
                onVisible: function() {
                    var buffered = unblock();
                    // set any buffered text
                    Confluence.Editor.searchManager.onVisible(buffered);
                    changeButtonActiveState(true);
                    toolbarStateChanging = false;

                    // To aid testing, you can check for this in tests after activating the toolbar.
                    // This needs to live here since event blocking means that if it isn't the very
                    // last thing done then events can be lost (and async tests can fail).
                    Confluence.Editor.searchManager.initialised = true;
                }})
            .trigger("enableContextToolbarRow.Toolbar");
            block();
            Confluence.Editor.searchManager.init();

            changeButtonActiveState(false);
        } else {
            button.removeClass("active");

            Confluence.Editor.searchManager.onHide();

            $(document).trigger("removeContextToolbarRow.Toolbar", {
                id: toolbarId,
                animate: animate,
                onHide: function() {
                    $(document).trigger("contextToolbarRowRemoved.Toolbar");
                    changeButtonActiveState(true);
                    toolbarStateChanging = false;
                    Confluence.Editor.searchManager.initialised = false;
                }
            });
            changeButtonActiveState(false);

            // IE and Webkit need you to focus on the iframe first and then the editor. (Firefox won't work if you do this.)
            if (!tinymce.isGecko) {
                frames["wysiwygTextarea_ifr"].focus();
            }
            tinymce.activeEditor.focus();
        }
    };

    return {
        init : function(ed, url) {

            ed.addCommand('mceSearchReplaceToolbar', function() {
                toggleToolbar();
            });

            ed.addCommand('mceConfSearch', function(ui, parameters) {
                if (!Confluence.Editor.searchManager) {
                    return;
                }

                parameters = parameters || {};

                if (parameters.backwards
                        && !tinymce.activeEditor.plugins.customtoolbar
                                .isToolbarButtonEnabled("search-toolbar-find-previous-button")) {
                    Confluence.Editor.searchManager.focus();
                    return;
                }

                if (!parameters.backwards
                        && !tinymce.activeEditor.plugins.customtoolbar
                                .isToolbarButtonEnabled("search-toolbar-find-next-button")) {
                    Confluence.Editor.searchManager.focus();
                    return;
                }

                Confluence.Editor.searchManager.find(parameters.backwards, parameters.onFound, parameters.onNotFound);
            });

            ed.addCommand('mceConfReplace', function(ui, parameters) {
                if (!Confluence.Editor.searchManager) {
                    return;
                }

                parameters = parameters || {};

                if (!tinymce.activeEditor.plugins.customtoolbar
                                .isToolbarButtonEnabled("search-toolbar-replace-button")) {
                    parameters.onInactive && parameters.onInactive();
                } else {
                    Confluence.Editor.searchManager.replace(parameters.onFound, parameters.onNotFound);
                }

            });

            ed.addCommand('mceConfReplaceAll', function(ui, parameters) {
                if (!Confluence.Editor.searchManager) {
                    return;
                }

                parameters = parameters || {};

                if (!tinymce.activeEditor.plugins.customtoolbar
                                .isToolbarButtonEnabled("search-toolbar-replaceall-button")) {
                    return;
                }

                Confluence.Editor.searchManager.replaceAll(parameters.onReplaced, parameters.onNotReplaced);
            });

            ed.addCommand('mceConfSearchClose', function(ui, parameters) {
                if (!Confluence.Editor.searchManager) {
                    return;
                }

                //toogle toolbar to close it.
                ed.execCommand("mceSearchReplaceToolbar", false, null);
            });

            // Register buttons
            ed.addButton('searchreplace', {
                title : 'searchreplace.search_desc',
                cmd : 'mceSearchReplaceToolbar'
            });

            /**
             * The first press of ctrl + f should display the toolbar. Subsequent presses should focus the find box.
             */
            if (!tinymce.isIE8) {
                ed.addShortcut('ctrl+f', 'searchreplace.search_desc', function() {
                    if (Confluence.Editor.searchManager && Confluence.Editor.searchManager.isVisible()) {
                        Confluence.Editor.searchManager.focus();
                    } else {
                        ed.execCommand("mceSearchReplaceToolbar", false, false, {skip_undo : true});
                    }
                });
            }
        },

        getInfo : function() {
            return {
                longname : 'Search/Replace',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                infourl : 'http://www.atlassian.com',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };
});

require('confluence/module-exporter')
        .safeRequire('confluence-editor/tinymce3/plugins/searchreplace/editor_plugin_src', function(AtlassianSearchReplacePlugin) {
            var tinymce = require('tinymce');

            tinymce.create('tinymce.plugins.AtlassianSearchReplacePlugin', AtlassianSearchReplacePlugin);

            // Register plugin
            tinymce.PluginManager.add('searchreplace', tinymce.plugins.AtlassianSearchReplacePlugin);
        });