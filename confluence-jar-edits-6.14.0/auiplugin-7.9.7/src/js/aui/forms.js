// src/js/aui/forms.js
(typeof window === 'undefined' ? global : window).__8741535334cf9725b62821139abd6dba = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.inlineHelp = exports.enable = undefined;
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Enables the specified form element.
   *
   * @param {Element} el The element to enable.
   * @param {Boolean} b The flag setting enabled / disabled.
   *
   * @returns {jQuery}
   */
  function enable(el, b) {
      var $el = (0, _jquery2.default)(el);
  
      if (typeof b === 'undefined') {
          b = true;
      }
  
      return $el.each(function () {
          this.disabled = !b;
      });
  }
  
  /**
   * Forms: Inline Help - toggles visibility of inline help content.
   *
   * @method inlineHelp
   * @namespace AJS
   * @for AJS
   */
  function inlineHelp() {
      (0, _jquery2.default)('.icon-inline-help').click(function () {
          var $t = (0, _jquery2.default)(this).siblings('.field-help');
          if ($t.hasClass('hidden')) {
              $t.removeClass('hidden');
          } else {
              $t.addClass('hidden');
          }
      });
  }
  
  (0, _globalize2.default)('enable', enable);
  (0, _globalize2.default)('inlineHelp', inlineHelp);
  
  exports.enable = enable;
  exports.inlineHelp = inlineHelp;
  
  return module.exports;
}).call(this);