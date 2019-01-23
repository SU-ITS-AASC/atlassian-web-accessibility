/**
 * @module confluence-editor/tinymce3/plugins/placeholder/property-panel-text-placeholders
 */
define('confluence-editor/tinymce3/plugins/placeholder/property-panel-text-placeholders', [
    'jquery',
    'ajs',
    'confluence/property-panel'
],
function(
    $,
    AJS,
    PropertyPanel
) {
    "use strict";
    return {
        name: 'textplaceholder',

        canHandleElement: function ($element) {
            return $element.hasClass('text-placeholder');
        },

        handle: function (data) {
            if (data.e.type !== 'click' && data.e.type !== 'mouseup') { // only activate this panel on click
                return;
            }

            var placeholderTypes = AJS.Rte.Placeholder.getPlaceholderTypes();
            var placeholderNode = data.containerEl;
            var $placeholderNode = $(placeholderNode);
            var placeholderType = $placeholderNode.attr('data-placeholder-type');

            var buttons = [];

            function changeType(type) {
                if (type === 'default') {
                    $placeholderNode.removeAttr('data-placeholder-type');
                } else {
                    $placeholderNode.attr('data-placeholder-type', type);
                }
                var button = $('.text-placeholder-property-panel-type-' + type);
                button.parent().find('.text-placeholder-property-panel-type-item').removeClass('selected');
                button.addClass('selected');
            }

            function createTypeButton(type, text, tooltip) {
                return {
                    className: 'text-placeholder-property-panel-type-item text-placeholder-property-panel-type-' + type,
                    text: text,
                    tooltip: tooltip,
                    selected: placeholderType === type,
                    click: function () {
                        changeType(type);
                    }
                };
            }

            var defaultButton = createTypeButton('default', AJS.I18n.getText('property.panel.textplaceholder.display.default'), AJS.I18n.getText('property.panel.textplaceholder.display.default.tooltip'));
            defaultButton.selected = !placeholderType;
            buttons.push(defaultButton);

            var currentType;
            for (var i = 0, l = placeholderTypes.length; i < l; i++) {
                currentType = placeholderTypes[i];
                buttons.push(createTypeButton(currentType.type, currentType.label, currentType.tooltip));
            }

            buttons.push(null); // separator

            buttons.push({
                className: 'text-placeholder-property-panel-remove-button',
                text: AJS.I18n.getText('property.panel.textplaceholder.remove'),
                click: function () {
                    PropertyPanel.destroy();
                    AJS.Rte.Placeholder.removePlaceholder($placeholderNode);
                }
            });


            PropertyPanel.createFromButtonModel('textplaceholder', placeholderNode, buttons, {anchorIframe: AJS.Rte.getEditorFrame()});
        }
    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/tinymce3/plugins/placeholder/property-panel-text-placeholders', 'AJS.Confluence.PropertyPanel.TextPlaceholder', function(PropertyPanelTextPlaceholder){
    var AJS = require('ajs');

    AJS.bind('init.rte', function () {
        // defer trigger to ensure any listeners have had a chance to load.
        if (AJS.Meta.get('content-type') === 'template') {
            AJS.trigger('add-handler.property-panel', PropertyPanelTextPlaceholder);
        }
    });
});