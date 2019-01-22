/**
 * This plugin handles the navigation event when leaving a comment with a "dirty" editor.
 * It will prompt for user confirmation before leaving the page.
 *
 * @module confluence-editor/tinymce3/plugins/leavecomment/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/leavecomment/editor_plugin_src', [
    'jquery',
    'ajs',
    'tinymce',
    'confluence/legacy',
    'window'
], function(
    $,
    AJS,
    tinymce,
    Confluence,
    window
) {
    "use strict";

    return {

        init : function(ed) {

            function onLeavePage() {
                /*
                 Confluence.Editor.UI.isFormEnabled() is an undesirable dependency we require to avoid invoking the
                 a page-leave warning when saving a comment.

                 We don't want to rely on any state outside of the current editor instance though (so we can have
                 multiple editors in a page in the future), so we need to revisit this in the future.

                 To reproduce the scenario in which isFormEnabled() is required you need to perform an action that
                 forces the quick-editor to fall back into slow-edit mode, e.g. using the code macro.

                 The reason this is an issue at all is due to the isDirty() check being influenced by the isNotDirty
                 flag, which is set before the form is submitted in slow edit, but not in quick edit w/ fallback.
                 */
                if (Confluence.Editor.UI.isFormEnabled() && ed.isDirty() && !Confluence.Editor.isEmpty()){
                    return AJS.I18n.getText("unsaved.comment.lost");
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
                longname : 'Confluence Leave Comment',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };
});

require('confluence/module-exporter')
        .safeRequire('confluence-editor/tinymce3/plugins/leavecomment/editor_plugin_src', function(ConfluenceLeaveCommentPlugin) {
            var tinymce = require('tinymce');

            tinymce.create('tinymce.plugins.ConfluenceLeaveComment', ConfluenceLeaveCommentPlugin);

            tinymce.PluginManager.add("confluenceleavecomment", tinymce.plugins.ConfluenceLeaveComment);
        });