/**
 * 'Autocomplete confluence links' dropdown appears when you press a '[' character in the editor.
 *
 * @module confluence-editor/tinymce3/plugins/autocomplete-link/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/autocomplete-link/editor_plugin_src', [
    'tinymce',
    'confluence/legacy',
    'confluence-editor/tinymce3/plugins/autocomplete-link/autocomplete-settings-links'
], function(
    tinymce,
    Confluence,
    AutocompleteLink
) {
    "use strict";

    return {
        init: function (ed) {
            var triggerKey = '[';
            ed.addCommand('mceConfAutocompleteLink', function () {
                Confluence.Editor.Autocompleter.Manager.shortcutFired(triggerKey);
            });

            ed.addShortcut("ctrl+shift+k", ed.getLang("AutoComplete"), "mceConfAutocompleteLink");
            AutocompleteLink();
        },

        getInfo: function () {
            return {
                longname: 'Auto Complete Link',
                author: 'Atlassian',
                authorurl: 'http://www.atlassian.com',
                version: tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };
});

require('confluence/module-exporter').safeRequire('confluence-editor/tinymce3/plugins/autocomplete-link/editor_plugin_src', function(AutoCompleteLinkPlugin) {
    var tinymce = require('tinymce');
    tinymce.create('tinymce.plugins.AutoCompleteLink', AutoCompleteLinkPlugin);
    tinymce.PluginManager.add('autocompletelink', tinymce.plugins.AutoCompleteLink);
});
