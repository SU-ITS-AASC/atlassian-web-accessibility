// src/js/aui/events.js
(typeof window === 'undefined' ? global : window).__f3ccb1e110c37fc6c95e5fa43d2c3f4f = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.triggerEvtForInst = exports.triggerEvt = exports.bindEvt = undefined;
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _deprecation = __921ad9514d56376fef992861d9ec0f51;
  
  var deprecate = _interopRequireWildcard(_deprecation);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var eventRoot = document || {};
  var $eventTarget = (0, _jquery2.default)(eventRoot);
  
  /**
   * Triggers a custom event on the AJS object
   *
   * @param {String} name - name of event
   * @param {Array} args - args for event handler
   */
  function triggerEvt(name, args) {
      $eventTarget.trigger(name, args);
  }
  
  /**
   * Binds handler to the AJS object
   *
   * @param {String} name
   * @param {Function} func
   */
  function bindEvt(name, func) {
      $eventTarget.bind(name, func);
  }
  
  /**
   * Some generic error handling that fires event in multiple contexts
   * - on AJS object
   * - on Instance
   * - on AJS object with prefixed id.
   *
   * @param evt
   * @param inst
   * @param args
   */
  function triggerEvtForInst(evt, inst, args) {
      (0, _jquery2.default)(inst).trigger(evt, args);
      triggerEvt(evt, args);
      if (inst.id) {
          triggerEvt(inst.id + '-' + evt, args);
      }
  }
  
  exports.bindEvt = bindEvt = deprecate.fn(bindEvt, 'bindEvt', {
      sinceVersion: '5.8.0'
  });
  
  exports.triggerEvt = triggerEvt = deprecate.fn(triggerEvt, 'triggerEvt', {
      sinceVersion: '5.8.0'
  });
  
  exports.triggerEvtForInst = triggerEvtForInst = deprecate.fn(triggerEvtForInst, 'triggerEvtForInst', {
      sinceVersion: '5.8.0'
  });
  
  (0, _globalize2.default)('bindEvt', bindEvt);
  (0, _globalize2.default)('triggerEvt', triggerEvt);
  (0, _globalize2.default)('triggerEvtForInst', triggerEvtForInst);
  
  exports.bindEvt = bindEvt;
  exports.triggerEvt = triggerEvt;
  exports.triggerEvtForInst = triggerEvtForInst;
  
  return module.exports;
}).call(this);