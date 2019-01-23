/**
 * @module confluence-editor/files/file-item/file-placeholder-view
 */
define('confluence-editor/files/file-item/file-placeholder-view', [
    'backbone',
    'confluence/templates',
    'underscore',
    'ajs',
    'jquery'
], function(
    Backbone,
    Templates,
    _,
    AJS,
    $
) {
    "use strict";

    /**
     * FilePlaceHolderView is used for rendering file item place holder
     */
    var FilePlaceHolderView = Backbone.View.extend({
        model: null,// is instance of FileItemModel
        template: Templates.File.fileDialogListItemPlaceHolder,

        initialize: function (options) {
            this.model = options.model;
            this.eventListener = options.eventListener;

            this.eventListener.on("file.placeholder.process", _.bind(this._setUploadInProgress, this));
        },

        events: {
            "click .cancel" : "_cancelUpload"
        },

        render: function () {
            this.$el = $(this.template({file: this.model.attributes}));
            this.el = this.$el[0];
            this.delegateEvents();
            return this;
        },

        _setUploadInProgress: function (percentage, fileClientId) {
            var $progressBar = this.$el.find("#docs-progress-bar-" + fileClientId || "");

            if (!$progressBar.length) {
                return;
            }

            //if upload complete => hide cancel button
            if (percentage === 1) {
                this.$(".cancel").hide();
            }

            $progressBar.show();
            AJS.progressBars.update($progressBar, percentage);
        },

        _cancelUpload: function() {
            this.eventListener.trigger("uploadingfile.cancelled", this.model.get("fileId"));
        }
    });

    return FilePlaceHolderView;
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/files/file-item/file-placeholder-view', 'Confluence.Editor.FileDialog.FilePlaceHolderView');
