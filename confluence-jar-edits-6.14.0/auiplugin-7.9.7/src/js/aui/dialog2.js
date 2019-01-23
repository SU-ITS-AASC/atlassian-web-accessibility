// src/js/aui/dialog2.js
(typeof window === 'undefined' ? global : window).__df7047d25e7ae0c2f22a17f939177597 = (function () {
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
  
  var _amdify = __65ca28a9d6b0f244027266ff8e6a6d1c;
  
  var _amdify2 = _interopRequireDefault(_amdify);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _layer = __3ada4a8272640e5242be87f12c7e0fdf;
  
  var _layer2 = _interopRequireDefault(_layer);
  
  var _widget = __d2e8fc66dac2ecebdc205fcab991f687;
  
  var _widget2 = _interopRequireDefault(_widget);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var defaults = {
      'aui-focus': 'false', // do not focus by default as it's overridden below
      'aui-blanketed': 'true'
  };
  
  function applyDefaults($el) {
      _jquery2.default.each(defaults, function (key, value) {
          var dataKey = 'data-' + key;
          if (!$el[0].hasAttribute(dataKey)) {
              $el.attr(dataKey, value);
          }
      });
  }
  
  function Dialog2(selector) {
      if (selector) {
          this.$el = (0, _jquery2.default)(selector);
      } else {
          this.$el = (0, _jquery2.default)(aui.dialog.dialog2({}));
      }
      applyDefaults(this.$el);
  }
  
  Dialog2.prototype.on = function (event, fn) {
      (0, _layer2.default)(this.$el).on(event, fn);
      return this;
  };
  
  Dialog2.prototype.off = function (event, fn) {
      (0, _layer2.default)(this.$el).off(event, fn);
      return this;
  };
  
  Dialog2.prototype.show = function () {
      (0, _layer2.default)(this.$el).show();
      return this;
  };
  
  Dialog2.prototype.hide = function () {
      (0, _layer2.default)(this.$el).hide();
      return this;
  };
  
  Dialog2.prototype.remove = function () {
      (0, _layer2.default)(this.$el).remove();
      return this;
  };
  
  Dialog2.prototype.isVisible = function () {
      return (0, _layer2.default)(this.$el).isVisible();
  };
  
  var dialog2Widget = (0, _widget2.default)('dialog2', Dialog2);
  
  dialog2Widget.on = function (eventName, fn) {
      _layer2.default.on(eventName, '.aui-dialog2', fn);
      return this;
  };
  
  dialog2Widget.off = function (eventName, fn) {
      _layer2.default.off(eventName, '.aui-dialog2', fn);
      return this;
  };
  
  /* Live events */
  
  (0, _jquery2.default)(document).on('click', '.aui-dialog2-header-close', function (e) {
      e.preventDefault();
      dialog2Widget((0, _jquery2.default)(this).closest('.aui-dialog2')).hide();
  });
  
  dialog2Widget.on('show', function (e, $el) {
      var selectors = ['.aui-dialog2-content', '.aui-dialog2-footer', '.aui-dialog2-header'];
      var $selected;
      selectors.some(function (selector) {
          $selected = $el.find(selector + ' :aui-tabbable');
          return $selected.length;
      });
      $selected && $selected.first().focus();
  });
  
  dialog2Widget.on('hide', function (e, $el) {
      var layer = (0, _layer2.default)($el);
  
      if ($el.data('aui-remove-on-hide')) {
          layer.remove();
      }
  });
  
  (0, _amdify2.default)('aui/dialog2', dialog2Widget);
  (0, _globalize2.default)('dialog2', dialog2Widget);
  exports.default = dialog2Widget;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);