AJS.toInit(function() {
    Confluence.Blueprint.setWizard('com.atlassian.confluence.plugins.confluence-create-content-plugin:create-blank-space-item', function(wizard) {
        wizard.on("pre-render.commonPage", Confluence.SpaceBlueprint.CommonWizardBindings.preRender);
        wizard.on("post-render.commonPage", Confluence.SpaceBlueprint.CommonWizardBindings.postRender);
        wizard.on("submit.commonPage", Confluence.SpaceBlueprint.CommonWizardBindings.submit);
    });

});