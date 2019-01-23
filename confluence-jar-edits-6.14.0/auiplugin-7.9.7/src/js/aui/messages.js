// src/js/aui/messages.js
(typeof window === 'undefined' ? global : window).__4416794d9d63726eadee43839f3abf71 = (function () {
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
  
  var _deprecation = __921ad9514d56376fef992861d9ec0f51;
  
  var deprecate = _interopRequireWildcard(_deprecation);
  
  var _log = __c1e961001275c079e48525ad3a48c8c2;
  
  var logger = _interopRequireWildcard(_log);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _keyCode = __e246bf93af36eb4453f35afeb1c302d9;
  
  var _keyCode2 = _interopRequireDefault(_keyCode);
  
  var _skate = __0ac9a2c09f995a9c0a478af8742f59b7;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  var _template = __43d4585c6a21591b4ceac1b326c09405;
  
  var _template2 = _interopRequireDefault(_template);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var DEFAULT_FADEOUT_DURATION = 500;
  var DEFAULT_FADEOUT_DELAY = 5000;
  var FADEOUT_RESTORE_DURATION = 100;
  
  var MESSAGE_TEMPLATE = '<div class="aui-message aui-message-{type} {closeable} {shadowed} {fadeout}">' + '<p class="title">' + '<strong>{title}</strong>' + '</p>' + '{body}<!-- .aui-message -->' + '</div>';
  var MESSAGE_WITHOUT_TITLE_TEMPLATE = '<div class="aui-message aui-message-{type} {closeable} {shadowed} {fadeout}">' + '{body}<!-- .aui-message -->' + '</div>';
  
  function createMessageConstructor(type) {
      /**
       *
       * @param context
       * @param {Object} obj - message configuration
       * @param {String} [obj.id] - ID to add to the message.
       * @param {String} [obj.title] - Plain-text title of the message. If provided, will appear above the message body.
       * @param {String} obj.body - Content of the message. Can be HTML content.
       * @param {boolean} [obj.closeable] - If true, the message can be manually closed by the end-user via the UI.
       * @param {boolean} [obj.shadowed]
       * @param {boolean} [obj.fadeout]
       * @param {boolean} [obj.duration]
       * @param {boolean} [obj.delay]
       * @returns {*|HTMLElement}
       */
      messages[type] = function (context, obj) {
          if (!obj) {
              obj = context;
              context = '#aui-message-bar';
          }
  
          // Set up our template options
          obj.closeable = obj.closeable !== null && obj.closeable !== false;
  
          // shadowed no longer does anything but left in so it doesn't break
          obj.shadowed = obj.shadowed !== null && obj.shadowed !== false;
  
          var title = (obj.title || '').toString().trim();
          var $message = renderMessageElement(title ? this.template : this.templateAlt, obj, type);
          insertMessageIntoContext($message, obj.insert, context);
  
          // Attach the optional extra behaviours
          if (obj.closeable) {
              makeCloseable($message);
          }
  
          if (obj.fadeout) {
              makeFadeout($message, obj.delay, obj.duration);
          }
  
          return $message;
      };
  }
  
  function makeCloseable(message) {
      (0, _jquery2.default)(message || 'div.aui-message.closeable').each(function () {
          var $this = (0, _jquery2.default)(this);
          var $closeIcons = $this.find('.aui-icon.icon-close');
          var $icon = $closeIcons.length > 0 ? $closeIcons.first() : (0, _jquery2.default)('<span class="aui-icon icon-close" role="button" tabindex="0"></span>');
  
          $this.addClass('closeable');
          $this.append($icon);
  
          initCloseMessageBoxOnClickAndKeypress($this);
      });
  }
  
  function makeFadeout(message, delay, duration) {
      delay = typeof delay !== 'undefined' ? delay : DEFAULT_FADEOUT_DELAY;
      duration = typeof duration !== 'undefined' ? duration : DEFAULT_FADEOUT_DURATION;
  
      (0, _jquery2.default)(message || 'div.aui-message.fadeout').each(function () {
          var $this = (0, _jquery2.default)(this);
  
          //Store the component state to avoid collisions between animations
          var hasFocus = false;
          var isHover = false;
  
          //Small functions to keep the code easier to read and avoid code duplication
          function fadeOut() {
              //Algorithm:
              //1. Stop all running animations (first arg), including any fade animation and delay
              //   Do not jump to the end of the animation (second arg). This prevents the message to abruptly
              //   jump to opacity:0 or opacity:1
              //2. Wait <delay> ms before starting the fadeout
              //3. Start the fadeout with a duration of <duration> ms
              //4. Close the message at the end of the animation
              $this.stop(true, false).delay(delay).fadeOut(duration, function () {
                  $this.closeMessage();
              });
          }
          function resetFadeOut() {
              //Algorithm:
              //1. Stop all running animations (first arg), including any fade animation and delay
              //   Do not jump to the end of the animation (second arg). This prevents the message to abruptly
              //   jump to opacity:0 or opacity:1
              //2. Fast animation to opacity:1
              $this.stop(true, false).fadeTo(FADEOUT_RESTORE_DURATION, 1);
          }
          function shouldStartFadeOut() {
              return !hasFocus && !isHover;
          }
  
          //Attach handlers for user interactions (focus and hover)
          $this.focusin(function () {
              hasFocus = true;
              resetFadeOut();
          }).focusout(function () {
              hasFocus = false;
              if (shouldStartFadeOut()) {
                  fadeOut();
              }
          }).hover(function () {
              //should be called .hoverin(), but jQuery does not implement that method
              isHover = true;
              resetFadeOut();
          }, function () {
              //should be called .hoverout(), but jQuery does not implement that method
              isHover = false;
              if (shouldStartFadeOut()) {
                  fadeOut();
              }
          });
  
          //Initial animation
          fadeOut();
      });
  }
  
  /**
   * Utility methods to display different message types to the user.
   * Usage:
   * <pre>
   * messages.info("#container", {
       *   title: "Info",
       *   body: "You can choose to have messages without Close functionality.",
       *   closeable: false,
       *   shadowed: false
       * });
   * </pre>
   */
  var messages = {
      setup: function setup() {
          makeCloseable();
          makeFadeout();
      },
      makeCloseable: makeCloseable,
      makeFadeout: makeFadeout,
      template: MESSAGE_TEMPLATE,
      templateAlt: MESSAGE_WITHOUT_TITLE_TEMPLATE,
      createMessage: createMessageConstructor
  };
  
  function initCloseMessageBoxOnClickAndKeypress($message) {
      $message.on('click', '.aui-icon.icon-close', function (e) {
          (0, _jquery2.default)(e.target).closest('.aui-message').closeMessage();
      }).on('keydown', '.aui-icon.icon-close', function (e) {
          if (e.which === _keyCode2.default.ENTER || e.which === _keyCode2.default.SPACE) {
              (0, _jquery2.default)(e.target).closest('.aui-message').closeMessage();
              e.preventDefault(); // this is especially important when handling the space bar, as we don't want to page down
          }
      });
  }
  
  function insertMessageIntoContext($message, insertWhere, context) {
      if (insertWhere === 'prepend') {
          $message.prependTo(context);
      } else {
          $message.appendTo(context);
      }
  }
  
  function renderMessageElement(templateString, options, type) {
      // Append the message using template
      var $message = (0, _jquery2.default)((0, _template2.default)(templateString).fill({
          type: type,
          closeable: options.closeable ? 'closeable' : '',
          shadowed: options.shadowed ? 'shadowed' : '',
          fadeout: options.fadeout ? 'fadeout' : '',
          title: options.title || '',
          'body:html': options.body || ''
      }).toString());
  
      // Add ID if supplied
      if (options.id) {
          if (/[#\'\"\.\s]/g.test(options.id)) {
              // reject IDs that don't comply with style guide (ie. they'll break stuff)
              logger.warn('Messages error: ID rejected, must not include spaces, hashes, dots or quotes.');
          } else {
              $message.attr('id', options.id);
          }
      }
  
      return $message;
  }
  
  _jquery2.default.fn.closeMessage = function () {
      var $message = (0, _jquery2.default)(this);
      if ($message.hasClass('aui-message') && $message.hasClass('closeable')) {
          $message.stop(true); //Stop any running animation
          $message.trigger('messageClose', [this]).remove(); //messageClose event Deprecated as of 5.3
          (0, _jquery2.default)(document).trigger('aui-message-close', [this]); //must trigger on document since the element has been removed
      }
  };
  
  createMessageConstructor('generic'); //Deprecated Oct 2017
  createMessageConstructor('error');
  createMessageConstructor('warning');
  createMessageConstructor('info');
  createMessageConstructor('success');
  createMessageConstructor('hint'); //Deprecated Oct 2017
  
  (0, _skate2.default)('aui-message', {
      created: function created(element) {
          var body = element.innerHTML;
          var type = element.getAttribute('type') || 'info';
  
          element.innerHTML = '';
          messages[type](element, {
              body: body,
              closeable: element.getAttribute('closeable'),
              delay: element.getAttribute('delay'),
              duration: element.getAttribute('duration'),
              fadeout: element.getAttribute('fadeout'),
              title: element.getAttribute('title')
          });
      }
  });
  
  (0, _jquery2.default)(function () {
      messages.setup();
  });
  
  deprecate.prop(messages, 'makeCloseable', {
      extraInfo: 'Use the "closeable" option in the constructor instead. Docs: https://docs.atlassian.com/aui/latest/docs/messages.html'
  });
  
  deprecate.prop(messages, 'createMessage', {
      extraInfo: 'Use the provided convenience methods instead e.g. messages.info(). Docs: https://docs.atlassian.com/aui/latest/docs/messages.html'
  });
  
  deprecate.prop(messages, 'makeFadeout', {
      extraInfo: 'Use the "fadeout" option in the constructor instead. Docs: https://docs.atlassian.com/aui/latest/docs/messages.html'
  });
  
  deprecate.prop(messages, 'generic', {
      extraInfo: 'use the messages.info() method instead. Docs: https://docs.atlassian.com/aui/latest/docs/messages.html'
  });
  
  deprecate.prop(messages, 'hint', {
      extraInfo: 'use the messages.info() method instead. Docs: https://docs.atlassian.com/aui/latest/docs/messages.html'
  });
  
  // Exporting
  // ---------
  (0, _globalize2.default)('messages', messages);
  
  exports.default = messages;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);