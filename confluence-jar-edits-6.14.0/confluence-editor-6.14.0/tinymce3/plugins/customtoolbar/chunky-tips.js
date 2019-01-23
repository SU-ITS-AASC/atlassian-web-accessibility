/**
 * @module confluence-editor/tinymce3/plugins/customtoolbar/chunky-tips
 */
define('confluence-editor/tinymce3/plugins/customtoolbar/chunky-tips', [
    'ajs',
    'tinymce',
    'jquery'
], function(
    AJS,
    tinymce,
    $
) {
    "use strict";

    function ChunkyTips() {
        AJS.debug('Enabling Chunky Tooltip for the editor');

        function tooltipExtractor() {
            // handle missing tooltip for buttons without a tooltip
            return $(this).attr('data-tooltip') || '';
        }

        var defaultOptions = {
            live: true, // Created links are handled automatically
            gravity: 'n', // Point the arrow to the top
            title: tooltipExtractor,
            delayIn: 250,
            delayOut: 0 // Can be removed once AUI-1214 is resolved
        };

        var tooltipBelowPreferredFn = $.fn.tipsy.autoBounds2(50, 'n');
        var tooltipAbovePreferredFn = $.fn.tipsy.autoBounds2(50, 's');
        var tooltipRightPreferredFn = $.fn.tipsy.autoBounds2(50, 'w');

        var tooltipDefaultBelowOptions = $.extend({}, defaultOptions, {gravity: tooltipBelowPreferredFn});
        var tooltipDefaultAboveOptions = $.extend({}, defaultOptions, {gravity: tooltipAbovePreferredFn});
        var tooltipDefaultToRightOptions = $.extend({}, defaultOptions, {gravity: tooltipRightPreferredFn});

        $('#rte-toolbar [data-tooltip]:not(.dropdown-item)').tooltip(tooltipDefaultBelowOptions);
        $('#rte-toolbar .dropdown-item[data-tooltip]').tooltip(tooltipDefaultToRightOptions);
        $('#rte-savebar [data-tooltip]').tooltip(tooltipDefaultAboveOptions);
        $('#editor-precursor [data-tooltip]').tooltip(tooltipDefaultBelowOptions);
        $('#property-panel [data-tooltip]').tooltip(tooltipDefaultBelowOptions);

        // Remove tooltips if a dropdown is shown or hidden:
        function removeDropdownTooltips(e, type, obj) {
            if (type === "dropdown") {
                $('.tipsy').remove();
                if (obj && obj.trigger && obj.trigger.jquery) {
                    var tipsyData = obj.trigger.data('tipsy');
                    if (tipsyData) {
                        tipsyData.hoverState = 'out';
                    }
                }
            }
        }

        $(document).bind("showLayer", removeDropdownTooltips);
        $(document).bind("hideLayer", removeDropdownTooltips);

        function removePropertyPanelTips(p1, p2, p3, p4) {
            $('.tipsy').remove();
        }

        AJS.bind("created.property-panel", removePropertyPanelTips);
        AJS.bind("destroyed.property-panel", removePropertyPanelTips);

        var replacePlus = /\+/g;

        AJS.bind("register-contexts.keyboardshortcuts", function () {
            // Defer to ensure shortcut code has had a chance to update the title on the save-bar buttons
            setTimeout(function () {
                $('#rte-savebar .aui-button[title]').each(function () {
                    var trigger = $(this);
                    var tooltip = trigger.attr('title');
                    trigger.removeAttr('title');
                    if (tinymce.isMac) {
                        // Remove + from shortcut text for Mac
                        var scIdx = tooltip.indexOf('(');
                        if (scIdx >= 0) {
                            tooltip = tooltip.substr(0, scIdx) + tooltip.substr(scIdx).replace(replacePlus, '');
                        }
                    }
                    trigger.attr('data-tooltip', tooltip);
                });
            }, 0);
        });
    }

    return ChunkyTips;
});


require('confluence/module-exporter').safeRequire('confluence-editor/tinymce3/plugins/customtoolbar/chunky-tips', function(ChunkyTips) {
    var AJS = require('ajs');

    AJS.bind("init.rte", ChunkyTips);
});
