/**
 * @module confluence-editor/files/file-dialog/file-dialog-view
 */
define('confluence-editor/files/file-dialog/file-dialog-view', [
    'backbone',
    'ajs',
    'confluence/templates',
    'underscore',
    'jquery',
    'document',
    'window'
], function(
    Backbone,
    AJS,
    Templates,
    _,
    $,
    document,
    window
) {
    "use strict";

    //declare some dependencies
    var FileDialogView = Backbone.View.extend({

        dialogId: "insert-image-dialog",
        ESC_KEY_CODE: 27,
        width: 840, //width of dialog
        height: 530, //height of dialog

        /**
         * Opens the image dialog. If the options include an imageProperties object, the image represented by the
         * properties will be edited. If not, an insert dialog is shown.
         *
         * @param options for opening the dialog, includes:
         *  - submitCallback called when the dialog form is submitted
         *  - cancelCallback called when the dialog is cancelled
         */
        initialize: function (options) {
            this.urlExternalImg = "";
            this.selectItems = [];

            this.submitCallback = options.submitCallback;
            this.cancelCallback = options.cancelCallback;
            this.beforeShowListeners = options.beforeShowListeners;
            this.panelComponents = options.panelComponents;
        },

        render: function () {
            this._createDialog();
            this.clearSelection();

            // Applies key binding to a particular image container, i.e. for fancybox navigation.
            $(document).on("keydown.insert-image", _.bind(this._onNavigationByKey, this));
            return this;
        },

        /**
         * The main task of this method is to create object dialog from JS.Dialog
         * @returns {AJS.Dialog}
         * @private
         */
        _createDialog: function () {
            var dialog = new AJS.Dialog(this.width, this.height, this.dialogId);
            var textDialogTitle = AJS.I18n.getText("file.browser.insert.title");
            var textSubmit = AJS.I18n.getText("image.browser.insert.button");

            this.dialog = dialog;

            dialog.addHeader(textDialogTitle);
            dialog.addButton(textSubmit, _.bind(this._submitDialog, this), "insert");

            // Close Button
            dialog.addCancel(AJS.I18n.getText("close.name"), _.bind(this._killDialog, this));

            this.el = dialog.popup.element;
            this.$el = $(this.el);
            this.baseElement = this.el;//alias for el
            this.$el.attr("data-tab-default", "0");

            this.$insertButton = this.$el.find(".dialog-button-panel .insert");

            // CONFDEV-12853: Add help link via prepend() instead of append() to prevent FF display issue
            $("#" + this.dialogId + " .dialog-components .dialog-title").prepend(Templates.File.helpLink());

            this.$el.find(".dialog-button-panel")
                    .append($("<div></div>").addClass("dialog-tip").html(AJS.I18n.getText("insert.image.did.you.know")));

            this._createPanels();

            // Handle pressing ESC to close dialog
            // Because AJS.popup handles ESC keys and do not fire "hide.dialog" event for AJS.Dialog,
            // so we need a another treatment for ESC to remove dialog.
            $(document).on("hideLayer", _.bind(function (e, layerType, popup) {
                if (layerType === "popup" && popup === dialog.popup) {
                    popup.remove();
                    this.teardown();
                    if (typeof this.cancelCallback === "function") {
                        this.cancelCallback();
                    }
                }
            }, this));

            AJS.bind("remove.dialog", _.bind(function(e, data) {
                if (data.dialog.id === this.dialog.id) {
                    this.teardown();
                }
            }, this));

            dialog.show();

            return dialog;
        },

        /**
         * Initialize collection of panels from "panelComponents"
         * @private
         */
        _createPanels: function () {
            var that = this;

            // Construct panels
            $.each(this.panelComponents, function () {
                if (this && typeof this.createPanel === "function") {
                    this.createPanel(that);
                }
            });

            AJS.debug(this.beforeShowListeners.length + " beforeShow listeners registered.");
            $.each(this.beforeShowListeners, function () {
                if (typeof this === "function") {
                    this();
                }
            });
        },

        teardown: function () {
            $(document).unbind(".insert-image");
            //remove some orphan tooltips
            $(".tipsy").remove();
            this.undelegateEvents();
        },

        /**
         * Close dialog when click cancel button
         * @private
         */
        _killDialog: function () {
            this.dialog.remove();
            this.clearSelection();

            if (typeof this.cancelCallback === "function") {
                this.cancelCallback();
            }
        },

        /**
         * Close dialog when click submit button
         * @private
         */
        _submitDialog: function () {
            var placeholderRequest = {
                url: this.urlExternalImg,
                // For pages and blogs this is their own pageId. For comments, pageId is the page they are on.
                // For drafts it is contentId.
                contentId: AJS.Meta.get('attachment-source-content-id'),
                selectItems: this.selectItems
            };

            this.dialog.remove();

            if (typeof this.submitCallback === "function") {
                this.submitCallback(placeholderRequest);
            }
        },

        /**
         * Add file item mode to select files collection
         * @param items if items is object, add file items to select files array.
         * if items is string, set the value to "urlExternalImg" property
         */
        setSelectItems: function (items) {
            if (typeof items === "string") {
                this.urlExternalImg = items;
                this.selectItems = [];
            } else {
                this.urlExternalImg = "";
                this.selectItems = items;
            }

            //update insert button state in UI
            var allow = this.selectItems.length > 0 || this.urlExternalImg;
            if (this.$insertButton) {
                this.$insertButton.prop("disabled", !allow);
                this.$insertButton.attr("aria-disabled", !allow);
            }
        },

        clearSelection: function () {
            this.setSelectItems([]);
        },

        /**
         * Inserts the selected content.
         */
        insert: function() {
            if (this.$insertButton &&
                    (!this.$insertButton.is(":disabled") || !this.$insertButton.attr("aria-disabled"))) {
                this.$insertButton.click();
            }
        },

        /**
         * @param title {string} panel title
         * @param reference {string} or {object} jQuery object or selector for the contents of the Panel
         * @param className {string} [optional] HTML class name
         * @param panelButtonId {string} [optional] The unique id for the panel's button.
         * @return the panel id
         */
        addPanel: function(title, reference, className, panelButtonId) {
            var nextPanelId = this.dialog.getPage(0).panel.length;
            this.dialog.addPanel(title, reference, className, panelButtonId);
            return nextPanelId;
        },

        /**
         * Selects the panel by id.
         * @param panelId
         */
        getPanel: function(panelId) {
            return this.dialog.getPanel(panelId);
        },

        /**
         * Handle navigation by arrow keys to choose/select file.
         * @param e event object
         */
        _onNavigationByKey: function (e) {
            // dialog is hidden when Preview is showing
            if ($("#" + this.dialog.id).is(":hidden")) {
                return;
            }

            var $bodyPanel = this.dialog.getCurrentPanel().body;
            var $listFiles = $bodyPanel.find(".attached-file");

            // empty item or input/select element is focusing, do nothing
            if ($listFiles.length === 0 ||
                    $(document.activeElement).is("input[type=text], select, button")){
                return;
            }

            var VK = window.tinymce.VK;

            var findNextIndex = function (currentIndex, keyCode, totalItems) {
                var keyToDelta = {};
                keyToDelta[VK.LEFT] = -1;
                keyToDelta[VK.RIGHT] = 1;
                keyToDelta[VK.UP] = -4;
                keyToDelta[VK.DOWN] = 4;

                var delta = keyToDelta[keyCode] ? keyToDelta[keyCode] : 0;
                var nextIndex = (currentIndex + delta);
                if (nextIndex < 0 || nextIndex >= totalItems ) {
                    return  currentIndex;
                }
                return nextIndex;
            };

            var moveSelection = function(keyCode) {
                var $selected;
                var $next;

                //find the current one
                $selected = $listFiles.filter(".current");

                //if no current one, find first selected one
                if (!$selected.length) {
                    $selected = $listFiles.filter(".selected");
                }

                //if no selected one, find first one
                if (!$selected.length) {
                    $next = $listFiles.first();
                } else {
                    var currentIndex = $listFiles.index($selected);
                    var nextIndex = findNextIndex(currentIndex, keyCode, $listFiles.length);
                    $next = $listFiles.eq(nextIndex);
                }

                $next.parent().find("li.attached-file.current").removeClass("current");
                $next.addClass("current");

                if ($next.length) {
                    $bodyPanel.find(".scroll-wrapper").simpleScrollTo($next);
                }

                return AJS.stopEvent(e);
            };

            switch (e.which) {
                case VK.LEFT:
                case VK.UP:
                case VK.RIGHT:
                case VK.DOWN:
                    return moveSelection(e.which);

                case VK.SPACEBAR:
                    $bodyPanel.find("li.attached-file.current").click();
                    return AJS.stopEvent(e);

                case  VK.ENTER:
                    this.insert();
                    return AJS.stopEvent(e);
            }
        }

    });

    return FileDialogView;
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/files/file-dialog/file-dialog-view', 'Confluence.Editor.FileDialog.FileDialogView');
