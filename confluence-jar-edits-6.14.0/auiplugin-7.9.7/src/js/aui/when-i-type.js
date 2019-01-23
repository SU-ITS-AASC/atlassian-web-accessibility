// src/js/aui/when-i-type.js
(typeof window === 'undefined' ? global : window).__7d940ebf0cb26eeeabccc2272b0a4c34 = (function () {
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
  
  __a4d3347ab21a296e8efc8837d81d6a6d;
  
  __25e29eb27170014b389726db2d540673;
  
  var _log = __c1e961001275c079e48525ad3a48c8c2;
  
  var logger = _interopRequireWildcard(_log);
  
  var _dialog = __bc50e12d2af94e34822ae0035ae0e67f;
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _browser = __7a2976c482edfafd9b5879a49ffe0535;
  
  var _keyCode = __e246bf93af36eb4453f35afeb1c302d9;
  
  var _keyCode2 = _interopRequireDefault(_keyCode);
  
  var _underscore = __59c1c30030f41c99b6757d449d9a3a7b;
  
  var _underscore2 = _interopRequireDefault(_underscore);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var isMac = navigator.platform.indexOf('Mac') !== -1;
  var isSafari = navigator.userAgent.indexOf('Safari') !== -1;
  var multiCharRegex = /^(backspace|tab|r(ight|eturn)|s(hift|pace|croll)|c(trl|apslock)|alt|pa(use|ge(up|down))|e(sc|nd)|home|left|up|d(el|own)|insert|f\d\d?|numlock|meta)/i;
  
  /**
   * Trigger native click event.
   * @param $el
   */
  var triggerClickEvent = function triggerClickEvent($el) {
      var element = $el[0];
  
      // if we find the element and Native MouseEvents are available, change it!
      if (element && 'MouseEvent' in window) {
          // Native event bubbles are compatible with Synthetic Event from React
          var event = void 0;
          var bubbles = true;
          var cancelable = true;
          if ((0, _browser.supportsNewMouseEvent)()) {
              event = new MouseEvent('click', { bubbles: bubbles, cancelable: cancelable });
          } else {
              // `document.createEvent` is deprecated and may be removed by some browsers in future
              // (https://developer.mozilla.org/en-US/docs/Web/API/Document/createEvent).
              // As of 2016-12-28, all browsers still support `document.createEvent`
              event = document.createEvent('MouseEvent');
              event.initEvent('click', bubbles, cancelable);
          }
  
          element.dispatchEvent(event);
      } else {
          // otherwise just use the original jquery code.
          $el.trigger('click');
      }
  };
  
  /**
   * Keyboard commands with syntactic sugar.
   *
   * <strong>Usage:</strong>
   * <pre>
   * whenIType("gh").or("gd").goTo("/secure/Dashboard.jspa");
   * whenIType("c").click("#create_link");
   * </pre>
   *
   * @param keys - Key combinations, modifier keys are "+" deliminated. e.g "ctrl+b"
   */
  function whenIType(keys) {
      var boundKeyCombos = [];
      var executor = _jquery2.default.Callbacks();
  
      function keypressHandler(e) {
          if (!_dialog.popup.current && executor) {
              executor.fire(e);
          }
      }
  
      function defaultPreventionHandler(e) {
          e.preventDefault();
      }
  
      // Bind an arbitrary set of keys by calling bindKeyCombo on each triggering key combo.
      // A string like "abc 123" means (a then b then c) OR (1 then 2 then 3). abc is one key combo, 123 is another.
      function bindKeys(keys) {
          var keyCombos = keys && keys.split ? _jquery2.default.trim(keys).split(' ') : [keys];
  
          keyCombos.forEach(function (keyCombo) {
              bindKeyCombo(keyCombo);
          });
      }
  
      function hasUnprintables(keysArr) {
          // a bit of a heuristic, but works for everything we have. Only the unprintable characters are represented with > 1-character names.
          var i = keysArr.length;
          while (i--) {
              if (keysArr[i].length > 1 && keysArr[i] !== 'space') {
                  return true;
              }
          }
          return false;
      }
  
      // bind a single key combo to this handler
      // A string like "abc 123" means (a then b then c) OR (1 then 2 then 3). abc is one key combo, 123 is another.
      function bindKeyCombo(keyCombo) {
          var keysArr = keyCombo instanceof Array ? keyCombo : keyComboArrayFromString(keyCombo.toString());
          var eventType = hasUnprintables(keysArr) ? 'keydown' : 'keypress';
  
          boundKeyCombos.push(keysArr);
          (0, _jquery2.default)(document).bind(eventType, keysArr, keypressHandler);
  
          // Override browser/plugins
          (0, _jquery2.default)(document).bind(eventType + ' keyup', keysArr, defaultPreventionHandler);
      }
  
      // parse out an array of (modifier+key) presses from a single string
      // e.g. "12ctrl+3" becomes [ "1", "2", "ctrl+3" ]
      function keyComboArrayFromString(keyString) {
          var keysArr = [];
          var currModifiers = '';
  
          while (keyString.length) {
              var modifierMatch = keyString.match(/^(ctrl|meta|shift|alt)\+/i);
              var multiCharMatch = keyString.match(multiCharRegex);
  
              if (modifierMatch) {
                  currModifiers += modifierMatch[0];
                  keyString = keyString.substring(modifierMatch[0].length);
              } else if (multiCharMatch) {
                  keysArr.push(currModifiers + multiCharMatch[0]);
                  keyString = keyString.substring(multiCharMatch[0].length);
                  currModifiers = '';
              } else {
                  keysArr.push(currModifiers + keyString[0]);
                  keyString = keyString.substring(1);
                  currModifiers = '';
              }
          }
  
          return keysArr;
      }
  
      function addShortcutsToTitle(selector) {
          var elem = (0, _jquery2.default)(selector);
          var title = elem.attr('title') || '';
          var keyCombos = boundKeyCombos.slice();
          var existingCombos = elem.data('boundKeyCombos') || [];
          var shortcutInstructions = elem.data('kbShortcutAppended') || '';
          var isFirst = !shortcutInstructions;
          var originalTitle = isFirst ? title : title.substring(0, title.length - shortcutInstructions.length);
  
          while (keyCombos.length) {
              var keyCombo = keyCombos.shift();
              var comboAlreadyExists = existingCombos.some(function (existingCombo) {
                  return _underscore2.default.isEqual(keyCombo, existingCombo);
              });
              if (!comboAlreadyExists) {
                  shortcutInstructions = appendKeyComboInstructions(keyCombo.slice(), shortcutInstructions, isFirst);
                  isFirst = false;
              }
          }
  
          if (isMac) {
              shortcutInstructions = shortcutInstructions.replace(/Meta/ig, '\u2318') //Apple cmd key
              .replace(/Shift/ig, '\u21E7'); //Apple Shift symbol
          }
  
          elem.attr('title', originalTitle + shortcutInstructions);
          elem.data('kbShortcutAppended', shortcutInstructions);
          elem.data('boundKeyCombos', existingCombos.concat(boundKeyCombos));
      }
  
      function removeShortcutsFromTitle(selector) {
          var elem = (0, _jquery2.default)(selector);
          var shortcuts = elem.data('kbShortcutAppended');
  
          if (!shortcuts) {
              return;
          }
  
          var title = elem.attr('title');
          elem.attr('title', title.replace(shortcuts, ''));
          elem.removeData('kbShortcutAppended');
          elem.removeData('boundKeyCombos');
      }
  
      //
      function appendKeyComboInstructions(keyCombo, title, isFirst) {
          if (isFirst) {
              title += ' (' + AJS.I18n.getText('aui.keyboard.shortcut.type.x', keyCombo.shift());
          } else {
              title = title.replace(/\)$/, '');
              title += AJS.I18n.getText('aui.keyboard.shortcut.or.x', keyCombo.shift());
          }
  
          keyCombo.forEach(function (key) {
              title += ' ' + AJS.I18n.getText('aui.keyboard.shortcut.then.x', key);
          });
          title += ')';
  
          return title;
      }
  
      bindKeys(keys);
  
      return whenIType.makeShortcut({
          executor: executor,
          bindKeys: bindKeys,
          addShortcutsToTitle: addShortcutsToTitle,
          removeShortcutsFromTitle: removeShortcutsFromTitle,
          keypressHandler: keypressHandler,
          defaultPreventionHandler: defaultPreventionHandler
      });
  }
  
  whenIType.makeShortcut = function (options) {
      var executor = options.executor;
      var bindKeys = options.bindKeys;
      var addShortcutsToTitle = options.addShortcutsToTitle;
      var removeShortcutsFromTitle = options.removeShortcutsFromTitle;
      var keypressHandler = options.keypressHandler;
      var defaultPreventionHandler = options.defaultPreventionHandler;
  
      var selectorsWithTitlesModified = [];
  
      function makeMoveToFunction(getNewFocus) {
          return function (selector, options) {
              options = options || {};
              var focusedClass = options.focusedClass || 'focused';
              var wrapAround = options.hasOwnProperty('wrapAround') ? options.wrapAround : true;
              var escToCancel = options.hasOwnProperty('escToCancel') ? options.escToCancel : true;
  
              executor.add(function () {
  
                  var $items = (0, _jquery2.default)(selector);
                  var $focusedElem = $items.filter('.' + focusedClass);
                  var moveToOptions = $focusedElem.length === 0 ? undefined : { transition: true };
  
                  if (escToCancel) {
                      (0, _jquery2.default)(document).one('keydown', function (e) {
                          if (e.keyCode === _keyCode2.default.ESCAPE && $focusedElem) {
                              $focusedElem.removeClass(focusedClass);
                          }
                      });
                  }
  
                  if ($focusedElem.length) {
                      $focusedElem.removeClass(focusedClass);
                  }
  
                  $focusedElem = getNewFocus($focusedElem, $items, wrapAround);
  
                  if ($focusedElem && $focusedElem.length > 0) {
                      $focusedElem.addClass(focusedClass);
                      $focusedElem.moveTo(moveToOptions);
                      if ($focusedElem.is('a')) {
                          $focusedElem.focus();
                      } else {
                          $focusedElem.find('a:first').focus();
                      }
                  }
              });
              return this;
          };
      }
  
      return {
  
          /**
           * Scrolls to and adds <em>focused</em> class to the next item in the jQuery collection
           *
           * @method moveToNextItem
           * @param selector
           * @param options
           * @return {Object}
           */
          moveToNextItem: makeMoveToFunction(function ($focusedElem, $items, wrapAround) {
              var index;
  
              if (wrapAround && $focusedElem.length === 0) {
                  return $items.eq(0);
              } else {
                  index = _jquery2.default.inArray($focusedElem.get(0), $items);
                  if (index < $items.length - 1) {
                      index = index + 1;
                      return $items.eq(index);
                  } else if (wrapAround) {
                      return $items.eq(0);
                  }
              }
  
              return $focusedElem;
          }),
          /**
           * Scrolls to and adds <em>focused</em> class to the previous item in the jQuery collection
           *
           * @method moveToPrevItem
           * @param selector
           * @param focusedClass
           * @return {Object}
           */
          moveToPrevItem: makeMoveToFunction(function ($focusedElem, $items, wrapAround) {
              var index;
              if (wrapAround && $focusedElem.length === 0) {
                  return $items.filter(':last');
              } else {
                  index = _jquery2.default.inArray($focusedElem.get(0), $items);
                  if (index > 0) {
                      index = index - 1;
                      return $items.eq(index);
                  } else if (wrapAround) {
                      return $items.filter(':last');
                  }
              }
  
              return $focusedElem;
          }),
  
          /**
           * Clicks the element specified by the <em>selector</em> argument.
           *
           * @method click
           * @param selector - jQuery selector for element
           * @return {Object}
           */
          click: function click(selector) {
              selectorsWithTitlesModified.push(selector);
              addShortcutsToTitle(selector);
  
              executor.add(function () {
                  var $el = (0, _jquery2.default)(selector);
                  triggerClickEvent($el);
              });
              return this;
          },
  
          /**
           * Navigates to specified <em>location</em>
           *
           * @method goTo
           * @param {String} location - http location
           * @return {Object}
           */
          goTo: function goTo(location) {
              executor.add(function () {
                  window.location.href = location;
              });
              return this;
          },
  
          /**
           * navigates browser window to link href
           *
           * @method followLink
           * @param selector - jQuery selector for element
           * @return {Object}
           */
          followLink: function followLink(selector) {
              selectorsWithTitlesModified.push(selector);
              addShortcutsToTitle(selector);
  
              executor.add(function () {
                  var elem = (0, _jquery2.default)(selector)[0];
                  if (elem && { 'a': true, 'link': true }[elem.nodeName.toLowerCase()]) {
                      window.location.href = elem.href;
                  }
              });
              return this;
          },
  
          /**
           * Executes function
           *
           * @method execute
           * @param {function} func
           * @return {Object}
           */
          execute: function execute(func) {
              var self = this;
              executor.add(function () {
                  func.apply(self, arguments);
              });
              return this;
          },
  
          /**
           * @deprecated This implementation is uncool. Kept around to satisfy Confluence plugin devs in the short term.
           *
           * Executes the javascript provided by the shortcut plugin point _immediately_.
           *
           * @method evaluate
           * @param {Function} command - the function provided by the shortcut key plugin point
           */
          evaluate: function evaluate(command) {
              command.call(this);
          },
  
          /**
           * Scrolls to element if out of view, then clicks it.
           *
           * @method moveToAndClick
           * @param selector - jQuery selector for element
           * @return {Object}
           */
          moveToAndClick: function moveToAndClick(selector) {
              selectorsWithTitlesModified.push(selector);
              addShortcutsToTitle(selector);
  
              executor.add(function () {
                  var $el = (0, _jquery2.default)(selector);
                  if ($el.length > 0) {
                      triggerClickEvent($el);
                      $el.moveTo();
                  }
              });
              return this;
          },
  
          /**
           * Scrolls to element if out of view, then focuses it
           *
           * @method moveToAndFocus
           * @param selector - jQuery selector for element
           * @return {Object}
           */
          moveToAndFocus: function moveToAndFocus(selector) {
              selectorsWithTitlesModified.push(selector);
              addShortcutsToTitle(selector);
  
              executor.add(function (e) {
                  var $elem = (0, _jquery2.default)(selector);
                  if ($elem.length > 0) {
                      $elem.focus();
                      if ($elem.moveTo) {
                          $elem.moveTo();
                      }
                      if ($elem.is(':input')) {
                          e.preventDefault();
                      }
                  }
              });
              return this;
          },
  
          /**
           * Binds additional keyboard controls
           *
           * @method or
           * @param {String} keys - keys to bind
           * @return {Object}
           */
          or: function or(keys) {
              bindKeys(keys);
              return this;
          },
  
          /**
           * Unbinds shortcut keys
           *
           * @method unbind
           */
          unbind: function unbind() {
              (0, _jquery2.default)(document).unbind('keydown keypress', keypressHandler).unbind('keydown keypress keyup', defaultPreventionHandler);
  
              for (var i = 0, len = selectorsWithTitlesModified.length; i < len; i++) {
                  removeShortcutsFromTitle(selectorsWithTitlesModified[i]);
              }
              selectorsWithTitlesModified = [];
          }
      };
  };
  
  /**
   * Creates keyboard commands and their actions from json data. Format looks like:
   *
   * <pre>
   * [
   *   {
   *        "keys":[["g", "d"]],
   *        "context":"global",
   *        "op":"followLink",
   *        "param":"#home_link"
   *    },
   *    {
   *        "keys":[["g", "i"]],
   *        "context":"global",
   *        "op":"followLink",
   *        "param":"#find_link"
   *    },
   *    {
   *        "keys":[["/"]],
   *        "context":"global",
   *        "op":"moveToAndFocus",
   *        "param":"#quickSearchInput"
   *    },
   *    {
   *        "keys":[["c"]],
   *        "context":"global",
   *        "op":"moveToAndClick",
   *        "param":"#create_link"
   *    }
   * ]
   * </pre>
   *
   * @method fromJSON
   * @static
   * @param json
   */
  whenIType.fromJSON = function (json, switchCtrlToMetaOnMac) {
      var shortcuts = [];
  
      if (json) {
          _jquery2.default.each(json, function (i, item) {
              var operation = item.op;
              var param = item.param;
              var params = void 0;
  
              if (operation === 'execute' || operation === 'evaluate') {
                  // need to turn function string into function object
                  params = [new Function(param)];
              } else if (/^\[[^\]\[]*,[^\]\[]*\]$/.test(param)) {
                  // pass in an array to send multiple params
                  try {
                      params = JSON.parse(param);
                  } catch (e) {
                      logger.error('When using a parameter array, array must be in strict JSON format: ' + param);
                  }
  
                  if (!_jquery2.default.isArray(params)) {
                      logger.error('Badly formatted shortcut parameter. String or JSON Array of parameters required: ' + param);
                  }
              } else {
                  params = [param];
              }
  
              _jquery2.default.each(item.keys, function () {
  
                  var shortcutList = this;
                  if (switchCtrlToMetaOnMac && isMac) {
                      shortcutList = _jquery2.default.map(shortcutList, function (shortcutString) {
                          return shortcutString.replace(/ctrl/i, 'meta');
                      });
                  }
  
                  var newShortcut = whenIType(shortcutList);
                  newShortcut[operation].apply(newShortcut, params);
                  shortcuts.push(newShortcut);
              });
          });
      }
  
      return shortcuts;
  };
  
  // Trigger this event on an iframe if you want its keypress events to be propagated (Events to work in iframes).
  (0, _jquery2.default)(document).bind('iframeAppended', function (e, iframe) {
      (0, _jquery2.default)(iframe).load(function () {
          var target = (0, _jquery2.default)(iframe).contents();
  
          target.bind('keyup keydown keypress', function (e) {
              // safari propagates keypress events from iframes
              if (isSafari && e.type === 'keypress') {
                  return;
              }
  
              if (!(0, _jquery2.default)(e.target).is(':input')) {
                  _jquery2.default.event.trigger(e, arguments, // Preserve original event data.
                  document, // Bubble this event from the iframe's document to its parent document.
                  true // Use the capturing phase to preserve original event.target.
                  );
              }
          });
      });
  });
  
  (0, _globalize2.default)('whenIType', whenIType);
  
  exports.default = whenIType;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);