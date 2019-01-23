// src/js/aui/is-clipped.js
(typeof window === 'undefined' ? global : window).__9c7e09af5e0b55833c235e1d20ff8617 = (function () {
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
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Shortcut function to see if passed element is truncated/clipped, eg. with
   * text-overflow: ellipsis.
   *
   * @param {String | Element | jQuery} element The element to check.
   *
   * @returns {Boolean}
   */
  function isClipped(el) {
    el = (0, _jquery2.default)(el);
    return el.prop('scrollWidth') > el.prop('clientWidth');
  }
  
  (0, _globalize2.default)('isClipped', isClipped);
  
  exports.default = isClipped;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);