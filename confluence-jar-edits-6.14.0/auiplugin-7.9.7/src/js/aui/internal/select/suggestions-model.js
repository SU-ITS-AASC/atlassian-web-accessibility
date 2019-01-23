// src/js/aui/internal/select/suggestions-model.js
(typeof window === 'undefined' ? global : window).__b227fe541363e13797e40f0e86a3a5b6 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  function SuggestionsModel() {
      this._suggestions = [];
      this._activeIndex = -1;
  }
  
  SuggestionsModel.prototype = {
      onChange: function onChange() {},
  
      onHighlightChange: function onHighlightChange() {},
  
      get: function get(index) {
          return this._suggestions[index];
      },
  
      set: function set(suggestions) {
          var oldSuggestions = this._suggestions;
          this._suggestions = suggestions || [];
          this.onChange(oldSuggestions);
          return this;
      },
  
      getNumberOfResults: function getNumberOfResults() {
          return this._suggestions.length;
      },
  
      setHighlighted: function setHighlighted(toHighlight) {
          if (toHighlight) {
              for (var i = 0; i < this._suggestions.length; i++) {
                  if (this._suggestions[i].id === toHighlight.id) {
                      this.highlight(i);
                  }
              }
          }
  
          return this;
      },
  
      highlight: function highlight(index) {
          this._activeIndex = index;
          this.onHighlightChange();
          return this;
      },
  
      highlightPrevious: function highlightPrevious() {
          var current = this._activeIndex;
          var previousActiveIndex = current === 0 ? current : current - 1;
          this.highlight(previousActiveIndex);
          return this;
      },
  
      highlightNext: function highlightNext() {
          var current = this._activeIndex;
          var nextActiveIndex = current === this._suggestions.length - 1 ? current : current + 1;
          this.highlight(nextActiveIndex);
          return this;
      },
  
      highlighted: function highlighted() {
          return this.get(this._activeIndex);
      },
  
      highlightedIndex: function highlightedIndex() {
          return this._activeIndex;
      }
  };
  
  exports.default = SuggestionsModel;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);