/**
 * Manages configurations used in CQL Filter fields.
 */
define('confluence-ui-components/js/cql/internal/filterfields/cql-filter-field-configs', [
    'confluence-ui-components/js/cql/internal/filterfields/cql-autocomplete-filter-field',
    'confluence-ui-components/js/cql/internal/filterfields/cql-content-filter-field',
    'confluence-ui-components/js/cql/internal/filterfields/cql-type-filter-field',
    'confluence-ui-components/js/cql/internal/filterfields/cql-date-filter-field',
    'confluence-ui-components/js/cql/internal/filterfields/cql-label-filter-field',
    'confluence-ui-components/js/cql/internal/filterfields/cql-space-filter-field',
    'confluence-ui-components/js/cql/internal/filterfields/cql-user-filter-field'
], function (
    autocompleteFilterFieldConfig,
    contentFilterFieldConfig,
    contentTypeFilterFieldConfig,
    dateFilterFieldConfig,
    labelFilterFieldConfig,
    spaceFilterFieldConfig,
    userFilterFieldConfig
) {
    'use strict';

    var configsByValueType = {
        contentId: contentFilterFieldConfig,
        contentType: contentTypeFilterFieldConfig,
        date: dateFilterFieldConfig,
        label: labelFilterFieldConfig,
        space: spaceFilterFieldConfig,
        user: userFilterFieldConfig
    };

    return {
        getConfig: function (field) {
            var uiSupport = field.uiSupport;

            if (uiSupport.dataUri) {
                return autocompleteFilterFieldConfig.build(field);
            }

            if (configsByValueType[uiSupport.valueType]) {
                return configsByValueType[uiSupport.valueType].build(field);
            }

            return {};
        }
    };
});