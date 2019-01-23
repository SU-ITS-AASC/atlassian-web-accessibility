// src/js/aui/drop-down.js
(typeof window === 'undefined' ? global : window).__d2e2813117e78f01f4e5be88e6b92a17 = (function () {
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
  
  __cfcac90972818498ca2c12686d1dadc4;
  
  var _deprecation = __921ad9514d56376fef992861d9ec0f51;
  
  var deprecate = _interopRequireWildcard(_deprecation);
  
  var _log = __c1e961001275c079e48525ad3a48c8c2;
  
  var logger = _interopRequireWildcard(_log);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Displays a drop down, typically used for menus.
   *
   * @param obj {jQuery Object|String|Array} object to populate the drop down from.
   * @param usroptions optional dropdown configuration. Supported properties are:
   * <li>alignment - "left" or "right" alignment of the drop down</li>
   * <li>escapeHandler - function to handle on escape key presses</li>
   * <li>activeClass - class name to be added to drop down items when 'active' ie. hover over</li>
   * <li>selectionHandler - function to handle when drop down items are selected on</li>
   * <li>hideHandler - function to handle when the drop down is hidden</li>
   * When an object of type Array is passed in, you can also configure:
   * <li>isHiddenByDefault - set to true if you would like to hide the drop down on initialisation</li>
   * <li>displayHandler - function to display text in the drop down</li>
   * <li>useDisabled - If set to true, the dropdown will not appear if a class of disabled is added to aui-dd-parent</li>
   *
   * @returns {Array} an array of jQuery objects, referring to the drop down container elements
   */
  function dropDown(obj, usroptions) {
      var dd = null;
      var result = [];
      var moving = false;
      var $doc = (0, _jquery2.default)(document);
      var options = {
          item: 'li:has(a)',
          activeClass: 'active',
          alignment: 'right',
          displayHandler: function displayHandler(obj) {
              return obj.name;
          },
          escapeHandler: function escapeHandler() {
              this.hide('escape');
              return false;
          },
          hideHandler: function hideHandler() {},
          moveHandler: function moveHandler() {},
          useDisabled: false
      };
  
      _jquery2.default.extend(options, usroptions);
      options.alignment = { left: 'left', right: 'right' }[options.alignment.toLowerCase()] || 'left';
  
      if (obj && obj.jquery) {
          // if $
          dd = obj;
      } else if (typeof obj === 'string') {
          // if $ selector
          dd = (0, _jquery2.default)(obj);
      } else if (obj && obj.constructor === Array) {
          // if JSON
          dd = (0, _jquery2.default)('<div></div>').addClass('aui-dropdown').toggleClass('hidden', !!options.isHiddenByDefault);
          for (var i = 0, ii = obj.length; i < ii; i++) {
              var ol = (0, _jquery2.default)('<ol></ol>');
              for (var j = 0, jj = obj[i].length; j < jj; j++) {
                  var li = (0, _jquery2.default)('<li></li>');
                  var properties = obj[i][j];
                  if (properties.href) {
                      li.append((0, _jquery2.default)('<a></a>').html('<span>' + options.displayHandler(properties) + '</span>').attr({ href: properties.href }).addClass(properties.className));
  
                      // deprecated - use the properties on the li, not the span
                      _jquery2.default.data((0, _jquery2.default)('a > span', li)[0], 'properties', properties);
                  } else {
                      li.html(properties.html).addClass(properties.className);
                  }
                  if (properties.icon) {
                      li.prepend((0, _jquery2.default)('<img />').attr('src', properties.icon));
                  }
                  if (properties.insideSpanIcon) {
                      li.children('a').prepend((0, _jquery2.default)('<span></span>').attr('class', 'icon'));
                  }
                  if (properties.iconFontClass) {
                      li.children('a').prepend((0, _jquery2.default)('<span></span>').addClass('aui-icon aui-icon-small aui-iconfont-' + properties.iconFontClass));
                  }
  
                  _jquery2.default.data(li[0], 'properties', properties);
                  ol.append(li);
              }
              if (i === ii - 1) {
                  ol.addClass('last');
              }
              dd.append(ol);
          }
          (0, _jquery2.default)('body').append(dd);
      } else {
          throw new Error('dropDown function was called with illegal parameter. Should be $ object, $ selector or array.');
      }
  
      var moveDown = function moveDown() {
          move(+1);
      };
  
      var moveUp = function moveUp() {
          move(-1);
      };
  
      var move = function move(dir) {
          var trigger = !moving;
          var cdd = dropDown.current.$[0];
          var links = dropDown.current.links;
          var oldFocus = cdd.focused;
  
          moving = true;
  
          if (links.length === 0) {
              // Nothing to move focus to. Abort.
              return;
          }
  
          cdd.focused = typeof oldFocus === 'number' ? oldFocus : -1;
  
          if (!dropDown.current) {
              logger.log('move - not current, aborting');
              return true;
          }
  
          cdd.focused += dir;
  
          // Resolve out of bounds values:
          if (cdd.focused < 0) {
              cdd.focused = links.length - 1;
          } else if (cdd.focused >= links.length) {
              cdd.focused = 0;
          }
  
          options.moveHandler((0, _jquery2.default)(links[cdd.focused]), dir < 0 ? 'up' : 'down');
          if (trigger && links.length) {
              (0, _jquery2.default)(links[cdd.focused]).addClass(options.activeClass);
              moving = false;
          } else if (!links.length) {
              moving = false;
          }
      };
  
      var moveFocus = function moveFocus(e) {
          if (!dropDown.current) {
              return true;
          }
          var c = e.which;
          var cdd = dropDown.current.$[0];
          var links = dropDown.current.links;
  
          dropDown.current.cleanActive();
          switch (c) {
              case 40:
                  {
                      moveDown();
                      break;
                  }
              case 38:
                  {
                      moveUp();
                      break;
                  }
              case 27:
                  {
                      return options.escapeHandler.call(dropDown.current, e);
                  }
              case 13:
                  {
                      if (cdd.focused >= 0) {
                          if (!options.selectionHandler) {
                              if ((0, _jquery2.default)(links[cdd.focused]).attr('nodeName') != 'a') {
                                  return (0, _jquery2.default)('a', links[cdd.focused]).trigger('focus'); //focus on the "a" within the parent item elements
                              } else {
                                  return (0, _jquery2.default)(links[cdd.focused]).trigger('focus'); //focus on the "a"
                              }
                          } else {
                              return options.selectionHandler.call(dropDown.current, e, (0, _jquery2.default)(links[cdd.focused])); //call the selection handler
                          }
                      }
                      return true;
                  }
              default:
                  {
                      if (links.length) {
                          (0, _jquery2.default)(links[cdd.focused]).addClass(options.activeClass);
                      }
                      return true;
                  }
          }
  
          e.stopPropagation();
          e.preventDefault();
          return false;
      };
  
      var hider = function hider(e) {
          if (!(e && e.which && e.which == 3 || e && e.button && e.button == 2 || false)) {
              // right click check
              if (dropDown.current) {
                  dropDown.current.hide('click');
              }
          }
      };
      var active = function active(i) {
          return function () {
              if (!dropDown.current) {
                  return;
              }
              dropDown.current.cleanFocus();
              this.originalClass = this.className;
              (0, _jquery2.default)(this).addClass(options.activeClass);
              dropDown.current.$[0].focused = i;
          };
      };
  
      var handleClickSelection = function handleClickSelection(e) {
          if (e.button || e.metaKey || e.ctrlKey || e.shiftKey) {
              return true;
          }
          if (dropDown.current && options.selectionHandler) {
              options.selectionHandler.call(dropDown.current, e, (0, _jquery2.default)(this));
          }
      };
  
      var isEventsBound = function isEventsBound(el) {
          var bound = false;
          if (el.data('events')) {
              _jquery2.default.each(el.data('events'), function (i, handler) {
                  _jquery2.default.each(handler, function (type, handler) {
                      if (handleClickSelection === handler) {
                          bound = true;
                          return false;
                      }
                  });
              });
          }
          return bound;
      };
  
      dd.each(function () {
          var cdd = this;
          var $cdd = (0, _jquery2.default)(this);
          var res = {};
          var methods = {
              reset: function reset() {
                  res = _jquery2.default.extend(res, {
                      $: $cdd,
                      links: (0, _jquery2.default)(options.item || 'li:has(a)', cdd),
                      cleanActive: function cleanActive() {
                          if (cdd.focused + 1 && res.links.length) {
                              (0, _jquery2.default)(res.links[cdd.focused]).removeClass(options.activeClass);
                          }
                      },
                      cleanFocus: function cleanFocus() {
                          res.cleanActive();
                          cdd.focused = -1;
                      },
                      moveDown: moveDown,
                      moveUp: moveUp,
                      moveFocus: moveFocus,
                      getFocusIndex: function getFocusIndex() {
                          return typeof cdd.focused === 'number' ? cdd.focused : -1;
                      }
                  });
                  res.links.each(function (i) {
                      var $this = (0, _jquery2.default)(this);
                      if (!isEventsBound($this)) {
                          $this.hover(active(i), res.cleanFocus);
                          $this.click(handleClickSelection);
                      }
                  });
              },
              appear: function appear(dir) {
                  if (dir) {
                      $cdd.removeClass('hidden');
                      //handle left or right alignment
                      $cdd.addClass('aui-dropdown-' + options.alignment);
                  } else {
                      $cdd.addClass('hidden');
                  }
              },
              fade: function fade(dir) {
                  if (dir) {
                      $cdd.fadeIn('fast');
                  } else {
                      $cdd.fadeOut('fast');
                  }
              },
              scroll: function scroll(dir) {
                  if (dir) {
                      $cdd.slideDown('fast');
                  } else {
                      $cdd.slideUp('fast');
                  }
              }
          };
  
          res.reset = methods.reset;
          res.reset();
  
          /**
           * Uses Aspect Oriented Programming (AOP) to wrap a method around another method
           * Allows control of the execution of the wrapped method.
           * specified method has returned @see $.aop
           * @method addControlProcess
           * @param {String} methodName - Name of a public method
           * @param {Function} callback - Function to be executed
           * @return {Array} weaved aspect
           */
          res.addControlProcess = function (method, process) {
              _jquery2.default.aop.around({ target: this, method: method }, process);
          };
  
          /**
           * Uses Aspect Oriented Programming (AOP) to insert callback <em>after</em> the
           * specified method has returned @see $.aop
           * @method addCallback
           * @param {String} methodName - Name of a public method
           * @param {Function} callback - Function to be executed
           * @return {Array} weaved aspect
           */
          res.addCallback = function (method, callback) {
              return _jquery2.default.aop.after({ target: this, method: method }, callback);
          };
  
          res.show = function (method) {
              if (options.useDisabled && this.$.closest('.aui-dd-parent').hasClass('disabled')) {
                  return;
              }
  
              this.alignment = options.alignment;
              hider();
              dropDown.current = this;
              this.method = method || this.method || 'appear';
  
              this.timer = setTimeout(function () {
                  $doc.click(hider);
              }, 0);
  
              $doc.keydown(moveFocus);
  
              if (options.firstSelected && this.links[0]) {
                  active(0).call(this.links[0]);
              }
  
              (0, _jquery2.default)(cdd.offsetParent).css({ zIndex: 2000 });
              methods[this.method](true);
  
              (0, _jquery2.default)(document).trigger('showLayer', ['dropdown', dropDown.current]);
          };
  
          res.hide = function (causer) {
              this.method = this.method || 'appear';
              (0, _jquery2.default)($cdd.get(0).offsetParent).css({ zIndex: '' });
              this.cleanFocus();
              methods[this.method](false);
              $doc.unbind('click', hider).unbind('keydown', moveFocus);
              (0, _jquery2.default)(document).trigger('hideLayer', ['dropdown', dropDown.current]);
              dropDown.current = null;
              return causer;
          };
  
          res.addCallback('reset', function () {
              if (options.firstSelected && this.links[0]) {
                  active(0).call(this.links[0]);
              }
          });
  
          if (!dropDown.iframes) {
              dropDown.iframes = [];
          }
  
          dropDown.createShims = function createShims() {
              (0, _jquery2.default)('iframe').each(function (idx) {
                  var iframe = this;
                  if (!iframe.shim) {
                      iframe.shim = (0, _jquery2.default)('<div />').addClass('shim hidden').appendTo('body');
                      dropDown.iframes.push(iframe);
                  }
              });
              return createShims;
          }();
  
          res.addCallback('show', function () {
              (0, _jquery2.default)(dropDown.iframes).each(function () {
                  var $this = (0, _jquery2.default)(this);
  
                  if ($this.is(':visible')) {
                      var offset = $this.offset();
                      offset.height = $this.height();
                      offset.width = $this.width();
                      this.shim.css({
                          left: offset.left + 'px',
                          top: offset.top + 'px',
                          height: offset.height + 'px',
                          width: offset.width + 'px'
                      }).removeClass('hidden');
                  }
              });
          });
  
          res.addCallback('hide', function () {
              (0, _jquery2.default)(dropDown.iframes).each(function () {
                  this.shim.addClass('hidden');
              });
              options.hideHandler();
          });
          result.push(res);
      });
      return result;
  };
  
  /**
   * For the given item in the drop down get the value of the named additional property. If there is no
   * property with the specified name then null will be returned.
   *
   * @method getAdditionalPropertyValue
   * @namespace dropDown
   * @param item {Object} jQuery Object of the drop down item. An LI element is expected.
   * @param name {String} name of the property to retrieve
   */
  dropDown.getAdditionalPropertyValue = function (item, name) {
      var el = item[0];
      if (!el || typeof el.tagName !== 'string' || el.tagName.toLowerCase() !== 'li') {
          // we are moving the location of the properties and want to deprecate the attachment to the span
          // but are unsure where and how its being called so for now we just log
          logger.log('dropDown.getAdditionalPropertyValue : item passed in should be an LI element wrapped by jQuery');
      }
      var properties = _jquery2.default.data(el, 'properties');
      return properties ? properties[name] : null;
  };
  
  /**
   * Only here for backwards compatibility
   * @method removeAllAdditionalProperties
   * @namespace dropDown
   * @deprecated Since 3.0
   */
  dropDown.removeAllAdditionalProperties = function (item) {};
  
  /**
   * Base dropdown control. Enables you to identify triggers that when clicked, display dropdown.
   *
   * @class Standard
   * @constructor
   * @namespace dropDown
   * @param {Object} usroptions
   * @return {Object
   */
  dropDown.Standard = function (usroptions) {
  
      var res = [];
      var options = {
          selector: '.aui-dd-parent',
          dropDown: '.aui-dropdown',
          trigger: '.aui-dd-trigger'
      };
      var dropdownParents;
  
      // extend defaults with user options
      _jquery2.default.extend(options, usroptions);
  
      var hookUpDropDown = function hookUpDropDown($trigger, $parent, $dropdown, ddcontrol) {
          // extend to control to have any additional properties/methods
          _jquery2.default.extend(ddcontrol, { trigger: $trigger });
  
          // flag it to prevent additional dd controls being applied
          $parent.addClass('dd-allocated');
  
          //hide dropdown if not already hidden
          $dropdown.addClass('hidden');
  
          //show the dropdown if isHiddenByDefault is set to false
          if (options.isHiddenByDefault == false) {
              ddcontrol.show();
          }
  
          ddcontrol.addCallback('show', function () {
              $parent.addClass('active');
          });
  
          ddcontrol.addCallback('hide', function () {
              $parent.removeClass('active');
          });
      };
  
      var handleEvent = function handleEvent(event, $trigger, $dropdown, ddcontrol) {
          if (ddcontrol != dropDown.current) {
              $dropdown.css({ top: $trigger.outerHeight() });
              ddcontrol.show();
              event.stopImmediatePropagation();
          }
          event.preventDefault();
      };
  
      if (options.useLiveEvents) {
          // cache arrays so that we don't have to recalculate the dropdowns. Since we can't store objects as keys in a map,
          // we have two arrays: keysCache stores keys of dropdown triggers; valuesCache stores a map of internally used objects
          var keysCache = [];
          var valuesCache = [];
  
          (0, _jquery2.default)(options.trigger).live('click', function (event) {
              var $trigger = (0, _jquery2.default)(this);
              var $parent;
              var $dropdown;
              var ddcontrol;
  
              // if we're cached, don't recalculate the dropdown and do all that funny shite.
              var index;
              if ((index = _jquery2.default.inArray(this, keysCache)) >= 0) {
                  var val = valuesCache[index];
                  $parent = val.parent;
                  $dropdown = val.dropdown;
                  ddcontrol = val.ddcontrol;
              } else {
                  $parent = $trigger.closest(options.selector);
                  $dropdown = $parent.find(options.dropDown);
                  // Sanity checking
                  if ($dropdown.length === 0) {
                      return;
                  }
  
                  ddcontrol = dropDown($dropdown, options)[0];
                  // Sanity checking
                  if (!ddcontrol) {
                      return;
                  }
  
                  // cache
                  keysCache.push(this);
                  val = {
                      parent: $parent,
                      dropdown: $dropdown,
                      ddcontrol: ddcontrol
                  };
  
                  hookUpDropDown($trigger, $parent, $dropdown, ddcontrol);
  
                  valuesCache.push(val);
              }
  
              handleEvent(event, $trigger, $dropdown, ddcontrol);
          });
      } else {
          // handling for jQuery collections
          if (this instanceof _jquery2.default) {
              dropdownParents = this;
              // handling for selectors
          } else {
              dropdownParents = (0, _jquery2.default)(options.selector);
          }
  
          // a series of checks to ensure we are dealing with valid dropdowns
          dropdownParents = dropdownParents.not('.dd-allocated').filter(':has(' + options.dropDown + ')').filter(':has(' + options.trigger + ')');
  
          dropdownParents.each(function () {
              var $parent = (0, _jquery2.default)(this);
              var $dropdown = (0, _jquery2.default)(options.dropDown, this);
              var $trigger = (0, _jquery2.default)(options.trigger, this);
              var ddcontrol = dropDown($dropdown, options)[0];
  
              // extend to control to have any additional properties/methods
              _jquery2.default.extend(ddcontrol, { trigger: $trigger });
  
              hookUpDropDown($trigger, $parent, $dropdown, ddcontrol);
  
              $trigger.click(function (e) {
                  handleEvent(e, $trigger, $dropdown, ddcontrol);
              });
  
              // add control to the response
              res.push(ddcontrol);
          });
      }
      return res;
  };
  
  /**
   * A NewStandard dropdown, however, with the ability to populate its content's via ajax.
   *
   * @class Ajax
   * @constructor
   * @namespace dropDown
   * @param {Object} options
   * @return {Object} dropDown instance
   */
  dropDown.Ajax = function (usroptions) {
  
      var dropdowns;
      var options = { cache: true };
  
      // extend defaults with user options
      _jquery2.default.extend(options, usroptions || {});
  
      // we call with "this" in case we are called in the context of a jQuery collection
      dropdowns = dropDown.Standard.call(this, options);
  
      (0, _jquery2.default)(dropdowns).each(function () {
  
          var ddcontrol = this;
  
          _jquery2.default.extend(ddcontrol, {
              getAjaxOptions: function getAjaxOptions(opts) {
                  var success = function success(response) {
                      if (options.formatResults) {
                          response = options.formatResults(response);
                      }
                      if (options.cache) {
                          ddcontrol.cache.set(ddcontrol.getAjaxOptions(), response);
                      }
                      ddcontrol.refreshSuccess(response);
                  };
                  if (options.ajaxOptions) {
  
                      if (_jquery2.default.isFunction(options.ajaxOptions)) {
                          return _jquery2.default.extend(options.ajaxOptions.call(ddcontrol), { success: success });
                      } else {
                          return _jquery2.default.extend(options.ajaxOptions, { success: success });
                      }
                  }
                  return _jquery2.default.extend(opts, { success: success });
              },
  
              refreshSuccess: function refreshSuccess(response) {
                  this.$.html(response);
              },
  
              cache: function () {
                  var c = {};
                  return {
                      get: function get(ajaxOptions) {
                          var data = ajaxOptions.data || '';
                          return c[(ajaxOptions.url + data).replace(/[\?\&]/gi, '')];
                      },
                      set: function set(ajaxOptions, responseData) {
                          var data = ajaxOptions.data || '';
                          c[(ajaxOptions.url + data).replace(/[\?\&]/gi, '')] = responseData;
                      },
                      reset: function reset() {
                          c = {};
                      }
                  };
              }(),
  
              show: function (superMethod) {
                  return function () {
                      if (options.cache && !!ddcontrol.cache.get(ddcontrol.getAjaxOptions())) {
                          ddcontrol.refreshSuccess(ddcontrol.cache.get(ddcontrol.getAjaxOptions()));
                          superMethod.call(ddcontrol);
                      } else {
                          (0, _jquery2.default)(_jquery2.default.ajax(ddcontrol.getAjaxOptions())).throbber({ target: ddcontrol.$,
                              end: function end() {
                                  ddcontrol.reset();
                              }
                          });
                          superMethod.call(ddcontrol);
                          if (ddcontrol.iframeShim) {
                              ddcontrol.iframeShim.hide();
                          }
                      }
                  };
              }(ddcontrol.show),
  
              resetCache: function resetCache() {
                  ddcontrol.cache.reset();
              }
          });
          ddcontrol.addCallback('refreshSuccess', function () {
              ddcontrol.reset();
          });
      });
      return dropdowns;
  };
  
  // OMG. No. Just no.
  _jquery2.default.fn.dropDown = function (type, options) {
      type = (type || 'Standard').replace(/^([a-z])/, function (match) {
          return match.toUpperCase();
      });
      return dropDown[type].call(this, options);
  };
  
  _jquery2.default.fn.dropDown = deprecate.construct(_jquery2.default.fn.dropDown, 'Dropdown constructor', {
      alternativeName: 'Dropdown2'
  });
  
  (0, _globalize2.default)('dropDown', dropDown);
  
  exports.default = dropDown;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);