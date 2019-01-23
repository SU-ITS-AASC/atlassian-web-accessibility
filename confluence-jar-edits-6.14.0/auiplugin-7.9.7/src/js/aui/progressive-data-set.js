// src/js/aui/progressive-data-set.js
(typeof window === 'undefined' ? global : window).__4f7eb6cf60845d0cd685bf4d782df3ea = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _underscore = __59c1c30030f41c99b6757d449d9a3a7b;
  
  var _underscore2 = _interopRequireDefault(_underscore);
  
  var _backbone = __320e4ec293ac29d49b959aa9d46df68f;
  
  var _backbone2 = _interopRequireDefault(_backbone);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * @fileOverview describes a ProgressiveDataSet object.
   *
   * This object serves as part of a series of components to handle the various aspects of autocomplete controls.
   */
  var ProgressiveDataSet = _backbone2.default.Collection.extend({
      /**
       * A queryable set of data that optimises the speed at which responses can be provided.
       *
       * ProgressiveDataSet should be given a matcher function so that it may filter results for queries locally.
       *
       * ProgressiveDataSet can be given a remote query endpoint to fetch data from. Should a remote endpoint
       * be provided, ProgressiveDataSet will leverage both client-side matching and query caching to reduce
       * the number of times the remote source need be queried.
       *
       * @example
       * var source = new ProgressiveDataSet([], {
       *     model: Backbone.Model.extend({ idAttribute: "username" }),
       *     queryEndpoint: "/jira/rest/latest/users",
       *     queryParamKey: "username",
       *     matcher: function(model, query) {
       *         return _.startsWith(model.get('username'), query);
       *     }
       * });
       * source.on('respond', doStuffWithMatchingResults);
       * source.query('john');
       *
       * @property {String} value the latest query for which the ProgressiveDataSet is responding to.
       * @property {Number} activeQueryCount the number of queries being run remotely.
       */
      initialize: function initialize(models, options) {
          options || (options = {});
          if (options.matcher) {
              this.matcher = options.matcher;
          }
          if (options.model) {
              this.model = options.model; // Fixed in backbone 0.9.2
          }
          this._idAttribute = new this.model().idAttribute;
          this._maxResults = options.maxResults || 5;
          this._queryData = options.queryData || {};
          this._queryParamKey = options.queryParamKey || 'q';
          this._queryEndpoint = options.queryEndpoint || '';
          this.value = null;
          this.queryCache = {};
          this.activeQueryCount = 0;
          _underscore2.default.bindAll(this, 'query', 'respond');
      },
  
      url: function url() {
          return this._queryEndpoint;
      },
  
      /**
       * Sets and runs a query against the ProgressiveDataSet.
       *
       * Bind to ProgressiveDataSet's 'respond' event to receive the results that match the latest query.
       *
       * @param {String} query the query to run.
       */
      query: function query(_query) {
          var _this = this;
  
          var remote;
          var results;
  
          this.value = _query;
          results = this.getFilteredResults(_query);
          this.respond(_query, results);
  
          if (!_query || !this._queryEndpoint || this.hasQueryCache(_query) || !this.shouldGetMoreResults(results)) {
              return;
          }
  
          remote = this.fetch(_query);
  
          this.activeQueryCount++;
          this.trigger('activity', { activity: true });
  
          remote.always(function () {
              _this.activeQueryCount--;
              _this.trigger('activity', { activity: !!_this.activeQueryCount });
          });
  
          remote.done(function (resp, succ, xhr) {
              _this.addQueryCache(_query, resp, xhr);
          });
          remote.done(function () {
              _query = _this.value;
              results = _this.getFilteredResults(_query);
              _this.respond(_query, results);
          });
      },
  
      /**
       * Gets all the data that should be sent in a remote request for data.
       * @param {String} query the value of the query to be run.
       * @return {Object} the data to to be sent to the remote when querying it.
       * @private
       */
      getQueryData: function getQueryData(query) {
          var params = _underscore2.default.isFunction(this._queryData) ? this._queryData(query) : this._queryData;
          var data = _underscore2.default.extend({}, params);
          data[this._queryParamKey] = query;
          return data;
      },
  
      /**
       * Get data from a remote source that matches the query, and add it to this ProgressiveDataSet's set.
       *
       * @param {String} query the value of the query to be run.
       * @return {jQuery.Deferred} a deferred object representing the remote request.
       */
      fetch: function fetch(query) {
          var data = this.getQueryData(query);
          // {add: true} for Backbone <= 0.9.2
          // {update: true, remove: false} for Backbone >= 0.9.9
          var params = { add: true, update: true, remove: false, data: data };
          var remote = _backbone2.default.Collection.prototype.fetch.call(this, params);
          return remote;
      },
  
      /**
       * Triggers the 'respond' event on this ProgressiveDataSet for the given query and associated results.
       *
       * @param {String} query the query that was run
       * @param {Array} results a set of results that matched the query.
       * @return {Array} the results.
       * @private
       */
      respond: function respond(query, results) {
          this.trigger('respond', {
              query: query,
              results: results
          });
          return results;
      },
  
      /**
       * A hook-point to define a function that tests whether a model matches a query or not.
       *
       * This will be called by getFilteredResults in order to generate the list of results for a query.
       *
       * (For you java folks, it's essentially a predicate.)
       *
       * @param {Backbone.Model} item a model of the data to check for a match in.
       * @param {String} query the value to test against the item.
       * @returns {Boolean} true if the model matches the query, otherwise false.
       * @function
       */
      matcher: function matcher(item, query) {}, // eslint-disable-line no-unused-vars
  
      /**
       * Filters the set of data contained by the ProgressiveDataSet down to a smaller set of results.
       *
       * The set will only consist of Models that "match" the query -- i.e., only Models where
       * a call to ProgressiveDataSet#matcher returns true.
       *
       * @param query {String} the value that results should match (according to the matcher function)
       * @return {Array} A set of Backbone Models that match the query.
       */
      getFilteredResults: function getFilteredResults(query) {
          var results = [];
          if (!query) {
              return results;
          }
          results = this.filter(function (item) {
              return !!this.matcher(item, query);
          }, this);
          if (this._maxResults) {
              results = _underscore2.default.first(results, this._maxResults);
          }
          return results;
      },
  
      /**
       * Store a response in the query cache for a given query.
       *
       * @param {String} query the value to cache a response for.
       * @param {Object} response the data of the response from the server.
       * @param {XMLHttpRequest} xhr
       * @private
       */
      addQueryCache: function addQueryCache(query, response, xhr) {
          var cache = this.queryCache;
          var results = this.parse(response, xhr);
          cache[query] = _underscore2.default.pluck(results, this._idAttribute);
      },
  
      /**
       * Check if there is a query cache entry for a given query.
       *
       * @param query the value to check in the cache
       * @return {Boolean} true if the cache contains a response for the query, false otherwise.
       */
      hasQueryCache: function hasQueryCache(query) {
          return this.queryCache.hasOwnProperty(query);
      },
  
      /**
       * Get the query cache entry for a given query.
       *
       * @param query the value to check in the cache
       * @return {Object[]} an array of values representing the IDs of the models the response for this query contained.
       */
      findQueryCache: function findQueryCache(query) {
          return this.queryCache[query];
      },
  
      /**
       *
       * @param {Array} results the set of results we know about right now.
       * @return {Boolean} true if the ProgressiveDataSet should look for more results.
       * @private
       */
      shouldGetMoreResults: function shouldGetMoreResults(results) {
          return results.length < this._maxResults;
      },
  
      /**
       *
       * @note Changing this value will trigger ProgressiveDataSet#event:respond if there is a query.
       * @param {Number} number how many results should the ProgressiveDataSet aim to retrieve for a query.
       */
      setMaxResults: function setMaxResults(number) {
          this._maxResults = number;
          this.value && this.respond(this.value, this.getFilteredResults(this.value));
      }
  });
  
  (0, _globalize2.default)('ProgressiveDataSet', ProgressiveDataSet);
  
  exports.default = ProgressiveDataSet;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);