/**
 * Initialises the drag and drop handler for viewpage. We bind the initialisation function to the dragenter event to avoid
 * taking up time during DOMContentLoaded (CONFDEV-33316)
 *
 * @module confluence-drag-and-drop/default-drop-handler
 *
 * @tainted AJS.Editor
 * @tainted AJS.DragAndDropProgressDialog
 * @tainted AJS.DragAndDrop
 * @tainted AJS.UploadUtils
 * @tainted Confluence.EditorUploadProgressDialog
 * @tainted Confluence.Uploader
 * @tainted plupload
 */
define('confluence-drag-and-drop/default-drop-handler',[
    'ajs',
    'document',
    'confluence/meta',
    'jquery',
    'confluence/legacy',
    'underscore',
    'plupload',
    'window',
    'confluence/message-controller'
], function(
    AJS,
    document,
    Meta,
    $,
    Confluence,
    _,
    plupload,
    window,
    MessageController
) {
    "use strict";

    var DragAndDrop = {};

    DragAndDrop.initialise = function initialisePluploadManager() {

        var uploadProgressDialog;

        var shim = document.getElementById("fileuploadShim");
        if(!shim) {
            shim = document.createElement("div");
            shim.setAttribute("id","fileuploadShim");
            document.body.appendChild(shim);
        }

        // has to be bound to the body of the iframe, other wise the events do not propagate.
        var uploader = new plupload.Uploader({
            runtimes: 'html5',
            dragdrop: true,
            drop_element: $("body")[0],
            browse_button: shim.getAttribute("id"),
            multipart: false,
            stop_propagation: true,
            max_file_size: +Meta.get('global-settings-attachment-max-size')
        });
        //there seems to be some issues with loading out of order here.
        var createUploadDialog = function () {
            // Delegate to the editor's progress dialog if we are in the editor. Otherwise we'll popup another
            // dialog and cover the existing dialog.
            if (AJS.Editor && AJS.Editor.isVisible() && Confluence.EditorUploadProgressDialog) {
                uploadProgressDialog = Confluence.EditorUploadProgressDialog;
            } else {
                uploadProgressDialog = new AJS.DragAndDropProgressDialog();
            }
        };
        uploadProgressDialog = null; //no flow of effect from other uploaders
        uploader.init();

        /**
         * Check if any popup dialog with transparent blanket is displayed on the current view.
         * This does not count the Drag and Drop progress dialog, as we still allow drag and drop when the
         *   progress dialog appears.
         * @returns {boolean}
         * @private
         */
        function _isPopUpDialogVisibility() {
            var $blanket = $('.aui-blanket:visible');
            return ($blanket.length && $blanket.css('visibility') !== 'hidden' &&
                    !$("#drag-and-drop-progress-dialog:visible").length);
        }

        function _cancelUploadingAllFiles() {
            while (uploader.files.length) {
                uploader.removeFile(uploader.files[0]);
            }
        }

        //we want to clear the default uploaded and create our own.
        AJS.DragAndDrop.defaultDropHandler = null;
        uploader.bind('FilesAdded', function (up, files) {
            if (_isPopUpDialogVisibility()) {
                _cancelUploadingAllFiles();
                return;
            }

            // If the upload dialog is visible, a subsequent drag and drop will trigger this handler as it will be
            // caught by ".aui-blanket". Pass the trigger to the editor's uploader to let it handle the queue etc.
            if (AJS.Editor && AJS.Editor.isVisible()) {
                // Filter out files with FAILED status
                var filteredFiles = _.reject(files, function(file) {
                    return file.status === plupload.FAILED;
                });
                Confluence.Uploader && Confluence.Uploader.trigger('FilesAdded', filteredFiles);
                return;
            }

            AJS.UploadUtils.filterFiles(up, files, _filesAdded);

            function _filesAdded(up, files) {
                !uploadProgressDialog && createUploadDialog();

                for (var i = 0; i < files.length; i++) {
                    var currentFile = files[i];
                    if (currentFile.status !== plupload.FAILED) {
                        uploadProgressDialog.render({workId: currentFile.id, status: currentFile.status, file: currentFile});
                    }
                }
                uploader.start();
            }

        });

        uploader.bind("BeforeUpload", function (up, file) {
            // CONFDEV-14351 - Prevent main page event handler from fire if the editor is present.
            // In that case specific editor upload handler should be used
            if (AJS.Editor && AJS.Editor.isVisible()) {
                return;
            }
            var url = AJS.DragAndDropUtils.base + AJS.contextPath() + '/plugins/drag-and-drop/upload.action';
            // it was doing some odd things with coercion hence the explict check
            var pageId = Meta.get('page-id');
            var params = pageId != 0 ? {pageId: pageId } : { draftId: Meta.get('draft-id') };
            var extension = file.name.substr(file.name.lastIndexOf(".") + 1);
            params.filename = file.name;
            params.size = file.size;
            params.mimeType = plupload.mimeTypes[extension.toLowerCase()] || AJS.DragAndDropUtils.defaultMimeType; // if we dont have the mime type just send a default
            params.spaceKey = Meta.get('space-key');
            params.atl_token = Meta.get('atl-token');
            up.settings.url = plupload.buildUrl(url, params);

            uploadProgressDialog.cancelListeners.push(function (e, fileStatus) {
                var file = up.getFile(fileStatus.workId);
                file && up.removeFile(file);
                uploadProgressDialog.renderInfo(fileStatus.workId, AJS.I18n.getText("dnd.upload.file.removed.from.queue"));
            });
            uploadProgressDialog.show();
        });

        uploader.bind("UploadProgress",function(up,file) {
            uploadProgressDialog.renderUpdateToBytesUploaded(file.id, file.loaded, file.size);
            uploadProgressDialog.hideCloseButton();
        });
        uploader.bind('FileUploaded', function(up, file, response) {
            if (response.status === 0) {
                //this happens if the server suddenly became unavailable and there is no response
                uploadProgressDialog.renderError(file.id, AJS.I18n.getText("dnd.error.server.not.responding"));
            } else {
                uploadProgressDialog.renderComplete(file.id);
            }
        });

        uploader.bind("Error", function(up, error) {
            if (_isPopUpDialogVisibility()) {
                _cancelUploadingAllFiles();
                return;
            }

            // If we're in the editor, let the editor handle errors - otherwise we handle errors twice
            if (AJS.Editor && AJS.Editor.isVisible()) {
                Confluence.Uploader && Confluence.Uploader.trigger('Error', error);
                return;
            }

            var result;
            var message;
            if(error.response) {
                try {
                    //only http errors
                    result = $.parseJSON(error.response);
                    message = result.actionErrors[0];
                } catch(e) {
                    if (e.name === "SyntaxError") {
                        message = AJS.I18n.getText("dnd.error.invalid.response.from.server");
                    } else {
                        // Make the err parse-able by ErrorHandler
                        error.responseText = error.response;
                        message = MessageController.parseError(error);
                    }
                }
                uploadProgressDialog.renderError(error.file.id,message);
                AJS.trigger('analyticsEvent', {name: 'confluence.default-drop.upload.error.server-unknown'});
            } else {
                message = error.message;
                if (error.code === plupload.FILE_SIZE_ERROR) {
                    message = AJS.I18n.getText("dnd.validation.file.too.large",
                             AJS.DragAndDropUtils.niceSize(Meta.get('global-settings-attachment-max-size')));
                    AJS.trigger('analyticsEvent', {name: 'confluence.default-drop.upload.error.file-size'});
                } else if (error.code === AJS.UploadUtils.ErrorCode.FILE_IS_A_FOLDER_ERROR) {
                    message = AJS.I18n.getText("dnd.validation.file.type.not.supported");
                    AJS.trigger('analyticsEvent', {name: 'confluence.default-drop.upload.error.file-type'});
                }
                //plupload never actually fires any of the above events so we need to add it here, stupid i know.
                !uploadProgressDialog && createUploadDialog();
                uploadProgressDialog.render({
                    workId: error.file.id,
                    status: error.file.status,
                    file: error.file,
                    errorMessage: message
                });
                if (!uploadProgressDialog.isVisible()) {
                    uploadProgressDialog.show();
                    uploadProgressDialog.showCloseButton();
                }
            }
        });

        uploader.bind("UploadComplete",function() {
            if (!uploader.total.queued && uploadProgressDialog) {
                uploadProgressDialog.showCloseButton();
                if (!uploadProgressDialog.hasErrors()) {
                    setTimeout(function () {
                        uploadProgressDialog.hide();
                        uploadProgressDialog.clearRenderOutput();
                        window.location.reload();
                        }, 1000);
                }
            }
        });
    };

    DragAndDrop.bind = function() {

        function initFunction() {
            $(document).unbind('dragenter', initFunction);
            DragAndDrop.initialise();
        }

        $(document).bind('dragenter', initFunction);

    };

    return DragAndDrop;
});

require('confluence/module-exporter').safeRequire('confluence-drag-and-drop/default-drop-handler', function(DragAndDrop) {
    require('ajs').toInit(DragAndDrop.bind);
});
