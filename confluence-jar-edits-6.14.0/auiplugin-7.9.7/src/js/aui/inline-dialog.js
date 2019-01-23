// src/js/aui/inline-dialog.js
(typeof window === 'undefined' ? global : window).__b25d88f7d8f364347fd8fafd71054d2b = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  /* eslint quotmark:off, eqeqeq:off, strict:off, complexity:off */
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _browser = __7a2976c482edfafd9b5879a49ffe0535;
  
  var _deprecation = __921ad9514d56376fef992861d9ec0f51;
  
  var deprecate = _interopRequireWildcard(_deprecation);
  
  var _log = __c1e961001275c079e48525ad3a48c8c2;
  
  var logger = _interopRequireWildcard(_log);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _keyCode = __e246bf93af36eb4453f35afeb1c302d9;
  
  var _keyCode2 = _interopRequireDefault(_keyCode);
  
  var _css = __fc40a64c1c6f1a1eb4dbe5afd5a88a17;
  
  var _css2 = _interopRequireDefault(_css);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Creates a new inline dialog.
   *
   * @param items jQuery object - the items that trigger the display of this popup when the user mouses over.
   * @param identifier A unique identifier for this popup. This should be unique across all popups on the page and a valid CSS class.
   * @param url The URL to retrieve popup contents.
   * @param options Custom options to change default behaviour. See InlineDialog.opts for default values and valid options.
   */
  function InlineDialog(items, identifier, url, options) {
      options = options || [];
  
      if (options.hasOwnProperty('onTop')) {
          onTopDeprecationLogger();
          if (options.onTop && options.gravity === undefined) {
              options.gravity = 's';
          }
      }
  
      // attempt to generate a random identifier if it doesn't exist
      if (typeof identifier === 'undefined') {
          identifier = String(Math.random()).replace('.', '');
  
          // if the generated supplied identifier already exists when combined with the prefixes we'll be using, then bail
          if ((0, _jquery2.default)('#inline-dialog-' + identifier + ', #arrow-' + identifier + ', #inline-dialog-shim-' + identifier).length) {
              throw 'GENERATED_IDENTIFIER_NOT_UNIQUE';
          }
      }
  
      var escapedIdentifier = (0, _css2.default)(identifier);
  
      var opts = _jquery2.default.extend(false, InlineDialog.opts, options);
      if (opts.gravity === 'w') {
          // TODO Once support for gravity: 'e' is added, it should also
          //      transpose the defaults for offsetX and offsetY.
          opts.offsetX = options.offsetX === undefined ? 10 : options.offsetX;
          opts.offsetY = options.offsetY === undefined ? 0 : options.offsetY;
      }
  
      var hash;
      var hideDelayTimer;
      var showTimer;
      var beingShown = false;
      var shouldShow = false;
      var contentLoaded = false;
      var mousePosition;
      var targetPosition;
      var popup = (0, _jquery2.default)('<div id="inline-dialog-' + identifier + '" class="aui-inline-dialog"><div class="aui-inline-dialog-contents contents"></div><div id="arrow-' + identifier + '" class="aui-inline-dialog-arrow arrow aui-css-arrow"></div></div>');
  
      var arrow = (0, _jquery2.default)('#arrow-' + escapedIdentifier, popup);
      var contents = popup.find('.contents');
  
      if (!opts.displayShadow) {
          contents.addClass('aui-inline-dialog-no-shadow');
      }
  
      if (opts.autoWidth) {
          contents.addClass('aui-inline-dialog-auto-width');
      } else {
          contents.width(opts.width);
      }
  
      contents.on({
          mouseenter: function mouseenter() {
              clearTimeout(hideDelayTimer);
              popup.unbind('mouseenter');
          },
          mouseleave: function mouseleave() {
              hidePopup();
          }
      });
  
      var getHash = function getHash() {
          if (!hash) {
              hash = {
                  popup: popup,
                  hide: function hide() {
                      hidePopup(0);
                  },
                  id: identifier,
                  show: function show() {
                      showPopup();
                  },
                  persistent: opts.persistent ? true : false,
                  reset: function reset() {
  
                      function drawPopup(popup, positions) {
                          //Position the popup using the left and right parameters
                          popup.css(positions.popupCss);
  
                          arrow.removeClass('aui-bottom-arrow aui-left-arrow aui-right-arrow');
                          if (positions.gravity === 's' && !arrow.hasClass('aui-bottom-arrow')) {
                              arrow.addClass('aui-bottom-arrow');
                          } else if (positions.gravity === 'w') {
                              arrow.addClass('aui-left-arrow');
                          } else if (positions.gravity === 'e') {
                              arrow.addClass('aui-right-arrow');
                          }
                          // Default styles are for 'n' gravity.
  
                          arrow.css(positions.arrowCss);
                      }
  
                      //DRAW POPUP
                      var viewportHeight = (0, _jquery2.default)(window).height();
                      var popupMaxHeight = Math.round(viewportHeight * 0.75);
                      popup.children('.aui-inline-dialog-contents').css('max-height', popupMaxHeight);
  
                      var positions = opts.calculatePositions(popup, targetPosition, mousePosition, opts);
                      if (positions.hasOwnProperty('displayAbove')) {
                          displayAboveDeprecationLogger();
                          positions.gravity = positions.displayAbove ? 's' : 'n';
                      }
  
                      drawPopup(popup, positions);
  
                      // reset position of popup box
                      popup.fadeIn(opts.fadeTime, function () {
                          // once the animation is complete, set the tracker variables
                          // beingShown = false; // is this necessary? Maybe only the shouldShow will have to be reset?
                      });
  
                      if ((0, _browser.needsLayeringShim)()) {
                          // iframeShim, prepend if it doesnt exist
                          var jQueryCache = (0, _jquery2.default)('#inline-dialog-shim-' + escapedIdentifier);
                          if (!jQueryCache.length) {
                              (0, _jquery2.default)(popup).prepend((0, _jquery2.default)('<iframe class = "inline-dialog-shim" id="inline-dialog-shim-' + identifier + '" frameBorder="0" src="javascript:false;"></iframe>'));
                          }
                          // adjust height and width of shim according to the popup
                          jQueryCache.css({
                              width: contents.outerWidth(),
                              height: contents.outerHeight()
                          });
                      }
                  }
              };
          }
          return hash;
      };
  
      var showPopup = function showPopup() {
          if (popup.is(':visible')) {
              return;
          }
          showTimer = setTimeout(function () {
              if (!contentLoaded || !shouldShow) {
                  return;
              }
              opts.addActiveClass && (0, _jquery2.default)(items).addClass('active');
              beingShown = true;
              if (!opts.persistent) {
                  bindHideEvents();
              }
              InlineDialog.current = getHash();
              (0, _jquery2.default)(document).trigger('showLayer', ['inlineDialog', getHash()]);
              // retrieve the position of the click target. The offsets might be different for different types of targets and therefore
              // either have to be customisable or we will have to be smarter about calculating the padding and elements around it
  
              getHash().reset();
          }, opts.showDelay);
      };
  
      var hidePopup = function hidePopup(delay) {
          // do not auto hide the popup if persistent is set as true
          if (typeof delay === 'undefined' && opts.persistent) {
              return;
          }
          if (typeof popup.get(0)._datePickerPopup !== 'undefined') {
              // AUI-2696 - This inline dialog is host to a date picker... so we shouldn't close it.
              return;
          }
  
          shouldShow = false;
          // only exectute the below if the popup is currently being shown
          // and the arbitrator callback gives us the green light
          if (beingShown && opts.preHideCallback.call(popup[0].popup)) {
              delay = delay == null ? opts.hideDelay : delay;
              clearTimeout(hideDelayTimer);
              clearTimeout(showTimer);
              // store the timer so that it can be cleared in the mouseenter if required
              //disable auto-hide if user passes null for hideDelay
              if (delay != null) {
                  hideDelayTimer = setTimeout(function () {
                      unbindHideEvents();
                      opts.addActiveClass && (0, _jquery2.default)(items).removeClass('active');
                      popup.fadeOut(opts.fadeTime, function () {
                          opts.hideCallback.call(popup[0].popup);
                      });
                      beingShown = false;
                      shouldShow = false;
                      (0, _jquery2.default)(document).trigger('hideLayer', ['inlineDialog', getHash()]);
                      InlineDialog.current = null;
                      if (!opts.cacheContent) {
                          //if not caching the content, then reset the
                          //flags to false so as to reload the content
                          //on next mouse hover.
                          contentLoaded = false;
                          contentLoading = false;
                      }
                  }, delay);
              }
          }
      };
  
      // the trigger is the jquery element that is triggering the popup (i.e., the element that the mousemove event is bound to)
      var initPopup = function initPopup(e, trigger) {
          var $trigger = (0, _jquery2.default)(trigger);
  
          opts.upfrontCallback.call({
              popup: popup,
              hide: function hide() {
                  hidePopup(0);
              },
              id: identifier,
              show: function show() {
                  showPopup();
              }
          });
  
          popup.each(function () {
              if (typeof this.popup !== 'undefined') {
                  this.popup.hide();
              }
          });
  
          //Close all other popups if neccessary
          if (opts.closeOthers) {
              (0, _jquery2.default)('.aui-inline-dialog').each(function () {
                  !this.popup.persistent && this.popup.hide();
              });
          }
  
          //handle programmatic showing where there is no event
          targetPosition = { target: $trigger };
          if (!e) {
              mousePosition = { x: $trigger.offset().left, y: $trigger.offset().top };
          } else {
              mousePosition = { x: e.pageX, y: e.pageY };
          }
  
          if (!beingShown) {
              clearTimeout(showTimer);
          }
          shouldShow = true;
          var doShowPopup = function doShowPopup() {
              contentLoading = false;
              contentLoaded = true;
              opts.initCallback.call({
                  popup: popup,
                  hide: function hide() {
                      hidePopup(0);
                  },
                  id: identifier,
                  show: function show() {
                      showPopup();
                  }
              });
              showPopup();
          };
          // lazy load popup contents
          if (!contentLoading) {
              contentLoading = true;
              if (_jquery2.default.isFunction(url)) {
                  // If the passed in URL is a function, execute it. Otherwise simply load the content.
                  url(contents, trigger, doShowPopup);
              } else {
                  //Retrive response from server
                  _jquery2.default.get(url, function (data, status, xhr) {
                      //Load HTML contents into the popup
                      contents.html(opts.responseHandler(data, status, xhr));
                      //Show the popup
                      contentLoaded = true;
                      opts.initCallback.call({
                          popup: popup,
                          hide: function hide() {
                              hidePopup(0);
                          },
                          id: identifier,
                          show: function show() {
                              showPopup();
                          }
                      });
                      showPopup();
                  });
              }
          }
          // stops the hide event if we move from the trigger to the popup element
          clearTimeout(hideDelayTimer);
          // don't trigger the animation again if we're being shown
          if (!beingShown) {
              showPopup();
          }
          return false;
      };
  
      popup[0].popup = getHash();
  
      var contentLoading = false;
      var added = false;
      var appendPopup = function appendPopup() {
          if (!added) {
              (0, _jquery2.default)(opts.container).append(popup);
              added = true;
          }
      };
      var $items = (0, _jquery2.default)(items);
  
      if (opts.onHover) {
          if (opts.useLiveEvents) {
              // We're using .on() to emulate the behaviour of .live() here. on() requires the jQuery object to have
              // a selector - this is actually how .live() is implemented in jQuery 1.7+.
              // Note that .selector is deleted in jQuery 1.9+.
              // This means that jQuery objects created by selection eg $(".my-class-selector") will work, but
              // object created by DOM parsing eg $("<div class='.my-class'></div>") will not work.
              // Ideally we should throw an error if the $items has no selector but that is backwards incompatible,
              // so we warn and do a no-op - this emulates the behaviour of live() but has the added warning.
              if ($items.selector) {
                  (0, _jquery2.default)(document).on('mouseenter', $items.selector, function (e) {
                      appendPopup();
                      initPopup(e, this);
                  }).on('mouseleave', $items.selector, function () {
                      hidePopup();
                  });
              } else {
                  logger.log('Warning: inline dialog trigger elements must have a jQuery selector when the useLiveEvents option is enabled.');
              }
          } else {
              $items.on({
                  mouseenter: function mouseenter(e) {
                      appendPopup();
                      initPopup(e, this);
                  },
                  mouseleave: function mouseleave() {
                      hidePopup();
                  }
              });
          }
      } else {
          if (!opts.noBind) {
              //Check if the noBind option is turned on
              if (opts.useLiveEvents) {
                  // See above for why we filter by .selector
                  if ($items.selector) {
                      (0, _jquery2.default)(document).on('click', $items.selector, function (e) {
                          appendPopup();
                          if (shouldCloseOnTriggerClick()) {
                              popup.hide();
                          } else {
                              initPopup(e, this);
                          }
                          return false;
                      }).on('mouseleave', $items.selector, function () {
                          hidePopup();
                      });
                  } else {
                      logger.log('Warning: inline dialog trigger elements must have a jQuery selector when the useLiveEvents option is enabled.');
                  }
              } else {
                  $items.on('click', function (e) {
                      appendPopup();
                      if (shouldCloseOnTriggerClick()) {
                          popup.hide();
                      } else {
                          initPopup(e, this);
                      }
                      return false;
                  }).on('mouseleave', function () {
                      hidePopup();
                  });
              }
          }
      }
  
      var shouldCloseOnTriggerClick = function shouldCloseOnTriggerClick() {
          return beingShown && opts.closeOnTriggerClick;
      };
  
      var bindHideEvents = function bindHideEvents() {
          bindHideOnExternalClick();
          bindHideOnEscPressed();
      };
  
      var unbindHideEvents = function unbindHideEvents() {
          unbindHideOnExternalClick();
          unbindHideOnEscPressed();
      };
  
      // Be defensive and make sure that we haven't already bound the event
      var hasBoundOnExternalClick = false;
      var externalClickNamespace = identifier + '.inline-dialog-check';
  
      /**
       * Catch click events on the body to see if the click target occurs outside of this popup
       * If it does, the popup will be hidden
       */
      var bindHideOnExternalClick = function bindHideOnExternalClick() {
          if (!hasBoundOnExternalClick) {
              (0, _jquery2.default)('body').bind('click.' + externalClickNamespace, function (e) {
                  var $target = (0, _jquery2.default)(e.target);
                  // hide the popup if the target of the event is not in the dialog
                  if ($target.closest('#inline-dialog-' + escapedIdentifier + ' .contents').length === 0) {
                      hidePopup(0);
                  }
              });
              hasBoundOnExternalClick = true;
          }
      };
  
      var unbindHideOnExternalClick = function unbindHideOnExternalClick() {
          if (hasBoundOnExternalClick) {
              (0, _jquery2.default)('body').unbind('click.' + externalClickNamespace);
          }
          hasBoundOnExternalClick = false;
      };
  
      var onKeydown = function onKeydown(e) {
          if (e.keyCode === _keyCode2.default.ESCAPE) {
              hidePopup(0);
          }
      };
  
      var bindHideOnEscPressed = function bindHideOnEscPressed() {
          (0, _jquery2.default)(document).on('keydown', onKeydown);
      };
  
      var unbindHideOnEscPressed = function unbindHideOnEscPressed() {
          (0, _jquery2.default)(document).off('keydown', onKeydown);
      };
  
      /**
       * Show the inline dialog.
       * @method show
       */
      popup.show = function (e, trigger) {
          if (e) {
              e.stopPropagation();
          }
          appendPopup();
          if (opts.noBind && !(items && items.length)) {
              initPopup(e, trigger === undefined ? e.target : trigger);
          } else {
              initPopup(e, items);
          }
      };
      /**
       * Hide the inline dialog.
       * @method hide
       */
      popup.hide = function () {
          hidePopup(0);
      };
      /**
       * Repositions the inline dialog if being shown.
       * @method refresh
       */
      popup.refresh = function () {
          if (beingShown) {
              getHash().reset();
          }
      };
  
      popup.getOptions = function () {
          return opts;
      };
  
      return popup;
  }
  
  function dimensionsOf(el) {
      var $el = (0, _jquery2.default)(el);
      var offset = _jquery2.default.extend({ left: 0, top: 0 }, $el.offset());
      return {
          left: offset.left,
          top: offset.top,
          width: $el.outerWidth(),
          height: $el.outerHeight()
      };
  }
  
  function getDimensions(popup, targetPosition, mousePosition, opts) {
      var offsetX = _jquery2.default.isFunction(opts.offsetX) ? opts.offsetX(popup, targetPosition, mousePosition, opts) : opts.offsetX;
      var offsetY = _jquery2.default.isFunction(opts.offsetY) ? opts.offsetY(popup, targetPosition, mousePosition, opts) : opts.offsetY;
      var arrowOffsetX = _jquery2.default.isFunction(opts.arrowOffsetX) ? opts.arrowOffsetX(popup, targetPosition, mousePosition, opts) : opts.arrowOffsetX;
      var arrowOffsetY = _jquery2.default.isFunction(opts.arrowOffsetY) ? opts.arrowOffsetY(popup, targetPosition, mousePosition, opts) : opts.arrowOffsetY;
  
      // Support positioning inside a scroll container other than <body>
      var isConstrainedScroll = opts.container.toLowerCase() !== 'body';
      var $scrollContainer = (0, _jquery2.default)(opts.container);
      var $scrollWindow = isConstrainedScroll ? (0, _jquery2.default)(opts.container).parent() : (0, _jquery2.default)(window);
      var scrollContainerOffset = isConstrainedScroll ? $scrollContainer.offset() : { left: 0, top: 0 };
      var scrollWindowOffset = isConstrainedScroll ? $scrollWindow.offset() : { left: 0, top: 0 };
  
      var trigger = targetPosition.target;
      var triggerOffset = trigger.offset();
      // Support SVG elements as triggers
      // TODO Should calculateNorthSouthPositions also try getBBox()?
      var triggerBBox = trigger[0].getBBox && trigger[0].getBBox();
  
      return {
          // determines how close to the edge the dialog needs to be before it is considered offscreen
          screenPadding: 10,
          // Min distance arrow needs to be from the edge of the dialog
          arrowMargin: 5,
          window: {
              top: scrollWindowOffset.top,
              left: scrollWindowOffset.left,
              scrollTop: $scrollWindow.scrollTop(),
              scrollLeft: $scrollWindow.scrollLeft(),
              width: $scrollWindow.width(),
              height: $scrollWindow.height()
          },
          scrollContainer: {
              width: $scrollContainer.width(),
              height: $scrollContainer.height()
          },
          // Position of the trigger is relative to the scroll container
          trigger: {
              top: triggerOffset.top - scrollContainerOffset.top,
              left: triggerOffset.left - scrollContainerOffset.left,
              width: triggerBBox ? triggerBBox.width : trigger.outerWidth(),
              height: triggerBBox ? triggerBBox.height : trigger.outerHeight()
          },
          dialog: {
              width: popup.width(),
              height: popup.height(),
              offset: {
                  top: offsetY,
                  left: offsetX
              }
          },
          arrow: {
              height: popup.find('.arrow').outerHeight(),
              offset: {
                  top: arrowOffsetY,
                  left: arrowOffsetX
              }
          }
      };
  }
  
  function calculateWestPositions(popup, targetPosition, mousePosition, opts) {
      var dimensions = getDimensions(popup, targetPosition, mousePosition, opts);
      var screenPadding = dimensions.screenPadding;
      var win = dimensions.window;
      var trigger = dimensions.trigger;
      var dialog = dimensions.dialog;
      var arrow = dimensions.arrow;
      var scrollContainer = dimensions.scrollContainer;
  
      var triggerScrollOffset = {
          top: trigger.top - win.scrollTop,
          left: trigger.left - win.scrollLeft
      };
  
      // Halves - because the browser doesn't do sub-pixel positioning, we need to consistently floor
      // all decimal values or you can get 1px jumps in arrow positioning when the dialog's height changes.
      var halfTriggerHeight = Math.floor(trigger.height / 2);
      var halfPopupHeight = Math.floor(dialog.height / 2);
      var halfArrowHeight = Math.floor(arrow.height / 2);
  
      // Figure out where to position the dialog, preferring the right (gravity: 'w').
      var spaceOnLeft = triggerScrollOffset.left - dialog.offset.left - screenPadding;
  
      // This implementation may not be suitable for horizontally scrolling containers
      var spaceOnRight = scrollContainer.width - triggerScrollOffset.left - trigger.width - dialog.offset.left - screenPadding;
  
      var enoughSpaceOnLeft = spaceOnLeft >= dialog.width;
      var enoughSpaceOnRight = spaceOnRight >= dialog.width;
      var gravity = !enoughSpaceOnRight && enoughSpaceOnLeft ? 'e' : 'w';
  
      // Screen padding needs to be adjusted if the arrow would extend into it
      var arrowScreenTop = triggerScrollOffset.top + halfTriggerHeight - halfArrowHeight;
      var arrowScreenBottom = win.height - arrowScreenTop - arrow.height;
      screenPadding = Math.min(screenPadding, arrowScreenTop - dimensions.arrowMargin);
      screenPadding = Math.min(screenPadding, arrowScreenBottom - dimensions.arrowMargin);
  
      // Figure out if the dialog needs to be adjusted up or down to fit on the screen
      var middleOfTrigger = triggerScrollOffset.top + halfTriggerHeight;
      var spaceAboveMiddleOfTrigger = Math.max(middleOfTrigger - screenPadding, 0);
      var spaceBelowMiddleOfTrigger = Math.max(win.height - middleOfTrigger - screenPadding, 0);
  
      var isOverflowingAbove = halfPopupHeight - dialog.offset.top > spaceAboveMiddleOfTrigger;
      var isOverflowingBelow = halfPopupHeight + dialog.offset.top > spaceBelowMiddleOfTrigger;
  
      var popupCss;
      var arrowCss;
      if (isOverflowingAbove) {
          popupCss = {
              top: win.scrollTop + screenPadding,
              left: gravity === 'w' ? trigger.left + trigger.width + dialog.offset.left : trigger.left - dialog.width - dialog.offset.left
          };
          arrowCss = {
              top: trigger.top + halfTriggerHeight - (popupCss.top + halfArrowHeight)
          };
      } else if (isOverflowingBelow) {
          popupCss = {
              top: win.scrollTop + win.height - dialog.height - screenPadding,
              left: gravity === 'w' ? trigger.left + trigger.width + dialog.offset.left : trigger.left - dialog.width - dialog.offset.left
          };
          arrowCss = {
              top: trigger.top + halfTriggerHeight - (popupCss.top + halfArrowHeight)
          };
      } else {
          popupCss = {
              top: trigger.top + halfTriggerHeight - halfPopupHeight + dialog.offset.top,
              left: gravity === 'w' ? trigger.left + trigger.width + dialog.offset.left : trigger.left - dialog.width - dialog.offset.left
          };
          arrowCss = {
              top: halfPopupHeight - halfArrowHeight + arrow.offset.top
          };
      }
  
      return {
          gravity: gravity,
          popupCss: popupCss,
          arrowCss: arrowCss
      };
  }
  
  function calculateNorthSouthPositions(popup, targetPosition, mousePosition, opts) {
      var offsetX = _jquery2.default.isFunction(opts.offsetX) ? opts.offsetX(popup, targetPosition, mousePosition, opts) : opts.offsetX;
      var offsetY = _jquery2.default.isFunction(opts.offsetY) ? opts.offsetY(popup, targetPosition, mousePosition, opts) : opts.offsetY;
      var arrowOffsetX = _jquery2.default.isFunction(opts.arrowOffsetX) ? opts.arrowOffsetX(popup, targetPosition, mousePosition, opts) : opts.arrowOffsetX;
  
      var viewportDimensions = dimensionsOf(window);
      var targetDimensions = dimensionsOf(targetPosition.target);
      var popupDimensions = dimensionsOf(popup);
      var arrowDimensions = dimensionsOf(popup.find('.aui-inline-dialog-arrow'));
  
      var middleOfTrigger = targetDimensions.left + targetDimensions.width / 2; //The absolute x position of the middle of the Trigger
      var bottomOfViewablePage = (window.pageYOffset || document.documentElement.scrollTop) + viewportDimensions.height;
      var SCREEN_PADDING = 10; //determines how close to the edge the dialog needs to be before it is considered offscreen
  
      // Set popup's position (within the viewport)
      popupDimensions.top = targetDimensions.top + targetDimensions.height + ~~offsetY;
      popupDimensions.left = targetDimensions.left + ~~offsetX;
  
      // Calculate if the popup would render off the side of the viewport
      var diff = viewportDimensions.width - (popupDimensions.left + popupDimensions.width + SCREEN_PADDING);
  
      // Set arrow's position (within the popup)
      arrowDimensions.left = middleOfTrigger - popupDimensions.left + ~~arrowOffsetX;
      // TODO arrowDimensions.top should also use arrowOffsetY.
      arrowDimensions.top = -(arrowDimensions.height / 2);
  
      // Check whether the popup should display above or below the trigger
      var enoughRoomAbove = targetDimensions.top > popupDimensions.height;
      var enoughRoomBelow = popupDimensions.top + popupDimensions.height < bottomOfViewablePage;
      var displayAbove = !enoughRoomBelow && enoughRoomAbove || enoughRoomAbove && opts.gravity === 's';
  
      if (displayAbove) {
          popupDimensions.top = targetDimensions.top - popupDimensions.height - arrowDimensions.height / 2;
          arrowDimensions.top = popupDimensions.height;
      }
  
      // Check if the popup should show up relative to the mouse
      if (opts.isRelativeToMouse) {
          if (diff < 0) {
              popupDimensions.right = SCREEN_PADDING;
              popupDimensions.left = 'auto';
              // TODO Why doesn't arrowDimentions.left here use arrowOffsetX?
              arrowDimensions.left = mousePosition.x - (viewportDimensions.width - popupDimensions.width);
          } else {
              popupDimensions.left = mousePosition.x - 20;
              // TODO Why doesn't arrowDimentions.left here use arrowOffsetX?
              arrowDimensions.left = mousePosition.x - popupDimensions.left;
          }
      } else {
          if (diff < 0) {
              popupDimensions.right = SCREEN_PADDING;
              popupDimensions.left = 'auto';
  
              var popupRightEdge = viewportDimensions.width - popupDimensions.right;
              var popupLeftEdge = popupRightEdge - popupDimensions.width;
  
              //arrow's position must be relative to the popup's position and not of the screen.
              arrowDimensions.right = 'auto';
              // TODO Why doesn't arrowDimentions.left here use arrowOffsetX?
              arrowDimensions.left = middleOfTrigger - popupLeftEdge - arrowDimensions.width / 2;
          } else if (popupDimensions.width <= targetDimensions.width / 2) {
              // TODO Why doesn't arrowDimentions.left here use arrowOffsetX?
              arrowDimensions.left = popupDimensions.width / 2;
              popupDimensions.left = middleOfTrigger - popupDimensions.width / 2;
          }
      }
      return {
          gravity: displayAbove ? 's' : 'n',
          displayAbove: displayAbove, // Replaced with gravity but remains for backward compatibility.
          popupCss: {
              left: popupDimensions.left,
              top: popupDimensions.top,
              right: popupDimensions.right
          },
          arrowCss: {
              left: arrowDimensions.left,
              top: arrowDimensions.top,
              right: arrowDimensions.right
          }
      };
  }
  
  InlineDialog.opts = {
      onTop: false,
      responseHandler: function responseHandler(data) {
          //assume data is html
          return data;
      },
      closeOthers: true,
      isRelativeToMouse: false,
      addActiveClass: true, // if false, signifies that the triggers should not have the "active" class applied
      onHover: false,
      useLiveEvents: false,
      noBind: false,
      fadeTime: 100,
      persistent: false,
      hideDelay: 10000,
      showDelay: 0,
      width: 300,
      offsetX: 0,
      offsetY: 10,
      arrowOffsetX: 0,
      arrowOffsetY: 0,
      container: 'body',
      cacheContent: true,
      displayShadow: true,
      autoWidth: false,
      gravity: 'n',
      closeOnTriggerClick: false,
      preHideCallback: function preHideCallback() {
          return true;
      },
      hideCallback: function hideCallback() {}, // if defined, this method will be exected after the popup has been faded out.
      initCallback: function initCallback() {}, // A function called after the popup contents are loaded. `this` will be the popup jQuery object, and the first argument is the popup identifier.
      upfrontCallback: function upfrontCallback() {}, // A function called before the popup contents are loaded. `this` will be the popup jQuery object, and the first argument is the popup identifier.
      /**
       * Returns an object with the following attributes:
       *      popupCss css attributes to apply on the popup element
       *      arrowCss css attributes to apply on the arrow element
       *
       * @param popup
       * @param targetPosition position of the target element
       * @param mousePosition current mouse position
       * @param opts options
       */
      calculatePositions: function calculatePositions(popup, targetPosition, mousePosition, opts) {
          opts = opts || {};
          var algorithm = opts.gravity === 'w' ? calculateWestPositions : calculateNorthSouthPositions;
          return algorithm(popup, targetPosition, mousePosition, opts);
      }
  };
  
  // Deprecations
  // ------------
  
  InlineDialog = deprecate.construct(InlineDialog, 'Inline dialog constructor', {
      alternativeName: 'inline dialog 2'
  });
  
  var displayAboveDeprecationLogger = deprecate.getMessageLogger('displayAbove', '[remove version]', {
      alternativeName: 'gravity',
      extraInfo: 'See https://ecosystem.atlassian.net/browse/AUI-2197.'
  });
  
  var onTopDeprecationLogger = deprecate.getMessageLogger('onTop', '[remove version]', {
      alternativeName: 'gravity',
      extraInfo: 'See https://ecosystem.atlassian.net/browse/AUI-2197.'
  });
  
  // Exporting
  // ---------
  
  (0, _globalize2.default)('InlineDialog', InlineDialog);
  
  exports.default = InlineDialog;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);