// src/js/aui/dropdown2.js
(typeof window === 'undefined' ? global : window).__63997c0b88d4f299b5d69bd1c1668c63 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  __fa714f1b12d7502957e4e0b6196321bf;
  
  __6c1bd26c14066cf537a86a0966c2d4fc;
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _skatejsTemplateHtml = __c6b5725916d210b9653318d2ea2472cb;
  
  var _skatejsTemplateHtml2 = _interopRequireDefault(_skatejsTemplateHtml);
  
  var _deprecation = __921ad9514d56376fef992861d9ec0f51;
  
  var deprecate = _interopRequireWildcard(_deprecation);
  
  var _log = __c1e961001275c079e48525ad3a48c8c2;
  
  var logger = _interopRequireWildcard(_log);
  
  var _debounce = __ee62e24d4acb40214d4f9e21b1a58bfc;
  
  var _browser = __7a2976c482edfafd9b5879a49ffe0535;
  
  var _alignment = __81deba69899d0f1851f2c511b87bbbae;
  
  var _alignment2 = _interopRequireDefault(_alignment);
  
  var _customEvent = __f7a5e0d2ea8865b104efc9b94861591e;
  
  var _customEvent2 = _interopRequireDefault(_customEvent);
  
  var _keyCode = __e246bf93af36eb4453f35afeb1c302d9;
  
  var _keyCode2 = _interopRequireDefault(_keyCode);
  
  var _layer = __3ada4a8272640e5242be87f12c7e0fdf;
  
  var _layer2 = _interopRequireDefault(_layer);
  
  var _state = __3f2c7809aecfe899611b77461a9218ac;
  
  var _state2 = _interopRequireDefault(_state);
  
  var _skate = __0ac9a2c09f995a9c0a478af8742f59b7;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function isChecked(el) {
      return (0, _jquery2.default)(el).is('.checked, .aui-dropdown2-checked, [aria-checked="true"]');
  }
  
  function getTrigger(control) {
      return control._triggeringElement || document.querySelector('[aria-controls="' + control.id + '"]');
  }
  
  function doIfTrigger(triggerable, callback) {
      var trigger = getTrigger(triggerable);
  
      if (trigger) {
          callback(trigger);
      }
  }
  
  function setDropdownTriggerActiveState(trigger, isActive) {
      var $trigger = (0, _jquery2.default)(trigger);
  
      if (isActive) {
          $trigger.attr('aria-expanded', 'true');
          $trigger.addClass('active aui-dropdown2-active');
      } else {
          $trigger.attr('aria-expanded', 'false');
          $trigger.removeClass('active aui-dropdown2-active');
      }
  }
  
  // LOADING STATES
  var UNLOADED = 'unloaded';
  var LOADING = 'loading';
  var ERROR = 'error';
  var SUCCESS = 'success';
  
  // ASYNC DROPDOWN FUNCTIONS
  
  function makeAsyncDropdownContents(json) {
      var dropdownContents = json.map(function makeSection(sectionData) {
          var sectionItemsHtml = sectionData.items.map(function makeSectionItem(itemData) {
              function makeBooleanAttribute(attr) {
                  return itemData[attr] ? attr + ' ="true"' : '';
              }
  
              function makeAttribute(attr) {
                  return itemData[attr] ? attr + '="' + itemData[attr] + '"' : '';
              }
  
              var tagName = 'aui-item-' + itemData.type;
              var itemHtml = '\n                <' + tagName + ' ' + makeAttribute('for') + ' ' + makeAttribute('href') + ' ' + makeBooleanAttribute('interactive') + '\n                    ' + makeBooleanAttribute('checked') + ' ' + makeBooleanAttribute('disabled') + ' ' + makeBooleanAttribute('hidden') + '>\n                    ' + itemData.content + '\n                </' + tagName + '>';
  
              return itemHtml;
          }).join('');
  
          var sectionAttributes = sectionData.label ? 'label="' + sectionData.label + '"' : '';
          var sectionHtml = '\n            <aui-section ' + sectionAttributes + '>\n                ' + sectionItemsHtml + '\n            </aui-section>';
  
          return sectionHtml;
      }).join('\n');
  
      return dropdownContents;
  }
  
  function setDropdownContents(dropdown, json) {
      (0, _state2.default)(dropdown).set('loading-state', SUCCESS);
      _skatejsTemplateHtml2.default.wrap(dropdown).innerHTML = makeAsyncDropdownContents(json);
      _skate2.default.init(dropdown);
  }
  
  function setDropdownErrorState(dropdown) {
      (0, _state2.default)(dropdown).set('loading-state', ERROR);
      (0, _state2.default)(dropdown).set('hasErrorBeenShown', dropdown.isVisible());
      _skatejsTemplateHtml2.default.wrap(dropdown).innerHTML = '\n        <div class="aui-message aui-message-error aui-dropdown-error">\n            <p>' + AJS.I18n.getText('aui.dropdown.async.error') + '</p>\n        </div>\n    ';
  }
  
  function setDropdownLoadingState(dropdown) {
      (0, _state2.default)(dropdown).set('loading-state', LOADING);
      (0, _state2.default)(dropdown).set('hasErrorBeenShown', false);
  
      doIfTrigger(dropdown, function (trigger) {
          trigger.setAttribute('aria-busy', 'true');
      });
  
      _skatejsTemplateHtml2.default.wrap(dropdown).innerHTML = '\n        <div class="aui-dropdown-loading">\n            <aui-spinner size="small"></aui-spinner> ' + AJS.I18n.getText('aui.dropdown.async.loading') + '\n        </div>\n    ';
  }
  
  function setDropdownLoaded(dropdown) {
      doIfTrigger(dropdown, function (trigger) {
          trigger.setAttribute('aria-busy', 'false');
      });
  }
  
  function loadContentsIfAsync(dropdown) {
      if (!dropdown.src || (0, _state2.default)(dropdown).get('loading-state') === LOADING) {
          return;
      }
  
      setDropdownLoadingState(dropdown);
  
      _jquery2.default.ajax(dropdown.src).done(function (json, status, xhr) {
          var isValidStatus = xhr.status === 200;
          if (isValidStatus) {
              setDropdownContents(dropdown, json);
          } else {
              setDropdownErrorState(dropdown);
          }
      }).fail(function () {
          setDropdownErrorState(dropdown);
      }).always(function () {
          setDropdownLoaded(dropdown);
      });
  }
  
  function loadContentWhenMouseEnterTrigger(dropdown) {
      var isDropdownUnloaded = (0, _state2.default)(dropdown).get('loading-state') === UNLOADED;
      var hasCurrentErrorBeenShown = (0, _state2.default)(dropdown).get('hasErrorBeenShown');
      if (isDropdownUnloaded || hasCurrentErrorBeenShown && !dropdown.isVisible()) {
          loadContentsIfAsync(dropdown);
      }
  }
  
  function loadContentWhenMenuShown(dropdown) {
      var isDropdownUnloaded = (0, _state2.default)(dropdown).get('loading-state') === UNLOADED;
      var hasCurrentErrorBeenShown = (0, _state2.default)(dropdown).get('hasErrorBeenShown');
      if (isDropdownUnloaded || hasCurrentErrorBeenShown) {
          loadContentsIfAsync(dropdown);
      }
      if ((0, _state2.default)(dropdown).get('loading-state') === ERROR) {
          (0, _state2.default)(dropdown).set('hasErrorBeenShown', true);
      }
  }
  
  // The dropdown's trigger
  // ----------------------
  
  function triggerCreated(trigger) {
      var dropdownID = trigger.getAttribute('aria-controls');
  
      if (!dropdownID) {
          dropdownID = trigger.getAttribute('aria-owns');
  
          if (!dropdownID) {
              logger.error('Dropdown triggers need either a "aria-owns" or "aria-controls" attribute');
          } else {
              trigger.removeAttribute('aria-owns');
              trigger.setAttribute('aria-controls', dropdownID);
          }
      }
  
      trigger.setAttribute('aria-haspopup', true);
      trigger.setAttribute('aria-expanded', false);
  
      var shouldSetHref = trigger.nodeName === 'A' && !trigger.href;
      if (shouldSetHref) {
          trigger.setAttribute('href', '#' + dropdownID);
      }
  
      function handleIt(e) {
          e.preventDefault();
  
          if (!trigger.isEnabled()) {
              return;
          }
  
          var dropdown = document.getElementById(dropdownID);
  
          // AUI-4271 - Maintains legacy integration with parent elements.
          var $trigger = (0, _jquery2.default)(trigger);
          if ($trigger.parent().hasClass('aui-buttons')) {
              dropdown.classList.add('aui-dropdown2-in-buttons');
          }
          if ($trigger.parents().hasClass('aui-header')) {
              dropdown.classList.add('aui-dropdown2-in-header');
          }
  
          dropdown.toggle(e);
          dropdown.isSubmenu = trigger.hasSubmenu();
  
          return dropdown;
      }
  
      function handleMouseEnter(e) {
          e.preventDefault();
  
          if (!trigger.isEnabled()) {
              return;
          }
  
          var dropdown = document.getElementById(dropdownID);
          loadContentWhenMouseEnterTrigger(dropdown);
  
          if (trigger.hasSubmenu()) {
              dropdown.show(e);
              dropdown.isSubmenu = trigger.hasSubmenu();
          }
  
          return dropdown;
      }
  
      function handleKeydown(e) {
          var normalInvoke = e.keyCode === _keyCode2.default.ENTER || e.keyCode === _keyCode2.default.SPACE;
          var submenuInvoke = e.keyCode === _keyCode2.default.RIGHT && trigger.hasSubmenu();
          var rootMenuInvoke = (e.keyCode === _keyCode2.default.UP || e.keyCode === _keyCode2.default.DOWN) && !trigger.hasSubmenu();
  
          if (normalInvoke || submenuInvoke || rootMenuInvoke) {
              var dropdown = handleIt(e);
  
              if (dropdown) {
                  dropdown.focusItem(0);
              }
          }
      }
  
      (0, _jquery2.default)(trigger).on('aui-button-invoke', handleIt).on('click', handleIt).on('keydown', handleKeydown).on('mouseenter', handleMouseEnter);
  }
  
  var triggerPrototype = {
      disable: function disable() {
          this.setAttribute('aria-disabled', 'true');
      },
  
      enable: function enable() {
          this.setAttribute('aria-disabled', 'false');
      },
  
      isEnabled: function isEnabled() {
          return this.getAttribute('aria-disabled') !== 'true';
      },
  
      hasSubmenu: function hasSubmenu() {
          var triggerClasses = (this.className || '').split(/\s+/);
          return triggerClasses.indexOf('aui-dropdown2-sub-trigger') !== -1;
      }
  };
  
  (0, _skate2.default)('aui-dropdown2-trigger', {
      type: _skate2.default.type.CLASSNAME,
      created: triggerCreated,
      prototype: triggerPrototype
  });
  
  //To remove at a later date. Some dropdown triggers initialise lazily, so we need to listen for mousedown
  //and synchronously init before the click event is fired.
  //TODO: delete in AUI 8.0.0, see AUI-2868
  function bindLazyTriggerInitialisation() {
      (0, _jquery2.default)(document).on('mousedown', '.aui-dropdown2-trigger', function () {
          var isElementSkated = this.hasAttribute('resolved');
          if (!isElementSkated) {
              _skate2.default.init(this);
              var lazyDeprecate = deprecate.getMessageLogger('Dropdown2 lazy initialisation', {
                  removeInVersion: '8.0.0',
                  alternativeName: 'initialisation on DOM insertion',
                  sinceVersion: '5.8.0',
                  extraInfo: 'Dropdown2 triggers should have all necessary attributes on DOM insertion',
                  deprecationType: 'JS'
              });
              lazyDeprecate();
          }
      });
  }
  
  bindLazyTriggerInitialisation();
  
  (0, _skate2.default)('aui-dropdown2-sub-trigger', {
      type: _skate2.default.type.CLASSNAME,
      created: function created(trigger) {
          trigger.className += ' aui-dropdown2-trigger';
          _skate2.default.init(trigger);
      }
  });
  
  // Dropdown trigger groups
  // -----------------------
  
  (0, _jquery2.default)(document).on('mouseenter', '.aui-dropdown2-trigger-group a, .aui-dropdown2-trigger-group button', function (e) {
      var $item = (0, _jquery2.default)(e.currentTarget);
  
      if ($item.is('.aui-dropdown2-active')) {
          return; // No point doing anything if we're hovering over the already-active item trigger.
      }
  
      if ($item.closest('.aui-dropdown2').length) {
          return; // We don't want to deal with dropdown items, just the potential triggers in the group.
      }
  
      var $triggerGroup = $item.closest('.aui-dropdown2-trigger-group');
  
      var $groupActiveTrigger = $triggerGroup.find('.aui-dropdown2-active');
      if ($groupActiveTrigger.length && $item.is('.aui-dropdown2-trigger')) {
          $groupActiveTrigger.blur(); // Remove focus from the previously opened menu.
          $item.trigger('aui-button-invoke'); // Open this trigger's menu.
          e.preventDefault();
      }
  
      var $groupFocusedTrigger = $triggerGroup.find(':focus');
      if ($groupFocusedTrigger.length && $item.is('.aui-dropdown2-trigger')) {
          $groupFocusedTrigger.blur();
      }
  });
  
  // Dropdown items
  // --------------
  
  function getDropdownItems(dropdown, filter) {
      return (0, _jquery2.default)(dropdown).find([
      // Legacy markup.
      '> ul > li', '> .aui-dropdown2-section > ul > li',
      // Accessible markup.
      '> div[role] > .aui-dropdown2-section > div[role="group"] > ul[role] > li[role]',
      // Web component.
      'aui-item-link', 'aui-item-checkbox', 'aui-item-radio'].join(', ')).filter(filter).children('a, button, [role="checkbox"], [role="menuitemcheckbox"], [role="radio"], [role="menuitemradio"]');
  }
  
  function getAllDropdownItems(dropdown) {
      return getDropdownItems(dropdown, function () {
          return true;
      });
  }
  
  function getVisibleDropdownItems(dropdown) {
      return getDropdownItems(dropdown, function () {
          return this.className.indexOf('hidden') === -1 && !this.hasAttribute('hidden');
      });
  }
  
  function amendDropdownItem(item) {
      var $item = (0, _jquery2.default)(item);
  
      $item.attr('tabindex', '-1');
  
      /**
       * Honouring the documentation.
       * @link https://docs.atlassian.com/aui/latest/docs/dropdown2.html
       */
      if ($item.hasClass('aui-dropdown2-disabled') || $item.parent().hasClass('aui-dropdown2-hidden')) {
          $item.attr('aria-disabled', true);
      }
  }
  
  function amendDropdownContent(dropdown) {
      // Add assistive semantics to each dropdown item
      getAllDropdownItems(dropdown).each(function () {
          amendDropdownItem(this);
      });
  }
  
  /**
   * Honours behaviour for code written using only the legacy class names.
   * To maintain old behaviour (i.e., remove the 'hidden' class and the item will become un-hidden)
   * whilst allowing our code to only depend on the new classes, we need to
   * keep the state of the DOM in sync with legacy classes.
   *
   * Calling this function will add the new namespaced classes to elements with legacy names.
   * @returns {Function} a function to remove the new namespaced classes, only from the elements they were added to.
   */
  function migrateAndSyncLegacyClassNames(dropdown) {
      var $dropdown = (0, _jquery2.default)(dropdown);
  
      // Migrate away from legacy class names
      var $hiddens = $dropdown.find('.hidden').addClass('aui-dropdown2-hidden');
      var $disableds = $dropdown.find('.disabled').addClass('aui-dropdown2-disabled');
      var $interactives = $dropdown.find('.interactive').addClass('aui-dropdown2-interactive');
  
      return function revertToOriginalMarkup() {
          $hiddens.removeClass('aui-dropdown2-hidden');
          $disableds.removeClass('aui-dropdown2-disabled');
          $interactives.removeClass('aui-dropdown2-interactive');
      };
  }
  
  // The Dropdown itself
  // -------------------
  
  function setLayerAlignment(dropdown, trigger) {
      var hasSubmenu = trigger && trigger.hasSubmenu && trigger.hasSubmenu();
      var hasSubmenuAlignment = dropdown.getAttribute('data-aui-alignment') === 'submenu auto';
  
      if (!hasSubmenu && hasSubmenuAlignment) {
          restorePreviousAlignment(dropdown);
      }
      var hasAnyAlignment = dropdown.hasAttribute('data-aui-alignment');
  
      if (hasSubmenu && !hasSubmenuAlignment) {
          saveCurrentAlignment(dropdown);
          dropdown.setAttribute('data-aui-alignment', 'submenu auto');
          dropdown.setAttribute('data-aui-alignment-static', true);
      } else if (!hasAnyAlignment) {
          dropdown.setAttribute('data-aui-alignment', 'bottom auto');
          dropdown.setAttribute('data-aui-alignment-static', true);
      }
  
      if (dropdown._auiAlignment) {
          dropdown._auiAlignment.destroy();
      }
  
      dropdown._auiAlignment = new _alignment2.default(dropdown, trigger);
  
      dropdown._auiAlignment.enable();
  }
  
  function saveCurrentAlignment(dropdown) {
      var $dropdown = (0, _jquery2.default)(dropdown);
      if (dropdown.hasAttribute('data-aui-alignment')) {
          $dropdown.data('previous-data-aui-alignment', dropdown.getAttribute('data-aui-alignment'));
      }
      $dropdown.data('had-data-aui-alignment-static', dropdown.hasAttribute('data-aui-alignment-static'));
  }
  
  function restorePreviousAlignment(dropdown) {
      var $dropdown = (0, _jquery2.default)(dropdown);
  
      var previousAlignment = $dropdown.data('previous-data-aui-alignment');
      if (previousAlignment) {
          dropdown.setAttribute('data-aui-alignment', previousAlignment);
      } else {
          dropdown.removeAttribute('data-aui-alignment');
      }
      $dropdown.removeData('previous-data-aui-alignment');
  
      if (!$dropdown.data('had-data-aui-alignment-static')) {
          dropdown.removeAttribute('data-aui-alignment-static');
      }
      $dropdown.removeData('had-data-aui-alignment-static');
  }
  
  function getDropdownHideLocation(dropdown, trigger) {
      var possibleHome = trigger.getAttribute('data-dropdown2-hide-location');
      return document.getElementById(possibleHome) || dropdown.parentNode;
  }
  
  var keyboardClose = false;
  function keyboardCloseDetected() {
      keyboardClose = true;
  }
  
  function wasProbablyClosedViaKeyboard() {
      var result = keyboardClose === true;
      keyboardClose = false;
      return result;
  }
  
  function bindDropdownBehaviourToLayer(dropdown) {
      (0, _layer2.default)(dropdown);
  
      dropdown.addEventListener('aui-layer-show', function () {
          (0, _jquery2.default)(dropdown).trigger('aui-dropdown2-show');
  
          dropdown._syncClasses = migrateAndSyncLegacyClassNames(dropdown);
  
          amendDropdownContent(this);
  
          doIfTrigger(dropdown, function (trigger) {
              setDropdownTriggerActiveState(trigger, true);
              dropdown._returnTo = getDropdownHideLocation(dropdown, trigger);
          });
      });
  
      dropdown.addEventListener('aui-layer-hide', function () {
          (0, _jquery2.default)(dropdown).trigger('aui-dropdown2-hide');
  
          if (dropdown._syncClasses) {
              dropdown._syncClasses();
              delete dropdown._syncClasses;
          }
  
          if (dropdown._auiAlignment) {
              dropdown._auiAlignment.disable();
              dropdown._auiAlignment.destroy();
          }
  
          if (dropdown._returnTo) {
              if (dropdown.parentNode && dropdown.parentNode !== dropdown._returnTo) {
                  dropdown._returnTo.appendChild(dropdown);
              }
          }
  
          (0, _jquery2.default)(dropdown).removeClass('aui-dropdown2-in-buttons');
  
          getVisibleDropdownItems(dropdown).removeClass('active aui-dropdown2-active');
  
          doIfTrigger(dropdown, function (trigger) {
              if (wasProbablyClosedViaKeyboard()) {
                  trigger.focus();
                  setDropdownTriggerActiveState(trigger, trigger.hasSubmenu && trigger.hasSubmenu());
              } else {
                  setDropdownTriggerActiveState(trigger, false);
              }
          });
  
          // Gets set by submenu trigger invocation. Bad coupling point?
          delete dropdown.isSubmenu;
          dropdown._triggeringElement = null;
      });
  }
  
  function bindItemInteractionBehaviourToDropdown(dropdown) {
      var $dropdown = (0, _jquery2.default)(dropdown);
  
      $dropdown.on('keydown', function (e) {
          if (e.keyCode === _keyCode2.default.DOWN) {
              dropdown.focusNext();
              e.preventDefault();
          } else if (e.keyCode === _keyCode2.default.UP) {
              dropdown.focusPrevious();
              e.preventDefault();
          } else if (e.keyCode === _keyCode2.default.LEFT) {
              if (dropdown.isSubmenu) {
                  keyboardCloseDetected();
                  dropdown.hide(e);
                  e.preventDefault();
              }
          } else if (e.keyCode === _keyCode2.default.ESCAPE) {
              // The closing will be handled by the LayerManager!
              keyboardCloseDetected();
          } else if (e.keyCode === _keyCode2.default.TAB) {
              keyboardCloseDetected();
              dropdown.hide(e);
          }
      });
  
      var hideIfNotSubmenuAndNotInteractive = function hideIfNotSubmenuAndNotInteractive(e) {
          var $item = (0, _jquery2.default)(e.currentTarget);
  
          if ($item.attr('aria-disabled') === 'true') {
              e.preventDefault();
              return;
          }
  
          var isSubmenuTrigger = e.currentTarget.hasSubmenu && e.currentTarget.hasSubmenu();
          if (!isSubmenuTrigger && !$item.is('.aui-dropdown2-interactive')) {
  
              var theMenu = dropdown;
              do {
                  var dd = (0, _layer2.default)(theMenu);
                  theMenu = (0, _layer2.default)(theMenu).below();
                  if (dd.$el.is('.aui-dropdown2')) {
                      dd.hide(e);
                  }
              } while (theMenu);
          }
      };
  
      $dropdown.on('click keydown', 'a, button, [role="menuitem"], [role="menuitemcheckbox"], [role="checkbox"], [role="menuitemradio"], [role="radio"]', function (e) {
          var item = e.currentTarget;
          var $item = (0, _jquery2.default)(item);
          var eventKeyCode = e.keyCode;
          var isEnter = eventKeyCode === _keyCode2.default.ENTER;
          var isSpace = eventKeyCode === _keyCode2.default.SPACE;
  
          // AUI-4283: Accessibility - need to ignore enter on links/buttons so
          // that the dropdown remains visible to allow the click event to eventually fire.
          var itemIgnoresEnter = isEnter && $item.is('a[href], button');
  
          if (!itemIgnoresEnter && (e.type === 'click' || isEnter || isSpace)) {
              hideIfNotSubmenuAndNotInteractive(e);
          }
      });
  
      // close a submenus when the mouse moves over items other than its trigger
      $dropdown.on('mouseenter', 'a, button, [role="menuitem"], [role="menuitemcheckbox"], [role="checkbox"], [role="menuitemradio"], [role="radio"]', function (e) {
          var item = e.currentTarget;
          var hasSubmenu = item.hasSubmenu && item.hasSubmenu();
  
          if (!e.isDefaultPrevented() && !hasSubmenu) {
              var maybeALayer = (0, _layer2.default)(dropdown).above();
  
              if (maybeALayer) {
                  (0, _layer2.default)(maybeALayer).hide();
              }
          }
      });
  }
  
  (0, _jquery2.default)(window).on('resize', (0, _debounce.debounceImmediate)(function () {
      (0, _jquery2.default)('.aui-dropdown2').each(function (index, dropdown) {
          _skate2.default.init(dropdown);
          if (dropdown.isVisible()) {
              dropdown.hide();
          }
      });
  }, 1000));
  
  // Dropdowns
  // ---------
  
  function dropdownCreated(dropdown) {
      var $dropdown = (0, _jquery2.default)(dropdown);
  
      $dropdown.addClass('aui-dropdown2');
  
      // swap the inner div to presentation as application is only needed for Windows
      if ((0, _browser.supportsVoiceOver)()) {
          $dropdown.find('> div[role="application"]').attr('role', 'presentation');
      }
  
      if (dropdown.hasAttribute('data-container')) {
          $dropdown.attr('data-aui-alignment-container', $dropdown.attr('data-container'));
          $dropdown.removeAttr('data-container');
      }
  
      bindDropdownBehaviourToLayer(dropdown);
      bindItemInteractionBehaviourToDropdown(dropdown);
      dropdown.hide();
  
      (0, _jquery2.default)(dropdown).delegate('.aui-dropdown2-checkbox:not(.disabled):not(.aui-dropdown2-disabled)', 'click keydown', function (e) {
          if (e.type === 'click' || e.keyCode === _keyCode2.default.ENTER || e.keyCode === _keyCode2.default.SPACE) {
              var checkbox = this;
              if (e.isDefaultPrevented()) {
                  return;
              }
              if (checkbox.isInteractive()) {
                  e.preventDefault();
              }
              if (checkbox.isEnabled()) {
                  // toggle the checked state
                  if (checkbox.isChecked()) {
                      checkbox.uncheck();
                  } else {
                      checkbox.check();
                  }
              }
          }
      });
  
      (0, _jquery2.default)(dropdown).delegate('.aui-dropdown2-radio:not(.checked):not(.aui-dropdown2-checked):not(.disabled):not(.aui-dropdown2-disabled)', 'click keydown', function (e) {
          if (e.type === 'click' || e.keyCode === _keyCode2.default.ENTER || e.keyCode === _keyCode2.default.SPACE) {
              var radio = this;
              if (e.isDefaultPrevented()) {
                  return;
              }
              if (radio.isInteractive()) {
                  e.preventDefault();
              }
  
              var $radio = (0, _jquery2.default)(this);
              if (this.isEnabled() && this.isChecked() === false) {
                  // toggle the checked state
                  $radio.closest('ul,[role=group]').find('.aui-dropdown2-checked').not(this).each(function () {
                      this.uncheck();
                  });
                  radio.check();
              }
          }
      });
  }
  
  var dropdownPrototype = {
      /**
       * Toggles the visibility of the dropdown menu
       */
      toggle: function toggle(e) {
          if (this.isVisible()) {
              this.hide(e);
          } else {
              this.show(e);
          }
      },
  
      /**
       * Explicitly shows the menu
       *
       * @returns {HTMLElement}
       */
      show: function show(e) {
          if (e && e.currentTarget && e.currentTarget.classList.contains('aui-dropdown2-trigger')) {
              this._triggeringElement = e.currentTarget;
          }
          (0, _layer2.default)(this).show();
  
          var dropdown = this;
          doIfTrigger(dropdown, function (trigger) {
              setLayerAlignment(dropdown, trigger);
          });
  
          return this;
      },
  
      /**
       * Explicitly hides the menu
       *
       * @returns {HTMLElement}
       */
      hide: function hide() {
          (0, _layer2.default)(this).hide();
          return this;
      },
  
      /**
       * Shifts explicit focus to the next available item in the menu
       *
       * @returns {undefined}
       */
      focusNext: function focusNext() {
          var $items = getVisibleDropdownItems(this);
          var selected = document.activeElement;
          var idx;
  
          if ($items.last()[0] !== selected) {
              idx = $items.toArray().indexOf(selected);
              this.focusItem($items.get(idx + 1));
          }
      },
  
      /**
       * Shifts explicit focus to the previous available item in the menu
       *
       * @returns {undefined}
       */
      focusPrevious: function focusPrevious() {
          var $items = getVisibleDropdownItems(this);
          var selected = document.activeElement;
          var idx;
  
          if ($items.first()[0] !== selected) {
              idx = $items.toArray().indexOf(selected);
              this.focusItem($items.get(idx - 1));
          }
      },
  
      /**
       * Shifts explicit focus to the menu item matching the index param
       */
      focusItem: function focusItem(item) {
          var $items = getVisibleDropdownItems(this);
          var $item;
          if (typeof item === 'number') {
              item = $items.get(item);
          }
          $item = (0, _jquery2.default)(item);
          $item.focus();
          $items.removeClass('active aui-dropdown2-active');
          $item.addClass('active aui-dropdown2-active');
      },
  
      /**
       * Checks whether or not the menu is currently displayed
       *
       * @returns {Boolean}
       */
      isVisible: function isVisible() {
          return (0, _layer2.default)(this).isVisible();
      }
  };
  
  // Web component API for dropdowns
  // -------------------------------
  
  var disabledAttributeHandler = {
      created: function created(element) {
          var a = element.children[0];
          a.setAttribute('aria-disabled', 'true');
          a.className += ' aui-dropdown2-disabled';
      },
      removed: function removed(element) {
          var a = element.children[0];
          a.setAttribute('aria-disabled', 'false');
          (0, _jquery2.default)(a).removeClass('aui-dropdown2-disabled');
      }
  };
  
  var interactiveAttributeHandler = {
      created: function created(element) {
          var a = element.children[0];
          a.className += ' aui-dropdown2-interactive';
      },
      removed: function removed(element) {
          var a = element.children[0];
          (0, _jquery2.default)(a).removeClass('aui-dropdown2-interactive');
      }
  };
  
  var checkedAttributeHandler = {
      created: function created(element) {
          var a = element.children[0];
          (0, _jquery2.default)(a).addClass('checked aui-dropdown2-checked');
          a.setAttribute('aria-checked', true);
          element.dispatchEvent(new _customEvent2.default('change', { bubbles: true }));
      },
      removed: function removed(element) {
          var a = element.children[0];
          (0, _jquery2.default)(a).removeClass('checked aui-dropdown2-checked');
          a.setAttribute('aria-checked', false);
          element.dispatchEvent(new _customEvent2.default('change', { bubbles: true }));
      }
  };
  
  var hiddenAttributeHandler = {
      created: function created(element) {
          disabledAttributeHandler.created(element);
      },
      removed: function removed(element) {
          disabledAttributeHandler.removed(element);
      }
  };
  
  var stringAttributeHandlerGenerator = function stringAttributeHandlerGenerator(attrName) {
      return {
          fallback: function fallback(element, change) {
              var a = element.children[0];
              a.setAttribute(attrName, change.newValue);
          },
          removed: function removed(element) {
              var a = element.children[0];
              a.removeAttribute(attrName);
          }
      };
  };
  
  (0, _skate2.default)('aui-item-link', {
      template: (0, _skatejsTemplateHtml2.default)('<a role="menuitem" tabindex="-1"><content></content></a>'),
      attributes: {
          disabled: disabledAttributeHandler,
          interactive: interactiveAttributeHandler,
          hidden: hiddenAttributeHandler,
          href: stringAttributeHandlerGenerator('href'),
          'item-id': stringAttributeHandlerGenerator('id'),
          for: {
              created: function created(element) {
                  var anchor = element.children[0];
                  anchor.setAttribute('aria-controls', element.getAttribute('for'));
                  (0, _jquery2.default)(anchor).addClass('aui-dropdown2-sub-trigger');
              },
              updated: function updated(element) {
                  var anchor = element.children[0];
                  anchor.setAttribute('aria-controls', element.getAttribute('for'));
              },
              removed: function removed(element) {
                  var anchor = element.children[0];
                  anchor.removeAttribute('aria-controls');
                  (0, _jquery2.default)(anchor).removeClass('aui-dropdown2-sub-trigger');
              }
          }
      }
  });
  
  (0, _skate2.default)('aui-item-checkbox', {
      template: (0, _skatejsTemplateHtml2.default)('<span role="checkbox" class="aui-dropdown2-checkbox" tabindex="-1"><content></content></span>'),
      attributes: {
          'item-id': stringAttributeHandlerGenerator('id'),
          disabled: disabledAttributeHandler,
          interactive: interactiveAttributeHandler,
          checked: checkedAttributeHandler,
          hidden: hiddenAttributeHandler
      }
  });
  
  (0, _skate2.default)('aui-item-radio', {
      template: (0, _skatejsTemplateHtml2.default)('<span role="radio" class="aui-dropdown2-radio" tabindex="-1"><content></content></span>'),
      attributes: {
          'item-id': stringAttributeHandlerGenerator('id'),
          disabled: disabledAttributeHandler,
          interactive: interactiveAttributeHandler,
          checked: checkedAttributeHandler,
          hidden: hiddenAttributeHandler
      }
  });
  
  (0, _skate2.default)('aui-section', {
      template: (0, _skatejsTemplateHtml2.default)('\n        <strong aria-role="presentation" class="aui-dropdown2-heading"></strong>\n        <div role="group">\n            <content></content>\n        </div>\n    '),
      attributes: {
          label: function label(element, data) {
              var headingElement = element.children[0];
              var groupElement = element.children[1];
              headingElement.textContent = data.newValue;
              groupElement.setAttribute('aria-label', data.newValue);
          }
      },
      created: function created(element) {
          element.className += ' aui-dropdown2-section';
          element.setAttribute('role', 'presentation');
      }
  });
  
  (0, _skate2.default)('aui-dropdown-menu', {
      template: (0, _skatejsTemplateHtml2.default)('\n        <div role="application">\n            <content></content>\n        </div>\n    '),
      created: function created(dropdown) {
          dropdown.setAttribute('role', 'menu');
          dropdown.className = 'aui-dropdown2 aui-style-default aui-layer';
          (0, _state2.default)(dropdown).set('loading-state', UNLOADED);
          // Now skate the .aui-dropdown2 behaviour.
          _skate2.default.init(dropdown);
      },
      attributes: {
          src: {}
      },
      prototype: dropdownPrototype,
      events: {
          'aui-layer-show': loadContentWhenMenuShown
      }
  });
  
  // Legacy dropdown inits
  // ---------------------
  
  (0, _skate2.default)('aui-dropdown2', {
      type: _skate2.default.type.CLASSNAME,
      created: dropdownCreated,
      prototype: dropdownPrototype
  });
  
  (0, _skate2.default)('data-aui-dropdown2', {
      type: _skate2.default.type.ATTRIBUTE,
      created: dropdownCreated,
      prototype: dropdownPrototype
  });
  
  // Checkboxes and radios
  // ---------------------
  
  (0, _skate2.default)('aui-dropdown2-checkbox', {
      type: _skate2.default.type.CLASSNAME,
  
      created: function created(checkbox) {
          var checked = isChecked(checkbox);
          if (checked) {
              (0, _jquery2.default)(checkbox).addClass('checked aui-dropdown2-checked');
          }
          checkbox.setAttribute('aria-checked', checked);
          checkbox.setAttribute('tabindex', '0');
  
          // swap from menuitemcheckbox to just plain checkbox for VoiceOver
          if ((0, _browser.supportsVoiceOver)()) {
              checkbox.setAttribute('role', 'checkbox');
          }
      },
  
      prototype: {
          isEnabled: function isEnabled() {
              return !(this.getAttribute('aria-disabled') !== null && this.getAttribute('aria-disabled') === 'true');
          },
  
          isChecked: function isChecked() {
              return this.getAttribute('aria-checked') !== null && this.getAttribute('aria-checked') === 'true';
          },
  
          isInteractive: function isInteractive() {
              return (0, _jquery2.default)(this).hasClass('aui-dropdown2-interactive');
          },
  
          uncheck: function uncheck() {
              if (this.parentNode.tagName.toLowerCase() === 'aui-item-checkbox') {
                  this.parentNode.removeAttribute('checked');
              }
              this.setAttribute('aria-checked', 'false');
              (0, _jquery2.default)(this).removeClass('checked aui-dropdown2-checked');
              (0, _jquery2.default)(this).trigger('aui-dropdown2-item-uncheck');
          },
  
          check: function check() {
              if (this.parentNode.tagName.toLowerCase() === 'aui-item-checkbox') {
                  this.parentNode.setAttribute('checked', '');
              }
              this.setAttribute('aria-checked', 'true');
              (0, _jquery2.default)(this).addClass('checked aui-dropdown2-checked');
              (0, _jquery2.default)(this).trigger('aui-dropdown2-item-check');
          }
      }
  });
  
  (0, _skate2.default)('aui-dropdown2-radio', {
      type: _skate2.default.type.CLASSNAME,
  
      created: function created(radio) {
          // add a dash of ARIA
          var checked = isChecked(radio);
          if (checked) {
              (0, _jquery2.default)(radio).addClass('checked aui-dropdown2-checked');
          }
          radio.setAttribute('aria-checked', checked);
          radio.setAttribute('tabindex', '0');
  
          // swap from menuitemradio to just plain radio for VoiceOver
          if ((0, _browser.supportsVoiceOver)()) {
              radio.setAttribute('role', 'radio');
          }
      },
  
      prototype: {
          isEnabled: function isEnabled() {
              return !(this.getAttribute('aria-disabled') !== null && this.getAttribute('aria-disabled') === 'true');
          },
  
          isChecked: function isChecked() {
              return this.getAttribute('aria-checked') !== null && this.getAttribute('aria-checked') === 'true';
          },
  
          isInteractive: function isInteractive() {
              return (0, _jquery2.default)(this).hasClass('aui-dropdown2-interactive');
          },
  
          uncheck: function uncheck() {
              if (this.parentNode.tagName.toLowerCase() === 'aui-item-radio') {
                  this.parentNode.removeAttribute('checked');
              }
              this.setAttribute('aria-checked', 'false');
              (0, _jquery2.default)(this).removeClass('checked aui-dropdown2-checked');
              (0, _jquery2.default)(this).trigger('aui-dropdown2-item-uncheck');
          },
  
          check: function check() {
              if (this.parentNode.tagName.toLowerCase() === 'aui-item-radio') {
                  this.parentNode.setAttribute('checked', '');
              }
              this.setAttribute('aria-checked', 'true');
              (0, _jquery2.default)(this).addClass('checked aui-dropdown2-checked');
              (0, _jquery2.default)(this).trigger('aui-dropdown2-item-check');
          }
      }
  });
  
  return module.exports;
}).call(this);