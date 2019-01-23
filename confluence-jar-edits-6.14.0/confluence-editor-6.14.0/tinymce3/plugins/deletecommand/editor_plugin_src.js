/**
 * @module confluence-editor/tinymce3/plugins/deletecommand/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/deletecommand/editor_plugin_src', [
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
     * Plugin that encapsulates a custom "delete" command with custom delete behaviour.
     *
     * It was introduced to override some undesirable behaviour in webkit, where if the whole contents of macro placeholder (which is a single cell
     * and single row table) were selected, running the native browser document.execCommand("Delete") will cause the
     * whole table to be removed.
     *
     * It is intended that this custom delete command will delegate to the native command in other circumstances.
     */
    return {
        init : function (ed) {
            ed.addCommand("mceDelete", function (ui, value) {

                /**
                 * Performs custom delete.
                 *
                 * @returns true if the custom delete was performed, false otherwise.
                 */
                function customDelete() {
                    if (tinymce.isWebKit) {
                        var range = ed.selection.getRng(1);

                        if (range.collapsed) {
                            return false;
                        }

                        var macroPlaceholderBody = $(range.startContainer).closest(".wysiwyg-macro-body", ed.getBody())[0];

                        if (macroPlaceholderBody && AJS.EditorUtils.isRangeAtStartOf(macroPlaceholderBody, range) && AJS.EditorUtils.isRangeAtEndOf(macroPlaceholderBody, range)) {
                            var plainText = $(macroPlaceholderBody.firstChild).is("pre");
                            var nodeName = (plainText ? "pre" : "p");
                            var filler = $("<" + nodeName + "><br data-mce-bogus='1'></" + nodeName + ">")[0];

                            $(macroPlaceholderBody).html(filler);
                            ed.selection.select(filler, 1);

                            return true;
                        }
                    }

                    return false;
                }

                if (!customDelete()) {
                    ed.getDoc().execCommand('Delete', ui, value);
                }
            });
        },

        getInfo : function() {
            return {
                longname : 'Delete Command Plugin',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };
});

require('confluence/module-exporter')
        .safeRequire('confluence-editor/tinymce3/plugins/deletecommand/editor_plugin_src', function(DeleteCommandPlugin) {
            var tinymce = require('tinymce');

            tinymce.create('tinymce.plugins.DeleteCommandPlugin', DeleteCommandPlugin);

            tinymce.PluginManager.add('deletecommand', tinymce.plugins.DeleteCommandPlugin);
        });
