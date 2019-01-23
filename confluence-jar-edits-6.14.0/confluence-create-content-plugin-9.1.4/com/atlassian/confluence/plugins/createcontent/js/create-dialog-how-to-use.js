/**
 * This file handles all "How-to-Use-this-Blueprint" behaviour in the Create dialog.
 *
 * It is used when a Blueprint plugin's <blueprint> element contains an attribute
 * "how-to-use-template" that references a Soy template. The Soy template is assumed
 * to be present via the web-resources provided for the Blueprint.
 */
(function ($) {
    /**
     * Flags that the user has moved forward past the How-to-Use blueprint page.
     *
     * @param contentBlueprintId
     */
    function markHowToUseVisited(contentBlueprintId, skipHowToUse) {
        AJS.log('blueprint-how-to: marking skipHowToUse for ' + contentBlueprintId + ', ' + skipHowToUse);

        var url = Confluence.getContextPath() + "/rest/create-dialog/1.0/blueprints/skip-how-to-use";
        AJS.safe.post(url, {
            contentBlueprintId: contentBlueprintId,
            skip: skipHowToUse
        }).done(function () {
            AJS.log('blueprint-how-to: Saved skipHowToUse for ' + contentBlueprintId + ', ' + skipHowToUse);
        }).fail(function () {
            AJS.log('blueprint-how-to: FAILED SAVE skipHowToUse for ' + contentBlueprintId + ', ' + skipHowToUse);
        });
    }

    /**
     * Creates a new Dialog page populated with the howToUseTemplate content. When 'Next' is clicked from
     * this page, returns to normal behaviour.
     *
     * @param createDialog the Create Dialog AJS.Dialog object
     * @param data the config data for this Blueprint
     * @param callback the function to run when the how-to-use process is complete
     */
    function showHowToUsePage(createDialog, data, callback) {
        AJS.log('blueprint-how-to: showing how-to-use page');

        createDialog.addPage('how-to-use-blueprint-page');
        $(".dialog-page-body.how-to-use-blueprint-page")
                .attr("data-content-blueprint-id", data.contentBlueprintId)
                .attr("data-blueprint-key", data.blueprintModuleCompleteKey);
        var page = createDialog.getPage(createDialog.curpage);

        var pageHeader = AJS.I18n.getText('create.content.plugin.create-dialog.header.how-to.label');
        page.addHeader(pageHeader);

        // Using eval is evil, but Soy docs don't specify a String lookup (e.g. for soy.renderElement)
        var panelContents = eval(data.howToUseTemplate + "()");
        page.addPanel("how-to-panel", panelContents);

        createDialog.addBackButton(page);

        createDialog.addButtonPanel(page, callback, !data.wizard, "how-to-button-panel");

        // Anonymous users don't get a "Skip" checkbox.
        if (!AJS.Meta.get('remote-user')) return;

        function skipHowToUseChanged() {
            var skip = $(this).prop('checked');

            // Cache the How-tos we have flagged as seen, so that they can be unflagged if the dialog is
            // cancelled.
            if (skip) {
                createDialog.blueprintHowTosSkipped = createDialog.blueprintHowTosSkipped || {};
                createDialog.blueprintHowTosSkipped[data.contentBlueprintId] = true;
            } else {
                delete createDialog.blueprintHowTosSkipped[data.contentBlueprintId];
            }
            markHowToUseVisited(data.contentBlueprintId, skip);
        }

        page.buttonpanel.append(Confluence.Templates.Blueprints.howToUseSkipCheckbox());

        // If the user checks the box, then goes back to the Blueprint-picker, and then forward again, keep it checked.
        var isAlreadySkipped = !!(createDialog.blueprintHowTosSkipped && createDialog.blueprintHowTosSkipped[data.contentBlueprintId]);
        page.buttonpanel.find('#dont-show-how-to-use').change(skipHowToUseChanged).prop('checked', isAlreadySkipped);
    }

    Confluence.Blueprint.HowToUse = {
        /**
         * Checks if the current user has created content with the given Blueprint before, and shows a "How to Use"
         * page if not.
         *
         * @param createDialog the Create dialog AJS.Dialog object
         * @param config the data for the Blueprint being used
         * @param callback function to call when the check is complete
         */
        check: function (createDialog, config, callback) {
            AJS.log('blueprint-how-to: checking status and showing How-to-Use page if needed');
            if (!config.skipHowToUse) {
                showHowToUsePage(createDialog, config, callback);
            } else {
                callback();
            }
        },

        /**
         * If the user cancels out of the dialog, remove any temporary flags that may have been set during this
         * Dialog session.
         *
         * @param createDialog the Create dialog AJS.Dialog object
         */
        notifyCancel: function (createDialog) {
            AJS.log('blueprint-how-to: cancel notified');

            if (createDialog.blueprintHowTosSkipped) {
                _.each(createDialog.blueprintHowTosSkipped, function (value, contentBlueprintId) {
                    markHowToUseVisited(contentBlueprintId, false);
                });
            }
        }
    };
})(AJS.$);