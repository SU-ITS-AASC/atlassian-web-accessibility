// src/js/aui/internal/select/option.js
(typeof window === 'undefined' ? global : window).__fe251e1f4080cfe4e163e9b243bb0491 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _skate = __0ac9a2c09f995a9c0a478af8742f59b7;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  var _escapeHtml = __48697fd7ae587e40e44fef53ab10460c;
  
  var _escapeHtml2 = _interopRequireDefault(_escapeHtml);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  exports.default = (0, _skate2.default)('aui-option', {
      created: function created(element) {
          Object.defineProperty(element, 'value', {
              get: function get() {
                  return element.getAttribute('value') || (0, _escapeHtml2.default)(this.textContent);
              },
              set: function set(value) {
                  element.setAttribute('value', value);
              }
          });
      },
      prototype: {
          serialize: function serialize() {
              var json = {};
              if (this.hasAttribute('img-src')) {
                  json['img-src'] = this.getAttribute('img-src');
              }
              json.value = this.value;
              json.label = (0, _escapeHtml2.default)(this.textContent);
  
              return json;
          }
      }
  });
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);