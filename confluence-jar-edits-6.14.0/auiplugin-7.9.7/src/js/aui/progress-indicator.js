// src/js/aui/progress-indicator.js
(typeof window === 'undefined' ? global : window).__6e7c4718c7a654752224497662064b97 = (function () {
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
  
  var _underscore = __59c1c30030f41c99b6757d449d9a3a7b;
  
  var _underscore2 = _interopRequireDefault(_underscore);
  
  var _skatejs = __8548ccf5d6767d1d4e6633309de41309;
  
  var _skatejs2 = _interopRequireDefault(_skatejs);
  
  var _animation = __6debdf74a4da8ac8391a98223e1bae21;
  
  var _browser = __7a2976c482edfafd9b5879a49ffe0535;
  
  var _deprecation = __921ad9514d56376fef992861d9ec0f51;
  
  var deprecate = _interopRequireWildcard(_deprecation);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var afterTransitionEvent = 'aui-progress-indicator-after-update';
  var beforeTransitionEvent = 'aui-progress-indicator-before-update';
  var transitionEnd = 'transitionend webkitTransitionEnd';
  
  function updateProgress($progressBar, $progressBarContainer, progressValue) {
      (0, _animation.recomputeStyle)($progressBar);
      $progressBar.css('width', progressValue * 100 + '%');
      $progressBarContainer.attr('data-value', progressValue);
  }
  
  function updateProgressElement(element, value) {
      if (typeof element === 'string') {
          var el = document.getElementById(element);
          if (el) {
              element = el;
          }
      }
      var $progressBarContainer = (0, _jquery2.default)(element).first();
      var $progressBar = $progressBarContainer.children('.aui-progress-indicator-value');
      var valueAttribute = $progressBarContainer.attr('data-value');
      var isIndeterminate = !valueAttribute;
      var currentProgress = parseFloat(valueAttribute) || 0;
      var isProgressNotChanged = valueAttribute && currentProgress === value;
  
      // AUI-4771 - check for mis-configured legacy progress bar HTML.
      if (isProgressNotChanged) {
          var currentDemonstratedValue = parseFloat($progressBar.get(0).style.width) || 0;
          isProgressNotChanged = currentProgress === currentDemonstratedValue * 100;
      }
  
      if (isProgressNotChanged) {
          return;
      }
  
      //if the progress bar is indeterminate switch it.
      if (isIndeterminate) {
          $progressBar.css('width', 0);
      }
  
      transitionProgress($progressBar, $progressBarContainer, { currentProgress: currentProgress, value: value });
  
      return $progressBarContainer;
  }
  
  function transitionProgress(progressBar, progressBarContainer, _ref) {
      var currentProgress = _ref.currentProgress,
          value = _ref.value;
  
      var $progressBar = (0, _jquery2.default)(progressBar);
      var $progressBarContainer = (0, _jquery2.default)(progressBarContainer);
  
      if (typeof value === 'number' && value <= 1 && value >= 0) {
          $progressBarContainer.trigger(beforeTransitionEvent, [currentProgress, value]);
  
          //trigger the event after transition end if supported, otherwise just trigger it
          if ((0, _browser.supportsCssTransition)()) {
              $progressBar.one(transitionEnd, function () {
                  $progressBarContainer.trigger(afterTransitionEvent, [currentProgress, value]);
              });
              updateProgress($progressBar, $progressBarContainer, value);
          } else {
              updateProgress($progressBar, $progressBarContainer, value);
              $progressBarContainer.trigger(afterTransitionEvent, [currentProgress, value]);
          }
      }
  }
  
  function setIndeterminateOnProgressElement(element) {
      var $progressBarContainer = (0, _jquery2.default)(element).first();
      var $progressBar = $progressBarContainer.children('.aui-progress-indicator-value');
  
      $progressBarContainer.removeAttr('data-value');
      (0, _animation.recomputeStyle)($progressBarContainer);
      $progressBar.css('width', '');
  }
  
  var DEFAULTS = {
      indeterminate: false,
      max: 1,
      val: 0
  };
  
  function validNumeric(val) {
      return _underscore2.default.isNumber(val) && _underscore2.default.isFinite(val) && !_underscore2.default.isNaN(val);
  }
  
  function parseNumeric(val) {
      var defaultVal = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  
      var num = parseFloat(val);
      return validNumeric(num) ? num : Number(defaultVal);
  }
  
  function parseDecimal(num) {
      var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  
      return Number(parseFloat(num).toFixed(precision));
  }
  
  function safeValue(val, max) {
      return Math.max(0, Math.min(val, max));
  }
  
  function safeMax(max) {
      return max > 0 ? max : DEFAULTS.max;
  }
  
  /**
   * @param data the state
   * @returns {{max: number, val: number, valAsFraction: number, valAsPercent: number}}
   */
  function calc(data) {
      var val = data.val,
          max = data.max;
  
      var parsedMax = safeMax(max);
      var parsedVal = safeValue(val, parsedMax);
      var valAsFraction = parseDecimal(parsedVal / parsedMax, 6);
      var valAsPercent = parseDecimal(valAsFraction * 100, 2);
      return { max: parsedMax, val: parsedVal, valAsFraction: valAsFraction, valAsPercent: valAsPercent };
  }
  
  function refresh(el) {
      var _calc = calc(el._data),
          val = _calc.val,
          valAsFraction = _calc.valAsFraction,
          max = _calc.max;
  
      var bar = el.querySelector('.aui-progress-indicator');
      var oldVal = bar.getAttribute('data-value');
  
      if (el.indeterminate) {
          bar.removeAttribute('aria-valuenow');
          setIndeterminateOnProgressElement(bar);
      } else {
          bar.setAttribute('aria-valuenow', val);
          bar.setAttribute('aria-valuemax', max);
          transitionProgress(bar.querySelector('.aui-progress-indicator-value'), bar, {
              currentProgress: oldVal,
              value: valAsFraction
          });
      }
  }
  
  function setValue(el, data) {
      el._data.val = parseNumeric(data.newValue, data.oldValue || DEFAULTS.val);
      refresh(el);
  }
  
  function setMax(el, data) {
      el._data.max = parseNumeric(data.newValue, data.oldValue || DEFAULTS.max);
      refresh(el);
  }
  
  (0, _skatejs2.default)('aui-progressbar', {
      template: function template(el) {
          // Ensure max is set before value upon element creation and before rendering.
          // Why is this happening in 'template' and not 'created'? Because it gets called before 'created'!
          el._data.max = parseNumeric(el.getAttribute('max'), DEFAULTS.max);
          el._data.val = parseNumeric(el.getAttribute('value'), DEFAULTS.val);
          el._data.indeterminate = el.hasAttribute('indeterminate');
  
          var _calc2 = calc(el._data),
              val = _calc2.val,
              max = _calc2.max,
              valAsFraction = _calc2.valAsFraction,
              valAsPercent = _calc2.valAsPercent;
  
          var legacyValue = el._data.indeterminate ? '' : 'data-value="' + valAsFraction + '"';
  
          el.innerHTML = '<div class="aui-progress-indicator"\n         ' + legacyValue + '\n         role="progressbar"\n         aria-valuemin="0"\n         aria-valuenow="' + val + '"\n         aria-valuemax="' + max + '"\n         tabindex="0"\n     >\n        <span class="aui-progress-indicator-value" style="width: ' + valAsPercent + '%"></span>\n    </div>';
      },
      attached: function attached(el) {
          refresh(el);
      },
  
  
      attributes: {
          indeterminate: {
              created: function created(el) {
                  el.indeterminate = true;
              },
              removed: function removed(el) {
                  el.indeterminate = false;
              }
          },
          value: {
              value: DEFAULTS.val,
              fallback: function fallback(el, data) {
                  if (el._updating) return false;
                  setValue(el, data);
              }
          },
          max: {
              value: DEFAULTS.max,
              fallback: function fallback(el, data) {
                  if (el._updating) return false;
                  setMax(el, data);
              }
          }
      },
  
      prototype: {
          get _data() {
              return this.__data || (this._data = _underscore2.default.defaults({}, DEFAULTS));
          },
          set _data(d) {
              return this.__data = d;
          },
          get indeterminate() {
              return this._data.indeterminate;
          },
          set indeterminate(val) {
              this._data.indeterminate = !!val;
              refresh(this);
          },
          get value() {
              var _calc3 = calc(this._data),
                  val = _calc3.val;
  
              return val;
          },
          set value(num) {
              if (!validNumeric(num)) return false;
              var data = { newValue: parseDecimal(num, 6) };
              this._updating = true;
              // Reflect whatever value is set in the attributes.
              this.setAttribute('value', data.newValue);
              this._updating = false;
              setValue(this, data);
          },
          get max() {
              var _calc4 = calc(this._data),
                  max = _calc4.max;
  
              return max;
          },
          set max(num) {
              if (!validNumeric(num)) return false;
              var data = { newValue: parseDecimal(num, 6) };
              this._updating = true;
              // Reflect whatever value is set in the attributes.
              this.setAttribute('max', data.newValue);
              this._updating = false;
              setMax(this, data);
          }
      }
  });
  
  var progressBars = {
      update: deprecate.fn(updateProgressElement, 'AJS.progressBars.update', {
          sinceVersion: '7.7.0',
          extraInfo: 'Use the <aui-progressbar> web component instead'
      }),
      setIndeterminate: deprecate.fn(setIndeterminateOnProgressElement, 'AJS.progressBars.setIndeterminate', {
          sinceVersion: '7.7.0',
          extraInfo: 'Use the <aui-progressbar> web component instead'
      })
  };
  
  (0, _globalize2.default)('progressBars', progressBars);
  
  exports.default = progressBars;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);