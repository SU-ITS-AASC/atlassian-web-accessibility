/**
 * @module confluence-editor/files/file-item/file-item-model
 */
define('confluence-editor/files/file-item/file-item-model', [
    'backbone',
    'confluence/legacy',
    'confluence/api/constants',
    'ajs',
    'underscore',
    'plupload'
], function(
    Backbone,
    Confluence,
    CONSTANTS,
    AJS,
    _,
    plupload
) {
    "use strict";

    /**
     * FileItemModel is wrapper for 'file' or 'image' object that returns from server
     */
    var FileItemModel = Backbone.Model.extend({

        defaults: {
            id: -1,
            ownerId: -1,
            fileName: '',
            nonceUrl: '',
            isImage: false,
            isFilePlaceHolder: false,
            isSelect: false,
            thumbnailUrl: '',
            downloadUrl: ''
        },

        initialize: function () {
            var that = this;
            this._findDownloadUrl();
            this._findThumbnailUrl();
            this.findMetadata();
            this.findVersion();
            this.findContainer();

            this.set("fileName", this.getFileName());
            this.set("nonceUrl", this.getNonceUrl());
            this.set("isImage", this.isImage());
            this.set("isPreviewable", this.isPreviewable());

            if (this.get("isFilePlaceHolder")) {
                this.set("id", this.get("fileId"));
            }

            //for IE9 only
            this.listenTo(this, "change:link", function () {
                that.set("nonceUrl", that.getNonceUrl());
                that._findDownloadUrl();
            });

            this.set("iconAUIClass", this._parseFileNameToAuiIconClass(this.get('fileName')));
        },

        isImage: function () {
            if (this.get('isImage')) {
                return true;
            }
            return !!this.get('thumbnailUrl');
        },

        /**
         * Preview button is only applied with "pdf" and "image" file types.
         */
        isPreviewable: function() {
            var niceType = this.get("niceType") || "";
            return niceType.toLocaleLowerCase() === 'application/pdf' || this.isImage();
        },

        getFileName: function () {
            return this.get('fileName') || this.get('title') || '';
        },

        getDestinationUrl: function () {
            return AJS.REST.wikiLink(this.attributes).destination;
        },

        getNonceUrl: function () {
            var thumbnailUrl = this.get("thumbnailUrl");

            if (thumbnailUrl.indexOf("modificationDate") >= 0) {
                return thumbnailUrl;
            }

            var lastModifiedDate = this.get("lastModifiedDate");
            lastModifiedDate = lastModifiedDate ? lastModifiedDate.date : (+new Date());
            lastModifiedDate = encodeURIComponent(lastModifiedDate);

            if (thumbnailUrl) {
                thumbnailUrl += (thumbnailUrl.indexOf("?") + 1 ? "&" : "?") + "nonce=" + lastModifiedDate;
            }
            return thumbnailUrl ;
        },

        getRelativeUrl: function (url) {
            var targetUrl = url;
            if (!url) {
                return url;
            }

            if (url.indexOf(Confluence.getBaseUrl()) === 0) {
                targetUrl = url.replace(Confluence.getBaseUrl(), '');
            }

            return CONSTANTS.CONTEXT_PATH + targetUrl;
        },

        _findThumbnailUrl: function () {
            var links = this.get('_links');
            if (!this.get('thumbnailUrl') && links && links.thumbnail) {
                this.set('thumbnailUrl', this.getRelativeUrl(links.thumbnail));
            }
        },

        _findDownloadUrl: function () {
            var links = this.get('_links');
            if (!this.get('downloadUrl') && links) {
                this.set("downloadUrl", this.getRelativeUrl(links.download));
            }
        },

        findMetadata: function() {
            var metadata = this.get('metadata');
            if (!this.get('contentType') && metadata) {
                this.set('niceType', metadata.mediaType);
                this.set('contentType', metadata.mediaType);
            }
        },

        findVersion: function() {
            var version = this.get('version');
            if (!this.get('versionNumber') && version) {
                this.set('versionNumber', version.number);
            }
        },

        findContainer: function() {
            var container = this.get('container');
            if (container) {
                if (this.get('ownerId') === -1) {
                    this.set('ownerId', container.id);
                }
                if (!this.get('parentTitle')) {
                    this.set('parentTitle', container.title);
                }
            }
        },

        _getFileExtension: function(fileName) {
            return fileName.substr(fileName.lastIndexOf(".") + 1);
        },

        _parseFileNameToAuiIconClass: function (fileName) {
            var fileMime = (typeof plupload !== "undefined")
                    ? plupload.mimeTypes[this._getFileExtension(fileName)]
                    : "";

            return AJS.Confluence.FileTypesUtils.getAUIIconFromMime(fileMime);
        }

    });

    return FileItemModel;
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/files/file-item/file-item-model', 'Confluence.Editor.FileDialog.FileItemModel');
