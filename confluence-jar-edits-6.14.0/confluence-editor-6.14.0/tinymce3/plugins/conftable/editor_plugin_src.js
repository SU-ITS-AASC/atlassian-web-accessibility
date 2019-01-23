/**
 * Plugin that encapsulates Confluence customizations to tables.
 * @module confluence-editor/tinymce3/plugins/conftable/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/conftable/editor_plugin_src', [
    'jquery',
    'tinymce'
], function(
    $,
    tinymce
) {
    "use strict";

    return {
        init : function(ed, url) {

            /**
             * ALT + UP / DOWN adds a new row above or below the current row.
             */
            !tinymce.isIE8 && ed.onKeyDown.add(function (ed, e) {
                if (!e.altKey || (e.keyCode !== 38 && e.keyCode !== 40)) {
                    return;
                }

                var range = ed.selection.getRng(true);
                var $targetCell = $(range.startContainer).closest("td.confluenceTd, th.confluenceTh", ".mceContent");

                if ($targetCell.length === 0) {
                    return;
                }

                ed.execCommand(e.keyCode === 38 ? "mceTableInsertRowBefore" : "mceTableInsertRowAfter");

                // place cursor in first cell of new row
                var firstCell = $targetCell.parent()[e.keyCode === 38 ? "prev" : "next"]().find("td:first-child")[0];

                // If we're in a table with a numbering column, we can't put the cursor in the first cell of the row
                var $firstCell = $(firstCell);
                if ($firstCell.hasClass('numberingColumn')) {
                    firstCell = $firstCell.next()[0];
                }

                range.setStart(firstCell, 0);
                range.setEnd(firstCell, 0);
                ed.selection.setRng(range);

                return tinymce.dom.Event.prevent(e);
            });
        },

        getInfo : function () {
            return {
                longname : "Confluence Table Plugin",
                author : "Atlassian",
                authorurl : "http://www.atlassian.com",
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };
});

require('confluence/module-exporter')
        .safeRequire('confluence-editor/tinymce3/plugins/conftable/editor_plugin_src', function(ConfluenceTablePlugin) {
            var tinymce = require('tinymce');

            tinymce.create('tinymce.plugins.ConfluenceTablePlugin', ConfluenceTablePlugin);

            tinymce.PluginManager.add("conftable", tinymce.plugins.ConfluenceTablePlugin);
        });
