// src/js/aui/spinner.js
(typeof window === 'undefined' ? global : window).__6c1bd26c14066cf537a86a0966c2d4fc = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.SIZE = undefined;
  
  var _skatejs = __8548ccf5d6767d1d4e6633309de41309;
  
  var _skatejs2 = _interopRequireDefault(_skatejs);
  
  var _deprecation = __921ad9514d56376fef992861d9ec0f51;
  
  var _underscore = __59c1c30030f41c99b6757d449d9a3a7b;
  
  var _underscore2 = _interopRequireDefault(_underscore);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * @typedef {"small"|"medium"|"large"} SpinnerSize
   */
  
  /**
   * @typedef {Object} SpinnerSizeConfig
   * @param {SpinnerSize} name
   * @param {number} px
   * @param {number} radius
   */
  
  /**
   * @enum {SpinnerSizeConfig}
   * @readonly
   */
  var SIZE = {
      SMALL: {
          name: 'small',
          px: 20,
          radius: 9
      },
      MEDIUM: {
          name: 'medium',
          px: 30,
          radius: 13.5
      },
      LARGE: {
          name: 'large',
          px: 50,
          radius: 22.5
      }
  };
  
  var DEFAULTS = {
      filled: false,
      size: SIZE.MEDIUM.name
  };
  
  var filledAttributeReplacementText = 'Add CSS to the parent element of the <aui-spinner>.\nUse CSS flexbox or grid to vertically align it.\nSee https://css-tricks.com/centering-css-complete-guide/ for techniques.';
  
  var filledAttributeDeprecatedLogger = (0, _deprecation.getMessageLogger)('<aui-spinner> filled attribute', {
      sinceVersion: '7.9.4',
      removeInVersion: '9',
      extraInfo: filledAttributeReplacementText
  });
  
  var filledPropDeprecatedLogger = (0, _deprecation.getMessageLogger)('<aui-spinner> filled property', {
      sinceVersion: '7.9.4',
      removeInVersion: '9',
      extraInfo: filledAttributeReplacementText
  });
  
  /** @deprecated */
  function setMiddleTop(element, height) {
      var parent = element.parentNode;
      // only operate on elements, not documentFragment or comment nodes, etc.
      if (parent && parent.nodeType === 1) {
          var selfDomRect = element.getBoundingClientRect();
          var parentDomRect = parent.getBoundingClientRect();
  
          var parentMiddleTop = parentDomRect.top + parentDomRect.height / 2;
          var spinnerMiddleTop = selfDomRect.top + height / 2;
  
          element.querySelector('svg').style.top = parentMiddleTop - spinnerMiddleTop + 'px';
      }
  }
  
  /** @deprecated */
  function removeMiddleTop(element) {
      delete element.querySelector('svg').style.top;
  }
  
  function validateSize(size) {
      var result = SIZE.MEDIUM.name;
      if (typeof size === 'string') {
          size = size.toLowerCase();
          var possibleSizes = Object.keys(SIZE).map(function (key) {
              return key.toLowerCase();
          });
  
          if (possibleSizes.indexOf(size) > -1) {
              result = size;
          }
      }
  
      return result;
  }
  
  function setSize(element, size, radius) {
      var svg = element.querySelector('svg');
      var circle = element.querySelector('circle');
  
      svg.setAttribute('size', size);
      svg.setAttribute('height', size);
      svg.setAttribute('width', size);
      svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
  
      var circleSize = size / 2;
  
      circle.setAttribute('cx', circleSize);
      circle.setAttribute('cy', circleSize);
      circle.setAttribute('r', radius);
  }
  
  function refresh(element) {
      var _ref = _underscore2.default.find(SIZE, function (s) {
          return s.name === element._data.size;
      }) || SIZE.MEDIUM,
          px = _ref.px,
          radius = _ref.radius;
  
      setSize(element, px, radius);
  
      if (element._data.filled) {
          setMiddleTop(element, px);
      } else {
          removeMiddleTop(element);
      }
  }
  
  var SpinnerEl = (0, _skatejs2.default)('aui-spinner', {
      template: function template(element) {
          element.innerHTML = '<div class="aui-spinner spinner"><svg focusable="false"><circle></circle></svg></div>';
          refresh(element);
      },
      attached: function attached(element) {
          refresh(element);
      },
  
      attributes: {
          filled: {
              /** @deprecated */
              created: function created(element) {
                  filledAttributeDeprecatedLogger();
                  element._data.filled = true;
                  refresh(element);
              },
              /** @deprecated */
              removed: function removed(element) {
                  element._data.filled = false;
                  refresh(element);
              }
          },
          size: function size(element, data) {
              element._data.size = validateSize(data.newValue);
              refresh(element);
          }
      },
      prototype: {
          get _data() {
              return this.__data || (this._data = _underscore2.default.defaults({}, DEFAULTS));
          },
          set _data(data) {
              return this.__data = data;
          },
          /** @deprecated */
          set filled(isFilled) {
              filledPropDeprecatedLogger();
              !!isFilled ? this.setAttribute('filled', '') : this.removeAttribute('filled');
          },
          set size(newSize) {
              var size = validateSize(newSize);
              this.setAttribute('size', size);
          }
      }
  });
  
  exports.default = SpinnerEl;
  exports.SIZE = SIZE;
  
  return module.exports;
}).call(this);