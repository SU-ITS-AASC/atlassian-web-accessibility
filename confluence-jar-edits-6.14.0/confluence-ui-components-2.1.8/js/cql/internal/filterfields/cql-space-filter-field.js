/**
 * Provides setup and behaviour for Space CQL filter fields
 */
define('confluence-ui-components/js/cql/internal/filterfields/cql-space-filter-field', [
    'jquery',
    'confluence-ui-components/js/space-picker',
    'confluence-ui-components/js/include-exclude-picker',
    'confluence-ui-components/js/cql/internal/cql-special-spaces',
    'confluence-ui-components/js/cql/internal/cql-space-expression-adjuster',
    'confluence-ui-components/js/cql/internal/cql-space-expression-builder',
    'confluence-ui-components/js/cql/internal/cql-set-value-helper',
    'confluence-ui-components/js/cql/internal/cql-soy-templates'
], function (
    $,
    spacePicker,
    includeExcludePicker,
    specialSpaces,
    spaceExpressionAdjuster,
    spaceExpressionBuilder,
    setValueHelper,
    SoyTemplates
) {
    'use strict';

    function build() {

        var $input;

        return {
            setupInput: function (input, context) {
                $input = input;

                input.auiSelect2(includeExcludePicker.build(spacePicker.build({
                    multiple: true,
                    suggestCategories: specialSpaces.getKeys(context.environment),

                    // CRA-547 Stops space.type and space values from being mixed.
                    disableMixedSpaceTypes: true
                })));

                if (context.environment === 'search-screen') {
                    var $archivedSpacesOption = $(SoyTemplates.SpaceField().archivedSpacesOption());
                    $input.after($archivedSpacesOption);
                    this.onChange = function (callback) {
                        var $archivedSpacesOptionInput = $archivedSpacesOption.find('#search-filter-include-archived');
                        $archivedSpacesOptionInput.change(callback);
                        $input.change(callback);
                    };
                }
            },

            asCqlFunc: function () {
                // The Space picker might return "conf_X" category values - these need converting to the correct
                // CQL expression
                return spaceExpressionBuilder.buildExpressionFromValuesString(this.input.val());
            },

            setValues: function (expression) {
                // Convert functionValues (e.g. currentSpace()) into UI-friendly values
                spaceExpressionAdjuster.convertFunctionValues(expression);

                return setValueHelper.setValues($input, expression.values);
            }
        };
    }

    return {
        build: build
    };
});
