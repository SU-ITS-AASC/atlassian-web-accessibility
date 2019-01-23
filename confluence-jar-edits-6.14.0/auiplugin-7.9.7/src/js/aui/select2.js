// src/js/aui/select2.js
(typeof window === 'undefined' ? global : window).__7dc2a1c33ff678de05f5aa1a9414d108 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  __63e2d0d906dfc9cc19eb6e8389c4f5a3;
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Wraps a vanilla Select2 with ADG _style_, as an auiSelect2 method on jQuery objects.
   *
   * @since 5.2
   */
  
  /**
   * We make a copy of the original select2 so that later we might re-specify $.fn.auiSelect2 as $.fn.select2. That
   * way, calling code will be able to call $thing.select2() as if they were calling the original library,
   * and ADG styling will just magically happen.
   */
  var originalSelect2 = _jquery2.default.fn.select2;
  
  // AUI-specific classes
  var auiContainer = 'aui-select2-container';
  var auiDropdown = 'aui-select2-drop aui-dropdown2 aui-style-default';
  var auiHasAvatar = 'aui-has-avatar';
  
  _jquery2.default.fn.auiSelect2 = function (first) {
      var updatedArgs;
  
      if (_jquery2.default.isPlainObject(first)) {
          var auiOpts = _jquery2.default.extend({}, first);
          var auiAvatarClass = auiOpts.hasAvatar ? ' ' + auiHasAvatar : '';
          //add our classes in addition to those the caller specified
          auiOpts.containerCssClass = auiContainer + auiAvatarClass + (auiOpts.containerCssClass ? ' ' + auiOpts.containerCssClass : '');
          auiOpts.dropdownCssClass = auiDropdown + auiAvatarClass + (auiOpts.dropdownCssClass ? ' ' + auiOpts.dropdownCssClass : '');
          updatedArgs = Array.prototype.slice.call(arguments, 1);
          updatedArgs.unshift(auiOpts);
      } else if (!arguments.length) {
          updatedArgs = [{
              containerCssClass: auiContainer,
              dropdownCssClass: auiDropdown
          }];
      } else {
          updatedArgs = arguments;
      }
  
      return originalSelect2.apply(this, updatedArgs);
  };
  
  return module.exports;
}).call(this);