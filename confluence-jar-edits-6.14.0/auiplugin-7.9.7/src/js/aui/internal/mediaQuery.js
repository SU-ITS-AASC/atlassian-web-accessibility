// src/js/aui/internal/mediaQuery.js
(typeof window === 'undefined' ? global : window).__682859fc5d8be5d41dbacb89678092a4 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  /**
   * Inspired by matchMedia() polyfill
   * https://github.com/paulirish/matchMedia.js/blob/953faa1489284655ed9d6e03bf48d39df70612c4/matchMedia.js
   */
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.default = mediaQuery;
  function mediaQuery(mq) {
      if (window.matchMedia) {
          return window.matchMedia(mq).matches;
      }
  
      // fallback support for <=IE9 (remove this code if we don't want to support IE9 anymore)
      var style = document.createElement('style');
      style.type = 'text/css';
      style.id = 'testMedia';
      style.innerText = '@media ' + mq + ' { #testMedia { width: 1px; } }';
      document.head.appendChild(style);
      var info = window.getComputedStyle(style, null);
      var testMediaQuery = info.width === '1px';
      style.parentNode.removeChild(style);
      return testMediaQuery;
  };
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);