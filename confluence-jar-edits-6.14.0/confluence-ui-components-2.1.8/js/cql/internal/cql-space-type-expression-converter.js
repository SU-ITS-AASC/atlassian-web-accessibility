define('confluence-ui-components/js/cql/internal/cql-space-type-expression-converter',
    [
        'underscore',
        'confluence-ui-components/js/cql/internal/cql-special-spaces'
    ],
    /**
     * Converts space.type CQL expressions into space expressions for use in a CQL.FilterField.
     */
    function (_,
              specialSpaces) {
        'use strict';

        /**
         * Convert a single space.type expression into a space one.
         *
         * @param spaceTypeExpression CQL expression to convert
         * @param spaceField CQL space field definition
         * @returns object a space CQL expression
         */
        function convert(spaceTypeExpression, spaceField) {
            var resultField = _.clone(spaceField);
            var resultValues = _.map(spaceTypeExpression.values, specialSpaces.getUIValue);

            return {
                field: resultField,
                values: resultValues,
                negate: spaceTypeExpression.negate
            };
        }

        return {
            convert: convert
        };
    });