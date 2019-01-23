// src/js/aui/template.js
(typeof window === 'undefined' ? global : window).__43d4585c6a21591b4ceac1b326c09405 = (function () {
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
  
  var _escapeHtml = __48697fd7ae587e40e44fef53ab10460c;
  
  var _escapeHtml2 = _interopRequireDefault(_escapeHtml);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Creates an object with methods for template support.
   *
   * See <a href="http://confluence.atlassian.com/display/AUI/AJS.template">CAC Documentation</a>.
   *
   * @constructor
   * @class template
   * @namespace AJS
   */
  var template = function ($) {
      var tokenRegex = /\{([^\}]+)\}/g; // matches "{xxxxx}"
      var objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g; // matches ".xxxxx" or "["xxxxx"]" to run over object properties
  
      // internal function
      // parses "{xxxxx}" and returns actual value from the given object that matches the expression
      var replacer = function replacer(all, key, obj, isHTML) {
          var res = obj;
          key.replace(objNotationRegex, function (all, name, quote, quotedName, isFunc) {
              name = name || quotedName;
              if (res) {
                  if (name + ':html' in res) {
                      res = res[name + ':html'];
                      isHTML = true;
                  } else if (name in res) {
                      res = res[name];
                  }
                  if (isFunc && typeof res === 'function') {
                      res = res();
                  }
              }
          });
  
          // if not found restore original value
          if (res == null || res === obj) {
              res = all;
          }
  
          res = String(res);
  
          if (!isHTML) {
              res = T.escape(res);
          }
  
          return res;
      };
      /**
       * Replaces tokens in the template with corresponding values without HTML escaping
       * @method fillHtml
       * @param obj {Object} to populate the template with
       * @return {Object} the template object
       */
      var fillHtml = function fillHtml(obj) {
          this.template = this.template.replace(tokenRegex, function (all, key) {
              return replacer(all, key, obj, true);
          });
          return this;
      };
      /**
       * Replaces tokens in the template with corresponding values with HTML escaping
       * @method fill
       * @param obj {Object} to populate the template with
       * @return {Object} the template object
       */
      var fill = function fill(obj) {
          this.template = this.template.replace(tokenRegex, function (all, key) {
              return replacer(all, key, obj);
          });
          return this;
      };
      /**
       * Returns the current templated string.
       * @method toString
       * @return {String} the current template
       */
      var toString = function toString() {
          return this.template;
      };
  
      // internal function
      var T = function T(s) {
          function res() {
              return res.template;
          }
  
          /**
           * The current templated string
           * @property template
           */
          res.template = String(s);
          res.toString = res.valueOf = toString;
          res.fill = fill;
          res.fillHtml = fillHtml;
          return res;
      };
      var cache = {};
      var count = [];
  
      var findScripts = function findScripts(title) {
          return $('script').filter(function () {
              return this.getAttribute('title') === title;
          });
      };
  
      // returns template taken form the script tag with given title. Type agnostic, but better put type="text/x-template"
      T.load = function (title) {
          title = String(title);
          if (!cache.hasOwnProperty(title)) {
              if (count.length >= 1e3) {
                  delete cache[count.shift()]; // enforce maximum cache size
              }
              count.push(title);
              cache[title] = findScripts(title)[0].text;
          }
          return this(cache[title]);
      };
  
      // escape HTML dangerous characters
      T.escape = _escapeHtml2.default;
  
      return T;
  }(_jquery2.default);
  
  (0, _globalize2.default)('template', template);
  
  exports.default = template;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);