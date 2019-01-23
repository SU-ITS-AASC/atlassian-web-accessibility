define('confluence-ui-components/js/cql/internal/cql-space-expression-aggregator',
    [
        'underscore',
        'confluence-ui-components/js/cql/internal/cql-space-type-expression-converter'
    ],
    /**
     * SpaceExpressionAggregator takes CQL expressions that may include space.type and space expressions, and aggregates
     * those expressions into a single space expression for use in a CQL.FilterField.
     */
    function (_,
              spaceTypeExpressionConverter) {
        'use strict';

        /**
         * Clauses with field "space.type" need turning into "space" expressions; this means combining with any existing
         * "space" expressions.
         *
         * @param expressions array of CQL expressions to aggregate
         * @param spaceField CQL space field definition, required when creating space expressions
         * @returns array of aggregated CQL expressions
         */
        function aggregate(expressions, spaceField) {

            var spaceTypeExpressions = _.filter(expressions, function (expression) {
                return expression.field.fieldName === 'space.type';
            });

            if (spaceTypeExpressions.length === 0) {
                // Nothing to aggregate, return.
                return expressions;
            }

            if (spaceTypeExpressions.length > 1) {
                throw Error("Only a single space.type expression is supported.");
            }

            var convertedExpression = spaceTypeExpressionConverter.convert(spaceTypeExpressions[0], spaceField);

            var spaceExpressions = _.filter(expressions, function (expression) {
                return expression.field.fieldName === 'space';
            });
            expressions = _.difference(expressions, spaceTypeExpressions);


            if (spaceExpressions.length) {
                // Combine the space type expression with the first space
                spaceExpressions[0] = combineSpaceExpressions(spaceExpressions[0], convertedExpression);
            } else {
                expressions.push(convertedExpression);
            }

            return expressions;
        }

        /**
         * Combines the values of a second expression into the values of a first one.
         *
         * It is assumed that the expressions need connecting with "OR"s and not with "AND"s.
         *
         * @returns a combined space CQL expression
         */
        function combineSpaceExpressions(expression1, expression2) {
            // TODO - could test for matching fieldNames...
            expression1.values = expression1.values.concat(expression2.values);
            return expression1;
        }

        return {
            aggregate: aggregate,
            combineSpaceExpressions: combineSpaceExpressions
        };
    });