// src/js/aui/on-text-resize.js
(typeof window === 'undefined' ? global : window).__9a2cde50c39116ec3f36bd040c98b8ba = (function () {
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
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function onTextResize(f) {
      if (typeof f === 'function') {
          if (onTextResize['on-text-resize']) {
              onTextResize['on-text-resize'].push(function (emsize) {
                  f(emsize);
              });
          } else {
              var em = (0, _jquery2.default)('<div></div>');
  
              em.css({
                  width: '1em',
                  height: '1em',
                  position: 'absolute',
                  top: '-9999em',
                  left: '-9999em'
              });
  
              (0, _jquery2.default)('body').append(em);
              em.size = em.width();
  
              setInterval(function () {
                  if (em.size !== em.width()) {
                      em.size = em.width();
  
                      for (var i = 0, ii = onTextResize['on-text-resize'].length; i < ii; i++) {
                          onTextResize['on-text-resize'][i](em.size);
                      }
                  }
              }, 0);
              onTextResize.em = em;
              onTextResize['on-text-resize'] = [function (emsize) {
                  f(emsize);
              }];
          }
      }
  }
  
  (0, _globalize2.default)('onTextResize', onTextResize);
  
  exports.default = onTextResize;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);