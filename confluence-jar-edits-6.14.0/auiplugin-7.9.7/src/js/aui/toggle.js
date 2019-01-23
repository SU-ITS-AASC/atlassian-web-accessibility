// src/js/aui/toggle.js
(typeof window === 'undefined' ? global : window).__07a2f092bc69049991d58167c8791201 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  __7662207c0e706b4f9b15584a7f7253f9;
  
  __e8e9fc435c352b74c65e5f8d64ed692c;
  
  var _attributes = __ab489eda548cad099ce93b60faa6a3d5;
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _enforcer = __2512e2cfb8f46670d5cb777690a28c72;
  
  var _enforcer2 = _interopRequireDefault(_enforcer);
  
  var _keyCode = __e246bf93af36eb4453f35afeb1c302d9;
  
  var _keyCode2 = _interopRequireDefault(_keyCode);
  
  var _skatejsTemplateHtml = __c6b5725916d210b9653318d2ea2472cb;
  
  var _skatejsTemplateHtml2 = _interopRequireDefault(_skatejsTemplateHtml);
  
  var _skate = __0ac9a2c09f995a9c0a478af8742f59b7;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  var _constants = __584af8690b0248d0ffcba682ccaa70ba;
  
  var _customEvent = __f7a5e0d2ea8865b104efc9b94861591e;
  
  var _customEvent2 = _interopRequireDefault(_customEvent);
  
  var _spinner = __6c1bd26c14066cf537a86a0966c2d4fc;
  
  var _spinner2 = _interopRequireDefault(_spinner);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function fireChangeEvent(element) {
      if (element._canFireEventsNow) {
          element.dispatchEvent(new _customEvent2.default('change', { bubbles: true }));
      }
  }
  
  function getInput(element) {
      return element._input || (element._input = element.querySelector('input'));
  }
  
  function removedAttributeHandler(attributeName, element) {
      getInput(element).removeAttribute(attributeName);
  }
  
  function fallbackAttributeHandler(attributeName, element, change) {
      getInput(element).setAttribute(attributeName, change.newValue);
  }
  
  function getAttributeHandler(attributeName) {
      return {
          removed: removedAttributeHandler.bind(this, attributeName),
          fallback: fallbackAttributeHandler.bind(this, attributeName)
      };
  }
  
  var formAttributeHandler = {
      removed: function removed(element) {
          removedAttributeHandler.call(this, 'form', element);
          element._formId = null;
      },
      fallback: function fallback(element, change) {
          fallbackAttributeHandler.call(this, 'form', element, change);
          element._formId = change.newValue;
      }
  };
  
  var idAttributeHandler = {
      removed: removedAttributeHandler.bind(undefined, 'id'),
      fallback: function fallback(element, change) {
          getInput(element).setAttribute('id', '' + change.newValue + _constants.INPUT_SUFFIX);
      }
  };
  
  var checkedAttributeHandler = {
      removed: function removed(element) {
          getInput(element).checked = false;
          fireChangeEvent(element);
      },
      fallback: function fallback(element) {
          getInput(element).checked = true;
          fireChangeEvent(element);
      }
  };
  
  var labelHandler = {
      removed: function removed(element) {
          getInput(element).removeAttribute('aria-label');
      },
      fallback: function fallback(element, change) {
          getInput(element).setAttribute('aria-label', change.newValue);
      }
  };
  
  function clickHandler(element, e) {
      if (!element.disabled && !element.busy && e.target !== element._input) {
          element._input.checked = !element._input.checked;
      }
  
      (0, _attributes.setBooleanAttribute)(element, 'checked', getInput(element).checked);
  }
  
  function setDisabledForLabels(element, disabled) {
      if (!element.id) {
          return;
      }
      Array.prototype.forEach.call(document.querySelectorAll('aui-label[for="' + element.id + '"]'), function (el) {
          el.disabled = disabled;
      });
  }
  
  /**
   * Workaround to prevent pressing SPACE on busy state.
   * Preventing click event still makes the toggle flip and revert back.
   * So on CSS side, the input has "pointer-events: none" on busy state.
   */
  function bindEventsToInput(element) {
      element._input.addEventListener('keydown', function (e) {
          if (element.busy && e.keyCode === _keyCode2.default.SPACE) {
              e.preventDefault();
          }
      });
      // prevent toggle can be trigger through SPACE key on Firefox
      if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
          element._input.addEventListener('click', function (e) {
              if (element.busy) {
                  e.preventDefault();
              }
          });
      }
  }
  
  (0, _skate2.default)('aui-toggle', {
      // "assistive" class avoids direct interaction with the <input> element
      // (which prevents our click handler from being called),
      // while allow the element to still participate in the form.
      template: (0, _skatejsTemplateHtml2.default)('<input type="checkbox" class="aui-toggle-input assistive">', '<span class="aui-toggle-view">', '<span class="aui-toggle-tick aui-icon aui-icon-small aui-iconfont-success"></span>', '<span class="aui-toggle-cross aui-icon aui-icon-small aui-iconfont-close-dialog"></span>', '</span>'),
      created: function created(element) {
          element._input = getInput(element); // avoid using _input in attribute handlers
          element._tick = element.querySelector('.aui-toggle-tick');
          element._cross = element.querySelector('.aui-toggle-cross');
          element._spinner = new _spinner2.default();
          element._spinner.setAttribute('size', _spinner.SIZE.SMALL.name);
  
          (0, _jquery2.default)(element._input).tooltip({
              title: function title() {
                  return this.checked ? this.getAttribute('tooltip-on') : this.getAttribute('tooltip-off');
              },
              gravity: 's',
              hoverable: false
          });
          bindEventsToInput(element);
          if (element.hasAttribute('checked')) {
              getInput(element).setAttribute('checked', '');
          }
          element._canFireEventsNow = true;
      },
      attached: function attached(element) {
          (0, _enforcer2.default)(element).attributeExists('label');
      },
      events: {
          click: clickHandler
      },
      attributes: {
          id: idAttributeHandler,
          checked: checkedAttributeHandler,
          disabled: getAttributeHandler('disabled'),
          form: formAttributeHandler,
          name: getAttributeHandler('name'),
          value: getAttributeHandler('value'),
          'tooltip-on': {
              value: AJS.I18n.getText('aui.toggle.on'),
              fallback: function fallback(element, change) {
                  getInput(element).setAttribute('tooltip-on', change.newValue || AJS.I18n.getText('aui.toggle.on'));
              }
          },
          'tooltip-off': {
              value: AJS.I18n.getText('aui.toggle.off'),
              fallback: function fallback(element, change) {
                  getInput(element).setAttribute('tooltip-off', change.newValue || AJS.I18n.getText('aui.toggle.off'));
              }
          },
          label: labelHandler
      },
      prototype: {
          focus: function focus() {
              this._input.focus();
              return this;
          },
          get checked() {
              return this._input.checked;
          },
          set checked(value) {
              // Need to explicitly set the property on the checkbox because the
              // checkbox's property doesn't change with it's attribute after it
              // is clicked.
              if (this._input.checked !== value) {
                  this._input.checked = value;
                  (0, _attributes.setBooleanAttribute)(this, 'checked', value);
              }
          },
          get disabled() {
              return this._input.disabled;
          },
          set disabled(value) {
              return (0, _attributes.setBooleanAttribute)(this, 'disabled', value);
          },
          get form() {
              return document.getElementById(this._formId);
          },
          set form(value) {
              formAttributeHandler.fallback.call(this, this, { newValue: value || null });
              return this.form;
          },
          get name() {
              return this._input.name;
          },
          set name(value) {
              this.setAttribute('name', value);
              return value;
          },
          get value() {
              return this._input.value;
          },
          set value(value) {
              // Setting the value of an input to null sets it to empty string.
              this.setAttribute('value', value === null ? '' : value);
              return value;
          },
          get busy() {
              return this._input.getAttribute('aria-busy') === 'true';
          },
          set busy(value) {
              (0, _attributes.setBooleanAttribute)(this, 'busy', value);
              if (value) {
                  this._input.setAttribute('aria-busy', 'true');
                  this._input.indeterminate = true;
                  if (this.checked) {
                      (0, _jquery2.default)(this._input).addClass('indeterminate-checked');
                      (0, _jquery2.default)(this._tick).append(this._spinner);
                  } else {
                      (0, _jquery2.default)(this._cross).append(this._spinner);
                  }
              } else {
                  (0, _jquery2.default)(this._input).removeClass('indeterminate-checked');
                  this._input.indeterminate = false;
                  this._input.removeAttribute('aria-busy');
                  if (this._spinner.parentNode) {
                      this._spinner.parentNode.removeChild(this._spinner);
                  }
              }
              setDisabledForLabels(this, !!value);
              return value;
          }
      }
  });
  
  return module.exports;
}).call(this);