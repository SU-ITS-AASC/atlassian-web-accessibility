// src/js/aui/prevent-default.js
(typeof window === 'undefined' ? global : window).__a584720a962e883eb5e2b13671bdda8a = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Calls e.preventDefault. This is designed for event handlers that only need to prevent the default browser
   * action, eg:
   *
   *     $(".my-class").click(AJS.preventDefault)
   *
   * @param {jQuery.Event} e jQuery event.
   *
   * @returns {undefined}
   */
  function preventDefault(e) {
    e.preventDefault();
  }
  
  (0, _globalize2.default)('preventDefault', preventDefault);
  
  exports.default = preventDefault;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);