define('confluence-ui-components/js/cql/internal/cql-date-expression-aggregator',
    [
        'underscore',
        'confluence-ui-components/js/cql/internal/cql-space-type-expression-converter'
    ],
    /**
     * Takes multiple cql expressions for a single date field
     * (e.g. the parsed model for "created >= 2015-06-09 and created <= 2015-06-10")
     * and wraps them in a single expression that can be passed to the date filter field.
     */
    function (_) {
        'use strict';

        function nestExpression(expression) {
            return {
                field: expression.field,
                expressions: [expression]
            };
        }

        function aggregate(expressions) {

            var aggregated = [];
            var nestedExpressions = {};

            expressions.forEach(function (expression) {
                var fieldName = expression.field.fieldName;

                if (expression.field.type !== 'date') {
                    // No-op : just copy the expression across.
                    aggregated.push(expression);
                } else {
                    if (!nestedExpressions[fieldName]) {
                        var nestedExpression = nestExpression(expression);
                        nestedExpressions[fieldName] = nestedExpression;

                        // Add to aggregated to maintain field order.
                        aggregated.push(nestedExpression);
                    } else {
                        nestedExpressions[fieldName].expressions.push(expression);
                    }
                }
            });

            return aggregated;
        }

        return {
            aggregate: aggregate
        };
    });