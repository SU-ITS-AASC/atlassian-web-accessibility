// src/js/aui/binder.js
(typeof window === 'undefined' ? global : window).__0bbb661b86f4b304c81cc691259d70c9 = (function () {
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
  
  var _deprecation = __921ad9514d56376fef992861d9ec0f51;
  
  var deprecate = _interopRequireWildcard(_deprecation);
  
  var _log = __c1e961001275c079e48525ad3a48c8c2;
  
  var logger = _interopRequireWildcard(_log);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Support for markup based binder components. Binder components must be objects with the following "interface":
   *
   * <pre>
   * {
   *   selector: "input.foo",
   *   run: function(element) {
   *      //do stuff on given element
   *   }
   * }
   * </pre>
   */
  var Binder = function () {
  
      var binders = {};
  
      return {
          /**
           * Runs all the binder components for the given scope, or the document body if none specified.
           *
           * @method runBinders
           * @param scope {Element} element scope to run the binders in
           */
          runBinders: function runBinders(scope) {
              if (_jquery2.default.isEmptyObject(binders)) {
                  logger.log('No binders to run');
                  return;
              }
  
              scope = scope || document.body;
  
              (0, _jquery2.default)('*:not(link, script)', scope).each(function (i, element) {
                  var $element = (0, _jquery2.default)(element);
                  _jquery2.default.each(binders, function (id, binder) {
                      if (!$element.data(id) && $element.is(binder.selector)) {
                          logger.log('Running binder component: ' + id + ' on element ' + element);
                          $element.data(id, true); // so we don't bind to the same element again later
                          binder.run(element);
                      }
                  });
              });
          },
  
          /**
           * Register a binder component with the given id.
           * @method register
           */
          register: function register(id, binder) {
              binders[id] = binder;
          },
  
          /**
           * Unregister a binder component for the given id.
           * @method unregister
           */
          unregister: function unregister(id) {
              binders[id] = null;
          }
      };
  }();
  
  Binder = deprecate.construct(Binder, 'Binder', {
      sinceVersion: '5.8.0'
  });
  
  (0, _globalize2.default)('Binder', Binder);
  
  exports.default = Binder;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);