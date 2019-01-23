// src/js/aui/restful-table.js
(typeof window === 'undefined' ? global : window).__9d6bbe6056be3ba99a06a04900676ca7 = (function () {
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
  
  var _log = __c1e961001275c079e48525ad3a48c8c2;
  
  var logger = _interopRequireWildcard(_log);
  
  var _backbone = __320e4ec293ac29d49b959aa9d46df68f;
  
  var _backbone2 = _interopRequireDefault(_backbone);
  
  var _classNames = __80eabeead1490f859f6a708858b1dc25;
  
  var _classNames2 = _interopRequireDefault(_classNames);
  
  var _customCreateView = __0d34270c41fe2d547efed0ce03f668c0;
  
  var _customCreateView2 = _interopRequireDefault(_customCreateView);
  
  var _customEditView = __15ac66f9a1559266d249b098cf180f35;
  
  var _customEditView2 = _interopRequireDefault(_customEditView);
  
  var _customReadView = __ce5d8a803e1fd58153b33f9bb2fe0bff;
  
  var _customReadView2 = _interopRequireDefault(_customReadView);
  
  var _dataKeys = __40ea873dae0b909ba7e1b6d5b37fd259;
  
  var _dataKeys2 = _interopRequireDefault(_dataKeys);
  
  var _editRow = __fa98b6b6842afadeca33f835f6fd852f;
  
  var _editRow2 = _interopRequireDefault(_editRow);
  
  var _entryModel = __8050ba61a386ff790f31b0634ce1c858;
  
  var _entryModel2 = _interopRequireDefault(_entryModel);
  
  var _events = __b912ac75391ff799576d1dfdc1dc3c70;
  
  var _events2 = _interopRequireDefault(_events);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _i18n = __fa714f1b12d7502957e4e0b6196321bf;
  
  var _i18n2 = _interopRequireDefault(_i18n);
  
  var _row = __8ac1973494a53eee4a578e7b0d48a1b6;
  
  var _row2 = _interopRequireDefault(_row);
  
  var _throbber = __09339e7cdcdecdedab4ce02aa86100f2;
  
  var _throbber2 = _interopRequireDefault(_throbber);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Triggers a custom event on the document object
   *
   * @param {String} name - name of event
   * @param {Array} args - args for event handler
   */
  function triggerEvt(name, args) {
      (0, _jquery2.default)(document).trigger(name, args);
  }
  
  /**
   * Some generic error handling that fires event in multiple contexts
   * - on document
   * - on Instance
   * - on document with prefixed id.
   *
   * @param evt
   * @param inst
   * @param args
   */
  function triggerEvtForInst(evt, inst, args) {
      (0, _jquery2.default)(inst).trigger(evt, args);
      triggerEvt(evt, args);
      if (inst.id) {
          triggerEvt(inst.id + '_' + evt, args);
      }
  }
  
  /**
   * A table whose entries/rows can be retrieved, added and updated via REST (CRUD).
   * It uses backbone.js to sync the table's state back to the server, avoiding page refreshes.
   *
   * @class RestfulTable
   */
  var RestfulTable = _backbone2.default.View.extend({
      /**
       * @param {!Object} options
       * ... {!Object} resources
       * ... ... {(string|function(function(Array.<Object>)))} all - URL of REST resource OR function that retrieves all entities.
       * ... ... {string} self - URL of REST resource to sync a single entities state (CRUD).
       * ... {!(selector|Element|jQuery)} el - Table element or selector of the table element to populate.
       * ... {!Array.<Object>} columns - Which properties of the entities to render. The id of a column maps to the property of an entity.
       * ... {Object} views
       * ... ... {RestfulTable.EditRow} editRow - Backbone view that renders the edit & create row. Your view MUST extend RestfulTable.EditRow.
       * ... ... {RestfulTable.Row} row - Backbone view that renders the readonly row. Your view MUST extend RestfulTable.Row.
       * ... {boolean} allowEdit - Is the table editable. If true, clicking row will switch it to edit state. Default true.
       * ... {boolean} allowDelete - Can entries be removed from the table, default true.
       * ... {boolean} allowCreate - Can new entries be added to the table, default true.
       * ... {boolean} allowReorder - Can we drag rows to reorder them, default false.
       * ... {boolean} autoFocus - Automatically set focus to first field on init, default false.
       * ... {boolean} reverseOrder - Reverse the order of rows, default false.
       * ... {boolean} silent - Do not trigger a "refresh" event on sort, default false.
       * ... {String} id - The id for the table. This id will be used to fire events specific to this instance.
       * ... {string} createPosition - If set to "bottom", place the create form at the bottom of the table instead of the top.
       * ... {string} addPosition - If set to "bottom", add new rows at the bottom of the table instead of the top. If undefined, createPosition will be used to define where to add the new row.
       * ... {string} noEntriesMsg - Text to display under the table header if it is empty, default empty.
       * ... {string} loadingMsg - Text/HTML to display while loading, default "Loading".
       * ... {string} submitAccessKey - Access key for submitting.
       * ... {string} cancelAccessKey - Access key for canceling.
       * ... {function(Object): (string|function(number, string): string)} deleteConfirmation - HTML to display in popup to confirm deletion.
       * ... {function(string): (selector|jQuery|Element)} fieldFocusSelector - Element to focus on given a name.
       * ... {EntryModel} model - Backbone model representing a row, default EntryModel.
       * ... {Backbone.Collection} Collection - Backbone collection representing the entire table, default Backbone.Collection.
       */
      initialize: function initialize(options) {
          var instance = this;
  
          // combine default and user options
          instance.options = _jquery2.default.extend(true, instance._getDefaultOptions(options), options);
  
          // Prefix events for this instance with this id.
          instance.id = this.options.id;
  
          // faster lookup
          instance._event = _events2.default;
          instance.classNames = _classNames2.default;
          instance.dataKeys = _dataKeys2.default;
  
          // shortcuts to popular elements
          this.$table = (0, _jquery2.default)(options.el).addClass(this.classNames.RESTFUL_TABLE).addClass(this.classNames.ALLOW_HOVER).addClass('aui').addClass(instance.classNames.LOADING);
  
          this.$table.wrapAll("<form class='aui' action='#' />");
  
          this.$thead = (0, _jquery2.default)('<thead/>');
          this.$theadRow = (0, _jquery2.default)('<tr />').appendTo(this.$thead);
          this.$tbody = (0, _jquery2.default)('<tbody/>');
  
          if (!this.$table.length) {
              throw new Error('RestfulTable: Init failed! The table you have specified [' + this.$table.selector + '] cannot be found.');
          }
  
          if (!this.options.columns) {
              throw new Error("RestfulTable: Init failed! You haven't provided any columns to render.");
          }
  
          // Let user know the table is loading
          this.showGlobalLoading();
          this.options.columns.forEach(function (column) {
              var header = _jquery2.default.isFunction(column.header) ? column.header() : column.header;
              if (typeof header === 'undefined') {
                  logger.warn('You have not specified [header] for column [' + column.id + ']. Using id for now...');
                  header = column.id;
              }
  
              instance.$theadRow.append('<th>' + header + '</th>');
          });
  
          // columns for submit buttons and loading indicator used when editing
          instance.$theadRow.append('<th></th><th></th>');
  
          // create a new Backbone collection to represent rows (http://documentcloud.github.com/backbone/#Collection)
          this._models = this._createCollection();
  
          // shortcut to the class we use to create rows
          this._rowClass = this.options.views.row;
  
          this.editRows = []; // keep track of rows that are being edited concurrently
  
          this.$table.closest('form').submit(function (e) {
              if (instance.focusedRow) {
                  // Delegates saving of row. See EditRow.submit
                  instance.focusedRow.trigger(instance._event.SAVE);
              }
              e.preventDefault();
          });
  
          if (this.options.allowReorder) {
              // Add allowance for another cell to the <thead>
              this.$theadRow.prepend('<th />');
  
              // Allow drag and drop reordering of rows
              this.$tbody.sortable({
                  handle: '.' + this.classNames.DRAG_HANDLE,
                  helper: function helper(e, elt) {
                      var helper = (0, _jquery2.default)('<div/>').attr('class', elt.attr('class')).addClass(instance.classNames.MOVEABLE);
                      elt.children().each(function (i) {
                          var $td = (0, _jquery2.default)(this);
  
                          // .offsetWidth/.outerWidth() is broken in webkit for tables, so we do .clientWidth + borders
                          // Need to coerce the border-left-width to an in because IE - http://bugs.jquery.com/ticket/10855
                          var borderLeft = parseInt(0 + $td.css('border-left-width'), 10);
                          var borderRight = parseInt(0 + $td.css('border-right-width'), 10);
                          var width = $td[0].clientWidth + borderLeft + borderRight;
  
                          helper.append((0, _jquery2.default)('<div/>').html($td.html()).attr('class', $td.attr('class')).width(width));
                      });
  
                      helper = (0, _jquery2.default)("<div class='aui-restfultable-readonly'/>").append(helper); // Basically just to get the styles.
                      helper.css({ left: elt.offset().left }); // To align with the other table rows, since we've locked scrolling on x.
                      helper.appendTo(document.body);
  
                      return helper;
                  },
                  start: function start(event, ui) {
                      var cachedHeight = ui.helper[0].clientHeight;
                      var $this = ui.placeholder.find('td');
  
                      // Make sure that when we start dragging widths do not change
                      ui.item.addClass(instance.classNames.MOVEABLE).children().each(function (i) {
                          (0, _jquery2.default)(this).width($this.eq(i).width());
                      });
  
                      // Create a <td> to add to the placeholder <tr> to inherit CSS styles.
                      var td = '<td colspan="' + instance.getColumnCount() + '">&nbsp;</td>';
  
                      ui.placeholder.html(td).css({
                          height: cachedHeight,
                          visibility: 'visible'
                      });
  
                      // Stop hover effects etc from occuring as we move the mouse (while dragging) over other rows
                      instance.getRowFromElement(ui.item[0]).trigger(instance._event.MODAL);
                  },
                  stop: function stop(event, ui) {
                      if ((0, _jquery2.default)(ui.item[0]).is(':visible')) {
                          ui.item.removeClass(instance.classNames.MOVEABLE).children().attr('style', '');
  
                          ui.placeholder.removeClass(instance.classNames.ROW);
  
                          // Return table to a normal state
                          instance.getRowFromElement(ui.item[0]).trigger(instance._event.MODELESS);
                      }
                  },
                  update: function update(event, ui) {
                      var context = {
                          row: instance.getRowFromElement(ui.item[0]),
                          item: ui.item,
                          nextItem: ui.item.next(),
                          prevItem: ui.item.prev()
                      };
  
                      instance.move(context);
                  },
                  axis: 'y',
                  delay: 0,
                  containment: 'document',
                  cursor: 'move',
                  scroll: true,
                  zIndex: 8000
              });
  
              // Prevent text selection while reordering.
              this.$tbody.bind('selectstart mousedown', function (event) {
                  return !(0, _jquery2.default)(event.target).is('.' + instance.classNames.DRAG_HANDLE);
              });
          }
  
          if (this.options.allowCreate !== false) {
  
              // Create row responsible for adding new entries ...
              this._createRow = new this.options.views.editRow({
                  columns: this.options.columns,
                  isCreateRow: true,
                  model: this.options.model.extend({
                      url: function url() {
                          return instance.options.resources.self;
                      }
                  }),
                  cancelAccessKey: this.options.cancelAccessKey,
                  submitAccessKey: this.options.submitAccessKey,
                  allowReorder: this.options.allowReorder,
                  fieldFocusSelector: this.options.fieldFocusSelector
              }).bind(this._event.CREATED, function (values) {
                  if (instance.options.addPosition == undefined && instance.options.createPosition === 'bottom' || instance.options.addPosition === 'bottom') {
                      instance.addRow(values);
                  } else {
                      instance.addRow(values, 0);
                  }
              }).bind(this._event.VALIDATION_ERROR, function () {
                  this.trigger(instance._event.FOCUS);
              }).render({
                  errors: {},
                  values: {}
              });
  
              // ... and appends it as the first row
              this.$create = (0, _jquery2.default)('<tbody class="' + this.classNames.CREATE + '" />').append(this._createRow.el);
  
              // Manage which row has focus
              this._applyFocusCoordinator(this._createRow);
  
              // focus create row
              this._createRow.trigger(this._event.FOCUS);
          }
  
          // when a model is removed from the collection, remove it from the viewport also
          this._models.bind('remove', function (model) {
              instance.getRows().forEach(function (row) {
                  if (row.model === model) {
                      if (row.hasFocus() && instance._createRow) {
                          instance._createRow.trigger(instance._event.FOCUS);
                      }
                      instance.removeRow(row);
                  }
              });
          });
  
          this.fetchInitialResources();
      },
  
      fetchInitialResources: function fetchInitialResources() {
          var instance = this;
          if (_jquery2.default.isFunction(this.options.resources.all)) {
              this.options.resources.all(function (entries) {
                  instance.populate(entries);
              });
          } else {
              _jquery2.default.get(this.options.resources.all, function (entries) {
                  instance.populate(entries);
              });
          }
      },
  
      move: function move(context) {
  
          var instance = this;
  
          var createRequest = function createRequest(afterElement) {
              if (!afterElement.length) {
                  return {
                      position: 'First'
                  };
              } else {
                  var afterModel = instance.getRowFromElement(afterElement).model;
                  return {
                      after: afterModel.url()
                  };
              }
          };
  
          if (context.row) {
  
              var data = instance.options.reverseOrder ? createRequest(context.nextItem) : createRequest(context.prevItem);
  
              _jquery2.default.ajax({
                  url: context.row.model.url() + '/move',
                  type: 'POST',
                  dataType: 'json',
                  contentType: 'application/json',
                  data: JSON.stringify(data),
                  complete: function complete() {
                      // hides loading indicator (spinner)
                      context.row.hideLoading();
                  },
                  success: function success(xhr) {
                      triggerEvtForInst(instance._event.REORDER_SUCCESS, instance, [xhr]);
                  },
                  error: function error(xhr) {
                      var responseData = _jquery2.default.parseJSON(xhr.responseText || xhr.data);
                      triggerEvtForInst(instance._event.SERVER_ERROR, instance, [responseData, xhr, this]);
                  }
              });
  
              // shows loading indicator (spinner)
              context.row.showLoading();
          }
      },
  
      _createCollection: function _createCollection() {
          var instance = this;
  
          // create a new Backbone collection to represent rows (http://documentcloud.github.com/backbone/#Collection)
          var RowsAwareCollection = this.options.Collection.extend({
              // Force the collection to re-sort itself. You don't need to call this under normal
              // circumstances, as the set will maintain sort order as each item is added.
              sort: function sort(options) {
                  options || (options = {});
                  if (!this.comparator) {
                      throw new Error('Cannot sort a set without a comparator');
                  }
                  this.tableRows = instance.getRows();
                  this.models = this.sortBy(this.comparator, this);
                  this.tableRows = undefined;
                  if (!options.silent) {
                      this.trigger('refresh', this, options);
                  }
                  return this;
              },
              remove: function remove(models, options) {
                  this.tableRows = instance.getRows();
                  _backbone2.default.Collection.prototype.remove.apply(this, arguments);
                  this.tableRows = undefined;
                  return this;
              }
          });
  
          return new RowsAwareCollection([], {
              comparator: function comparator(row) {
                  // sort models in collection based on dom ordering
                  var index;
  
                  var currentTableRows = this && this.tableRows !== undefined ? this.tableRows : instance.getRows();
                  currentTableRows.some(function (item, i) {
                      if (item.model.id === row.id) {
                          index = i;
                          return true;
                      }
                  });
                  return index;
              }
          });
      },
  
      /**
       * Refreshes table with entries
       *
       * @param entries
       */
      populate: function populate(entries) {
          if (this.options.reverseOrder) {
              entries.reverse();
          }
  
          this.hideGlobalLoading();
          if (entries && entries.length) {
              // Empty the models collection
              this._models.reset([], { silent: true });
              // Add all the entries to collection and render them
              this.renderRows(entries);
              // show message to user if we have no entries
              if (this.isEmpty()) {
                  this.showNoEntriesMsg();
              }
          } else {
              this.showNoEntriesMsg();
          }
  
          // Ok, lets let everyone know that we are done...
          this.$table.append(this.$thead);
  
          if (this.options.createPosition === 'bottom') {
              this.$table.append(this.$tbody).append(this.$create);
          } else {
              this.$table.append(this.$create).append(this.$tbody);
          }
  
          this.$table.removeClass(this.classNames.LOADING).trigger(this._event.INITIALIZED, [this]);
  
          triggerEvtForInst(this._event.INITIALIZED, this, [this]);
  
          if (this.options.autoFocus) {
              this.$table.find(':input:text:first').focus(); // set focus to first field
          }
      },
  
      /**
       * Shows loading indicator and text
       *
       * @return {RestfulTable}
       */
      showGlobalLoading: function showGlobalLoading() {
          if (!this.$loading) {
              this.$loading = (0, _jquery2.default)('<div class="aui-restfultable-init">' + (0, _throbber2.default)() + '<span class="aui-restfultable-loading">' + this.options.loadingMsg + '</span></div>');
          }
  
          if (!this.$loading.is(':visible')) {
              this.$loading.insertAfter(this.$table);
          }
  
          return this;
      },
  
      /**
       * Hides loading indicator and text
       * @return {RestfulTable}
       */
      hideGlobalLoading: function hideGlobalLoading() {
          if (this.$loading) {
              this.$loading.remove();
          }
          return this;
      },
  
      /**
       * Adds row to collection and renders it
       *
       * @param {Object} values
       * @param {number} index
       * @return {RestfulTable}
       */
      addRow: function addRow(values, index) {
          var view;
          var model;
  
          if (!values.id) {
              throw new Error('RestfulTable.addRow: to add a row values object must contain an id. ' + 'Maybe you are not returning it from your restend point?' + 'Recieved:' + JSON.stringify(values));
          }
  
          model = new this.options.model(values);
  
          view = this._renderRow(model, index);
  
          this._models.add(model);
          this.removeNoEntriesMsg();
  
          // Let everyone know we added a row
          triggerEvtForInst(this._event.ROW_ADDED, this, [view, this]);
          return this;
      },
  
      /**
       * Provided a view, removes it from display and backbone collection
       *
       * @param row {Row} The row to remove.
       */
      removeRow: function removeRow(row) {
          this._models.remove(row.model);
          row.remove();
  
          if (this.isEmpty()) {
              this.showNoEntriesMsg();
          }
  
          // Let everyone know we removed a row
          triggerEvtForInst(this._event.ROW_REMOVED, this, [row, this]);
      },
  
      /**
       * Is there any entries in the table
       *
       * @return {Boolean}
       */
      isEmpty: function isEmpty() {
          return this._models.length === 0;
      },
  
      /**
       * Gets all models
       *
       * @return {Backbone.Collection}
       */
      getModels: function getModels() {
          return this._models;
      },
  
      /**
       * Gets table body
       *
       * @return {jQuery}
       */
      getTable: function getTable() {
          return this.$table;
      },
  
      /**
       * Gets table body
       *
       * @return {jQuery}
       */
      getTableBody: function getTableBody() {
          return this.$tbody;
      },
  
      /**
       * Gets create Row
       *
       * @return {EditRow}
       */
      getCreateRow: function getCreateRow() {
          return this._createRow;
      },
  
      /**
       * Gets the number of table columns, accounting for the number of
       * additional columns added by RestfulTable itself
       * (such as the drag handle column, buttons and actions columns)
       *
       * @return {Number}
       */
      getColumnCount: function getColumnCount() {
          var staticFieldCount = 2; // accounts for the columns allocated to submit buttons and loading indicator
          if (this.allowReorder) {
              ++staticFieldCount;
          }
          return this.options.columns.length + staticFieldCount;
      },
  
      /**
       * Get the Row that corresponds to the given <tr> element.
       *
       * @param {HTMLElement} tr
       *
       * @return {Row}
       */
      getRowFromElement: function getRowFromElement(tr) {
          return (0, _jquery2.default)(tr).data(this.dataKeys.ROW_VIEW);
      },
  
      /**
       * Shows message {options.noEntriesMsg} to the user if there are no entries
       *
       * @return {RestfulTable}
       */
      showNoEntriesMsg: function showNoEntriesMsg() {
  
          if (this.$noEntries) {
              this.$noEntries.remove();
          }
  
          this.$noEntries = (0, _jquery2.default)('<tr>').addClass(this.classNames.NO_ENTRIES).append((0, _jquery2.default)('<td>').attr('colspan', this.getColumnCount()).text(this.options.noEntriesMsg)).appendTo(this.$tbody);
  
          return this;
      },
  
      /**
       * Removes message {options.noEntriesMsg} to the user if there ARE entries
       *
       * @return {RestfulTable}
       */
      removeNoEntriesMsg: function removeNoEntriesMsg() {
          if (this.$noEntries && this._models.length > 0) {
              this.$noEntries.remove();
          }
          return this;
      },
  
      /**
       * Gets the Row from their associated <tr> elements
       *
       * @return {Array}
       */
      getRows: function getRows() {
          var instance = this;
          var views = [];
  
          this.$tbody.find('.' + this.classNames.READ_ONLY).each(function () {
              var $row = (0, _jquery2.default)(this);
              var view = $row.data(instance.dataKeys.ROW_VIEW);
  
              if (view) {
                  views.push(view);
              }
          });
  
          return views;
      },
  
      /**
       * Appends entry to end or specified index of table
       *
       * @param {EntryModel} model
       * @param index
       *
       * @return {jQuery}
       */
      _renderRow: function _renderRow(model, index) {
          var instance = this;
          var $rows = this.$tbody.find('.' + this.classNames.READ_ONLY);
          var $row;
          var view;
  
          view = new this._rowClass({
              model: model,
              columns: this.options.columns,
              allowEdit: this.options.allowEdit,
              allowDelete: this.options.allowDelete,
              allowReorder: this.options.allowReorder,
              deleteConfirmation: this.options.deleteConfirmation
          });
  
          this.removeNoEntriesMsg();
  
          view.bind(this._event.ROW_EDIT, function (field) {
              triggerEvtForInst(this._event.EDIT_ROW, {}, [this, instance]);
              instance.edit(this, field);
          });
  
          $row = view.render().$el;
  
          if (index !== -1) {
  
              if (typeof index === 'number' && $rows.length !== 0) {
                  $row.insertBefore($rows[index]);
              } else {
                  this.$tbody.append($row);
              }
          }
  
          $row.data(this.dataKeys.ROW_VIEW, view);
  
          // deactivate all rows - used in the cases, such as opening a dropdown where you do not want the table editable
          // or any interactions
          view.bind(this._event.MODAL, function () {
              instance.$table.removeClass(instance.classNames.ALLOW_HOVER);
              instance.$tbody.sortable('disable');
              instance.getRows().forEach(function (row) {
                  if (!instance.isRowBeingEdited(row)) {
                      row.delegateEvents({}); // clear all events
                  }
              });
          });
  
          // activate all rows - used in the cases, such as opening a dropdown where you do not want the table editable
          // or any interactions
          view.bind(this._event.MODELESS, function () {
              instance.$table.addClass(instance.classNames.ALLOW_HOVER);
              instance.$tbody.sortable('enable');
              instance.getRows().forEach(function (row) {
                  if (!instance.isRowBeingEdited(row)) {
                      row.delegateEvents(); // rebind all events
                  }
              });
          });
  
          // ensure that when this row is focused no other are
          this._applyFocusCoordinator(view);
  
          this.trigger(this._event.ROW_INITIALIZED, view);
  
          return view;
      },
  
      /**
       * Returns if the row is edit mode or note.
       *
       * @param {Row} row Read-only row to check if being edited.
       *
       * @return {Boolean}
       */
      isRowBeingEdited: function isRowBeingEdited(row) {
  
          var isBeingEdited = false;
  
          this.editRows.some(function (editRow) {
              if (editRow.el === row.el) {
                  isBeingEdited = true;
                  return true;
              }
          });
  
          return isBeingEdited;
      },
  
      /**
       * Ensures that when supplied view is focused no others are
       *
       * @param {Backbone.View} view
       * @return {RestfulTable}
       */
      _applyFocusCoordinator: function _applyFocusCoordinator(view) {
          var instance = this;
  
          if (!view.hasFocusBound) {
              view.hasFocusBound = true;
  
              view.bind(this._event.FOCUS, function () {
                  if (instance.focusedRow && instance.focusedRow !== view) {
                      instance.focusedRow.trigger(instance._event.BLUR);
                  }
                  instance.focusedRow = view;
                  if (view instanceof _row2.default && instance._createRow) {
                      instance._createRow.enable();
                  }
              });
          }
  
          return this;
      },
  
      /**
       * Remove specified row from collection holding rows being concurrently edited
       *
       * @param {EditRow} editView
       *
       * @return {RestfulTable}
       */
      _removeEditRow: function _removeEditRow(editView) {
          var index = _jquery2.default.inArray(editView, this.editRows);
          this.editRows.splice(index, 1);
          return this;
      },
  
      /**
       * Focuses last row still being edited or create row (if it exists)
       *
       * @return {RestfulTable}
       */
      _shiftFocusAfterEdit: function _shiftFocusAfterEdit() {
  
          if (this.editRows.length > 0) {
              this.editRows[this.editRows.length - 1].trigger(this._event.FOCUS);
          } else if (this._createRow) {
              this._createRow.trigger(this._event.FOCUS);
          }
  
          return this;
      },
  
      /**
       * Evaluate if we save row when we blur. We can only do this when there is one row being edited at a time, otherwise
       * it causes an infinite loop JRADEV-5325
       *
       * @return {boolean}
       */
      _saveEditRowOnBlur: function _saveEditRowOnBlur() {
          return this.editRows.length <= 1;
      },
  
      /**
       * Dismisses rows being edited concurrently that have no changes
       */
      dismissEditRows: function dismissEditRows() {
          this.editRows.forEach(function (editRow) {
              if (!editRow.hasUpdates()) {
                  editRow.trigger(this._event.FINISHED_EDITING);
              }
          }, this);
      },
  
      /**
       * Converts readonly row to editable view
       *
       * @param {Backbone.View} row
       * @param {String} field - field name to focus
       * @return {Backbone.View} editRow
       */
      edit: function edit(row, field) {
          var instance = this;
          var editRow = new this.options.views.editRow({
              el: row.el,
              columns: this.options.columns,
              isUpdateMode: true,
              allowReorder: this.options.allowReorder,
              fieldFocusSelector: this.options.fieldFocusSelector,
              model: row.model,
              cancelAccessKey: this.options.cancelAccessKey,
              submitAccessKey: this.options.submitAccessKey
          });
          var values = row.model.toJSON();
  
          values.update = true;
          editRow.render({
              errors: {},
              update: true,
              values: values
          }).bind(instance._event.UPDATED, function (model, focusUpdated) {
              instance._removeEditRow(this);
              this.unbind();
              row.render().delegateEvents(); // render and rebind events
              row.trigger(instance._event.UPDATED); // trigger blur fade out
              if (focusUpdated !== false) {
                  instance._shiftFocusAfterEdit();
              }
          }).bind(instance._event.VALIDATION_ERROR, function () {
              this.trigger(instance._event.FOCUS);
          }).bind(instance._event.FINISHED_EDITING, function () {
              instance._removeEditRow(this);
              row.render().delegateEvents();
              this.unbind(); // avoid any other updating, blurring, finished editing, cancel events being fired
          }).bind(instance._event.CANCEL, function () {
              instance._removeEditRow(this);
              this.unbind(); // avoid any other updating, blurring, finished editing, cancel events being fired
              row.render().delegateEvents(); // render and rebind events
              instance._shiftFocusAfterEdit();
          }).bind(instance._event.BLUR, function () {
              instance.dismissEditRows(); // dismiss edit rows that have no changes
              if (instance._saveEditRowOnBlur()) {
                  this.trigger(instance._event.SAVE, false); // save row, which if successful will call the updated event above
              }
          });
  
          // Ensure that if focus is pulled to another row, we blur the edit row
          this._applyFocusCoordinator(editRow);
  
          // focus edit row, which has the flow on effect of blurring current focused row
          editRow.trigger(instance._event.FOCUS, field);
  
          // disables form fields
          if (instance._createRow) {
              instance._createRow.disable();
          }
  
          this.editRows.push(editRow);
  
          return editRow;
      },
  
      /**
       * Renders all specified rows
       *
       * @param rows {Array<Backbone.Model>} array of objects describing Backbone.Model's to render
       * @return {RestfulTable}
       */
      renderRows: function renderRows() {
          var _this = this;
  
          var rows = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  
          var comparator = this._models.comparator;
          var els = [];
  
          this._models.comparator = undefined; // disable temporarily, assume rows are sorted
  
          var models = rows.map(function (row) {
              var model = new _this.options.model(row);
              els.push(_this._renderRow(model, -1).el);
              return model;
          });
  
          this._models.add(models, { silent: true });
          this._models.comparator = comparator;
          this.removeNoEntriesMsg();
          this.$tbody.append(els);
  
          return this;
      },
  
      /**
       * Gets default options
       *
       * @param {Object} options
       */
      _getDefaultOptions: function _getDefaultOptions(options) {
          return {
              model: options.model || _entryModel2.default,
              allowEdit: true,
              views: {
                  editRow: _editRow2.default,
                  row: _row2.default
              },
              Collection: _backbone2.default.Collection.extend({
                  url: options.resources.self,
                  model: options.model || _entryModel2.default
              }),
              allowReorder: false,
              fieldFocusSelector: function fieldFocusSelector(name) {
                  return ':input[name=' + name + '], #' + name;
              },
              loadingMsg: options.loadingMsg || AJS.I18n.getText('aui.words.loading')
          };
      }
  });
  
  RestfulTable.ClassNames = _classNames2.default;
  RestfulTable.CustomCreateView = _customCreateView2.default;
  RestfulTable.CustomEditView = _customEditView2.default;
  RestfulTable.CustomReadView = _customReadView2.default;
  RestfulTable.DataKeys = _dataKeys2.default;
  RestfulTable.EditRow = _editRow2.default;
  RestfulTable.EntryModel = _entryModel2.default;
  RestfulTable.Events = _events2.default;
  RestfulTable.Row = _row2.default;
  RestfulTable.Throbber = _throbber2.default;
  
  (0, _globalize2.default)('RestfulTable', RestfulTable);
  
  exports.default = RestfulTable;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);