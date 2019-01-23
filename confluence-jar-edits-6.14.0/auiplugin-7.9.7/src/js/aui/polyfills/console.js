// src/js/aui/polyfills/console.js
(typeof window === 'undefined' ? global : window).__b95257c5ba3aaa36d3a5493aa734a2d7 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  /**
   * AUI-2773
   *
   * The following shim for console is deprecated and to be removed in AUI 6.
   * We shouldn't be creating console.log if it doesn't exist; instead, we should avoid using it directly.
   * @start deprecated
   */
  
  if (typeof window.console === 'undefined') {
      window.console = {
          messages: [],
  
          log: function log(text) {
              this.messages.push(text);
          },
  
          show: function show() {
              alert(this.messages.join('\n'));
              this.messages = [];
          }
      };
  } else {
      // Firebug console - show not required to do anything.
      window.console.show = function () {};
  }
  
  return module.exports;
}).call(this);