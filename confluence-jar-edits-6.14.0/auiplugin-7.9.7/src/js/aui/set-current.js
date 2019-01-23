// src/js/aui/set-current.js
(typeof window === 'undefined' ? global : window).__431b66a1af03006f0f9f80a87c27d7d2 = (function () {
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
   * Shortcut function adds or removes 'current' classname to an element based on a passed boolean.
   *
   * @param {String | Element} element The element or an ID to show or hide.
   * @param {boolean} show True to add 'current' class, false to remove.
   *
   * @returns {undefined}
   */
  function setCurrent(element, current) {
      if (!(element = (0, _jquery2.default)(element))) {
          return;
      }
  
      if (current) {
          element.addClass('current');
      } else {
          element.removeClass('current');
      }
  }
  
  var setCurrent = (0, _deprecation.fn)(setCurrent, 'setCurrent', {
      sinceVersion: '5.9.0',
      extraInfo: 'No alternative will be provided. Use jQuery.addClass() / removeClass() instead.'
  });
  
  (0, _globalize2.default)('setCurrent', setCurrent);
  
  exports.default = setCurrent;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);