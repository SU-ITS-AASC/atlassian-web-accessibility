AJS.toInit(function ($) {

    Confluence.SpaceBlueprint.Dialog = $.extend(Confluence.Dialogs.CreateDialogBase({
            dialogId: "create-dialog",
            webItemsPath: "/rest/create-dialog/1.0/space-blueprint/dialog/web-items",
            helpLinkTemplate: Confluence.Templates.Blueprints.spaceHelpLink,
            headingText: AJS.I18n.getText("create.content.plugin.create-dialog.header.create.space.label")
        }),
        // Explicitly specify no-op implementations of "abstract" methods in CreateDialogBase
        {
            getParentPageId: function () {
                return undefined;
            },
            getSpaceKey: function () {
                return undefined;
            },
            /**
             * Launches the create space dialog and jumps straight to the space blueprint wizard, if spaceBlueprint is defined.
             * Note that the welcome dialog will be skipped in this case.
             * @param spaceBlueprint the item module complete key for the space blueprint.
             */
            launch: function (spaceBlueprint) {
                var opts = spaceBlueprint ? {
                    showDialog: false,
                    updateHeight: false,
                    showStepOne: true,
                    initContext: {}
                } : {};

                var createDialog = Confluence.SpaceBlueprint.Dialog.openDialog(opts);

                createSpacePromise = WRM.require('wrc!create-space');
                webItemsPromise = Confluence.SpaceBlueprint.Dialog.requestWebItems();

                AJS.$.when(createSpacePromise, webItemsPromise).done(function(createSpaceResult, webItemsResult) {

                    // Trigger any lurking blueprints
                    AJS.trigger('blueprint.wizard-register.load');

                    if (!spaceBlueprint && Confluence.SpaceBlueprint.WelcomeDialog.isShowWelcomeDialog()) {
                        Confluence.SpaceBlueprint.WelcomeDialog.showWelcomeDialog();
                        createDialog.remove();
                        return;
                    }

                    Confluence.SpaceBlueprint.Dialog.fillWebItemsInDialog();
                    // The undefined index is because the space dialog can only has one set of web items
                    var configs = Confluence.SpaceBlueprint.Dialog.loadedWebitems[undefined];
                    if (_.isEmpty(configs)) {
                        AJS.log('Could not load space dialog - web items not found');
                        return;
                    }

                    if (!spaceBlueprint)
                        return;

                    var config = _.find(configs, function (element) {
                        return element.itemModuleCompleteKey === spaceBlueprint;
                    });
                    if (!config) {
                        AJS.log('Error finding space blueprint with id' + spaceBlueprint);
                        return;
                    }

                    Confluence.Blueprint.fireWizard(webItemsResult[0], config, createDialog);
                    // CONFDEV-17165 hide back button on the page as the user shouldn't be able to select a different blueprint
                    createDialog.removeBackButton();

                    var showHowToUse = config.howToUseTemplate && !config.skipHowToUse;
                    if (showHowToUse || Confluence.Blueprint.hasWizard(spaceBlueprint, config)) {
                        createDialog.show();
                    }

                }).fail(function(xhr) {
                    AJS.log('Could not load resources for space dialog');
                    var errorMessage = AJS.I18n.getText('server.error.message');
                    try {
                        var errorType = JSON.parse(xhr.responseText).errorType;
                        if (errorType === "READ_ONLY") {
                            errorMessage = AJS.I18n.getText('read.only.mode.default.error.short.message')
                        }
                    } catch (e) {
                    } finally {
                        createDialog.setDialogError(errorMessage);
                    }
                });
            }
        });

    var createButton = $('#create-space-button, a[href="' + Confluence.getContextPath() + '/spaces/createspace-start.action"]'),
        personalSpaceButton = $('#create-personal-space-link');

    if (personalSpaceButton.length)
    {
        // remove when we move the code out from confluence master
        personalSpaceButton.unbind("click");
        personalSpaceButton.click(function() {
            Confluence.SpaceBlueprint.Dialog.launch("com.atlassian.confluence.plugins.confluence-create-content-plugin:create-personal-space-item");
            return false;
        });
    }

    if (!createButton.length)
        return;

    // hack - Unbind the old Space dialog until we move the
    $('a[href="' + Confluence.getContextPath() + '/spaces/createspace-start.action"]').unbind('click');

    createButton.click(function (e) {
        Confluence.SpaceBlueprint.Dialog.launch();
        return false;
    });

    Confluence.SpaceBlueprint.loaded.resolve();
});