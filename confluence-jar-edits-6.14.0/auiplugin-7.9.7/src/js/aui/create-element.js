// src/js/aui/create-element.js
(typeof window === 'undefined' ? global : window).__bc7785911e746c80e8029c2e254e3b9c = (function () {
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
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function createElement() {
      var res = null;
  
      if (arguments.length && typeof arguments[0] === 'string') {
          res = (0, _jquery2.default)(document.createElement(arguments[0]));
  
          if (arguments.length === 2) {
              res.html(arguments[1]);
          }
      }
  
      //We can't use the deprecate module or we will introduce a circular dependency
      if (typeof console !== 'undefined' && console.warn) {
          console.warn('AJS\'s create element functionality has been deprecated since 5.9.0.\nNo alternative will be provided.\nUse document.createElement() or jQuery.parseHTML(), or preferably use a templating library.');
      }
  
      return res;
  }
  
  exports.default = createElement;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);