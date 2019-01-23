// src/js/aui/tabs.js
(typeof window === 'undefined' ? global : window).__5445bbb57d3600b27c6fd8e7cdd87f54 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  __c6b5725916d210b9653318d2ea2472cb;
  
  var _log = __c1e961001275c079e48525ad3a48c8c2;
  
  var logger = _interopRequireWildcard(_log);
  
  var _debounce = __ee62e24d4acb40214d4f9e21b1a58bfc;
  
  var _debounce2 = _interopRequireDefault(_debounce);
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _addId = __3b7b37131a17b9c12e44694d7b12c1e2;
  
  var _addId2 = _interopRequireDefault(_addId);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _isClipped = __9c7e09af5e0b55833c235e1d20ff8617;
  
  var _isClipped2 = _interopRequireDefault(_isClipped);
  
  var _skate = __0ac9a2c09f995a9c0a478af8742f59b7;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  var template = window.skateTemplateHtml;
  
  var REGEX = /#.*/;
  var STORAGE_PREFIX = '_internal-aui-tabs-';
  var RESPONSIVE_OPT_IN_SELECTOR = '.aui-tabs.horizontal-tabs[data-aui-responsive]:not([data-aui-responsive="false"]), aui-tabs[responsive]:not([responsive="false"])';
  
  function enhanceTabLink(link) {
      var $thisLink = (0, _jquery2.default)(link);
      var targetPane = $thisLink.attr('href');
  
      (0, _addId2.default)($thisLink);
      $thisLink.attr('role', 'tab');
      (0, _jquery2.default)(targetPane).attr('aria-labelledby', $thisLink.attr('id'));
  
      if ($thisLink.parent().hasClass('active-tab')) {
          $thisLink.attr('aria-selected', 'true');
      } else {
          $thisLink.attr('aria-selected', 'false');
      }
  }
  
  var ResponsiveAdapter = {
      totalTabsWidth: function totalTabsWidth($visibleTabs, $dropdown) {
          var totalVisibleTabsWidth = this.totalVisibleTabWidth($visibleTabs);
          var totalDropdownTabsWidth = 0;
  
          $dropdown.find('li').each(function (index, tab) {
              totalDropdownTabsWidth += parseInt(tab.getAttribute('data-aui-tab-width'));
          });
  
          return totalVisibleTabsWidth + totalDropdownTabsWidth;
      },
  
      totalVisibleTabWidth: function totalVisibleTabWidth($tabs) {
          var totalWidth = 0;
  
          $tabs.each(function (index, tab) {
              totalWidth += (0, _jquery2.default)(tab).outerWidth();
          });
  
          return totalWidth;
      },
  
      removeResponsiveDropdown: function removeResponsiveDropdown($dropdown, $dropdownTriggerTab) {
          $dropdown.remove();
          $dropdownTriggerTab.remove();
      },
  
      createResponsiveDropdownTrigger: function createResponsiveDropdownTrigger($tabsMenu, id) {
          var triggerMarkup = '<li class="menu-item aui-tabs-responsive-trigger-item">' + '<a class="aui-dropdown2-trigger aui-tabs-responsive-trigger aui-dropdown2-trigger-arrowless" id="aui-tabs-responsive-trigger-' + id + '" aria-haspopup="true" aria-controls="aui-tabs-responsive-dropdown-' + id + '" href="aui-tabs-responsive-dropdown-' + id + '">...</a>' + '</li>';
          $tabsMenu.append(triggerMarkup);
          var $trigger = $tabsMenu.find('.aui-tabs-responsive-trigger-item');
          return $trigger;
      },
  
      createResponsiveDropdown: function createResponsiveDropdown($tabsContainer, id) {
          var dropdownMarkup = '<div class="aui-dropdown2 aui-style-default aui-tabs-responsive-dropdown" id="aui-tabs-responsive-dropdown-' + id + '">' + '<ul>' + '</ul>' + '</div>';
          $tabsContainer.append(dropdownMarkup);
          var $dropdown = $tabsContainer.find('#aui-tabs-responsive-dropdown-' + id);
          return $dropdown;
      },
  
      findNewVisibleTabs: function findNewVisibleTabs(tabs, parentWidth, dropdownTriggerTabWidth) {
          function hasMoreSpace(currentTotalTabWidth, dropdownTriggerTabWidth, parentWidth) {
              return currentTotalTabWidth + dropdownTriggerTabWidth <= parentWidth;
          }
  
          var currentTotalTabWidth = 0;
  
          for (var i = 0; hasMoreSpace(currentTotalTabWidth, dropdownTriggerTabWidth, parentWidth) && i < tabs.length; i++) {
              var $tab = (0, _jquery2.default)(tabs[i]);
              var tabWidth = $tab.outerWidth(true);
              currentTotalTabWidth += tabWidth;
          }
  
          // i should now be at the tab index after the last visible tab because of the loop so we minus 1 to get the new visible tabs
          return tabs.slice(0, i - 1);
      },
  
      moveVisibleTabs: function moveVisibleTabs(oldVisibleTabs, $tabsParent, $dropdownTriggerTab) {
          var dropdownId = $dropdownTriggerTab.find('a').attr('aria-controls');
          var $dropdown = (0, _jquery2.default)('#' + dropdownId);
          var newVisibleTabs = this.findNewVisibleTabs(oldVisibleTabs, $tabsParent.outerWidth(), $dropdownTriggerTab.parent().outerWidth(true));
          var lastTabIndex = newVisibleTabs.length - 1;
  
          for (var j = oldVisibleTabs.length - 1; j >= lastTabIndex; j--) {
              var $tab = (0, _jquery2.default)(oldVisibleTabs[j]);
              this.moveTabToResponsiveDropdown($tab, $dropdown, $dropdownTriggerTab);
          }
  
          return (0, _jquery2.default)(newVisibleTabs);
      },
  
      moveTabToResponsiveDropdown: function moveTabToResponsiveDropdown($tab, $dropdown, $dropdownTriggerTab) {
          var $tabLink = $tab.find('a');
  
          $tab.attr('data-aui-tab-width', $tab.outerWidth(true));
          $tabLink.addClass('aui-dropdown2-radio aui-tabs-responsive-item');
  
          if ($tab.hasClass('active-tab')) {
              $tabLink.addClass('aui-dropdown2-checked');
              $dropdownTriggerTab.addClass('active-tab');
          }
  
          $dropdown.find('ul').prepend($tab);
      },
  
      moveInvisibleTabs: function moveInvisibleTabs(tabsInDropdown, remainingSpace, $dropdownTriggerTab) {
          function hasMoreSpace(remainingSpace) {
              return remainingSpace > 0;
          }
  
          for (var i = 0; hasMoreSpace(remainingSpace) && i < tabsInDropdown.length; i++) {
              var $tab = (0, _jquery2.default)(tabsInDropdown[i]);
              var tabInDropdownWidth = parseInt($tab.attr('data-aui-tab-width'), 10);
              var shouldMoveTabOut = tabInDropdownWidth < remainingSpace;
  
              if (shouldMoveTabOut) {
                  this.moveTabOutOfDropdown($tab, $dropdownTriggerTab);
              }
  
              remainingSpace -= tabInDropdownWidth;
          }
      },
  
      moveTabOutOfDropdown: function moveTabOutOfDropdown($tab, $dropdownTriggerTab) {
          var isTabInDropdownActive = $tab.find('a').hasClass('aui-dropdown2-checked');
  
          if (isTabInDropdownActive) {
              $tab.addClass('active-tab');
              $dropdownTriggerTab.removeClass('active-tab');
          }
  
          $tab.children('a').removeClass('aui-dropdown2-radio aui-tabs-responsive-item aui-dropdown2-checked');
          $dropdownTriggerTab.before($tab);
      }
  };
  
  // this function is run by jquery .each() where 'this' is the current tabs container
  function calculateResponsiveTabs(tabsContainer, index) {
      var $tabsContainer = (0, _jquery2.default)(tabsContainer);
      var $tabsMenu = $tabsContainer.find('.tabs-menu').first();
      var $visibleTabs = $tabsMenu.find('li:not(.aui-tabs-responsive-trigger-item)');
      var $dropdownTriggerTab = $tabsMenu.find('.aui-tabs-responsive-trigger').parent();
      var $dropdownTrigger = $dropdownTriggerTab.find('a');
      var dropdownId = $dropdownTrigger.attr('aria-controls');
      var $dropdown = (0, _jquery2.default)(document).find('#' + dropdownId).attr('aria-checked', false);
      var isResponsive = $dropdown.length > 0;
      var totalTabsWidth = ResponsiveAdapter.totalTabsWidth($visibleTabs, $dropdown);
      var needsResponsive = totalTabsWidth > $tabsContainer.outerWidth();
  
      if (!isResponsive && needsResponsive) {
          $dropdownTriggerTab = ResponsiveAdapter.createResponsiveDropdownTrigger($tabsMenu, index);
          $dropdown = ResponsiveAdapter.createResponsiveDropdown($tabsContainer, index);
      }
  
      // reset id's in case tabs have changed DOM order
      $dropdownTrigger.attr('aria-controls', 'aui-tabs-responsive-dropdown-' + index);
      $dropdownTrigger.attr('id', 'aui-tabs-responsive-trigger-' + index);
      $dropdownTrigger.attr('href', 'aui-tabs-responsive-trigger-' + index);
      $dropdown.attr('id', 'aui-tabs-responsive-dropdown-' + index);
  
      if (needsResponsive) {
          var $newVisibleTabs = ResponsiveAdapter.moveVisibleTabs($visibleTabs.toArray(), $tabsContainer, $dropdownTriggerTab);
          var visibleTabWidth = ResponsiveAdapter.totalVisibleTabWidth($newVisibleTabs);
          var remainingSpace = $tabsContainer.outerWidth() - visibleTabWidth - $dropdownTriggerTab.outerWidth(true);
          var hasSpace = remainingSpace > 0;
  
          if (hasSpace) {
              var $tabsInDropdown = $dropdown.find('li');
              ResponsiveAdapter.moveInvisibleTabs($tabsInDropdown.toArray(), remainingSpace, $dropdownTriggerTab);
          }
  
          $dropdown.on('click', 'a', handleTabClick);
  
          /* Workaround for bug in Edge where the dom is just not being re-rendered properly
          It is only triggered for certain widths. Simply taking the element out of the DOM
          and placing it back in causes the browser to re-render, hiding the issue.
          added from AUI-4098 and to be revisited in AUI-4117*/
          if ($tabsMenu.is(':visible')) {
              $tabsMenu.hide().show();
          }
      }
  
      if (isResponsive && !needsResponsive) {
          $dropdown.find('li').each(function () {
              ResponsiveAdapter.moveTabOutOfDropdown((0, _jquery2.default)(this), $dropdownTriggerTab);
          });
          ResponsiveAdapter.removeResponsiveDropdown($dropdown, $dropdownTriggerTab);
      }
  }
  
  function switchToTab(tab) {
      var $tab = (0, _jquery2.default)(tab);
  
      // This probably isn't needed anymore. Remove once confirmed.
      if ($tab.hasClass('aui-tabs-responsive-trigger')) {
          return;
      }
  
      var $pane = (0, _jquery2.default)($tab.attr('href').match(REGEX)[0]);
  
      $pane.addClass('active-pane').attr('aria-hidden', 'false').siblings('.tabs-pane').removeClass('active-pane').attr('aria-hidden', 'true');
  
      var $dropdownTriggerTab = $tab.parents('.aui-tabs').find('.aui-tabs-responsive-trigger-item a');
      var dropdownId = $dropdownTriggerTab.attr('aria-controls');
      var $dropdown = (0, _jquery2.default)(document).find('#' + dropdownId);
  
      $dropdown.find('li a').attr('aria-checked', false).removeClass('checked aui-dropdown2-checked');
      $dropdown.find('li').removeClass('active-tab');
  
      $tab.parent('li.menu-item').addClass('active-tab').siblings('.menu-item').removeClass('active-tab');
  
      if ($tab.hasClass('aui-tabs-responsive-item')) {
          var $visibleTabs = $pane.parent('.aui-tabs').find('li.menu-item:not(.aui-tabs-responsive-trigger-item)');
  
          $visibleTabs.removeClass('active-tab');
          $visibleTabs.find('a').removeClass('checked').removeAttr('aria-checked');
      }
  
      if ($tab.hasClass('aui-tabs-responsive-item')) {
          $pane.parent('.aui-tabs').find('li.menu-item.aui-tabs-responsive-trigger-item').addClass('active-tab');
      }
  
      $tab.closest('.tabs-menu').find('a').attr('aria-selected', 'false');
      $tab.attr('aria-selected', 'true');
      $tab.trigger('tabSelect', {
          tab: $tab,
          pane: $pane
      });
  }
  
  function isPersistentTabGroup($tabGroup) {
      // Tab group persistent attribute exists and is not false
      return $tabGroup.attr('data-aui-persist') !== undefined && $tabGroup.attr('data-aui-persist') !== 'false';
  }
  
  function createPersistentKey($tabGroup) {
      var tabGroupId = $tabGroup.attr('id');
      var value = $tabGroup.attr('data-aui-persist');
  
      return STORAGE_PREFIX + (tabGroupId ? tabGroupId : '') + (value && value !== 'true' ? '-' + value : '');
  }
  
  /* eslint max-depth: 1 */
  function updateTabsFromLocalStorage($tabGroups) {
      for (var i = 0, ii = $tabGroups.length; i < ii; i++) {
          var $tabGroup = $tabGroups.eq(i);
          var tabs = $tabGroups.get(i);
  
          if (isPersistentTabGroup($tabGroup) && window.localStorage) {
              var tabGroupId = $tabGroup.attr('id');
  
              if (tabGroupId) {
                  var persistentTabId = window.localStorage.getItem(createPersistentKey($tabGroup));
  
                  if (persistentTabId) {
                      var anchor = tabs.querySelector('a[href$="' + persistentTabId + '"]');
  
                      if (anchor) {
                          switchToTab(anchor);
                      }
                  }
              } else {
                  logger.warn('A tab group must specify an id attribute if it specifies data-aui-persist.');
              }
          }
      }
  }
  
  function updateLocalStorageEntry($tab) {
      var $tabGroup = $tab.closest('.aui-tabs');
      var tabGroupId = $tabGroup.attr('id');
  
      if (tabGroupId) {
          var tabId = $tab.attr('href');
  
          if (tabId) {
              window.localStorage.setItem(createPersistentKey($tabGroup), tabId);
          }
      } else {
          logger.warn('A tab group must specify an id attribute if it specifies data-aui-persist.');
      }
  }
  
  function handleTabClick(e) {
      tabs.change((0, _jquery2.default)(e.target).closest('a'));
  
      if (e) {
          e.preventDefault();
      }
  }
  
  function responsiveResizeHandler(tabs) {
      tabs.forEach(function (tab, index) {
          calculateResponsiveTabs(tab, index);
      });
  }
  
  // Initialisation
  // --------------
  
  function getTabs() {
      return (0, _jquery2.default)('.aui-tabs:not(.aui-tabs-disabled)');
  }
  
  function getResponsiveTabs() {
      return (0, _jquery2.default)(RESPONSIVE_OPT_IN_SELECTOR).toArray();
  }
  
  function initWindow() {
      var debounced = (0, _debounce2.default)(responsiveResizeHandler, 200);
      var responsive = getResponsiveTabs();
  
      responsiveResizeHandler(responsive);
  
      (0, _jquery2.default)(window).resize(function () {
          debounced(responsive);
      });
  }
  
  function initTab(tab) {
      var $tab = (0, _jquery2.default)(tab);
  
      tab.setAttribute('role', 'application');
  
      if (!$tab.data('aui-tab-events-bound')) {
          var $tabMenu = $tab.children('ul.tabs-menu');
  
          // ARIA setup
          $tabMenu.attr('role', 'tablist');
  
          // ignore the LIs so tab count is announced correctly
          $tabMenu.children('li').attr('role', 'presentation');
          $tabMenu.find('> .menu-item a').each(function () {
              enhanceTabLink(this);
          });
  
          // Set up click event for tabs
          $tabMenu.on('click', 'a', handleTabClick);
          $tab.data('aui-tab-events-bound', true);
  
          initPanes(tab);
      }
  }
  
  function initTabs() {
      var tabs = getTabs();
  
      tabs.each(function () {
          initTab(this);
      });
  
      updateTabsFromLocalStorage(tabs);
  }
  
  function initPane(pane) {
      pane.setAttribute('role', 'tabpanel');
      pane.setAttribute('aria-hidden', (0, _jquery2.default)(pane).hasClass('active-pane') ? 'false' : 'true');
  }
  
  function initPanes(tab) {
      [].slice.call(tab.querySelectorAll('.tabs-pane')).forEach(initPane);
  }
  
  function initVerticalTabs() {
      // Vertical tab truncation setup (adds title if clipped)
      (0, _jquery2.default)('.aui-tabs.vertical-tabs').find('a').each(function () {
          var thisTab = (0, _jquery2.default)(this);
  
          // don't override existing titles
          if (!thisTab.attr('title')) {
              // if text has been truncated, add title
              if ((0, _isClipped2.default)(thisTab)) {
                  thisTab.attr('title', thisTab.text());
              }
          }
      });
  }
  
  var tabs = {
      setup: function setup() {
          initWindow();
          initTabs();
          initVerticalTabs();
      },
  
      change: function change(a) {
          var $a = (0, _jquery2.default)(a);
          var $tabGroup = $a.closest('.aui-tabs');
  
          switchToTab($a);
  
          if (isPersistentTabGroup($tabGroup) && window.localStorage) {
              updateLocalStorageEntry($a);
          }
      }
  };
  
  (0, _jquery2.default)(tabs.setup);
  
  // Web Components
  // --------------
  
  function findComponent(element) {
      return (0, _jquery2.default)(element).closest('aui-tabs').get(0);
  }
  
  function findPanes(tabs) {
      return tabs.querySelectorAll('aui-tabs-pane');
  }
  
  function findTabs(tabs) {
      return tabs.querySelectorAll('li[is=aui-tabs-tab]');
  }
  
  (0, _skate2.default)('aui-tabs', {
      created: function created(element) {
          (0, _jquery2.default)(element).addClass('aui-tabs horizontal-tabs');
  
          // We must initialise here so that the old code still works since
          // the lifecycle of the sub-components setup the markup so that it
          // can be processed by the old logic.
          _skate2.default.init(element);
  
          // Use the old logic to initialise the tabs.
          initTab(element);
      },
      template: template('<ul class="tabs-menu">', '<content select="li[is=aui-tabs-tab]"></content>', '</ul>', '<content select="aui-tabs-pane"></content>'),
      prototype: {
          select: function select(element) {
              var index = (0, _jquery2.default)(findPanes(this)).index(element);
  
              if (index > -1) {
                  tabs.change(findTabs(this)[index].children[0]);
              }
  
              return this;
          }
      }
  });
  
  var Tab = (0, _skate2.default)('aui-tabs-tab', {
      extends: 'li',
      created: function created(element) {
          (0, _jquery2.default)(element).addClass('menu-item');
      },
      template: template('<a href="#">', '<strong>', '<content></content>', '</strong>', '</a>')
  });
  
  (0, _skate2.default)('aui-tabs-pane', {
      attached: function attached(element) {
          var $component = (0, _jquery2.default)(findComponent(element));
          var $element = (0, _jquery2.default)(element);
          var index = $component.find('aui-tabs-pane').index($element);
          var tab = new Tab();
          var $tab = (0, _jquery2.default)(tab);
  
          $element.addClass('tabs-pane');
          tab.firstChild.setAttribute('href', '#' + element.id);
          template.wrap(tab).textContent = $element.attr('title');
  
          if (index === 0) {
              $element.addClass('active-pane');
          }
  
          if ($element.hasClass('active-pane')) {
              $tab.addClass('active-tab');
          }
  
          $element.siblings('ul').append(tab);
      },
      template: template('<content></content>')
  });
  
  (0, _globalize2.default)('tabs', tabs);
  
  exports.default = tabs;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);