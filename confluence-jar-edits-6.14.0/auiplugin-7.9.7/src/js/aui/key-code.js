// src/js/aui/key-code.js
(typeof window === 'undefined' ? global : window).__e246bf93af36eb4453f35afeb1c302d9 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var keyCode = {
      ALT: 18,
      BACKSPACE: 8,
      CAPS_LOCK: 20,
      COMMA: 188,
      COMMAND: 91,
  
      // cmd
      COMMAND_LEFT: 91,
      COMMAND_RIGHT: 93,
      LEFT_SQUARE_BRACKET: 91, //This is 91 for keypress and 219 for keydown/keyup
      CONTROL: 17,
      DELETE: 46,
      DOWN: 40,
      END: 35,
      ENTER: 13,
      ESCAPE: 27,
      HOME: 36,
      INSERT: 45,
      LEFT: 37,
  
      // right cmd
      MENU: 93,
      NUMPAD_ADD: 107,
      NUMPAD_DECIMAL: 110,
      NUMPAD_DIVIDE: 111,
      NUMPAD_ENTER: 108,
      NUMPAD_MULTIPLY: 106,
      NUMPAD_SUBTRACT: 109,
      PAGE_DOWN: 34,
      PAGE_UP: 33,
      PERIOD: 190,
      RIGHT: 39,
      SHIFT: 16,
      SPACE: 32,
      TAB: 9,
      UP: 38,
  
      // cmd
      WINDOWS: 91
  };
  
  (0, _globalize2.default)('keyCode', keyCode);
  
  exports.default = keyCode;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);