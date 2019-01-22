/**
 * @module confluence-editor/tinymce3/plugins/propertypanel/js/property-panel-links
 */
define('confluence-editor/tinymce3/plugins/propertypanel/js/property-panel-links', [
    'ajs',
    'jquery',
    'confluence/legacy',
    'tinymce',
    'window'
], function(
    AJS,
    $,
    Confluence,
    tinymce,
    window
) {
    "use strict";

    // Keep a count of the number of panels opened, so the "Goto location" button always opens the link location in a
    // new named window
    var linkPanelCounter = 0;

    return {
        name : "link",

        canHandleElement : function ($element) {
            return $element.is("a") && $element.attr('href') != '#' && !$element.hasClass('unresolved');
        },

        handle : function(data) {
            var link = data.containerEl;

            var ed = data.ed;
            var getLang = function(key) { return AJS.Rte.getEditor().getLang(key); };
            var options = {
                anchorIframe: AJS.Rte.getEditorFrame()
            };
            // Don't attempt to go to anchors on the edited page - they might not exist yet.
            var gotoDisabled = (link.getAttribute('href') || '').indexOf('#') === 0;
            var buttons = [{
                className: "link-property-panel-goto-button",
                text: getLang("propertypanel.links_goto"),
                tooltip: gotoDisabled ? getLang("propertypanel.links_goto_disabled_tooltip") : link.href,
                href: link.href,
                disabled: gotoDisabled,
                click: function () {
                    AJS.Confluence.PropertyPanel.destroy();

                    // Give the window a name to help testing, but make sure the name is unique.
                    // Note: IE doesn't allow named windows; just open an unnamed one.
                    var windowName = tinymce.isIE ? "_blank" : "confluence-goto-link-" + AJS.params.pageId + "-" + linkPanelCounter;

                    // mailto links in IE can return null sometimes for window.open
                    // see http://msdn.microsoft.com/en-us/library/ms536651(VS.85).aspx
                    var win = window.open(link.href, windowName);
                    if (win) { win.focus(); }

                }
            }, {
                className: "link-property-panel-edit-button",
                text: getLang("propertypanel.links_edit"),
                tooltip: getLang("propertypanel.links_edit_tooltip"),
                disabled: $(link).hasClass("createlink") || !link.href,
                click: function () {
                    AJS.Confluence.PropertyPanel.destroy();
                    ed.selection.select(link);
                    Confluence.Editor.LinkBrowser.open();
                }
            }, {
                className: "link-property-panel-unlink-button",
                text: getLang("propertypanel.links_unlink"),
                tooltip: getLang("propertypanel.links_unlink_tooltip"),
                click: function () {
                    AJS.Confluence.PropertyPanel.destroy();
                    ed.execCommand("mceConfUnlink", false, link);
                    ed.focus();
                }
            }];

            // trigger event so other plugins can add buttons to link property panel
            var customButtons = [];
            AJS.trigger("link-property-panel-buttons.created", { buttons: customButtons, link: link });
            buttons = buttons.concat(customButtons);

            AJS.Confluence.PropertyPanel.createFromButtonModel(this.name, link, buttons, options);

            linkPanelCounter++;
        }
    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/tinymce3/plugins/propertypanel/js/property-panel-links', 'AJS.Confluence.PropertyPanel.Link', function(PropertyPanelLink) {
    var AJS = require('ajs');

    AJS.bind("init.rte", function() {
        // defer trigger to ensure any listeners have had a chance to load.
        AJS.trigger("add-handler.property-panel", PropertyPanelLink);
    });
});
