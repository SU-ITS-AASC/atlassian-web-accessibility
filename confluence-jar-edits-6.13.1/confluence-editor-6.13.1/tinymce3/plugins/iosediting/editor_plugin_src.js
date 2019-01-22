/**
 * @module confluence-editor/tinymce3/plugins/iosediting/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/iosediting/editor_plugin_src', [
    'jquery',
    'ajs',
    'tinymce'
], function(
    $,
    AJS,
    tinymce
) {
    "use strict";

    /**
     * UX tweak so users understand how to comment using the iPad.
     */
    return {
        init : function(ed) {
            if (tinymce.isIDevice) {
                setTimeout(function(){
                    var $body = $(AJS.Rte.getEditor().getBody());
                    $body.addClass('ios');
                }, 0);
            }
        },
        getInfo : function () {
            return {
                longname : "iOS Comments Plugin",
                author : "Atlassian",
                authorurl : "http://www.atlassian.com",
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };
});

require('confluence/module-exporter')
        .safeRequire('confluence-editor/tinymce3/plugins/iosediting/editor_plugin_src', function(iOSEditingPlugin) {
            var tinymce = require('tinymce');

            tinymce.create('tinymce.plugins.iOSEditing', iOSEditingPlugin);

            tinymce.PluginManager.add('iosediting', tinymce.plugins.iOSEditing);
        });
