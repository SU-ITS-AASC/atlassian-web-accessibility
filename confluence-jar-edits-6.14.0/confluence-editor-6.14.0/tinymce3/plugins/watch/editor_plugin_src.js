/**
 * Confluence editor comment watch plugin.
 *
 * It will add the "watch" checkbox to the editor save bar if the global variable
 * AJS.Meta.get('use-watch') is set
 * @module confluence-editor/tinymce3/plugins/watch/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/watch/editor_plugin_src', [
    'jquery',
    'ajs',
    'tinymce',
    'confluence/templates'
], function(
    $,
    AJS,
    tinymce,
    Templates
) {
    "use strict";

    return {

        init : function(ed) {

            ed.onInit.add(function(){
                if (AJS.Meta.get('use-watch')) { // we can only guarantee that this variable will be populated when the editor is initialised
                    var params = {
                        userWatchingOwnContent: AJS.Meta.get('user-watching-own-content')
                    };
                    $('#rte-savebar-tinymce-plugin-point').append(Templates.Editor.SaveBar.Watch.render(params));
                }
            });

        },

        getInfo : function() {
            return {
                longname : 'Confluence Watch',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };
});

require('confluence/module-exporter')
        .safeRequire('confluence-editor/tinymce3/plugins/watch/editor_plugin_src', function(ConfluenceWatchPlugin) {
            var tinymce = require('tinymce');

            tinymce.create('tinymce.plugins.ConfluenceWatch', ConfluenceWatchPlugin);

            // Register plugin
            tinymce.PluginManager.add('confluencewatch', tinymce.plugins.ConfluenceWatch);
        });
