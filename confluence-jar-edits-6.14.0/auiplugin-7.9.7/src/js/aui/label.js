// src/js/aui/label.js
(typeof window === 'undefined' ? global : window).__4686fdb214d2270ff96c190b2bd6bd2d = (function () {
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
  
  var _skatejsTemplateHtml = __c6b5725916d210b9653318d2ea2472cb;
  
  var _skatejsTemplateHtml2 = _interopRequireDefault(_skatejsTemplateHtml);
  
  var _enforcer = __2512e2cfb8f46670d5cb777690a28c72;
  
  var _enforcer2 = _interopRequireDefault(_enforcer);
  
  var _constants = __584af8690b0248d0ffcba682ccaa70ba;
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function getLabel(element) {
      return element.querySelector('label');
  }
  
  function updateLabelFor(element, change) {
      if (element.hasAttribute('for')) {
          getLabel(element).setAttribute('for', '' + change.newValue + _constants.INPUT_SUFFIX);
      } else {
          getLabel(element).removeAttribute('for');
      }
  }
  
  function updateLabelForm(element, change) {
      if (element.hasAttribute('form')) {
          getLabel(element).setAttribute('form', change.newValue);
      } else {
          getLabel(element).removeAttribute('form');
      }
  }
  
  var Label = (0, _skate2.default)('aui-label', {
      template: (0, _skatejsTemplateHtml2.default)('<label><content></content></label>'),
      created: function created(element) {
          element._label = getLabel(element); // required for quick access from test
      },
      attached: function attached(element) {
          (0, _enforcer2.default)(element).attributeExists('for');
      },
      attributes: {
          'for': updateLabelFor,
          form: updateLabelForm
      },
      prototype: {
          get disabled() {
              return this.hasAttribute('disabled');
          },
          set disabled(value) {
              if (value) {
                  this.setAttribute('disabled', '');
              } else {
                  this.removeAttribute('disabled');
              }
          }
      },
      events: {
          click: function click(element, e) {
              if (element.disabled) {
                  e.preventDefault();
              }
          }
      }
  });
  
  exports.default = Label;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);