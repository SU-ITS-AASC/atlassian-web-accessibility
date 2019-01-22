/**
 * @module confluence-editor/tinymce3/plugins/imageproperties/js/image-properties-dialog
 */
define('confluence-editor/tinymce3/plugins/imageproperties/js/image-properties-dialog', [
    'jquery',
    'ajs'
], function(
    $,
    AJS
) {
    "use strict";

    var dialog;
    var webItems;
    var panels = {};
    var dialogCreatedEvent = 'dialog-created.image-properties';
    var dialogBeforeShowEvent = 'dialog-before-show.image-properties';
    var propertyPanelButton;

    return {
        init: init,
        registerPanel: registerPanel
    };

    function init() {
        if (!propertyPanelButton) {
            webItems = null;
            if (getWebItems().length > 0) {
                propertyPanelButton = true;
                AJS.Confluence.PropertyPanel.Image.pluginButtons.push(null, {create: function() {
                    return {
                        className: 'image-properties',
                        text: AJS.I18n.getText('image.properties.trigger'),
                        tooltip: AJS.I18n.getText('image.properties.trigger.tooltip'),
                        click: function(button, img) {
                            AJS.trigger('analyticsEvent', {name: 'confluence.editor.image-properties-trigger'});
                            AJS.Confluence.PropertyPanel.destroy();
                            openImagePropertiesDialog(img);
                        }
                    };
                }});
            }
        }
    }

    function openImagePropertiesDialog(img) {
        $('#image-properties-dialog').remove(); // Element isn't properly removed when closed via escape key
        dialog = new AJS.ConfluenceDialog({
            id: 'image-properties-dialog',
            onSubmit: submit
        });

        // Panels aren't registered until this point - new panels need to bind to this event and call registerPanel()
        AJS.trigger(dialogCreatedEvent, {img: img});

        dialog.popup.element.attr("data-tab-default", "0");
        dialog.addHeader(AJS.I18n.getText('image.properties.dialog.heading'));
        dialog.addSubmit(AJS.I18n.getText('image.properties.dialog.submit'), submit);
        dialog.addCancel(AJS.I18n.getText('image.properties.dialog.cancel'), cancel);
        createPanels(dialog);

        // Indicates that any panel contents specified by calling registerPanel have been added to the DOM
        AJS.trigger(dialogBeforeShowEvent);

        dialog.show();
    }

    function createPanels(dialog) {
        var items = getWebItems();
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var panel = panels[item.key]; // pre-populated by a 'dialog-created.image-properties' event binding.
            if (panel) {
                dialog.addPanel(item.label, panel.content, panel.panelClass, item.key);
            }
        }
        if (items.length === 1) {
            dialog.popup.element.find('.dialog-page-menu').show(); // AUI hides this menu if there's only one panel
        }
    }

    function registerPanel(linkId, panelContent, panelClass, saveFn) {
        panels[linkId] = {
            content: panelContent,
            panelClass: panelClass,
            saveFn: saveFn
        };
    }

    // Web-items with section "system.editor.image.properties.tabs" - {@see image-properties-web-items.vm}
    function getWebItems() {
        if (!webItems) {
            webItems = $('#image-properties-tab-items > div').map(function() {
                var item = $(this);
                return {
                    key: item.text(),
                    weight: item.attr("data-weight"),
                    label: this.title
                };
            }).sort(function (a, b) {
                return a.weight - b.weight;
            });
        }
        return webItems;
    }

    function submit() {
        showSpinner();

        // Call all save functions so that changes made in any panel (not just the active one) persist
        var promises = [];
        for (var key in panels) {
            var panel = panels[key];
            var promise = panel.saveFn && panel.saveFn();
            if (promise && promise.done) {
                promises.push(promise);
            }
        }
        var masterPromise = $.when.apply($, promises);
        masterPromise.done(function() {
            hideSpinner();
            dialog.hide().remove();
        });
    }

    function cancel() {
        dialog.hide().remove();
    }

    function showSpinner() {
        var $dialog = dialog.popup.element;
        var radius = 50;
        var lineThickness = radius * 13 / 60;
        var innerRadius = radius * 30 / 60;
        var lineLength = radius - innerRadius;
        var $blanket = $('<div class="image-properties-loading-blanket"><div class="loading-data"></div></div>').appendTo($dialog.find('.dialog-page-body'));
        var $spinner = $blanket.find('.loading-data');

        $blanket.css({width: $blanket.parent().width(), height: $dialog.height()});
        $spinner.css({marginTop: -radius * 1.2, marginLeft: -radius * 1.2});


        var opts = {
            color: "#666",
            width: lineThickness,
            radius: innerRadius,
            length: lineLength,
            top: 0,
            left: 0,
            zIndex: 0,
            speed: 1.042
        };

        $spinner.spin(opts);
    }

    function hideSpinner() {
        var $spinner = dialog.popup.element.find('.image-properties-loading-blanket .loading-data');

        $spinner.css({marginTop: '', marginLeft: ''});
        $spinner.spinStop();
        $spinner.closest('.image-properties-loading-blanket').remove();
    }
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/tinymce3/plugins/imageproperties/js/image-properties-dialog', 'Confluence.Editor.ImageProps', function(ImageProps) {
    var AJS = require('ajs');
    AJS.toInit(ImageProps.init);
    // Can't rely on init which ran in view mode when editor sources were loaded, because the image-properties-tab-items div didn't exist on the page
    AJS.bind('quickedit.success', ImageProps.init);
});
