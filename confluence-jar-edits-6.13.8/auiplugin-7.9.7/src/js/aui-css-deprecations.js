// src/js/aui-css-deprecations.js
(typeof window === 'undefined' ? global : window).__7e864afb58ef5a3c65d95f5638a78c87 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  var _deprecation = __921ad9514d56376fef992861d9ec0f51;
  
  var _amdify = __65ca28a9d6b0f244027266ff8e6a6d1c;
  
  var _amdify2 = _interopRequireDefault(_amdify);
  
  var _deprecatedAdg2Icons = __af1a4667f2e6a7121d5ea46bdf9bd702;
  
  var _deprecatedAdg2Icons2 = _interopRequireDefault(_deprecatedAdg2Icons);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  (0, _deprecation.css)('.aui-badge', {
      displayName: 'AUI Badges class'
  });
  (0, _deprecation.css)('.aui-dropdown2-trigger.aui-style-dropdown2triggerlegacy1', {
      displayName: 'Dropdown2 legacy trigger'
  });
  (0, _deprecation.css)('.aui-message span.aui-icon', {
      displayName: 'Message icon span'
  });
  (0, _deprecation.css)('.aui-zebra', {
      displayName: 'Zebra table rows'
  });
  (0, _deprecation.css)('.aui-nav-pagination > li.aui-nav-current', {
      alternativeName: 'aui-nav-selected'
  });
  (0, _deprecation.css)('.aui-tabs.vertical-tabs', {
      displayName: 'Vertical tabs'
  });
  (0, _deprecation.css)('form.aui span.content');
  (0, _deprecation.css)(['form.aui .button', 'form.aui .buttons-container'], {
      displayName: 'Unprefixed buttons',
      alternativeName: 'aui-button and aui-buttons'
  });
  (0, _deprecation.css)(['form.aui .icon-date', 'form.aui .icon-range', 'form.aui .icon-help', 'form.aui .icon-required', 'form.aui .icon-inline-help', 'form.aui .icon-users', '.aui-icon-date', '.aui-icon-range', '.aui-icon-help', '.aui-icon-required', '.aui-icon-users', '.aui-icon-inline-help'], {
      displayName: 'Form icons'
  });
  (0, _deprecation.css)(['.aui-icon.icon-move-d', '.aui-icon.icon-move', '.aui-icon.icon-dropdown-d', '.aui-icon.icon-dropdown', '.aui-icon.icon-dropdown-active-d', '.aui-icon.icon-dropdown-active', '.aui-icon.icon-minimize-d', '.aui-icon.icon-minimize', '.aui-icon.icon-maximize-d', '.aui-icon.icon-maximize'], {
      displayName: 'Core icons'
  });
  (0, _deprecation.css)(['.aui-message.error', '.aui-message.warning', '.aui-message.hint', '.aui-message.info', '.aui-message.success'], {
      displayName: 'Unprefixed message types AUI-2150'
  });
  (0, _deprecation.css)(['.aui-dropdown2 .active', '.aui-dropdown2 .checked', '.aui-dropdown2 .disabled', '.aui-dropdown2 .interactive'], {
      displayName: 'Unprefixed dropdown2 css AUI-2150'
  });
  
  (0, _deprecation.css)(['.aui-page-header-marketing', '.aui-page-header-hero'], {
      displayName: 'Marketing style headings',
      removeVersion: '8.0.0'
  });
  
  // 5.9.0
  // -----
  
  var fiveNineZero = {
      // Inline Dialog
      'arrow': 'aui-inline-dialog-arrow',
      'contents': 'aui-inline-dialog-contents',
  
      // Messages
      'error': 'aui-message-error',
      'generic': 'aui-message-generic',
      'hint': 'aui-message-hint',
      'info': 'aui-message-info',
      'success': 'aui-message-success',
      'warning': 'aui-message-warning'
  };
  var name;
  
  for (name in fiveNineZero) {
      if (Object.hasOwnProperty.call(fiveNineZero, name)) {
          (0, _deprecation.css)(name, {
              alternativeName: fiveNineZero[name],
              removeVersion: '8.0.0',
              sinceVersion: '5.9.0'
          });
      }
  }
  
  // 6.1.0
  // -----
  
  (0, _deprecation.css)(['.aui-header-logo-atlassian', '.aui-header-logo-aui', '.aui-header-logo-bamboo', '.aui-header-logo-bitbucket', '.aui-header-logo-stash', '.aui-header-logo-clover', '.aui-header-logo-confluence', '.aui-header-logo-crowd', '.aui-header-logo-crucible', '.aui-header-logo-fecru', '.aui-header-logo-fisheye', '.aui-header-logo-hipchat', '.aui-header-logo-jira', '.aui-header-logo-jira-core', '.aui-header-logo-jira-software', '.aui-header-logo-jira-service-desk', '.aui-header-logo-answer', '.aui-header-logo-community', '.aui-header-logo-developers', '.aui-header-logo-expert', '.aui-header-logo-partner-program', '.aui-header-logo-marketplace', '.aui-header-logo-support', '.aui-header-logo-university', '.aui-header-logo-cloud'], {
      displayName: 'Atlassian Brand Logos'
  });
  
  // 7.1.0
  // -----
  
  (0, _deprecation.css)('.aui-badge', {
      displayName: 'AUI Badge CSS class',
      alternativeName: 'aui-badge',
      sinceVersion: '7.1.0',
      extraInfo: 'The badge pattern is best used as a web component instead of a CSS class'
  });
  
  // 7.5.0
  // -----
  
  (0, _deprecation.css)(['.aui-iconfont-image-extrasmall'], {
      displayName: 'Special size icon names',
      sinceVersion: '7.5.0',
      extraInfo: 'The only size variant allowed for icon names is `-small`.'
  });
  
  (0, _deprecation.css)('.aui-icon-dropdown', {
      displayName: 'AUI dropdown icon element',
      alternativeName: '.aui-icon-chevron-down',
      sinceVersion: '7.5.0',
      extraInfo: 'Use of an explicit element for the dropdown icon is part of a ' + 'deprecated markup pattern for dropdowns and should not be used. If you must ' + 'render an explicit icon element for a dropdown trigger, use the new ' + 'alternative class name.'
  });
  
  // New ADGS names for the old ADG2 icon
  _deprecatedAdg2Icons2.default.forEach(function (_ref) {
      var newName = _ref.newName,
          oldName = _ref.oldName;
      return (0, _deprecation.css)('.aui-iconfont-' + oldName, {
          displayName: 'ADG2 icon',
          alternativeName: '.aui-iconfont-' + newName,
          sinceVersion: '7.5.0',
          removeVersion: '8.0.0',
          extraInfo: 'Use the new ADGS icon CSS class name'
      });
  });
  
  // 7.8.0
  (0, _deprecation.css)('.aui-table-interactive', {
      alternativeName: '.aui-table-list',
      sinceVersion: '7.8.0',
      removeInVersion: '8.0.0',
      extraInfo: 'The "interactive" suffix caused some confusion when contrasted with sortable tables.' + 'The name has been updated to reflect its intended purpose: displaying lists of data in a tabular format.'
  });
  
  // 7.9.4
  (0, _deprecation.css)('aui-spinner[filled]', {
      sinceVersion: '7.9.4',
      removeInVersion: '9',
      extraInfo: 'Add CSS to the parent element of the <aui-spinner>.\nUse CSS flexbox or grid to vertically align it.\nSee https://css-tricks.com/centering-css-complete-guide/ for techniques.'
  });
  
  // Export the warnings
  (0, _amdify2.default)('aui/css-deprecation-warnings');
  
  return module.exports;
}).call(this);