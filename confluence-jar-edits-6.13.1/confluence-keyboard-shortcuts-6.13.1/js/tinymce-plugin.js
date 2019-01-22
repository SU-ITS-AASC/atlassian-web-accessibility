/**
 * @module confluence-keyboard-shortcuts/tinymce-plugin
 */
define('confluence-keyboard-shortcuts/tinymce-plugin', [
    'ajs',
    'confluence-keyboard-shortcuts/confluence-keyboard-shortcuts'
], function(
    AJS,
    KeyboardShortcutsObject
) {
    "use strict";

    var KeyboardShortcutsPlugin = {};
    KeyboardShortcutsPlugin.init = function(ed) {
        AJS.debug("Init Editor Keyboard shortcuts plugin");

        var buildFormatFunction = function(format) {
            return function() {
                ed.execCommand("FormatBlock", false, format);
            };
        };
        for (var i=1; i<7; i++) {
            ed.addCommand("FormatBlock-h" + i, buildFormatFunction("h" + i));
        }
        ed.addCommand("FormatBlock-p", buildFormatFunction("p"));
        ed.addCommand("FormatBlock-pre", buildFormatFunction("pre"));
        ed.addCommand("FormatBlock-blockquote", buildFormatFunction("blockquote"));

        ed.addCommand("mceConfShortcutDialog", KeyboardShortcutsObject.keyboardShortcuts.openDialog);
        ed.addButton("help", {title : "confluence.conf_shortcuts_help_desc", cmd : "mceConfShortcutDialog"});
    };

    KeyboardShortcutsPlugin.getInfo = function() {
        var tinymce = require('tinymce');

        return {
            longname : "Atlassian Editor Keyboard Shortcuts Plugin",
            author : "Atlassian",
            authorurl : "http://www.atlassian.com",
            version : tinymce.majorVersion + "." + tinymce.minorVersion
        };
    };

    return KeyboardShortcutsPlugin;

});

require('confluence/module-exporter').safeRequire('confluence-keyboard-shortcuts/tinymce-plugin', function(KeyboardShortcutsPlugin) {

    var tinymce = require('tinymce');

    tinymce.create('tinymce.plugins.KeyboardShortcutsPlugin', KeyboardShortcutsPlugin);
    tinymce.PluginManager.add("keyboardshortcuts", tinymce.plugins.KeyboardShortcutsPlugin);

});
