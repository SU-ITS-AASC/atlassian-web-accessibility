// src/js/aui/navigation.js
(typeof window === 'undefined' ? global : window).__c4bf0135de94f554dfd06da5aa73ceee = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  __fa714f1b12d7502957e4e0b6196321bf;
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _skate = __0ac9a2c09f995a9c0a478af8742f59b7;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _widget = __d2e8fc66dac2ecebdc205fcab991f687;
  
  var _widget2 = _interopRequireDefault(_widget);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Navigation (".aui-nav" elements).
   *
   * @param {(string|HtmlElement|jQuery)} selector - An expression
   *     representing a single .aui-nav element; you may also pass an expression
   *     for a descendent element, in which case the closest containing
   *     .aui-nav element is used.
   * @constructor
   */
  function Navigation(selector) {
      this.$el = (0, _jquery2.default)(selector).closest('.aui-nav');
  
      // If there are multiple objects, initialise them separately
      if (this.$el.length > 1) {
          return this.$el.map(function (idx, elm) {
              return new Navigation(elm);
          })[0];
      }
  
      // If already initialised, return existing object
      if (this.$el.data('aui-navigation')) {
          return this.$el.data('aui-navigation');
      }
  
      this.$el.data('aui-navigation', this);
  
      this.$treeParent = this.$el.parent('li[aria-expanded]');
      this.$subtreeToggleIcon = this.$treeParent.children('.aui-nav-subtree-toggle').children('span.aui-icon');
  
      // Hide extra items under a 'More...' link
      this.hideMoreItems();
  
      // Add child-selected class to relevant attributes
      this.$el.children('li:has(.aui-nav-selected)').addClass('aui-nav-child-selected');
  
      // Auto-expand if child is selected
      var $selected = this.$el.children('.aui-nav-selected');
      $selected.parents('.aui-nav > [aria-expanded=false]').add($selected.filter('[aria-expanded=false]')).each(function () {
          var nav = navigationWidget((0, _jquery2.default)(this).children('.aui-nav'));
          nav.expand();
      });
  
      // Toggle expand on click
      this.$el.find('> li[aria-expanded] > .aui-nav-subtree-toggle').on('click', function () {
          var nav = navigationWidget((0, _jquery2.default)(this).siblings('.aui-nav'));
          nav.toggle();
      });
  
      return this;
  }
  
  Navigation.prototype.isNested = function () {
      return this.$treeParent.length === 1;
  };
  
  Navigation.prototype.isCollapsed = function () {
      return this.$treeParent.attr('aria-expanded') === 'false';
  };
  
  Navigation.prototype.expand = function () {
      this.$treeParent.attr('aria-expanded', 'true');
      this.$subtreeToggleIcon.removeClass('aui-iconfont-collapsed').addClass('aui-iconfont-expanded');
      this.hideMoreItems();
      return this;
  };
  
  Navigation.prototype.collapse = function () {
      this.$treeParent.attr('aria-expanded', 'false');
      this.$subtreeToggleIcon.removeClass('aui-iconfont-expanded').addClass('aui-iconfont-collapsed');
      return this;
  };
  
  Navigation.prototype.toggle = function () {
      if (this.isCollapsed()) {
          this.expand();
      } else {
          this.collapse();
      }
      return this;
  };
  
  Navigation.prototype.hideMoreItems = function () {
      if (this.$el.is('.aui-nav:not([aria-expanded=false]) [data-more]')) {
          var moreText = this.$el.attr('data-more') || AJS.I18n.getText('aui.words.moreitem');
          var limit = Math.abs(parseInt(this.$el.attr('data-more-limit'))) || 5;
          var $listElements = this.$el.children('li');
  
          // Only add 'More...' if there is more than one element to hide and there are no selected elements
          var lessThanTwoToHide = $listElements.length <= limit + 1;
          var selectedElementPresent = $listElements.filter('.aui-nav-selected').length;
          var alreadyInitialised = $listElements.filter('.aui-nav-more').length;
          if (lessThanTwoToHide || selectedElementPresent || alreadyInitialised) {
              return this;
          }
  
          (0, _jquery2.default)('<li>', {
              'class': 'aui-nav-more',
              'aria-hidden': 'true'
          }).append((0, _jquery2.default)('<a>', {
              'href': '#',
              'class': 'aui-nav-item',
              'text': moreText,
              'click': function click(e) {
                  e.preventDefault();
                  (0, _jquery2.default)(this).parent().remove();
              }
          })).insertAfter($listElements.eq(limit - 1));
      }
  
      return this;
  };
  
  var navigationWidget = (0, _widget2.default)('navigation', Navigation);
  
  // Initialise nav elements
  (0, _skate2.default)('aui-nav', {
      type: _skate2.default.type.CLASSNAME,
      attached: function attached(element) {
          new Navigation(element);
      },
      detached: function detached(element) {
          (0, _jquery2.default)(element).removeData();
      }
  });
  
  (0, _globalize2.default)('navigation', navigationWidget);
  
  exports.default = navigationWidget;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);