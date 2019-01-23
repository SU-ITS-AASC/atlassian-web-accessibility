// src/js/aui/internal/widget.js
(typeof window === 'undefined' ? global : window).__d2e8fc66dac2ecebdc205fcab991f687 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  exports.default = function (name, Ctor) {
      var dataAttr = '_aui-widget-' + name;
      return function (selectorOrOptions, maybeOptions) {
          var selector;
          var options;
          if (_jquery2.default.isPlainObject(selectorOrOptions)) {
              options = selectorOrOptions;
          } else {
              selector = selectorOrOptions;
              options = maybeOptions;
          }
  
          var $el = selector && (0, _jquery2.default)(selector);
  
          var widget;
          if (!$el || !$el.data(dataAttr)) {
              widget = new Ctor($el, options || {});
              $el = widget.$el;
              $el.data(dataAttr, widget);
          } else {
              widget = $el.data(dataAttr);
              // options are discarded if $el has already been constructed
          }
  
          return widget;
      };
  };
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  module.exports = exports['default'];
  
  /**
   * @param {string} name The name of the widget to use in any messaging.
   * @param {function(new:{ $el: jQuery }, ?jQuery, ?Object)} Ctor
   *     A constructor which will only ever be called with "new". It must take a JQuery object as the first
   *     parameter, or generate one if not provided. The second parameter will be a configuration object.
   *     The returned object must have an $el property and a setOptions function.
   * @constructor
   */
  
  return module.exports;
}).call(this);