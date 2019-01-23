// src/js/aui/query-input.js
(typeof window === 'undefined' ? global : window).__db4bee34c60bbc169d83f2674d47aa48 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _underscore = __59c1c30030f41c99b6757d449d9a3a7b;
  
  var _underscore2 = _interopRequireDefault(_underscore);
  
  var _backbone = __320e4ec293ac29d49b959aa9d46df68f;
  
  var _backbone2 = _interopRequireDefault(_backbone);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var QueryInput = _backbone2.default.View.extend({
      initialize: function initialize() {
          _underscore2.default.bindAll(this, 'changed', 'val');
          this._lastValue = this.val();
          this.$el.bind('keyup focus', this.changed);
      },
  
      val: function val() {
          return this.$el.val.apply(this.$el, arguments);
      },
  
      changed: function changed() {
          if (this._lastValue !== this.val()) {
              this.trigger('change', this.val());
              this._lastValue = this.val();
          }
      }
  });
  
  (0, _globalize2.default)('QueryInput', QueryInput);
  
  exports.default = QueryInput;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);