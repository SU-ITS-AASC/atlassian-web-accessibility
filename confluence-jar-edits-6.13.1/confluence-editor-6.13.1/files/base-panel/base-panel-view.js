/**
 * @module confluence-editor/files/base-panel/base-panel-view
 */
define('confluence-editor/files/base-panel/base-panel-view', [
    'backbone',
    'ajs',
    'jquery'
], function(
    Backbone,
    AJS,
    $
) {
    "use strict";

    /**
     * This is abstract class.
     * It contains some general properties & methods
     */
    var BasePanel = Backbone.View.extend({
        context:  null,
        cssContainer: "",
        cssPanel: "",

        textErrorSearch: AJS.I18n.getText("image.browser.error.search"),
        textErrorRetrieving: AJS.I18n.getText("image.browser.error.retrieving.attachments"),
        textDefaultErrorMessage: AJS.I18n.getText("image.browser.upload.error"),
        textUploading: AJS.I18n.getText("image.browser.upload.image.uploading"),

        initialize: function () {
        },

        createPanel: function (context) {
            this.context = context;
            this.render();

            var that = this;
            var panel = this.context.getPanel(this.panelId);

            if (panel) {
                panel.onselect = function() {
                    that.context.clearSelection();
                    that.focus && that.focus();
                };
            }
        },

        /**
         * render method will be overrode in sub view
         * @returns {BasePanel}
         */
        render: function () {
            return this;
        },

        getPanelElement: function() {
            return $(this.cssPanel, this.context.baseElement);
        },

        getContainer: function() {
            return $(this.cssContainer);
        },

        getForm: function() {
            return $("form", this.getPanelElement());
        },

        clearContainer: function() {
            var container = this.getContainer();
            container.find(".loading-message").removeClass("hidden");
            container.find(".warning").addClass("hidden");
        },

        clearErrors: function() {
            this.messenger.clearMessages();
        },

        displayErrors: function(message) {
            this.uploader.displayErrors(message);
            this.getContainer().sizeToFit();
        },

        /**
         * Exposed methods to use in other module, such as Drag-Drop
         * @returns {jQuery Object}
         */
        getNoFileContainer: function () {
            return this.getPanelElement().find(".no-files");
        },

        /**
         * Exposed methods to use in other module, such as Drag-Drop
         * @returns {jQuery Object}
         */
        getFileListContainer: function () {
            return this.getPanelElement().find("ul.file-list");
        }
    });

    return BasePanel;
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/files/base-panel/base-panel-view', 'Confluence.Editor.FileDialog.BasePanel', function(BasePanel) {
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Confluence = require('confluence/legacy');

    Confluence.Editor.FileDialog.eventListener = _.extend({}, Backbone.Events);
});


