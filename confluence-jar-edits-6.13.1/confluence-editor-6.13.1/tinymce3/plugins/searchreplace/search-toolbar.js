/**
 * @module confluence-editor/tinymce3/plugins/searchreplace/search-toolbar
 */
define('confluence-editor/tinymce3/plugins/searchreplace/search-toolbar', [
    'jquery',
    'tinymce',
    'confluence/legacy'
], function (
    $,
    tinymce,
    Confluence
) {
    "use strict";
    return {
        initContextToolbars: function (e, editor) {

            /**
             * A utility function for IE and Firefox specifically that will move the cursor to the
             * end of the supplied textbox control.
             *
             * Webkit has a more sensible behaviour on focus so doesn't need this.
             */
            var moveCursorToEnd = function (textbox) {
                if (tinymce.isIE) {
                    var range = textbox.createTextRange();
                    range.execCommand("SelectAll");
                    range.move("textedit");
                    range.select();
                } else if (tinymce.isGecko) {
                    var length = $(textbox).val().length;
                    textbox.setSelectionRange(length, length);
                }
            };

            var focusOnButton = function (cssClass) {
                top.focus();
                tinymce.activeEditor.plugins.customtoolbar.focusToolbarButton(cssClass);
            };

            var focusOnFindTextBox = function () {
                top.focus();
                var textBox = $("#search-toolbar-find-text");
                textBox.focus();
                moveCursorToEnd(textBox[0]);
            };

            var focusOnReplaceTextBox = function () {
                top.focus();
                var textBox = $("#search-toolbar-replace-text");
                textBox.focus();
                moveCursorToEnd(textBox[0]);
            };

            var focusOnEditor = function () {
                if (tinymce.isIE) {
                    frames["wysiwygTextarea_ifr"].focus();
                }

                if (tinymce.isIE || tinymce.isGecko) {
                    var ed = tinymce.activeEditor;
                    ed.focus();
                    ed.selection.select(ed.getBody());
                    ed.selection.collapse(false);
                    ed.focus();
                }
            };

            // keyboard handling for the find text box
            var findKeyboardHandler = function (e) {
                if (!tinymce.isIE8 && (e.ctrlKey || (tinymce.isMac && e.metaKey)) && e.which === 70) {
                    // prevent browser search from kicking in
                    e.preventDefault();
                } else if (e.which === 13) {
                    e.preventDefault();
                    var parameters = {
                        backwards: false,
                        onFound: focusOnFindTextBox,
                        onNotFound: focusOnFindTextBox
                    };
                    tinymce.activeEditor.execCommand("mceConfSearch", false, parameters, {skip_undo: true});
                } else if (e.which === 27) {
                    e.preventDefault();
                    tinymce.activeEditor.execCommand("mceSearchReplaceToolbar", false, false, {skip_undo: true});
                }
            };

            // keyboard handling for the replace text box
            var replaceKeyboardHandler = function (e) {
                if (!tinymce.isIE8 && (e.ctrlKey || (tinymce.isMac && e.metaKey)) && e.which === 70) {
                    // prevent browser search from kicking in
                    e.preventDefault();
                } else if (e.which === 13) {
                    e.preventDefault();
                    var parameters = {
                        onFound: focusOnReplaceTextBox,
                        onNotFound: focusOnFindTextBox,
                        onInactive: function () {
                            tinymce.activeEditor.execCommand("mceConfSearch", false, {
                                backwards: false,
                                onFound: focusOnReplaceTextBox,
                                onNotFound: focusOnFindTextBox
                            }, {skip_undo: true});
                        }
                    };
                    tinymce.activeEditor.execCommand("mceConfReplace", false, parameters, {skip_undo: true});
                } else if (e.which === 27) {
                    e.preventDefault();
                    tinymce.activeEditor.execCommand("mceSearchReplaceToolbar", false, false, {skip_undo: true});
                }
            };

            // The toolbar is dependent on the browser so first create all the components before
            // button together the full button array
            var findTextBox = new Confluence.Editor.Toolbar.Components.TextBox({
                id: "search-toolbar-find-text",
                text: editor.getLang("searchreplace_dlg.findlabel"),
                name: "find",
                keydown: findKeyboardHandler,
                cssClass: "toolbar-find-input"
            });

            var replaceTextBox = new Confluence.Editor.Toolbar.Components.TextBox({
                id: "search-toolbar-replace-text",
                text: editor.getLang("searchreplace_dlg.replacelabel"),
                name: "replace",
                keydown: replaceKeyboardHandler,
                cssClass: "toolbar-replace-input"
            });

            var previousButton = new Confluence.Editor.Toolbar.Components.TextButton({
                text: editor.getLang("searchreplace_dlg.findprevious"),
                click: function () {
                    var parameters = {
                        backwards: true,
                        onFound: function () {
                            top.focus();
                            focusOnButton("search-toolbar-find-previous-button");
                        },
                        onNotFound: focusOnFindTextBox
                    };

                    editor.execCommand("mceConfSearch", false, parameters, {skip_undo: true});
                },
                textClass: "search-toolbar-find-previous-button"
            });

            var nextButton = new Confluence.Editor.Toolbar.Components.TextButton({
                text: tinymce.isIE ? editor.getLang("searchreplace_dlg.findlabel") : editor.getLang("searchreplace_dlg.findnext"),
                click: function () {
                    var parameters = {
                        backwards: false,
                        onFound: function () {
                            top.focus();
                            focusOnButton("search-toolbar-find-next-button");
                        },
                        onNotFound: focusOnFindTextBox
                    };

                    editor.execCommand("mceConfSearch", false, parameters, {skip_undo: true});
                },
                textClass: "search-toolbar-find-next-button"
            });

            var replaceButton = new Confluence.Editor.Toolbar.Components.TextButton({
                text: editor.getLang("searchreplace_dlg.replace"),
                click: function () {
                    // skip_undo because the implementation manually takes care of undo levels
                    editor.execCommand("mceConfReplace", false, {
                        onFound: function () {
                            top.focus();
                            focusOnButton("search-toolbar-replace-button");
                        },
                        onNotFound: focusOnFindTextBox
                    }, {skip_undo: true});
                },
                textClass: "search-toolbar-replace-button"
            });

            var replaceAllButton = new Confluence.Editor.Toolbar.Components.TextButton({
                text: editor.getLang("searchreplace_dlg.replaceall"),
                click: function () {
                    var parameters = {
                        onReplaced: focusOnEditor,
                        onNotReplaced: focusOnFindTextBox
                    };
                    editor.execCommand("mceConfReplaceAll", false, parameters);
                },
                textClass: "search-toolbar-replaceall-button"
            });

            var closeButton = new Confluence.Editor.Toolbar.Components.Button({
                text: editor.getLang("searchreplace_dlg.close"),
                iconClass: 'icon aui-icon aui-icon-small aui-iconfont-close-dialog',
                click: function () {
                    editor.execCommand("mceConfSearchClose", false, null);
                }
            });

            var buttons = [
                new Confluence.Editor.Toolbar.Components.Group([closeButton], {groupClass: 'close'}),
                new Confluence.Editor.Toolbar.Components.Group([findTextBox, replaceTextBox], {groupClass: 'no-separator'}),
                new Confluence.Editor.Toolbar.Components.Group((tinymce.isIE ? [nextButton] : [previousButton, nextButton])),
                new Confluence.Editor.Toolbar.Components.Group([replaceButton, replaceAllButton])
            ];


            return {
                Buttons: buttons
            };
        }
    };
});

require('confluence/module-exporter').safeRequire('confluence-editor/tinymce3/plugins/searchreplace/search-toolbar', function (TinyMceSearchToolbar) {
    var $ = require('jquery');
    var document = require('document');
    var Confluence = require('confluence/legacy');

    $(document).bind("initContextToolbars.Toolbar", function(e, editor) {
        Confluence.Editor.searchToolbar = TinyMceSearchToolbar.initContextToolbars(e, editor);
    });
});