// src/js/aui/flag.js
(typeof window === 'undefined' ? global : window).__fdc0359427714432468af96b460aa252 = (function () {
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
  
  var _animation = __6debdf74a4da8ac8391a98223e1bae21;
  
  var _amdify = __65ca28a9d6b0f244027266ff8e6a6d1c;
  
  var _amdify2 = _interopRequireDefault(_amdify);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _keyCode = __e246bf93af36eb4453f35afeb1c302d9;
  
  var _keyCode2 = _interopRequireDefault(_keyCode);
  
  var _template = __43d4585c6a21591b4ceac1b326c09405;
  
  var _template2 = _interopRequireDefault(_template);
  
  var _customEvent = __f7a5e0d2ea8865b104efc9b94861591e;
  
  var _customEvent2 = _interopRequireDefault(_customEvent);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var AUTO_CLOSE_TIME = 5000;
  var ID_FLAG_CONTAINER = 'aui-flag-container';
  var defaultOptions = {
      body: '',
      close: 'manual',
      title: '',
      type: 'info'
  };
  
  function flag(options) {
      options = _jquery2.default.extend({}, defaultOptions, options);
  
      var $flag = renderFlagElement(options);
      extendFlagElement($flag);
  
      if (options.close === 'auto') {
          makeCloseable($flag);
          makeAutoClosable($flag);
      } else if (options.close === 'manual') {
          makeCloseable($flag);
      }
  
      pruneFlagContainer();
  
      return insertFlag($flag);
  }
  
  function extendFlagElement($flag) {
      var flag = $flag[0];
  
      flag.close = function () {
          closeFlag($flag);
      };
  }
  
  function renderFlagElement(options) {
      var html = '<div class="aui-flag">' + '<div class="aui-message aui-message-{type} {type} {closeable} shadowed">' + '<p class="title">' + '<strong>{title}</strong>' + '</p>' + '{body}<!-- .aui-message -->' + '</div>' + '</div>';
      var rendered = (0, _template2.default)(html).fill({
          'body:html': options.body || '',
          closeable: options.close === 'never' ? '' : 'closeable',
          title: options.title || '',
          type: options.type
      }).toString();
  
      return (0, _jquery2.default)(rendered);
  }
  
  function makeCloseable($flag) {
      var $icon = (0, _jquery2.default)('<span class="aui-icon icon-close" role="button" tabindex="0"></span>');
  
      $icon.click(function () {
          closeFlag($flag);
      });
  
      $icon.keypress(function (e) {
          if (e.which === _keyCode2.default.ENTER || e.which === _keyCode2.default.SPACE) {
              closeFlag($flag);
              e.preventDefault();
          }
      });
  
      return $flag.find('.aui-message').append($icon)[0];
  }
  
  function makeAutoClosable($flag) {
      $flag.find('.aui-message').addClass('aui-will-close');
      setTimeout(function () {
          $flag[0].close();
      }, AUTO_CLOSE_TIME);
  }
  
  function closeFlag($flagToClose) {
      var flag = $flagToClose.get(0);
  
      flag.setAttribute('aria-hidden', 'true');
      flag.dispatchEvent(new _customEvent2.default('aui-flag-close', { bubbles: true }));
  
      return flag;
  }
  
  function pruneFlagContainer() {
      var $container = findContainer();
      var $allFlags = $container.find('.aui-flag');
  
      $allFlags.get().forEach(function (flag) {
          var isFlagAriaHidden = flag.getAttribute('aria-hidden') === 'true';
  
          if (isFlagAriaHidden) {
              (0, _jquery2.default)(flag).remove();
          }
      });
  }
  
  function findContainer() {
      return (0, _jquery2.default)('#' + ID_FLAG_CONTAINER);
  }
  
  function insertFlag($flag) {
      var $flagContainer = findContainer();
  
      if (!$flagContainer.length) {
          $flagContainer = (0, _jquery2.default)('<div id="' + ID_FLAG_CONTAINER + '"></div>');
          (0, _jquery2.default)('body').prepend($flagContainer);
      }
  
      $flag.appendTo($flagContainer);
      (0, _animation.recomputeStyle)($flag);
  
      return $flag.attr('aria-hidden', 'false')[0];
  }
  
  (0, _amdify2.default)('aui/flag', flag);
  (0, _globalize2.default)('flag', flag);
  exports.default = flag;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);