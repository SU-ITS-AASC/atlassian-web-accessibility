// src/js/aui/internal/browser.js
(typeof window === 'undefined' ? global : window).__7a2976c482edfafd9b5879a49ffe0535 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.needsLayeringShim = needsLayeringShim;
  exports.supportsCalc = supportsCalc;
  exports.supportsRequestAnimationFrame = supportsRequestAnimationFrame;
  exports.supportsCssTransition = supportsCssTransition;
  exports.supportsVoiceOver = supportsVoiceOver;
  exports.supportsDateField = supportsDateField;
  exports.supportsNewMouseEvent = supportsNewMouseEvent;
  var ua = navigator.userAgent.toLowerCase();
  var isIE = /msie/.test(ua);
  var isWinXP = /windows nt 5.1/.test(ua);
  var isWinVista = /windows nt 6.0/.test(ua);
  var isWin7 = /windows nt 6.1/.test(ua);
  var isMacOSX = /mac os x/.test(ua);
  var doesSupportCalc;
  var doesSupportCssTransition;
  var doesSupportHtml5DateInput;
  
  /**
   * Layered elements can get obscured by <object>, <embed>, <select> or sometimes even <iframe>
   * on older versions of Windows + Internet Explorer.
   * From manual testing, all IE versions on Windows 7 appear to have the bug,
   * but no IE versions on Windows 8 have it.
   */
  function needsLayeringShim() {
      return isIE && (isWinXP || isWinVista || isWin7);
  }
  
  function supportsCalc() {
      if (typeof doesSupportCalc === 'undefined') {
          var d = document.createElement('div');
          d.style.cssText = 'height: -webkit-calc(20px + 0); height: calc(20px);';
          // browsers will cull the rules they don't understand, so we can check whether
          // any were added at all to confirm presence of the calc() behaviour.
          doesSupportCalc = d.style.cssText.length > 0;
      }
      return doesSupportCalc;
  }
  
  function supportsRequestAnimationFrame() {
      return !!window.requestAnimationFrame;
  }
  
  function supportsCssTransition() {
      if (typeof doesSupportCssTransition === 'undefined') {
          var documentBody = document.body || document.documentElement;
          var style = documentBody.style;
          doesSupportCssTransition = typeof style.transition === 'string' || typeof style.WebkitTransition === 'string';
      }
      return doesSupportCssTransition;
  }
  
  function supportsVoiceOver() {
      return isMacOSX;
  }
  
  function supportsDateField() {
      if (typeof doesSupportHtml5DateInput === 'undefined') {
          var el = document.createElement('input');
          el.setAttribute('type', 'date');
          doesSupportHtml5DateInput = el.type === 'date';
      }
      return doesSupportHtml5DateInput;
  }
  
  // This is supported everywhere except Chrome 22, but we needed to support this use case due to
  // https://bitbucket.org/atlassian/aui/pull-requests/1920/aui-4380-fix-shortcut-not-work-in-old/diff .
  function supportsNewMouseEvent() {
      try {
          new MouseEvent('click');
      } catch (e) {
          return false;
      }
  
      return true;
  }
  
  return module.exports;
}).call(this);