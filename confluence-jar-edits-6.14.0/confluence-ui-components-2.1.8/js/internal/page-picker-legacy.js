/* eslint no-undef: 0 */
'use strict';
/**
 * Shim to continue providing newly-AMD-fied space picker as a global var.
 */
window.Confluence.UI.Components.PagePicker = require('confluence-ui-components/js/page-picker');

// Warn developers that still use the shim.
AJS.deprecate.prop(window.Confluence.UI.Components.PagePicker, 'build', {
    sinceVersion: '1.4.34',
    extraInfo: "Use require('confluence-ui-components/js/page-picker')"
});
