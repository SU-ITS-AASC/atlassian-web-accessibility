/**
 * @module confluence-editor/files/external-panel/external-panel-view
 */
define('confluence-editor/files/external-panel/external-panel-view', [
    'confluence-editor/files/base-panel/base-panel-view',
    'confluence/templates',
    'jquery',
    'raphael',
    'ajs'
], function(
    BasePanel,
    Templates,
    $,
    Raphael,
    AJS
) {
    "use strict";

    var ExternalPanelView = BasePanel.extend({
        id: "external",
        panelId: "",
        cssPanel: ".web-image-panel",
        cssContainer: ".insert-web-image",
        textPanelTitle: AJS.I18n.getText("file.browser.web.image.title"),

        template: Templates.File.searchPanel,

        events: {
            "submit form": "_submit",
            "keyup input.image-url": "_checkAllowInsert",
            "click input.image-url": "_checkAllowInsert",
            "blur input.image-url": "_checkAllowInsert"
        },

        initialize: function () {
            BasePanel.prototype.initialize.call(this);

            this.context = null;
            this.token = 0;
        },

        render: function () {
            this.panelId = this.context.addPanel(this.textPanelTitle, this.getPanel(), "web-image-panel");

            //cache some DOM elements
            this.container = this.getContainer();
            this.preview = this.container.find(".image-preview-area");
            this.throbber = this.container.find(".image-preview-throbber");
            this.killSpinner = null;
            this.error = this.container.find(".image-preview-error");
        },

        focus: function() {
            this._getImageInput().focus();
            this._checkAllowInsert();
        },

        getPanel: function() {
            this.$el = $(Templates.File.webPanel());
            this.el = this.$el[0];
            this.delegateEvents();
            return this.el;
        },

        _getImageInput: function() {
            return $("input.image-url", this.context.baseElement);
        },

        _submit: function (e) {
            e.preventDefault();
            e.stopPropagation();

            var that = this;

            var src = this._getImageInput().val();
            if (src === "http://") {
                // a 'http://' src confuses image and it won't fall into the 'error' block
                // Just don't do anything - it doesn't make sense anyway
                return false;
            }
            this.token++;
            var localToken = this.token;

            this.preview.addClass("faraway").html("");
            this.throbber.removeClass("hidden");
            if (!this.killSpinner) {
                this.killSpinner = Raphael.spinner(this.throbber[0], 60, "#666");
            }
            this.error.addClass("hidden");

            $("<img>")
                .load(function () {
                    if (localToken === that.token) {
                        that.killSpinner();
                        that.killSpinner = null;
                        that.throbber.addClass("hidden");
                        that.preview.removeClass("faraway");
                        that._checkAllowInsert();
                    }
                })
                .error(function () {
                    if (localToken === that.token) {
                        that.killSpinner();
                        that.killSpinner = null;
                        that.throbber.addClass("hidden");
                        that.error.removeClass("hidden");
                        that._checkAllowInsert();
                    }
                })
                .appendTo(this.preview).attr("src", src);
        },

        _checkAllowInsert: function (/*e*/) {
            var val = this.$el.find("input.image-url").val();
            var url = (val !== "" && val !== "http://") ? val : [];
            this.context.setSelectItems(url);
        }

    });

    return ExternalPanelView;
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/files/external-panel/external-panel-view', 'Confluence.Editor.FileDialog.ExternalPanelView');
