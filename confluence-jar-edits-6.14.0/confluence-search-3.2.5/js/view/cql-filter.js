define('confluence-search/view/cql-filter', [
    'confluence-search/utils',
    'confluence-search/view/filter',
    'jquery',
    'underscore',
    'confluence/meta'
], function(
    searchUtils,
    filter,
    $,
    _,
    Meta
) {
    "use strict";

    return filter.extend({

        el: "#filter-form .aui-navgroup-inner",

        events: {
            "submit": "submit"
        },

        initialize: function () {
            this._bindMethodsToView();
            this.cqlString = this._getCqlString();

            // Add class to change the look of field heading on the search screen
            this.$el.bind('cql-field-adding', this._addNavClass);

            this.cqlComponent = this._buildCqlComponent(this.cqlString);
            this.cqlComponent.loading.done(this._loadingFinished.bind(this));
        },

        restoreState: function (state) {
            this.$el.html("");
            this.cqlComponent = this._buildCqlComponent(state.cql);
            var that = this;
            this.cqlComponent.loading.done(function () {
                that.filterEnabled = true;
            });
        },

        filter: function () {
            if (!this.filterEnabled) {
                return;
            }
            this.trigger("search");
        },

        getParams: function () {
            // Get params from list filters and any extra components
            this.cqlString = this.cqlComponent.getValue();

            var params = {
                cql: this.cqlString
            };
            if (this._getIncludeArchivedSpacesCheckbox().is(':checked'))
            {
                // Note that we don't add the parameter if it is false: false is the default value.
                params.includeArchivedSpaces = true;
            }

            return params;
        },

        _bindMethodsToView: function () {
            _.bindAll(this, 'initialize', 'render', 'selectListFilter', 'getParams', 'submit', 'filter',
                    'enableInputs', 'disableInputs', 'restoreState', 'getUserAutoCompleteHidden', 'cleanUpUser',
                    'toggleUserAutocompleteClearButton', 'clearUserAutoComplete', 'selectFirstUser');
        },

        _getCqlString: function () {
            return $('<div/>').html(Meta.get('search-cql')).text(); // decode encoded HTML
        },

        _addNavClass: function (e, fieldComponent) {
            fieldComponent.element.find('.cql-field-heading').addClass('aui-nav-heading');
        },

        _getQueryStringFromTextField: function() {
            // Get text field value from returned JSON representation of text field query
            // This field is ignored so it won't appear in the list of filters but we still want its value
            var ignoredTextField = _.filter(this.cqlComponent.getIgnoredFields(), function (fieldContainer) {
                return fieldContainer.field.fieldName === 'siteSearch';
            });
            if (ignoredTextField.length) {
                return ignoredTextField[0].values[0];
            }
        },

        _loadingFinished: function () {
            this.initialQueryString = this._getQueryStringFromTextField();
            // Set text field value to the search field on the page
            if (!this.options.searchView.getSearchFieldValue()) {
                this.options.searchView.setSearchFieldValue(this.initialQueryString);
            }
            // Set archived space checkbox
            var searchParams = searchUtils.getQueryStringParams(window.location.href);
            if (searchParams.includeArchivedSpaces === "true") {
                this._getIncludeArchivedSpacesCheckbox.prop("checked", true);
            }

            this.filterEnabled = true;
        },

        _getIncludeArchivedSpacesCheckbox: function () {
            return this.$el.find("#search-filter-include-archived");
        },

        _buildCqlComponent: function (cqlString) {
            this.filterEnabled = false;
            return require('confluence-ui-components/js/cql/cql-component').build({
                defaultFieldNames: ['contributor', 'space', 'lastmodified', 'type'],
                ignoredFields: ['text','siteSearch'],
                param: {},
                value: cqlString,
                container: this.$el,
                onChange: this.filter,
                context: {
                    environment: 'search-screen',
                    searchType: 'all'
                }
            });
        }
    });
});