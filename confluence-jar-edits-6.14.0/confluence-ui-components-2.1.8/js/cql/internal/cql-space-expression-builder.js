define('confluence-ui-components/js/cql/internal/cql-space-expression-builder',
    [
        'jquery',
        'underscore',
        'confluence-ui-components/js/cql/internal/cql-special-spaces',
        'confluence-ui-components/js/cql/internal/cql-expression-builder'
    ],
    /**
     * Creates CQL expression strings from Space value strings.
     */
    function ($,
              _,
              specialSpaces,
              expressionBuilder) {
        'use strict';

        function buildExpressionFromValuesString(value) {
            var val = value.trim();
            if (!val) {
                return undefined;
            }

            var values = val.split(',');

            // Build arrays of "space" and "space.type" values. We could use _.intersection and .difference here but
            // we want to maintain order - so iterate manually.
            var specialKeys = specialSpaces.getKeys();
            var spaces = [];
            var spaceTypes = [];
            _.each(values, function (value) {
                if (value === 'conf_current') {
                    spaces.push('currentSpace()');
                }
                else if (_.contains(specialKeys, value)) {
                    spaceTypes.push(value);
                }
                else {
                    spaces.push(value);
                }
            });

            var expressions = [];
            if (spaceTypes.length) {
                var specialsMap = specialSpaces.getMap();
                spaceTypes = _.map(spaceTypes, function (key) {
                    return specialsMap[key];
                });
                expressions.push(expressionBuilder.buildEqualityExpressionFromValuesArray('space.type', spaceTypes));
            }
            if (spaces.length) {
                expressions.push(expressionBuilder.buildEqualityExpressionFromValuesArray('space', spaces));
            }
            // e.g. "space.type = 'global'" or "space in ('foo','bar')"
            if (expressions.length === 1) {
                return expressions[0];
            }

            // e.g. "(space.type = 'global' or space in ('foo','bar'))"
            return '(' + expressions.join(' or ') + ')';
        }

        return {
            buildExpressionFromValuesString: buildExpressionFromValuesString
        };
    });