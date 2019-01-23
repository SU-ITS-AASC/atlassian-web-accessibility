/**
 * The 3rd and 4th arguments ensure that this module is executed synchronously, to register
 * the InsertFiles plugin before AJS.Rte.BootstrapManager.initialise is executed.
 *
 * This is necessary at the moment because we're still in the process of switching over to using
 * AMD throughout the codebase, and don't yet have a holistic approach to ensuring that all
 * TinyMCE plugins are registered before AJS.Rte.BootstrapManager.initialise is called.
 *
 * @module confluence-editor/tinymce3/plugins/insert-files/insert-files-plugin
 * @tainted tinymce
 */
define('confluence-editor/tinymce3/plugins/insert-files/insert-files-plugin', [
    "ajs",
    "jquery",
    "confluence-editor/utils/environment"
], function (
    AJS,
    $,
    environment
) {
    "use strict";

    return {
        init : function(ed) {

            //add a button in toolbar
            ed.addButton('confluence-insert-files', {
                //default value of "toolbar" is "toolbar-primary"
                title: AJS.I18n.getText("tinymce.confluence.files"),
                tooltip: AJS.I18n.getText("tinymce.confluence.conf_file_desc") + " (" +
                environment.transformCmdKeyTextBasingOnOS(AJS.I18n.getText("tinymce.confluence.conf_file_shortcut")) + ")",
                cmd: "mceConfimage",
                className: "insert-files",
                icon: "aui-icon aui-icon-small aui-iconfont-image",
                locationGroup: "rte-toolbar-group-files",
                weight: 0 //order of the new button in group, 0 => insert at beginning
            });
        },

        getInfo : function() {
            return {
                longname : 'Insert Files',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                infourl : 'http://www.atlassian.com/',
                version : "1.0"
            };
        }
    };
});

require('confluence/module-exporter')
        .safeRequire('confluence-editor/tinymce3/plugins/insert-files/insert-files-plugin', function(InsertFilesPlugin) {
            var tinymce = require('tinymce');

            tinymce.create('tinymce.plugins.InsertFiles', InsertFilesPlugin);

            // Register plugin
            tinymce.PluginManager.add('insertfiles', tinymce.plugins.InsertFiles);
        });
