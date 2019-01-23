// src/js/aui/restful-table/edit-row.js
(typeof window === 'undefined' ? global : window).__fa98b6b6842afadeca33f835f6fd852f = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  __a66ae57438a6301a66d32681106ab1de;
  
  var _backbone = __320e4ec293ac29d49b959aa9d46df68f;
  
  var _backbone2 = _interopRequireDefault(_backbone);
  
  var _classNames = __80eabeead1490f859f6a708858b1dc25;
  
  var _classNames2 = _interopRequireDefault(_classNames);
  
  var _dataKeys = __40ea873dae0b909ba7e1b6d5b37fd259;
  
  var _dataKeys2 = _interopRequireDefault(_dataKeys);
  
  var _events = __b912ac75391ff799576d1dfdc1dc3c70;
  
  var _events2 = _interopRequireDefault(_events);
  
  var _i18n = __fa714f1b12d7502957e4e0b6196321bf;
  
  var _i18n2 = _interopRequireDefault(_i18n);
  
  var _throbber = __09339e7cdcdecdedab4ce02aa86100f2;
  
  var _throbber2 = _interopRequireDefault(_throbber);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') !== -1;
  
  /**
   * An abstract class that gives the required behaviour for the creating and editing entries. Extend this class and pass
   * it as the {views.row} property of the options passed to RestfulTable in construction.
   */
  exports.default = _backbone2.default.View.extend({
      tagName: 'tr',
  
      // delegate events
      events: {
          'focusin': '_focus',
          'click': '_focus',
          'keyup': '_handleKeyUpEvent'
      },
  
      /**
       * @constructor
       * @param {Object} options
       */
      initialize: function initialize(options) {
          this.$el = (0, _jquery2.default)(this.el);
  
          // faster lookup
          this._event = _events2.default;
          this.classNames = _classNames2.default;
          this.dataKeys = _dataKeys2.default;
          this.columns = options.columns;
          this.isCreateRow = options.isCreateRow;
          this.allowReorder = options.allowReorder;
  
          // Allow cancelling an edit with support for setting a new element.
          this.events['click .' + this.classNames.CANCEL] = '_cancel';
          this.delegateEvents();
  
          if (options.isUpdateMode) {
              this.isUpdateMode = true;
          } else {
              this._modelClass = options.model;
              this.model = new this._modelClass();
          }
  
          this.fieldFocusSelector = options.fieldFocusSelector;
          this.bind(this._event.CANCEL, function () {
              this.disabled = true;
          }).bind(this._event.SAVE, function (focusUpdated) {
              if (!this.disabled) {
                  this.submit(focusUpdated);
              }
          }).bind(this._event.FOCUS, function (name) {
              this.focus(name);
          }).bind(this._event.BLUR, function () {
              this.$el.removeClass(this.classNames.FOCUSED);
              this.disable();
          }).bind(this._event.SUBMIT_STARTED, function () {
              this._submitStarted();
          }).bind(this._event.SUBMIT_FINISHED, function () {
              this._submitFinished();
          });
      },
  
      /**
       * Renders default cell contents
       *
       * @param data
       */
      defaultColumnRenderer: function defaultColumnRenderer(data) {
          if (data.allowEdit !== false) {
              return (0, _jquery2.default)("<input type='text' />").addClass('text').attr({
                  name: data.name,
                  value: data.value
              });
          } else if (data.value) {
              return document.createTextNode(data.value);
          }
      },
  
      /**
       * Renders drag handle
       * @return jQuery
       */
      renderDragHandle: function renderDragHandle() {
          return '<span class="' + this.classNames.DRAG_HANDLE + '"></span></td>';
      },
  
      /**
       * Executes cancel event if ESC is pressed
       *
       * @param {Event} e
       */
      _handleKeyUpEvent: function _handleKeyUpEvent(e) {
          if (e.keyCode === 27) {
              this.trigger(this._event.CANCEL);
          }
      },
  
      /**
       * Fires cancel event
       *
       * @param {Event} e
       *
       * @return EditRow
       */
      _cancel: function _cancel(e) {
          this.trigger(this._event.CANCEL);
          e.preventDefault();
          return this;
      },
  
      /**
       * Disables events/fields and adds safe guard against double submitting
       *
       * @return EditRow
       */
      _submitStarted: function _submitStarted() {
          this.submitting = true;
          this.showLoading().disable().delegateEvents({});
  
          return this;
      },
  
      /**
       * Enables events & fields
       *
       * @return EditRow
       */
      _submitFinished: function _submitFinished() {
          this.submitting = false;
          this.hideLoading().enable().delegateEvents(this.events);
  
          return this;
      },
  
      /**
       * Handles dom focus event, by only focusing row if it isn't already
       *
       * @param {Event} e
       *
       * @return EditRow
       */
      _focus: function _focus(e) {
          if (!this.hasFocus()) {
              this.trigger(this._event.FOCUS, e.target.name);
          }
          return this;
      },
  
      /**
       * Returns true if row has focused class
       *
       * @return Boolean
       */
      hasFocus: function hasFocus() {
          return this.$el.hasClass(this.classNames.FOCUSED);
      },
  
      /**
       * Focus specified field (by name or id - first argument), first field with an error or first field (DOM order)
       *
       * @param name
       *
       * @return EditRow
       */
      focus: function focus(name) {
          var $focus;
          var $error;
  
          this.enable();
  
          if (name) {
              $focus = this.$el.find(this.fieldFocusSelector(name));
          } else {
  
              $error = this.$el.find(this.classNames.ERROR + ':first');
  
              if ($error.length === 0) {
                  $focus = this.$el.find(':input:text:first');
              } else {
                  $focus = $error.parent().find(':input');
              }
          }
  
          this.$el.addClass(this.classNames.FOCUSED);
          $focus.focus().trigger('select');
  
          return this;
      },
  
      /**
       * Disables all fields
       *
       * @return EditRow
       */
      disable: function disable() {
          var $replacementSubmit;
          var $submit;
  
          // firefox does not allow you to submit a form if there are 2 or more submit buttons in a form, even if all but
          // one is disabled. It also does not let you change the type="submit' to type="button". Therfore he lies the hack.
          if (isFirefox) {
              $submit = this.$el.find(':submit');
  
              if ($submit.length) {
                  $replacementSubmit = (0, _jquery2.default)("<input type='submit' class='" + this.classNames.SUBMIT + "' />").addClass($submit.attr('class')).val($submit.val()).data(this.dataKeys.ENABLED_SUBMIT, $submit);
  
                  $submit.replaceWith($replacementSubmit);
              }
          }
  
          this.$el.addClass(this.classNames.DISABLED).find(':submit').attr('disabled', 'disabled');
  
          return this;
      },
  
      /**
       * Enables all fields
       *
       * @return EditRow
       */
      enable: function enable() {
          var $placeholderSubmit;
          var $submit;
  
          // firefox does not allow you to submit a form if there are 2 or more submit buttons in a form, even if all but
          // one is disabled. It also does not let you change the type="submit' to type="button". Therfore he lies the hack.
          if (isFirefox) {
              $placeholderSubmit = this.$el.find(this.classNames.SUBMIT);
              $submit = $placeholderSubmit.data(this.dataKeys.ENABLED_SUBMIT);
  
              if ($submit && $placeholderSubmit.length) {
                  $placeholderSubmit.replaceWith($submit);
              }
          }
  
          this.$el.removeClass(this.classNames.DISABLED).find(':submit').removeAttr('disabled');
  
          return this;
      },
  
      /**
       * Shows loading indicator
       *
       * @return EditRow
       */
      showLoading: function showLoading() {
          this.$el.addClass(this.classNames.LOADING);
          return this;
      },
  
      /**
       * Hides loading indicator
       *
       * @return EditRow
       */
      hideLoading: function hideLoading() {
          this.$el.removeClass(this.classNames.LOADING);
          return this;
      },
  
      /**
       * If any of the fields have changed
       *
       * @return {Boolean}
       */
      hasUpdates: function hasUpdates() {
          return !!this.mapSubmitParams(this.serializeObject());
      },
  
      /**
       * Serializes the view into model representation.
       * Default implementation uses simple jQuery plugin to serialize form fields into object
       *
       * @return Object
       */
      serializeObject: function serializeObject() {
          var $el = this.$el;
          return $el.serializeObject ? $el.serializeObject() : $el.serialize();
      },
  
      mapSubmitParams: function mapSubmitParams(params) {
          return this.model.changedAttributes(params);
      },
  
      /**
       * Handle submission of new entries and editing of old.
       *
       * @param {Boolean} focusUpdated - flag of whether to focus read-only view after succssful submission
       *
       * @return EditRow
       */
      submit: function submit(focusUpdated) {
          var instance = this;
          var values;
  
          // IE doesnt like it when the focused element is removed
          if (document.activeElement !== window) {
              (0, _jquery2.default)(document.activeElement).blur();
          }
  
          if (this.isUpdateMode) {
              values = this.mapSubmitParams(this.serializeObject()); // serialize form fields into JSON
  
              if (!values) {
                  return instance.trigger(instance._event.CANCEL);
              }
          } else {
              this.model.clear();
              values = this.mapSubmitParams(this.serializeObject()); // serialize form fields into JSON
          }
  
          this.trigger(this._event.SUBMIT_STARTED);
  
          /* Attempt to add to server model. If fail delegate to createView to render errors etc. Otherwise,
           add a new model to this._models and render a row to represent it. */
          this.model.save(values, {
              success: function success() {
                  if (instance.isUpdateMode) {
                      instance.trigger(instance._event.UPDATED, instance.model, focusUpdated);
                  } else {
                      instance.trigger(instance._event.CREATED, instance.model.toJSON());
  
                      instance.model = new instance._modelClass(); // reset
  
                      instance.render({ errors: {}, values: {} }); // pulls in instance's model for create row
                      instance.trigger(instance._event.FOCUS);
                  }
  
                  instance.trigger(instance._event.SUBMIT_FINISHED);
              },
  
              error: function error(model, data, xhr) {
                  if (xhr.status === 400) {
                      instance.renderErrors(data.errors);
                      instance.trigger(instance._event.VALIDATION_ERROR, data.errors);
                  }
  
                  instance.trigger(instance._event.SUBMIT_FINISHED);
              },
  
              silent: true
          });
  
          return this;
      },
  
      /**
       * Render an error message
       *
       * @param msg
       *
       * @return {jQuery}
       */
      renderError: function renderError(name, msg) {
          return (0, _jquery2.default)('<div />').attr('data-field', name).addClass(this.classNames.ERROR).text(msg);
      },
  
      /**
       * Render and append error messages. The property name will be matched to the input name to determine which cell to
       * append the error message to. If this does not meet your needs please extend this method.
       *
       * @param errors
       */
      renderErrors: function renderErrors(errors) {
          var instance = this;
  
          this.$('.' + this.classNames.ERROR).remove(); // avoid duplicates
  
          if (errors) {
              _jquery2.default.each(errors, function (name, msg) {
                  instance.$el.find("[name='" + name + "']").closest('td').append(instance.renderError(name, msg));
              });
          }
  
          return this;
      },
  
      /**
       * Handles rendering of row
       *
       * @param {Object} renderData
       * ... {Object} vales - Values of fields
       */
      render: function render(renderData) {
          var instance = this;
  
          this.$el.empty();
  
          if (this.allowReorder) {
              (0, _jquery2.default)('<td  class="' + this.classNames.ORDER + '" />').append(this.renderDragHandle()).appendTo(instance.$el);
          }
  
          _jquery2.default.each(this.columns, function (i, column) {
              var contents;
              var $cell;
              var value = renderData.values[column.id];
              var args = [{ name: column.id, value: value, allowEdit: column.allowEdit }, renderData.values, instance.model];
  
              if (value) {
                  instance.$el.attr('data-' + column.id, value); // helper for webdriver testing
              }
  
              if (instance.isCreateRow && column.createView) {
                  // TODO AUI-1058 - The row's model should be guaranteed to be in the correct state by this point.
                  contents = new column.createView({
                      model: instance.model
                  }).render(args[0]);
              } else if (column.editView) {
                  contents = new column.editView({
                      model: instance.model
                  }).render(args[0]);
              } else {
                  contents = instance.defaultColumnRenderer.apply(instance, args);
              }
  
              $cell = (0, _jquery2.default)('<td />');
  
              if ((typeof contents === 'undefined' ? 'undefined' : _typeof(contents)) === 'object' && contents.done) {
                  contents.done(function (contents) {
                      $cell.append(contents);
                  });
              } else {
                  $cell.append(contents);
              }
  
              if (column.styleClass) {
                  $cell.addClass(column.styleClass);
              }
  
              $cell.appendTo(instance.$el);
          });
  
          this.$el.append(this.renderOperations(renderData.update, renderData.values)) // add submit/cancel buttons
          .addClass(this.classNames.ROW + ' ' + this.classNames.EDIT_ROW);
  
          this.trigger(this._event.RENDER, this.$el, renderData.values);
          this.$el.trigger(this._event.CONTENT_REFRESHED, [this.$el]);
  
          return this;
      },
  
      /**
       * Gets markup for add/update and cancel buttons
       *
       * @param {Boolean} update
       */
      renderOperations: function renderOperations(update) {
          var $operations = (0, _jquery2.default)('<td class="aui-restfultable-operations" />');
  
          if (update) {
              $operations.append((0, _jquery2.default)('<input class="aui-button" type="submit" />').attr({
                  accesskey: this.submitAccessKey,
                  value: AJS.I18n.getText('aui.words.update')
              })).append((0, _jquery2.default)('<a class="aui-button aui-button-link" href="#" />').addClass(this.classNames.CANCEL).text(AJS.I18n.getText('aui.words.cancel')).attr({
                  accesskey: this.cancelAccessKey
              }));
          } else {
              $operations.append((0, _jquery2.default)('<input class="aui-button" type="submit" />').attr({
                  accesskey: this.submitAccessKey,
                  value: AJS.I18n.getText('aui.words.add')
              }));
          }
  
          return $operations.add((0, _jquery2.default)('<td class="aui-restfultable-status" />').append((0, _throbber2.default)()));
      }
  });
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);