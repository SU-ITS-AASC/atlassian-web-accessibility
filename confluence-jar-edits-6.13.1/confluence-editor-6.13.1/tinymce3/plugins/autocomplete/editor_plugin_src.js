/**
 * This "common" autocomplete plugin needs to be always included in order to use any other autocomplete-xxx plugin.
 * Eventually we would like to be able to remove it.
 * In order to do so, we need to fix first the confluence-mentions plugin and any other plugin
 * that depends on {@code Confluence.Editor.Autocompleter.Manager.triggerListener) being called in its behalf
 *
 * @module confluence-editor/tinymce3/plugins/autocomplete/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/autocomplete/editor_plugin_src', [
    'tinymce',
    'confluence/legacy',
    'ajs'
], function(
    tinymce,
    Confluence,
    AJS
) {
    "use strict";

    return {
        init : function(ed) {
            Confluence.Editor.Autocompleter.Settings = {};

            ed.onPostRender.add(function() {
                AJS.debug("Autocomplete enabled, adding keyPress listener");

                // Certain keys prompt the autocomplete, e.g. typing [ goes into "link auto-complete" mode
                ed.onKeyPress.addToTop(Confluence.Editor.Autocompleter.Manager.triggerListener);
                AJS.trigger('ready-editor-autocomplete');
            });

            // CONFDEV-3649 - Handle undo/redo correctly - reattach autocomplete, if needed
            ed.onUndo.add(Confluence.Editor.Autocompleter.Manager.reattach);
            ed.onRedo.add(Confluence.Editor.Autocompleter.Manager.reattach);
        },

        getInfo : function() {
            return {
                longname : 'Auto Complete',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };
});

require('confluence/module-exporter').safeRequire('confluence-editor/tinymce3/plugins/autocomplete/editor_plugin_src', function(AutoCompletePlugin) {
    var tinymce = require('tinymce');
    tinymce.create('tinymce.plugins.AutoComplete', AutoCompletePlugin);
    tinymce.PluginManager.add('autocomplete', tinymce.plugins.AutoComplete);
});
