/**
 * @module confluence-editor/editor/page-editor-quit-dialog
 */
define("confluence-editor/editor/page-editor-quit-dialog", [
    "jquery",
    "confluence/templates",
    "ajs",
    "confluence/meta",
    "confluence/legacy",
    "window",
    "document",
    "confluence-editor/editor/page-editor-message",
    "confluence/api/constants",
    "underscore"
], function(
        $,
        Templates,
        AJS,
        Meta,
        Confluence,
        window,
        document,
        Message,
        CONSTANTS,
        _
) {
    "use strict";

    var UI = {};
    var isPagePublished;
    var needDialog;
    var Type = {
        DELETE: "delete",
        REVERT: "revert",
        PUBLISH: "publish",
        UPDATE: "update",
        SHOW_DIFF: "diff"
    };
    var contributors = [];
    var isInitialized = false;
    var ExternalHandlers = {};
    var previousDialogType;
    var quitDialogDisplayStartTime = 0;
    var maxAttempts = 5;

    function init(options) {
        needDialog = Meta.getBoolean("shared-drafts") && (Meta.get("content-type") === "page" || Meta.get("content-type") === "blogpost");
        if (needDialog) {
            if (!isInitialized) {
                isPagePublished = !Meta.get("new-page");

                UI.discardButton = $("#qed-discard-button").tooltip({gravity: 's', className: 'quit-editor-dialog'});
                // We only disable the Discard button for published pages if the editor is in limited mode.
                if (Confluence.Editor.isLimitedModeEnabled() && isPagePublished) {
                    Confluence.Editor.UI.setButtonState(false, UI.discardButton);
                    // workaround due to tipsy tooltips not working on disabled='disabled' elements
                    UI.discardButton.removeAttr('disabled');
                } else {
                    UI.discardButton.click(clickDiscard);
                }

                UI.saveExitButton = $("#qed-save-exit-button").click(clickSaveExit);
                UI.hideDiffButton = $("#qed-hide-diff-button").click(clickHideDiff);
                //publish button in the dialog
                UI.publishButton = $("#qed-publish-button");
                //close button in the dialog
                UI.closeButton = $("#qed-close-button").click(closeDialog);
                UI.buttonsAll = [UI.discardButton, UI.saveExitButton, UI.showDiffButton, UI.hideDiffButton, UI.publishButton];
                UI.dialog = AJS.dialog2("#quit-editor-dialog");
                UI.dialogEl = UI.dialog.$el;
                UI.dialogHeader = UI.dialogEl.find(".aui-dialog2-header");
                UI.dialogContent = UI.dialogEl.find(".aui-dialog2-content");
                UI.dialogFooter = UI.dialogEl.find(".aui-dialog2-footer");
                UI.editorForm = $("#wysiwyg").closest("form");
                $("#rte-show-changes").on("click", clickShowChanges);
                $("#rte-show-revert").on("click", clickRevertChanges);
                if (!Meta.get('new-page')) {
                    $("#pluggable-status").on("click", "a", clickShowChanges);
                }

                UI.dialog.on("hide", onHideDialog);

                AJS.bind('editor-heartbeat', fetchContributors);

                isInitialized = true;
            } else {
                ExternalHandlers.save = options && options.saveHandler;
                UI.publishButton.click(clickPublish);
            }
        }
    }

    function clickShowDiff(e) {
        e.stopPropagation();
        e.preventDefault();

        AJS.trigger("analyticsEvent", {
            name: "confluence.synchrony.editor.quit-dialog.show-diff-clicked"
        });

        UI.showDiffButton.hide();

        showUnpublishedChanges();
        UI.hideDiffButton.show();
    }

    function clickHideDiff(e) {
        e.stopPropagation();
        e.preventDefault();

        AJS.trigger("analyticsEvent", {
            name: "confluence.synchrony.editor.quit-dialog.hide-diff-clicked"
        });

        UI.hideDiffButton.hide();
        UI.showDiffButton.show();

        //resize dialog smaller
        UI.dialogEl.removeClass("aui-dialog2-xlarge").addClass("aui-dialog2-medium");
        displayDialog(previousDialogType);
    }

    function clickDiscard (e) {
        previousDialogType = isPagePublished ? Type.REVERT : Type.DELETE;
        handleDialogClose();
        AJS.trigger("analyticsEvent", {
            name: "confluence.synchrony.editor.quit-dialog.discard"
        });
        e.stopPropagation();
        e.preventDefault();
        Confluence.Editor.UI.setButtonsState(false, UI.buttonsAll);
        discardThenLeaveEditor(Meta.get("content-id"));
    }

    function submitFormAsCancelAction() {
        UI.editorForm.append(Templates.Editor.Page.hiddenInputCancel()).submit();
    }

    function clickSaveExit(e) {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }

        AJS.trigger("analyticsEvent", {
            name: "confluence.synchrony.editor.quit-dialog.keep-draft-clicked",
            data: {
                contributorCount: contributors.length + 1
            }
        });

        submitFormAsCancelAction();
    }

    function clickPublish(e) {
        Confluence.Editor.UI.setButtonsState(false, UI.buttonsAll);
        ExternalHandlers.save(e);
        handleDialogClose();
    }

    function clickShowChanges(e) {
        e.stopPropagation();
        e.preventDefault();

        previousDialogType = null;

        AJS.trigger("analyticsEvent", {
            name: "confluence.synchrony.editor.draft-status-indicator.click"
        });

        triggerDraftAutosave(function onSuccessSaveDraft() {
            UI.closeButton.show();
            showUnpublishedChanges();
        });
    }

    function clickRevertChanges(e) {
        e.stopPropagation();
        e.preventDefault();

        UI.closeButton.show();

        if(Meta.get('new-page')) {
            displayDialog(Type.DELETE);
        } else {
            displayDialog(Type.REVERT);
        }
    }

    function closeDialog(e) {
        e.stopPropagation();
        e.preventDefault();

        UI.dialog.hide();
    }

    function showUnpublishedChanges() {
        //resize dialog bigger
        UI.dialogEl.removeClass("aui-dialog2-medium").addClass("aui-dialog2-xlarge");
        displayDialog(Type.SHOW_DIFF);

        $.ajax({
            url: CONSTANTS.CONTEXT_PATH + "/rest/tinymce/1/content/" + Meta.get("page-id") + "/draft/diff",
            type: "GET"
        }).success(function (response) {
            var $diffBody = UI.dialogContent.find(".wiki-content").html(response);

            //hide HR to avoid 2 separators
            if ($diffBody.children().first().hasClass("diff-context-placeholder")) {
                UI.dialogContent.find("hr").hide();
            }
        });
    }

    function process(e) {
        if (needDialog) {
            e.stopPropagation();
            e.preventDefault();

            $(window).one('editor-heartbeat rte.heartbeat-error', function (ev, data) {
                switch(e.target.id) {
                    case Confluence.Editor.UI.saveButton.attr("id"):
                    case Confluence.Editor.UI.versionCommentInput.attr("id"):
                        processPublish();
                        break;
                    case Confluence.Editor.UI.cancelButton.attr("id"):
                        processClose(ev);
                        break;
                }
            });

            //explicitly invoke method to get latest contributors list
            Confluence.Editor.heartbeat();
        }
    }

    function processPublish() {
        //toggle busy to avoid pressing Cmd+S will duplicate action
        Confluence.Editor.UI.toggleSavebarBusy(true);
        if (contributors.length === 0) {
            //don't show dialog, just process to save
            ExternalHandlers.save();
        } else {
            triggerDraftAutosave();

            var publishType = isPagePublished ? Type.UPDATE : Type.PUBLISH;
            displayDialog(publishType);
        }
    }

    function processClose(ev) {
        if (Confluence.Editor.Drafts.isDraftDirty()) {
            triggerDraftAutosave();
        }
        clickSaveExit();
    }

    function addWarning() {
        UI.dialogEl.addClass("aui-dialog2-warning");
    }

    function removeWarning() {
        UI.dialogEl.removeClass("aui-dialog2-warning");
    }

    function displayDialog(dialogType, dialogContent) {
        function isShowingDiffOnRevertDialog() {
            return dialogType === Type.SHOW_DIFF && (previousDialogType === Type.REVERT || previousDialogType === Type.DELETE);
        }

        if (dialogType === Type.UPDATE || dialogType === Type.PUBLISH) {
            quitDialogDisplayStartTime = (new Date().getTime()) / 1000;
        }

        var headerType = dialogType;

        if (isShowingDiffOnRevertDialog()) {
            headerType = previousDialogType;
        }

        UI.dialogHeader.html(Templates.Editor.Page.quitDialogHeader({
            dialogType: headerType,
            contentType: Meta.get("content-type"),
            newPage: Meta.get('new-page')
        }));

        UI.dialogContent.html(Templates.Editor.Page.quitDialogContent({
            dialogType: dialogType,
            contributors: contributors,
            contentType: Meta.get("content-type"),
            newDialog: previousDialogType == null
        }));

        UI.hideDiffButton = $("#qed-hide-diff-button").click(clickHideDiff);

        if (!Meta.get('new-page')) {
            if (dialogType !== Type.SHOW_DIFF) {
                previousDialogType = dialogType;
            }

            UI.showDiffButton = $("#qed-show-diff-button").click(clickShowDiff);
            UI.showDiffButton.show();
            UI.buttonsAll.push(UI.showDiffButton);
        }

        if (dialogType === Type.DELETE || dialogType === Type.REVERT || isShowingDiffOnRevertDialog()) {
            UI.discardButton.show();
            addWarning();
        } else {
            removeWarning();
        }

        UI.closeButton.show();
        //only show buttons that suitable for a dialogType
        UI.dialogFooter.find("." + dialogType).show();

        UI.dialog.show();
    }

    function onHideDialog() {
        handleDialogClose();
        AJS.trigger("analyticsEvent", {
            name: "confluence.synchrony.editor.quit-dialog.dialog-closed"
        });
        UI.dialogEl.removeClass("aui-dialog2-xlarge").addClass("aui-dialog2-medium");
        Confluence.Editor.UI.toggleSavebarBusy(false);
        UI.dialogFooter.find(".aui-button").hide();
        UI.dialogContent.empty();
    }

    function handleDialogClose() {
        var quitDialogDisplayEndTime = (new Date().getTime()) / 1000;
        var displayTimeInSeconds = quitDialogDisplayEndTime - quitDialogDisplayStartTime;
        AJS.trigger("analyticsEvent", {
            name : "confluence.synchrony.editor.quit-dialog." + previousDialogType + ".displayed",
            data : {
                displayTimeInSeconds : displayTimeInSeconds,
                contentId : Meta.get("content-id")
            }
        });
        quitDialogDisplayStartTime = 0;
    }

    function discardThenLeaveEditor(contentId, attempt) {
        var contextPath = AJS.contextPath();
        var url = isPagePublished ?
            contextPath + "/rest/synchrony/1.0/content/" + contentId + "/changes/unpublished" :
            contextPath + '/rest/api/content/' + contentId + '?status=draft';

        if (isPagePublished) {
            // suppress the message from synchrony-editor.js that indicates a different user performed a revert
            Message.suppressMessage("editor.synchrony.revert-page");
        }
        attempt = attempt || 0;

        $.ajax({
            url: url,
            type: 'DELETE',
            data: {
                draftId: contentId
            },
            contentType: "application/json",
            dataType: "json"
        }).done(function () {
            if (isPagePublished) {
                Message.handleMessage("collaborative-editor-discard-error", {
                    type: "success",
                    close: "auto",
                    message: AJS.I18n.getText("editor.discard-to-published.success.message")
                });
            }
            AJS.trigger("analyticsEvent", {
                name: "confluence.synchrony.editor.quit-dialog.discard-success",
                data: {
                    contentId: contentId
                }
            });
            submitFormAsCancelAction();
        }).fail(function (data) {
            // try again in case of conflict
            if (data.status === 409 && attempt < maxAttempts) {
                // disable draft save in case of some weird coincidence of save-discard combo happening again and again
                AJS.trigger("disable-draft-save");
                discardThenLeaveEditor(contentId, attempt + 1);
            } else {
                var response = JSON.parse(data.responseText);
                var deleteFailedTitle =  AJS.I18n.getText("draft.saving.error.could.not.delete");
                var deleteFailedMessage = data["errors"] || AJS.I18n.getText("discard.draft.unknown.error");

                if (response.data && response.data.errors && response.data.errors[0] && response.data.errors[0].message.key === 'content.delete.published') {
                    deleteFailedTitle = AJS.I18n.getText("discard.draft.page-published.error.title");
                    deleteFailedMessage = AJS.I18n.getText("discard.draft.page-published.error");
                }

                AJS.trigger("analyticsEvent", {
                    name: "confluence.synchrony.editor.quit-dialog.discard-error",
                    data: {
                        contentId: contentId
                    }
                });

                AJS.trigger("enable-draft-save");

                Message.handleMessage("collaborative-editor-discard-error", {
                    type: "error",
                    title: isPagePublished ? AJS.I18n.getText("editor.discard-to-published.error.title") : deleteFailedTitle,
                    message: isPagePublished ? AJS.I18n.getText("editor.discard-to-published.error.message") : deleteFailedMessage
                });
                UI.dialog.hide();
                // Re-enable buttons here to allow the user to resubmit.
                Confluence.Editor.UI.setButtonsState(true, UI.buttonsAll);
            }
        });
    }

    function fetchContributors(e, data) {
        if (data && data.contributors) {
            //exclude myself from the list
            contributors = _.reject(data.contributors, function (contributor) {
                return contributor.name === Meta.get("remote-user");
            });
        }
    }

    function triggerDraftAutosave(onSuccessHandler) {
        //this is to make sure the diff is up to date.
        Confluence.Editor.Drafts.save({forceSave: isPagePublished, skipErrorHandler: true, onSuccessHandler: onSuccessHandler || $.noop});
    }

    /**
     * Reset module's state (for testing purpose)
     * @private
     */
    function _destroy() {
        isInitialized = false;
    }

    return {
        init: init,
        process: process,
        _destroy: _destroy
    };
});