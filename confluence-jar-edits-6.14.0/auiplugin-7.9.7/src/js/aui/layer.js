// src/js/aui/layer.js
(typeof window === 'undefined' ? global : window).__3ada4a8272640e5242be87f12c7e0fdf = (function () {
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
  
  var _blanket = __4c4f13d92d5dcb8f12059ce701946463;
  
  var _focusManager = __f65d8c24422fc9cfa97e7b7162425c04;
  
  var _focusManager2 = _interopRequireDefault(_focusManager);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _keyCode = __e246bf93af36eb4453f35afeb1c302d9;
  
  var _keyCode2 = _interopRequireDefault(_keyCode);
  
  var _widget = __d2e8fc66dac2ecebdc205fcab991f687;
  
  var _widget2 = _interopRequireDefault(_widget);
  
  var _customEvent = __f7a5e0d2ea8865b104efc9b94861591e;
  
  var _customEvent2 = _interopRequireDefault(_customEvent);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var EVENT_PREFIX = '_aui-internal-layer-';
  var GLOBAL_EVENT_PREFIX = '_aui-internal-layer-global-';
  var LAYER_EVENT_PREFIX = 'aui-layer-';
  var AUI_EVENT_PREFIX = 'aui-';
  var $doc = (0, _jquery2.default)(document);
  
  // AUI-3708 - Abstracted to reflect code implemented upstream.
  function isTransitioning(el, prop) {
      var transition = window.getComputedStyle(el).transitionProperty;
      return transition ? transition.indexOf(prop) > -1 : false;
  }
  
  function onTransitionEnd(el, prop, func, once) {
      function handler(e) {
          if (prop !== e.propertyName) {
              return;
          }
  
          func.call(el);
  
          if (once) {
              el.removeEventListener('transitionend', handler);
          }
      }
  
      if (isTransitioning(el, prop)) {
          el.addEventListener('transitionend', handler);
      } else {
          func.call(el);
      }
  }
  
  function oneTransitionEnd(el, prop, func) {
      onTransitionEnd(el, prop, func, true);
  }
  // end AUI-3708
  
  function ariaHide($el) {
      $el.attr('aria-hidden', 'true');
  }
  
  function ariaShow($el) {
      $el.attr('aria-hidden', 'false');
  }
  
  /**
  * @return {bool} Returns false if at least one of the event handlers called .preventDefault(). Returns true otherwise.
  */
  function triggerEvent($el, deprecatedName, newNativeName) {
      var e1 = _jquery2.default.Event(EVENT_PREFIX + deprecatedName);
      var e2 = _jquery2.default.Event(GLOBAL_EVENT_PREFIX + deprecatedName);
      // TODO: Remove this 'aui-layer-' prefixed event once it is no longer used by inline dialog and dialog2.
      var nativeEvent = new _customEvent2.default(LAYER_EVENT_PREFIX + newNativeName, {
          bubbles: true,
          cancelable: true
      });
      var nativeEvent2 = new _customEvent2.default(AUI_EVENT_PREFIX + newNativeName, {
          bubbles: true,
          cancelable: true
      });
  
      $el.trigger(e1);
      $el.trigger(e2, [$el]);
      $el[0].dispatchEvent(nativeEvent);
      $el[0].dispatchEvent(nativeEvent2);
  
      return !e1.isDefaultPrevented() && !e2.isDefaultPrevented() && !nativeEvent.defaultPrevented && !nativeEvent2.defaultPrevented;
  }
  
  function Layer(selector) {
      this.$el = (0, _jquery2.default)(selector || '<div class="aui-layer" aria-hidden="true"></div>');
      this.$el.addClass('aui-layer');
  }
  
  Layer.prototype = {
      /**
       * Returns the layer below the current layer if it exists.
       *
       * @returns {jQuery | undefined}
       */
      below: function below() {
          return LayerManager.global.item(LayerManager.global.indexOf(this.$el) - 1);
      },
  
      /**
       * Returns the layer above the current layer if it exists.
       *
       * @returns {jQuery | undefined}
       */
      above: function above() {
          return LayerManager.global.item(LayerManager.global.indexOf(this.$el) + 1);
      },
  
      /**
       * Sets the width and height of the layer.
       *
       * @param {Integer} width The width to set.
       * @param {Integer} height The height to set.
       *
       * @returns {Layer}
       */
      changeSize: function changeSize(width, height) {
          this.$el.css('width', width);
          this.$el.css('height', height === 'content' ? '' : height);
          return this;
      },
  
      /**
       * Binds a layer event.
       *
       * @param {String} event The event name to listen to.
       * @param {Function} fn The event handler.
       *
       * @returns {Layer}
       */
      on: function on(event, fn) {
          this.$el.on(EVENT_PREFIX + event, fn);
          return this;
      },
  
      /**
       * Unbinds a layer event.
       *
       * @param {String} event The event name to unbind=.
       * @param {Function} fn Optional. The event handler.
       *
       * @returns {Layer}
       */
      off: function off(event, fn) {
          this.$el.off(EVENT_PREFIX + event, fn);
          return this;
      },
  
      /**
       * Shows the layer.
       *
       * @returns {Layer}
       */
      show: function show() {
          if (this.isVisible()) {
              ariaShow(this.$el);
              return this;
          }
  
          if (!triggerEvent(this.$el, 'beforeShow', 'show')) {
              return this;
          }
  
          // AUI-3708
          // Ensures that the display property is removed if it's been added
          // during hiding.
          if (this.$el.css('display') === 'none') {
              this.$el.css('display', '');
          }
  
          LayerManager.global.push(this.$el);
  
          return this;
      },
  
      /**
       * Hides the layer.
       *
       * @returns {Layer}
       */
      hide: function hide() {
          if (!this.isVisible()) {
              ariaHide(this.$el);
              return this;
          }
  
          if (!triggerEvent(this.$el, 'beforeHide', 'hide')) {
              return this;
          }
  
          // AUI-3708
          var thisLayer = this;
          oneTransitionEnd(this.$el.get(0), 'opacity', function () {
              if (!thisLayer.isVisible()) {
                  this.style.display = 'none';
              }
          });
  
          LayerManager.global.popUntil(this.$el);
  
          return this;
      },
  
      /**
       * Checks to see if the layer is visible.
       *
       * @returns {Boolean}
       */
      isVisible: function isVisible() {
          return this.$el.attr('aria-hidden') === 'false';
      },
  
      /**
       * Removes the layer and cleans up internal state.
       *
       * @returns {undefined}
       */
      remove: function remove() {
          this.hide();
          this.$el.remove();
          this.$el = null;
      },
  
      /**
       * Returns whether or not the layer is blanketed.
       *
       * @returns {Boolean}
       */
      isBlanketed: function isBlanketed() {
          return this.$el.attr('data-aui-blanketed') === 'true';
      },
  
      /**
       * Returns whether or not the layer is persistent.
       *
       * @returns {Boolean}
       */
      isPersistent: function isPersistent() {
          var modal = this.$el.attr('modal') || this.$el.attr('data-aui-modal');
          var isPersistent = this.$el[0].hasAttribute('persistent');
  
          return modal === 'true' || isPersistent;
      },
  
      _hideLayer: function _hideLayer(triggerBeforeEvents) {
          if (this.isPersistent() || this.isBlanketed()) {
              _focusManager2.default.global.exit(this.$el);
          }
  
          if (triggerBeforeEvents) {
              triggerEvent(this.$el, 'beforeHide', 'hide');
          }
  
          this.$el.attr('aria-hidden', 'true');
          this.$el.css('z-index', this.$el.data('_aui-layer-cached-z-index') || '');
          this.$el.data('_aui-layer-cached-z-index', '');
          this.$el.trigger(EVENT_PREFIX + 'hide');
          this.$el.trigger(GLOBAL_EVENT_PREFIX + 'hide', [this.$el]);
      },
  
      _showLayer: function _showLayer(zIndex) {
          if (!this.$el.parent().is('body')) {
              this.$el.appendTo(document.body);
          }
  
          this.$el.data('_aui-layer-cached-z-index', this.$el.css('z-index'));
          this.$el.css('z-index', zIndex);
          this.$el.attr('aria-hidden', 'false');
  
          if (this.isPersistent() || this.isBlanketed()) {
              _focusManager2.default.global.enter(this.$el);
          }
  
          this.$el.trigger(EVENT_PREFIX + 'show');
          this.$el.trigger(GLOBAL_EVENT_PREFIX + 'show', [this.$el]);
      }
  };
  
  var createLayer = (0, _widget2.default)('layer', Layer);
  
  createLayer.on = function (eventName, selector, fn) {
      $doc.on(GLOBAL_EVENT_PREFIX + eventName, selector, fn);
      return this;
  };
  
  createLayer.off = function (eventName, selector, fn) {
      $doc.off(GLOBAL_EVENT_PREFIX + eventName, selector, fn);
      return this;
  };
  
  // Layer Manager
  // -------------
  
  /**
   * Manages layers.
   *
   * There is a single global layer manager.
   * Additional instances can be created however this should generally only be used in tests.
   *
   * Layers are added by the push($el) method. Layers are removed by the
   * popUntil($el) method.
   *
   * popUntil's contract is that it pops all layers above & including the given
   * layer. This is used to support popping multiple layers.
   * Say we were showing a dropdown inside an inline dialog inside a dialog - we
   * have a stack of dialog layer, inline dialog layer, then dropdown layer. Calling
   * popUntil(dialog.$el) would hide all layers above & including the dialog.
   */
  
  function getTrigger($layer) {
      return (0, _jquery2.default)('[aria-controls="' + $layer.attr('id') + '"]');
  }
  
  function hasTrigger($layer) {
      return getTrigger($layer).length > 0;
  }
  
  function topIndexWhere(layerArr, fn) {
      var i = layerArr.length;
  
      while (i--) {
          if (fn(layerArr[i])) {
              return i;
          }
      }
  
      return -1;
  }
  
  function layerIndex(layerArr, $el) {
      return topIndexWhere(layerArr, function ($layer) {
          return $layer[0] === $el[0];
      });
  }
  
  function topBlanketedIndex(layerArr) {
      return topIndexWhere(layerArr, function ($layer) {
          return createLayer($layer).isBlanketed();
      });
  }
  
  function nextZIndex(layerArr) {
      var _nextZIndex;
  
      if (layerArr.length) {
          var $topEl = layerArr[layerArr.length - 1];
          var zIndex = parseInt($topEl.css('z-index'), 10);
          _nextZIndex = (isNaN(zIndex) ? 0 : zIndex) + 100;
      } else {
          _nextZIndex = 0;
      }
  
      return Math.max(3000, _nextZIndex);
  }
  
  function updateBlanket(stack, oldBlanketIndex) {
      var newTopBlanketedIndex = topBlanketedIndex(stack);
  
      if (oldBlanketIndex !== newTopBlanketedIndex) {
          if (newTopBlanketedIndex > -1) {
              (0, _blanket.dim)(false, stack[newTopBlanketedIndex].css('z-index') - 20);
          } else {
              (0, _blanket.undim)();
          }
      }
  }
  
  function popLayers(stack, stopIndex, forceClosePersistent) {
      if (stopIndex < 0) {
          return;
      }
  
      for (var a = stack.length - 1; a >= stopIndex; a--) {
          var $layer = stack[a];
          var layer = createLayer($layer);
  
          if (forceClosePersistent || !layer.isPersistent()) {
              layer._hideLayer(true);
              stack.splice(a, 1);
          }
      }
  }
  
  function getParentLayer($childLayer) {
      var $layerTrigger = getTrigger($childLayer);
  
      if ($layerTrigger.length > 0) {
          return $layerTrigger.closest('.aui-layer');
      }
  }
  
  function LayerManager() {
      this._stack = [];
  }
  
  LayerManager.prototype = {
      /**
      * Pushes a layer onto the stack. The same element cannot be opened as a layer multiple times - if the given
      * element is already an open layer, this method throws an exception.
      *
      * @param {HTMLElement | String | jQuery} element  The element to push onto the stack.
      *
      * @returns {LayerManager}
      */
      push: function push(element) {
          var $el = element instanceof _jquery2.default ? element : (0, _jquery2.default)(element);
          if (layerIndex(this._stack, $el) >= 0) {
              throw new Error('The given element is already an active layer.');
          }
  
          this.popLayersBeside($el);
  
          var layer = createLayer($el);
          var zIndex = nextZIndex(this._stack);
  
          layer._showLayer(zIndex);
  
          if (layer.isBlanketed()) {
              (0, _blanket.dim)(false, zIndex - 20);
          }
  
          this._stack.push($el);
  
          return this;
      },
  
      popLayersBeside: function popLayersBeside(element) {
          var $layer = element instanceof _jquery2.default ? element : (0, _jquery2.default)(element);
          if (!hasTrigger($layer)) {
              // We can't find this layer's trigger, we will pop all non-persistent until a blanket or the document
              var blanketedIndex = topBlanketedIndex(this._stack);
              popLayers(this._stack, ++blanketedIndex, false);
              return;
          }
  
          var $parentLayer = getParentLayer($layer);
          if ($parentLayer) {
              var parentIndex = this.indexOf($parentLayer);
              popLayers(this._stack, ++parentIndex, false);
          } else {
              popLayers(this._stack, 0, false);
          }
      },
  
      /**
      * Returns the index of the specified layer in the layer stack.
      *
      * @param {HTMLElement | String | jQuery} element  The element to find in the stack.
      *
      * @returns {Number} the (zero-based) index of the element, or -1 if not in the stack.
      */
      indexOf: function indexOf(element) {
          return layerIndex(this._stack, (0, _jquery2.default)(element));
      },
  
      /**
      * Returns the item at the particular index or false.
      *
      * @param {Number} index The index of the element to get.
      *
      * @returns {jQuery | Boolean}
      */
      item: function item(index) {
          return this._stack[index];
      },
  
      /**
      * Hides all layers in the stack.
      *
      * @returns {LayerManager}
      */
      hideAll: function hideAll() {
          this._stack.reverse().forEach(function (element) {
              var layer = createLayer(element);
              if (layer.isBlanketed() || layer.isPersistent()) {
                  return;
              }
              layer.hide();
          });
  
          return this;
      },
  
      /**
      * Gets the previous layer below the given layer, which is non modal and non persistent. If it finds a blanketed layer on the way
      * it returns it regardless if it is modal or not
      *
      * @param {HTMLElement | String | jQuery} element layer to start the search from.
      *
      * @returns {jQuery | null} the next matching layer or null if none found.
      */
      getNextLowerNonPersistentOrBlanketedLayer: function getNextLowerNonPersistentOrBlanketedLayer(element) {
          var $el = element instanceof _jquery2.default ? element : (0, _jquery2.default)(element);
          var index = layerIndex(this._stack, $el);
  
          if (index < 0) {
              return null;
          }
  
          var $nextEl;
          index--;
          while (index >= 0) {
              $nextEl = this._stack[index];
              var layer = createLayer($nextEl);
  
              if (!layer.isPersistent() || layer.isBlanketed()) {
                  return $nextEl;
              }
              index--;
          }
  
          return null;
      },
  
      /**
      * Gets the next layer which is neither modal or blanketed, from the given layer.
      *
      * @param {HTMLElement | String | jQuery} element layer to start the search from.
      *
      * @returns {jQuery | null} the next non modal non blanketed layer or null if none found.
      */
      getNextHigherNonPeristentAndNonBlanketedLayer: function getNextHigherNonPeristentAndNonBlanketedLayer(element) {
          var $el = element instanceof _jquery2.default ? element : (0, _jquery2.default)(element);
          var index = layerIndex(this._stack, $el);
  
          if (index < 0) {
              return null;
          }
  
          var $nextEl;
          index++;
          while (index < this._stack.length) {
              $nextEl = this._stack[index];
              var layer = createLayer($nextEl);
  
              if (!(layer.isPersistent() || layer.isBlanketed())) {
                  return $nextEl;
              }
              index++;
          }
  
          return null;
      },
  
      /**
      * Removes all non-modal layers above & including the given element. If the given element is not an active layer, this method
      * is a no-op. The given element will be removed regardless of whether or not it is modal.
      *
      * @param {HTMLElement | String | jQuery} element layer to pop.
      *
      * @returns {jQuery} The last layer that was popped, or null if no layer matching the given $el was found.
      */
      popUntil: function popUntil(element) {
          var $el = element instanceof _jquery2.default ? element : (0, _jquery2.default)(element);
          var index = layerIndex(this._stack, $el);
  
          if (index === -1) {
              return null;
          }
  
          var oldTopBlanketedIndex = topBlanketedIndex(this._stack);
  
          // Removes all layers above the current one.
          popLayers(this._stack, index + 1, createLayer($el).isBlanketed());
  
          // Removes the current layer.
          createLayer($el)._hideLayer();
          this._stack.splice(index, 1);
  
          updateBlanket(this._stack, oldTopBlanketedIndex);
  
          return $el;
      },
  
      /**
      * Gets the top layer, if it exists.
      *
      * @returns The layer on top of the stack, if it exists, otherwise null.
      */
      getTopLayer: function getTopLayer() {
          if (!this._stack.length) {
              return null;
          }
  
          var $topLayer = this._stack[this._stack.length - 1];
  
          return $topLayer;
      },
  
      /**
      * Pops the top layer, if it exists and it is non modal and non persistent.
      *
      * @returns The layer that was popped, if it was popped.
      */
      popTopIfNonPersistent: function popTopIfNonPersistent() {
          var $topLayer = this.getTopLayer();
          var layer = createLayer($topLayer);
  
          if (!$topLayer || layer.isPersistent()) {
              return null;
          }
  
          return this.popUntil($topLayer);
      },
  
      /**
      * Pops all layers above and including the top blanketed layer. If layers exist but none are blanketed, this method
      * does nothing.
      *
      * @returns The blanketed layer that was popped, if it exists, otherwise null.
      */
      popUntilTopBlanketed: function popUntilTopBlanketed() {
          var i = topBlanketedIndex(this._stack);
  
          if (i < 0) {
              return null;
          }
  
          var $topBlanketedLayer = this._stack[i];
          var layer = createLayer($topBlanketedLayer);
  
          if (layer.isPersistent()) {
              // We can't pop the blanketed layer, only the things ontop
              var $next = this.getNextHigherNonPeristentAndNonBlanketedLayer($topBlanketedLayer);
              if ($next) {
                  var stopIndex = layerIndex(this._stack, $next);
                  popLayers(this._stack, stopIndex, true);
                  return $next;
              }
              return null;
          }
  
          popLayers(this._stack, i, true);
          updateBlanket(this._stack, i);
          return $topBlanketedLayer;
      },
  
      /**
      * Pops all layers above and including the top persistent layer. If layers exist but none are persistent, this method
      * does nothing.
      */
      popUntilTopPersistent: function popUntilTopPersistent() {
          var $toPop = LayerManager.global.getTopLayer();
          if (!$toPop) {
              return;
          }
  
          var stopIndex;
          var oldTopBlanketedIndex = topBlanketedIndex(this._stack);
  
          var toPop = createLayer($toPop);
          if (toPop.isPersistent()) {
              if (toPop.isBlanketed()) {
                  return;
              } else {
                  // Get the closest non modal layer below, stop at the first blanketed layer though, we don't want to pop below that
                  $toPop = LayerManager.global.getNextLowerNonPersistentOrBlanketedLayer($toPop);
                  toPop = createLayer($toPop);
  
                  if ($toPop && !toPop.isPersistent()) {
                      stopIndex = layerIndex(this._stack, $toPop);
                      popLayers(this._stack, stopIndex, true);
                      updateBlanket(this._stack, oldTopBlanketedIndex);
                  } else {
                      // Here we have a blanketed persistent layer
                      return;
                  }
              }
          } else {
              stopIndex = layerIndex(this._stack, $toPop);
              popLayers(this._stack, stopIndex, true);
              updateBlanket(this._stack, oldTopBlanketedIndex);
          }
      }
  };
  
  // LayerManager.global
  // -------------------
  
  function initCloseLayerOnEscPress() {
      $doc.on('keydown', function (e) {
          if (e.keyCode === _keyCode2.default.ESCAPE) {
              LayerManager.global.popUntilTopPersistent();
              e.preventDefault();
          }
      });
  }
  
  function initCloseLayerOnBlanketClick() {
      $doc.on('click', '.aui-blanket', function (e) {
          if (LayerManager.global.popUntilTopBlanketed()) {
              e.preventDefault();
          }
      });
  }
  
  function hasLayer($trigger) {
      if (!$trigger.length) {
          return false;
      }
  
      var layer = document.getElementById($trigger.attr('aria-controls'));
      return LayerManager.global.indexOf(layer) > -1;
  }
  
  // If it's a click on a trigger, do nothing.
  // If it's a click on a layer, close all layers above.
  // Otherwise, close all layers.
  function initCloseLayerOnOuterClick() {
      $doc.on('click', function (e) {
          var $target = (0, _jquery2.default)(e.target);
          if ($target.closest('.aui-blanket').length) {
              return;
          }
  
          var $trigger = $target.closest('[aria-controls]');
          var $layer = $target.closest('.aui-layer');
          if (!$layer.length && !hasLayer($trigger)) {
              LayerManager.global.hideAll();
              return;
          }
  
          // Triggers take precedence over layers
          if (hasLayer($trigger)) {
              return;
          }
  
          if ($layer.length) {
              // We dont want to explicitly call close on a modal dialog if it happens to be next.
              // All blanketed layers should be below us, as otherwise the blanket should have caught the click.
              // We make sure we dont close a blanketed one explicitly as a hack, this is to fix the problem arising
              // from dialog2 triggers inside dialog2's having no aria controls, where the dialog2 that was just
              // opened would be closed instantly
              var $next = LayerManager.global.getNextHigherNonPeristentAndNonBlanketedLayer($layer);
  
              if ($next) {
                  createLayer($next).hide();
              }
          }
      });
  }
  
  initCloseLayerOnEscPress();
  initCloseLayerOnBlanketClick();
  initCloseLayerOnOuterClick();
  
  LayerManager.global = new LayerManager();
  createLayer.Manager = LayerManager;
  
  (0, _globalize2.default)('layer', createLayer);
  
  exports.default = createLayer;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);