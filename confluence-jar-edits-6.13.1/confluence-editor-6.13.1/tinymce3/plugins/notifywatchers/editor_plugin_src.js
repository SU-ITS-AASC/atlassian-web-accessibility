/**
 * @module confluence-editor/tinymce3/plugins/notifywatchers/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/notifywatchers/editor_plugin_src', [
    'jquery',
    'ajs',
    'confluence/legacy',
    'tinymce'
], function(
    $,
    AJS,
    Confluence,
    tinymce
) {
    "use strict";

    return {
        init : function(ed) {
            ed.onInit.add(function(){
                var params = {
                    contentId: AJS.params.contentId,
                    defaultVersionComment : AJS.params.versionComment
                };
                $('#rte-savebar-tinymce-plugin-point').append(Confluence.Templates.Editor.SaveBar.NotifyWatchers.render(params));
            });

            require(['confluence/persistable']);
        },

        getInfo : function() {
            return {
                longname : 'Confluence Notify Watchers',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };


});

require('confluence/module-exporter')
        .safeRequire('confluence-editor/tinymce3/plugins/notifywatchers/editor_plugin_src', function(ConfluenceNotifyWatchersPlugin) {
            var tinymce = require('tinymce');

            tinymce.create('tinymce.plugins.ConfluenceNotifyWatchers', ConfluenceNotifyWatchersPlugin);

            // Register plugin
            tinymce.PluginManager.add('confluencenotifywatchers', tinymce.plugins.ConfluenceNotifyWatchers);
        });
