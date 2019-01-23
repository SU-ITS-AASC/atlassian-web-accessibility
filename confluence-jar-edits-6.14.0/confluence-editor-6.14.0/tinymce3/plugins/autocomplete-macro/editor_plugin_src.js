/**
 * 'Autocomplete confluence macro' dropdown appears when you press a '{' character in the editor.
 *
 * @module confluence-editor/tinymce3/plugins/autocomplete-macro/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/autocomplete-macro/editor_plugin_src', [
    'tinymce',
    'confluence-editor/tinymce3/plugins/autocomplete-macro/autocomplete-settings-macros'
], function(
    tinymce,
    AutoCompleteMacro
) {
    "use strict";

    return {
        init : function() {
            AutoCompleteMacro();
        },

        getInfo : function() {
            return {
                longname : 'Auto Complete Macro',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };
});

require('confluence/module-exporter').safeRequire('confluence-editor/tinymce3/plugins/autocomplete-macro/editor_plugin_src', function(AutoCompleteMacroPlugin) {
    var tinymce = require('tinymce');
    tinymce.create('tinymce.plugins.AutoCompleteMacro', AutoCompleteMacroPlugin);
    tinymce.PluginManager.add('autocompletemacro', tinymce.plugins.AutoCompleteMacro);
});