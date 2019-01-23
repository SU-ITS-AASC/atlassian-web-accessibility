AJS.toInit(function() {

    Confluence.Blueprint.setWizard('com.atlassian.confluence.plugins.confluence-create-content-plugin:create-personal-space-item', function(wizard) {

        wizard.assembleSubmissionObject = function (wizardData) {
            return {
                spaceUserKey: ''  // HACK - until AJS.Meta contains the remote user's UserKey we don't know this.
            }
        };

        wizard.getSubmissionRestPath = function () {
            return '/rest/create-dialog/1.0/space-blueprint/create-personal-space';
        };
    });

});