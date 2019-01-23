define('confluence-search/view/search', [
    'ajs',
    'backbone',
    'underscore',
    'confluence/templates',
    'confluence-search/utils',
    'confluence-search/event/dispatcher',
    'confluence-search/event/constants'
], function(
    AJS,
    Backbone,
    _,
    Templates,
    SearchUtils,
    dispatcher,
    EVENT_CONSTANTS
) {
    "use strict";

    return Backbone.View.extend({
        el: "#search-form",

        events: {
            "submit": "search",
            "click .help-button": "showHelpDialog"
        },

        initialize: function () {
            this.$spinner = this.$(".loading-spinner");
            this.$querystring = this.$("#query-string");
            this.$querystring.focus().val(this.$querystring.val());
            this.listenTo(dispatcher, EVENT_CONSTANTS.SLOW_RUNNING_SEARCH, this.showSpinner);
            this.listenTo(dispatcher, EVENT_CONSTANTS.SEARCH_FINISHED, this.hideSpinner);
        },

        getSearchFieldValue: function() {
            return this.$querystring.val();
        },

        setSearchFieldValue: function(searchValue) {
            this.$querystring.val(searchValue);
        },

        showSpinner: function() {
            this.$spinner.spin();
        },

        hideSpinner: function() {
            this.$spinner.spinStop();
        },

        search: function (e) {
            e.preventDefault();
            this.trigger("search");
        },

        getParams: function () {
            // Note - don't add any default values here, they are supported by the back end.
            return _.extend(SearchUtils.getFormParams(this.$el), {});
        },

        enableInputs: function () {
            this.$("input, button").prop("disabled", false);
        },

        disableInputs: function () {
            this.$("input, button").prop("disabled", true);
        },

        restoreState: function (state) {
            // Populate the form based on data from event.
            this.$("input").val(function (i, value) {
                return state[this.name] ? state[this.name] : "";
            });
        },

        showHelpDialog: function () {
            var dialog = new AJS.Dialog({
                id: "search-help-dialog",
                width: 800,
                height: 600,
                closeOnOutsideClick: true
            });

            dialog.addLink(AJS.I18n.getText("confluence-search.help.close"), function (dialog) {
                dialog.hide();
            });

            dialog.addHeader(AJS.I18n.getText("confluence-search.help.title"));
            dialog.addPanel(AJS.I18n.getText("confluence-search.help.general"), Templates.Help.general());
            dialog.get("panel:0");
            dialog.addPanel(AJS.I18n.getText("confluence-search.help.wildcards"), Templates.Help.wildcards());
            dialog.addPanel(AJS.I18n.getText("confluence-search.help.macros"), Templates.Help.macros());
            dialog.addPanel(AJS.I18n.getText("confluence-search.help.other"), Templates.Help.other());

            dialog.gotoPanel(0);
            dialog.show();
        }

    });
});