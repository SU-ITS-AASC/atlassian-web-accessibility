// src/js/aui/internal/state.js
(typeof window === 'undefined' ? global : window).__3f2c7809aecfe899611b77461a9218ac = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  function state(element) {
      return {
          /**
           * sets an internal state on a component element
           * @param element the element to which the state will be added
           * @param stateName the name of the state
           * @param stateValue the value that the state will be changed to
           */
          set: function set(stateName, stateValue) {
              if (element._state === undefined) {
                  element._state = {};
              }
  
              element._state[stateName] = stateValue;
          },
  
          /**
           * gets an internal state on a component element
           * @param element the element to which the state will be added
           * @param stateName the name of the state
           */
          get: function get(stateName) {
              if (element._state) {
                  return element._state[stateName];
              }
          }
      };
  }
  
  exports.default = state;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);