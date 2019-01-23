/**
 * @module confluence-editor/tinymce3/plugins/imagedialog/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/imagedialog/editor_plugin_src', [
    'tinymce',
    'confluence/legacy'
], function(
    tinymce,
    Confluence
) {
    "use strict";

    return {
        init : function(ed) {
            ed.onInit.add(function(){
                ed.addCommand("mceConfimage", Confluence.Editor.defaultInsertImageDialog);
            });
        },

        getInfo : function() {
            return {
                longname : 'Confluence Image Dialog',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };



});

require('confluence/module-exporter')
        .safeRequire('confluence-editor/tinymce3/plugins/imagedialog/editor_plugin_src', function(ConfluenceImageDialogPlugin) {
            var tinymce = require('tinymce');

            tinymce.create('tinymce.plugins.ConfluenceImageDialog', ConfluenceImageDialogPlugin);

            // Register plugin
            tinymce.PluginManager.add('confluenceimagedialog', tinymce.plugins.ConfluenceImageDialog);
        });
