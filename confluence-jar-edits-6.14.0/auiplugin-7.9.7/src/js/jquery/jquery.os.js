// src/js/jquery/jquery.os.js
(typeof window === 'undefined' ? global : window).__be0f3ffb01e9197c7ddcba01a61a66ce = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  jQuery.os = {};
  (function () {
      var platform = navigator.platform.toLowerCase();
      jQuery.os.windows = platform.indexOf('win') != -1;
      jQuery.os.mac = platform.indexOf('mac') != -1;
      jQuery.os.linux = platform.indexOf('linux') != -1;
  })();
  
  return module.exports;
}).call(this);