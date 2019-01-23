define('confluence-ui-components/js/cql/internal/cql-expression-builder',
    [
        'jquery',
        'underscore'
    ],
    /**
     * Creates CQL expression strings from key-value pairs.
     */
    function ($,
              _) {
        'use strict';

        /**
         * Wraps a string with double-quotes.
         *
         * Used when generating CQL expressions to avoid spaces and other characters leaking out of expression values into
         * the CQL string.
         *
         * @param str input
         * @returns {string} input with surrounding quotes
         */
        function wrapWithQuotes(str) {
            if (_.contains(['currentContent()', 'currentSpace()'], str)) {
                return str;  // TODO should flag function values in the UI so that they can be skipped properly.
            }
            return '"' + escapeQuotes(str) + '"';
        }

        function escapeQuotes(str) {
            // The replacement needs to have a "\" backslash present, not just an escaped double-quote.
            return str.replace(/"/g, '\\"');
        }

        function buildTextExpression(key, valuesStr) {
            var val = valuesStr.trim();
            if (!val) {
                return undefined;
            }

            return key + " ~ " + wrapWithQuotes(val);
        }

        function makeValueMap(values) {
            var map = {
                '+': [],
                '-': [],
                '': []
            };
            _.each(values, function (value) {
                var prefix = value.charAt(0);
                if (prefix === '+') {
                    map['+'].push(value.substring(1));
                } else if (prefix === '-') {
                    map['-'].push(value.substring(1));
                } else {
                    map[''].push(value);
                }
            });
            return map;
        }

        function makePlusCql(fieldName, values) {
            var expressions = _.map(values, function (value) {
                return fieldName + ' = ' + wrapWithQuotes(value);
            });
            return expressions.join(' AND ');
        }

        function makeCqlWithOperator(fieldName, values, include) {
            if (values.length === 0) {
                return '';
            }
            var wrappedValues = _.map(values, wrapWithQuotes);

            var operator;
            if (wrappedValues.length === 1) {
                operator = include ? " = " : " != ";
                return fieldName + operator + wrappedValues[0];
            }

            var wrappedValuesStr = wrappedValues.join(',');
            operator = include ? ' in ' : ' not in ';
            return fieldName + operator + "(" + wrappedValuesStr + ")";
        }

        function makeMinusCql(fieldName, values) {
            return makeCqlWithOperator(fieldName, values, false);
        }

        function makeRegularCql(fieldName, values) {
            return makeCqlWithOperator(fieldName, values, true);
        }

        function buildEqualityExpressionFromValuesArray(fieldName, values) {
            var map = makeValueMap(values);
            var cqls = [];
            var plusCql = makePlusCql(fieldName, map['+']);
            if (plusCql) {
                cqls.push(plusCql);
            }
            var regularCql = makeRegularCql(fieldName, map['']);
            if (regularCql) {
                cqls.push(regularCql);
            }
            var minusCql = makeMinusCql(fieldName, map['-']);
            if (minusCql) {
                cqls.push(minusCql);
            }

            return cqls.join(' AND ');
        }

        function buildEqualityExpressionFromValuesString(fieldName, value) {
            var val = value.trim();
            if (!val) {
                return undefined;
            }

            var values = val.split(',');
            values = _.map(values, function (value) {
                return value.trim();
            });
            return buildEqualityExpressionFromValuesArray(fieldName, values);
        }

        function buildExpression(field, valueStr) {
            if (field.type === 'equality') {
                return buildEqualityExpressionFromValuesString(field.fieldName, valueStr);
            }

            if (field.type === 'text') {
                return buildTextExpression(field.fieldName, valueStr);
            }

            throw new Error('buildExpression does not yet support type: ' + field.type);
        }

        return {
            buildExpression: buildExpression,
            buildEqualityExpressionFromValuesString: buildEqualityExpressionFromValuesString,
            buildEqualityExpressionFromValuesArray: buildEqualityExpressionFromValuesArray,
            makeValueMap: makeValueMap,
            makePlusCql: makePlusCql,
            makeMinusCql: makeMinusCql,
            makeRegularCql: makeRegularCql
        };
    });