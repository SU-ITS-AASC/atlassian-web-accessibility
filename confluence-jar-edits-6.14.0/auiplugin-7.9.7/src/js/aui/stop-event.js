// src/js/aui/stop-event.js
(typeof window === 'undefined' ? global : window).__a8d5b960b1ce79629376dc694c7ea1f0 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _deprecation = __921ad9514d56376fef992861d9ec0f51;
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Prevent further handling of an event. Returns false, which you should use as the return value of your event handler:
   * return stopEvent(e);
   *
   * @param {jQuery.Event} e jQuery event
   *
   * @returns {Boolean}
   */
  function stopEvent(e) {
      e.stopPropagation();
      return false; // required for JWebUnit pop-up links to work properly
  }
  
  var stopEvent = (0, _deprecation.fn)(stopEvent, 'stopEvent', {
      alternativeName: 'preventDefault()',
      sinceVersion: '5.8.0'
  });
  
  (0, _globalize2.default)('stopEvent', stopEvent);
  
  exports.default = stopEvent;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);