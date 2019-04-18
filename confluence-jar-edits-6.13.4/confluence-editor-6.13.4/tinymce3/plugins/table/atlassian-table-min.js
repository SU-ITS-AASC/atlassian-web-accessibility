define("confluence-editor/tinymce3/plugins/table/atlassian-table",["jquery","ajs","tinymce"],function(g,h,l){function p(){return g("#table-highlight-group").attr("data-highlight-colour")||""}function q(d){var j,g,a;j=0;for(g=d.length;j<g;j++)a=d.eq(j),a.attr("data-highlight-colour")&&a.removeAttr("data-highlight-colour"),a.attr("title")&&a.removeAttr("title"),a[0].className=a[0].className.replace(/( |^)highlight(-\w+)+/g,"")}function n(d,j){if(d.length){var f=h.Rte.getEditor(),a;a=g(h.Rte.getEditor().selection.getNode());
a=a.length?a[0]===d[0]?!0:!!a.closest(d).length:!1;for(var e=d[0],k=e.ownerDocument.createElement(j),i=e.attributes,m=0,l=i.length;m<l;m++){var b=i[m];k.setAttribute(b.nodeName,b.nodeValue)}for(;e.hasChildNodes();)k.appendChild(e.firstChild);e.parentNode.replaceChild(k,e);a&&(f.selection.select(k,!0),f.selection.collapse());return g(k)}}function o(){g(h.Rte.getEditor().getDoc().body).find(".confluenceTd.numberingColumn").attr("contenteditable","false")}var i={convertToNormalCells:function(d){d.filter("th").each(function(){var d=
g(this),d=n(d,"td");d.removeClass("confluenceTh");d.addClass("confluenceTd")})},convertToHeadingCells:function(d){d.filter("td").each(function(){var d=g(this),d=n(d,"th");d.removeClass("confluenceTd");d.addClass("confluenceTh")})},areCellsHeadings:function(d){var g=d.filter("th").length;return d.length===g},isColumnHeading:function(d,j){var f=g(d).children("tbody").children("tr");return 1===f.length?!1:f.children().nthCol(j).filter("th").length===f.length},areCellsHighlighted:function(d){var g=d.filter("td[data-highlight-colour],th[data-highlight-colour]");
if(d=d.length===g.length)a:{var d=p(),f,a,e;f=0;for(a=g.length;f<a;f++)if(e=g.eq(f).attr("data-highlight-colour")||"",e!==d){d=!1;break a}d=!0}return d},isColumnHighlighted:function(d,h){var f=g(d).children("tbody").children("tr").children("th,td").nthCol(h),a=f.filter("td[data-highlight-colour],th[data-highlight-colour]").length;if(f.length!==a)return!1;for(var a=f.eq(0).attr("data-highlight-colour"),e=1,i=f.length;e<i;e++)if(a!==f.eq(e).attr("data-highlight-colour"))return!1;return!0}};h.bind("init.rte",
function(d,j){function f(){var b=e.selection.getNode();return g(b).parents("table").is(".confluenceTable")?!e.dom.getParent(b,"UL,OL"):!1}var a,e=j.editor,k=function(b){return g(b.selection.getNode()).closest("th.confluenceTh,td.confluenceTd")},n=function(b){var c=g(b.getBody()).find("th.confluenceTh.mceSelected,td.confluenceTd.mceSelected");return c.length?c:k(b)},m=function(b){return 0===b.find("tbody > tr > td").length};e.addCommand("mceInsertTable",function(){h.Rte.BookmarkManager.storeBookmark();
if(!a){a=new h.Dialog({width:400,height:230,id:"insert-table-dialog",keypressListener:function(c){27===c.keyCode&&a.hide()}});a.addHeader("Insert Table");a.addPanel("Panel 1","panel1");a.getCurrentPanel().html(h.renderTemplate("tableForm","4","3"));g("#tinymce-table-form input[type='text']").click(function(){g(this).select()});var b=function(c){c.hide();e.plugins.table.insertTable()};g("#tinymce-table-form").keypress(function(c){13===c.keyCode&&b(a)});a.addButton("Insert",b,"ok");a.addCancel("Cancel",
function(c){c.hide();return!1},"cancel")}a.show()});e.addCommand("confTableRowToggleHeading",function(){var b;b=g(this.getBody()).find("td.mceSelected,th.mceSelected");b.length||(b=g(this.selection.getNode()));b=b.closest("tr");for(var c=b.parent(),c=c.is("tbody")?b.parent().parent():c;0!==b.length&&!c.is(".confluenceTable");)b=c.closest("tr"),c=b.parent(),c=c.is("tbody")?b.parent().parent():c;var c=b.children("td,th"),d=0;i.areCellsHeadings(c)?(m(b.closest("table"))||(c=c.filter(function(){var c=
g(this),b=c.closest("table");d+=c.attr("colspan")||1;return!i.isColumnHeading(b,d)})),i.convertToNormalCells(c)):i.convertToHeadingCells(c)});e.addCommand("confTableColumnToggleHeading",function(){var b;b=n(this);var c=g([]);b.each(function(){var b=g(this),d=b.index()+1,b=b.closest("table.confluenceTable").children("tbody").children("tr");c=c.add(b.children().nthCol(d))});b=c;i.areCellsHeadings(b)?(m(b.closest("table"))||(b=b.filter(function(){var b=g(this).parent("tr").children(),c=b.filter("th");
return b.length!==c.length})),i.convertToNormalCells(b)):i.convertToHeadingCells(b)});e.addCommand("confTableSelectionToggleHighlight",function(b,c){var d=c&&c.alwaysHighlight,e=n(this);e.filter("td");e.filter("th");if(i.areCellsHighlighted(e)&&!d||g("#table-highlight-group").attr("data-remove-highlight"))q(e);else{var a=function(b){return h.Rte.getEditor().getLang(b)},f={red:a("table.cell_color_red"),grey:a("table.cell_color_grey"),green:a("table.cell_color_green"),blue:a("table.cell_color_blue"),
yellow:a("table.cell_color_yellow")};q(e);p()&&(d=p(),a=a("table.cell_background_color").replace("{0}",f[d]),e.attr("data-highlight-colour",d),e.attr("title",a),e.children().attr("title",""),e.addClass("highlight-"+d))}});(l.isIE8||h.DarkFeatures.isEnabled("confluence-table-enhancements.auto-row"))&&e.onKeyDown.add(function(b,c){function d(b,c){var a=e.selection.getRng(!0),g=a.startContainer;if(a.collapsed){var f;a:{for(f=g;f!=b;){if(f[c]){f=!1;break a}f=f.parentNode}f=!0}return 3===g.nodeType?f&&
a.startOffset==("nextSibling"==c?g.length:0):g==b?a.startOffset==("nextSibling"==c?g.childNodes.length-1:0):f}return!1}if((37===c.keyCode||39===c.keyCode)&&!c.shiftKey){var a=k(this);if(a.length){var a=a[0],f;if(f=37===c.keyCode)if(f=d(a,"previousSibling"))f=e.selection.getNode(),f=g(f).parents("table").first().find("tr:first-child").children().first()[0]!=f;if(f)return e.execCommand("mceTableMoveCaretToPrevCell"),l.dom.Event.cancel(c);if(f=39===c.keyCode){if(a=d(a,"nextSibling"))a=e.selection.getNode(),
a=g(a).parents("table").first().find("tr:last-child").children().last()[0]!=a;f=a}if(f)return e.execCommand("mceTableMoveCaretToNextCell"),l.dom.Event.cancel(c)}}});if(l.isWebKit){var o=g('<style type="text/css"></style>').html(".confluenceTable th,td { white-space: pre-wrap; }");g(e.getDoc().head).append(o)}e.onKeyDown.add(function(b,a){if(9===a.keyCode&&f())return e.execCommand(a.shiftKey?"mceTableMoveCaretToPrevCell":"mceTableMoveCaretToNextCell"),a.preventDefault(),!1});h.DarkFeatures.isEnabled("confluence-table-enhancements.auto-row")&&
(e.onClick.add(function(){var a=k(this);a.hasClass("numberingColumn")&&!a.hasClass("confluenceTh")&&e.execCommand("mceTableMoveCaretToNextCell")}),e.onKeyDown.addToTop(function(a,c){if((38===c.keyCode||40===c.keyCode)&&f()&&k(this).hasClass("numberingColumn"))return e.execCommand("mceTableMoveCaretToNextCell"),c.preventDefault(),!1}))});h.DarkFeatures.isEnabled("confluence-table-enhancements.auto-row")&&(h.bind("quickedit.success",o),h.bind("init.rte",o));return i});
require("confluence/module-exporter").exportModuleAsGlobal("confluence-editor/tinymce3/plugins/table/atlassian-table","AJS.Rte.Table");