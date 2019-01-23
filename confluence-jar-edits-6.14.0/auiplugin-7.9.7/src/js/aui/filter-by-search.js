// src/js/aui/filter-by-search.js
(typeof window === 'undefined' ? global : window).__0601db35e0320a246a2e95c4a20b98b4 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _deprecation = __921ad9514d56376fef992861d9ec0f51;
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Filters a list of entries by a passed search term.
   *
   * Options:
   * - `keywordsField` name of entry field containing keywords, default "keywords".
   * - `ignoreForCamelCase` ignore search case for camel case, e.g. CB matches Code Block *and* Code block.
   * - `matchBoundary` match words only at boundary, e.g. link matches "linking" but not "hyperlinks".
   * - `splitRegex` regex to split search words, instead of on whitespace.
   *
   * @param {Array} entries An array of objects with a "keywords" property.
   * @param {String} search One or more words to search on, which may include camel-casing.
   * @param {Object} options Specifiy to override default behaviour.
   *
   * @returns {Array}
   */
  function filterBySearch(entries, search, options) {
      // search for nothing, get nothing - up to calling code to handle.
      if (!search) {
          return [];
      }
  
      var keywordsField = options && options.keywordsField || 'keywords';
      var camelCaseFlags = options && options.ignoreForCamelCase ? 'i' : '';
      var boundaryFlag = options && options.matchBoundary ? '\\b' : '';
      var splitRegex = options && options.splitRegex || /\s+/;
  
      // each word in the input is considered a distinct filter that has to match a keyword in the record
      var filterWords = search.split(splitRegex);
      var filters = [];
  
      filterWords.forEach(function (word) {
          // anchor on word boundaries
          var subfilters = [new RegExp(boundaryFlag + word, 'i')];
  
          // split camel-case into separate words
          if (/^([A-Z][a-z]*) {2,}$/.test(this)) {
              var camelRegexStr = this.replace(/([A-Z][a-z]*)/g, '\\b$1[^,]*');
  
              subfilters.push(new RegExp(camelRegexStr, camelCaseFlags));
          }
  
          filters.push(subfilters);
      });
  
      var result = [];
  
      entries.forEach(function (entry) {
          for (var i = 0; i < filters.length; i++) {
              var somethingMatches = false;
  
              for (var j = 0; j < filters[i].length; j++) {
                  if (filters[i][j].test(entry[keywordsField])) {
                      somethingMatches = true;
                      break;
                  }
              }
  
              if (!somethingMatches) {
                  return;
              }
          }
  
          result.push(entry);
      });
  
      return result;
  }
  
  var filterBySearch = (0, _deprecation.fn)(filterBySearch, 'filterBySearch', {
      sinceVersion: '5.9.0',
      extraInfo: 'No alternative will be provided. If products require this function, this should be copied.'
  });
  
  (0, _globalize2.default)('filterBySearch', filterBySearch);
  
  exports.default = filterBySearch;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);