// src/js/aui/result-set.js
(typeof window === 'undefined' ? global : window).__b46ec20932fb7348b9b897055f211dc7 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _backbone = __320e4ec293ac29d49b959aa9d46df68f;
  
  var _backbone2 = _interopRequireDefault(_backbone);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var ResultSet = _backbone2.default.Model.extend({
      initialize: function initialize(options) {
          this.set('active', null, { silent: true });
          this.collection = new _backbone2.default.Collection();
          this.collection.bind('reset', this.setActive, this);
          this.source = options.source;
          this.source.bind('respond', this.process, this);
      },
  
      url: false,
  
      process: function process(response) {
          this.set('query', response.query);
          this.collection.reset(response.results);
          this.set('length', response.results.length);
          this.trigger('update', this);
      },
  
      setActive: function setActive() {
          var id = arguments[0] instanceof _backbone2.default.Collection ? false : arguments[0];
          var model = id ? this.collection.get(id) : this.collection.first();
          this.set('active', model || null);
          return this.get('active');
      },
  
      next: function next() {
          var current = this.collection.indexOf(this.get('active'));
          var i = (current + 1) % this.get('length');
          var next = this.collection.at(i);
          return this.setActive(next && next.id);
      },
  
      prev: function prev() {
          var current = this.collection.indexOf(this.get('active'));
          var i = (current === 0 ? this.get('length') : current) - 1;
          var prev = this.collection.at(i);
          return this.setActive(prev && prev.id);
      },
  
      each: function each() {
          return this.collection.each.apply(this.collection, arguments);
      }
  });
  
  (0, _globalize2.default)('ResultSet', ResultSet);
  
  exports.default = ResultSet;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);