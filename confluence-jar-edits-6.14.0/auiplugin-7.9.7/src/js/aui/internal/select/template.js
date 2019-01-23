// src/js/aui/internal/select/template.js
(typeof window === 'undefined' ? global : window).__7865c6da767e205eeac86fc044ce472b = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _skatejsTemplateHtml = __c6b5725916d210b9653318d2ea2472cb;
  
  var _skatejsTemplateHtml2 = _interopRequireDefault(_skatejsTemplateHtml);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  exports.default = (0, _skatejsTemplateHtml2.default)('\n    <input type="text" class="text" autocomplete="off" role="combobox" aria-autocomplete="list" aria-haspopup="true" aria-expanded="false">\n    <select></select>\n    <datalist>\n        <content select="aui-option"></content>\n    </datalist>\n    <button class="aui-button" role="button" tabindex="-1" type="button"></button>\n    <div class="aui-popover" role="listbox" data-aui-alignment="bottom left">\n        <ul class="aui-optionlist" role="presentation"></ul>\n    </div>\n    <div class="aui-select-status assistive" aria-live="polite" role="status"></div>\n');
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);