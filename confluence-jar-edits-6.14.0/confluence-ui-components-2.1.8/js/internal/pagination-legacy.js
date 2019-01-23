/* eslint no-undef: 0 */
'use strict';
/**
 * Shim to continue providing newly-AMD-fied pagination as a global var.
 */
var _ = require('underscore');
window.Confluence.UI.Components.Pagination = _.extend(
    window.Confluence.UI.Components.Pagination,
    require('confluence-ui-components/js/pagination'));

// Warn developers that still use the shim (build is the only method on it).
require('ajs').deprecate.prop(window.Confluence.UI.Components.Pagination, 'build', {
    sinceVersion: '2.1.1',
    extraInfo: "Use require('confluence-ui-components/js/pagination')"
});
