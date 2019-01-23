define('confluence-ui-components/js/cql/internal/cql-negation-aggregator',
    [
        'underscore',
        'confluence-ui-components/js/cql/internal/cql-negation-converter'
    ],
    /**
     * Cql Negation Aggregator takes CQL expressions that include negation queries (!= or notin),
     * converts them to equality (= or in) queries with the -foo notation for the cql ui, and then
     * joins them with any existing equality queries.
     */
    function (_,
              negationConverter) {
        'use strict';

        /**
         * Aggregates expressions with exclusion operators.
         *
         * @param expressions an array of CQL expressions
         * @returns Array of CQL expressions
         */
        function aggregate(expressions) {
            // To maintain field order when creating final expression array.
            var orderedFieldNames = [];

            // Map of arrays of expressions, grouped by fieldName
            var expressionsMap = {};
            var negatedExpressionsMap = {};

            expressions.forEach(function (expression) {
                var fieldName = expression.field.fieldName;
                if (!_.contains(orderedFieldNames, fieldName)) {
                    // First time this field has been encountered - add to array and init map values.
                    orderedFieldNames.push(fieldName);
                    expressionsMap[fieldName] = [];
                    negatedExpressionsMap[fieldName] = [];
                }

                var converted = negationConverter.convert(expression);
                if (converted.operator !== expression.operator) {
                    negatedExpressionsMap[fieldName].push(converted);
                } else {
                    expressionsMap[fieldName].push(converted);
                }
            });

            // Mapping is complete; now collapse to an array.
            var result = [];
            orderedFieldNames.forEach(function (fieldName) {
                var combinedArray = combineArrays(expressionsMap[fieldName], negatedExpressionsMap[fieldName]);
                result = result.concat(combinedArray);
            });

            return result;
        }

        function combineArrays(plainExpressions, negatedExpressions) {
            if (!negatedExpressions.length) {
                return plainExpressions;
            }

            var firstExpression = plainExpressions[0];
            if (!firstExpression) {
                firstExpression = negatedExpressions[0];
                negatedExpressions = _.rest(negatedExpressions);
            }

            // Combine '-' values into the first expression.
            negatedExpressions.forEach(function (expression) {
                firstExpression.values = firstExpression.values.concat(expression.values);
            });

            if (firstExpression.operator === '=' && firstExpression.values.length > 1) {
                firstExpression.operator = 'in';
            }

            return [firstExpression].concat(_.rest(plainExpressions));
        }

        return {
            aggregate: aggregate
        };
    });