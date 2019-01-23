Confluence.SpaceBlueprint.WelcomeDialog = (function ($) {
    var welcomeDialog;

    function skipSpaceWelcomeDialog() {
        AJS.Meta.set("show-space-welcome-dialog", false);
        return $.ajax({
            type: "post",
            contentType: "application/json",
            url: Confluence.getContextPath() + "/rest/create-dialog/1.0/spaces/skip-space-welcome-dialog"
        });
    }

    function createSpaceCallback() {
        skipSpaceWelcomeDialog();
        Confluence.SpaceBlueprint.Dialog.launch();
        welcomeDialog.remove();
    }
    
    function closeDialogCallback() {
        welcomeDialog.remove();
    }

    function addButtons(dialogPage) {
        welcomeDialog.addButton(AJS.I18n.getText('create.content.plugin.create.button'), createSpaceCallback, "start-creating-space");
        dialogPage.buttonpanel.find('.button-panel-button').removeClass('button-panel-button').addClass('aui-button');
        dialogPage.buttonpanel.find('.start-creating-space').addClass('aui-button-primary');
        welcomeDialog.addCancel(AJS.I18n.getText("close.name"), closeDialogCallback);
    }
    
    function showWelcomeDialog() {
        welcomeDialog = new AJS.Dialog({
            width: 840,
            height: 449,
            id: "space-welcome-dialog",
            closeOnOutsideClick: false
        });

        var pageHeader = AJS.I18n.getText('create.content.plugin.space.welcome-dialog.header.label');
        welcomeDialog.addHeader(pageHeader);

        var panelContents = Confluence.Templates.Blueprints.CreateSpace.welcome();
        welcomeDialog.addPanel("how-to-panel", panelContents);

        addButtons(welcomeDialog.getPage(0));
        welcomeDialog.show();
    }

    return {
        isShowWelcomeDialog: function() {
            return AJS.Meta.getBoolean("show-space-welcome-dialog");
        },
        showWelcomeDialog: showWelcomeDialog
    };
})(AJS.$);