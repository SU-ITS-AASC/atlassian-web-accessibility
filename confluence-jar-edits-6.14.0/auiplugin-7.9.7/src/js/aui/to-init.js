// src/js/aui/to-init.js
(typeof window === 'undefined' ? global : window).__1cae1aed8bcde6374a43f4fbc85335de = (function () {
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
  
  var _log = __c1e961001275c079e48525ad3a48c8c2;
  
  var logger = _interopRequireWildcard(_log);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Adds functions to the list of methods to be run on initialisation. Wraps
   * error handling around the provided function so its failure won't prevent
   * other init functions running.
   *
   * @param {Function} func Function to be call on initialisation.
   *
   * @return {Object}
   */
  function toInit(func) {
      (0, _jquery2.default)(function () {
          try {
              func.apply(this, arguments);
          } catch (ex) {
              logger.log('Failed to run init function: ' + ex + '\n' + func.toString());
          }
      });
  
      return this;
  }
  
  (0, _globalize2.default)('toInit', toInit);
  
  exports.default = toInit;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);