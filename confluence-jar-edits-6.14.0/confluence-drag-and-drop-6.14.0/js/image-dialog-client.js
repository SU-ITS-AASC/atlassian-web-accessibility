/* global plupload */
/**
 * @module confluence-drag-and-drop/image-dialog-client
 *
 * @tainted plupload
 */
define('confluence-drag-and-drop/image-dialog-client', [
    'jquery',
    'confluence/legacy',
    'ajs',
    'confluence/meta',
    'underscore',
    'confluence/message-controller'
], function(
    $,
    Confluence,
    AJS,
    Meta,
    _,
    MessageController
) {
    'use strict';

    /********************************************************************/
    /* Because z-index of Insert File Dialog is 3004 so 3005 is used for drag overlay in Insert File Dialog */
    var DRAG_AND_DROP_Z_INDEX = 3005;

    var BatchProgress = function () {
        this._workIdToBytesUploaded = {};
        this._totalBytes = 0;
    };

    BatchProgress.prototype = {
        update: function (workId, uploaded, fileSize) {
            if (!(workId in this._workIdToBytesUploaded)) {
                this._totalBytes += fileSize;
            }
            this._workIdToBytesUploaded[workId] = uploaded;
        },
        percentComplete: function () {
            var totalBytesUploaded = 0;
            $.each(this._workIdToBytesUploaded, function (key, value) {
                totalBytesUploaded += value;
            });
            return Math.round(totalBytesUploaded * 100 / this._totalBytes);
        }
    };

    /********************************************************************/
    /*
     * Support upload images (and other file types in near future) in client side
     * It replies on Plupload plugin
     * 'attachmentPanelComponent' is an instance of Confluence.Editor.FileDialog.AttachmentsPanel
     * In this class, we should not reply on DOM manipulation. Let 'attachmentPanelComponent' do these DOM jobs
     *
     * */
    var UploadClient = function (options) {
        this.urlHandleUpload = '/plugins/drag-and-drop/upload.action';
        this.pageId = parseInt(Meta.get('page-id'), 10);
        this.draftId = parseInt(Meta.get('draft-id'), 10);
        this.dragAndDropEntityId = Meta.get('drag-and-drop-entity-id');
        this.spaceKey = Meta.get('space-key') || "";
        this.atlToken = Meta.get('atl-token');
        this.base = /^\w+:\/\/[^\/?#]+/.exec(location.href); //get base url from current url
        this.metaMaxFileSize = Meta.get('global-settings-attachment-max-size');
        this.errors = [];
        this.batchProgress = new BatchProgress();
        this.attachmentPanelComponent = options.attachmentPanelComponent;
        this.dropZone = options.dropZone;
        this.browserButtonId = options.browserButtonId;
        this.uploader = null;
        this.isUploadUsingDragAndDrop = false; //this variable is used to distinguish between uploading file using dragAndDop or upload button
        var that = this;
        $(this.dropZone).bind("drop", function () {
            that.isUploadUsingDragAndDrop = true;
        });
    };

    UploadClient.prototype.createPlupload = function () {
        var that = this;

        //has to be bound to the body of the iframe, other wise the events do no propigate.
        var uploader = new plupload.Uploader({
            runtimes: 'html5',
            dragdrop: true,
            drop_element: that.dropZone,
            browse_button: that.browserButtonId,
            multipart: false,
            stop_propagation: true,
            max_file_size: parseInt(that.metaMaxFileSize, 10),
            inputFileClazz: "file-library-input-file"
        });

        uploader.init();

        //refresh everything when start
        uploader.bind("Started", function (up, files){
            that.errors = [];
            that.attachmentPanelComponent.clearErrors();
            that.batchProgress = new BatchProgress();

            //trigger file upload event
            require(["confluence-drag-and-drop/analytics/files-upload-analytics"],
                    function (filesUploadAnalytics) {
                        filesUploadAnalytics.triggerEvent(
                                that.isUploadUsingDragAndDrop ? "confluence.insert-files-dialog.drag-and-drop" : "confluence.insert-files-dialog.upload",
                                files
                        );

                        that.isUploadUsingDragAndDrop = false;
                    });
        });

        uploader.bind('FilesAdded', function (up, files) {
            //if File Library tab is not selected => do not upload file

            if (files.length > 0) {
                that.attachmentPanelComponent.getNoFileContainer().hide();
                AJS.UploadUtils.filterFiles(up, files, _filesAdded);
            }

            function _filesAdded(up, files) {
                for (var i = 0; i < files.length; i++) {
                    if (files[i].status === plupload.FAILED) {
                        up.removeFile(files[i]);
                    } else {
                        //re-upload the current uploading files
                        var queuedFile = _.find(up.files, function(file) {
                            return file.name === files[i].name && file.id !== files[i].id;
                        });
                        if (queuedFile) {
                            up.removeFile(queuedFile);
                        }
                        if (that.metaMaxFileSize > files[i].size) {
                            that.attachmentPanelComponent.addPreviewImage(files[i]);
                        }
                    }
                }
                up.start();
            }
        });

        uploader.bind("BeforeUpload", function (up, file) {
            var url = that.base + AJS.contextPath() + that.urlHandleUpload;
            // it was doing some odd things with coercion hence the explict check
            var params = {};
            var extension = file.name.substr(file.name.lastIndexOf(".") + 1);
            if (that.pageId) {
                params.pageId = that.pageId;
            }
            else {
                params.draftId = that.draftId;
            }

            if (that.dragAndDropEntityId) {
                params.dragAndDropEntityId = that.dragAndDropEntityId;
            }

            params.filename = file.name;
            params.size = file.size;
            // if we are in the image dialog flag all attachments as hidden
            params.minorEdit = true;
            params.spaceKey = that.spaceKey;
            params.mimeType = plupload.mimeTypes[extension.toLowerCase()] || AJS.DragAndDropUtils.defaultMimeType; // if we dont have the mime type just send a default
            params.atl_token = that.atlToken;

            up.settings.url = plupload.buildUrl(url, params);

            that.batchProgress = new BatchProgress();
        });

        uploader.bind("UploadProgress", function (up, file) {
            that.batchProgress.update(file.id, file.loaded, file.size);
            that.attachmentPanelComponent.setUploadInProgress(
                    that.batchProgress.percentComplete() / 100,
                    file.id);
        });

        uploader.bind('FileUploaded', function (up, file, response) {
            //check if file is in upload queue (file was not canceled while uploading)
            //we need to do this check because when we cancel uploading file,
            //after remove that file from uploading queue, plupload still fires "FileUploaded" event
            if (up.getFile(file.id)) {
                var data = JSON.parse(response.response);
                var fileServerId = data.data.id;
                that.attachmentPanelComponent.attachmentUploaded(file.id, fileServerId);
            } else {
                that.attachmentPanelComponent.attachmentUploadingCancelled(file.id);
            }
        });

        uploader.bind("Error", function (up, error) {
            var message = "";

            if (error.response) {
                try {
                    //only http errors
                    var result = JSON.parse(error.response);
                    message = result.actionErrors[0];
                } catch (e) {
                    message = MessageController.parseError(error.xhr, error.message);
                }
                AJS.trigger('analyticsEvent', { name: 'confluence.image-dialog.upload.error.server-unknown' });
            } else if (error.message) {
                message = error.message;
                var fileName = error.file.name;
                if (error.code === plupload.FILE_SIZE_ERROR) {
                    var fileSizeLimit =  AJS.DragAndDropUtils.niceSize(that.metaMaxFileSize).toString();
                    message = AJS.I18n.getText("dnd.validation.file.too.large.withname", fileName, fileSizeLimit);
                    AJS.trigger('analyticsEvent', { name: 'confluence.image-dialog.upload.error.file-size' });
                } else if (error.code === AJS.UploadUtils.ErrorCode.FILE_IS_A_FOLDER_ERROR) {
                    message = AJS.I18n.getText("dnd.validation.file.type.not.supported.withname", fileName);
                    AJS.trigger('analyticsEvent', { name: 'confluence.image-dialog.upload.error.file-type' });
                }
            } else {
                message = MessageController.parseError(error.xhr);
                AJS.trigger('analyticsEvent', { name: 'confluence.image-dialog.upload.error.server-unknown' });
            }
            that.attachmentPanelComponent.displayErrors([message]);
            that.errors.push(message);
        });


        require(["confluence-drag-and-drop/drag-and-drop-overlay"], function (dragAndDropOverlay) {
            dragAndDropOverlay.bindFileDragOverlay({"$dragZone": $(that.dropZone), "zIndex": DRAG_AND_DROP_Z_INDEX});
        });

        return uploader;
    };

    UploadClient.prototype.init = function () {
        this.uploader = this.createPlupload();
    };

    UploadClient.prototype.cancelUpload = function (fileId) {
        var file = this.uploader.getFile(fileId);
        //remove file from upload queue
        file && this.uploader.removeFile(file);
    };

    /********************************************************************/

    /**
     * In modern browsers, we will use a new method of upload
     */
    if (Confluence.Editor && Confluence.Editor.FileDialog) {

        Confluence.Editor.FileDialog.eventListener.on("AttachmentsPanelView.render", function (viewObj) {
            viewObj.getUploaderController = function () {
                return new Confluence.DragAndDrop.UploadClientController(viewObj.context);
            };
        });
    }
    /********************************************************************/

    AJS.toInit(function ($) {
        if (!Confluence.Editor || !Confluence.Editor.ImageDialog) {
            return;
        }

        /**
         * Ensure we register listeners outside of toInit(). This is to ensure they get registered before they are invoked
         * in application logic that does reside inside toInit().
         */
        var bsl = Confluence.Editor.ImageDialog.beforeShowListeners;
        var attachmentPanelComponent = Confluence.Editor.ImageDialog.findPanelComponentById("attachments");

        bsl && bsl.push(function () {
            if (!attachmentPanelComponent) {
                AJS.debug("Do not support Attachment Panel and Drag-Drop in Insert Image Dialog (ex: in creating Template)");
                return;
            }

            var $attachedImages = attachmentPanelComponent.getPanelElement();
            if (!$attachedImages.length) {
                //no attach image dialog so no need to support uploading
                return;
            }

            if (Meta.getBoolean("can-attach-files")) {

                var uploadClient = new UploadClient({
                    dropZone: $attachedImages[0],
                    browserButtonId: "upload-files-button",
                    attachmentPanelComponent: attachmentPanelComponent
                });
                uploadClient.init();

                Confluence.Editor.FileDialog.eventListener.on("uploadingfile.cancelled", function (fileId) {
                    uploadClient.cancelUpload(fileId);
                });
            }
        });
    });

    return UploadClient;
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-drag-and-drop/image-dialog-client', 'Confluence.DragAndDrop.UploadClient');
