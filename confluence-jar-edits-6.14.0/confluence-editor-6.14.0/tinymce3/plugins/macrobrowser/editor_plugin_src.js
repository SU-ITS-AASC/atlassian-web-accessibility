/**
 * @module confluence-editor/tinymce3/plugins/macrobrowser/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/macrobrowser/editor_plugin_src', [
    'tinymce'
], function(
    tinymce
) {
    "use strict";

    return {

        init : function(ed) {

            ed.onInit.add(function(){
                ed.addCommand("mceConfMacroBrowser", tinymce.confluence.macrobrowser.macroBrowserToolbarButtonClicked);
            });

        },

        getInfo : function() {
            return {
                longname : 'Confluence Macro Browser',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };
});

require('confluence/module-exporter')
        .safeRequire('confluence-editor/tinymce3/plugins/macrobrowser/editor_plugin_src', function(ConfluenceMacroBrowserPlugin) {
            var tinymce = require('tinymce');

            tinymce.create('tinymce.plugins.ConfluenceMacroBrowser', ConfluenceMacroBrowserPlugin);

            // Register plugin
            tinymce.PluginManager.add('confluencemacrobrowser', tinymce.plugins.ConfluenceMacroBrowser);
        });
