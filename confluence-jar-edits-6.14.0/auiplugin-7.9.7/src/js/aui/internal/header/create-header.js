// src/js/aui/internal/header/create-header.js
(typeof window === 'undefined' ? global : window).__455206c30630fecc55c648cca374a3ea = (function () {
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
  
  var _customEvent = __f7a5e0d2ea8865b104efc9b94861591e;
  
  var _customEvent2 = _interopRequireDefault(_customEvent);
  
  var _debounce = __ee62e24d4acb40214d4f9e21b1a58bfc;
  
  var _debounce2 = _interopRequireDefault(_debounce);
  
  var _i18n = __fa714f1b12d7502957e4e0b6196321bf;
  
  var _i18n2 = _interopRequireDefault(_i18n);
  
  var _skate = __0ac9a2c09f995a9c0a478af8742f59b7;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  var _skatejsTemplateHtml = __c6b5725916d210b9653318d2ea2472cb;
  
  var _skatejsTemplateHtml2 = _interopRequireDefault(_skatejsTemplateHtml);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var $window = (0, _jquery2.default)(window);
  
  function Header(element) {
      var that = this;
  
      this.element = element;
      this.$element = (0, _jquery2.default)(element);
      this.index = (0, _jquery2.default)('aui-header, .aui-header').index(element);
      this.$secondaryNav = this.$element.find('.aui-header-secondary .aui-nav').first();
      this.menuItems = [];
      this.totalWidth = 0;
      this.$moreMenu = undefined;
      this.rightMostNavItemIndex = undefined;
      this.$applicationLogo = this.$element.find('#logo');
      this.moreMenuWidth = 0;
      this.primaryButtonsWidth = 0;
  
      // to cache the selector and give .find convenience
      this.$headerFind = function () {
          var $header = (0, _jquery2.default)(that.$element[0].querySelector('.aui-header-primary'));
  
          return function (selector) {
              return $header.find(selector);
          };
      }();
  }
  
  Header.prototype = {
      init: function init() {
          var that = this;
  
          this.element.setAttribute('data-aui-responsive', 'true');
          this.$headerFind('.aui-button').parent().each(function () {
              that.primaryButtonsWidth += (0, _jquery2.default)(this).outerWidth(true);
          });
  
          // remember the widths of all the menu items
          this.$headerFind('.aui-nav > li > a:not(.aui-button)').each(function () {
              var $this = (0, _jquery2.default)(this).parent();
              var outerWidth = $this.outerWidth(true);
  
              that.totalWidth += outerWidth;
              that.menuItems.push({
                  $element: $this,
                  outerWidth: outerWidth
              });
          });
  
          /** The zero based index of the right-most visible nav menu item. */
          this.rightMostNavItemIndex = this.menuItems.length - 1;
  
          $window.on('resize', this._resizeHandler = (0, _debounce2.default)(function () {
              that.constructResponsiveDropdown();
          }, 100));
  
          // So that the header logo doesn't mess things up. (size is unknown before the image loads)
          var $logoImg = this.$applicationLogo.find('img');
  
          if ($logoImg.length !== 0) {
              $logoImg.attr('data-aui-responsive-header-index', this.index);
              $logoImg.on('load', function () {
                  that.constructResponsiveDropdown();
              });
          }
  
          this.constructResponsiveDropdown();
  
          // show the aui nav (hidden via css on load)
          this.$headerFind('.aui-nav').css('width', 'auto');
      },
  
      destroy: function destroy() {
          $window.off('resize', this._resizeHandler);
      },
  
      // calculate widths based on the current state of the page
      calculateAvailableWidth: function calculateAvailableWidth() {
          // if there is no secondary nav, use the right of the screen as the boundary instead
          var rightMostBoundary = this.$secondaryNav.is(':visible') ? this.$secondaryNav.offset().left : this.$element.outerWidth();
  
          // the right most side of the primary nav, this is assumed to exists if this code is running
          var primaryNavRight = this.$applicationLogo.offset().left + this.$applicationLogo.outerWidth(true) + this.primaryButtonsWidth;
  
          return rightMostBoundary - primaryNavRight;
      },
  
      showResponsiveDropdown: function showResponsiveDropdown() {
          if (this.$moreMenu === undefined) {
              this.$moreMenu = this.createResponsiveDropdownTrigger();
          }
          this.$moreMenu.css('display', '');
      },
  
      hideResponsiveDropdown: function hideResponsiveDropdown() {
          if (this.$moreMenu !== undefined) {
              this.$moreMenu.css('display', 'none');
          }
      },
  
      constructResponsiveDropdown: function constructResponsiveDropdown() {
          if (!this.menuItems.length) {
              return;
          }
  
          var remainingWidth;
          var availableWidth = this.calculateAvailableWidth(this.$element, this.primaryButtonsWidth);
  
          if (availableWidth > this.totalWidth) {
              this.showAll();
          } else {
              this.showResponsiveDropdown();
              remainingWidth = availableWidth - this.moreMenuWidth;
  
              // Figure out how many nav menu items fit into the available space.
              var newRightMostNavItemIndex = -1;
              while (remainingWidth - this.menuItems[newRightMostNavItemIndex + 1].outerWidth >= 0) {
                  remainingWidth -= this.menuItems[newRightMostNavItemIndex + 1].outerWidth;
                  newRightMostNavItemIndex++;
              }
  
              if (newRightMostNavItemIndex < this.rightMostNavItemIndex) {
                  this.moveToResponsiveDropdown(this.rightMostNavItemIndex - newRightMostNavItemIndex);
              } else if (this.rightMostNavItemIndex < newRightMostNavItemIndex) {
                  this.moveOutOfResponsiveDropdown(newRightMostNavItemIndex - this.rightMostNavItemIndex);
              }
          }
      },
  
      // creates the trigger and content elements for the show more dropdown
      createResponsiveDropdownTrigger: function createResponsiveDropdownTrigger() {
          var moreNavItemEl = document.createElement('li');
          var dropdownEl = document.createElement('aui-dropdown-menu');
          dropdownEl.id = 'aui-responsive-header-dropdown-' + this.index;
          _skate2.default.init(dropdownEl);
  
          var dropdownSectionEl = document.createElement('aui-section');
          dropdownSectionEl.id = 'aui-responsive-header-dropdown-list-' + this.index;
          _skate2.default.init(dropdownSectionEl);
  
          _skatejsTemplateHtml2.default.wrap(dropdownEl).appendChild(dropdownSectionEl);
  
          var triggerEl = createTriggerAndAssociate(dropdownEl);
          moreNavItemEl.appendChild(triggerEl);
          moreNavItemEl.appendChild(dropdownEl);
  
          // Append the More menu before any primary buttons.
          if (this.primaryButtonsWidth === 0) {
              this.$headerFind('.aui-nav').append(moreNavItemEl);
          } else {
              this.$headerFind('.aui-nav > li > .aui-button:first').parent().before(moreNavItemEl);
          }
  
          this.moreMenuWidth = (0, _jquery2.default)(moreNavItemEl).outerWidth(true);
          return (0, _jquery2.default)(moreNavItemEl);
      },
  
      // function that handles moving items out of the show more menu into the app header
      moveOutOfResponsiveDropdown: function moveOutOfResponsiveDropdown(numItems) {
          if (numItems <= 0) {
              return;
          }
  
          var $moreDropdown = (0, _jquery2.default)('#aui-responsive-header-dropdown-' + this.index);
  
          // Move items (working top-to-bottom) from the more menu into the nav bar.
          var leftMostIndexToMove = this.rightMostNavItemIndex + 1;
          var rightMostIndexToMove = this.rightMostNavItemIndex + numItems;
          for (var i = leftMostIndexToMove; i <= rightMostIndexToMove; i++) {
              var $navItem = this.menuItems[i].$element;
              var $navItemTrigger = $navItem.children('a');
  
              if ($navItemTrigger.attr('aria-controls')) {
                  var $navItemDropdown = (0, _jquery2.default)(document.getElementById($navItemTrigger.attr('aria-controls')));
                  $navItemDropdown.removeClass('aui-dropdown2-sub-menu');
                  $navItem.append($navItemDropdown);
              }
  
              $moreDropdown.find('aui-item-link:first').remove();
              $navItem.insertBefore(this.$moreMenu);
          }
  
          this.rightMostNavItemIndex += numItems;
      },
  
      // function that handles moving items into the show more menu
      moveToResponsiveDropdown: function moveToResponsiveDropdown(numItems) {
          if (numItems <= 0) {
              return;
          }
  
          var moreDropdownSectionEl = _skatejsTemplateHtml2.default.wrap(this.$moreMenu[0].querySelector('aui-section'));
  
          // Move items (working right-to-left) from the nav bar to the more menu.
          var rightMostIndexToMove = this.rightMostNavItemIndex;
          var leftMostIndexToMove = this.rightMostNavItemIndex - numItems + 1;
          for (var i = rightMostIndexToMove; i >= leftMostIndexToMove; i--) {
              var $navItem = this.menuItems[i].$element;
              var $navItemTrigger = $navItem.children('a');
              _skate2.default.init($navItemTrigger); // ensure all triggers have gone through their lifecycle before we check for submenus
  
              var moreDropdownItemEl = document.createElement('aui-item-link');
              moreDropdownItemEl.setAttribute('href', $navItemTrigger.attr('href'));
              if ($navItemTrigger.attr('aria-controls')) {
                  var $navItemDropdown = (0, _jquery2.default)(document.getElementById($navItemTrigger.attr('aria-controls')));
                  moreDropdownItemEl.setAttribute('for', $navItemTrigger.attr('aria-controls'));
                  $navItemDropdown.addClass('aui-dropdown2-sub-menu');
                  $navItemDropdown.appendTo('body');
              }
              _skate2.default.init(moreDropdownItemEl);
              _skatejsTemplateHtml2.default.wrap(moreDropdownItemEl).textContent = $navItemTrigger.text();
  
              $navItem.detach();
              moreDropdownSectionEl.insertBefore(moreDropdownItemEl, moreDropdownSectionEl.firstChild);
              this.element.dispatchEvent(new _customEvent2.default('aui-responsive-menu-item-created', {
                  bubbles: true,
                  detail: {
                      originalItem: $navItem[0],
                      newItem: moreDropdownItemEl
                  }
              }));
          }
  
          this.rightMostNavItemIndex -= numItems;
      },
  
      // function that handles show everything
      showAll: function showAll() {
          this.moveOutOfResponsiveDropdown(this.menuItems.length - 1 - this.rightMostNavItemIndex);
          this.hideResponsiveDropdown();
      }
  };
  
  function createTriggerAndAssociate(dropdown) {
      var trigger = document.createElement('a');
      trigger.setAttribute('class', 'aui-dropdown2-trigger');
      trigger.setAttribute('href', '#');
      trigger.id = dropdown.id + '-trigger';
      trigger.setAttribute('aria-controls', dropdown.id);
      trigger.innerHTML = _i18n2.default.getText('aui.words.more');
  
      return trigger;
  }
  
  /**
   * Initialise a Header, or return an existing Header for an element.
   */
  function createHeader(element) {
      var header = element._header;
      if (!(header instanceof Header)) {
          header = new Header(element);
          header.init();
          element._header = header;
      }
      return header;
  }
  
  exports.default = createHeader;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);