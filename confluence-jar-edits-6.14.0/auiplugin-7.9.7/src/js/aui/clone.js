// src/js/aui/clone.js
(typeof window === 'undefined' ? global : window).__e7d0e8462b4386c30e9bcd3ad0a49ad3 = (function () {
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
   * Clones the element specified by the selector and removes the id attribute.
   *
   * @param {String} selector A jQuery selector
   */
  function clone(selector) {
    return (0, _jquery2.default)(selector).clone().removeAttr('id');
  }
  
  (0, _globalize2.default)('clone', clone);
  
  exports.default = clone;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);