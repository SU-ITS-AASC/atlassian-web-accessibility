define('confluence-ui-components/js/cql/internal/filterfields/cql-label-filter-field',
    [
        'jquery',
        'ajs',
        'confluence-ui-components/js/label-picker',
        'confluence-ui-components/js/include-exclude-picker',
        'confluence-ui-components/js/cql/internal/cql-set-value-helper'
    ],
    /**
     * Provides setup and behaviour for Label CQL filter fields
     */
    function ($,
              AJS,
              labelPicker,
              includeExcludePicker,
              setValueHelper) {

        'use strict';

        function build() {

            var $input;

            return {
                setupInput: function (input) {
                    $input = input;

                    input.auiSelect2(includeExcludePicker.build(labelPicker.build({
                        noMatches: AJS.I18n.getText('confluence-ui-components.label-picker.no-matches')
                    })));
                },

                setValues: function (clause) {
                    return setValueHelper.setValues($input, clause.values);
                }
            };
        }

        return {
            build: build
        };
    });