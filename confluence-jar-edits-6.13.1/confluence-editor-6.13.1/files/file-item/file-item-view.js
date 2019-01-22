/**
 * @module confluence-editor/files/file-item/file-item-view
 */
define('confluence-editor/files/file-item/file-item-view', [
    'backbone',
    'confluence/templates',
    'confluence/highlighter',
    'raphael',
    'underscore',
    'wrm',
    'jquery'
], function(
    Backbone,
    Templates,
    Highlighter,
    Raphael,
    _,
    WRM,
    $
) {
    "use strict";

    /**
     * FileItemView is used for rendering file item
     * File item is Image item or Non-image item
     */
    var FileItemView = Backbone.View.extend({
        template: Templates.File.fileDialogListItem,

        model: null,// is instance of FileItemModel

        /**
         * Constructor
         * @param model is an FileItemModel object containing the image/file properties
         * @param showContainerInfo indicates if the container info (space/page name) should be rendered
         * @param highlighter highlight
         */
        initialize: function (options) {
            var that = this;

            this.eventListener = options.eventListener;
            this.model = options.model;
            this.showContainerInfo = options.showContainerInfo;
            this.highlighter = options.highlighter;

            //when isSelect attribute changes value
            this.listenTo(this.model, "change:isSelect", function () {
                that.$el.toggleClass("selected", that.model.get("isSelect"));
            });
        },

        render: function () {
            var highlighter = this.highlighter || new Highlighter();
            var space = this.model.get("space");
            var fileName = this.model.getFileName();

            var tooltip = (this.showContainerInfo && space)
                ? fileName + " (" + space.name +  ")"
                : fileName;

            var optionGeneral = {
                file: this.model.attributes,
                tooltip: tooltip,
                highlightedImageNameContent: highlighter.highlight(fileName),
                highlightedParentTitleContent: this.showContainerInfo ? highlighter.highlight(this.model.get('container').title) : null
            };

            this.$el = $(this.template(optionGeneral));
            this.el = this.$el[0];

            //begin to bind events
            this.delegateEvents();

            this.$el.find(".file-container").tooltip({
                aria:true
            });

            this.$el.attr("data-destination", this.model.getDestinationUrl());

            if (this.model.get("isImage")) {
                this._renderLoadingSpinner();
            }
            else {
                this.$el.removeClass("loading");
            }

            if (this.model.get("isPreviewable")) {
                this._renderPreviewButton();
            }

            return this;
        },

        _renderPreviewButton: function () {
            var $previewLink = this.$(".zoom");

            $previewLink.on("click", _.bind(function (e) {
                e.preventDefault();

                var fileInfo = {
                    src: this.model.get("downloadUrl"),
                    thumbnail: this.model.get("nonceUrl") || this.model.get("downloadUrl"),
                    type: this.model.get("contentType"),
                    rank: 0,
                    title: this.model.getFileName(),
                    id: this.model.get("id"),
                    ownerId: this.model.get("ownerId"),
                    version: this.model.get('versionNumber')
                };

                this._setupAndShowPreviewer(fileInfo);
            }, this));
        },

        _setupAndShowPreviewer: function (file) {
            var opt = {
                viewMode: "simple",
                // Because AUI Dialog v1 does not support a mechanism to turn off or override ESC handler,
                // so we need to hide the dialog element to prevent processing hiding of AUI Dialog.
                openPreviewCallback : function () {
                    // hide Insert File Dialog
                    $("#insert-image-dialog").hide();
                    $(".aui-blanket").hide();
                },
                closePreviewCallback: function () {
                    $("#insert-image-dialog").show();
                    $(".aui-blanket").show();
                }
            };

            var showPreviewerForFile = _.bind(function (file, opt) {
                this.loader = require("cp/confluence/file-preview-loader");
                var fileViewer = this.loader.setupPreviewForSingleFile([file], opt);

                fileViewer.on("fv.open", opt.openPreviewCallback);
                fileViewer.on("fv.close", opt.closePreviewCallback);

                fileViewer.open();
                fileViewer.showFileWhere();
            }, this);

            // load Preview resource
            if (!this.dfd) {
                this.dfd = WRM.require("wr!com.atlassian.confluence.plugins.confluence-previews:confluence-previews-resources", _.partial(showPreviewerForFile, file, opt));
            } else {
                this.dfd.done(_.partial(showPreviewerForFile, file, opt));
            }
        },

        _renderLoadingSpinner: function() {
            var that = this;

            var $throbber = this.$el.find(".image-preview-throbber").removeClass("hidden");
            var killSpinner = Raphael.spinner($throbber[0], 8, "#666");

            var $img = this.$el
                    .find("img")
                    .load(function () {
                        killSpinner();
                        $throbber.remove();
                        $img.removeClass("hidden");
                        that.$el.removeClass("loading");
                    });
        }

    });

    return FileItemView;
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/files/file-item/file-item-view', 'Confluence.Editor.FileDialog.FileItemView');
