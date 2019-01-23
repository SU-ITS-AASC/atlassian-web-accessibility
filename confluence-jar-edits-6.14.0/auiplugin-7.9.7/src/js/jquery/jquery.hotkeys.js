// src/js/jquery/jquery.hotkeys.js
(typeof window === 'undefined' ? global : window).__a4d3347ab21a296e8efc8837d81d6a6d = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  "use strict";
  
  /*
   * Modified by Atlassian to allow chaining of keys
   *
   * jQuery Hotkeys Plugin
   * Copyright 2010, John Resig
   * Dual licensed under the MIT or GPL Version 2 licenses.
   *
   * Based upon the plugin by Tzury Bar Yochay:
   * http://github.com/tzuryby/hotkeys
   *
   * Original idea by:
   * Binny V A, http://www.openjs.com/scripts/events/keyboard_shortcuts/
  */
  
  (function (jQuery) {
  
      jQuery.hotkeys = {
          version: "0.8",
  
          specialKeys: {
              8: "backspace", 9: "tab", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
              20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
              37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del",
              91: "meta",
              96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
              104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111: "/",
              112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8",
              120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll",
              188: ",", 190: ".", 191: "/", 224: "meta", 219: '[', 221: ']'
          },
  
          // These only work under Mac Gecko when using keypress (see http://unixpapa.com/js/key.html).
          keypressKeys: ["<", ">", "?"],
  
          shiftNums: {
              "`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&",
              "8": "*", "9": "(", "0": ")", "-": "_", "=": "+", ";": ":", "'": "\"", ",": "<",
              ".": ">", "/": "?", "\\": "|"
          }
      };
  
      jQuery.each(jQuery.hotkeys.keypressKeys, function (_, key) {
          jQuery.hotkeys.shiftNums[key] = key;
      });
  
      function TimedNumber(timer) {
          this.num = 0;
          this.timer = timer > 0 ? timer : false;
      }
      TimedNumber.prototype.val = function () {
          return this.num;
      };
      TimedNumber.prototype.inc = function () {
          if (this.timer) {
              clearTimeout(this.timeout);
              this.timeout = setTimeout(jQuery.proxy(TimedNumber.prototype.reset, this), this.timer);
          }
          this.num++;
      };
      TimedNumber.prototype.reset = function () {
          if (this.timer) {
              clearTimeout(this.timeout);
          }
          this.num = 0;
      };
  
      function keyHandler(handleObj) {
          // Only care when a possible input has been specified
          if (!(jQuery.isPlainObject(handleObj.data) || jQuery.isArray(handleObj.data) || typeof handleObj.data === "string")) {
              return;
          }
  
          var origHandler = handleObj.handler,
              options = {
              timer: 700,
              combo: []
          };
  
          (function (data) {
              if (typeof data === 'string') {
                  options.combo = [data];
              } else if (jQuery.isArray(data)) {
                  options.combo = data;
              } else {
                  jQuery.extend(options, data);
              }
              options.combo = jQuery.map(options.combo, function (key) {
                  return key.toLowerCase();
              });
          })(handleObj.data);
  
          handleObj.index = new TimedNumber(options.timer);
          handleObj.handler = function (event) {
              // Don't fire in text-accepting inputs that we didn't directly bind to
              // important to note that jQuery.fn.prop is only available on jquery 1.6+
              if (this !== event.target && (/textarea|select|input/i.test(event.target.nodeName) || jQuery(event.target).prop('contenteditable') === 'true')) {
                  return;
              }
  
              // Keypress represents characters, not special keys
              var special = event.type !== 'keypress' ? jQuery.hotkeys.specialKeys[event.which] : null,
                  character = String.fromCharCode(event.which).toLowerCase(),
                  key,
                  modif = "",
                  possible = {};
  
              // check combinations (alt|ctrl|shift+anything)
              if (event.altKey && special !== "alt") {
                  modif += "alt+";
              }
  
              if (event.ctrlKey && special !== "ctrl") {
                  modif += "ctrl+";
              }
  
              // TODO: Need to make sure this works consistently across platforms
              if (event.metaKey && !event.ctrlKey && special !== "meta") {
                  modif += "meta+";
              }
  
              if (event.shiftKey && special !== "shift") {
                  modif += "shift+";
              }
  
              // Under Chrome and Safari, meta's keycode == '['s charcode
              // Even if they did type this key combo we could not use it because it is browser back in Chrome/Safari on OS X
              if (event.metaKey && character === '[') {
                  character = null;
              }
  
              if (special) {
                  possible[modif + special] = true;
              }
              if (character) {
                  possible[modif + character] = true;
              }
  
              // "$" can be specified as "shift+4" or "$"
              if (/shift+/.test(modif)) {
                  possible[modif.replace('shift+', '') + jQuery.hotkeys.shiftNums[special || character]] = true;
              }
  
              var index = handleObj.index,
                  combo = options.combo;
  
              if (pressed(combo[index.val()], possible)) {
                  if (index.val() === combo.length - 1) {
                      index.reset();
                      return origHandler.apply(this, arguments);
                  } else {
                      index.inc();
                  }
              } else {
                  index.reset();
                  // For mutli-key combinations, we might have restarted the key sequence.
                  if (pressed(combo[0], possible)) {
                      index.inc();
                  }
              }
          };
      }
  
      function pressed(key, possible) {
          var keys = key.split(' ');
          for (var i = 0, len = keys.length; i < len; i++) {
              if (possible[keys[i]]) {
                  return true;
              }
          }
          return false;
      }
  
      jQuery.each(["keydown", "keyup", "keypress"], function () {
          jQuery.event.special[this] = { add: keyHandler };
      });
  })(jQuery);
  
  return module.exports;
}).call(this);