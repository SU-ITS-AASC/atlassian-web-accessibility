/**
 * @module confluence-editor/files/attachments-panel/attachments-panel-view
 */
define('confluence-editor/files/attachments-panel/attachments-panel-view', [
    'confluence-editor/files/file-list/file-list-view',
    'confluence-editor/files/file-item/file-item-model',
    'confluence-editor/files/file-list/file-list-collection',
    'confluence-editor/files/base-panel/base-panel-view',
    'confluence/templates',
    'confluence/legacy',
    'confluence/api/constants',
    'ajs',
    'confluence/meta',
    'underscore',
    'window',
    'jquery'
], function(
    FileListView,
    FileItemModel,
    FileListCollection,
    BasePanel,
    Templates,
    Confluence,
    CONSTANTS,
    AJS,
    Meta,
    _,
    window,
    $
) {
    "use strict";

    var LIMITED_SIZE_FOR_THUMBNAIL = 5 * 1024 * 1024; // 5MB
    var LIMITED_SIZE_FOR_THUMBNAIL_IE = 1 * 1024 * 1024; // 1MB

    var AttachmentsPanelView = BasePanel.extend({

        id: "attachments",
        panelId: "",
        cssPanel: ".attachments-panel",
        cssContainer: "#attached-files",
        textNoFileMessage: AJS.I18n.getText("file.browser.no.attachments"),
        textPanelTitle: AJS.I18n.getText("file.browser.attached.title"),

        initialize: function (options) {
            BasePanel.prototype.initialize.call(this);
            this.eventListener = options.eventListener;

            //context will be assigned a value in 'createPanel' method
            this.context = null;

            //collection of FileModel
            this.collection = new FileListCollection();
            this.fileListView = new FileListView({
                collection: this.collection,
                eventListener: this.eventListener
            });

            //a private counter to prevent multiple ajax request at the same time
            this.xhrCount = 0;
        },

        /**
         * 'render' method is called when 'createPanel' is called
         * @returns {AttachmentsPanelView}
         */
        render: function () {
            var that = this;
            //let other plugin, such as Drag-Drop to override some methods
            this.eventListener.trigger("AttachmentsPanelView.render", this);
            this.fileListView.updateDialogContext(this.context);
            this.panelId = this.context.addPanel(this.textPanelTitle, this.getPanel(), "attachments-panel");

            // Add the panel element to the image Dialog.
            this.el = this.getPanelElement();
            this.$el = $(this.el);

            //now we have actual el, so we need to bind events manually
            this.delegateEvents();

            //should call updatePanelContext when we have ready 'this.el' element
            this.fileListView.updatePanelContext({
                fileContainer: this.getContainer(),
                noFileMessage: this.textNoFileMessage,
                showContainerInfo: false,
                errors: [],
                // Delegate displaying image errors to the uploader controller so that messages are
                // shown in the error box associated with the upload form.
                displayErrors: function (messages) {
                    that.uploader.clearErrors();
                    that.uploader.displayErrors(messages);
                }
            });

            // Bind an AttachmentUploader to the upload form.
            this.uploader = this.getUploaderController(this.context);
            // The controller for displaying error messages in the panel - refer to it sparingly to avoid coupling too.
            this.messenger = this.uploader.getMessageHandler();

            //reset collection will trigger 'reset' event that makes fileListView empty file list
            this.collection.reset();

            if (this._canAttachFiles()) {
                this.refresh({
                    shouldClearSelection: true
                });
            } else {
                this.refresh({
                    errors: [AJS.I18n.getText("attach.files.no.permission")],
                    shouldClearSelection: true
                });
            }
            return this;
        },

        getPanel: function () {
            return Templates.File.uploadFileForm({
                        isNonSupportDragDrop: !this._hasXhrSupport(),
                        atlToken: Meta.get("atl-token"),
                        hasAttachPermission: this._canAttachFiles()
                    }) + Templates.File.attachedFilesPanel();
        },

        _overideUploaderClientForNonDragDropSupport: function () {
            var that = this;

            return {

                // Override the default upload success behaviour to refresh the thumbnail grid with the uploaded
                // image(s).
                onUploadSuccess: function (attachmentsAdded) {
                    for (var i = 0; i < attachmentsAdded.length; i++) {
                        var attachment = attachmentsAdded[i];
                        var attachmentId = attachment.id;
                        var existingFile = that.collection.get(attachmentId);
                        if (existingFile) {
                            that.collection.removeFile(existingFile);
                        }

                        var url = CONSTANTS.CONTEXT_PATH + '/rest/api/content/' + attachmentId + '?expand=version,container,space';
                        var xhr = $.get(url);
                        xhr.done(function (json) {
                            var newFileModel = new FileItemModel(json);
                            that.collection.addFile(newFileModel);
                        });
                    }
                },

                // When errors are displayed the image grid changes size.
                pack: function () {
                    that.getContainer().sizeToFit();
                },

                getDefaultErrorMessage: function () {
                    return that.textDefaultErrorMessage;
                },

                getDefaultUploadingMessage: function () {
                    return that.textUploading;
                },

                displayErrors: function (messages) {
                    this.getMessageHandler().displayMessages(messages);
                    that._showErrorIconInMessageBox();
                    this.pack();
                }
            };
        },

        /**
         * Returns the sub-controller that will drive the attachment-uploader form.
         * The image attachment panel mainly uses the default sub-controller, overriding methods to
         * refresh images after an upload and fix the layout after messages are shown/cleared.
         * In modern browsers that support Drag&Drop, 'getUploaderController' is overrode in confluence-drag-and-drop
         * @returns {Object} Upload client controller
         */
        getUploaderController: function () {
            return Confluence.AttachmentUploader({
                        baseElement: this.getPanelElement()
                    },
                    _.bind(this._overideUploaderClientForNonDragDropSupport, this)
            );
        },

        /**
         * Fetch and render all latest image
         * @param options has these properties:
         * - errors
         * - shouldClearSelection
         */
        refresh: function (options) {
            var that = this;

            // when opening dialog first time, we do not want to show loading message.
            var loadingElement = options.shouldClearSelection ? this.getPanelElement().find(".loading-message") : false;

            this.xhrCount += 1;
            var seqNumber = this.xhrCount;
            AJS.getJSONWrap({
                url: this._getUrlREST(),

                // Handler for error messages.
                messageHandler: this.messenger,

                // An element to show while the AJAX request is running and hide when finished.
                loadingElement: loadingElement,

                // A message to display when unknown server or network errors occur.
                errorMessage: this.textErrorRetrieving,

                successCallback: function (data) {
                    if (seqNumber === that.xhrCount) {
                        options.data = data;
                        that._onSuccessLoadFiles(options);
                    }
                },

                errorCallback: _.bind(this._onErrorLoadFiles, this)
            });
        },

        /**
         * Callback function when Ajax call is success to refresh attachment files
         * @param options has these properties:
         * - errors
         * - shouldClearSelection
         * - data
         * @private
         */
        _onSuccessLoadFiles: function (options) {
            var files = options.data.results;
            this.fileListView.resetFileList(files, options);
        },

        _onErrorLoadFiles: function () {
            this._showErrorIconInMessageBox();
        },

        _showErrorIconInMessageBox: function () {
            var $messageList = this.messenger.getMessageContainer().find("ul");
            $messageList.toggleClass("one-message", $messageList.find("li").length === 1);

            //Because current version of AUI is 5.4.x, so we have to add icon manually
            $messageList.closest(".aui-message").append("<span class='aui-icon icon-warning'></span>");
        },

        /**
         * Exposed methods to use in other module, such as Drag-Drop
         */
        setUploadInProgress: function (percentage, fileClientId) {
            this.eventListener.trigger("file.placeholder.process", percentage, fileClientId);
        },

        /**
         * Exposed method to use in other modules. This method trigger event when one file is uploaded.
         * @param fileClientId: id of attachment model before uploaded.
         * @param fileServerId: id of attachment return from server after uploaded.
         */
        attachmentUploaded: function(fileClientId, fileServerId) {
            this.eventListener.trigger("uploadingfile.completed", fileClientId, fileServerId);
        },

        /**
         * Exposed method to use in other modules. This method trigger event when one file is cancelled.
         * @param fileClientId: id of attachment model before uploaded.
         */
        attachmentUploadingCancelled: function(fileClientId) {
            this.eventListener.trigger("uploadingfile.cancelled", fileClientId);
        },

        /**
         * A helper method that is to check Drag&Drop ability support in current browser
         * @returns {boolean}
         * @private
         */
        _hasXhrSupport: function() {
            var xhr;
            var xhrSupport;
            try {
                xhr = new XMLHttpRequest();
                xhrSupport = !!(xhr.sendAsBinary || xhr.upload)  && !($.browser.mozilla && $.browser.version.indexOf('1.9.1') > -1);
            }
            catch(e) {
                //fix for ie with xhr disabled
                xhrSupport = false;
            }
            xhr = null;

            return xhrSupport;
        },

        /**
         * Add preview image of uploading files.
         * It will handle for both cases: image and non-image files
         * @param file: added file
         */
        addPreviewImage: function(file){
            var tinymce = require('tinymce');

            if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
                return;
            }

            var that = this;

            //is uploading image
            var limitedFileSizeForThumbnail = tinymce.isIE ? LIMITED_SIZE_FOR_THUMBNAIL_IE : LIMITED_SIZE_FOR_THUMBNAIL;
            file.isImage = file.nativeFile && file.nativeFile.type && this._isImageType(file.nativeFile.type);
            if (file.isImage && file.nativeFile.size < limitedFileSizeForThumbnail) {
                var reader = new FileReader();
                reader.onload = function() {
                    that._addFilePlaceHolderToCollection(file, reader.result);
                };
                reader.readAsDataURL(file.nativeFile);
            }
            else { //is non-image
                this._addFilePlaceHolderToCollection(file, null);
            }
        },

        _addFilePlaceHolderToCollection: function (file, base64Url) {
            var previousUploadedFile = null;
            //remove existing one, but do not remove uploading one
            var existingFile = this.collection.findWhere({fileName: file.name});
            if (existingFile) {
                this.collection.removeFile(existingFile);

                // if the existing file is an actual uploaded file
                if (!existingFile.get("isFilePlaceHolder")) {
                    previousUploadedFile = existingFile;
                }
                // else, if the existing file placeholder hold a reference to an actual uploaded file
                else if (existingFile.get("previousUploadedFile")) {
                    previousUploadedFile = existingFile.get("previousUploadedFile");
                }
            }

            //add a placeholder FileItemModel
            //will trigger "add.placeholder" event on the collection
            var newModel = new FileItemModel({
                isFilePlaceHolder: true,
                fileName: file.name,
                fileId: file.id,
                fileNative: file.nativeFile,
                url: base64Url ? base64Url : "",
                isImage: file.isImage,
                niceType: file.isImage ? "Image" : "",
                fileType: file.nativeFile.type,
                thumbnailUrl: base64Url ? base64Url : "",
                previousUploadedFile: previousUploadedFile
            });

            this.collection.addFile(newModel);
        },

        _isImageType: function (mimeType) {
            return AJS.Confluence.FileTypesUtils.isImage(mimeType);
        },

        _canAttachFiles: function () {
            return Meta.getBoolean("can-attach-files");
        },

        _getUrlREST: function () {
            var contentId = parseInt(Meta.get("attachment-source-content-id"), 10);
            return CONSTANTS.CONTEXT_PATH + '/rest/api/content/' + contentId + '/child/attachment?expand=version,container,space';
        },

        focus: function () {
            this.collection.clearSelection();
        }
    });

    return AttachmentsPanelView;
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/files/attachments-panel/attachments-panel-view', 'Confluence.Editor.FileDialog.AttachmentsPanelView');
