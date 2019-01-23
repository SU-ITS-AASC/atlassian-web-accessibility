// src/js/aui/expander.js
(typeof window === 'undefined' ? global : window).__0477e1bf0caf4e570768f66b495137e7 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var $document = (0, _jquery2.default)(document);
  
  //convenience function because this needs to be run for all the events.
  var getExpanderProperties = function getExpanderProperties(event) {
      var properties = {};
  
      properties.$trigger = (0, _jquery2.default)(event.currentTarget);
      properties.$content = $document.find('#' + properties.$trigger.attr('aria-controls'));
      properties.triggerIsParent = properties.$content.parent().filter(properties.$trigger).length !== 0;
      properties.$shortContent = properties.triggerIsParent ? properties.$trigger.find('.aui-expander-short-content') : null;
      properties.height = properties.$content.css('min-height');
      properties.isCollapsible = properties.$trigger.data('collapsible') !== false;
      properties.replaceText = properties.$trigger.attr('data-replace-text'); //can't use .data here because it doesn't update after the first call
      properties.replaceSelector = properties.$trigger.data('replace-selector');
  
      return properties;
  };
  
  var replaceText = function replaceText(properties) {
      if (properties.replaceText) {
          var $replaceElement = properties.replaceSelector ? properties.$trigger.find(properties.replaceSelector) : properties.$trigger;
  
          properties.$trigger.attr('data-replace-text', $replaceElement.text());
          $replaceElement.text(properties.replaceText);
      }
  };
  
  //events that the expander listens to
  var EXPANDER_EVENTS = {
      'aui-expander-invoke': function auiExpanderInvoke(event) {
          var $trigger = (0, _jquery2.default)(event.currentTarget);
          var $content = $document.find('#' + $trigger.attr('aria-controls'));
          var isCollapsible = $trigger.data('collapsible') !== false;
  
          //determine if content should be expanded or collapsed
          if ($content.attr('aria-expanded') === 'true' && isCollapsible) {
              $trigger.trigger('aui-expander-collapse');
          } else {
              $trigger.trigger('aui-expander-expand');
          }
      },
  
      'aui-expander-expand': function auiExpanderExpand(event) {
          var properties = getExpanderProperties(event);
  
          // If the expander is already expanded, do nothing.
          if (properties.$content.attr('aria-expanded') === 'true') {
              return;
          }
  
          properties.$content.attr('aria-expanded', 'true');
          properties.$trigger.attr('aria-expanded', 'true');
  
          if (properties.$content.outerHeight() > 0) {
              properties.$content.attr('aria-hidden', 'false');
          }
  
          //handle replace text
          replaceText(properties);
  
          //if the trigger is the parent also hide the short-content (default)
          if (properties.triggerIsParent) {
              properties.$shortContent.hide();
          }
          properties.$trigger.trigger('aui-expander-expanded');
      },
  
      'aui-expander-collapse': function auiExpanderCollapse(event) {
          var properties = getExpanderProperties(event);
  
          // If the expander is already collapsed, do nothing.
          if (properties.$content.attr('aria-expanded') !== 'true') {
              return;
          }
  
          //handle replace text
          replaceText(properties);
  
          //collapse the expander
          properties.$content.attr('aria-expanded', 'false');
          properties.$trigger.attr('aria-expanded', 'false');
  
          //if the trigger is the parent also hide the short-content (default)
          if (properties.triggerIsParent) {
              properties.$shortContent.show();
          }
  
          //handle the height option
          if (properties.$content.outerHeight() === 0) {
              properties.$content.attr('aria-hidden', 'true');
          }
  
          properties.$trigger.trigger('aui-expander-collapsed');
      },
  
      'click.aui-expander': function clickAuiExpander(event) {
          var $target = (0, _jquery2.default)(event.currentTarget);
          $target.trigger('aui-expander-invoke', event.currentTarget);
      }
  };
  
  //delegate events to the triggers on the page
  $document.on(EXPANDER_EVENTS, '.aui-expander-trigger');
  
  return module.exports;
}).call(this);