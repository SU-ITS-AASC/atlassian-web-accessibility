/**
 * 'Autocomplete confluence media' dropdown appears when you press a '!' character in the editor.
 * @module confluence-editor/tinymce3/plugins/autocomplete-media/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/autocomplete-media/editor_plugin_src', [
    'tinymce',
    'confluence/legacy',
    'confluence-editor/tinymce3/plugins/autocomplete-media/autocomplete-settings-media'
], function(
    tinymce,
    Confluence,
    AutocompleteMedia
) {
    "use strict";

    return {
        init: function (ed) {
            var triggerKey = '!';
            ed.addCommand('mceConfAutocompleteImage', function () {
                Confluence.Editor.Autocompleter.Manager.shortcutFired(triggerKey);
            });
            ed.addShortcut("ctrl+shift+m", ed.getLang("AutoComplete"), "mceConfAutocompleteImage");
            AutocompleteMedia();
        },

        getInfo: function () {
            return {
                longname: 'Auto Complete Media',
                author: 'Atlassian',
                authorurl: 'http://www.atlassian.com',
                version: tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };
});

require('confluence/module-exporter').safeRequire('confluence-editor/tinymce3/plugins/autocomplete-media/editor_plugin_src', function(AutoCompleteMediaPlugin) {
    var tinymce = require('tinymce');
    tinymce.create('tinymce.plugins.AutoCompleteMedia', AutoCompleteMediaPlugin);
    tinymce.PluginManager.add('autocompletemedia', tinymce.plugins.AutoCompleteMedia);
});
