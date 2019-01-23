// src/js/aui/results-list.js
(typeof window === 'undefined' ? global : window).__93ae7363c623fd2012753bbaae65af05 = (function () {
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
  
  var _resultSet = __b46ec20932fb7348b9b897055f211dc7;
  
  var _resultSet2 = _interopRequireDefault(_resultSet);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var ResultsList = _backbone2.default.View.extend({
      events: {
          'click [data-id]': 'setSelection'
      },
  
      initialize: function initialize(options) {
          if (!this.model) {
              this.model = new _resultSet2.default({ source: options.source });
          }
  
          if (!(this.model instanceof _resultSet2.default)) {
              throw new Error('model must be set to a ResultSet');
          }
  
          this.model.bind('update', this.process, this);
  
          this.render = _underscore2.default.wrap(this.render, function (func) {
              this.trigger('rendering');
              func.apply(this, arguments);
              this.trigger('rendered');
          });
      },
  
      process: function process() {
          if (!this._shouldShow(this.model.get('query'))) {
              return;
          }
          this.show();
      },
  
      render: function render() {
          var ul = _backbone2.default.$('<ul/>');
          this.model.each(function (model) {
              var li = _backbone2.default.$('<li/>').attr('data-id', model.id).html(this.renderItem(model)).appendTo(ul);
          }, this);
          this.$el.html(ul);
          return this;
      },
  
      renderItem: function renderItem() {
          return;
      },
  
      setSelection: function setSelection(event) {
          var id = event.target.getAttribute('data-id');
          var selected = this.model.setActive(id);
          this.trigger('selected', selected);
      },
  
      show: function show() {
          this.lastQuery = this.model.get('query');
          this._hiddenQuery = null;
          this.render();
          this.$el.show();
      },
  
      hide: function hide() {
          this.$el.hide();
          this._hiddenQuery = this.lastQuery;
      },
  
      size: function size() {
          return this.model.get('length');
      },
  
      _shouldShow: function _shouldShow(query) {
          return query === '' || !(this._hiddenQuery && this._hiddenQuery === query);
      }
  });
  
  (0, _globalize2.default)('ResultsList', ResultsList);
  
  exports.default = ResultsList;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);