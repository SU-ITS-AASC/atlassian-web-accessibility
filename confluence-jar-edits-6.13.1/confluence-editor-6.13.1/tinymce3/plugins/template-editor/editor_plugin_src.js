/**
 * Common behaviour for the template editor context
 *
 * @module confluence-editor/tinymce3/plugins/template-editor/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/template-editor/editor_plugin_src', [
    'jquery',
    'tinymce'
], function(
    $,
    tinymce
) {
    "use strict";

    return {
        init : function(ed) {
            ed.onInit.add(function () {
                $(ed.getBody()).addClass('template-editor');
            });
        },

        getInfo : function() {
            return {
                longname : 'Confluence Template Editor',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };
});

require('confluence/module-exporter')
        .safeRequire('confluence-editor/tinymce3/plugins/template-editor/editor_plugin_src', function(ConfluenceTemplateEditorPlugin) {
            var tinymce = require('tinymce');

            tinymce.create('tinymce.plugins.ConfluenceTemplateEditor', ConfluenceTemplateEditorPlugin);

            tinymce.PluginManager.add("confluencetemplateeditor", tinymce.plugins.ConfluenceTemplateEditor);
        });