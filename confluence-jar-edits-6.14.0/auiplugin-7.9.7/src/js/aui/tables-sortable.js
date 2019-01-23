// src/js/aui/tables-sortable.js
(typeof window === 'undefined' ? global : window).__b4d73a0bb8c261fa890c4807671fd8d1 = (function () {
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
  
  __bcb3bf48343222097ceddcaac01ec182;
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var DEFAULT_SORT_OPTIONS = {
      sortMultiSortKey: '',
      headers: {},
      debug: false,
      tabIndex: false
  };
  
  function sortTable($table) {
      var options = DEFAULT_SORT_OPTIONS;
      $table.find('th').each(function (index, header) {
  
          var $header = (0, _jquery2.default)(header);
          options.headers[index] = {};
          if ($header.hasClass('aui-table-column-unsortable')) {
              options.headers[index].sorter = false;
          } else {
              $header.attr('tabindex', '0');
              $header.wrapInner("<span class='aui-table-header-content'/>");
              if ($header.hasClass('aui-table-column-issue-key')) {
                  options.headers[index].sorter = 'issue-key';
              }
          }
      });
      $table.tablesorter(options);
  }
  
  var tablessortable = {
      setup: function setup() {
  
          /*
          This parser is used for issue keys in the format <PROJECT_KEY>-<ISSUE_NUMBER>, where <PROJECT_KEY> is a maximum
          10 character string with characters(A-Z). Assumes that issue number is no larger than 999,999. e.g. not more
          than a million issues.
          This pads the issue key to allow for proper string sorting so that the project key is always 10 characters and the
          issue number is always 6 digits. e.g. it appends the project key '.' until it is 10 characters long and prepends 0
          so that the issue number is 6 digits long. e.g. CONF-102 == CONF......000102. This is to allow proper string sorting.
          */
          _jquery2.default.tablesorter.addParser({
              id: 'issue-key',
              is: function is() {
                  return false;
              },
  
              format: function format(s) {
                  var keyComponents = s.split('-');
                  var projectKey = keyComponents[0];
                  var issueNumber = keyComponents[1];
  
                  var PROJECT_KEY_TEMPLATE = '..........';
                  var ISSUE_NUMBER_TEMPLATE = '000000';
                  var stringRepresentation = (projectKey + PROJECT_KEY_TEMPLATE).slice(0, PROJECT_KEY_TEMPLATE.length);
                  stringRepresentation += (ISSUE_NUMBER_TEMPLATE + issueNumber).slice(-ISSUE_NUMBER_TEMPLATE.length);
  
                  return stringRepresentation;
              },
  
              type: 'text'
          });
  
          /*
          Text parser that uses the data-sort-value attribute for sorting if it is set and data-sort-type is not set
          or set to 'text'.
          */
          _jquery2.default.tablesorter.addParser({
              id: 'textSortAttributeParser',
              is: function is(nodeValue, table, node) {
                  return node.hasAttribute('data-sort-value') && (!node.hasAttribute('data-sort-type') || node.getAttribute('data-sort-type') === 'text');
              },
              format: function format(nodeValue, table, node, offset) {
                  return node.getAttribute('data-sort-value');
              },
              type: 'text'
          });
  
          /*
          Numeric parser that uses the data-sort-value attribute for sorting if it is set and data-sort-type is set
          to 'numeric'.
          */
          _jquery2.default.tablesorter.addParser({
              id: 'numericSortAttributeParser',
              is: function is(nodeValue, table, node) {
                  return node.getAttribute('data-sort-type') === 'numeric' && node.hasAttribute('data-sort-value');
              },
              format: function format(nodeValue, table, node, offset) {
                  return node.getAttribute('data-sort-value');
              },
              type: 'numeric'
          });
  
          (0, _jquery2.default)('.aui-table-sortable').each(function () {
              sortTable((0, _jquery2.default)(this));
          });
      },
  
      setTableSortable: function setTableSortable($table) {
          sortTable($table);
      }
  };
  
  (0, _jquery2.default)(tablessortable.setup);
  
  (0, _globalize2.default)('tablessortable', tablessortable);
  
  exports.default = tablessortable;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);