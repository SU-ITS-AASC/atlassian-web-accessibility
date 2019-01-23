// src/js/aui/spin.js
(typeof window === 'undefined' ? global : window).__7662207c0e706b4f9b15584a7f7253f9 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  __6c1bd26c14066cf537a86a0966c2d4fc;
  
  var _skate = __0ac9a2c09f995a9c0a478af8742f59b7;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  var _deprecation = __921ad9514d56376fef992861d9ec0f51;
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * @typedef {Object} jQuerySpinnerConfig
   * @property {SpinnerSize} size - the size of the spinner.
   */
  
  /**
   * @param {jQuerySpinnerConfig|String|Boolean} [firstArgs]
   * - when an object, it is a {jQuerySpinnerConfig}
   * - when a string, it represents the `size` the spinner should take.
   * - when boolean, the argument can take only FALSE, in this case, the spinner will be stopped.
   * @param {jQuerySpinnerConfig} [maybeArgs]
   * @deprecated since AUI 7.9.4. Use the `<aui-spinner>` web component directly.
   */
  _jquery2.default.fn.spin = (0, _deprecation.fn)(function spinStart(firstArgs, maybeArgs) {
      var args = { size: 'small' };
      if ((typeof maybeArgs === 'undefined' ? 'undefined' : _typeof(maybeArgs)) === 'object') {
          args = Object.assign(args, maybeArgs);
      }
      if ((typeof firstArgs === 'undefined' ? 'undefined' : _typeof(firstArgs)) === 'object') {
          args = Object.assign(args, firstArgs);
      }
      if (typeof firstArgs === 'string') {
          args.size = firstArgs;
      }
      if (typeof firstArgs === 'boolean' && firstArgs === false) {
          return this.spinStop();
      }
  
      return this.each(function () {
          if (!this || !this.nodeType) {
              return;
          }
          var $this = (0, _jquery2.default)(this);
          var data = $this.data();
          if (data) {
              var $spinnerDom = (0, _jquery2.default)('<aui-spinner filled></aui-spinner>');
              $spinnerDom.attr('size', args.size); // the web component handles validation
              $spinnerDom.css('color', args.color);
  
              $this.spinStop();
              $this.append($spinnerDom);
              // AUI-4819 - ensure web component is initialised synchronously.
              _skate2.default.init(this);
  
              data.spinner = $spinnerDom;
          }
      });
  }, 'jQuery.fn.spin', {
      sinceVersion: '7.9.4',
      removeInVersion: '9',
      alternativeName: '<aui-spinner>'
  });
  
  /**
   * @deprecated since AUI 7.9.4. Use the `<aui-spinner>` web component directly.
   */
  _jquery2.default.fn.spinStop = (0, _deprecation.fn)(function spinStop() {
      return this.each(function () {
          if (!this || !this.nodeType) {
              return;
          }
          var $this = (0, _jquery2.default)(this);
          var data = $this.data();
          if (data && data.spinner) {
              data.spinner.remove();
  
              delete data.spinner;
          }
      });
  }, 'jQuery.fn.spinStop', {
      sinceVersion: '7.9.4',
      removeInVersion: '9',
      alternativeName: '<aui-spinner>'
  });
  
  return module.exports;
}).call(this);