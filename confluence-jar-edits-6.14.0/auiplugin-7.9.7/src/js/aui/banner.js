// src/js/aui/banner.js
(typeof window === 'undefined' ? global : window).__43174540fe92a0d9aeac77ff3a236665 = (function () {
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
  
  var _template = __43d4585c6a21591b4ceac1b326c09405;
  
  var _template2 = _interopRequireDefault(_template);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var ID_BANNER_CONTAINER = 'header';
  
  function banner(options) {
      var $banner = renderBannerElement(options);
  
      pruneBannerContainer();
      insertBanner($banner);
  
      return $banner[0];
  }
  
  function renderBannerElement(options) {
      var html = '<div class="aui-banner aui-banner-{type}" role="banner">' + '{body}' + '</div>';
  
      var $banner = (0, _jquery2.default)((0, _template2.default)(html).fill({
          'type': 'error',
          'body:html': options.body || ''
      }).toString());
  
      return $banner;
  }
  
  function pruneBannerContainer() {
      var $container = findContainer();
      var $allBanners = $container.find('.aui-banner');
  
      $allBanners.get().forEach(function (banner) {
          var isBannerAriaHidden = banner.getAttribute('aria-hidden') === 'true';
          if (isBannerAriaHidden) {
              (0, _jquery2.default)(banner).remove();
          }
      });
  }
  
  function findContainer() {
      return (0, _jquery2.default)('#' + ID_BANNER_CONTAINER);
  }
  
  function insertBanner($banner) {
      var $bannerContainer = findContainer();
      if (!$bannerContainer.length) {
          throw new Error('You must implement the application header');
      }
  
      $banner.prependTo($bannerContainer);
      (0, _animation.recomputeStyle)($banner);
      $banner.attr('aria-hidden', 'false');
  }
  
  (0, _amdify2.default)('aui/banner', banner);
  (0, _globalize2.default)('banner', banner);
  exports.default = banner;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);