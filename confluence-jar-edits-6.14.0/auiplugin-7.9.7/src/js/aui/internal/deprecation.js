// src/js/aui/internal/deprecation.js
(typeof window === 'undefined' ? global : window).__921ad9514d56376fef992861d9ec0f51 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.getMessageLogger = exports.propertyDeprecationSupported = exports.obj = exports.prop = exports.css = exports.construct = exports.fn = undefined;
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var has = Object.prototype.hasOwnProperty;
  var deprecationCalls = [];
  var deprecatedSelectorMap = [];
  
  function toSentenceCase(str) {
      str += '';
  
      if (!str) {
          return '';
      }
  
      return str.charAt(0).toUpperCase() + str.substring(1);
  }
  
  function getDeprecatedLocation(printFrameOffset) {
      var err = new Error();
      var stack = err.stack || err.stacktrace;
      var stackMessage = stack && stack.replace(/^Error\n/, '') || '';
  
      if (stackMessage) {
          stackMessage = stackMessage.split('\n');
          return stackMessage[printFrameOffset + 2];
      }
      return stackMessage;
  }
  
  function logger() {
      if (typeof console !== 'undefined' && console.warn) {
          Function.prototype.apply.call(console.warn, console, arguments);
      }
  }
  
  /**
   * Return a function that logs a deprecation warning to the console the first time it is called from a certain location.
   * It will also print the stack frame of the calling function.
   *
   * @param {string} displayName the name of the thing being deprecated
   * @param {object} options
   * @param {string} options.removeInVersion the version this will be removed in
   * @param {string} options.alternativeName the name of an alternative to use
   * @param {string} options.sinceVersion the version this has been deprecated since
   * @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
   * @param {string} options.extraObject an extra object that will be printed at the end
   * @param {string} options.deprecationType type of the deprecation to append to the start of the deprecation message. e.g. JS or CSS
   * @return {Function} that logs the warning and stack frame of the calling function. Takes in an optional parameter for the offset of
   * the stack frame to print, the default is 0. For example, 0 will log it for the line of the calling function,
   * -1 will print the location the logger was called from
   */
  function getShowDeprecationMessage(displayName, options) {
      // This can be used internally to pas in a showmessage fn
      if (typeof displayName === 'function') {
          return displayName;
      }
  
      var called = false;
      options = options || {};
  
      return function (printFrameOffset) {
          var deprecatedLocation = getDeprecatedLocation(printFrameOffset ? printFrameOffset : 1) || '';
          // Only log once if the stack frame doesn't exist to avoid spamming the console/test output
          if (!called || deprecationCalls.indexOf(deprecatedLocation) === -1) {
              deprecationCalls.push(deprecatedLocation);
  
              called = true;
  
              var deprecationType = options.deprecationType + ' ' || '';
  
              var message = 'DEPRECATED ' + deprecationType + '- ' + toSentenceCase(displayName) + ' has been deprecated' + (options.sinceVersion ? ' since ' + options.sinceVersion : '') + ' and will be removed in ' + (options.removeInVersion || 'a future release') + '.';
  
              if (options.alternativeName) {
                  message += ' Use ' + options.alternativeName + ' instead. ';
              }
  
              if (options.extraInfo) {
                  message += ' ' + options.extraInfo;
              }
  
              if (deprecatedLocation === '') {
                  deprecatedLocation = ' \n ' + 'No stack trace of the deprecated usage is available in your current browser.';
              } else {
                  deprecatedLocation = ' \n ' + deprecatedLocation;
              }
  
              if (options.extraObject) {
                  message += '\n';
                  logger(message, options.extraObject, deprecatedLocation);
              } else {
                  logger(message, deprecatedLocation);
              }
          }
      };
  }
  
  function logCssDeprecation(selectorMap, newNode) {
      var displayName = selectorMap.options.displayName;
      displayName = displayName ? ' (' + displayName + ')' : '';
  
      var options = _jquery2.default.extend({
          deprecationType: 'CSS',
          extraObject: newNode
      }, selectorMap.options);
  
      getShowDeprecationMessage('\'' + selectorMap.selector + '\' pattern' + displayName, options)();
  }
  
  /**
  * Returns a wrapped version of the function that logs a deprecation warning when the function is used.
  * @param {Function} fn the fn to wrap
  * @param {string} displayName the name of the fn to be displayed in the message
  * @param {string} options.removeInVersion the version this will be removed in
  * @param {string} options.alternativeName the name of an alternative to use
  * @param {string} options.sinceVersion the version this has been deprecated since
  * @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
  * @return {Function} wrapping the original function
  */
  function deprecateFunctionExpression(fn, displayName, options) {
      options = options || {};
      options.deprecationType = options.deprecationType || 'JS';
  
      var showDeprecationMessage = getShowDeprecationMessage(displayName || fn.name || 'this function', options);
      return function () {
          showDeprecationMessage();
          return fn.apply(this, arguments);
      };
  }
  
  /**
  * Returns a wrapped version of the constructor that logs a deprecation warning when the constructor is instantiated.
  * @param {Function} constructorFn the constructor function to wrap
  * @param {string} displayName the name of the fn to be displayed in the message
  * @param {string} options.removeInVersion the version this will be removed in
  * @param {string} options.alternativeName the name of an alternative to use
  * @param {string} options.sinceVersion the version this has been deprecated since
  * @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
  * @return {Function} wrapping the original function
  */
  function deprecateConstructor(constructorFn, displayName, options) {
      options = options || {};
      options.deprecationType = options.deprecationType || 'JS';
  
      var deprecatedConstructor = deprecateFunctionExpression(constructorFn, displayName, options);
      deprecatedConstructor.prototype = constructorFn.prototype;
      _jquery2.default.extend(deprecatedConstructor, constructorFn); //copy static methods across;
  
      return deprecatedConstructor;
  }
  
  var supportsProperties = false;
  try {
      if (Object.defineProperty) {
          Object.defineProperty({}, 'blam', { get: function get() {}, set: function set() {} });
          exports.propertyDeprecationSupported = supportsProperties = true;
      }
  } catch (e) {}
  /* IE8 doesn't support on non-DOM elements */
  
  
  /**
  * Wraps a "value" object property in a deprecation warning in browsers supporting Object.defineProperty
  * @param {Object} obj the object containing the property
  * @param {string} prop the name of the property to deprecate
  * @param {string} options.removeInVersion the version this will be removed in
  * @param {string} options.displayName the display name of the property to deprecate (optional, will fall back to the property name)
  * @param {string} options.alternativeName the name of an alternative to use
  * @param {string} options.sinceVersion the version this has been deprecated since
  * @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
  */
  function deprecateValueProperty(obj, prop, options) {
      if (supportsProperties) {
          var oldVal = obj[prop];
          options = options || {};
          options.deprecationType = options.deprecationType || 'JS';
  
          var displayNameOrShowMessageFn = options.displayName || prop;
          var showDeprecationMessage = getShowDeprecationMessage(displayNameOrShowMessageFn, options);
          Object.defineProperty(obj, prop, {
              get: function get() {
                  showDeprecationMessage();
                  return oldVal;
              },
              set: function set(val) {
                  oldVal = val;
                  showDeprecationMessage();
                  return val;
              }
          });
      }
  }
  
  /**
  * Wraps an object property in a deprecation warning, if possible. functions will always log warnings, but other
  * types of properties will only log in browsers supporting Object.defineProperty
  * @param {Object} obj the object containing the property
  * @param {string} prop the name of the property to deprecate
  * @param {string} options.removeInVersion the version this will be removed in
  * @param {string} options.displayName the display name of the property to deprecate (optional, will fall back to the property name)
  * @param {string} options.alternativeName the name of an alternative to use
  * @param {string} options.sinceVersion the version this has been deprecated since
  * @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
  */
  function deprecateObjectProperty(obj, prop, options) {
      if (typeof obj[prop] === 'function') {
          options = options || {};
          options.deprecationType = options.deprecationType || 'JS';
  
          var displayNameOrShowMessageFn = options.displayName || prop;
          obj[prop] = deprecateFunctionExpression(obj[prop], displayNameOrShowMessageFn, options);
      } else {
          deprecateValueProperty(obj, prop, options);
      }
  }
  
  /**
  * Wraps all an objects properties in a deprecation warning, if possible. functions will always log warnings, but other
  * types of properties will only log in browsers supporting Object.defineProperty
  * @param {Object} obj the object to be wrapped
  * @param {string} objDisplayPrefix the object's prefix to be used in logs
  * @param {string} options.removeInVersion the version this will be removed in
  * @param {string} options.alternativeNamePrefix the name of another object to prefix the deprecated objects properties with
  * @param {string} options.sinceVersion the version this has been deprecated since
  * @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
  */
  function deprecateAllProperties(obj, objDisplayPrefix, options) {
      options = options || {};
      for (var attr in obj) {
          if (has.call(obj, attr)) {
              options.deprecationType = options.deprecationType || 'JS';
              options.displayName = objDisplayPrefix + attr;
              options.alternativeName = options.alternativeNamePrefix && options.alternativeNamePrefix + attr;
              deprecateObjectProperty(obj, attr, _jquery2.default.extend({}, options));
          }
      }
  }
  
  function matchesSelector(el, selector) {
      return (el.matches || el.msMatchesSelector || el.webkitMatchesSelector || el.mozMatchesSelector || el.oMatchesSelector).call(el, selector);
  }
  
  function handleAddingSelector(options) {
      return function (selector) {
          var selectorMap = {
              selector: selector,
              options: options || {}
          };
  
          deprecatedSelectorMap.push(selectorMap);
  
          // Search if matches have already been added
          var matches = document.querySelectorAll(selector);
          for (var i = 0; i < matches.length; i++) {
              logCssDeprecation(selectorMap, matches[i]);
          }
      };
  }
  
  /**
  * Return a function that logs a deprecation warning to the console the first time it is called from a certain location.
  * It will also print the stack frame of the calling function.
  *
  * @param {string|Array} selectors a selector or list of selectors that match deprecated markup
  * @param {object} options
  * @param {string} options.displayName a name describing these selectors
  * @param {string} options.alternativeName the name of an alternative to use
  * @param {string} options.removeInVersion the version these will be removed in
  * @param {string} options.sinceVersion the version these have been deprecated since
  * @param {string} options.extraInfo extra information to be printed at the end of the deprecation log
  */
  function deprecateCSS(selectors, options) {
      if (!window.MutationObserver) {
          logger('CSS could not be deprecated as Mutation Observer was not found.');
          return;
      }
  
      if (typeof selectors === 'string') {
          selectors = [selectors];
      }
  
      selectors.forEach(handleAddingSelector(options));
  }
  
  function testAndHandleDeprecation(newNode) {
      return function (selectorMap) {
          if (matchesSelector(newNode, selectorMap.selector)) {
              logCssDeprecation(selectorMap, newNode);
          }
      };
  }
  
  if (window.MutationObserver) {
      var observer = new MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
              // TODO - should this also look at class changes, if possible?
              var addedNodes = mutation.addedNodes;
  
              for (var i = 0; i < addedNodes.length; i++) {
                  var newNode = addedNodes[i];
                  if (newNode.nodeType === 1) {
                      deprecatedSelectorMap.forEach(testAndHandleDeprecation(newNode));
                  }
              }
          });
      });
  
      var config = {
          childList: true,
          subtree: true
      };
  
      observer.observe(document, config);
  }
  
  var deprecate = {
      fn: deprecateFunctionExpression,
      construct: deprecateConstructor,
      css: deprecateCSS,
      prop: deprecateObjectProperty,
      obj: deprecateAllProperties,
      propertyDeprecationSupported: supportsProperties,
      getMessageLogger: getShowDeprecationMessage
  };
  
  (0, _globalize2.default)('deprecate', deprecate);
  
  exports.fn = deprecateFunctionExpression;
  exports.construct = deprecateConstructor;
  exports.css = deprecateCSS;
  exports.prop = deprecateObjectProperty;
  exports.obj = deprecateAllProperties;
  exports.propertyDeprecationSupported = supportsProperties;
  exports.getMessageLogger = getShowDeprecationMessage;
  
  return module.exports;
}).call(this);