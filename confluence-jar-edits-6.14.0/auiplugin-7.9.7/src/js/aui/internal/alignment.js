// src/js/aui/internal/alignment.js
(typeof window === 'undefined' ? global : window).__81deba69899d0f1851f2c511b87bbbae = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
  
  var _tether = __fa684b4d01a07bdbba6bdddc34918300;
  
  var _tether2 = _interopRequireDefault(_tether);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var ATTR_ALIGNMENT = 'alignment';
  var ATTR_ALIGNMENT_STATIC = 'alignment-static';
  var ATTR_CONTAINER = 'alignment-container';
  var CLASS_PREFIX_ALIGNMENT = 'aui-alignment';
  var CLASS_PREFIX_SIDE = 'aui-alignment-side-';
  var CLASS_PREFIX_SNAP = 'aui-alignment-snap-';
  var DEFAULT_ATTACHMENT = 'right middle';
  var attachmentMap = {
      'top left': { el: 'bottom left', target: 'top left' },
      'top center': { el: 'bottom center', target: 'top center' },
      'top right': { el: 'bottom right', target: 'top right' },
      'right top': { el: 'top left', target: 'top right' },
      'right middle': { el: 'middle left', target: 'middle right' },
      'right bottom': { el: 'bottom left', target: 'bottom right' },
      'bottom left': { el: 'top left', target: 'bottom left' },
      'bottom center': { el: 'top center', target: 'bottom center' },
      'bottom right': { el: 'top right', target: 'bottom right' },
      'left top': { el: 'top right', target: 'top left' },
      'left middle': { el: 'middle right', target: 'middle left' },
      'left bottom': { el: 'bottom right', target: 'bottom left' },
      'submenu left': { el: 'top left', target: 'top right' },
      'submenu right': { el: 'top right', target: 'top left' }
  };
  
  function hasClass(element, className) {
      return (' ' + element.className + ' ').indexOf(' ' + className + ' ') !== -1;
  }
  
  function addAlignmentClasses(element, side, snap) {
      var sideClass = CLASS_PREFIX_SIDE + side;
      var snapClass = CLASS_PREFIX_SNAP + snap;
  
      if (!hasClass(element, sideClass)) {
          element.className += ' ' + sideClass;
      }
  
      if (!hasClass(element, snapClass)) {
          element.className += ' ' + snapClass;
      }
  }
  
  function getAttribute(element, name) {
      return element.getAttribute(name) || element.getAttribute('data-aui-' + name);
  }
  
  function hasAttribute(element, name) {
      return element.hasAttribute(name) || element.hasAttribute('data-aui-' + name);
  }
  
  function getAlignment(element) {
      var _split = (getAttribute(element, ATTR_ALIGNMENT) || DEFAULT_ATTACHMENT).split(' '),
          _split2 = _slicedToArray(_split, 2),
          side = _split2[0],
          snap = _split2[1];
  
      return {
          side: side,
          snap: snap
      };
  }
  
  function getContainer(element) {
      var container = getAttribute(element, ATTR_CONTAINER) || window;
  
      if (typeof container === 'string') {
          container = document.querySelector(container);
      }
  
      return container;
  }
  
  function calculateBestAlignmentSnap(target, container) {
      var snap = 'left';
  
      if (!container || container === window || container === document) {
          container = document.documentElement;
      }
  
      if (container && container.nodeType && container.nodeType === Node.ELEMENT_NODE) {
          var containerBounds = container.getBoundingClientRect();
          var targetBounds = target.getBoundingClientRect();
  
          if (targetBounds.left > containerBounds.right / 2) {
              snap = 'right';
          }
      }
  
      return snap;
  }
  
  function getAttachment(side, snap) {
      return attachmentMap[side + ' ' + snap] || attachmentMap[DEFAULT_ATTACHMENT];
  }
  
  function Alignment(element, target) {
      var container = getContainer(element);
      var alignment = getAlignment(element);
  
      if (!alignment.snap || alignment.snap === 'auto') {
          alignment.snap = calculateBestAlignmentSnap(target, container);
      }
  
      var attachment = getAttachment(alignment.side, alignment.snap);
      var isStaticallyAligned = hasAttribute(element, ATTR_ALIGNMENT_STATIC);
      var tether = new _tether2.default({
          enabled: false,
          element: element,
          target: target,
          attachment: attachment.el,
          targetAttachment: attachment.target,
          classPrefix: CLASS_PREFIX_ALIGNMENT,
          constraints: [{
              // Try and keep the element on page
              to: container === window ? 'window' : container,
              attachment: isStaticallyAligned === true ? 'none' : 'together'
          }]
      });
  
      addAlignmentClasses(element, alignment.side, alignment.snap);
  
      this._auiTether = tether;
  }
  
  Alignment.prototype = {
      /**
       * Stops aligning and cleans up.
       *
       * @returns {Alignment}
       */
      destroy: function destroy() {
          this._auiTether.destroy();
          return this;
      },
  
      /**
       * Disables alignment.
       *
       * @returns {Alignment}
       */
      disable: function disable() {
          this._auiTether.disable();
          return this;
      },
  
      /**
       * Enables alignment.
       *
       * @returns {Alignment}
       */
      enable: function enable() {
          this._auiTether.enable();
          return this;
      }
  };
  
  exports.default = Alignment;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);