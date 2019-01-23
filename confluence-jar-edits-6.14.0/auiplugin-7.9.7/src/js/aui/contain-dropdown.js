// src/js/aui/contain-dropdown.js
(typeof window === 'undefined' ? global : window).__52a74afd29a9ba78099fd55036d7da10 = (function () {
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
  
  function containDropdown(dropdown, containerSelector, dynamic) {
      function getDropdownOffset() {
          return dropdown.$.offset().top - (0, _jquery2.default)(containerSelector).offset().top;
      }
  
      var container;
      var ddOffset;
      var availableArea;
      var shadowOffset = 25;
  
      if (dropdown.$.parents(containerSelector).length !== -1) {
          container = (0, _jquery2.default)(containerSelector);
          ddOffset = getDropdownOffset();
          shadowOffset = 30;
          availableArea = container.outerHeight() - ddOffset - shadowOffset;
  
          if (availableArea <= parseInt(dropdown.$.attr('scrollHeight'), 10)) {
              containDropdown.containHeight(dropdown, availableArea);
          } else if (dynamic) {
              containDropdown.releaseContainment(dropdown);
          }
          dropdown.reset();
      }
  };
  
  containDropdown.containHeight = function (dropdown, availableArea) {
      dropdown.$.css({
          height: availableArea
      });
      if (dropdown.$.css('overflowY') !== 'scroll') {
          dropdown.$.css({
              width: 15 + dropdown.$.attr('scrollWidth'),
              overflowY: 'scroll',
              overflowX: 'hidden'
          });
      }
  };
  
  containDropdown.releaseContainment = function (dropdown) {
      dropdown.$.css({
          height: '',
          width: '',
          overflowY: '',
          overflowX: ''
      });
  };
  
  (0, _globalize2.default)('containDropdown', containDropdown);
  
  exports.default = containDropdown;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);