define('confluence/attachments', [
    'ajs',
    'confluence/templates',
    'confluence/api/ajax',
    'confluence/api/constants'
], function(
    AJS,
    Templates,
    SafeAjax,
    CONSTANTS
) {

    var AttachmentsComponent = {
        showOlderVersions: function($) {
            $(".attachment-history a").click(function (e) {
                var attachmentTable = $(this).parents("table.attachments");
                var attachmentId = $(this).parents("tr:first")[0].id.substr(11); // "attachment-".length;
                // Use the parent container since there can be multiple macros on the same page
                var historyRows = $(".history-" + attachmentId, attachmentTable);
                if ($(this).hasClass("icon-section-opened")) {
                    $(this).toggleClass("icon-section-opened").attr('aria-expanded','false').toggleClass("icon-section-closed");
                } else if ($(this).hasClass("icon-section-closed")){
                    $(this).toggleClass("icon-section-closed").attr('aria-expanded','true').toggleClass("icon-section-opened");
                }
                historyRows.toggleClass("hidden");

                return AJS.stopEvent(e);
            });
        }
    };

    var recentlySubmitted = false;
    var recentlySubmittedTimer;

    function submitHandler(event) {
        clearTimeout(recentlySubmittedTimer);

        if (recentlySubmitted) {
            AJS.log('Preventing submit due to recent form submission.');
            event.preventDefault();
        }

        recentlySubmitted = true;

        recentlySubmittedTimer = setTimeout(function() {
            recentlySubmitted = false;
        }, 2000);
    }

    function initialiser($) {

        var $attachmentsForm = $('#upload-attachments');
        $attachmentsForm.on('submit', submitHandler);

        // Show more attach more attachment fields.
        var moreAttachmentsLink = $("#more-attachments-link");
        moreAttachmentsLink.click(function(e) {
            $(".more-attachments").removeClass("hidden");
            moreAttachmentsLink.addClass("hidden");
            return AJS.stopEvent(e);
        });

        AttachmentsComponent.showOlderVersions($);

        var templates = Templates.Attachments;

        function retrieveDataAttributeValueFromParents(elem, dataAttributeName) {
            return $(elem).parents('[' + dataAttributeName + ']').attr(dataAttributeName);
        }

        function retrieveAttachmentFilename(elem) {
            return retrieveDataAttributeValueFromParents(elem, 'data-attachment-filename');
        }

        function retrieveAttachmentVersion(elem) {
            return retrieveDataAttributeValueFromParents(elem, 'data-attachment-version');
        }

        function postWithXsrfToken(url, data, successCallback, errorCallback) {
            // the token gets added to data -> body, if data is not instantiated the method will just fail silently
            data = data || {};
            SafeAjax.ajax({
                type : 'POST',
                url : url,
                data : data,
                success : successCallback,
                error : errorCallback
            });
        }

        function createDialog(id) {
            var dialog = AJS.ConfluenceDialog({
                width : 600,
                height : 200,
                id : id
            });
            return dialog;
        }

        function confirmDialog(url, confirmationTitle, confirmationBody) {
            var confirmDialog = createDialog('attachment-removal-confirm-dialog');
            confirmDialog.addHeader(confirmationTitle);
            confirmDialog.addPanel("", confirmationBody);
            confirmDialog.addSubmit(AJS.I18n.getText('ok'), function() {
                var successCallback = function(data, textStatus, jqXHR) {
                    location.reload(true);
                };
                var errorCallback = function(jqXHR, textStatus, errorThrown) {
                    var messages = null;
                    if (jqXHR.responseText) {
                        var response = $.parseJSON(jqXHR.responseText);
                        if (response.actionErrors) {
                            messages = response.actionErrors;
                        }
                    }
                    var errorDialog = createDialog('attachment-removal-error-dialog');
                    errorDialog.addHeader(templates.removalErrorTitle());
                    errorDialog.addPanel("", templates.removalErrorBody({
                        messages : messages
                    }));
                    errorDialog.addButton(AJS.I18n.getText("close.name"), function() {
                        location.reload(true);
                    });
                    errorDialog.show();
                    confirmDialog.remove();
                };
                postWithXsrfToken(url, null, successCallback, errorCallback);
            });
            confirmDialog.addCancel(AJS.I18n.getText("cancel.name"), function() {
                confirmDialog.remove();
            });
            confirmDialog.show();
        }

        function createUrl(path, search) {
            return CONSTANTS.CONTEXT_PATH + path + search;
        }

        $(".removeAttachmentLink").click(function() {
            AttachmentsComponent.showRemoveAttachmentConfirmDialog(this);
            return false;
        });

        $(".removeAttachmentLinkVersion").click(
                function(clickEvent) {
                    confirmDialog(createUrl('/json/removeattachmentversion.action', this.search), templates
                            .versionRemovalConfirmationTitle(), templates.versionRemovalConfirmationBody({
                        filename : retrieveAttachmentFilename(this),
                        version : retrieveAttachmentVersion(this)
                    }));
                    return false;
                });

        /**
         * Exposes the confirm dialog for external plugins to use.
         *
         * @param removeLink the link that triggers the dialog
         */
        AttachmentsComponent.showRemoveAttachmentConfirmDialog = function(removeLink) {
            var url = createUrl('/json/removeattachment.action', removeLink.search);
            var confirmationTitle = templates.removalConfirmationTitle();
            var confirmationBody = templates.removalConfirmationBody({
                filename : retrieveAttachmentFilename(removeLink)
            });
            confirmDialog(url, confirmationTitle, confirmationBody);
        };
    }

    return {
        component: AttachmentsComponent,
        initialiser: initialiser,
        submitHandler: submitHandler
    };
});

/* istanbul ignore next */
require('confluence/module-exporter').safeRequire('confluence/attachments', function(Attachments) {
    // Make this binding available to the attachments macro
    // which dynamically loads the table.
    var AJS = require('ajs');
    AJS.Attachments = Attachments.component;
    AJS.toInit(Attachments.initialiser);
});