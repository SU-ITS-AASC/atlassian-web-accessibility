// src/js/aui/sidebar.js
(typeof window === 'undefined' ? global : window).__794d61e50f5e0ebf599ea9f132cd243e = (function () {
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
  
  __8c05d85e3d7fb791ad5071fea16ddb09;
  
  __bf59f74063d342eb3fddf114cbed6239;
  
  __fa714f1b12d7502957e4e0b6196321bf;
  
  var _clone = __e7d0e8462b4386c30e9bcd3ad0a49ad3;
  
  var _clone2 = _interopRequireDefault(_clone);
  
  var _deprecation = __921ad9514d56376fef992861d9ec0f51;
  
  var deprecate = _interopRequireWildcard(_deprecation);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _hasTouch = __6c4fb3940d6fd500a61aec90cc3f93dc;
  
  var _hasTouch2 = _interopRequireDefault(_hasTouch);
  
  var _isInput = __dff830f45baf5eb0b8447c97bbcc4699;
  
  var _isInput2 = _interopRequireDefault(_isInput);
  
  var _keyCode = __e246bf93af36eb4453f35afeb1c302d9;
  
  var _keyCode2 = _interopRequireDefault(_keyCode);
  
  var _mediaQuery = __682859fc5d8be5d41dbacb89678092a4;
  
  var _mediaQuery2 = _interopRequireDefault(_mediaQuery);
  
  var _skate = __0ac9a2c09f995a9c0a478af8742f59b7;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  var _uniqueId = __a0ab588de7b0759818853425dc8ad2f2;
  
  var _uniqueId2 = _interopRequireDefault(_uniqueId);
  
  var _widget = __d2e8fc66dac2ecebdc205fcab991f687;
  
  var _widget2 = _interopRequireDefault(_widget);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var SUPPORTS_TRANSITIONS = typeof document.documentElement.style.transition !== 'undefined' || typeof document.documentElement.style.webkitTransition !== 'undefined';
  
  function sidebarOffset(sidebar) {
      return sidebar.offset().top;
  }
  
  function Sidebar(selector) {
      this.$el = (0, _jquery2.default)(selector);
      if (!this.$el.length) {
          return;
      }
      this.$body = (0, _jquery2.default)('body');
      this.$wrapper = this.$el.children('.aui-sidebar-wrapper');
  
      // Sidebar users should add class="aui-page-sidebar" to the
      // <body> in the rendered markup (to prevent any potential flicker),
      // so we add it just in case they forgot.
      this.$body.addClass('aui-page-sidebar');
  
      this._previousScrollTop = null;
      this._previousViewportHeight = null;
      this._previousViewportWidth = null;
      this._previousOffsetTop = null;
  
      this.submenus = new SubmenuManager();
  
      initializeHandlers(this);
      constructAllSubmenus(this);
  }
  
  var FORCE_COLLAPSE_WIDTH = 1240;
  var EVENT_PREFIX = '_aui-internal-sidebar-';
  
  function namespaceEvents(events) {
      return _jquery2.default.map(events.split(' '), function (event) {
          return EVENT_PREFIX + event;
      }).join(' ');
  }
  
  Sidebar.prototype.on = function () {
      var events = arguments[0];
      var args = Array.prototype.slice.call(arguments, 1);
      var namespacedEvents = namespaceEvents(events);
      this.$el.on.apply(this.$el, [namespacedEvents].concat(args));
      return this;
  };
  
  Sidebar.prototype.off = function () {
      var events = arguments[0];
      var args = Array.prototype.slice.call(arguments, 1);
      var namespacedEvents = namespaceEvents(events);
      this.$el.off.apply(this.$el, [namespacedEvents].concat(args));
      return this;
  };
  
  Sidebar.prototype.setHeight = function (scrollTop, viewportHeight, headerHeight) {
      var visibleHeaderHeight = Math.max(0, headerHeight - scrollTop);
      this.$wrapper.height(viewportHeight - visibleHeaderHeight);
      return this;
  };
  
  Sidebar.prototype.setTopPosition = function () {
      var scrollTop = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window.pageYOffset;
  
      this.$wrapper.toggleClass('aui-is-docked', scrollTop > sidebarOffset(this.$el));
      return this;
  };
  
  Sidebar.prototype.setPosition = deprecate.fn(Sidebar.prototype.setTopPosition, 'Sidebar.setPosition', {
      removeInVersion: '8.0.0',
      sinceVersion: '7.6.1',
      alternativeName: 'Sidebar.setTopPosition'
  });
  
  Sidebar.prototype.setLeftPosition = function () {
      var scrollLeft = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window.pageXOffset;
  
      if (this.$wrapper.hasClass('aui-is-docked')) {
          this.$wrapper.css({ left: -scrollLeft });
      }
      return this;
  };
  
  Sidebar.prototype.setCollapsedState = function (viewportWidth) {
      // Reflow behaviour is implemented as a state machine (hence all
      // state transitions are enumerated). The rest of the state machine,
      // e.g., entering the expanded narrow (fly-out) state, is implemented
      // by the toggle() method.
      var transition = { collapsed: {}, expanded: {} };
      transition.collapsed.narrow = {
          narrow: _jquery2.default.noop,
          wide: function wide(s) {
              s._expand(viewportWidth, true);
          }
      };
      transition.collapsed.wide = {
          narrow: _jquery2.default.noop, // Becomes collapsed narrow (no visual change).
          wide: _jquery2.default.noop
      };
      transition.expanded.narrow = {
          narrow: _jquery2.default.noop,
          wide: function wide(s) {
              s.$body.removeClass('aui-sidebar-collapsed');
              s.$el.removeClass('aui-sidebar-fly-out');
          }
      };
      transition.expanded.wide = {
          narrow: function narrow(s) {
              s._collapse(true);
          },
          wide: _jquery2.default.noop
      };
  
      var collapseState = this.isCollapsed() ? 'collapsed' : 'expanded';
      var oldSize = this.isViewportNarrow(this._previousViewportWidth) ? 'narrow' : 'wide';
      var newSize = this.isViewportNarrow(viewportWidth) ? 'narrow' : 'wide';
      transition[collapseState][oldSize][newSize](this);
      return this;
  };
  
  Sidebar.prototype._collapse = function (isResponsive) {
      if (this.isCollapsed()) {
          return this;
      }
  
      var startEvent = _jquery2.default.Event(EVENT_PREFIX + 'collapse-start', { isResponsive: isResponsive });
      this.$el.trigger(startEvent);
      if (startEvent.isDefaultPrevented()) {
          return this;
      }
  
      this.$body.addClass('aui-sidebar-collapsed');
      this.$el.attr('aria-expanded', 'false');
      this.$el.removeClass('aui-sidebar-fly-out');
      this.$el.find(this.submenuTriggersSelector).attr('tabindex', 0);
      (0, _jquery2.default)(this.inlineDialogSelector).attr('responds-to', 'hover');
  
      if (!this.isAnimated()) {
          this.$el.trigger(_jquery2.default.Event(EVENT_PREFIX + 'collapse-end', { isResponsive: isResponsive }));
      }
      return this;
  };
  
  Sidebar.prototype.collapse = function () {
      return this._collapse(false);
  };
  
  Sidebar.prototype._expand = function (viewportWidth, isResponsive) {
      var startEvent = _jquery2.default.Event(EVENT_PREFIX + 'expand-start', { isResponsive: isResponsive });
      this.$el.trigger(startEvent);
      if (startEvent.isDefaultPrevented()) {
          return this;
      }
  
      var isViewportNarrow = this.isViewportNarrow(viewportWidth);
      this.$el.attr('aria-expanded', 'true');
      this.$body.toggleClass('aui-sidebar-collapsed', isViewportNarrow);
      this.$el.toggleClass('aui-sidebar-fly-out', isViewportNarrow);
      this.$el.find(this.submenuTriggersSelector).removeAttr('tabindex');
      (0, _jquery2.default)(this.inlineDialogSelector).removeAttr('responds-to');
  
      if (!this.isAnimated()) {
          this.$el.trigger(_jquery2.default.Event(EVENT_PREFIX + 'expand-end', { isResponsive: isResponsive }));
      }
      return this;
  };
  
  Sidebar.prototype.expand = function () {
      if (this.isCollapsed()) {
          this._expand(this._previousViewportWidth, false);
      }
      return this;
  };
  
  Sidebar.prototype.isAnimated = function () {
      return SUPPORTS_TRANSITIONS && this.$el.hasClass('aui-is-animated');
  };
  
  Sidebar.prototype.isCollapsed = function () {
      return this.$el.attr('aria-expanded') === 'false';
  };
  
  Sidebar.prototype.isViewportNarrow = function (viewportWidth) {
      viewportWidth = viewportWidth === undefined ? this._previousViewportWidth : viewportWidth;
      return viewportWidth < FORCE_COLLAPSE_WIDTH;
  };
  
  Sidebar.prototype._removeAllTooltips = function () {
      // tooltips are orphaned when sidebar is expanded, so if there are any visible on the page we remove them all.
      // Can't scope it to the Sidebar (this) because the tooltip div is a direct child of <body>
      (0, _jquery2.default)(this.tooltipSelector).remove();
  };
  
  Sidebar.prototype.responsiveReflow = function responsiveReflow(isInitialPageLoad, viewportWidth) {
      if (isInitialPageLoad) {
          if (!this.isCollapsed() && this.isViewportNarrow(viewportWidth)) {
              var isAnimated = this.isAnimated();
              if (isAnimated) {
                  this.$el.removeClass('aui-is-animated');
              }
              // This will trigger the "collapse" event before non-sidebar
              // JS code has a chance to bind listeners; they'll need to
              // check isCollapsed() if they care about the value at that
              // time.
              this.collapse();
              if (isAnimated) {
                  // We must trigger a CSS reflow (by accessing
                  // offsetHeight) otherwise the transition still runs.
                  // eslint-disable-next-line
                  this.$el[0].offsetHeight;
                  this.$el.addClass('aui-is-animated');
              }
          }
      } else if (viewportWidth !== this._previousViewportWidth) {
          this.setCollapsedState(viewportWidth);
      }
  };
  
  Sidebar.prototype.reflow = function reflow() {
      var scrollTop = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window.pageYOffset;
      var viewportHeight = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.documentElement.clientHeight;
      var viewportWidth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : window.innerWidth;
      var scrollHeight = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : document.documentElement.scrollHeight;
      var scrollLeft = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : window.pageXOffset;
  
  
      // Header height needs to be checked because in Stash it changes when the CSS "transform: translate3d" is changed.
      // If you called reflow() after this change then nothing happened because the scrollTop and viewportHeight hadn't changed.
      var offsetTop = sidebarOffset(this.$el);
      var isInitialPageLoad = this._previousViewportWidth === null;
  
      if (!(scrollTop === this._previousScrollTop && viewportHeight === this._previousViewportHeight && offsetTop === this._previousOffsetTop)) {
          if (this.isCollapsed() && !isInitialPageLoad && scrollTop !== this._previousScrollTop) {
              // hide submenu and tooltips on scroll
              hideAllSubmenus();
              this._removeAllTooltips();
          }
  
          var isTouch = this.$body.hasClass('aui-page-sidebar-touch');
          var isTrackpadBounce = scrollTop !== this._previousScrollTop && (scrollTop < 0 || scrollTop + viewportHeight > scrollHeight);
          if (!isTouch && (isInitialPageLoad || !isTrackpadBounce)) {
              this.setHeight(scrollTop, viewportHeight, offsetTop);
              this.setTopPosition(scrollTop);
          }
      }
  
      if (scrollLeft !== this._previousScrollLeft) {
          this.setLeftPosition(scrollLeft);
      }
  
      var isResponsive = this.$el.attr('data-aui-responsive') !== 'false';
      if (isResponsive) {
          this.responsiveReflow(isInitialPageLoad, viewportWidth);
      } else {
          var isFlyOut = !this.isCollapsed() && this.isViewportNarrow(viewportWidth);
          this.$el.toggleClass('aui-sidebar-fly-out', isFlyOut);
      }
  
      this._previousScrollTop = scrollTop;
      this._previousViewportHeight = viewportHeight;
      this._previousViewportWidth = viewportWidth;
      this._previousOffsetTop = offsetTop;
      this._previousScrollLeft = scrollLeft;
      return this;
  };
  
  Sidebar.prototype.toggle = function () {
      if (this.isCollapsed()) {
          this.expand();
          this._removeAllTooltips();
      } else {
          this.collapse();
      }
      return this;
  };
  
  /**
   * Returns a jQuery selector string for the trigger elements when the
   * sidebar is in a collapsed state, useful for delegated event binding.
   *
   * When using this selector in event handlers, the element ("this") will
   * either be an <a> (when the trigger was a tier-one menu item) or an
   * element with class "aui-sidebar-group" (for non-tier-one items).
   *
   * For delegated event binding you should bind to $el and check the value
   * of isCollapsed(), e.g.,
   *
   *     sidebar.$el.on('click', sidebar.collapsedTriggersSelector, function (e) {
       *         if (!sidebar.isCollapsed()) {
       *             return;
       *         }
       *     });
   *
   * @returns string
   */
  Sidebar.prototype.submenuTriggersSelector = '.aui-sidebar-group:not(.aui-sidebar-group-tier-one)';
  
  Sidebar.prototype.collapsedTriggersSelector = [Sidebar.prototype.submenuTriggersSelector, '.aui-sidebar-group.aui-sidebar-group-tier-one > .aui-nav > li > a', '.aui-sidebar-footer > .aui-sidebar-settings-button'].join(', ');
  
  Sidebar.prototype.toggleSelector = '.aui-sidebar-footer > .aui-sidebar-toggle';
  
  Sidebar.prototype.tooltipSelector = '.aui-sidebar-section-tooltip';
  
  Sidebar.prototype.inlineDialogClass = 'aui-sidebar-submenu-dialog';
  Sidebar.prototype.inlineDialogSelector = '.' + Sidebar.prototype.inlineDialogClass;
  
  function getAllSubmenuDialogs() {
      return document.querySelectorAll(Sidebar.prototype.inlineDialogSelector);
  }
  
  function SubmenuManager() {
      this.inlineDialog = null;
  }
  
  SubmenuManager.prototype.submenu = function ($trigger) {
      sidebarSubmenuDeprecationLogger();
      return getSubmenu($trigger);
  };
  
  SubmenuManager.prototype.hasSubmenu = function ($trigger) {
      sidebarSubmenuDeprecationLogger();
      return hasSubmenu($trigger);
  };
  
  SubmenuManager.prototype.submenuHeadingHeight = function () {
      sidebarSubmenuDeprecationLogger();
      return 34;
  };
  
  SubmenuManager.prototype.isShowing = function () {
      sidebarSubmenuDeprecationLogger();
      return Sidebar.prototype.isSubmenuVisible();
  };
  
  SubmenuManager.prototype.show = function (e, trigger) {
      sidebarSubmenuDeprecationLogger();
      showSubmenu(trigger);
  };
  
  SubmenuManager.prototype.hide = function () {
      sidebarSubmenuDeprecationLogger();
      hideAllSubmenus();
  };
  
  SubmenuManager.prototype.inlineDialogShowHandler = function () {
      sidebarSubmenuDeprecationLogger();
  };
  SubmenuManager.prototype.inlineDialogHideHandler = function () {
      sidebarSubmenuDeprecationLogger();
  };
  SubmenuManager.prototype.moveSubmenuToInlineDialog = function () {
      sidebarSubmenuDeprecationLogger();
  };
  SubmenuManager.prototype.restoreSubmenu = function () {
      sidebarSubmenuDeprecationLogger();
  };
  
  Sidebar.prototype.getVisibleSubmenus = function () {
      return Array.prototype.filter.call(getAllSubmenuDialogs(), function (inlineDialog2) {
          return inlineDialog2.open;
      });
  };
  
  Sidebar.prototype.isSubmenuVisible = function () {
      return this.getVisibleSubmenus().length > 0;
  };
  
  function getSubmenu($trigger) {
      return $trigger.is('a') ? $trigger.next('.aui-nav') : $trigger.children('.aui-nav, hr');
  }
  
  function getSubmenuInlineDialog(trigger) {
      var inlineDialogId = trigger.getAttribute('aria-controls');
      return document.getElementById(inlineDialogId);
  }
  
  function hasSubmenu($trigger) {
      return getSubmenu($trigger).length !== 0;
  }
  
  function hideAllSubmenus() {
      var allSubmenuDialogs = getAllSubmenuDialogs();
      Array.prototype.forEach.call(allSubmenuDialogs, function (inlineDialog2) {
          inlineDialog2.open = false;
      });
  }
  
  function showSubmenu(trigger) {
      getSubmenuInlineDialog(trigger).open = true;
  }
  
  function constructSubmenu(sidebar, $trigger) {
      if ($trigger.data('_aui-sidebar-submenu-constructed')) {
          return;
      } else {
          $trigger.data('_aui-sidebar-submenu-constructed', true);
      }
  
      if (!hasSubmenu($trigger)) {
          return;
      }
  
      var submenuInlineDialog = document.createElement('aui-inline-dialog');
  
      var uniqueId = (0, _uniqueId2.default)('sidebar-submenu');
  
      $trigger.attr('aria-controls', uniqueId);
      $trigger.attr('data-aui-trigger', '');
      _skate2.default.init($trigger); //Trigger doesn't listen to attribute modification
  
      submenuInlineDialog.setAttribute('id', uniqueId);
      submenuInlineDialog.setAttribute('alignment', 'right top');
      submenuInlineDialog.setAttribute('aria-hidden', 'true');
      if (sidebar.isCollapsed()) {
          submenuInlineDialog.setAttribute('responds-to', 'hover');
      }
  
      (0, _jquery2.default)(submenuInlineDialog).addClass(Sidebar.prototype.inlineDialogClass);
  
      document.body.appendChild(submenuInlineDialog);
      _skate2.default.init(submenuInlineDialog); //Needed so that sidebar.submenus.isShowing() will work on page load
  
      addHandlersToSubmenuInlineDialog(sidebar, $trigger, submenuInlineDialog);
  
      return submenuInlineDialog;
  }
  
  function addHandlersToSubmenuInlineDialog(sidebar, $trigger, submenuInlineDialog) {
      submenuInlineDialog.addEventListener('aui-layer-show', function (e) {
          if (!sidebar.isCollapsed()) {
              e.preventDefault();
              return;
          }
          inlineDialogShowHandler($trigger, submenuInlineDialog);
      });
  
      submenuInlineDialog.addEventListener('aui-layer-hide', function () {
          inlineDialogHideHandler($trigger);
      });
  }
  
  function inlineDialogShowHandler($trigger, submenuInlineDialog) {
      $trigger.addClass('active');
      submenuInlineDialog.innerHTML = SUBMENU_INLINE_DIALOG_CONTENTS_HTML;
      var title = $trigger.is('a') ? $trigger.text() : $trigger.children('.aui-nav-heading').text();
  
      var $container = (0, _jquery2.default)(submenuInlineDialog).find('.aui-navgroup-inner');
      $container.children('.aui-nav-heading').attr('title', title).children('strong').text(title);
  
      var $submenu = getSubmenu($trigger);
      cloneExpander($submenu).appendTo($container);
  
      /**
       * Workaround to show all contents in the expander.
       * This function should come from the expander component.
       */
      function cloneExpander(element) {
          var $clone = (0, _clone2.default)(element);
          if ($clone.hasClass('aui-expander-content')) {
              $clone.find('.aui-expander-cutoff').remove();
              $clone.removeClass('aui-expander-content');
          }
          return $clone;
      }
  }
  
  var SUBMENU_INLINE_DIALOG_CONTENTS_HTML = '<div class="aui-inline-dialog-contents">' + '<div class="aui-sidebar-submenu" >' + '<div class="aui-navgroup aui-navgroup-vertical">' + '<div class="aui-navgroup-inner">' + '<div class="aui-nav-heading"><strong></strong></div>' + '</div>' + '</div>' + '</div>' + '</div>';
  
  function inlineDialogHideHandler($trigger) {
      $trigger.removeClass('active');
  }
  
  function constructAllSubmenus(sidebar) {
      (0, _jquery2.default)(sidebar.collapsedTriggersSelector).each(function () {
          var $trigger = (0, _jquery2.default)(this);
          constructSubmenu(sidebar, $trigger);
      });
  }
  
  var tipsyOpts = {
      trigger: 'manual',
      gravity: 'w',
      className: 'aui-sidebar-section-tooltip',
      title: function title() {
          var $item = (0, _jquery2.default)(this);
          if ($item.is('a')) {
              return $item.attr('title') || $item.find('.aui-nav-item-label').text() || $item.data('tooltip');
          } else {
              return $item.children('.aui-nav').attr('title') || $item.children('.aui-nav-heading').text();
          }
      }
  };
  
  function showTipsy($trigger) {
      $trigger.tipsy(tipsyOpts).tipsy('show');
      var $tip = $trigger.data('tipsy') && $trigger.data('tipsy').$tip;
      if ($tip) {
          // if .aui-sidebar-group does not have a title to display
          // Remove "opacity" inline style from Tipsy to allow the our own styles and transitions to be applied
          $tip.css({ opacity: '' }).addClass('tooltip-shown');
      }
  }
  
  function hideTipsy($trigger) {
      var $tip = $trigger.data('tipsy') && $trigger.data('tipsy').$tip;
      if ($tip) {
          var durationStr = $tip.css('transition-duration');
  
          if (durationStr) {
              // can be denominated in either s or ms
              var timeoutMs = durationStr.indexOf('ms') >= 0 ? parseInt(durationStr.substring(0, durationStr.length - 2), 10) : 1000 * parseInt(durationStr.substring(0, durationStr.length - 1), 10);
  
              // use a timeout because the transitionend event is not reliable (yet),
              // more details here: https://bitbucket.atlassian.net/browse/BB-11599
              // an example of this at http://labs.silverorange.com/files/webkit-bug/
              // further caveats here: https://developer.mozilla.org/en-US/docs/Web/Events/transitionend
              // "In the case where a transition is removed before completion,
              // such as if the transition-property is removed, then the event will not fire."
              setTimeout(function () {
                  if ($tip.hasClass('tooltip-shown')) {
                      $trigger.tipsy('hide');
                      $tip.removeClass('tooltip-shown');
                  }
              }, timeoutMs);
          } else {
              $tip.removeClass('tooltip-shown');
          }
      }
  }
  
  function lazilyInitializeSubmenus(sidebar) {
      sidebar.$el.on('mouseenter mouseleave click focus', sidebar.collapsedTriggersSelector, function (e) {
          var $trigger = (0, _jquery2.default)(e.target);
          constructSubmenu(sidebar, $trigger);
      });
  }
  
  function initializeHandlers(sidebar) {
      var $sidebar = (0, _jquery2.default)('.aui-sidebar');
      if (!$sidebar.length) {
          return;
      }
  
      lazilyInitializeSubmenus(sidebar);
  
      // AUI-2542: only enter touch mode on small screen touchable devices
      if (_hasTouch2.default && (0, _mediaQuery2.default)('only screen and (max-device-width:1024px)')) {
          (0, _jquery2.default)('body').addClass('aui-page-sidebar-touch');
      }
  
      var pendingReflow = null;
      var onScrollResizeReflow = function onScrollResizeReflow() {
          if (pendingReflow === null) {
              pendingReflow = requestAnimationFrame(function () {
                  sidebar.reflow();
                  pendingReflow = null;
              });
          }
      };
  
      (0, _jquery2.default)(window).on('scroll resize', onScrollResizeReflow);
      onScrollResizeReflow();
  
      if (sidebar.isAnimated()) {
          sidebar.$el.on('transitionend webkitTransitionEnd', function () {
              sidebar.$el.trigger(_jquery2.default.Event(EVENT_PREFIX + (sidebar.isCollapsed() ? 'collapse-end' : 'expand-end')));
          });
      }
  
      sidebar.$el.on('click', '.aui-sidebar-toggle', function (e) {
          e.preventDefault();
          sidebar.toggle();
      });
  
      (0, _jquery2.default)('.aui-page-panel').click(function () {
          if (!sidebar.isCollapsed() && sidebar.isViewportNarrow()) {
              sidebar.collapse();
          }
      });
  
      var toggleShortcutHandler = function toggleShortcutHandler(e) {
          if (isNormalSquareBracket(e)) {
              sidebar.toggle();
          }
      };
  
      //We use keypress because it captures the actual character that was typed and not the physical key that was pressed.
      //This accounts for other keyboard layouts
  
      (0, _jquery2.default)(document).on('keypress', toggleShortcutHandler);
  
      sidebar._remove = function () {
          this._removeAllTooltips();
          (0, _jquery2.default)(this.inlineDialogSelector).remove();
          this.$el.off();
          this.$el.remove();
          (0, _jquery2.default)(document).off('keypress', toggleShortcutHandler);
          (0, _jquery2.default)(window).off('scroll resize', onScrollResizeReflow);
      };
  
      sidebar.$el.on('touchend', function (e) {
          if (sidebar.isCollapsed()) {
              sidebar.expand();
              e.preventDefault();
          }
      });
  
      sidebar.$el.on('mouseenter focus', sidebar.collapsedTriggersSelector, function () {
          if (!sidebar.isCollapsed()) {
              return;
          }
  
          var $trigger = (0, _jquery2.default)(this);
  
          if (!hasSubmenu($trigger)) {
              showTipsy($trigger);
          }
      });
  
      sidebar.$el.on('click blur mouseleave', sidebar.collapsedTriggersSelector, function () {
          if (!sidebar.isCollapsed()) {
              return;
          }
          hideTipsy((0, _jquery2.default)(this));
      });
  
      sidebar.$el.on('mouseenter focus', sidebar.toggleSelector, function () {
          var $trigger = (0, _jquery2.default)(this);
          if (sidebar.isCollapsed()) {
              $trigger.data('tooltip', AJS.I18n.getText('aui.sidebar.expand.tooltip'));
          } else {
              $trigger.data('tooltip', AJS.I18n.getText('aui.sidebar.collapse.tooltip'));
          }
          showTipsy($trigger);
      });
  
      sidebar.$el.on('click blur mouseleave', sidebar.toggleSelector, function () {
          hideTipsy((0, _jquery2.default)(this));
      });
  
      function isNormalTab(e) {
          return e.keyCode === _keyCode2.default.TAB && !e.shiftKey && !e.altKey;
      }
  
      function isNormalSquareBracket(e) {
          return e.which === _keyCode2.default.LEFT_SQUARE_BRACKET && !e.shiftKey && !e.ctrlKey && !e.metaKey && !(0, _isInput2.default)(e.target);
      }
  
      function isShiftTab(e) {
          return e.keyCode === _keyCode2.default.TAB && e.shiftKey;
      }
  
      function isFirstSubmenuItem(item, $submenuDialog) {
          return item === $submenuDialog.find(':aui-tabbable')[0];
      }
  
      function isLastSubmenuItem(item, $submenuDialog) {
          return item === $submenuDialog.find(':aui-tabbable').last()[0];
      }
  
      /**
       * Force to focus on the first tabbable item in inline dialog.
       * Reason: inline dialog will be hidden as soon as the trigger is out of focus (onBlur event)
       * This function should come directly from inline dialog component.
       */
      function focusFirstItemOfInlineDialog($inlineDialog) {
          $inlineDialog.attr('persistent', '');
          // don't use :aui-tabbable:first as it will select the first tabbable item in EACH nav group
          $inlineDialog.find(':aui-tabbable').first().focus();
          // workaround on IE:
          // delay the persistence of inline dialog to make sure onBlur event was triggered first
          setTimeout(function () {
              $inlineDialog.removeAttr('persistent');
          }, 100);
      }
  
      sidebar.$el.on('keydown', sidebar.collapsedTriggersSelector, function (e) {
          if (sidebar.isCollapsed()) {
              var triggerEl = e.target;
              var submenuInlineDialog = getSubmenuInlineDialog(triggerEl);
              if (!submenuInlineDialog) {
                  return;
              }
  
              var $submenuInlineDialog = (0, _jquery2.default)(submenuInlineDialog);
  
              if (isNormalTab(e) && submenuInlineDialog.open) {
                  e.preventDefault();
                  focusFirstItemOfInlineDialog($submenuInlineDialog);
  
                  $submenuInlineDialog.on('keydown', function (e) {
                      if (isShiftTab(e) && isFirstSubmenuItem(e.target, $submenuInlineDialog) || isNormalTab(e) && isLastSubmenuItem(e.target, $submenuInlineDialog)) {
                          triggerEl.focus();
                          // unbind event and close submenu as the focus is out of the submenu
                          (0, _jquery2.default)(this).off('keydown');
                          hideAllSubmenus();
                      }
                  });
              }
          }
      });
  }
  
  var sidebar = (0, _widget2.default)('sidebar', Sidebar);
  
  (0, _jquery2.default)(function () {
      sidebar('.aui-sidebar');
  });
  
  var sidebarSubmenuDeprecationLogger = deprecate.getMessageLogger('Sidebar.submenus', {
      removeInVersion: '8.0',
      sinceVersion: '5.8'
  });
  
  (0, _globalize2.default)('sidebar', sidebar);
  
  exports.default = sidebar;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);