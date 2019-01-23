/* eslint no-undef: 0 */
/**
 * AMD shim for UI components soy templates.
 * @tainted Confluence.UI.Components.BlankPlaceholderBox.Templates
 * @tainted Confluence.UI.Components.DatePicker.templates
 * @tainted Confluence.UI.Components.LabelPicker.templates
 * @tainted Confluence.UI.Components.Pagination.Templates
 * @tainted Confluence.UI.Components.templates
 * @tainted Confluence.UI.Components.UserGroupSelect2
 */
define('confluence-ui-components/js/internal/soy-templates', [
], function () {
    return {
        BlankPlaceholderBox: function () {
            return Confluence.UI.Components.BlankPlaceholderBox.Templates;
        },
        DatePicker: function () {
            return Confluence.UI.Components.DatePicker.templates;
        },
        LabelPicker: function () {
            return Confluence.UI.Components.LabelPicker.templates;
        },
        Pagination: function () {
            return Confluence.UI.Components.Pagination.Templates;
        },
        Components: function () {
            return Confluence.UI.Components.templates;
        },
        UserGroupSelect2: function () {
            return Confluence.UI.Components.UserGroupSelect2;
        }
    }
});