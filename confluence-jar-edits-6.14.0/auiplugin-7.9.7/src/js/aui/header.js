// src/js/aui/header.js
(typeof window === 'undefined' ? global : window).__93911bf5ed7c76934f3ee65b5a1419d0 = (function () {
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
  
  var _createHeader = __455206c30630fecc55c648cca374a3ea;
  
  var _createHeader2 = _interopRequireDefault(_createHeader);
  
  var _deprecation = __921ad9514d56376fef992861d9ec0f51;
  
  var deprecate = _interopRequireWildcard(_deprecation);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function findAndCreateHeaders() {
      (0, _jquery2.default)('.aui-header').each(function () {
          (0, _createHeader2.default)(this);
      });
  }
  
  (0, _jquery2.default)(findAndCreateHeaders);
  
  var responsiveheader = {};
  responsiveheader.setup = deprecate.fn(findAndCreateHeaders, 'responsiveheader.setup', {
      removeInVersion: '8.0.0',
      sinceVersion: '5.8.0',
      extraInfo: 'No need to manually initialise anymore as this is now a web component.'
  });
  
  (0, _globalize2.default)('responsiveheader', responsiveheader);
  
  exports.default = responsiveheader;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);