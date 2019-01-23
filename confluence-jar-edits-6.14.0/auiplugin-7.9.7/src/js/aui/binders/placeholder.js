// src/js/aui/binders/placeholder.js
(typeof window === 'undefined' ? global : window).__4aa3faf3e1a039ca7e641017624fd4d6 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _binder = __0bbb661b86f4b304c81cc691259d70c9;
  
  var _binder2 = _interopRequireDefault(_binder);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  (function () {
      // browser supports placeholder, no need to do anything
      var temp = document.createElement('input');
  
      if ('placeholder' in temp) {
          return;
      }
  
      /**
       * Displays default text in the input field when its value is empty.
       * If the browser supports placeholder input attributes (HTML5), then
       * we skip this component.
       *
       * Usage:
       * <pre>
       * &lt;input placeholder='Some default text'&gt;
       * </pre>
       *
       * Events thrown: reset.placeholder
       */
      _binder2.default.register('placeholder', {
          selector: 'input[placeholder]',
          run: function run(element) {
              var $this = (0, _jquery2.default)(element);
              var applyDefaultText = function applyDefaultText() {
                  if (!_jquery2.default.trim($this.val()).length) {
                      $this.val($this.attr('placeholder')).addClass('placeholder-shown').trigger('reset.placeholder');
                  }
              };
  
              applyDefaultText();
              $this.blur(applyDefaultText).focus(function () {
                  if ($this.hasClass('placeholder-shown')) {
                      $this.val('').removeClass('placeholder-shown');
                  }
              });
          }
      });
  })();
  
  return module.exports;
}).call(this);