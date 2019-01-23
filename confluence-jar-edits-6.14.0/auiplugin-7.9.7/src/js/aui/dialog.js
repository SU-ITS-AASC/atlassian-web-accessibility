// src/js/aui/dialog.js
(typeof window === 'undefined' ? global : window).__bc50e12d2af94e34822ae0035ae0e67f = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.popup = exports.Dialog = undefined;
  
  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; // can't "use strict"
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _keyCode = __e246bf93af36eb4453f35afeb1c302d9;
  
  var _keyCode2 = _interopRequireDefault(_keyCode);
  
  var _log = __c1e961001275c079e48525ad3a48c8c2;
  
  var logger = _interopRequireWildcard(_log);
  
  var _deprecation = __921ad9514d56376fef992861d9ec0f51;
  
  var deprecate = _interopRequireWildcard(_deprecation);
  
  var _event = __51139989be9b25b15c1774d709ce985b;
  
  var _blanket = __4c4f13d92d5dcb8f12059ce701946463;
  
  var _forms = __8741535334cf9725b62821139abd6dba;
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Creates a generic popup that will be displayed in the center of the screen with a
   * grey blanket in the background.
   * Usage:
   * <pre>
   * createPopup({
   *     width: 800,
   *     height: 400,
   *     id: "my-dialog"
   * });
   * </pre>
   * @param options {object} [optional] Permitted options and defaults are as follows:
   * width (800), height (600), keypressListener (closes dialog on ESC).
  */
  function createPopup(options) {
      var defaults = {
          width: 800,
          height: 600,
          closeOnOutsideClick: false,
          keypressListener: function keypressListener(e) {
              if (e.keyCode === _keyCode2.default.ESCAPE && popup.is(':visible')) {
                  res.hide();
              }
          }
      };
      // for backwards-compatibility
      if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object') {
          options = {
              width: arguments[0],
              height: arguments[1],
              id: arguments[2]
          };
          options = _jquery2.default.extend({}, options, arguments[3]);
      }
      options = _jquery2.default.extend({}, defaults, options);
      var popup = (0, _jquery2.default)('<div></div>').addClass('aui-popup');
  
      if (options.id) {
          popup.attr('id', options.id);
      }
      //find the highest z-index on the page to ensure any new popup that is shown is shown on top
      var highestZIndex = 3000;
      (0, _jquery2.default)('.aui-dialog').each(function () {
          var currentPopup = (0, _jquery2.default)(this);
          highestZIndex = currentPopup.css('z-index') > highestZIndex ? currentPopup.css('z-index') : highestZIndex;
      });
  
      var applySize = function _applySize(width, height) {
          options.width = width = width || options.width;
          options.height = height = height || options.height;
  
          popup.css({
              marginTop: -Math.round(height / 2) + 'px',
              marginLeft: -Math.round(width / 2) + 'px',
              width: width,
              height: height,
              'z-index': parseInt(highestZIndex, 10) + 2 //+ 2 so that the shadow can be shown on +1 (underneath the popup but above everything else)
          });
          return _applySize;
      }(options.width, options.height);
  
      (0, _jquery2.default)('body').append(popup);
  
      popup.hide();
      (0, _forms.enable)(popup);
  
      /**
       * Popup object
       * @class Popup
       * @static
      */
  
      //blanket for reference further down
      var blanket = (0, _jquery2.default)('.aui-blanket');
      var focusItem = function focusItem(selector, element) {
          var item = (0, _jquery2.default)(selector, element);
          if (item.length) {
              item.focus();
              return true;
          }
          return false;
      };
      // we try and place focus, in the configured element or by looking for the first input
      // in page body, then button panel and finally page menu.
      var focusDialog = function focusDialog(element) {
          if ((0, _jquery2.default)('.dialog-page-body', element).find(':focus').length !== 0) {
              return;
          }
          if (options.focusSelector) {
              return focusItem(options.focusSelector, element);
          }
          var defaultFocusSelector = ':input:visible:enabled:first';
          if (focusItem(defaultFocusSelector, (0, _jquery2.default)('.dialog-page-body', element))) {
              return;
          }
          if (focusItem(defaultFocusSelector, (0, _jquery2.default)('.dialog-button-panel', element))) {
              return;
          }
  
          focusItem(defaultFocusSelector, (0, _jquery2.default)('.dialog-page-menu', element));
      };
  
      var res = {
  
          changeSize: function changeSize(w, h) {
              if (w && w != options.width || h && h != options.height) {
                  applySize(w, h);
              }
              this.show();
          },
  
          /**
           * Shows the popup
           * @method show
          */
          show: function show() {
  
              var show = function show() {
                  (0, _jquery2.default)(document).off('keydown', options.keypressListener).on('keydown', options.keypressListener);
                  (0, _blanket.dim)();
                  blanket = (0, _jquery2.default)('.aui-blanket');
                  if (blanket.length !== 0 && options.closeOnOutsideClick) {
                      blanket.click(function () {
                          if (popup.is(':visible')) {
                              res.hide();
                          }
                      });
                  }
                  popup.show();
  
                  createPopup.current = this;
                  focusDialog(popup);
                  (0, _jquery2.default)(document).trigger('showLayer', ['popup', this]);
              };
              show.call(this);
              this.show = show;
          },
          /**
           * Hides the popup.
           * @method hide
          */
          hide: function hide() {
              (0, _jquery2.default)(document).unbind('keydown', options.keypressListener);
              blanket.unbind();
              this.element.hide();
  
              //only undim if no other dialogs are visible
              if ((0, _jquery2.default)('.aui-dialog:visible').length === 0) {
                  (0, _blanket.undim)();
              }
  
              // AUI-1059: remove focus from the active element when dialog is hidden
              var activeElement = document.activeElement;
              if (this.element.has(activeElement).length) {
                  activeElement.blur();
              }
  
              (0, _jquery2.default)(document).trigger('hideLayer', ['popup', this]);
              createPopup.current = null;
              this.enable();
          },
          /**
           * jQuery object, representing popup DOM element
           * @property element
          */
          element: popup,
          /**
           * Removes popup elements from the DOM
           * @method remove
          */
          remove: function remove() {
              popup.remove();
              this.element = null;
          },
          /**
           * disables the popup
           * @method disable
          */
          disable: function disable() {
              if (!this.disabled) {
                  this.popupBlanket = (0, _jquery2.default)("<div class='dialog-blanket'> </div>").css({
                      height: popup.height(),
                      width: popup.width()
                  });
                  popup.append(this.popupBlanket);
                  this.disabled = true;
              }
          },
          /**
           * enables the popup if it is disabled
           * @method enable
          */
          enable: function enable() {
              if (this.disabled) {
                  this.disabled = false;
                  this.popupBlanket.remove();
                  this.popupBlanket = null;
              }
          }
      };
  
      return res;
  }
  
  // Scoping function
  var Dialog = function () {
      /**
       * @class Button
       * @constructor Button
       * @param page {number} page id
       * @param label {string} button label
       * @param onclick {function} [optional] click event handler
       * @param className {string} [optional] class name
       * @private
      */
      function Button(page, label, onclick, className) {
          if (!page.buttonpanel) {
              page.addButtonPanel();
          }
          this.page = page;
          this.onclick = onclick;
          this._onclick = function (e) {
              return onclick.call(this, page.dialog, page, e) === true;
          };
          this.item = (0, _jquery2.default)('<button></button>').html(label).addClass('button-panel-button');
          if (className) {
              this.item.addClass(className);
          }
          if (typeof onclick === 'function') {
              this.item.click(this._onclick);
          }
          page.buttonpanel.append(this.item);
          this.id = page.button.length;
          page.button[this.id] = this;
      }
  
      /**
       * @class Link
       * @constructor Link
       * @param page {number} page id
       * @param label {string} button label
       * @param onclick {function} [optional] click event handler
       * @param className {string} [optional] class name
       * @private
      */
      function Link(page, label, onclick, className, url) {
          if (!page.buttonpanel) {
              page.addButtonPanel();
          }
  
          //if no url is given use # as default
          if (!url) {
              url = '#';
          }
  
          this.page = page;
          this.onclick = onclick;
          this._onclick = function (e) {
              return onclick.call(this, page.dialog, page, e) === true;
          };
          this.item = (0, _jquery2.default)('<a></a>').html(label).attr('href', url).addClass('button-panel-link');
          if (className) {
              this.item.addClass(className);
          }
          if (typeof onclick === 'function') {
              this.item.click(this._onclick);
          }
          page.buttonpanel.append(this.item);
          this.id = page.button.length;
          page.button[this.id] = this;
      }
  
      function itemMove(leftOrRight, target) {
          var dir = leftOrRight == 'left' ? -1 : 1;
          return function (step) {
              var dtarget = this.page[target];
              if (this.id != (dir == 1 ? dtarget.length - 1 : 0)) {
                  dir *= step || 1;
                  dtarget[this.id + dir].item[dir < 0 ? 'before' : 'after'](this.item);
                  dtarget.splice(this.id, 1);
                  dtarget.splice(this.id + dir, 0, this);
                  for (var i = 0, ii = dtarget.length; i < ii; i++) {
                      if (target == 'panel' && this.page.curtab == dtarget[i].id) {
                          this.page.curtab = i;
                      }
                      dtarget[i].id = i;
                  }
              }
              return this;
          };
      }
      function itemRemove(target) {
          return function () {
              this.page[target].splice(this.id, 1);
              for (var i = 0, ii = this.page[target].length; i < ii; i++) {
                  this.page[target][i].id = i;
              }
              this.item.remove();
          };
      }
      /**
       * Moves item left in the hierarchy
       * @method moveUp
       * @method moveLeft
       * @param step {number} how many items to move, default is 1
       * @return {object} button
      */
      Button.prototype.moveUp = Button.prototype.moveLeft = itemMove('left', 'button');
      /**
       * Moves item right in the hierarchy
       * @method moveDown
       * @method moveRight
       * @param step {number} how many items to move, default is 1
       * @return {object} button
      */
      Button.prototype.moveDown = Button.prototype.moveRight = itemMove('right', 'button');
      /**
       * Removes item
       * @method remove
      */
      Button.prototype.remove = itemRemove('button');
  
      /**
       * Getter and setter for label
       * @method label
       * @param label {string} [optional] label of the button
       * @return {string} label, if nothing is passed in
       * @return {object} jQuery button object, if label is passed in
      */
      Button.prototype.html = function (label) {
          return this.item.html(label);
      };
      /**
       * Getter and setter of onclick event handler
       * @method onclick
       * @param onclick {function} [optional] new event handler, that is going to replace the old one
       * @return {function} existing event handler if new one is undefined
      */
      Button.prototype.onclick = function (onclick) {
          var self = this;
          if (typeof onclick === 'undefined') {
              return this.onclick;
          } else {
              this.item.unbind('click', this._onclick);
              this._onclick = function (e) {
                  return onclick.call(this, self.page.dialog, self.page, e) === true;
              };
              if (typeof onclick === 'function') {
                  this.item.click(this._onclick);
              }
          }
      };
  
      var DEFAULT_PADDING = 20;
  
      /**
       * Class for panels
       * @class Panel
       * @constructor
       * @param page {number} page id
       * @param title {string} panel title
       * @param reference {string} or {object} jQuery object or selector for the contents of the Panel
       * @param className {string} [optional] HTML class name
       * @param panelButtonId {string} the unique id that will be put on the button element for this panel.
       * @private
      */
      var Panel = function Panel(page, title, reference, className, panelButtonId) {
          if (!(reference instanceof _jquery2.default)) {
              reference = (0, _jquery2.default)(reference);
          }
  
          this.dialog = page.dialog;
          this.page = page;
          this.id = page.panel.length;
          this.button = (0, _jquery2.default)('<button></button>').html(title).addClass('item-button');
  
          if (panelButtonId) {
              this.button[0].id = panelButtonId;
          }
  
          this.item = (0, _jquery2.default)('<li></li>').append(this.button).addClass('page-menu-item');
          this.body = (0, _jquery2.default)('<div></div>').append(reference).addClass('dialog-panel-body').css('height', page.dialog.height + 'px');
          this.padding = DEFAULT_PADDING;
          if (className) {
              this.body.addClass(className);
          }
          var i = page.panel.length;
          var tab = this;
          page.menu.append(this.item);
          page.body.append(this.body);
          page.panel[i] = this;
          var onclick = function onclick() {
              var cur;
              if (page.curtab + 1) {
                  cur = page.panel[page.curtab];
                  cur.body.hide();
                  cur.item.removeClass('selected');
                  typeof cur.onblur === 'function' && cur.onblur();
              }
              page.curtab = tab.id;
              tab.body.show();
              tab.item.addClass('selected');
              typeof tab.onselect === 'function' && tab.onselect();
              typeof page.ontabchange === 'function' && page.ontabchange(tab, cur);
          };
          if (!this.button.click) {
              logger.log('atlassian-dialog:Panel:constructor - this.button.click false');
              this.button.onclick = onclick;
          } else {
              this.button.click(onclick);
          }
          onclick();
          if (i == 0) {
              page.menu.css('display', 'none'); // don't use jQuery hide()
          } else {
              page.menu.show();
          }
      };
      /**
       * Selects current panel
       * @method select
      */
      Panel.prototype.select = function () {
          this.button.click();
      };
      /**
       * Moves item left in the hierarchy
       * @method moveUp
       * @method moveLeft
       * @param step {number} how many items to move, default is 1
       * @return {object} panel
      */
      Panel.prototype.moveUp = Panel.prototype.moveLeft = itemMove('left', 'panel');
      /**
       * Moves item right in the hierarchy
       * @method moveDown
       * @method moveRight
       * @param step {number} how many items to move, default is 1
       * @return {object} panel
      */
      Panel.prototype.moveDown = Panel.prototype.moveRight = itemMove('right', 'panel');
      /**
       * Removes item
       * @method remove
      */
      Panel.prototype.remove = itemRemove('panel');
      /**
       * Getter and setter of inner HTML of the panel
       * @method html
       * @param html {string} HTML source to set up
       * @return {object} panel
       * @return {string} current HTML source
      */
      Panel.prototype.html = function (html) {
          if (html) {
              this.body.html(html);
              return this;
          } else {
              return this.body.html();
          }
      };
      /**
       * This method gives you ability to overwrite default padding value. Use it with caution.
       * @method setPadding
       * @param padding {number} padding in pixels
       * @return {object} panel
       * @see DEFAULT_PADDING
      */
      Panel.prototype.setPadding = function (padding) {
          if (!isNaN(+padding)) {
              this.body.css('padding', +padding);
              this.padding = +padding;
              this.page.recalcSize();
          }
          return this;
      };
  
      var HEADER_HEIGHT = 62;
      var BUTTONS_HEIGHT = 52;
      var MIN_DIALOG_VERTICAL_BUFFER = 50;
  
      /**
       * Class for pages
       * @class Page
       * @constructor
       * @param dialog {object} dialog object
       * @param className {string} [optional] HTML class name
       * @private
      */
      var Page = function Page(dialog, className) {
          this.dialog = dialog;
          this.id = dialog.page.length;
          this.element = (0, _jquery2.default)('<div></div>').addClass('dialog-components');
          this.body = (0, _jquery2.default)('<div></div>').addClass('dialog-page-body');
          this.menu = (0, _jquery2.default)('<ul></ul>').addClass('dialog-page-menu').css('height', dialog.height + 'px');
          this.body.append(this.menu);
          this.curtab;
          this.panel = [];
          this.button = [];
          if (className) {
              this.body.addClass(className);
          }
          dialog.popup.element.append(this.element.append(this.menu).append(this.body));
          dialog.page[dialog.page.length] = this;
      };
  
      /**
       * Size updater for contents of the page. For internal use
       * @method recalcSize
      */
      Page.prototype.recalcSize = function () {
          var headerHeight = this.header ? HEADER_HEIGHT : 0;
          var buttonHeight = this.buttonpanel ? BUTTONS_HEIGHT : 0;
          for (var i = this.panel.length; i--;) {
              var dialogComponentsHeight = this.dialog.height - headerHeight - buttonHeight;
              this.panel[i].body.css('height', dialogComponentsHeight);
              this.menu.css('height', dialogComponentsHeight);
          }
      };
  
      /**
       * Adds a button panel to the bottom of dialog
       * @method addButtonPanel
       */
      Page.prototype.addButtonPanel = function () {
          this.buttonpanel = (0, _jquery2.default)('<div></div>').addClass('dialog-button-panel');
          this.element.append(this.buttonpanel);
      };
  
      /**
       * Method for adding new panel to the page
       * @method addPanel
       * @param title {string} panel title
       * @param reference {string} or {object} jQuery object or selector for the contents of the Panel
       * @param className {string} [optional] HTML class name
       * @param panelButtonId {string} [optional] The unique id for the panel's button.
       * @return {object} the page
      */
      Page.prototype.addPanel = function (title, reference, className, panelButtonId) {
          new Panel(this, title, reference, className, panelButtonId);
          this.recalcSize();
          return this;
      };
      /**
       * Method for adding header to the page
       * @method addHeader
       * @param title {string} panel title
       * @param className {string} [optional] CSS class name
       * @return {object} the page
      */
      Page.prototype.addHeader = function (title, className) {
          if (this.header) {
              this.header.remove();
          }
          this.header = (0, _jquery2.default)('<h2></h2>').text(title || '').addClass('dialog-title');
          className && this.header.addClass(className);
          this.element.prepend(this.header);
          this.recalcSize();
          return this;
      };
      /**
       * Method for adding new button to the page
       * @method addButton
       * @param label {string} button label
       * @param onclick {function} [optional] click event handler
       * @param className {string} [optional] class name
       * @return {object} the page
      */
      Page.prototype.addButton = function (label, onclick, className) {
          new Button(this, label, onclick, className);
          this.recalcSize();
          return this;
      };
      /**
       * Method for adding new link to the page
       * @method addLink
       * @param label {string} button label
       * @param onclick {function} [optional] click event handler
       * @param className {string} [optional] class name
       * @return {object} the page
      */
      Page.prototype.addLink = function (label, onclick, className, url) {
          new Link(this, label, onclick, className, url);
          this.recalcSize();
          return this;
      };
  
      /**
       * Selects corresponding panel
       * @method gotoPanel
       * @param panel {object} panel object
       * @param panel {number} id of the panel
      */
      Page.prototype.gotoPanel = function (panel) {
          this.panel[panel.id || panel].select();
      };
      /**
       * Returns current panel on the page
       * @method getCurrentPanel
       * @return panel {object} the panel
      */
      Page.prototype.getCurrentPanel = function () {
          return this.panel[this.curtab];
      };
      /**
       * Hides the page
       * @method hide
      */
      Page.prototype.hide = function () {
          this.element.hide();
      };
      /**
       * Shows the page, if it was hidden
       * @method show
      */
      Page.prototype.show = function () {
          this.element.show();
      };
      /**
       * Removes the page
       * @method remove
      */
      Page.prototype.remove = function () {
          this.element.remove();
      };
  
      /**
       * Constructor for a Dialog. A Dialog is a popup which consists of Pages, where each Page can consist of Panels,
       * Buttons and a Header. The dialog must be constructed in page order as it has a current page state. For example,
       * calling addButton() will add a button to the 'current' page.
       * <p>
       * By default, a new Dialog will have one page. If there are multiple Panels on a Page, a
       * menu is displayed on the left side of the dialog.
       * </p>
       * Usage:
       * <pre>
       * var dialog = new Dialog(860, 530);
       * dialog.addHeader("Insert Macro")
       * .addPanel("All", "&lt;p&gt;&lt;/p&gt;")
       * .addPanel("Some", "&lt;p&gt;&lt;/p&gt;")
       * .addButton("Next", function (dialog) {dialog.nextPage();})
       * .addButton("Cancel", function (dialog) {dialog.hide();});
       *
       * dialog.addPage()
       * .addButton("Cancel", function (dialog) {dialog.hide();});
       *
       * somebutton.click(function () {dialog.show();});
       * </pre>
       * @class Dialog
       * @constructor
       * @param width {number} dialog width in pixels, or an object containing the Dialog parameters
       * @param height {number} dialog height in pixels
       * @param id {number} [optional] dialog id
      */
      function Dialog(width, height, id) {
          var options = {};
          if (!+width) {
              options = Object(width);
              width = options.width;
              height = options.height;
              id = options.id;
          }
          this.height = height || 480;
          this.width = width || 640;
          this.id = id;
          options = _jquery2.default.extend({}, options, {
              width: this.width,
              height: this.height,
              id: this.id
          });
          this.popup = createPopup(options);
  
          this.popup.element.addClass('aui-dialog');
          this.page = [];
          this.curpage = 0;
  
          new Page(this);
      };
  
      /**
       * Method for adding header to the current page
       * @method addHeader
       * @param title {string} panel title
       * @param className {string} [optional] HTML class name
       * @return {object} the dialog
      */
      Dialog.prototype.addHeader = function (title, className) {
          this.page[this.curpage].addHeader(title, className);
          return this;
      };
      /**
       * Method for adding new button to the current page
       * @method addButton
       * @param label {string} button label
       * @param onclick {function} [optional] click event handler
       * @param className {string} [optional] class name
       * @return {object} the dialog
      */
      Dialog.prototype.addButton = function (label, onclick, className) {
          this.page[this.curpage].addButton(label, onclick, className);
          return this;
      };
  
      /**
       * Method for adding new link to the current page
       * @method addButton
       * @param label {string} link label
       * @param onclick {function} [optional] click event handler
       * @param className {string} [optional] class name
       * @return {object} the dialog
      */
      Dialog.prototype.addLink = function (label, onclick, className, url) {
          this.page[this.curpage].addLink(label, onclick, className, url);
          return this;
      };
  
      /**
      * Method for adding a submit button to the current page
      * @method addSubmit
      * @param label {string} link label
      * @param onclick {function} [optional] click event handler
      * @return {object} the dialog
      */
      Dialog.prototype.addSubmit = function (label, onclick) {
          this.page[this.curpage].addButton(label, onclick, 'button-panel-submit-button');
          return this;
      };
  
      /**
      * Method for adding a cancel link to the current page
      * @method addCancel
      * @param label {string} link label
      * @param onclick {function} [optional] click event handler
      * @return {object} the dialog
      */
      Dialog.prototype.addCancel = function (label, onclick) {
          this.page[this.curpage].addLink(label, onclick, 'button-panel-cancel-link');
          return this;
      };
  
      /**
       * Method for adding new button panel to the current page
       * @return {object} the dialog
      */
      Dialog.prototype.addButtonPanel = function () {
          this.page[this.curpage].addButtonPanel();
          return this;
      };
  
      /**
       * Method for adding new panel to the current page.
       * @method addPanel
       * @param title {string} panel title
       * @param reference {string} or {object} jQuery object or selector for the contents of the Panel
       * @param className {string} [optional] HTML class name
       * @param panelButtonId {String} [optional] The unique id for the panel's button.
       * @return {object} the dialog
      */
      Dialog.prototype.addPanel = function (title, reference, className, panelButtonId) {
          this.page[this.curpage].addPanel(title, reference, className, panelButtonId);
          return this;
      };
      /**
       * Adds a new page to the dialog and sets the new page as the current page
       * @method addPage
       * @param className {string} [optional] HTML class name
       * @return {object} the dialog
      */
      Dialog.prototype.addPage = function (className) {
          new Page(this, className);
          this.page[this.curpage].hide();
          this.curpage = this.page.length - 1;
          return this;
      };
      /**
       * Making next page in hierarchy visible and active
       * @method nextPage
       * @return {object} the dialog
      */
      Dialog.prototype.nextPage = function () {
          this.page[this.curpage++].hide();
          if (this.curpage >= this.page.length) {
              this.curpage = 0;
          }
          this.page[this.curpage].show();
          return this;
      };
      /**
       * Making previous page in hierarchy visible and active
       * @method prevPage
       * @return {object} the dialog
      */
      Dialog.prototype.prevPage = function () {
          this.page[this.curpage--].hide();
          if (this.curpage < 0) {
              this.curpage = this.page.length - 1;
          }
          this.page[this.curpage].show();
          return this;
      };
      /**
       * Making specified page visible and active
       * @method gotoPage
       * @param num {number} page id
       * @return {object} the dialog
      */
      Dialog.prototype.gotoPage = function (num) {
          this.page[this.curpage].hide();
          this.curpage = num;
          if (this.curpage < 0) {
              this.curpage = this.page.length - 1;
          } else if (this.curpage >= this.page.length) {
              this.curpage = 0;
          }
          this.page[this.curpage].show();
          return this;
      };
      /**
       * Returns specified panel at the current page
       * @method getPanel
       * @param pageorpanelId {number} page id or panel id
       * @param panelId {number} panel id
       * @return {object} the internal Panel object
      */
      Dialog.prototype.getPanel = function (pageorpanelId, panelId) {
          var pageid = panelId == null ? this.curpage : pageorpanelId;
          if (panelId == null) {
              panelId = pageorpanelId;
          }
          return this.page[pageid].panel[panelId];
      };
      /**
       * Returns specified page
       * @method getPage
       * @param pageid {number} page id
       * @return {object} the internal Page Object
      */
      Dialog.prototype.getPage = function (pageid) {
          return this.page[pageid];
      };
      /**
       * Returns current panel at the current page
       * @method getCurrentPanel
       * @return {object} the internal Panel object
      */
      Dialog.prototype.getCurrentPanel = function () {
          return this.page[this.curpage].getCurrentPanel();
      };
  
      /**
       * Selects corresponding panel
       * @method gotoPanel
       * @param pageorpanel {object} panel object or page object
       * @param panel {object} panel object
       * @param panel {number} id of the panel
      */
      Dialog.prototype.gotoPanel = function (pageorpanel, panel) {
          if (panel != null) {
              var pageid = pageorpanel.id || pageorpanel;
              this.gotoPage(pageid);
          }
          this.page[this.curpage].gotoPanel(typeof panel === 'undefined' ? pageorpanel : panel);
      };
  
      /**
       * Shows the dialog, if it is not visible
       * @method show
       * @return {object} the dialog
      */
      Dialog.prototype.show = function () {
          this.popup.show();
          (0, _event.trigger)('show.dialog', { dialog: this });
          return this;
      };
      /**
       * Hides the dialog, if it was visible
       * @method hide
       * @return {object} the dialog
      */
      Dialog.prototype.hide = function () {
          this.popup.hide();
          (0, _event.trigger)('hide.dialog', { dialog: this });
          return this;
      };
      /**
       * Removes the dialog elements from the DOM
       * @method remove
      */
      Dialog.prototype.remove = function () {
          this.popup.hide();
          this.popup.remove();
          (0, _event.trigger)('remove.dialog', { dialog: this });
      };
      /**
       * Disables the dialog if enabled
       * @method disable
      */
      Dialog.prototype.disable = function () {
          this.popup.disable();
          return this;
      };
      /**
       * Enables the dialog if disabled
       * @method disable
      */
      Dialog.prototype.enable = function () {
          this.popup.enable();
          return this;
      };
      /**
       * Gets set of items depending on query
       * @method get
       * @param query {string} query to search for panels, pages, headers or buttons
       * e.g.
       *      '#Name' will find all dialog components with the given name such as panels and buttons, etc
       *      'panel#Name' will find only panels with the given name
       *      'panel#"Foo bar"' will find only panels with given name
       *      'panel:3' will find the third panel
       */
      Dialog.prototype.get = function (query) {
          var coll = [];
          var dialog = this;
          var nameExp = '#([^"][^ ]*|"[^"]*")'; // a name is a hash followed by either a bare word or quoted string
          var indexExp = ':(\\d+)'; // an index is a colon followed by some digits
          var typeExp = 'page|panel|button|header'; // one of the allowed types
          var selectorExp = '(?:' + // a selector is either ...
          '(' + typeExp + ')(?:' + nameExp + '|' + indexExp + ')?' + // a type optionally followed by either #name or :index
          '|' + nameExp + // or just a #name
          ')';
          var queryRE = new RegExp('(?:^|,)' + // a comma or at the start of the line
          '\\s*' + selectorExp + // optional space and a selector
          '(?:\\s+' + selectorExp + ')?' + // optionally, followed by some space and a second selector
          '\\s*(?=,|$)', 'ig'); // followed by, but not including, a comma or the end of the string
          (query + '').replace(queryRE, function (all, name, title, id, justtitle, name2, title2, id2, justtitle2) {
              name = name && name.toLowerCase();
              var pages = [];
              if (name == 'page' && dialog.page[id]) {
                  pages.push(dialog.page[id]);
                  name = name2;
                  name = name && name.toLowerCase();
                  title = title2;
                  id = id2;
                  justtitle = justtitle2;
              } else {
                  pages = dialog.page;
              }
              title = title && (title + '').replace(/"/g, '');
              title2 = title2 && (title2 + '').replace(/"/g, '');
              justtitle = justtitle && (justtitle + '').replace(/"/g, '');
              justtitle2 = justtitle2 && (justtitle2 + '').replace(/"/g, '');
              if (name || justtitle) {
                  for (var i = pages.length; i--;) {
                      if (justtitle || name == 'panel' && (title || !title && id == null)) {
                          for (var j = pages[i].panel.length; j--;) {
                              if (pages[i].panel[j].button.html() == justtitle || pages[i].panel[j].button.html() == title || name == 'panel' && !title && id == null) {
                                  coll.push(pages[i].panel[j]);
                              }
                          }
                      }
                      if (justtitle || name == 'button' && (title || !title && id == null)) {
                          for (var j = pages[i].button.length; j--;) {
                              if (pages[i].button[j].item.html() == justtitle || pages[i].button[j].item.html() == title || name == 'button' && !title && id == null) {
                                  coll.push(pages[i].button[j]);
                              }
                          }
                      }
                      if (pages[i][name] && pages[i][name][id]) {
                          coll.push(pages[i][name][id]);
                      }
                      if (name == 'header' && pages[i].header) {
                          coll.push(pages[i].header);
                      }
                  }
              } else {
                  coll = coll.concat(pages);
              }
          });
          var res = {
              length: coll.length
          };
          for (var i = coll.length; i--;) {
              res[i] = coll[i];
              for (var method in coll[i]) {
                  if (!(method in res)) {
                      (function (m) {
                          res[m] = function () {
                              for (var j = this.length; j--;) {
                                  if (typeof this[j][m] === 'function') {
                                      this[j][m].apply(this[j], arguments);
                                  }
                              }
                          };
                      })(method);
                  }
              }
          }
          return res;
      };
  
      /**
       * Updates height of panels, to contain content without the need for scroll bars.
       *
       * @method updateHeight
       */
      Dialog.prototype.updateHeight = function () {
          var height = 0;
          var maxDialogHeight = (0, _jquery2.default)(window).height() - HEADER_HEIGHT - BUTTONS_HEIGHT - MIN_DIALOG_VERTICAL_BUFFER * 2;
          for (var i = 0; this.getPanel(i); i++) {
              if (this.getPanel(i).body.css({ height: 'auto', display: 'block' }).outerHeight() > height) {
                  height = Math.min(maxDialogHeight, this.getPanel(i).body.outerHeight());
              }
              if (i !== this.page[this.curpage].curtab) {
                  this.getPanel(i).body.css({ display: 'none' });
              }
          }
          for (i = 0; this.getPanel(i); i++) {
              this.getPanel(i).body.css({ height: height || this.height });
          }
          this.page[0].menu.height(height);
          this.height = height + HEADER_HEIGHT + BUTTONS_HEIGHT + 1;
          this.popup.changeSize(undefined, this.height);
      };
  
      /**
       * Returns whether the dialog has been resized to it's maximum height (has been capped by the viewport height and vertical buffer).
       *
       * @method isMaximised
       */
      Dialog.prototype.isMaximised = function () {
          return this.popup.element.outerHeight() >= (0, _jquery2.default)(window).height() - MIN_DIALOG_VERTICAL_BUFFER * 2;
      };
  
      /**
       * Returns the current panel.
       * @deprecated Since 3.0.1 Use getCurrentPanel() instead.
       */
      Dialog.prototype.getCurPanel = function () {
          return this.getPanel(this.page[this.curpage].curtab);
      };
  
      /**
       * Returns the current button panel.
       * @deprecated Since 3.0.1 Use get() instead.
       */
      Dialog.prototype.getCurPanelButton = function () {
          return this.getCurPanel().button;
      };
  
      return Dialog;
  }();
  
  exports.Dialog = Dialog = deprecate.construct(Dialog, 'Dialog constructor', {
      alternativeName: 'Dialog2'
  });
  
  exports.popup = createPopup = deprecate.construct(createPopup, 'Dialog popup constructor', {
      alternatveName: 'Dialog2'
  });
  
  (0, _globalize2.default)('Dialog', Dialog);
  (0, _globalize2.default)('popup', createPopup);
  
  exports.Dialog = Dialog;
  exports.popup = createPopup;
  
  return module.exports;
}).call(this);