// src/js/aui/is-visible.js
(typeof window === 'undefined' ? global : window).__3dba0a8df57d5c27ea6aae5ec8bcb981 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _deprecation = __921ad9514d56376fef992861d9ec0f51;
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Shortcut function to see if passed element is currently visible on screen.
   *
   * @param {String | Element} element The HTMLElement or an jQuery selector to check.
   *
   * @returns {Boolean}
   */
  function isVisible(element) {
      return !(0, _jquery2.default)(element).hasClass('hidden');
  }
  
  var isVisible = (0, _deprecation.fn)(isVisible, 'isVisible', {
      sinceVersion: '5.9.0',
      extraInfo: 'No alternative will be provided. Use jQuery.hasClass() instead.'
  });
  
  (0, _globalize2.default)('isVisible', isVisible);
  
  exports.default = isVisible;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);