// src/js/aui/toggle-class-name.js
(typeof window === 'undefined' ? global : window).__97fd8c5dbf4d1f7c9b4a87c771da01b2 = (function () {
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
   * Shortcut function to toggle class name of an element.
   *
   * @param {String | Element} element The element or an ID to toggle class name on.
   * @param {String} className The class name to remove or add.
   *
   * @returns {undefined}
   */
  function toggleClassName(element, className) {
      if (!(element = (0, _jquery2.default)(element))) {
          return;
      }
  
      element.toggleClass(className);
  }
  
  var toggleClassName = (0, _deprecation.fn)(toggleClassName, 'toggleClassName', {
      sinceVersion: '5.8.0'
  });
  
  (0, _globalize2.default)('toggleClassName', toggleClassName);
  
  exports.default = toggleClassName;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);