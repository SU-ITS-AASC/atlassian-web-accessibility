// src/js/aui/cookie.js
(typeof window === 'undefined' ? global : window).__333ca678b27b3f668a8ab6b3ea8ee781 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.save = exports.read = exports.erase = undefined;
  
  var _deprecation = __921ad9514d56376fef992861d9ec0f51;
  
  var deprecate = _interopRequireWildcard(_deprecation);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  var COOKIE_NAME = 'AJS.conglomerate.cookie';
  var UNESCAPE_COOKIE_REGEX = /(\\|^"|"$)/g;
  var CONSECUTIVE_PIPE_CHARS_REGEX = /\|\|+/g;
  var ANY_QUOTE_REGEX = /"/g;
  var REGEX_SPECIAL_CHARS = /[.*+?|^$()[\]{\\]/g;
  
  function regexEscape(str) {
      return str.replace(REGEX_SPECIAL_CHARS, '\\$&');
  }
  
  function getValueFromConglomerate(name, cookieValue) {
      // A null cookieValue is just the first time through so create it.
      cookieValue = cookieValue || '';
      var reg = new RegExp(regexEscape(name) + '=([^|]+)');
      var res = cookieValue.match(reg);
      return res && res[1];
  }
  
  // Either append or replace the value in the cookie string/
  function addOrAppendToValue(name, value, cookieValue) {
      // A cookie name follows after any amount of white space mixed with any amount of '|' characters.
      // A cookie value is preceded by '=', then anything except for '|'.
      var reg = new RegExp('(\\s|\\|)*\\b' + regexEscape(name) + '=[^|]*[|]*');
  
      cookieValue = cookieValue || '';
      cookieValue = cookieValue.replace(reg, '|');
  
      if (value !== '') {
          var pair = name + '=' + value;
          if (cookieValue.length + pair.length < 4020) {
              cookieValue += '|' + pair;
          }
      }
  
      return cookieValue.replace(CONSECUTIVE_PIPE_CHARS_REGEX, '|');
  }
  
  function unescapeCookieValue(name) {
      return name.replace(UNESCAPE_COOKIE_REGEX, '');
  }
  
  function getCookieValue(name) {
      var reg = new RegExp('\\b' + regexEscape(name) + '=((?:[^\\\\;]+|\\\\.)*)(?:;|$)');
      var res = document.cookie.match(reg);
      return res && unescapeCookieValue(res[1]);
  }
  
  function saveCookie(name, value, days) {
      var ex = '';
      var d;
      var quotedValue = '"' + value.replace(ANY_QUOTE_REGEX, '\\"') + '"';
  
      if (days) {
          d = new Date();
          d.setTime(+d + days * 24 * 60 * 60 * 1000);
          ex = '; expires=' + d.toGMTString();
      }
  
      document.cookie = name + '=' + quotedValue + ex + ';path=/';
  }
  
  /**
   * Save a cookie.
   * @param name {String} name of cookie
   * @param value {String} value of cookie
   * @param expires {Number} number of days before cookie expires
   */
  function save(name, value, expires) {
      var cookieValue = getCookieValue(COOKIE_NAME);
      cookieValue = addOrAppendToValue(name, value, cookieValue);
      saveCookie(COOKIE_NAME, cookieValue, expires || 365);
  }
  
  /**
   * Get the value of a cookie.
   * @param name {String} name of cookie to read
   * @param defaultValue {String} the default value of the cookie to return if not found
   */
  function read(name, defaultValue) {
      var cookieValue = getCookieValue(COOKIE_NAME);
      var value = getValueFromConglomerate(name, cookieValue);
      if (value != null) {
          return value;
      }
      return defaultValue;
  }
  
  /**
   * Remove the given cookie.
   * @param name {String} the name of the cookie to remove
   */
  function erase(name) {
      save(name, '');
  }
  
  var cookie = {
      erase: erase,
      read: read,
      save: save
  };
  
  (0, _globalize2.default)('cookie', cookie);
  (0, _globalize2.default)('Cookie', cookie);
  
  deprecate.prop(AJS, 'Cookie', {
      alternativeName: 'cookie',
      sinceVersion: '5.8.0'
  });
  
  exports.erase = erase;
  exports.read = read;
  exports.save = save;
  
  return module.exports;
}).call(this);