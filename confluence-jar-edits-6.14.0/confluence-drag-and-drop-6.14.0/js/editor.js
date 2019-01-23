/**
 * @tainted plupload
 * @tainted Confluence
 * @tainted tinymce
 */
require([
    "ajs",
    "jquery",
    "confluence-drag-and-drop/analytics/files-upload-analytics",
    "confluence-drag-and-drop/drag-and-drop-overlay",
    "document",
    "confluence/message-controller"
],
function (
    AJS,
    $,
    filesUploadAnalytics,
    dragAndDropOverlay,
    document,
    MessageController
) {
    "use strict";

    AJS.toInit(function($) {

        var uploadProgressDialog;

        /**
         * Includes protocol, host, port (excludes context path and trailing slash)
         */
        var base = /^\w+:\/\/[^\/?#]+/.exec(location.href);

        //was thinking of creating a initpluploadmanager function, but so much of the init code is abstracted for us, that i dont really see a point.
        //does not use the worker-pool like we do it does not try and install it for you, all things i want to change before we even attempt to use it.
        //until then we need to update default-drop-handler.js
        var createPlupload = function(editorHtmlNode) {
            var shim = document.getElementById("fileuploadShim");
            var dropLocation = false;
            if(!shim) {
                shim = document.createElement("div");
                shim.setAttribute("id","fileuploadShim");
                document.body.appendChild(shim);
            }

            //it appears to be some sort of bug in firefox 3.6 adding in the file:/// on drop, if we kill the event in firefox it goes away (defys all logic)
            if ($.browser.mozilla && $.browser.version.indexOf("1.9.2") > -1) {
                editorHtmlNode.addEventListener("drop",function(e) {
                    e.stopPropagation();
                },false);
            }

            //has to be bound to the body of the iframe, other wise the events do no propigate.
            var uploader = new plupload.Uploader({
                    runtimes : 'html5',
                    dragdrop: true,
                    drop_element: editorHtmlNode,
                    browse_button: shim.getAttribute("id"),
                    multipart: false,
                    max_file_size : +AJS.Meta.get('global-settings-attachment-max-size')

            });

            if (!uploadProgressDialog) {
                uploadProgressDialog = new AJS.DragAndDropProgressDialog();
            }
            uploader.init();

            uploader.bind("Started", function (up, files){
                filesUploadAnalytics.triggerEvent("confluence.editor.files.drag-and-drop", files);
            });

            uploader.bind('FilesAdded', function(up, files) {
                AJS.UploadUtils.filterFiles(up, files, _filesAdded);

                function _filesAdded(up, files) {
                    for (var i = 0; i < files.length; i++) {
                        var currentFile = files[i];
                        //Note: sometimes this event is fired after an Error event is fired, and thus we may get files that have their
                        //status set to failed. We don't want to render that, because the Error event handler already does that.
                        if (currentFile.status !== plupload.FAILED) {
                            uploadProgressDialog.render({workId: currentFile.id, status: currentFile.status, file: currentFile});
                        }
                    }
                    uploader.start();
                }
            });

            uploader.bind("BeforeUpload", function (up, file) {
                if (AJS.Meta.get('content-type') === 'template') {
                    // Don't support drag and drop for page templates
                    up.stop();
                    alertTemplatesNotSupportedOnce();
                    return;
                }

                var url = base + AJS.contextPath() + '/plugins/drag-and-drop/upload.action';
                // it was doing some odd things with coercion hence the explict check

                var params = {};

                var pageId = AJS.Meta.get('page-id');
                if (pageId) {
                    params.pageId = pageId;
                }

                var draftId = AJS.Meta.get('draft-id');
                if (pageId == 0 && draftId > 0) {
                    params.draftId = draftId;
                }

                var dragAndDropEntityId = AJS.Meta.get('drag-and-drop-entity-id');
                if (dragAndDropEntityId) {
                    params.dragAndDropEntityId = dragAndDropEntityId;
                }

                var extension = file.name.substr(file.name.lastIndexOf(".") + 1);

                params.filename = file.name;
                params.size = file.size;
                // if we are in the editor flag all attachments as hidden
                params.minorEdit = true;
                params.spaceKey = AJS.Meta.get('space-key') || "";
                params.mimeType = plupload.mimeTypes[extension.toLowerCase()] || AJS.DragAndDropUtils.defaultMimeType; // if we dont have the mime type just send a default
                params.atl_token = AJS.Meta.get('atl-token');
                params.contentType = AJS.Meta.get('content-type');
                params.isVFMSupported = !!AJS.MacroBrowser.getMacroMetadata('view-file');
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

            //dropLocation used by mozilla on file upload to place the file correctly
            $.browser.mozilla && (function(){
                plupload.addEvent(editorHtmlNode, 'dragenter', function(e){
                    if (e.rangeParent && (e.rangeOffset !== undefined)) {
                        dropLocation = {startElement: e.rangeParent, startOffset: e.rangeOffset};
                    } else {
                        dropLocation = false;
                    }
                });
            })();

            uploader.bind('FileUploaded', function(up, file, response) {
                if (!response.status) {
                    //this happens if the server suddenly became unavailable and there is no response
                    uploadProgressDialog.renderError(file.id, AJS.I18n.getText("dnd.error.server.not.responding"));
                } else {
                    if (response.response) {
                        try {
                            //only http errors
                            var result = $.parseJSON(response.response);
                            if (dropLocation && $(dropLocation.startElement.parentNode).closest('[contenteditable="true"]', editorHtmlNode).length) {
                                //there is a drop location and it's within content editable
                                tinymce.activeEditor.selection.setCursorLocation(dropLocation.startElement, dropLocation.startOffset);
                            }
                            if (result.htmlForEditor.substr(0, 4) === "<img") {
                                tinymce.confluence.ImageUtils.insertImagePlaceholder(result.htmlForEditor);
                            } else {
                                AJS.Rte.getEditor().execCommand('mceInsertContent', false, result.htmlForEditor, {skip_focus: true});
                            }
                        } catch (e) {
                            AJS.log("FileUploaded threw an exception " + e);
                            //just ignore it, not sure what we can do
                            //the file may have been uploaded so showing an error is not the right response, some thought will be required.
                        }
                    }

                    uploadProgressDialog.renderComplete(file.id);
                }
            });

            uploader.bind("Error", function(up, error) {
                var result;
                var message = '';
                if (error.response) {
                    try {
                        //only http errors
                        result = JSON.parse(error.response);
                        message = result.actionErrors[0];
                    } catch(e) {
                        if (e.name === "SyntaxError") {
                            message = AJS.I18n.getText("dnd.error.invalid.response.from.server");
                        } else {
                            message = MessageController.parseError(error.xhr, error.message);
                        }
                    }
                    uploadProgressDialog.renderError(error.file.id, message);
                    AJS.trigger('analyticsEvent', { name: 'confluence.editor.upload.error.server-unknown' });
                } else if (error.message) {
                    message = error.message;
                    if (error.code === plupload.FILE_SIZE_ERROR) {
                         message = AJS.I18n.getText("dnd.validation.file.too.large", AJS.DragAndDropUtils.niceSize(AJS.Meta.get('global-settings-attachment-max-size')));
                        AJS.trigger('analyticsEvent', { name: 'confluence.editor.upload.error.file-size' });
                    } else if (error.code === AJS.UploadUtils.ErrorCode.FILE_IS_A_FOLDER_ERROR) {
                        message = AJS.I18n.getText("dnd.validation.file.type.not.supported");
                        AJS.trigger('analyticsEvent', { name: 'confluence.editor.upload.error.file-type' });
                    }
                    //plupload never actually fires any of the above events so we need to add it here, stupid i know.
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
                } else {
                    message = MessageController.parseError(error.xhr);
                    uploadProgressDialog.renderError(error.file.id, message);
                    AJS.trigger('analyticsEvent', { name: 'confluence.editor.upload.error.server-unknown' });
                }
            });

            uploader.bind("UploadComplete",function() {
                if (!uploader.total.queued) {
                    uploader.stop();
                    uploadProgressDialog.showCloseButton();
                    if (!uploadProgressDialog.hasErrors()) {
                        setTimeout(function () {
                            uploadProgressDialog.hide();
                            uploadProgressDialog.clearRenderOutput();
                                AJS.Rte.BookmarkManager.restoreBookmark(); // restore the focus to the editor (but not just that, we want to do better and restore the cursor as well)
                            }, 1000);

                    }
                }
            });

            AJS.Confluence.Uploader = uploader;
            AJS.Confluence.EditorUploadProgressDialog = uploadProgressDialog;
        };


        function onInitCallback() {
            var editor = AJS.Rte.getEditor();
            var editorHtmlNode = editor.getBody().parentNode;

            createPlupload(editorHtmlNode);

            // in lighter theme, editor title element #editor-precursor overlaps RTE, so need to bind overlay on that too
            dragAndDropOverlay.bindFileDragOverlay({
                "$dragZone": $(editorHtmlNode).add("#toolbar ~ #editor-precursor"),
                "$overlayZone": $("#rte"),
                "isTransparent": true
            });
        }

        var alertedTemplatesNotSupported = false;
        function alertTemplatesNotSupportedOnce() {
            if(alertedTemplatesNotSupported) {
                return;
            }

            var popup = new AJS.Dialog(450,180);
            popup.addHeader(AJS.I18n.getText("dnd.templates.not.supported.heading"));
            popup.addSubmit(AJS.I18n.getText("dnd.templates.not.supported.ok"), function() {
                popup.remove();
            });
            popup.addPanel("Panel 1", "panel1");
            popup.getCurrentPanel().html(AJS.I18n.getText("dnd.templates.not.supported.message"));
            popup.show();
            alertedTemplatesNotSupported = true;
        }

        AJS.Rte.BootstrapManager.addOnInitCallback(onInitCallback);
    });

});
