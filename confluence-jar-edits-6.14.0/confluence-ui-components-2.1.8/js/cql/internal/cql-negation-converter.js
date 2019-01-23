define('confluence-ui-components/js/cql/internal/cql-negation-converter',
    [
        'jquery',
        'underscore'
    ],
    /**
     * CqlNegationConverter takes CQL expressions that include negation queries (!= or notin)
     * and converts them to equality (= or in) queries with the -foo notation for the cql ui
     */
    function ($, _) {
        'use strict';

        function negateValues(expression) {
            expression.values = _.map(expression.values, function (value) {
                return "-" + value;
            });
        }

        /**
         * Converts expressions with exclusion operators to -foo exclusion notation
         *
         * @param expression CQL expression
         * @returns a CQL expression
         */
        function convert(expression) {
            var newExpression = $.extend({}, expression);
            if (newExpression.field.type === "equality") {
                if (newExpression.operator === "!=") {
                    newExpression.operator = "=";
                    negateValues(newExpression);
                } else if (newExpression.operator === "notin") {
                    newExpression.operator = "in";
                    negateValues(newExpression)
                }
            }
            return newExpression;
        }

        return {
            convert: convert
        };
    });