// src/js/aui/unique-id.js
(typeof window === 'undefined' ? global : window).__a0ab588de7b0759818853425dc8ad2f2 = (function () {
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
  
  var uniqueID;
  var uniqueIDstring;
  var uniqueIDcounter = 0;
  
  /**
   * Generate a unique ID string, checking the ID is not present in the DOM before
   * returning. Note uniqueID, uniqueIDstring, uniqueIDcounter = 0; set at top of
   * file.
   *
   * @param {String} prefix String to prepend to ID instead of default AUI prefix.
   *
   * @returns {String}
   */
  function generateUniqueId(prefix) {
      uniqueID = uniqueIDcounter++ + '';
      uniqueIDstring = prefix ? prefix + uniqueID : 'aui-uid-' + uniqueID;
  
      if (!document.getElementById(uniqueIDstring)) {
          return uniqueIDstring;
      } else {
          uniqueIDstring = uniqueIDstring + '-' + new Date().getTime();
  
          if (!document.getElementById(uniqueIDstring)) {
              return uniqueIDstring;
          } else {
              throw new Error('Timestamped fallback ID "' + uniqueIDstring + '" exists.');
          }
      }
  }
  
  (0, _globalize2.default)('id', generateUniqueId);
  
  exports.default = generateUniqueId;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);