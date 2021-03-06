'use strict';
/**
 * Shim to continue providing legacy UI Components properties as global vars.
 */
var Confluence = require('confluence/legacy');
Confluence.UI || (Confluence.UI = {});
Confluence.UI.Components || (Confluence.UI.Components = {});
Confluence.UI.Components.BlankPlaceholderBox || (Confluence.UI.Components.BlankPlaceholderBox = {});
Confluence.UI.Components.CQL || (Confluence.UI.Components.CQL = {});
Confluence.UI.Components.DatePicker || (Confluence.UI.Components.DatePicker = {});
Confluence.UI.Components.LabelPicker || (Confluence.UI.Components.LabelPicker = {});
Confluence.UI.Components.Pagination || (Confluence.UI.Components.Pagination = {});
