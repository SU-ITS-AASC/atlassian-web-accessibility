/**
 * @module confluence-editor/tinymce3/plugins/table/atlassian-table-migration
 */
define('confluence-editor/tinymce3/plugins/table/atlassian-table-migration', [
    'ajs',
    'jquery',
    'confluence-editor/tinymce3/plugins/table/atlassian-table'
], function(
    AJS,
    $,
    AtlassianTable
) {
    "use strict";

    /*
     * This migrates the table highlight markup from the old version in 4.0, 4.1, and 4.3 to the new simpler
     * version in 4.3.x.
     *
     * Specifically:
     * - Headings are always th
     * - There's no highlight / nohighlight to represent headings in td's and non-headings in th's
     * - Colour highlighting is managed independently from headings via highlight-[colour] classes and the data-highlight-colour attribute.
     */

    function migrateCells(cells) {
        cells.each(function() {
            var $el = $(this);
            var hlClass = $el.attr('data-highlight-class');
            var hlColour;
            if($el.hasClass('nohighlight')) {
                $el.removeClass('nohighlight');
                AtlassianTable.convertToNormalCells($el);
                // "nohighlight" has no colours applied - exit early.
                return;
            } else if($el.hasClass('highlight')) {
                $el.removeClass('highlight');
                if(!hlClass) {
                    // force to the previously implicit "grey"
                    $el.attr('data-highlight-colour', 'grey');
                    $el.addClass('highlight-grey');
                }
            }
            if(hlClass) {
                $el.removeClass(hlClass);
                $el.removeAttr('data-highlight-class');
                switch(hlClass) {
                    case 'warning':
                        hlColour = 'red';
                        break;
                    case 'success':
                        hlColour = 'green';
                        break;
                    case 'note':
                        hlColour = 'yellow';
                        break;
                    case 'info':
                        hlColour = 'blue';
                        break;
                }
                if(hlColour) {
                    $el.addClass('highlight-' + hlColour);
                    $el.attr('data-highlight-colour', hlColour);
                }
            }
        });
    }

    function migrateTables(from) {
        from = from || $(AJS.Rte.getEditor().getBody());
        var tick1 = new Date().getTime();
        var cells = from.find('td.highlight,th.nohighlight,td[data-highlight-class],th[data-highlight-class]');
        var tick2 = new Date().getTime();
        migrateCells(cells);
        var tick3 = new Date().getTime();
        AJS.debug("Migration duration: selector: " + (tick2 - tick1) + "ms; migration: " + (tick3 - tick2) + "ms");
    }

    return migrateTables;
});

require('confluence/module-exporter')
        .exportModuleAsGlobal('confluence-editor/tinymce3/plugins/table/atlassian-table-migration', 'AJS.Rte.Migration.Table.migrateTables', function(migrateTables) {
            var AJS = require('ajs');
            var $ = require('jquery');

            /*
             * Apply migration after a paste in case pasting content from an unmigrated page.
             */
            $(document).bind('postPaste', function(e, pl, o) {
                // Migrate in case pasting old data
                AJS.Rte.Migration.Table.migrateTables();
            });

            /*
             * Migrate on initial load in case working with an old table format.
             *
             * Notes from testing:
             * - Determination if migration is required is typically in the range of 0-1ms (even in IE8), so it is low cost once migrated.
             * - Migration is still quite fast, typically < 20ms even in IE8 with a large page.
             * - Migration time seems mostly proportional to the number of th and td conversions, and size of content inside migrated cells.
             */
            AJS.bind("init.rte", function() {
                // Migrate initial data
                AJS.Rte.Migration.Table.migrateTables();
            });
        });