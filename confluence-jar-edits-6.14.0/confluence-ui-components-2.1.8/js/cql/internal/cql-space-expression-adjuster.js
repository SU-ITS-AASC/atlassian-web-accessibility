define('confluence-ui-components/js/cql/internal/cql-space-expression-adjuster',
    [
        'underscore',
        'confluence-ui-components/js/cql/internal/cql-special-spaces'
    ],
    /**
     * Adjusts values in space CQL expressions for use in a CQL.FilterField.
     */
    function (_,
              specialSpaces) {
        'use strict';

        /**
         * Combines functionValues with values in a space expression.
         *
         * @param spaceExpression CQL QueryExpression to adjust
         * @returns object the updated QueryExpression
         */
        function convertFunctionValues(spaceExpression) {
            var functionValues = spaceExpression.functionValues;
            if (!functionValues || !functionValues.length) {
                return spaceExpression;  // nothing to do.
            }

            var convertedValues = [];
            _.each(functionValues, function (functionValue) {
                if (functionValue.functionName === 'currentSpace') {
                    convertedValues.push(specialSpaces.getUIValue('currentSpace()'));
                }
                else {
                    throw new Error(functionValue.functionName + ' is not a known function');
                }
            });

            // Put function values before normal ones in the UI.
            spaceExpression.values = convertedValues.concat(spaceExpression.values);
            return spaceExpression;
        }

        return {
            convertFunctionValues: convertFunctionValues
        };
    });