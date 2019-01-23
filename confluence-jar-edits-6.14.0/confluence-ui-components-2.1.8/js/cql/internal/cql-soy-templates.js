/* eslint no-undef: 0 */
/**
 * AMD shim for CQL UI Components soy templates
 *
 * @tainted Confluence.UI.Components.CQL.Templates
 * @tainted window.Confluence.UI.Components.CQLFilters.Templates
 * @tainted window.Confluence.UI.Components.CQL.FilterSelect.Templates
 * @tainted window.Confluence.UI.Components.CQL.SpaceField.templates
 * @tainted window.Confluence.UI.Components.CQL.TypePicker.templates
 */
define('confluence-ui-components/js/cql/internal/cql-soy-templates', [
], function () {
    'use strict';
    return {
        CQL: function () {
            return Confluence.UI.Components.CQL.Templates;
        },
        Filters: function () {
            return Confluence.UI.Components.CQLFilters.Templates;
        },
        FilterSelect: function () {
            return Confluence.UI.Components.CQL.FilterSelect.Templates;
        },
        SpaceField: function () {
            return Confluence.UI.Components.CQL.SpaceField.templates;
        },
        TypePicker: function () {
            return Confluence.UI.Components.CQL.TypePicker.templates;
        }
    }
});
