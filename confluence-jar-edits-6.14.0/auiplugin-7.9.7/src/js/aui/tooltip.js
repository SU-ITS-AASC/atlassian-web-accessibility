// src/js/aui/tooltip.js
(typeof window === 'undefined' ? global : window).__e8e9fc435c352b74c65e5f8d64ed692c = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  __8c05d85e3d7fb791ad5071fea16ddb09;
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function handleStringOption($self, options, stringOption) {
      // Pass string values straight to tipsy
      $self.tipsy(stringOption);
  
      if (stringOption === 'destroy') {
          if (options.live) {
              (0, _jquery2.default)($self.context).off('.tipsy', $self.selector);
          } else {
              $self.unbind('.tipsy');
          }
      }
  
      return $self;
  }
  
  function bindTooltip($self, options) {
      $self.tipsy(options);
  
      var hideOnClick = options && options.hideOnClick && (options.trigger === 'hover' || !options.trigger && $self.tipsy.defaults.trigger === 'hover');
      if (hideOnClick) {
          var onClick = function onClick() {
              (0, _jquery2.default)(this).tipsy('hide');
          };
          if (options.live) {
              (0, _jquery2.default)($self.context).on('click.tipsy', $self.selector, onClick);
          } else {
              $self.bind('click.tipsy', onClick);
          }
      }
      return $self;
  }
  
  _jquery2.default.fn.tooltip = function (options) {
      var allOptions = _jquery2.default.extend({}, _jquery2.default.fn.tooltip.defaults, options);
  
      // Handle live option
      if (allOptions.live) {
          if (typeof options === 'string') {
              handleStringOption(this, allOptions, options);
          } else {
              bindTooltip(this, allOptions);
          }
          return this;
      }
  
      // If not live, bind each object in the collection
      return this.each(function () {
          var $this = (0, _jquery2.default)(this);
          if (typeof options === 'string') {
              handleStringOption($this, allOptions, options);
          } else {
              bindTooltip($this, allOptions);
          }
          return $this;
      });
  };
  
  _jquery2.default.fn.tooltip.defaults = {
      opacity: 1.0,
      offset: 1,
      delayIn: 500,
      hoverable: true,
      hideOnClick: true,
      aria: true
  };
  
  return module.exports;
}).call(this);