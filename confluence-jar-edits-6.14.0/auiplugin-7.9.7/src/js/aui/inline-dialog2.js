// src/js/aui/inline-dialog2.js
(typeof window === 'undefined' ? global : window).__b4529c3c44b8657454bfd27f30c89b5c = (function () {
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
  
  var _alignment = __81deba69899d0f1851f2c511b87bbbae;
  
  var _alignment2 = _interopRequireDefault(_alignment);
  
  var _amdify = __65ca28a9d6b0f244027266ff8e6a6d1c;
  
  var _amdify2 = _interopRequireDefault(_amdify);
  
  var _attributes = __ab489eda548cad099ce93b60faa6a3d5;
  
  var _attributes2 = _interopRequireDefault(_attributes);
  
  var _enforcer = __2512e2cfb8f46670d5cb777690a28c72;
  
  var _enforcer2 = _interopRequireDefault(_enforcer);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _layer = __3ada4a8272640e5242be87f12c7e0fdf;
  
  var _layer2 = _interopRequireDefault(_layer);
  
  var _skate = __0ac9a2c09f995a9c0a478af8742f59b7;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  var _state = __3f2c7809aecfe899611b77461a9218ac;
  
  var _state2 = _interopRequireDefault(_state);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var DEFAULT_HOVEROUT_DELAY = 1000;
  
  function getTrigger(element) {
      return document.querySelector('[aria-controls="' + element.id + '"]');
  }
  
  function doIfTrigger(element, callback) {
      var trigger = getTrigger(element);
  
      if (trigger) {
          callback(trigger);
      }
  }
  
  function initAlignment(element, trigger) {
      if (!element._auiAlignment) {
          element._auiAlignment = new _alignment2.default(element, trigger);
      }
  }
  
  function enableAlignment(element, trigger) {
      initAlignment(element, trigger);
      element._auiAlignment.enable();
  }
  
  function disableAlignment(element, trigger) {
      initAlignment(element, trigger);
      element._auiAlignment.disable();
  }
  
  function handleMessage(element, message) {
      var messageTypeMap = {
          toggle: ['click'],
          hover: ['mouseenter', 'mouseleave', 'focus', 'blur']
      };
  
      var messageList = messageTypeMap[element.respondsTo];
      if (messageList && messageList.indexOf(message.type) > -1) {
          messageHandler[message.type](element, message);
      }
  }
  
  var messageHandler = {
      click: function click(element) {
          if (element.open) {
              if (!(0, _layer2.default)(element).isPersistent()) {
                  element.open = false;
              }
          } else {
              element.open = true;
          }
      },
  
      mouseenter: function mouseenter(element) {
          if (!element.open) {
              element.open = true;
          }
  
          if (element._clearMouseleaveTimeout) {
              element._clearMouseleaveTimeout();
          }
      },
  
      mouseleave: function mouseleave(element) {
          if ((0, _layer2.default)(element).isPersistent() || !element.open) {
              return;
          }
  
          if (element._clearMouseleaveTimeout) {
              element._clearMouseleaveTimeout();
          }
  
          var timeout = setTimeout(function () {
              if (!(0, _state2.default)(element).get('mouse-inside')) {
                  element.open = false;
              }
          }, DEFAULT_HOVEROUT_DELAY);
  
          element._clearMouseleaveTimeout = function () {
              clearTimeout(timeout);
              element._clearMouseleaveTimeout = null;
          };
      },
  
      focus: function focus(element) {
          if (!element.open) {
              element.open = true;
          }
      },
  
      blur: function blur(element) {
          if (!(0, _layer2.default)(element).isPersistent() && element.open) {
              element.open = false;
          }
      }
  };
  
  function onMouseEnter(e) {
      var element = e.target;
      (0, _state2.default)(element).set('mouse-inside', true);
      element.message({
          type: 'mouseenter'
      });
  }
  
  function onMouseLeave(e) {
      var element = e.target;
      (0, _state2.default)(element).set('mouse-inside', false);
      element.message({
          type: 'mouseleave'
      });
  }
  
  function rebindMouseEvents(el) {
      (0, _state2.default)(el).set('mouse-inside', undefined);
      el.removeEventListener('mouseenter', onMouseEnter);
      el.removeEventListener('mouseleave', onMouseLeave);
  
      if (el.respondsTo === 'hover') {
          (0, _state2.default)(el).set('mouse-inside', false);
          el.addEventListener('mouseenter', onMouseEnter);
          el.addEventListener('mouseleave', onMouseLeave);
      }
  }
  
  function showInlineDialog(el) {
      (0, _layer2.default)(el).show();
      if ((0, _layer2.default)(el).isVisible()) {
          doIfTrigger(el, function (trigger) {
              enableAlignment(el, trigger);
              trigger.setAttribute('aria-expanded', 'true');
          });
      } else {
          el.open = false;
      }
  }
  
  function hideInlineDialog(el) {
      (0, _layer2.default)(el).hide();
      if (!(0, _layer2.default)(el).isVisible()) {
          doIfTrigger(el, function (trigger) {
              disableAlignment(el, trigger);
              trigger.setAttribute('aria-expanded', 'false');
          });
      } else {
          el.open = true;
      }
  }
  
  function reflectOpenness(el) {
      var isInitalizing = !el.hasAttribute('aria-hidden');
      var shouldBeOpen = el.hasAttribute('open');
      if (isInitalizing || el.open !== shouldBeOpen) {
          if (shouldBeOpen) {
              (0, _state2.default)(el).set('is-processing-show', true);
              showInlineDialog(el);
              (0, _state2.default)(el).set('is-processing-show', false);
          } else {
              hideInlineDialog(el);
          }
      }
  }
  
  var RESPONDS_TO_ATTRIBUTE_ENUM = {
      attribute: 'responds-to',
      values: ['toggle', 'hover'],
      missingDefault: 'toggle',
      invalidDefault: 'toggle'
  };
  
  var inlineDialog = (0, _skate2.default)('aui-inline-dialog', {
      prototype: {
          /**
           * Returns whether the inline dialog is open.
           */
          get open() {
              return (0, _layer2.default)(this).isVisible();
          },
  
          /**
           * Opens or closes the inline dialog, returning whether the dialog is
           * open or closed as a result (since event handlers can prevent either
           * action).
           *
           * You should check the value of open after setting this
           * value since the before show/hide events may have prevented it.
           */
          set open(value) {
              // TODO AUI-3726 Revisit double calls to canceled event handlers.
              // Explicitly calling reflectOpenness(…) in this setter means
              // that in native we'll get two sync calls to reflectOpenness(…)
              // and in polyfill one sync (here) and one async (attr change
              // handler). The latter of the two calls, for both cases, will
              // usually be a noop (except when show/hide events are cancelled).
              _attributes2.default.setBooleanAttribute(this, 'open', value);
              reflectOpenness(this);
          },
  
          get persistent() {
              return this.hasAttribute('persistent');
          },
  
          set persistent(value) {
              _attributes2.default.setBooleanAttribute(this, 'persistent', value);
          },
  
          get respondsTo() {
              var attr = RESPONDS_TO_ATTRIBUTE_ENUM.attribute;
              return _attributes2.default.computeEnumValue(RESPONDS_TO_ATTRIBUTE_ENUM, this.getAttribute(attr));
          },
  
          set respondsTo(value) {
              var oldComputedValue = this.respondsTo;
              _attributes2.default.setEnumAttribute(this, RESPONDS_TO_ATTRIBUTE_ENUM, value);
              if (oldComputedValue !== this.respondsTo) {
                  rebindMouseEvents(this);
              }
          },
  
          /**
           * Handles the receiving of a message from another component.
           *
           * @param {Object} msg The message to act on.
           *
           * @returns {HTMLElement}
           */
          message: function message(msg) {
              handleMessage(this, msg);
              return this;
          }
      },
  
      created: function created(element) {
          (0, _state2.default)(element).set('is-processing-show', false);
  
          doIfTrigger(element, function (trigger) {
              trigger.setAttribute('aria-expanded', element.open);
              trigger.setAttribute('aria-haspopup', 'true');
          });
      },
  
      attributes: {
          'aria-hidden': function ariaHidden(element, change) {
              if (change.newValue === 'true') {
                  var trigger = getTrigger(element);
                  if (trigger) {
                      trigger.setAttribute('aria-expanded', 'false');
                  }
              }
  
              // Whenever layer manager hides us, we need to sync the open attribute.
              _attributes2.default.setBooleanAttribute(element, 'open', change.newValue === 'false');
          },
  
          open: function open(element) {
              // skate runs the created callback for attributes before the
              // element is attached to the DOM, so guard against that.
              if (document.body.contains(element)) {
                  reflectOpenness(element);
              }
          },
  
          'responds-to': function respondsTo(element, change) {
              var oldComputedValue = _attributes2.default.computeEnumValue(RESPONDS_TO_ATTRIBUTE_ENUM, change.oldValue);
              var newComputedValue = _attributes2.default.computeEnumValue(RESPONDS_TO_ATTRIBUTE_ENUM, change.newValue);
              if (oldComputedValue !== newComputedValue) {
                  rebindMouseEvents(element);
              }
          }
      },
  
      attached: function attached(element) {
          (0, _enforcer2.default)(element).attributeExists('id');
          if (element.hasAttribute('open')) {
              // show() can cause the element to be reattached (to the <body>),
              // so guard against a nested show() call that blows up the layer
              // manager (since it sees us pushing the same element twice).
              if (!(0, _state2.default)(element).get('is-processing-show')) {
                  reflectOpenness(element);
              }
          } else {
              reflectOpenness(element);
          }
          rebindMouseEvents(element);
      },
  
      detached: function detached(element) {
          if (element._auiAlignment) {
              element._auiAlignment.destroy();
          }
      },
  
      template: function template(element) {
          var elem = (0, _jquery2.default)('<div class="aui-inline-dialog-contents"></div>').append(element.childNodes);
          (0, _jquery2.default)(element).addClass('aui-layer').html(elem);
      }
  });
  
  (0, _amdify2.default)('aui/inline-dialog2', inlineDialog);
  (0, _globalize2.default)('InlineDialog2', inlineDialog);
  exports.default = inlineDialog;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);