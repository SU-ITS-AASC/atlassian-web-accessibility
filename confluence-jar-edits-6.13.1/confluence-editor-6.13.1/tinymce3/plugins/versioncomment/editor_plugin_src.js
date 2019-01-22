/**
 * @module confluence-editor/tinymce3/plugins/versioncomment/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/versioncomment/editor_plugin_src', [
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
                var params = {
                    versionComment : AJS.params.versionComment
                };
                $('#rte-savebar-tinymce-plugin-point').append(Templates.Editor.SaveBar.VersionComment.render(params));
            });

        },

        getInfo : function() {
            return {
                longname : 'Confluence Version Comment',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };
});

require('confluence/module-exporter')
        .safeRequire('confluence-editor/tinymce3/plugins/versioncomment/editor_plugin_src', function(ConfluenceVersionCommentPlugin) {
            var tinymce = require('tinymce');

            tinymce.create('tinymce.plugins.ConfluenceVersionComment', ConfluenceVersionCommentPlugin);

            // Register plugin
            tinymce.PluginManager.add('confluenceversioncomment', tinymce.plugins.ConfluenceVersionComment);
        });
