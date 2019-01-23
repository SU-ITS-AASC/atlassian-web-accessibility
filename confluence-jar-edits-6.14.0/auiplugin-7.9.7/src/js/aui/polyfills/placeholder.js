// src/js/aui/polyfills/placeholder.js
(typeof window === 'undefined' ? global : window).__cf0b3df2c677eb2f0864bd7dbf5cb857 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _skate = __0ac9a2c09f995a9c0a478af8742f59b7;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  (function () {
      if ('placeholder' in document.createElement('input')) {
          return;
      }
  
      function applyDefaultText(input) {
          var value = String(input.value).trim();
          if (!value.length) {
              input.value = input.getAttribute('placeholder');
              (0, _jquery2.default)(input).addClass('aui-placeholder-shown');
          }
      }
  
      (0, _skate2.default)('placeholder', {
          type: _skate2.default.type.ATTRIBUTE,
          events: {
              blur: applyDefaultText,
              focus: function focus(input) {
                  if (input.value === input.getAttribute('placeholder')) {
                      input.value = '';
                      (0, _jquery2.default)(input).removeClass('aui-placeholder-shown');
                  }
              }
          },
          created: applyDefaultText
      });
  })();
  
  return module.exports;
}).call(this);