("undefined"===typeof window?global:window).__b4d73a0bb8c261fa890c4807671fd8d1=function(){function h(e){var b=i;e.find("th").each(function(c,e){var a=(0,d.default)(e);b.headers[c]={};a.hasClass("aui-table-column-unsortable")?b.headers[c].sorter=!1:(a.attr("tabindex","0"),a.wrapInner("<span class='aui-table-header-content'/>"),a.hasClass("aui-table-column-issue-key")&&(b.headers[c].sorter="issue-key"))});e.tablesorter(b)}var f={};"use strict";Object.defineProperty(f,"__esModule",{value:!0});var a=
__700a145ba3db9966cc95664c892049f8,d=a&&a.__esModule?a:{"default":a};__bcb3bf48343222097ceddcaac01ec182;var a=(a=__28c84e7bb75f6c3b0ba124d57bd69571)&&a.__esModule?a:{"default":a},i={sortMultiSortKey:"",headers:{},debug:!1,tabIndex:!1},g={setup:function(){d.default.tablesorter.addParser({id:"issue-key",is:function(){return!1},format:function(a){var b=a.split("-"),a=b[1],b=(b[0]+"..........").slice(0,10);return b+=("000000"+a).slice(-6)},type:"text"});d.default.tablesorter.addParser({id:"textSortAttributeParser",
is:function(a,b,c){return c.hasAttribute("data-sort-value")&&(!c.hasAttribute("data-sort-type")||"text"===c.getAttribute("data-sort-type"))},format:function(a,b,c){return c.getAttribute("data-sort-value")},type:"text"});d.default.tablesorter.addParser({id:"numericSortAttributeParser",is:function(a,b,c){return"numeric"===c.getAttribute("data-sort-type")&&c.hasAttribute("data-sort-value")},format:function(a,b,c){return c.getAttribute("data-sort-value")},type:"numeric"});(0,d.default)(".aui-table-sortable").each(function(){h((0,
d.default)(this))})},setTableSortable:function(a){h(a)}};(0,d.default)(g.setup);(0,a.default)("tablessortable",g);f.default=g;return f=f["default"]}.call(this);