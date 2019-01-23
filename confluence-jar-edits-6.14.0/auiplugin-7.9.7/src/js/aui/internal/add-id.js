// src/js/aui/internal/add-id.js
(typeof window === 'undefined' ? global : window).__3b7b37131a17b9c12e44694d7b12c1e2 = (function () {
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
  
  var _uniqueId = __a0ab588de7b0759818853425dc8ad2f2;
  
  var _uniqueId2 = _interopRequireDefault(_uniqueId);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Apply a unique ID to the element. Preserves ID if the element already has one.
   *
   * @param {Element} el Selector to find target element.
   * @param {string} prefix Optional. String to prepend to ID instead of default AUI prefix.
   *
   * @returns {undefined}
   */
  function addId(el, prefix) {
      var element = (0, _jquery2.default)(el);
      var addprefix = prefix || false;
  
      element.each(function () {
          var $el = (0, _jquery2.default)(this);
  
          if (!$el.attr('id')) {
              $el.attr('id', (0, _uniqueId2.default)(addprefix));
          }
      });
  }
  
  (0, _globalize2.default)('_addID', addId);
  
  exports.default = addId;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);