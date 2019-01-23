define('confluence-ui-components/js/cql/internal/filterfields/cql-content-filter-field',
    [
        'jquery',
        'confluence-ui-components/js/page-picker',
        'confluence-ui-components/js/cql/internal/cql-expression-builder',
        'confluence-ui-components/js/cql/internal/cql-set-value-helper'
    ],
    /**
     * Provides setup and behaviour for Label CQL filter fields
     */
    function ($,
              pagePicker,
              expressionBuilder,
              setValueHelper) {
        'use strict';

        // Need to add "page:1234567" format again...
        // TODO CRA-442 - /cql/fields REST resource needs to provide entity-type, so that the UI here knows
        // whether to display a page/blog/content picker.
        function addType(id) {
            return 'page:' + id;  // TODO CRA-418 allow type information in id
        }

        function addFunctionValue(functionValue) {
            return 'content-function:' + functionValue.functionName + '()'; // NO PARAMS FOR YOU.
        }

        function addValuePrefixes(expression) {
            return expression.values.map(addType).concat(expression.functionValues.map(addFunctionValue));
        }

        function build() {

            var $input;

            return {
                setupInput: function (input) {
                    $input = input;

                    var options = {
                        // TODO - CRA-530 '=' vs 'in' ops should come from the field's "supportedOps" property.
                        multiple: this.fieldName !== 'parent',
                        suggestedContentFunctions: ['currentContent()']
                    };
                    input.auiSelect2(pagePicker.build(options));
                },

                asCqlFunc: function () {
                    var val = this.input.val().trim();
                    if (!val) {
                        return undefined;
                    }
                    // PagePicker returns values like "page:1234567,blogpost:9876543,content-function:currentContent()" so
                    // extract the ids.
                    var ids = val.replace(/[a-z\-]+:/g, '');
                    return expressionBuilder.buildEqualityExpressionFromValuesString(this.fieldName, ids);
                },

                // Visible for unit testing
                _addValuePrefixes: addValuePrefixes,

                setValues: function (expression) {
                    var withTypes = addValuePrefixes(expression);

                    return setValueHelper.setValues($input, withTypes);
                }
            };
        }

        return {
            build: build
        };
    });
