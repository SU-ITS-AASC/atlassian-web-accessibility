// src/js/aui/restful-table/entry-model.js
(typeof window === 'undefined' ? global : window).__8050ba61a386ff790f31b0634ce1c858 = (function () {
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
  
  var _events = __f3ccb1e110c37fc6c95e5fa43d2c3f4f;
  
  var _underscore = __59c1c30030f41c99b6757d449d9a3a7b;
  
  var _underscore2 = _interopRequireDefault(_underscore);
  
  var _backbone = __320e4ec293ac29d49b959aa9d46df68f;
  
  var _backbone2 = _interopRequireDefault(_backbone);
  
  var _events2 = __b912ac75391ff799576d1dfdc1dc3c70;
  
  var _events3 = _interopRequireDefault(_events2);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * A class provided to fill some gaps with the out of the box Backbone.Model class. Most notiably the inability
   * to send ONLY modified attributes back to the server.
   */
  var EntryModel = _backbone2.default.Model.extend({
      sync: function sync(method, model, options) {
          var instance = this;
          var oldError = options.error;
  
          options.error = function (xhr) {
              instance._serverErrorHandler(xhr, this);
              if (oldError) {
                  oldError.apply(this, arguments);
              }
          };
  
          return _backbone2.default.sync.apply(_backbone2.default, arguments);
      },
  
      /**
       * Overrides default save handler to only save (send to server) attributes that have changed.
       * Also provides some default error handling.
       *
       * @override
       * @param attributes
       * @param options
       */
      save: function save(attributes, options) {
          options = options || {};
  
          var instance = this;
          var Model;
          var syncModel;
          var error = options.error; // we override, so store original
          var success = options.success;
  
          // override error handler to provide some defaults
          options.error = function (model, xhr) {
  
              var data = _jquery2.default.parseJSON(xhr.responseText || xhr.data);
  
              // call original error handler
              if (error) {
                  error.call(instance, instance, data, xhr);
              }
          };
  
          // if it is a new model, we don't have to worry about updating only changed attributes because they are all new
          if (this.isNew()) {
  
              // call super
              _backbone2.default.Model.prototype.save.call(this, attributes, options);
  
              // only go to server if something has changed
          } else if (attributes) {
              // create temporary model
              Model = EntryModel.extend({
                  url: this.url()
              });
  
              syncModel = new Model({
                  id: this.id
              });
  
              syncModel.save = _backbone2.default.Model.prototype.save;
  
              options.success = function (model, xhr) {
  
                  // update original model with saved attributes
                  instance.clear().set(model.toJSON());
  
                  // call original success handler
                  if (success) {
                      success.call(instance, instance, xhr);
                  }
              };
  
              // update temporary model with the changed attributes
              syncModel.save(attributes, options);
          }
      },
  
      /**
       * Destroys the model on the server. We need to override the default method as it does not support sending of
       * query paramaters.
       *
       * @override
       * @param options
       * ... {function} success - Server success callback
       * ... {function} error - Server error callback
       * ... {object} data
       *
       * @return EntryModel
       */
      destroy: function destroy(options) {
          options = options || {};
  
          var instance = this;
          var url = this.url();
          var data;
  
          if (options.data) {
              data = _jquery2.default.param(options.data);
          }
  
          if (data && data.length) {
              // we need to add to the url as the data param does not work for jQuery DELETE requests
              url = url + '?' + data;
          }
  
          _jquery2.default.ajax({
              url: url,
              type: 'DELETE',
              dataType: 'json',
              contentType: 'application/json',
              success: function success(data) {
                  if (instance.collection) {
                      instance.collection.remove(instance);
                  }
                  if (options.success) {
                      options.success.call(instance, data);
                  }
              },
              error: function error(xhr) {
                  instance._serverErrorHandler(xhr, this);
                  if (options.error) {
                      options.error.call(instance, xhr);
                  }
              }
          });
  
          return this;
      },
  
      /**
       * A more complex lookup for changed attributes then default backbone one.
       *
       * @param attributes
       */
      changedAttributes: function changedAttributes(attributes) {
          var changed = {};
          var current = this.toJSON();
  
          _jquery2.default.each(attributes, function (name, value) {
  
              if (!current[name]) {
                  if (typeof value === 'string') {
                      if (_jquery2.default.trim(value) !== '') {
                          changed[name] = value;
                      }
                  } else if (_jquery2.default.isArray(value)) {
                      if (value.length !== 0) {
                          changed[name] = value;
                      }
                  } else {
                      changed[name] = value;
                  }
              } else if (current[name] && current[name] !== value) {
  
                  if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
                      if (!_underscore2.default.isEqual(value, current[name])) {
                          changed[name] = value;
                      }
                  } else {
                      changed[name] = value;
                  }
              }
          });
  
          if (!_underscore2.default.isEmpty(changed)) {
              this.addExpand(changed);
              return changed;
          }
      },
  
      /**
       * Useful point to override if you always want to add an expand to your rest calls.
       *
       * @param changed attributes that have already changed
       */
      addExpand: function addExpand(changed) {},
  
      /**
       * Throws a server error event unless user input validation error (status 400)
       *
       * @param xhr
       */
      _serverErrorHandler: function _serverErrorHandler(xhr, ajaxOptions) {
          var data;
          if (xhr.status !== 400) {
              data = _jquery2.default.parseJSON(xhr.responseText || xhr.data);
              (0, _events.triggerEvtForInst)(_events3.default.SERVER_ERROR, this, [data, xhr, ajaxOptions]);
          }
      },
  
      /**
       * Fetches values, with some generic error handling
       *
       * @override
       * @param options
       */
      fetch: function fetch(options) {
          options = options || {};
  
          // clear the model, so we do not merge the old with the new
          this.clear();
  
          // call super
          _backbone2.default.Model.prototype.fetch.call(this, options);
      }
  });
  
  exports.default = EntryModel;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);