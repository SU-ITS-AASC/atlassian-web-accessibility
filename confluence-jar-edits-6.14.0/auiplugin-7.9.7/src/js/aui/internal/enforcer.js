// src/js/aui/internal/enforcer.js
(typeof window === 'undefined' ? global : window).__2512e2cfb8f46670d5cb777690a28c72 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _log = __c1e961001275c079e48525ad3a48c8c2;
  
  var logger = _interopRequireWildcard(_log);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function enforcer(element) {
  
      function attributeExists(attributeName) {
          var errorMessage = attributeName + ' wasn\'t defined';
  
          return satisfiesRules(function () {
              return element.hasAttribute(attributeName);
          }, errorMessage);
      }
  
      function refersTo(attributeName) {
  
          if (!attributeExists(attributeName, element)) {
              return false;
          }
  
          var desiredId = element.getAttribute(attributeName);
          var errorMessage = 'an element with id set to "' + desiredId + '" was not found';
  
          return satisfiesRules(function () {
              return document.getElementById(desiredId);
          }, errorMessage);
      }
  
      function ariaControls() {
          return refersTo('aria-controls');
      }
  
      function ariaOwns() {
          return refersTo('aria-owns');
      }
  
      function satisfiesRules(predicate, message) {
          if (!predicate()) {
              if (element) {
                  logger.error(message, element);
              } else {
                  logger.error(message);
              }
              return false;
          }
          return true;
      }
  
      return {
          attributeExists: attributeExists,
          refersTo: refersTo,
          satisfiesRules: satisfiesRules,
          ariaControls: ariaControls,
          ariaOwns: ariaOwns
      };
  }
  
  exports.default = enforcer;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);