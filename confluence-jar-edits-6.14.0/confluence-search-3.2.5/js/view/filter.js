define('confluence-search/view/filter', [
    'confluence/legacy',
    'confluence-search/utils',
    'ajs',
    'backbone',
    'underscore'
], function(
    Confluence,
    searchUtils,
    AJS,
    Backbone,
    _
) {
    "use strict";

    return Backbone.View.extend({
        el: "#filter-form",

        events: {
            "click .aui-nav a": "selectListFilter",
            "submit": "submit",
            "change #search-filter-by-space": "filter",
            "change input[type=checkbox]": "filter",
            "selected.autocomplete-user #autocomplete-user": "filter",
            "paste #autocomplete-user": "filter",
            "click .clear-button": "clearUserAutoComplete",
            "open.autocomplete-user-or-group #autocomplete-user": "selectFirstUser"
        },

        initialize: function () {
            _.bindAll(this, 'initialize', 'render', 'selectListFilter', 'getParams', 'submit', 'filter',
                    'enableInputs', 'disableInputs', 'restoreState', 'getUserAutoCompleteHidden', 'cleanUpUser',
                    'toggleUserAutocompleteClearButton', 'clearUserAutoComplete', 'selectFirstUser');
            this.$userAutoComplete = this.$("#autocomplete-user");
            this.$userAutoComplete.on("change keyup paste", this.toggleUserAutocompleteClearButton);
            this.toggleUserAutocompleteClearButton();

            // init space picker
            this.$("#search-filter-by-space").auiSelect2(Confluence.UI.Components.SpacePicker.build({
                suggestCategories: ["conf_all", "conf_favorites"]
            }));
        },

        render: function () {
            return this;
        },

        selectListFilter: function (e) {
            var $a = this.$(e.target);
            $a.parent().addClass("aui-nav-selected").siblings().removeClass("aui-nav-selected");

            this.filter();
        },

        getParams: function () {
            this.cleanUpUser();

            // get params from list filters
            var params = {};
            this.$("ul[data-key]").each(function () {
                var $this = $(this);
                var key = $this.data("key");
                var value = $this.find("li.aui-nav-selected a").data("value");

                if (key && value) {
                    params[key] = value;
                }
            });

            params = _.extend(params, searchUtils.getFormParams(this.$el));

            // workaround for IE8 placeholder polyfill. It thinks the fake placeholder value is the actual value.
            if (this.$userAutoComplete.hasClass("placeholded")) {
                delete params[this.$userAutoComplete.attr("name")];
            }

            return params;
        },

        submit: function (e) {
            e.preventDefault();
            this.filter();
        },

        filter: function () {
            this.cleanUpUser();
            this.trigger("search");
        },

        enableInputs: function () {
        },

        disableInputs: function () {
        },

        restoreState: function (state) {
            // where
            if (!state.where) { state.where = "conf_all"; }
            this.$("#search-filter-by-space").select2("val", AJS.escapeHtml(state.where));

            // archived
            this.$("#search-filter-include-archived").val([state.includeArchivedSpaces]);

            // contributor
            if (!state.contributor) { state.contributor = ""; }
            this.$userAutoComplete.val(state.contributor).change();

            if (!state.contributorUsername) { state.contributorUsername = ""; }
            this.getUserAutoCompleteHidden().val(state.contributorUsername);

            // type
            if (!state.type) { state.type = ""; }
            this.$("ul[data-key=type]").children().removeClass("aui-nav-selected");
            this.$("ul[data-key=type]").find("a[data-value=" + state.type + "]").parent().addClass("aui-nav-selected");

            // date
            if (!state.lastModified) { state.lastModified = ""; }
            this.$("ul[data-key=lastModified]").children().removeClass("aui-nav-selected");
            this.$("ul[data-key=lastModified]").find("a[data-value=" + state.lastModified + "]").parent().addClass("aui-nav-selected");

        },

        getUserAutoCompleteHidden: function () {
            return $(this.$userAutoComplete.data("target"));
        },

        // delete contributerUsername value when user-autocomplete is empty
        cleanUpUser: function () {
            var $input = this.$userAutoComplete;
            var $target = this.getUserAutoCompleteHidden();
            if (!$input.val()) {
                $target.val("");
            }
        },


        toggleUserAutocompleteClearButton: function () {
            var $clear = this.$(".clear-button");
            if (this.$userAutoComplete.val().length && !this.$userAutoComplete.hasClass("placeholded")) {
                $clear.removeClass("hidden");
            } else {
                $clear.addClass("hidden");
            }
        },

        clearUserAutoComplete: function () {
            this.$userAutoComplete.val("");
            this.toggleUserAutocompleteClearButton();
            this.filter();
        },

        /**
         * When we get notified that the user dropdown is opened we tell it to select the first item.
         */
        selectFirstUser: function () {
            AJS.dropDown.current.moveDown();
        }
    });
});