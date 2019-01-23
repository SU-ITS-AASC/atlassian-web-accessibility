/* eslint no-undef: 0 */
'use strict';
/**
 * Shim to continue providing newly-AMD-fied label picker as a global var.
 */
window.Confluence.UI.Components.LabelPicker = require('confluence-ui-components/js/label-picker');

// Warn developers that still use the shim (build is the only method on it).
AJS.deprecate.prop(window.Confluence.UI.Components.LabelPicker, 'build', {
    sinceVersion: '1.4.18',
    extraInfo: "Use require('confluence-ui-components/js/label-picker')"
});