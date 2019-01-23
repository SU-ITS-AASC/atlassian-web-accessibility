// src/js/aui/trigger.js
(typeof window === 'undefined' ? global : window).__30cf7e8f2431e5458a101ad849353fcd = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _amdify = __65ca28a9d6b0f244027266ff8e6a6d1c;
  
  var _amdify2 = _interopRequireDefault(_amdify);
  
  var _skate = __0ac9a2c09f995a9c0a478af8742f59b7;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function isNestedAnchor(trigger, target) {
      var $closestAnchor = (0, _jquery2.default)(target).closest('a[href]', trigger);
      return !!$closestAnchor.length && $closestAnchor[0] !== trigger;
  }
  
  function findControlled(trigger) {
      return document.getElementById(trigger.getAttribute('aria-controls'));
  }
  
  function triggerMessage(trigger, e) {
      if (trigger.isEnabled()) {
          var component = findControlled(trigger);
          if (component && component.message) {
              component.message(e);
          }
      }
  }
  
  (0, _skate2.default)('data-aui-trigger', {
      type: _skate2.default.type.ATTRIBUTE,
      events: {
          click: function click(trigger, e) {
              if (!isNestedAnchor(trigger, e.target)) {
                  triggerMessage(trigger, e);
                  e.preventDefault();
              }
          },
          mouseenter: function mouseenter(trigger, e) {
              triggerMessage(trigger, e);
          },
          mouseleave: function mouseleave(trigger, e) {
              triggerMessage(trigger, e);
          },
          focus: function focus(trigger, e) {
              triggerMessage(trigger, e);
          },
          blur: function blur(trigger, e) {
              triggerMessage(trigger, e);
          }
      },
      prototype: {
          disable: function disable() {
              this.setAttribute('aria-disabled', 'true');
          },
          enable: function enable() {
              this.setAttribute('aria-disabled', 'false');
          },
          isEnabled: function isEnabled() {
              return this.getAttribute('aria-disabled') !== 'true';
          }
      }
  });
  
  (0, _amdify2.default)('aui/trigger');
  
  return module.exports;
}).call(this);