// src/js/aui/checkbox-multiselect.js
(typeof window === 'undefined' ? global : window).__44b5db0744691769a2b746c10f14a9a9 = (function () {
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
  
  __63997c0b88d4f299b5d69bd1c1668c63;
  
  __e8e9fc435c352b74c65e5f8d64ed692c;
  
  __fa714f1b12d7502957e4e0b6196321bf;
  
  var _amdify = __65ca28a9d6b0f244027266ff8e6a6d1c;
  
  var _amdify2 = _interopRequireDefault(_amdify);
  
  var _skate = __0ac9a2c09f995a9c0a478af8742f59b7;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  var _uniqueId = __a0ab588de7b0759818853425dc8ad2f2;
  
  var _uniqueId2 = _interopRequireDefault(_uniqueId);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var templates = {
      dropdown: function dropdown(items) {
          function createSection() {
              return (0, _jquery2.default)('<div class="aui-dropdown2-section">');
          }
  
          // clear items section
          var $clearItemsSection = createSection();
  
          (0, _jquery2.default)('<button />').attr({
              type: 'button',
              'data-aui-checkbox-multiselect-clear': '',
              class: 'aui-button aui-button-link'
          }).text(AJS.I18n.getText('aui.checkboxmultiselect.clear.selected')).appendTo($clearItemsSection);
  
          // list of items
          var $section = createSection();
          var $itemList = (0, _jquery2.default)('<ul />').appendTo($section);
  
          _jquery2.default.each(items, function (idx, item) {
              var $li = (0, _jquery2.default)('<li />').attr({
                  class: item.styleClass || ''
              }).appendTo($itemList);
  
              var $a = (0, _jquery2.default)('<a />').text(item.label).attr('data-value', item.value).addClass('aui-dropdown2-checkbox aui-dropdown2-interactive').appendTo($li);
  
              if (item.icon) {
                  (0, _jquery2.default)('<span />').addClass('aui-icon').css('backgroundImage', 'url(' + item.icon + ')")').appendTo($a);
              }
  
              if (item.selected) {
                  $a.addClass('aui-dropdown2-checked');
              }
          });
  
          return (0, _jquery2.default)('<div />').append($clearItemsSection).append($section).html();
      },
  
      furniture: function furniture(name, optionsHtml) {
          var dropdownId = name + '-dropdown';
  
          var $select = (0, _jquery2.default)('<select />').attr({
              name: name,
              multiple: 'multiple'
          }).html(optionsHtml);
  
          var $dropdown = (0, _jquery2.default)('<div>').attr({
              id: dropdownId,
              class: 'aui-checkbox-multiselect-dropdown aui-dropdown2 aui-style-default'
          });
  
          var $button = (0, _jquery2.default)('<button />').attr({
              class: 'aui-checkbox-multiselect-btn aui-button aui-dropdown2-trigger',
              type: 'button',
              'aria-owns': dropdownId,
              'aria-haspopup': true
          });
  
          return (0, _jquery2.default)('<div />').append($select).append($button).append($dropdown).html();
      }
  };
  
  /**
   * Handles when user clicks an item in the dropdown list. Either selects or unselects the corresponding
   * option in the <select>.
   * @private
   */
  function handleDropdownSelection(e) {
      var $a = (0, _jquery2.default)(e.target);
      var value = $a.attr('data-value');
      updateOption(this, value, $a.hasClass('aui-dropdown2-checked'));
  }
  
  /**
   * Selects or unselects the <option> corresponding the given value.
   * @private
   * @param component - Checkbox MultiSelect web component
   * @param value - value of option to update
   * @param {Boolean} selected - select or unselect it.
   */
  function updateOption(component, value, selected) {
      var $toUpdate = component.$select.find('option').filter(function () {
          var $this = (0, _jquery2.default)(this);
          return $this.attr('value') === value && $this.prop('selected') !== selected;
      });
      if ($toUpdate.length) {
          $toUpdate.prop('selected', selected);
          component.$select.trigger('change');
      }
  }
  
  /**
   * Enables 'clear all' button if there are any selected <option>s, otherwise disables it.
   * @private
   */
  function updateClearAll(component) {
      component.$dropdown.find('[data-aui-checkbox-multiselect-clear]').prop('disabled', function () {
          return getSelectedDescriptors(component).length < 1;
      });
  }
  
  /**
   * Gets button title used for tipsy. Is blank when dropdown is open so we don't get tipsy hanging over options.
   * @private
   * @param component
   * @returns {string}
   */
  function getButtonTitle(component) {
      return component.$dropdown.is('[aria-hidden=false]') ? '' : getSelectedLabels(component).join(', ');
  }
  
  /**
   * Converts a jQuery collection of <option> elements into an object that describes them.
   * @param {jQuery} $options
   * @returns {Array<Object>}
   * @private
   */
  function mapOptionDescriptors($options) {
      return $options.map(function () {
          var $option = (0, _jquery2.default)(this);
          return {
              value: $option.val(),
              label: $option.text(),
              icon: $option.data('icon'),
              styleClass: $option.data('styleClass'),
              title: $option.attr('title'),
              disabled: $option.attr('disabled'),
              selected: $option.prop('selected')
          };
      });
  }
  
  /**
   * Gets label for when nothing is selected
   * @returns {string}
   * @private
   */
  function getImplicitAllLabel(component) {
      return (0, _jquery2.default)(component).data('allLabel') || 'All';
  }
  
  /**
   * Renders dropdown with list of items representing the selected or unselect state of the <option>s in <select>
   * @private
   */
  function renderDropdown(component) {
      component.$dropdown.html(templates.dropdown(getDescriptors(component)));
      updateClearAll(component);
  }
  
  /**
   * Renders button with the selected <option>'s innerText in a comma seperated list. If nothing is selected 'All'
   * is displayed.
   * @private
   */
  function renderButton(component) {
      var selectedLabels = getSelectedLabels(component);
      var label = isImplicitAll(component) ? getImplicitAllLabel(component) : selectedLabels.join(', ');
      component.$btn.text(label);
  }
  
  /**
   * Gets descriptor for selected options, the descriptor is an object that contains meta information about
   * the option, such as value, label, icon etc.
   * @private
   * @returns Array<Object>
   */
  function getDescriptors(component) {
      return mapOptionDescriptors(component.getOptions());
  }
  
  /**
   * Gets descriptor for selected options, the descriptor is an object that contains meta information about
   * the option, such as value, label, icon etc.
   * @private
   * @returns Array<Object>
   */
  function getSelectedDescriptors(component) {
      return mapOptionDescriptors(component.getSelectedOptions());
  }
  
  /**
   * Gets the innerText of the selected options
   * @private
   * @returns Array<String>
   */
  function getSelectedLabels(component) {
      return _jquery2.default.map(getSelectedDescriptors(component), function (descriptor) {
          return descriptor.label;
      });
  }
  
  /**
   * If nothing is selected, we take this to mean that everything is selected.
   * @returns Boolean
   */
  function isImplicitAll(component) {
      return getSelectedDescriptors(component).length === 0;
  }
  
  var checkboxMultiselect = (0, _skate2.default)('aui-checkbox-multiselect', {
      attached: function attached(component) {
          // This used to be template logic, however, it breaks tests if we
          // keep it there after starting to use native custom elements. This
          // should be refactored.
          //
          // Ideally we should be templating the element within the "template"
          // hook which will ensure it's templated prior to calling the
          // "attached" callback.
          var name = component.getAttribute('name') || (0, _uniqueId2.default)('aui-checkbox-multiselect-');
          component.innerHTML = templates.furniture(name, component.innerHTML);
  
          component.$select = (0, _jquery2.default)('select', component).change(function () {
              renderButton(component);
              updateClearAll(component);
          });
  
          component.$dropdown = (0, _jquery2.default)('.aui-checkbox-multiselect-dropdown', component).on('aui-dropdown2-item-check', handleDropdownSelection.bind(component)).on('aui-dropdown2-item-uncheck', handleDropdownSelection.bind(component)).on('click', 'button[data-aui-checkbox-multiselect-clear]', component.deselectAllOptions.bind(component));
  
          component.$btn = (0, _jquery2.default)('.aui-checkbox-multiselect-btn', component).tooltip({
              title: function title() {
                  return getButtonTitle(component);
              }
          });
  
          renderButton(component);
          renderDropdown(component);
      },
      prototype: {
  
          /**
           * Gets all options regardless of selected or unselected
           * @returns {jQuery}
           */
          getOptions: function getOptions() {
              return this.$select.find('option');
          },
  
          /**
           * Gets all selected options
           * @returns {jQuery}
           */
          getSelectedOptions: function getSelectedOptions() {
              return this.$select.find('option:selected');
          },
  
          /**
           * Sets <option> elements matching given value to selected
           */
          selectOption: function selectOption(value) {
              updateOption(this, value, true);
          },
  
          /**
           * Sets <option> elements matching given value to unselected
           */
          unselectOption: function unselectOption(value) {
              updateOption(this, value, false);
          },
  
          /**
           * Gets value of <select>
           * @returns Array
           */
          getValue: function getValue() {
              return this.$select.val();
          },
  
          /**
           * Unchecks all items in the dropdown and in the <select>
           */
          deselectAllOptions: function deselectAllOptions() {
              this.$select.val([]).trigger('change');
              this.$dropdown.find('.aui-dropdown2-checked,.checked').removeClass('aui-dropdown2-checked checked');
          },
  
          /**
           * Adds an option to the <select>
           * @param descriptor
           */
          addOption: function addOption(descriptor) {
              (0, _jquery2.default)('<option />').attr({
                  value: descriptor.value,
                  icon: descriptor.icon,
                  disabled: descriptor.disabled,
                  selected: descriptor.selected,
                  title: descriptor.title
              }).text(descriptor.label).appendTo(this.$select);
              renderButton(this);
              renderDropdown(this);
          },
  
          /**
           * Removes options matching value from <select>
           * @param value
           */
          removeOption: function removeOption(value) {
              this.$select.find("[value='" + value + "']").remove();
              renderButton(this);
              renderDropdown(this);
          }
      }
  });
  
  (0, _amdify2.default)('aui/checkbox-multiselect');
  exports.default = checkboxMultiselect;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);