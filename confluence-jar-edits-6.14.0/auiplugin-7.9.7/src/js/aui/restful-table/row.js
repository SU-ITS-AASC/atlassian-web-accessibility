// src/js/aui/restful-table/row.js
(typeof window === 'undefined' ? global : window).__8ac1973494a53eee4a578e7b0d48a1b6 = (function () {
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
  
  var _dialog = __bc50e12d2af94e34822ae0035ae0e67f;
  
  var dialog = _interopRequireWildcard(_dialog);
  
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
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * An abstract class that gives the required behaviour for RestfulTable rows.
   * Extend this class and pass it as the {views.row} property of the options passed to RestfulTable in construction.
   */
  exports.default = _backbone2.default.View.extend({
      tagName: 'tr',
  
      events: {
          'click .aui-restfultable-editable': 'edit'
      },
  
      initialize: function initialize(options) {
          var instance = this;
  
          options = options || {};
  
          this._event = _events2.default;
          this.classNames = _classNames2.default;
          this.dataKeys = _dataKeys2.default;
          this.columns = options.columns;
          this.allowEdit = options.allowEdit;
          this.allowDelete = options.allowDelete;
  
          if (!this.events['click .aui-restfultable-editable']) {
              throw new Error('It appears you have overridden the events property. To add events you will need to use' + 'a work around. https://github.com/documentcloud/backbone/issues/244');
          }
  
          this.index = options.index || 0;
          this.deleteConfirmation = options.deleteConfirmation;
          this.allowReorder = options.allowReorder;
          this.$el = (0, _jquery2.default)(this.el);
  
          this.bind(this._event.CANCEL, function () {
              this.disabled = true;
          }).bind(this._event.FOCUS, function (field) {
              this.focus(field);
          }).bind(this._event.BLUR, function () {
              this.unfocus();
          }).bind(this._event.MODAL, function () {
              this.$el.addClass(this.classNames.ACTIVE);
          }).bind(this._event.MODELESS, function () {
              this.$el.removeClass(this.classNames.ACTIVE);
          });
      },
  
      /**
       * Renders drag handle
       *
       * @return jQuery
       */
      renderDragHandle: function renderDragHandle() {
          return '<span class="' + this.classNames.DRAG_HANDLE + '"></span></td>';
      },
  
      /**
       * Renders default cell contents
       *
       * @param data
       *
       * @return {undefiend, String}
       */
      defaultColumnRenderer: function defaultColumnRenderer(data) {
          if (data.value) {
              return document.createTextNode(data.value.toString());
          }
      },
  
      /**
       * Save changed attributes back to server and re-render
       *
       * @param attr
       *
       * @return {Row}
       */
      sync: function sync(attr) {
          var instance = this;
  
          this.model.addExpand(attr);
          this.showLoading();
          this.model.save(attr, {
              success: function success() {
                  instance.hideLoading().render();
                  instance.trigger(instance._event.UPDATED);
              },
              error: function error() {
                  instance.hideLoading();
              }
          });
  
          return this;
      },
  
      /**
       * Get model from server and re-render
       *
       * @return {Row}
       */
      refresh: function refresh(_success, _error) {
          var instance = this;
  
          this.showLoading();
          this.model.fetch({
              success: function success() {
                  instance.hideLoading().render();
                  if (_success) {
                      _success.apply(this, arguments);
                  }
              },
              error: function error() {
                  instance.hideLoading();
                  if (_error) {
                      _error.apply(this, arguments);
                  }
              }
          });
  
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
       * Adds focus class (Item has been recently updated)
       *
       * @return Row
       */
      focus: function focus() {
          (0, _jquery2.default)(this.el).addClass(this.classNames.FOCUSED);
          return this;
      },
  
      /**
       * Removes focus class
       *
       * @return Row
       */
      unfocus: function unfocus() {
          (0, _jquery2.default)(this.el).removeClass(this.classNames.FOCUSED);
          return this;
      },
  
      /**
       * Adds loading class (to show server activity)
       *
       * @return Row
       */
      showLoading: function showLoading() {
          this.$el.addClass(this.classNames.LOADING);
          return this;
      },
  
      /**
       * Hides loading class (to show server activity)
       *
       * @return Row
       */
      hideLoading: function hideLoading() {
          this.$el.removeClass(this.classNames.LOADING);
          return this;
      },
  
      /**
       * Switches row into edit mode
       *
       * @param e
       */
      edit: function edit(e) {
          var field;
          if ((0, _jquery2.default)(e.target).is('.' + this.classNames.EDITABLE)) {
              field = (0, _jquery2.default)(e.target).attr('data-field-name');
          } else {
              field = (0, _jquery2.default)(e.target).closest('.' + this.classNames.EDITABLE).attr('data-field-name');
          }
          this.trigger(this._event.ROW_EDIT, field);
          return this;
      },
  
      /**
       * Can be overriden to add custom options.
       *
       * @returns {jQuery}
       */
      renderOperations: function renderOperations() {
          var instance = this;
          if (this.allowDelete !== false) {
              return (0, _jquery2.default)("<a href='#' class='aui-button' />").addClass(this.classNames.DELETE).text(AJS.I18n.getText('aui.words.delete')).click(function (e) {
                  e.preventDefault();
                  instance.destroy();
              });
          }
      },
  
      /**
       * Removes entry from table.
       *
       * @returns {undefined}
       */
      destroy: function destroy() {
          if (this.deleteConfirmation) {
              var popup = dialog.popup(400, 200, 'delete-entity-' + this.model.get('id'));
              popup.element.html(this.deleteConfirmation(this.model.toJSON()));
              popup.show();
              popup.element.find('.cancel').click(function () {
                  popup.hide();
              });
              popup.element.find('form').submit(function (e) {
                  popup.hide();
                  this.model.destroy();
                  e.preventDefault();
              }.bind(this));
          } else {
              this.model.destroy();
          }
      },
  
      /**
       * Renders a generic edit row. You probably want to override this in a sub class.
       *
       * @return Row
       */
      render: function render() {
          var instance = this;
          var renderData = this.model.toJSON();
          var $opsCell = (0, _jquery2.default)("<td class='aui-restfultable-operations' />").append(this.renderOperations({}, renderData));
          var $throbberCell = (0, _jquery2.default)("<td class='aui-restfultable-status' />").append((0, _throbber2.default)());
  
          // restore state
          this.$el.removeClass(this.classNames.DISABLED + ' ' + this.classNames.FOCUSED + ' ' + this.classNames.LOADING + ' ' + this.classNames.EDIT_ROW).addClass(this.classNames.READ_ONLY).empty();
  
          if (this.allowReorder) {
              (0, _jquery2.default)('<td  class="' + this.classNames.ORDER + '" />').append(this.renderDragHandle()).appendTo(instance.$el);
          }
  
          this.$el.attr('data-id', this.model.id); // helper for webdriver testing
  
          _jquery2.default.each(this.columns, function (i, column) {
              var contents;
              var $cell = (0, _jquery2.default)('<td />');
              var value = renderData[column.id];
              var fieldName = column.fieldName || column.id;
              var args = [{ name: fieldName, value: value, allowEdit: column.allowEdit }, renderData, instance.model];
  
              if (value) {
                  instance.$el.attr('data-' + column.id, value); // helper for webdriver testing
              }
  
              if (column.readView) {
                  contents = new column.readView({
                      model: instance.model
                  }).render(args[0]);
              } else {
                  contents = instance.defaultColumnRenderer.apply(instance, args);
              }
  
              if (instance.allowEdit !== false && column.allowEdit !== false) {
                  var $editableRegion = (0, _jquery2.default)('<span />').addClass(instance.classNames.EDITABLE).append('<span class="aui-icon aui-icon-small aui-iconfont-edit"></span>').append(contents).attr('data-field-name', fieldName);
  
                  $cell = (0, _jquery2.default)('<td />').append($editableRegion).appendTo(instance.$el);
  
                  if (!contents || _jquery2.default.trim(contents) == '') {
                      $cell.addClass(instance.classNames.NO_VALUE);
                      $editableRegion.html((0, _jquery2.default)('<em />').text(this.emptyText || AJS.I18n.getText('aui.enter.value')));
                  }
              } else {
                  $cell.append(contents);
              }
  
              if (column.styleClass) {
                  $cell.addClass(column.styleClass);
              }
  
              $cell.appendTo(instance.$el);
          });
  
          this.$el.append($opsCell).append($throbberCell).addClass(this.classNames.ROW + ' ' + this.classNames.READ_ONLY);
  
          this.trigger(this._event.RENDER, this.$el, renderData);
          this.$el.trigger(this._event.CONTENT_REFRESHED, [this.$el]);
  
          return this;
      }
  });
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);