/**
 * Extracted out our version of the charmap (from advanced theme).
 * It is easier to manage and upgrade tinymce this way.
 * @module confluence-editor/tinymce3/plugins/confcharmap/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/confcharmap/editor_plugin_src', [
    'tinymce'
], function(
    tinymce
) {
    "use strict";

    return {
        init : function(ed, url) {
            // Register commands
            ed.addCommand('confCharmap', function() {

                ed.windowManager.open({
                    id: "insert-char-dialog",
                    url : tinymce.settings.editor_plugin_action_base_path + '/charmap.action',
                    width : 600 + parseInt(ed.getLang('advanced.charmap_delta_width', 0)),
                    height : 290 + parseInt(ed.getLang('advanced.charmap_delta_height', 0)),
                    inline : true,
                    name: "advanced.charmap_desc"
                });

            });
        },

        getInfo : function() {
            return {
                longname : 'Confluence Charmap Plugin',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };
});

require('confluence/module-exporter').safeRequire('confluence-editor/tinymce3/plugins/confcharmap/editor_plugin_src', function(ConfCharmapPlugin) {
    var tinymce = require('tinymce');

    tinymce.create('tinymce.plugins.ConfCharmapPlugin', ConfCharmapPlugin);

    // Register plugin
    tinymce.PluginManager.add("confcharmap", tinymce.plugins.ConfCharmapPlugin);
});