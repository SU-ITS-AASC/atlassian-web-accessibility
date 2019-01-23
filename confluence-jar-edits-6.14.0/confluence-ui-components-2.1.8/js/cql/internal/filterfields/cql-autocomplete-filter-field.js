define('confluence-ui-components/js/cql/internal/filterfields/cql-autocomplete-filter-field',
    [
        'jquery',
        'ajs',
        'confluence-ui-components/js/cql/internal/cql-expression-builder',
        'confluence-ui-components/js/cql/internal/cql-set-value-helper'
    ],
    /**
     * Provides setup and behaviour for Autocomplete CQL filter fields that specify a data-uri.
     */
    function ($,
              AJS,
              expressionBuilder,
              setValueHelper) {
        'use strict';

        function processResponseData(data) {

            var suggested = data.suggestedResults;
            var found = data.searchResults;

            if (!suggested.length) {
                return found;  // if found is empty too, so be it.
            }
            if (!found.length) {
                return suggested;
            }

            return [{
                text: AJS.I18n.getText('confluence-ui-components.autocomplete-field.suggested-results'),
                children: suggested
            }, {
                text: AJS.I18n.getText('confluence-ui-components.autocomplete-field.search-results'),
                children: found
            }];
        }

        function ajaxData(query) {
            return {
                query: query,
                searchContext: JSON.stringify({
                    spaceKey: AJS.Meta.get('space-key'),
                    contentId: AJS.Meta.get('content-id')
                })
            };
        }

        var select2Opts = {
            placeholder: AJS.I18n.getText('confluence-ui-components.autocomplete-field.placeholder'),

            multiple: true,
            tokenSeparators: [' ', ','],

            // Always allow the option of adding a new choice.
            createSearchChoice: function (term) {
                if (!term) {
                    return null;
                }

                return {
                    id: term,
                    text: "New result: " + term,
                    isNew: true
                };
            },
            // TODO CRA-641 : this setting will only work when the AUI upgrade is complete. dT
            createSearchChoicePosition: 'bottom',

            ajax: {
                data: ajaxData,
                results: function (data) {
                    return {
                        results: processResponseData(data)
                    };
                },
                quietMillis: 300
            },

            // Required so that val() can be called on the select2 element. This simple implementation just uses the same
            // string for the id and text used for each value being set.
            initSelection: function (element, callback) {
                var labels = element.val().split(',');
                var data = labels.map(function (label) {
                    return {id: label, text: label};
                });
                callback(data);
            }
        };

        function isAbsoluteUri(uri) {
            return uri.indexOf('http://') === 0 ||
                uri.indexOf('https://') === 0;
        }

        function getUrl(dataUri) {
            if (isAbsoluteUri(dataUri)) {
                return dataUri;
            } else {
                return AJS.contextPath() + dataUri;
            }
        }

        function build(field) {

            var $input;

            return {

                setupInput: function (input) {
                    $input = input;

                    var ajax = $.extend({}, select2Opts.ajax, {
                        url: getUrl(field.uiSupport.dataUri)
                    });
                    var opts = $.extend({}, select2Opts, {
                        ajax: ajax
                    });  // TODO - any neater ways of doing this "deep" override? dT

                    input.auiSelect2(opts);
                },

                asCqlFunc: function () {
                    var val = this.input.val().trim();
                    if (!val) {
                        return undefined;
                    }
                    return expressionBuilder.buildEqualityExpressionFromValuesString(this.fieldName, val);
                },

                setValues: function (expression) {
                    return setValueHelper.setValues($input, expression.values);
                }
            };
        }

        return {
            build: build,

            // Exposed for unit-testing
            _getUrl: getUrl,
            _ajaxData: ajaxData
        };
    });
