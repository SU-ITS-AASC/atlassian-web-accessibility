// src/js/aui/select.js
(typeof window === 'undefined' ? global : window).__67239d8727b67748b2105d3faf199585 = (function () {
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
  
  __eaacbdad8b92ceca9114dc3be870abe7;
  
  __fa714f1b12d7502957e4e0b6196321bf;
  
  __7662207c0e706b4f9b15584a7f7253f9;
  
  var _option = __fe251e1f4080cfe4e163e9b243bb0491;
  
  var _option2 = _interopRequireDefault(_option);
  
  var _amdify = __65ca28a9d6b0f244027266ff8e6a6d1c;
  
  var _amdify2 = _interopRequireDefault(_amdify);
  
  var _customEvent = __f7a5e0d2ea8865b104efc9b94861591e;
  
  var _customEvent2 = _interopRequireDefault(_customEvent);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _keyCode = __e246bf93af36eb4453f35afeb1c302d9;
  
  var _keyCode2 = _interopRequireDefault(_keyCode);
  
  var _progressiveDataSet = __4f7eb6cf60845d0cd685bf4d782df3ea;
  
  var _progressiveDataSet2 = _interopRequireDefault(_progressiveDataSet);
  
  var _skate = __0ac9a2c09f995a9c0a478af8742f59b7;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  var _state = __3f2c7809aecfe899611b77461a9218ac;
  
  var _state2 = _interopRequireDefault(_state);
  
  var _suggestionModel = __3612acbfe60f9cd2a88e38733670f664;
  
  var _suggestionModel2 = _interopRequireDefault(_suggestionModel);
  
  var _suggestionsModel = __b227fe541363e13797e40f0e86a3a5b6;
  
  var _suggestionsModel2 = _interopRequireDefault(_suggestionsModel);
  
  var _suggestionsView = __9e2e7d5836591eb38f141c77fb1c9982;
  
  var _suggestionsView2 = _interopRequireDefault(_suggestionsView);
  
  var _template = __7865c6da767e205eeac86fc044ce472b;
  
  var _template2 = _interopRequireDefault(_template);
  
  var _uniqueId = __a0ab588de7b0759818853425dc8ad2f2;
  
  var _uniqueId2 = _interopRequireDefault(_uniqueId);
  
  var _constants = __584af8690b0248d0ffcba682ccaa70ba;
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var DESELECTED = -1;
  var NO_HIGHLIGHT = -1;
  var DEFAULT_SS_PDS_SIZE = 20;
  
  function clearElementImage(element) {
      element._input.removeAttribute('style');
      (0, _jquery2.default)(element._input).removeClass('aui-select-has-inline-image');
  }
  
  function deselect(element) {
      element._select.selectedIndex = DESELECTED;
      clearElementImage(element);
  }
  
  function hasResults(element) {
      return element._suggestionModel.getNumberOfResults();
  }
  
  function waitForAssistive(callback) {
      setTimeout(callback, 50);
  }
  
  function setBusyState(element) {
      if (!element._button.isBusy()) {
          element._button.busy();
          element._input.setAttribute('aria-busy', 'true');
          element._dropdown.setAttribute('aria-busy', 'true');
      }
  }
  
  function setIdleState(element) {
      element._button.idle();
      element._input.setAttribute('aria-busy', 'false');
      element._dropdown.setAttribute('aria-busy', 'false');
  }
  
  function matchPrefix(model, query) {
      var value = model.get('label').toLowerCase();
      return value.indexOf(query.toLowerCase()) === 0;
  }
  
  function hideDropdown(element) {
      element._suggestionsView.hide();
      element._input.setAttribute('aria-expanded', 'false');
  }
  
  function setInitialVisualState(element) {
      var initialHighlightedItem = hasResults(element) ? 0 : NO_HIGHLIGHT;
  
      element._suggestionModel.highlight(initialHighlightedItem);
  
      hideDropdown(element);
  }
  
  function setElementImage(element, imageSource) {
      (0, _jquery2.default)(element._input).addClass('aui-select-has-inline-image');
      element._input.setAttribute('style', 'background-image: url(' + imageSource + ')');
  }
  
  function suggest(element, autoHighlight, query) {
      element._autoHighlight = autoHighlight;
  
      if (query === undefined) {
          query = element._input.value;
      }
  
      element._progressiveDataSet.query(query);
  }
  
  function setInputImageToHighlightedSuggestion(element) {
      var imageSource = element._suggestionModel.highlighted() && element._suggestionModel.highlighted().get('img-src');
      if (imageSource) {
          setElementImage(element, imageSource);
      }
  }
  
  function setValueAndDisplayFromModel(element, model) {
      if (!model) {
          return;
      }
  
      var option = document.createElement('option');
      var select = element._select;
      var value = model.get('value') || model.get('label');
  
      option.setAttribute('selected', '');
      option.setAttribute('value', value);
      option.textContent = model.getLabel();
  
      // Sync element value.
      element._input.value = option.textContent;
  
      select.innerHTML = '';
      select.options.add(option);
      select.dispatchEvent(new _customEvent2.default('change', { bubbles: true }));
  }
  
  function clearValue(element) {
      element._input.value = '';
      element._select.innerHTML = '';
  }
  
  function selectHighlightedSuggestion(element) {
      setValueAndDisplayFromModel(element, element._suggestionModel.highlighted());
      setInputImageToHighlightedSuggestion(element);
      setInitialVisualState(element);
  }
  
  function convertOptionToModel(option) {
      return new _suggestionModel2.default(option.serialize());
  }
  
  function convertOptionsToModels(element) {
      var models = [];
  
      for (var i = 0; i < element._datalist.children.length; i++) {
          var option = element._datalist.children[i];
          models.push(convertOptionToModel(option));
      }
  
      return models;
  }
  
  function clearAndSet(element, data) {
      element._suggestionModel.set();
      element._suggestionModel.set(data.results);
  }
  
  function getActiveId(select) {
      var active = select._dropdown.querySelector('.aui-select-active');
      return active && active.id;
  }
  
  function getIndexInResults(id, results) {
      var resultsIds = _jquery2.default.map(results, function (result) {
          return result.id;
      });
  
      return resultsIds.indexOf(id);
  }
  
  function createNewValueModel(element) {
      var option = new _option2.default();
      option.setAttribute('value', element._input.value);
      var newValueSuggestionModel = convertOptionToModel(option);
      newValueSuggestionModel.set('new-value', true);
      return newValueSuggestionModel;
  }
  
  function initialiseProgressiveDataSet(element) {
      element._progressiveDataSet = new _progressiveDataSet2.default(convertOptionsToModels(element), {
          model: _suggestionModel2.default,
          matcher: matchPrefix,
          queryEndpoint: element._queryEndpoint,
          maxResults: DEFAULT_SS_PDS_SIZE
      });
  
      element._isSync = element._queryEndpoint ? false : true;
  
      // Progressive data set should indicate whether or not it is busy when processing any async requests.
      // Check if there's any active queries left, if so: set spinner and state to busy, else set to idle and remove
      // the spinner.
      element._progressiveDataSet.on('activity', function () {
          if (element._progressiveDataSet.activeQueryCount && !element._isSync) {
              setBusyState(element);
              (0, _state2.default)(element).set('should-flag-new-suggestions', false);
          } else {
              setIdleState(element);
              (0, _state2.default)(element).set('should-flag-new-suggestions', true);
          }
      });
  
      // Progressive data set doesn't do anything if the query is empty so we
      // must manually convert all data list options into models.
      //
      // Otherwise progressive data set can do everything else for us:
      // 1. Sync matching
      // 2. Async fetching and matching
      element._progressiveDataSet.on('respond', function (data) {
          var optionToHighlight;
  
          // This means that a query was made before the input was cleared and
          // we should cancel the response.
          if (data.query && !element._input.value) {
              return;
          }
  
          if ((0, _state2.default)(element).get('should-cancel-response')) {
              if (!element._progressiveDataSet.activeQueryCount) {
                  (0, _state2.default)(element).set('should-cancel-response', false);
              }
  
              return;
          }
  
          if (!data.query) {
              data.results = convertOptionsToModels(element);
          }
  
          var isInputExactMatch = getIndexInResults(element._input.value, data.results) !== -1;
          var isInputEmpty = !element._input.value;
  
          if (element.hasAttribute('can-create-values') && !isInputExactMatch && !isInputEmpty) {
              data.results.push(createNewValueModel(element));
          }
  
          if (!(0, _state2.default)(element).get('should-include-selected')) {
              var indexOfValueInResults = getIndexInResults(element.value, data.results);
  
              if (indexOfValueInResults >= 0) {
                  data.results.splice(indexOfValueInResults, 1);
              }
          }
  
          clearAndSet(element, data);
          optionToHighlight = element._suggestionModel.highlighted() || data.results[0];
  
          if (element._autoHighlight) {
              element._suggestionModel.setHighlighted(optionToHighlight);
              waitForAssistive(function () {
                  element._input.setAttribute('aria-activedescendant', getActiveId(element));
              });
          }
  
          element._input.setAttribute('aria-expanded', 'true');
  
          // If the response is async (append operation), has elements to append and has a highlighted element, we need to update the status.
          if (!element._isSync && element._suggestionsView.getActive() && (0, _state2.default)(element).get('should-flag-new-suggestions')) {
              element.querySelector('.aui-select-status').innerHTML = AJS.I18n.getText('aui.select.new.suggestions');
          }
  
          element._suggestionsView.show();
  
          if (element._autoHighlight) {
              waitForAssistive(function () {
                  element._input.setAttribute('aria-activedescendant', getActiveId(element));
              });
          }
      });
  }
  
  function associateDropdownAndTrigger(element) {
      element._dropdown.id = element._listId;
      element.querySelector('button').setAttribute('aria-controls', element._listId);
  }
  
  function bindHighlightMouseover(element) {
      (0, _jquery2.default)(element._dropdown).on('mouseover', 'li', function (e) {
          if (hasResults(element)) {
              element._suggestionModel.highlight((0, _jquery2.default)(e.target).index());
          }
      });
  }
  
  function bindSelectMousedown(element) {
      (0, _jquery2.default)(element._dropdown).on('mousedown', 'li', function (e) {
          if (hasResults(element)) {
              element._suggestionModel.highlight((0, _jquery2.default)(e.target).index());
              selectHighlightedSuggestion(element);
              element._suggestionsView.hide();
              element._input.removeAttribute('aria-activedescendant');
          } else {
              return false;
          }
      });
  }
  
  function initialiseValue(element) {
      var option = element._datalist.querySelector('aui-option[selected]');
  
      if (option) {
          setValueAndDisplayFromModel(element, convertOptionToModel(option));
      }
  }
  
  function isQueryInProgress(element) {
      return element._progressiveDataSet.activeQueryCount > 0;
  }
  
  function focusInHandler(element) {
      //if there is a selected value the single select should do an empty
      //search and return everything
      var searchValue = element.value ? '' : element._input.value;
      var isInputEmpty = element._input.value === '';
      (0, _state2.default)(element).set('should-include-selected', isInputEmpty);
      suggest(element, true, searchValue);
  }
  
  function cancelInProgressQueries(element) {
      if (isQueryInProgress(element)) {
          (0, _state2.default)(element).set('should-cancel-response', true);
      }
  }
  
  function getSelectedLabel(element) {
      if (element._select.selectedIndex >= 0) {
          return element._select.options[element._select.selectedIndex].textContent;
      }
  }
  
  function handleInvalidInputOnFocusOut(element) {
      var selectCanBeEmpty = !element.hasAttribute('no-empty-values');
      var selectionIsEmpty = !element._input.value;
      var selectionNotExact = element._input.value !== getSelectedLabel(element);
      var selectionNotValid = selectionIsEmpty || selectionNotExact;
  
      if (selectionNotValid) {
          if (selectCanBeEmpty) {
              deselect(element);
          } else {
              var selection = getSelectedLabel(element);
              if (typeof selection === 'undefined') {
                  deselect(element);
              } else {
                  element._input.value = selection;
              }
          }
      }
  }
  
  function handleHighlightOnFocusOut(element) {
      // Forget the highlighted suggestion.
      element._suggestionModel.highlight(NO_HIGHLIGHT);
  }
  
  function focusOutHandler(element) {
      cancelInProgressQueries(element);
      handleInvalidInputOnFocusOut(element);
      handleHighlightOnFocusOut(element);
      hideDropdown(element);
  }
  
  function handleTabOut(element) {
      var isSuggestionViewVisible = element._suggestionsView.isVisible();
      if (isSuggestionViewVisible) {
          selectHighlightedSuggestion(element);
      }
  }
  
  var select = (0, _skate2.default)('aui-select', {
      template: _template2.default,
      created: function created(element) {
          element._listId = (0, _uniqueId2.default)();
          element._input = element.querySelector('input');
          element._select = element.querySelector('select');
          element._dropdown = element.querySelector('.aui-popover');
          element._datalist = element.querySelector('datalist');
          element._button = element.querySelector('button');
          element._suggestionsView = new _suggestionsView2.default(element._dropdown, element._input);
          element._suggestionModel = new _suggestionsModel2.default();
  
          element._suggestionModel.onChange = function (oldSuggestions) {
              var suggestionsToAdd = [];
  
              element._suggestionModel._suggestions.forEach(function (newSuggestion) {
                  var inArray = oldSuggestions.some(function (oldSuggestion) {
                      return newSuggestion.id === oldSuggestion.id;
                  });
  
                  if (!inArray) {
                      suggestionsToAdd.push(newSuggestion);
                  }
              });
  
              element._suggestionsView.render(suggestionsToAdd, oldSuggestions.length, element._listId);
          };
  
          element._suggestionModel.onHighlightChange = function () {
              var active = element._suggestionModel.highlightedIndex();
              element._suggestionsView.setActive(active);
              element._input.setAttribute('aria-activedescendant', getActiveId(element));
          };
      },
  
      attached: function attached(element) {
          _skate2.default.init(element);
          initialiseProgressiveDataSet(element);
          associateDropdownAndTrigger(element);
          element._input.setAttribute('aria-controls', element._listId);
          element.setAttribute('tabindex', '-1');
          bindHighlightMouseover(element);
          bindSelectMousedown(element);
          initialiseValue(element);
          setInitialVisualState(element);
          setInputImageToHighlightedSuggestion(element);
      },
  
      attributes: {
          id: function id(element, data) {
              if (element.id) {
                  element.querySelector('input').id = data.newValue + _constants.INPUT_SUFFIX;
              }
          },
          name: function name(element, data) {
              element.querySelector('select').setAttribute('name', data.newValue);
          },
          placeholder: function placeholder(element, data) {
              element.querySelector('input').setAttribute('placeholder', data.newValue);
          },
          src: function src(element, data) {
              element._queryEndpoint = data.newValue;
          }
      },
  
      events: {
          'blur input': function blurInput(element) {
              focusOutHandler(element);
          },
  
          'mousedown button': function mousedownButton(element) {
              if (document.activeElement === element._input && element._dropdown.getAttribute('aria-hidden') === 'false') {
                  (0, _state2.default)(element).set('prevent-open-on-button-click', true);
              }
          },
  
          'click input': function clickInput(element) {
              focusInHandler(element);
          },
  
          'click button': function clickButton(element) {
              var data = (0, _state2.default)(element);
  
              if (data.get('prevent-open-on-button-click')) {
                  data.set('prevent-open-on-button-click', false);
              } else {
                  (0, _state2.default)(element).set('button-clicked-prevent-dropdown-hide', true);
                  element.focus();
              }
          },
  
          input: function input(element) {
              if (!element._input.value) {
                  if ((0, _state2.default)(element).get('button-clicked-prevent-dropdown-hide')) {
                      (0, _state2.default)(element).set('button-clicked-prevent-dropdown-hide', false);
                  } else {
                      hideDropdown(element);
                  }
              } else {
                  (0, _state2.default)(element).set('should-include-selected', true);
                  suggest(element, true);
              }
          },
  
          'keydown input': function keydownInput(element, e) {
              var currentValue = element._input.value;
              var handled = false;
  
              if (e.keyCode === _keyCode2.default.ESCAPE) {
                  cancelInProgressQueries(element);
                  hideDropdown(element);
                  return;
              }
  
              var isSuggestionViewVisible = element._suggestionsView.isVisible();
  
              if (isSuggestionViewVisible && hasResults(element)) {
                  if (e.keyCode === _keyCode2.default.ENTER) {
                      cancelInProgressQueries(element);
                      selectHighlightedSuggestion(element);
                      e.preventDefault();
                  } else if (e.keyCode === _keyCode2.default.TAB) {
                      handleTabOut(element);
                      handled = true;
                  } else if (e.keyCode === _keyCode2.default.UP) {
                      element._suggestionModel.highlightPrevious();
                      e.preventDefault();
                  } else if (e.keyCode === _keyCode2.default.DOWN) {
                      element._suggestionModel.highlightNext();
                      e.preventDefault();
                  }
              } else if (e.keyCode === _keyCode2.default.UP || e.keyCode === _keyCode2.default.DOWN) {
                  focusInHandler(element);
                  e.preventDefault();
              }
  
              handled = handled || e.defaultPrevented;
              setTimeout(function emulateCrossBrowserInputEvent() {
                  if (element._input.value !== currentValue && !handled) {
                      element.dispatchEvent(new _customEvent2.default('input', { bubbles: true }));
                  }
              }, 0);
          }
      },
  
      prototype: {
          get value() {
              var selected = this._select.options[this._select.selectedIndex];
              return selected ? selected.value : '';
          },
  
          set value(value) {
              if (value === '') {
                  clearValue(this);
              } else if (value) {
                  var data = this._progressiveDataSet;
                  var model = data.findWhere({
                      value: value
                  }) || data.findWhere({
                      label: value
                  });
  
                  // Create a new value if allowed and the value doesn't exist.
                  if (!model && this.hasAttribute('can-create-values')) {
                      model = new _suggestionModel2.default({ value: value, label: value });
                  }
  
                  setValueAndDisplayFromModel(this, model);
              }
              return this;
          },
  
          get displayValue() {
              return this._input.value;
          },
  
          blur: function blur() {
              this._input.blur();
              focusOutHandler(this);
              return this;
          },
  
          focus: function focus() {
              this._input.focus();
              focusInHandler(this);
              return this;
          }
      }
  });
  
  (0, _amdify2.default)('aui/select', select);
  (0, _globalize2.default)('select', select);
  exports.default = select;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);