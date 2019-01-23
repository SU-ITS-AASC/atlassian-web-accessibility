// src/js/aui/setup.js
(typeof window === 'undefined' ? global : window).__03a8c5deff7e97eaf9953f7f46c1ca0e = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _populateParameters = __4b56bdd4ac2dc9a48c4021c75605fddc;
  
  var _populateParameters2 = _interopRequireDefault(_populateParameters);
  
  var _version = __d55b17f777e9bed0264078626d52c7fc;
  
  var _version2 = _interopRequireDefault(_version);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  // Set the version.
  // Global setup that used to be in the main AJS namespace file.
  
  (0, _jquery2.default)(function () {
      var $body = (0, _jquery2.default)('body');
  
      if (!$body.data('auiVersion')) {
          $body.attr('data-aui-version', _version2.default);
      }
  
      (0, _populateParameters2.default)();
  });
  
  // Setting Traditional to handle our default param serialisation.
  // See http://api.jquery.com/jQuery.param/ for more information.
  _jquery2.default.ajaxSettings.traditional = true;
  (0, _globalize2.default)('$', _jquery2.default);
  
  return module.exports;
}).call(this);