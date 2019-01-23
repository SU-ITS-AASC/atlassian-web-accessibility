/**
 * @module confluence-editor/panel-components/panel-components-init
 */
define('confluence-editor/panel-components/panel-components-init', [
    'confluence/legacy',
    'ajs'
], function(
    Confluence,
    AJS
) {
    "use strict";

    return function () {
        if (!Confluence.Editor ||
                !Confluence.Editor.ImageDialog ||
                !Confluence.Editor.ImageDialog.panelComponent) {
            return;
        }

        var eventListener = Confluence.Editor.FileDialog.eventListener;
        var ExternalPanelView = Confluence.Editor.FileDialog.ExternalPanelView;
        var SearchPanelView = Confluence.Editor.FileDialog.SearchPanelView;
        var AttachmentsPanelView = Confluence.Editor.FileDialog.AttachmentsPanelView;
        var panelComponents = Confluence.Editor.ImageDialog.panelComponent;

        if(AJS.Meta.get("content-type") !== "template") {
            var attachmentPanelComponent = new AttachmentsPanelView({
                eventListener: eventListener
            });
            panelComponents.push(attachmentPanelComponent);
        }

        panelComponents.push(new ExternalPanelView());

        panelComponents.push(new SearchPanelView());
    };
});

require('confluence/module-exporter').safeRequire('confluence-editor/panel-components/panel-components-init', function(PanelComponents) {
    require('ajs').toInit(PanelComponents);
});