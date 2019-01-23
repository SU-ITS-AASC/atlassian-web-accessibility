// src/js/aui/polyfills/custom-event.js
(typeof window === 'undefined' ? global : window).__f7a5e0d2ea8865b104efc9b94861591e = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  var CustomEvent = void 0;
  
  (function () {
      if (window.CustomEvent) {
          // Some browsers don't support constructable custom events yet.
          try {
              var ce = new window.CustomEvent('name', {
                  bubbles: false,
                  cancelable: true,
                  detail: {
                      x: 'y'
                  }
              });
              ce.preventDefault();
              if (ce.defaultPrevented !== true) {
                  throw new Error('Could not prevent default');
              }
              if (ce.type !== 'name') {
                  throw new Error('Could not set custom name');
              }
              if (ce.detail.x !== 'y') {
                  throw new Error('Could not set detail');
              }
  
              CustomEvent = window.CustomEvent;
              return;
          } catch (e) {
              // polyfill it
          }
      }
  
      /**
       * @type CustomEvent
       * @param {String} event - the name of the event.
       * @param {Object} [params] - optional configuration of the custom event.
       * @param {Boolean} [params.cancelable=false] - A boolean indicating whether the event is cancelable (i.e., can call preventDefault and set the defaultPrevented property).
       * @param {Boolean} [params.bubbles=false] - A boolean indicating whether the event bubbles up through the DOM or not.
       * @param {Boolean} [params.detail] - The data passed when initializing the event.
       * @extends Event
       * @returns {Event}
       * @constructor
       */
      CustomEvent = function CustomEvent(event, params) {
          params = params || { bubbles: false, cancelable: false, detail: undefined };
  
          var evt = document.createEvent('CustomEvent');
  
          evt.initCustomEvent(event, !!params.bubbles, !!params.cancelable, params.detail);
          var origPrevent = evt.preventDefault;
          evt.preventDefault = function () {
              origPrevent.call(this);
              try {
                  Object.defineProperty(this, 'defaultPrevented', {
                      get: function get() {
                          return true;
                      }
                  });
              } catch (e) {
                  this.defaultPrevented = true;
              }
          };
  
          return evt;
      };
  
      CustomEvent.prototype = window.Event.prototype;
  })();
  
  exports.default = CustomEvent;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);