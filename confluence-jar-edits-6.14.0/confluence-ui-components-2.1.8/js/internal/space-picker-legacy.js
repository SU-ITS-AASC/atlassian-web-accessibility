/* eslint no-undef: 0 */
'use strict';
/**
 * Shim to continue providing newly-AMD-fied space picker as a global var.
 */
window.Confluence.UI.Components.SpacePicker = require('confluence-ui-components/js/space-picker');

// Warn developers that still use the shim (build is the only method on it).
require('ajs').deprecate.prop(window.Confluence.UI.Components.SpacePicker, 'build', {
    sinceVersion: '1.4.22',
    extraInfo: "Use require('confluence-ui-components/js/space-picker')"
});
