define('confluence-ui-components/js/cql/internal/cql-ignored-field-expression-converter',
    [],
    /**
     * CqlIgnoredFieldExpressionConverter takes in CQL expressions and returns a subset of them removing fields we wish to
     * 'ignore'
     */
    function () {
        'use strict';

        function filterExpressionByFieldName(expression, fieldNames, include) {
            if (fieldNames) {
                expression = expression.filter(function (expressionFragment) {
                    if (fieldNames.indexOf(expressionFragment.field.fieldName) > -1) {
                        return include;
                    }
                    return !include;
                });
            }
            return expression;
        }

        /**
         * Gets fields from CQL expressions by field name
         *
         * @param expression CQL expression
         * @returns a CQL expression
         */
        function getFieldsByName(expression, fieldNames) {
            return filterExpressionByFieldName(expression, fieldNames, true);
        }

        /**
         * Removes fields from CQL expressions by field name
         *
         * @param expression CQL expression
         * @returns a CQL expression
         */
        function removeFieldsByName(expression, fieldNames) {
            return filterExpressionByFieldName(expression, fieldNames, false);
        }

        return {
            removeFieldsByName: removeFieldsByName,
            getFieldsByName: getFieldsByName
        };
    });