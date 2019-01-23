// src/js/aui/internal/select/suggestions-view.js
(typeof window === 'undefined' ? global : window).__9e2e7d5836591eb38f141c77fb1c9982 = (function () {
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
  
  __fa714f1b12d7502957e4e0b6196321bf;
  
  var _alignment = __81deba69899d0f1851f2c511b87bbbae;
  
  var _alignment2 = _interopRequireDefault(_alignment);
  
  var _layer = __3ada4a8272640e5242be87f12c7e0fdf;
  
  var _layer2 = _interopRequireDefault(_layer);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function generateListItemID(listId, index) {
      return listId + '-' + index;
  }
  
  /**
   *
   * @param view SuggestionsView
   */
  function enableAlignment(view) {
      if (view.anchor && !view.auiAlignment) {
          view.auiAlignment = new _alignment2.default(view.el, view.anchor);
      }
  
      if (view.auiAlignment) {
          view.auiAlignment.enable();
      }
  }
  
  function destroyAlignment(view) {
      if (view.auiAlignment) {
          view.auiAlignment.destroy();
      }
  }
  
  function matchWidth(view) {
      (0, _jquery2.default)(view.el).css('min-width', (0, _jquery2.default)(view.anchor).outerWidth());
  }
  
  function SuggestionsView(element, anchor) {
      this.el = element;
      this.anchor = anchor;
  }
  
  function clearActive(element) {
      (0, _jquery2.default)(element).find('.aui-select-active').removeClass('aui-select-active');
  }
  
  SuggestionsView.prototype = {
      render: function render(suggestions, currentLength, listId) {
          this.currListId = listId;
          var html = '';
  
          // Do nothing if we have no new suggestions, otherwise append anything else we find.
          if (suggestions.length) {
              var i = currentLength;
              suggestions.forEach(function (sugg) {
                  var label = sugg.getLabel();
                  var imageSrc = sugg.get('img-src');
                  var image = imageSrc ? '<img src="' + imageSrc + '"/>' : '';
                  var newValueText = sugg.get('new-value') ? ' (<em>' + AJS.I18n.getText('aui.select.new.value') + '</em>)' : '';
                  html += '<li role="option" class="aui-select-suggestion" id="' + generateListItemID(listId, i) + '">' + image + label + newValueText + '</li>';
                  i++;
              });
  
              // If the old suggestions were empty, a <li> of 'No suggestions' will be appended, we need to remove it
              if (currentLength) {
                  this.el.querySelector('ul').innerHTML += html;
              } else {
                  this.el.querySelector('ul').innerHTML = html;
              }
          } else if (!currentLength) {
              this.el.querySelector('ul').innerHTML = '<li role="option" class="aui-select-no-suggestions">' + AJS.I18n.getText('aui.select.no.suggestions') + '</li>';
          }
  
          return this;
      },
      setActive: function setActive(active) {
          clearActive(this.el);
          (0, _jquery2.default)(this.el).find('#' + generateListItemID(this.currListId, active)).addClass('aui-select-active');
      },
      getActive: function getActive() {
          return this.el.querySelector('.aui-select-active');
      },
      show: function show() {
          matchWidth(this);
          (0, _layer2.default)(this.el).show();
          enableAlignment(this);
      },
      hide: function hide() {
          clearActive(this.el);
          (0, _layer2.default)(this.el).hide();
          destroyAlignment(this);
      },
      isVisible: function isVisible() {
          return (0, _jquery2.default)(this.el).is(':visible');
      }
  };
  
  exports.default = SuggestionsView;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);