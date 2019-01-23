// src/js/aui/populate-parameters.js
(typeof window === 'undefined' ? global : window).__4b56bdd4ac2dc9a48c4021c75605fddc = (function () {
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
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _params = __c23baf055e78d2723c930e9c96b28df7;
  
  var _params2 = _interopRequireDefault(_params);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function populateParameters(parameters) {
      if (!parameters) {
          parameters = _params2.default;
      }
  
      (0, _jquery2.default)('.parameters input').each(function () {
          var value = this.value;
          var id = this.title || this.id;
  
          if ((0, _jquery2.default)(this).hasClass('list')) {
              if (parameters[id]) {
                  parameters[id].push(value);
              } else {
                  parameters[id] = [value];
              }
          } else {
              parameters[id] = value.match(/^(tru|fals)e$/i) ? value.toLowerCase() === 'true' : value;
          }
      });
  }
  
  (0, _globalize2.default)('populateParameters', populateParameters);
  
  exports.default = populateParameters;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);