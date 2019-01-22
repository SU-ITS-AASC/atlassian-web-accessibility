/**
 * @module confluence-editor/files/file-list/file-list-view
 */
define('confluence-editor/files/file-list/file-list-view', [
    'backbone',
    'confluence-editor/files/file-item/file-item-view',
    'confluence-editor/files/file-item/file-item-model',
    'confluence-editor/files/file-item/file-placeholder-view',
    'confluence/api/constants',
    'jquery'
], function(
    Backbone,
    FileItemView,
    FileItemModel,
    FilePlaceHolderView,
    CONSTANTS,
    $
) {
    "use strict";

    var FileListView = Backbone.View.extend({
        eventListener: null,

        events: {
            "click": "_clearSelection",
            "click li.attached-file": "_clickItem",
            "dblclick li.attached-file": "_doubleClickItem"
        },

        initialize: function (options) {
            var that = this;

            this.collection = options.collection;

            if (options.eventListener) {
                this.eventListener = options.eventListener;
                this.listenTo(this.eventListener, "uploadingfile.completed", this._addUploadedFile);
                this.listenTo(this.eventListener, "uploadingfile.cancelled", this._cancelUploadingFile);
            }

            this.listenTo(this.collection, "reset", this._clearFileList);
            this.listenTo(this.collection, "add-file", this._renderNewItem);
            this.listenTo(this.collection, "remove-file", this._removeItem);
            this.listenTo(this.collection, "replace-file", this._replaceItem);
            this.listenTo(this.collection, "change:isSelect", function () {
                this.context.setSelectItems(this.collection.getAllSelectItems());
            });
            //for IE9 only
            this.listenTo(this.collection, "change:link", function (fileModel) {
                //re-render in dom, the new item will be rendered at beginning of list
                that.collection.removeFile(fileModel);
                that.collection.addFile(fileModel);
            });

            this.updateDialogContext(options.context);
            this.updatePanelContext(options.panelContext);
        },

        _addUploadedFile: function(fileClientId, fileServerId) {
            var that = this;

            var url = CONSTANTS.CONTEXT_PATH + '/rest/api/content/' + fileServerId + '?expand=version,container,space';
            var xhr = $.get(url);

            xhr.done(function(json){
                var newFileModel = new FileItemModel(json);

                var filePlaceholderModel = that.collection.get(fileClientId);
                if (!filePlaceholderModel) {
                    filePlaceholderModel = that.collection.findWhere({fileName: newFileModel.get('fileName')});
                }

                if (filePlaceholderModel) {
                    that.collection.replaceFile(filePlaceholderModel, newFileModel);
                } else {
                    that.collection.addFile(newFileModel);
                }
            });
        },

        _cancelUploadingFile: function(fileClientId) {
            var filePlaceholderModel = this.collection.get(fileClientId);
            if (filePlaceholderModel) {
                if (filePlaceholderModel.get("previousUploadedFile")) {
                    this.collection.replaceFile(filePlaceholderModel, filePlaceholderModel.get("previousUploadedFile"));
                }
                else {
                    this.collection.removeFile(filePlaceholderModel);
                }
            }
        },

        render: function () {
            return this;
        },

        resetFileList: function (files, options) {
            options = options || {};

            //clean some DOM before rendering
            this.$el.find(".loading-message").addClass("hidden");
            this.$el.find(".no-files").remove();

            this.collection.resetFiles(files);

            if (this.collection.length === 0) {
                this.$fileList.before($("<p></p>").addClass("no-files").text(this.noFileMessage));
            }

            options.shouldClearSelection && this.collection.clearSelection();

            this._checkError(options.errors);
            this.$el.sizeToFit();
        },

        _getViewFromModel: function(fileModel) {
            if (fileModel.get("isFilePlaceHolder")) {
                return new FilePlaceHolderView({
                    model: fileModel,
                    eventListener: this.eventListener
                }).render();
            }
            else {
                return new FileItemView({
                    model: fileModel,
                    showContainerInfo: this.showContainerInfo,
                    highlighter: this.highlighter,
                    eventListener: this.eventListener
                }).render();
            }
        },

        /**
         * Render a new FileItemView or FilePlaceHolderView in beginning of file list.
         * @param fileModel
         * @private
         */
        _renderNewItem: function (fileModel) {
            if (!this.$fileList || !this.$fileList.length) {
                return;
            }

            var fileItemView = this._getViewFromModel(fileModel);
            this.$fileList.prepend(fileItemView.el);

            if (!fileModel.get("isFilePlaceHolder")) {
                fileModel.set("isSelect", true);
            }
        },

        /**
         * When a file item is removed from colletion
         * @param fileModel
         * @private
         */
        _removeItem: function (fileModel) {
            if (!this.$fileList || !this.$fileList.length) {
                return;
            }

            var oldEl = this._getDomElementByFileName(fileModel.get("fileName"));
            if (oldEl) {
                oldEl.remove();
            }
        },

        _replaceItem: function (oldFileModel, newFileModel) {
            if (!this.$fileList || !this.$fileList.length) {
                return;
            }

            var newFileItemView = this._getViewFromModel(newFileModel);
            var oldEl = this._getDomElementByFileName(oldFileModel.get("fileName"));
            if (oldEl && oldEl.length) {
                oldEl.replaceWith(newFileItemView.el);
            }
            else {
                this.$fileList.prepend(newFileItemView.el);
            }

            newFileModel.set("isSelect", true);
        },

        _getDomElementByFileName: function(fileName) {
            var $el = null;
            this.$fileList.find("li").each(function() {
                var $this = $(this);
                if ($this.attr("data-file-name") === fileName) {
                    $el = $this;
                }
            });
            return $el;
        },

        /**
         * Update options: panelContext
         */
        updatePanelContext: function (panelContext) {
            if (!panelContext) {
                return;
            }

            this.panelContext = panelContext;
            this.errors = this.panelContext.errors || [];

            this.fileContainer = this.panelContext.fileContainer;

            this.$el = this.fileContainer;
            this.el = this.$el[0];
            this.$fileList = this.$el.find(".file-list");

            //bind events to DOM
            this.delegateEvents();

            //this.files = this.panelContext.files || this.panelContext.images || [];

            this.noFileMessage = this.panelContext.noFileMessage;
            this.showContainerInfo = this.panelContext.showContainerInfo;
            this.highlighter = this.panelContext.highlighter;
            this.displayErrors = this.panelContext.displayErrors;
        },

        updateDialogContext: function (context) {
            if (!context) {
                return;
            }

            this.context = context;
            this.contextOptions = this.context.options;
        },

        _checkError: function (errors) {
            errors = errors || [];

            if (errors && errors.length) {
                this.displayErrors(errors);
            }
        },

        _clearSelection: function (e) {
            var $target = e && $(e.target);

            //do not clear selection when clicking close tip message
            if ($target && $target.hasClass('close-tip')) {
                return;
            }

            this.collection.clearSelection();
            this.$el.find(".current").removeClass("current");
        },

        _clearFileList: function () {
            this.$fileList && this.$fileList.empty();
        },

        _clickItem: function (e) {
            // prevent propagation to container, which when clicked deselects
            e.stopPropagation();
            e.preventDefault();

            //if user click zoom button, do not select the whole item
            var $target = $(e.target);
            if ($target.closest(".zoom").length) {
                return;
            }

            //do not clean current class when trigger click by shortcut
            if (!e.isTrigger) {
                this.$fileList.find(".current").removeClass("current");
            }

            var $item = $target.closest("li");
            var id = $item.attr("data-attachment-id");
            var selectFileItem = this.collection.get(id);

            //do now allow click on uploading one
            if (selectFileItem &&
                    !selectFileItem.get("isFilePlaceHolder")) {
                selectFileItem.set("isSelect", !selectFileItem.get("isSelect"));
            }
        },

        _doubleClickItem: function (e) {
            var $item = $(e.target).closest("li");
            var id = $item.attr("data-attachment-id");
            var selectFileItem = this.collection.get(id);

            //do now allow double-click on uploading one
            if (selectFileItem &&
                    !selectFileItem.get("isFilePlaceHolder")) {

                $item.click();
                this.context.insert();
            }
        }
    });

    return FileListView;
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/files/file-list/file-list-view', 'Confluence.Editor.FileDialog.FileListView');
