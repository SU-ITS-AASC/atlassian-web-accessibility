// src/js/aui/set-visible.js
(typeof window === 'undefined' ? global : window).__dffa429b520ea33a9faa1c8cd7c396da = (function () {
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
   * Shortcut function adds or removes 'hidden' classname to an element based on a passed boolean.
   *
   * @param {String | Element} element The element or an ID to show or hide.
   * @param {boolean} show true to show, false to hide.
   *
   * @returns {undefined}
   */
  function setVisible(element, show) {
      if (!(element = (0, _jquery2.default)(element))) {
          return;
      }
  
      (0, _jquery2.default)(element).each(function () {
          var isHidden = (0, _jquery2.default)(this).hasClass('hidden');
  
          if (isHidden && show) {
              (0, _jquery2.default)(this).removeClass('hidden');
          } else if (!isHidden && !show) {
              (0, _jquery2.default)(this).addClass('hidden');
          }
      });
  }
  
  var setVisible = (0, _deprecation.fn)(setVisible, 'setVisible', {
      sinceVersion: '5.9.0',
      extraInfo: 'No alternative will be provided. Use jQuery.addClass() / removeClass() instead.'
  });
  
  (0, _globalize2.default)('setVisible', setVisible);
  
  exports.default = setVisible;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);