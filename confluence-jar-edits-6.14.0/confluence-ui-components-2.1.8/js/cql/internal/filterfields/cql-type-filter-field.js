/**
 * Provides setup and behaviour for CQL 'Type' filter fields.
 *
 * When presented in different contexts (e.g. in Search screen vs in Macro Browser form for 'Content by Label' macro)
 * this filter may provide suggestions and have limited types available.
 */
define('confluence-ui-components/js/cql/internal/filterfields/cql-type-filter-field', [
    'confluence/dark-features',
    'confluence-ui-components/js/cql/internal/cql-type-picker',
    'confluence-ui-components/js/cql/internal/filterfields/cql-type-suggestions'
], function (
    DarkFeatures,
    TypePicker,
    Suggestions
) {
    'use strict';

    function build(field) {

        var picker;

        return {
            setupInput: function (input, context) {

                var suggestedTypes = [];
                var contentTypesOnly = true;

                if ((context.environment === 'search-screen' && context.searchType === 'all')
                    || DarkFeatures.isEnabled('cql.force.full.search.mode')) {
                    // These suggested types will be displayed as the Search screen is rendered, so they need to NOT
                    // come from an AJAX call. Also, the current contenttypes REST call needs to have its results filtered
                    // to include the values from the picklist (i.e. when typing 'Peo' in the search screen picker, the
                    // 'People' option should appear.
                    suggestedTypes = Suggestions.getList();
                    contentTypesOnly = false;
                }

                picker = TypePicker.build(suggestedTypes, contentTypesOnly);
                picker.setupInput(input);
            },

            setValues: function (expression) {
                return picker.setValues(expression.values);
            }
        };
    }

    return {
        build: build
    };
});
