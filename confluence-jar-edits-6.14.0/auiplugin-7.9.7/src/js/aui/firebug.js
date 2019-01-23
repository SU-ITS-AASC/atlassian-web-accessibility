// src/js/aui/firebug.js
(typeof window === 'undefined' ? global : window).__d985b91328862a9b5001134fdbcdc855 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.warnAboutFirebug = exports.firebug = undefined;
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _deprecation = __921ad9514d56376fef992861d9ec0f51;
  
  var deprecate = _interopRequireWildcard(_deprecation);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Does nothing because legacy code.
   *
   * @returns {undefined}
   */
  function warnAboutFirebug() {}
  
  /**
   * Includes firebug lite for debugging in IE. Especially in IE.
   *
   * @returns {undefined}
   */
  function firebug() {
      var script = (0, _jquery2.default)(document.createElement('script'));
  
      script.attr('src', 'https://getfirebug.com/releases/lite/1.2/firebug-lite-compressed.js');
      (0, _jquery2.default)('head').append(script);
  
      (function () {
          if (window.firebug) {
              firebug.init();
          } else {
              setTimeout(firebug, 0);
          }
      })();
  }
  
  exports.firebug = firebug = deprecate.fn(firebug, 'firebug', {
      sinceVersion: '5.1.0'
  });
  
  exports.warnAboutFirebug = warnAboutFirebug = deprecate.fn(warnAboutFirebug, 'warnAboutFirebug', {
      sinceVersion: '5.8.0'
  });
  
  (0, _globalize2.default)('firebug', firebug);
  (0, _globalize2.default)('warnAboutFirebug', warnAboutFirebug);
  
  exports.firebug = firebug;
  exports.warnAboutFirebug = warnAboutFirebug;
  
  return module.exports;
}).call(this);