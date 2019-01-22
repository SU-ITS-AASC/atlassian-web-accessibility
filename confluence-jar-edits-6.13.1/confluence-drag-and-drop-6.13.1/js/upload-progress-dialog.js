/**
 * @module confluence-drag-and-drop/upload-progress-dialog
 */
define('confluence-drag-and-drop/upload-progress-dialog', [
    'ajs',
    'plupload',
    'jquery',
    'document'
], function(
    AJS,
    plupload,
    $,
    document
) {
    var DragAndDropProgressDialog = function (options) {
        var thiz = this;
        var defaults = {
            header: AJS.I18n.getText("dnd.progress.dialog.header"),
            width: 600,
            height: 400
        };
        this._options = $.extend({}, defaults, options);
        this.id = "drag-and-drop-progress-dialog";
        this._dialog = new AJS.Dialog(this._options.width, this._options.height, this.id);
        this._dialog.addHeader(this._options.header)
                .addPanel('Panel 1', AJS.DragAndDrop.Templates.uploadFileStatusContainer())
                .addButton(AJS.I18n.getText("done.name"), function() {
                    thiz.hide();
                    thiz.clearRenderOutput();
                }, "all-file-uploads-complete");
        this._dialog.getCurrentPanel().setPadding(0);
        this._$closeButton = this.find('.all-file-uploads-complete');

        $(document).keydown(function(e) {
            if (e.which === 27) { // ESC button
                if (!thiz._$closeButton.prop('disabled')) {
                    thiz.hide();
                    thiz.clearRenderOutput();
                }
                return AJS.stopEvent(e);
            }
        });

        this._$container = this.find('#upload-statuses');


        /**
         * Maintain an array of the work id's of files that are currently displayed in this dialog
         */
        this._workIdsOfFilesInProgress = [];

        /**
         * Listeners that respond to a file upload cancel being triggered from the user interface
         */
        this.cancelListeners = [];

        /**
         * Listeners triggered when the dialog is first made visible via a call to show().
         */
        this.onShowListeners = [];

        this._hidden = true;

        /**
         * Stores whether the current "dialog view" has had any errors.
         * @type {boolean}
         */
        this.hasErrorMessage = false;
    };

    DragAndDropProgressDialog.prototype = {
        show: function () {
            if (this._hidden) {
                this._dialog.show();
                this._hidden = false;
                $.each(this.onShowListeners, function (index, listener) {
                    listener();
                });
            }
            this.hideCloseButton();
        },
        hide: function () {
            if (!this._hidden) {
                this._dialog.hide();
                this._hidden = true;
            }
        },
        isVisible: function() {
            return !this._hidden;
        },
        _getProgressElementId: function (workId) {
            return 'file-' + workId + '-progress';
        },
        render: function (fileStatus) {
            this._workIdsOfFilesInProgress.push(fileStatus.workId);

            var progressElementId = this._getProgressElementId(fileStatus.workId);
            this._$container.append(AJS.DragAndDrop.Templates.fileStatus({
                filename: fileStatus.file.name,
                progressElementId: progressElementId,
                workId: fileStatus.workId,
                showCancel: (fileStatus.status == plupload.QUEUED)
            }));

            AJS.progressBars.update("#" + progressElementId, 0);

            if (fileStatus.status == plupload.QUEUED) {
                $('#file-upload-cancel-' + fileStatus.workId).click((function (cancelListeners) {
                    return function(e) {
                        $.each(cancelListeners, function (index, cancelListener) {
                            cancelListener(e, fileStatus);
                        });
                    };
                })(this.cancelListeners));
            } else {
                this.renderError(fileStatus.workId, fileStatus.errorMessage);
            }
        },

        /**
         * Replaces progress bar with aui warning message containing specified message
         * @param id file status id
         * @param message the error message
         */
        renderError: function (id, message) {
            if ($.inArray(id, this._workIdsOfFilesInProgress) == -1) {
                throw new Error("No file status found with id: " + id);
            }
            var $fileStatus = $('#file-status-block-' + id);
            // This needs sanitizing again because the $fileStatus.attr("data-filename") return the original filename
            // without sanitization
            // The ideal solution should be happened inside the component aui.message.info
            var filename = AJS.escapeEntities($fileStatus.attr("data-filename"));
            $fileStatus.html(aui.message.error({content:message, titleContent:filename}));
            this.hasErrorMessage = true;
        },

        /**
         * Replaces progress bar with aui info message containing specified message
         * @param id file status id
         * @param message the error message
         */
        renderInfo: function (id, message) {
            if ($.inArray(id, this._workIdsOfFilesInProgress) == -1) {
                throw new Error("No file status found with id: " + id);
            }
            var $fileStatus = $('#file-status-block-' + id);
            // This needs sanitizing again because the $fileStatus.attr("data-filename") return the original filename
            // without sanitization
            // The ideal solution should be happened inside the component aui.message.info
            var filename = AJS.escapeEntities($fileStatus.attr("data-filename"));
            $fileStatus.html(aui.message.info({content:message, titleContent:filename}));
            this.hasErrorMessage = true; //technically not an error message, but still a message we want them to read
        },
        hasErrors: function () {
            return this.hasErrorMessage;
        },
        renderUpdateToBytesUploaded: function (id, bytesUploaded, fileSize)  {
            if ($.inArray(id, this._workIdsOfFilesInProgress) == -1) {
                throw new Error("No file status found with id: " + id);
            }
            var bytesUploadedNice = AJS.DragAndDropUtils.niceSize(bytesUploaded);
            var $uploaded = $('#file-' + id + '-uploaded');
            if (!!$uploaded.length) {
                $uploaded.text(bytesUploadedNice);
            } else {
                $('#file-upload-progress-text-' + id).html(AJS.DragAndDrop.Templates.uploadFileStatusProgressMessage({
                    fileId : id,
                    uploadedSizeNice: bytesUploadedNice,
                    totalSizeNice: AJS.DragAndDropUtils.niceSize(fileSize)
                }));
            }
            var percent = bytesUploaded / fileSize;

            AJS.progressBars.update("#" + this._getProgressElementId(id), percent);
        },
        renderComplete: function (id) {
            if ($.inArray(id, this._workIdsOfFilesInProgress) == -1) {
                throw new Error("No file status found with id: " + id);
            }
            $('#cancel-or-success-placeholder-' + id).html(AJS.DragAndDrop.Templates.uploadFileStatusSuccessIcon());
        },
        renderCancelled: function (id) {
            if ($.inArray(id, this._workIdsOfFilesInProgress) == -1) {
                throw new Error("No file status found with id: " + id);
            }

            AJS.progressBars.setIndeterminate("#" + this._getProgressElementId(id));

            $('#file-upload-progress-text-' + id).html(AJS.I18n.getText("dnd.upload.cancelled"));
            $('#cancel-or-success-placeholder-' + id).hide();
        },
        /**
         * Removes all statuses that have been rendered so far
         */
        clearRenderOutput: function () {
            this.showCloseButton();
            this._$container.empty();
            this._workIdsOfFilesInProgress = [];
            this.hasErrorMessage = false;
        },
        hideCloseButton: function() {
            this._$closeButton.hide();
        },
        showCloseButton: function() {
            this._$closeButton.show();
        },
        find: function(selector) {
            return this._dialog.getCurPanel().page.body.parent().find(selector);
        }
    };

    return DragAndDropProgressDialog;
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-drag-and-drop/upload-progress-dialog', 'AJS.DragAndDropProgressDialog');