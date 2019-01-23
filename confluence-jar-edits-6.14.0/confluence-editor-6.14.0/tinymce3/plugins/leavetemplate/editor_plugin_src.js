/**
 * This plugin handles the navigation event when leaving a template with a "dirty" editor.
 * It will prompt for user confirmation before leaving the page.
 *
 * @module confluence-editor/tinymce3/plugins/leavetemplate/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/leavetemplate/editor_plugin_src', [
    'jquery',
    'ajs',
    'confluence/legacy',
    'window',
    'tinymce'
], function(
    $,
    AJS,
    Confluence,
    window,
    tinymce
) {
    "use strict";

    return {

        init : function(ed) {

            function onLeavePage() {
                /*
                 Confluence.Editor.UI.isFormEnabled() is used here as a safeguard (and is not strictly necessary).

                 We don't want to rely on any state outside of the current editor instance though (so we can have
                 multiple editors in a page in the future), so we need to revisit this in the future.

                 However in the future if the template editor is quickened then this plugin would otherwise cease to
                 function properly and cause issues.
                 */
                if (Confluence.Editor.UI.isFormEnabled() && ed.isDirty() && !Confluence.Editor.isEmpty()){
                    return AJS.I18n.getText("unsaved.template.lost");
                }
            }

            ed.onInit.add(function () {
                $(window).bind('beforeunload', onLeavePage);
            });

            ed.onRemove.add(function () {
                $(window).unbind('beforeunload', onLeavePage);
            });
        },

        getInfo : function() {
            return {
                longname : 'Confluence Leave Template',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };
});

require('confluence/module-exporter')
        .safeRequire('confluence-editor/tinymce3/plugins/leavetemplate/editor_plugin_src', function(ConfluenceLeaveTemplatePlugin) {
            var tinymce = require('tinymce');

            tinymce.create('tinymce.plugins.ConfluenceLeaveTemplate', ConfluenceLeaveTemplatePlugin);

            tinymce.PluginManager.add("confluenceleavetemplate", tinymce.plugins.ConfluenceLeaveTemplate);
        });