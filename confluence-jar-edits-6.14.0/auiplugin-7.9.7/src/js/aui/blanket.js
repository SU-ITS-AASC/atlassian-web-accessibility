// src/js/aui/blanket.js
(typeof window === 'undefined' ? global : window).__4c4f13d92d5dcb8f12059ce701946463 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.undim = exports.dim = undefined;
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _deprecation = __921ad9514d56376fef992861d9ec0f51;
  
  var _animation = __6debdf74a4da8ac8391a98223e1bae21;
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var overflowEl;
  var _hiddenByAui = [];
  
  /**
   * Dims the screen using a blanket div
   * @param useShim deprecated, it is calculated by dim() now
   */
  function dim(useShim, zIndex) {
  
      //if we're blanketing the page it means we want to hide the whatever is under the blanket from the screen readers as well
      function hasAriaHidden(element) {
          return element.hasAttribute('aria-hidden');
      }
  
      function isAuiLayer(element) {
          return element.classList.contains('aui-layer');
      }
  
      Array.prototype.forEach.call(document.body.children, function (element) {
          if (!hasAriaHidden(element) && !isAuiLayer(element)) {
              element.setAttribute('aria-hidden', 'true');
              _hiddenByAui.push(element);
          }
      });
  
      if (!overflowEl) {
          overflowEl = document.body;
      }
  
      if (useShim === true) {
          useShimDeprecationLogger();
      }
  
      var isBlanketShowing = !!dim.$dim && dim.$dim.attr('aria-hidden') === 'false';
  
      if (!!dim.$dim) {
          dim.$dim.remove();
          dim.$dim = null;
      }
  
      dim.$dim = (0, _jquery2.default)('<div></div>').addClass('aui-blanket');
      dim.$dim.attr('tabindex', '0'); //required, or the last element's focusout event will go to the browser
      dim.$dim.appendTo(document.body);
  
      if (!isBlanketShowing) {
          //recompute after insertion and before setting aria-hidden=false to ensure we calculate a difference in
          //computed styles
          (0, _animation.recomputeStyle)(dim.$dim);
  
          dim.cachedOverflow = {
              overflow: overflowEl.style.overflow,
              overflowX: overflowEl.style.overflowX,
              overflowY: overflowEl.style.overflowY
          };
  
          overflowEl.style.overflowX = 'hidden';
          overflowEl.style.overflowY = 'hidden';
          overflowEl.style.overflow = 'hidden';
      }
  
      dim.$dim.attr('aria-hidden', 'false');
  
      if (zIndex) {
          dim.$dim.css({ zIndex: zIndex });
      }
  
      return dim.$dim;
  }
  
  /**
   * Removes semitransparent DIV
   * @see dim
   */
  function undim() {
      _hiddenByAui.forEach(function (element) {
          element.removeAttribute('aria-hidden');
      });
  
      _hiddenByAui = [];
  
      if (dim.$dim) {
          dim.$dim.attr('aria-hidden', 'true');
  
          if (overflowEl) {
              overflowEl.style.overflow = dim.cachedOverflow.overflow;
              overflowEl.style.overflowX = dim.cachedOverflow.overflowX;
              overflowEl.style.overflowY = dim.cachedOverflow.overflowY;
          }
      }
  }
  
  var useShimDeprecationLogger = (0, _deprecation.getMessageLogger)('useShim', {
      extraInfo: 'useShim has no alternative as it is now calculated by dim().'
  });
  
  (0, _globalize2.default)('dim', dim);
  (0, _globalize2.default)('undim', undim);
  
  exports.dim = dim;
  exports.undim = undim;
  
  return module.exports;
}).call(this);