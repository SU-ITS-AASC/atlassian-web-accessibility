/**
 * @module confluence-editor/insert-image-dialog/insert-image-dialog
 */
define('confluence-editor/insert-image-dialog/insert-image-dialog', [
    'jquery',
    'ajs',
    'underscore',
    'confluence/legacy'
], function(
    $,
    AJS,
    _,
    Confluence
) {
    "use strict";

    var ImageDialog = {
        /**
         * Listeners called just before the image dialog is shown
         */
        beforeShowListeners: [],

        /**
         * Component that creates and maintains a panel.
         *
         * Structure:
         * {
         *      id: unique identifier for the component
         *      createPanel: function(context) {...},
         *      refresh: (optional) - can be called to reload the contents of the panel
         * }
         */
        panelComponent: []
    };

    ImageDialog.sizeToFit = function () {
        this.each(function () {
            var content = this;
            var container = $(this).parent();
            var outerHeight = container.height();
            container.children().each(function () {
                if (this !== content && $(this).is(":visible")) {
                    outerHeight -= $(this).outerHeight();
                }
            });
            var paddingAndBorderHeight = $(this).outerHeight() - $(this).height();
            $(this).css("height", Math.max(0, outerHeight - paddingAndBorderHeight) + "px");
        });
        return this;
    };

    ImageDialog.defaultInsertImageDialog = function () {
        var insertCallback = function (placeholderRequest) {
            var tinymce = require('tinymce');

            AJS.Rte.BookmarkManager.restoreBookmark();

            var properties = {};
            if (placeholderRequest.url) {
                properties = {
                    url: placeholderRequest.url,
                    filename: placeholderRequest.url,
                    contentId: placeholderRequest.contentId
                };
                tinymce.confluence.ImageUtils.insertFromProperties(properties);
            }
            else {
                var isAllImage = true;
                // do not show properties panel when insert multiple files
                var hidePropertiesPanel = placeholderRequest.selectItems.length > 1;

                _.each(placeholderRequest.selectItems, function (fileModel) {
                    if (fileModel.isImage() ) {
                        properties = {
                            filename: fileModel.getFileName(),
                            contentId: fileModel.get("ownerId")
                        };
                        tinymce.confluence.ImageUtils.insertFromProperties(properties, hidePropertiesPanel);
                    }
                    else {
                        isAllImage = false;
                        if (AJS.MacroBrowser.getMacroMetadata('view-file')) {
                            ImageDialog._insertFilePlaceholderToEditor(fileModel);
                        }
                        else {
                            ImageDialog._insertLinkToEditor(fileModel);
                        }
                    }
                });

                require(["confluence-drag-and-drop/analytics/files-upload-analytics"],
                        function (filesUploadAnalytics) {
                            filesUploadAnalytics.triggerEvent("confluence.insert-files-dialog.insert", placeholderRequest.selectItems, isAllImage);
                        });
            }

            // CONFDEV-5203 - Prevent cursor loss when using arrow keys after inserting an
            // image. This is a FF-specific issue that occurs when adding or editing comments.
            if (!!$("#comments-section").length) {
                AJS.Rte.fixEditorFocus();
            }
        };
        var cancelCallback = function () {
            AJS.Rte.BookmarkManager.restoreBookmark();
        };

        AJS.Rte.BookmarkManager.storeBookmark();
        ImageDialog.insertImageDialog(insertCallback, cancelCallback);
    };

    /**
     * Finds and returns the first panelComponent matching the specified id, or null if not found.
     *
     * @param id the panelComponent.id to find.
     */
    ImageDialog.findPanelComponentById = function (id) {
        var panels = Confluence.Editor.ImageDialog.panelComponent;
        for (var i = 0, ii = panels.length; i < ii; i++) {
            if (panels[i].id == id) {
                return panels[i];
            }
        }
        return undefined; // just making it obvious
    };

    ImageDialog.insertImageDialog = function (insertCallback, cancelCallback) {
        var dialog = new Confluence.Editor.FileDialog.FileDialogView({
            submitCallback: insertCallback,
            cancelCallback: cancelCallback,
            beforeShowListeners: ImageDialog.beforeShowListeners,
            panelComponents: ImageDialog.panelComponent
        });
        dialog.render();

        return dialog;
    };

    ImageDialog._insertLinkToEditor = function (fileModel) {
        var linkObj = Confluence.Link.fromREST(fileModel.attributes);
        //fileModel.getOwnerId() will return id of page which attachment file is belong to
        linkObj.attrs["data-linked-resource-container-id"] = fileModel.get("ownerId");

        // Need to check that the href leads to the download path for the attachment.
        linkObj.attrs.href = fileModel.get("downloadUrl");
        linkObj.insert();
    };

    ImageDialog._insertFilePlaceholderToEditor = function (fileModel) {
        var params = {
            name: fileModel.get("fileName"),
            page: fileModel.get("parentTitle"),
            space: fileModel.get("space") ? fileModel.get("space").key : "",
            date: fileModel.get("datePath"),
            ownerId: fileModel.get("ownerId")
        };

        require(["confluence-editor/utils/attachments-insert-utils"], function (AttachmentsInsertUtils) {
            AttachmentsInsertUtils.insertFilePlaceholder(params);
        });
    };

    return ImageDialog;
});

require('confluence/module-exporter').safeRequire('confluence-editor/insert-image-dialog/insert-image-dialog', function(ImageDialog) {
    var $ = require('jquery');
    var Confluence = require('confluence/legacy');

    $.fn.sizeToFit = ImageDialog.sizeToFit;
    Confluence.Editor.ImageDialog = ImageDialog;
    Confluence.Editor.defaultInsertImageDialog = ImageDialog.defaultInsertImageDialog;
    Confluence.Editor.ImageDialog.findPanelComponentById = ImageDialog.findPanelComponentById;
    Confluence.Editor.insertImageDialog = ImageDialog.insertImageDialog;
    Confluence.Editor.ImageDialog._insertLinkToEditor = ImageDialog._insertLinkToEditor;
    Confluence.Editor.ImageDialog._insertFilePlaceholderToEditor = ImageDialog._insertFilePlaceholderToEditor;
});