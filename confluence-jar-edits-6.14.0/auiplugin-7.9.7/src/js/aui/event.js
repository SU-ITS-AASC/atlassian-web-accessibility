// src/js/aui/event.js
(typeof window === 'undefined' ? global : window).__51139989be9b25b15c1774d709ce985b = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.trigger = exports.unbind = exports.bind = undefined;
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _log = __c1e961001275c079e48525ad3a48c8c2;
  
  var logger = _interopRequireWildcard(_log);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Binds events to the window object. See jQuery bind documentation for more
   * details. Exceptions are caught and logged.
   */
  function bind(eventType, eventData, handler) {
      try {
          if (typeof handler === 'function') {
              return (0, _jquery2.default)(window).bind(eventType, eventData, handler);
          } else {
              return (0, _jquery2.default)(window).bind(eventType, eventData);
          }
      } catch (e) {
          logger.log('error while binding: ' + e.message);
      }
  }
  
  /**
   * Unbinds event handlers from the window object. See jQuery unbind
   * documentation for more details. Exceptions are caught and logged.
   */
  function unbind(eventType, handler) {
      try {
          return (0, _jquery2.default)(window).unbind(eventType, handler);
      } catch (e) {
          logger.log('error while unbinding: ' + e.message);
      }
  }
  
  /**
   * Triggers events on the window object. See jQuery trigger documentation for
   * more details. Exceptions are caught and logged.
   */
  function trigger(eventType, extraParameters) {
      try {
          return (0, _jquery2.default)(window).trigger(eventType, extraParameters);
      } catch (e) {
          logger.log('error while triggering: ' + e.message);
      }
  }
  
  (0, _globalize2.default)('bind', bind);
  (0, _globalize2.default)('trigger', trigger);
  (0, _globalize2.default)('unbind', unbind);
  
  exports.bind = bind;
  exports.unbind = unbind;
  exports.trigger = trigger;
  
  return module.exports;
}).call(this);