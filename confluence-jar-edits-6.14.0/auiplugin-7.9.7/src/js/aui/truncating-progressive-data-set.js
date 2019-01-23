// src/js/aui/truncating-progressive-data-set.js
(typeof window === 'undefined' ? global : window).__b7e5361a4558fb1fdb441a3762d29b73 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _progressiveDataSet = __4f7eb6cf60845d0cd685bf4d782df3ea;
  
  var _progressiveDataSet2 = _interopRequireDefault(_progressiveDataSet);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var TruncatingProgressiveDataSet = _progressiveDataSet2.default.extend({
      /**
       * This is a subclass of ProgressiveDataSet. It differs from the superclass
       * in that it works on large data sets where the server truncates results.
       *
       * Rather than determining whether to request more information based on its cache,
       * it uses the size of the response.
       *
       * @example
       * var source = new TruncatingProgressiveDataSet([], {
       *     model: Backbone.Model.extend({ idAttribute: "username" }),
       *     queryEndpoint: "/jira/rest/latest/users",
       *     queryParamKey: "username",
       *     matcher: function(model, query) {
       *         return _.startsWith(model.get('username'), query);
       *     },
       *     maxResponseSize: 20
       * });
       * source.on('respond', doStuffWithMatchingResults);
       * source.query('john');
       */
      initialize: function initialize(models, options) {
          this._maxResponseSize = options.maxResponseSize;
          _progressiveDataSet2.default.prototype.initialize.call(this, models, options);
      },
  
      shouldGetMoreResults: function shouldGetMoreResults(results) {
          var response = this.findQueryResponse(this.value);
          return !response || response.length === this._maxResponseSize;
      },
  
      /**
       * Returns the response for the given query.
       *
       * The default implementation assumes that the endpoint's search algorithm is a prefix
       * matcher.
       *
       * @param query the value to find existing responses
       * @return {Object[]} an array of values representing the IDs of the models provided by the response for the given query.
       * Null is returned if no response is found.
       */
      findQueryResponse: function findQueryResponse(query) {
          while (query) {
              var response = this.findQueryCache(query);
  
              if (response) {
                  return response;
              }
  
              query = query.substr(0, query.length - 1);
          }
  
          return null;
      }
  });
  
  (0, _globalize2.default)('TruncatingProgressiveDataSet', TruncatingProgressiveDataSet);
  
  exports.default = TruncatingProgressiveDataSet;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);