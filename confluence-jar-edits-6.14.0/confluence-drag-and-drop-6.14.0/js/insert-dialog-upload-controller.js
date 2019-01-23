/**
 * @module confluence-drag-and-drop/insert-dialog-upload-controller
 */
define('confluence-drag-and-drop/insert-dialog-upload-controller', [
    'confluence/meta',
    'ajs',
    'jquery'
], function(
    Meta,
    AJS,
    $
) {
    "use strict";

    /**
     * Handles the upload of an attachment.
     *
     * @param context with:
     *  - baseElement: the jQuery-wrapped upload div DOM element containing the form and upload/warning messages
     */

    var UploadClientController = function (context) {
        this.messageHandler = null;
        this.context = context;

        var uploadForm = this.getForm();

        // If the user cannot attach files to the content, no upload form should be shown.
        if (!Meta.getBoolean('can-attach-files')) {
            uploadForm.remove();
        }
    };

    // Returns the form that when submitted uploads an attachment
    UploadClientController.prototype.getForm = function () {
        return $("form", this.context.baseElement);
    };

    // Called after message elements are altered to fix the layout around the upload form.
    UploadClientController.prototype.pack = function () {
    };

    UploadClientController.prototype.displayErrors = function (messages) {
        this.getMessageHandler().displayMessages(messages);
        var $messageList = this.getMessageHandler().getMessageContainer().find("ul");
        $messageList.toggleClass("one-message", $messageList.find("li").length === 1);

        //Because current version of AUI is 5.4.x, so we have to add icon manually
        $messageList.closest(".aui-message").append("<span class='aui-icon icon-warning'></span>");
        this.pack();
    };

    UploadClientController.prototype.clearErrors = function () {
        this.getMessageHandler().clearMessages();
        this.pack();
    };

    // Returns a new or existing message handler for error messages relating to uploads.
    UploadClientController.prototype.getMessageHandler = function () {
        if (!this.messageHandler) {
            this.messageHandler = AJS.MessageHandler({
                baseElement: $(".aui-message", this.context.baseElement)
            });
        }
        return this.messageHandler;
    };

    return UploadClientController;
});

require('confluence/module-exporter').safeRequire('confluence-drag-and-drop/insert-dialog-upload-controller', function(InsertDialogUploadController) {
    var Confluence = require('confluence/legacy');
    Confluence.DragAndDrop = Confluence.DragAndDrop || {};
    Confluence.DragAndDrop.UploadClientController = InsertDialogUploadController;
});
