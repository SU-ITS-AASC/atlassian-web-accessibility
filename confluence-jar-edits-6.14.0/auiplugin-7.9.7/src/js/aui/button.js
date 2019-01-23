// src/js/aui/button.js
(typeof window === 'undefined' ? global : window).__eaacbdad8b92ceca9114dc3be870abe7 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  var _log = __c1e961001275c079e48525ad3a48c8c2;
  
  var logger = _interopRequireWildcard(_log);
  
  var _amdify = __65ca28a9d6b0f244027266ff8e6a6d1c;
  
  var _amdify2 = _interopRequireDefault(_amdify);
  
  var _skate = __0ac9a2c09f995a9c0a478af8742f59b7;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  var _spinner = __6c1bd26c14066cf537a86a0966c2d4fc;
  
  var _spinner2 = _interopRequireDefault(_spinner);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _isBusy(button) {
      return button.hasAttribute('aria-busy') && button.getAttribute('aria-busy') === 'true';
  }
  
  function isInputNode(button) {
      return button.nodeName === 'INPUT';
  }
  
  (0, _skate2.default)('aui-button', {
      type: _skate2.default.type.CLASSNAME,
      created: function created(element) {
          element._spinner = new _spinner2.default();
          element._spinner.setAttribute('size', _spinner.SIZE.SMALL.name);
      },
      prototype: {
          /**
           * Adds a spinner to the button and hides the text
           *
           * @returns {HTMLElement}
           */
          busy: function busy() {
              if (isInputNode(this) || _isBusy(this)) {
                  logger.warn('It is not valid to call busy() on an input button.');
                  return this;
              }
  
              this.appendChild(this._spinner);
              this.setAttribute('aria-busy', true);
              this.setAttribute('busy', '');
  
              return this;
          },
  
          /**
           * Removes the spinner and shows the tick on the button
           *
           * @returns {HTMLElement}
           */
          idle: function idle() {
              if (isInputNode(this) || !_isBusy(this)) {
                  logger.warn('It is not valid to call idle() on an input button.');
                  return this;
              }
  
              this.removeChild(this._spinner);
              this.removeAttribute('aria-busy');
              this.removeAttribute('busy');
  
              return this;
          },
  
          /**
           * Removes the spinner and shows the tick on the button
           *
           * @returns {Boolean}
           */
          isBusy: function isBusy() {
              if (isInputNode(this)) {
                  logger.warn('It is not valid to call isBusy() on an input button.');
                  return false;
              }
  
              return _isBusy(this);
          }
      }
  });
  
  (0, _amdify2.default)('aui/button');
  
  return module.exports;
}).call(this);