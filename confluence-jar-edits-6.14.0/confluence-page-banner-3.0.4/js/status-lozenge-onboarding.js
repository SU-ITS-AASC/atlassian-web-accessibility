define('confluence-page-banner/status-lozenge-onboarding', [
    'ajs',
    'jquery',
    'confluence/templates',
    'confluence/legacy'
], function(
    AJS,
    $,
    Templates,
    Confluence
) {

    var dopeDraftLozengeFeature = {
        pluginKey: "com.atlassian.confluence.plugins.confluence-page-banner",
        featureKey: "recently-work-on-contributor-lozenge"
    };

    var lozengeSelector = '#draft-status-lozenge';

    var markDiscovered = function() {
        Confluence.FeatureDiscovery
            .forPlugin(dopeDraftLozengeFeature.pluginKey)
            .markDiscovered(dopeDraftLozengeFeature.featureKey);
    };

    var shouldShow = function() {
        // check featureDiscovery is enabled
        if (!Confluence.FeatureDiscovery || !Confluence.FeatureDiscovery.forPlugin) {
            return false;
        }

        // check status lozenge exists
        if ($(lozengeSelector).length === 0) {
            return false;
        }

        if (document.referrer.indexOf("resumedraft.action") < 0 && document.referrer.indexOf("editpage.action") < 0) {
            return false;
        }

        return Confluence.FeatureDiscovery
                .forPlugin(dopeDraftLozengeFeature.pluginKey)
                .shouldShow(dopeDraftLozengeFeature.featureKey);
    };

    var statusLozengeDiscovery = function () {

        if (!shouldShow()) {
            return;
        }

        var inlineDialogId = 'dope-draft-discovery';
        var $dialog = $(Templates.PageBanner.draftStatusDiscovery({
            elementId: inlineDialogId,
            linkToMyWork: AJS.contextPath() + "/#recently-worked"
        }));

        // Set the targets aria-controls to refer to the inlineDialog
        // Append the inline dialog
        $(lozengeSelector)
            .attr('aria-controls', inlineDialogId)
            .append($dialog);

        $dialog.find('.aui-button').click(function () {
            $dialog.removeAttr("open");
            markDiscovered();
        });
    };

    AJS.toInit(statusLozengeDiscovery);
});

require('confluence/module-exporter').safeRequire('confluence-page-banner/status-lozenge-onboarding');