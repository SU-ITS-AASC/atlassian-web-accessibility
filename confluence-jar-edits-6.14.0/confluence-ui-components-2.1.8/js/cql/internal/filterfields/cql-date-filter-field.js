/**
 * A picker for CQL date valueTypes that supports picking from a set list of ranges or entering one manually.
 *
 * Manually-entered date ranges can be open at either end.
 */
define('confluence-ui-components/js/cql/internal/filterfields/cql-date-filter-field', [
    'ajs',
    'underscore',
    'confluence-ui-components/js/cql/internal/cql-date-picker'
], function (
    AJS,
    _,
    DatePicker
) {
    'use strict';

    function build(field) {

        var fieldName = field.fieldName;
        var datePicker;

        function getCustomExpression() {
            var fromDate = datePicker.getFromDate();
            var toDate = datePicker.getToDate();

            var fromExpr;
            var toExpr;
            if (fromDate) {
                fromExpr = fieldName + ' >= "' + fromDate + '"';
            }
            if (toDate) {
                toExpr = fieldName + ' <= "' + toDate + '"';
            }

            if (fromExpr && toExpr) {
                return fromExpr + ' and ' + toExpr;
            }
            return fromExpr || toExpr || '';
        }

        return {
            /**
             * The incoming input is just used as an anchor for adding the Soy render and then deleted.
             */
            setupInput: function (input) {
                // Build this picker in the context of this filter field so we can add our own onChange method
                datePicker = DatePicker.build.call(this, input);
            },

            /**
             * There are four supported cases, like:
             *
             * 1. created >= now('-1w')
             * 2. created >= 2015-05-10
             * 3. created <= 2015-06-10
             * 4. created >= 2015-05-10 and created <= 2015-06-10
             *
             * The first is represented by a single nested expression with a 'now' functionValue, which is
             * populated into one of the hard-coded "relative" options such as "Last week" or "Last month".
             *
             * The second and third are also represented by single nested expressions, but with absolute
             * date values, and are loaded into the absolute date picker component at either end.
             *
             * The fourth case is represented by two nested expressions and loaded into the absolute date
             * picker in a similar way to the second and third cases.
             */
            setValues: function (expression) {
                if (!datePicker) {
                    AJS.warn("DatePicker not set yet, can't set values");
                    return;
                }

                // Date fields get wrapped expressions to support phrases like
                // created >= 2014-06-09 and created <= 2014-06-10
                var expressions = expression.expressions;
                if (expressions.length < 1 || expressions.length > 2) {
                    // This is unlikely to ever, ever happen.
                    AJS.warn("Can't set date value with expressions.length: " + expressions.length);
                    return;
                }
                if (expressions.length === 1 && expressions[0].functionValues.length === 1 &&
                    expressions[0].functionValues[0].functionName === 'now') {
                    // A relative date.
                    if (expressions[0].operator !== '>=') {
                        AJS.warn("Unsupported date picker relative date operator: " + expressions[0].operator);
                        return;
                    }
                    var relDate = expressions[0].functionValues[0].parameters[0];
                    datePicker.selectOption("now('" + relDate + "')");

                }
                else {
                    // Load the absolute date pickers.
                    _.each(expressions, function (expression) {
                        if (expression.values.length === 1) { // i.e. an absolute date
                            var dateStr = expression.values[0];
                            if (expression.operator === '>=') {
                                datePicker.setFromDate(dateStr);
                            }
                            else if (expression.operator === '<=') {
                                datePicker.setToDate(dateStr);
                            }
                        }
                    });
                }
            },

            /**
             * Similar to setValues, in the opposite direction - values in the relative options turn into
             * a 'now' function invocation, while absolute date picker values are inserted into the
             * expression RHS 'as-is'.
             */
            asCqlFunc: function () {
                if (!datePicker) {
                    AJS.warn("DatePicker not set yet, can't get CQL");
                    return;
                }

                var value = datePicker.getSelectedOption();
                if (!value) {
                    // "Any date" option selected
                    return '';
                }
                if (value === 'custom') {
                    return getCustomExpression();
                }
                return fieldName + ' >= ' + value;
            }
        };
    }

    return {
        build: build
    };
});
