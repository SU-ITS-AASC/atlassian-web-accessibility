define("confluence-editor/tinymce3/plugins/searchreplace/searchreplace",["jquery","tinymce","confluence/api/browser","confluence-editor/tinymce3/plugins/searchreplace/search-ms-edge","confluence/editor-notifications"],function(j,d,w,u,s){var v=w(window.navigator.userAgent),q=function(a){var b=null,c=null,h=null,j=null,l=null,o=function(d,m){m.content=m.content.replace(/<mark data-searching class="find-current">/g,"");m.content=m.content.replace(/<\/mark>/g,"")};return{initialised:!1,find:function(d,
m,a){var i=b.getFindInput().val();(d=h.findText(i,!0,d))&&m?m():!d&&a&&a()},replace:function(d,a){var c=b.getFindInput(),i=b.getReplaceInput(),p="";i&&(p=i.val());(c=h.replaceText(c.val(),p,!0))&&d?d():!c&&a&&a()},replaceAll:function(d,a){var c=b.getFindInput(),i=b.getReplaceInput(),p="";i&&(p=i.val());(c=h.replaceAll(c.val(),p))&&d?d():!c&&a&&a()},focus:function(){b.focusFindTextBox()},isVisible:function(){return null!=b},init:function(){b=q.UI(a,j,l);c=new q.MarkManager;c.addListener(b);h=null;
h=d.isIE?new q.implIE(b):new q.impl(b,c);d.activeEditor.undoManager.onAdd.add(o)},onVisible:function(d){if(null!=d&&0<d.length){var a=b.getFindInput(),c=a.val();a.val(c+d)}b.onVisible()},onHide:function(){j=b.getFindInput().val();l=b.getReplaceInput().val();h.destroy();h=null;b.destroy();b=null;c.destroy();c=null;d.activeEditor.undoManager.onAdd.remove(o)},_clearSavedValues:function(){l=j=null}}};q.utils={moveCursorToEnd:function(a){if(d.isIE)a=a.createTextRange(),a.execCommand("SelectAll"),a.move("textedit"),
a.select();else if(d.isGecko){var b=j(a).val().length;a.setSelectionRange(b,b)}},createTextRange:function(d,b){return d.selection?d.selection.createRange():b.getBody().createTextRange()}};q.impl=function(a,b){var c=new d.html.Writer,h=b,j=-1,l=function(a,b,i){function c(){h.markCurrentlySelectedRange();return!0}function k(){h.removeCurrentMark(!0);d.activeEditor.selection.isCollapsed()||d.activeEditor.selection.collapse();return!1}if(!a)return!1;var e=d.activeEditor,g=e.selection,f=e.getWin();h.isCursorAtCurrentMark()&&
(g=h.selectCurrentMark());g.isCollapsed()||g.collapse(i);if(d.isGecko)return f.find(a,!1,i)?c():b?(g.select(e.getBody(),!1),g.collapse(!i),l(a,!1,i)):k();if(v.isMSEdge()){if(a=u.search(g,a,j,e.getBody(),i),j=a[1],a[0])return c()}else return f.find(a,!1,i,!0,!1,!1,!1)?c():k()},o=function(a){var b=d.activeEditor;c.text(a);b.selection.setContent(c.getContent(),{format:"raw"});c.reset();b.selection.collapse(!0)},n={};n.findText=l;n.replaceText=function(a,b,i){if(!h.hasCurrentMark())return l(a,i);(b=h.replaceCurrentMark(b))&&
d.activeEditor.selection.select(b);return l(a,i)};n.replaceAll=function(a,b){var i=d.activeEditor,c=i.selection,k=i.getWin();h.removeCurrentMark(!1);i.execCommand("selectAll");i.selection.collapse(!0);var e=0;if(v.isMSEdge())for(k=-1;;)if(k=u.search(c,a,k,i.getBody(),!1),k[0])k=k[1],o(b),e++;else break;else for(;k.find(a,!1,!1,!1,!1,!1,!1);)o(b),e++;i.undoManager.add();0===e?s.notify("info",i.getLang("searchreplace_dlg.notfound")):1===e?s.notify("success",i.getLang("searchreplace_dlg.allreplacedsingular")):
1<e&&(i=i.getLang("searchreplace_dlg.allreplacedplural"),s.notify("success",i.replace("{0}",e)));return e};n.destroy=function(){c=h=null};return n};q.implIE=function(a){var b={},c=a,h=null,t=new d.html.Writer,l=q.utils.createTextRange,o=function(a,p,k){if(!a)return!1;var e=d.activeEditor,g=e.getDoc(),f=b.storedRange=b.storedRange||g.body.createTextRange();e.focus();h&&h.select();e.selection.collapse(!k);m();k&&h&&(g=g.body.createTextRange(),g.moveToElementText(j("p:first",e.getBody())[0]),f.setEndPoint("StartToStart",
g),g=h.text,g.length&&(g=g.replace(/s+$/,""),g.length&&f.moveEnd("character",-g.length)),g=f.text.length,f.moveEnd("word",-1),f.text.length>=g&&f.moveEnd("character",-1),f.select(),f.collapse(!1));h=null;if(f.findText(a,k?-1:1,0))return f.scrollIntoView(),a=f,a.pasteHTML('<mark data-searching class="find-current">'+a.htmlText+"</mark>"),c.marked(),p=d.activeEditor,p.onChange.add(n),p.onBeforeSetContent.add(n),f=a,f.select(),h=f,!0;if(p)return e.selection.select(d.activeEditor.getBody(),!0),e.selection.collapse(!k),
o(a,!1,k);b.storedRange=null},n=function(){m()},m=function(){var a=d.activeEditor;a.onChange.remove(n);a.onBeforeSetContent.remove(n);var a=d.activeEditor,b=j("mark",a.getDoc());if(b.length){var k=!1,e=a.selection.getRng(!0).commonAncestorContainer;j(e).closest("mark").length&&(k=!0);b.each(function(a,f){var e=j(f);e.contents().each(function(a,f){e.before(f)})}).remove();k&&a.execCommand("RemoveFormat")}c.markRemoved()},r=function(){m()};b.findText=o;b.replaceText=function(a,b,c){var e=d.activeEditor;
if(h){var g=e.getDoc().createTextNode(b),f=j("mark",e.getDoc());f.parent()[0].replaceChild(g,f[0]);e.undoManager.add();f=e.getDoc().createElement("mark");f.setAttribute("class","current");f.dataset.searching=!0;g.parentNode.insertBefore(f,g);f.appendChild(e.getDoc().createTextNode(b));f.parentNode.removeChild(g)}return o(a,c)};b.replaceAll=function(a,b){var c=d.activeEditor,e=c.selection;c.getWin();var g=c.undoManager,f=c.getDoc();m();e.select(c.getBody(),!1);e.collapse(!0);c.focus();f=l(f,c);for(e=
0;f.findText(a,1,0);)f.scrollIntoView(),f.select(),t.text(b),c.selection.setContent(t.getContent(),{format:"raw"}),t.reset(),e++,f.moveStart("character",b.length);g.add();0===e?s.notify("info",c.getLang("searchreplace_dlg.notfound")):1===e?s.notify("success",c.getLang("searchreplace_dlg.allreplacedsingular")):1<e&&(c=c.getLang("searchreplace_dlg.allreplacedplural"),s.notify("success",c.replace("{0}",e)));return e};b.destroy=function(){d.activeEditor.onBeforeGetContent.remove(r);m();t=h=c=null};d.activeEditor.onBeforeGetContent.add(r);
return b};q.UI=function(a,b,c){var h=null,t=q.utils.moveCursorToEnd;d.activeEditor&&(d.activeEditor.plugins&&d.activeEditor.plugins.customtoolbar)&&(h=d.activeEditor.plugins.customtoolbar.getToolbarRow(a));var l=function(){var a=j(".toolbar-find-input",h);return!a.length?null:a},o=function(){var a=j(".toolbar-replace-input",h);return!a.length?null:a},n=function(a){a?(d.activeEditor.plugins.customtoolbar.enableToolbarButton("search-toolbar-find-next-button"),d.activeEditor.plugins.customtoolbar.enableToolbarButton("search-toolbar-find-previous-button")):
(d.activeEditor.plugins.customtoolbar.disableToolbarButton("search-toolbar-find-next-button"),d.activeEditor.plugins.customtoolbar.disableToolbarButton("search-toolbar-find-previous-button"))},m=function(a){var d=l(),f;f=j(".search-toolbar-find-next-button",h).closest(".aui-button");f=f.length?f:null;f.toggleClass("default-action",a&&0<d.val().length)},r=function(a){var b=d.activeEditor.plugins.customtoolbar;a?b.enableToolbarButton("search-toolbar-replace-button"):b.disableToolbarButton("search-toolbar-replace-button")},
i=function(a){var b=d.activeEditor.plugins.customtoolbar;a?b.enableToolbarButton("search-toolbar-replaceall-button"):b.disableToolbarButton("search-toolbar-replaceall-button")},a={};a.getFindInput=l;a.getReplaceInput=o;a.focusFindTextBox=function(){top.focus();l().focus()};a.onVisible=function(){var a=l();a.focus();0<a.val().length&&(t(a[0]),n(!0),i(!0))};a.destroy=function(){};a.marked=function(){r(!0)};a.markRemoved=function(){r(!1)};var p=l(),k=!1;b&&b.length&&(p.val(b),k=!0);c&&c.length&&o().val(c);
b=function(a,b){a&&(d.isIE9?a[0].attachEvent("onpropertychange",b):a.bind(d.isIE8?"propertychange":"input",b))};c=l();b(c,function(a){if(a.type==="input"||a.type==="propertychange"){a=l();a=a!=null&&a.val().length>0;n(a);m(a)}});b(c,function(){var a=l();i(a&&a.val())});j(h).focusin(function(){m(true)}).focusout(function(){m(false)});c.focus(function(){m(true)});n(k);i(k);r(!1);return a};q.MarkManager=function(){var a=null,b=new d.html.Writer,c=null,h=[],q=function(){n()},l=function(){if(!a)return null;
var f=d.activeEditor;f.selection.select(a[0]);return f.selection},o=function(f){e();if(m(a,f)||c&&d.activeEditor.selection.getRng(!0).toString()===c)c=a=null,j.each(h,function(a,f){f.markRemoved()})},n=function(){e();j("mark",d.activeEditor.getDoc()).each(function(a,b){m(j(b),!1)});c=a=null;j.each(h,function(a,b){b.markRemoved()})},m=function(a,b){var c=d.activeEditor.selection.getRng(!0);if(!a)return!1;var e=a[0];if(c.intersectsNode)c=c.intersectsNode(e);else{var h=d.activeEditor.getDoc().createRange();
h.selectNodeContents(e);c=0>=c.compareBoundaryPoints(Range.START_TO_END,h)||0<=c.compareBoundaryPoints(Range.END_TO_START,h)?!1:!0}var g=null,i=null;a.contents().each(function(b,c){a.before(c);g||(g=c);i=c});if(c||b)c=d.activeEditor.selection.getRng(!0),c.setStartBefore(g),c.setEndAfter(i),b||c.collapse(!1),d.activeEditor.selection.setRng(c);a.remove();return!0},r=function(){if(a)return!0;if(c)return d.activeEditor.selection.getRng(!0).toString()===c},i=function(){n()},p=function(){e();j.each(h,function(a,
b){b.markRemoved()})},k=function(a){var b=d.activeEditor;b.onChange.add(q);b.onBeforeSetContent.add(q);a&&(b.onClick.add(p),b.onDblClick.add(p))},e=function(){var a=d.activeEditor;a.onChange.remove(q);a.onBeforeSetContent.remove(q);a.onClick.remove(p);a.onDblClick.remove(p)},g={markCurrentlySelectedRange:function(){var b=d.activeEditor;if(a){var e=b.selection.getBookmark();o(!1);b.selection.moveToBookmark(e)}c=null;e=b.selection.getRng(!0);a=j('<mark data-searching class="find-current"></mark>',b.getDoc());
try{e.surroundContents(a[0]),k(!1)}catch(g){1===g.code&&(c=e.toString(),a=null,k(!0))}j.each(h,function(a,b){b.marked()});c||l().collapse()}};g.removeCurrentMark=o;g.removeAllMarks=n;g.selectCurrentMark=l;g.isCursorAtCurrentMark=function(){if(!a)return!1;var b=d.activeEditor.selection;b.isCollapsed()||b.collapse();var c=b.getRng(!0);return 3===c.startContainer.nodeType?(c.startContainer.parentNode.normalize(),c.startContainer.nextSibling===a[0]||c.startContainer.previousSibling===a[0]):1===c.startContainer.nodeType&&
(b=c.startContainer.childNodes,c=c.startOffset,0<c&&b[c-1]===a[0]||c+1<b.length&&b[c+1===a[0]])?!0:!1};g.hasCurrentMark=r;g.replaceCurrentMark=function(c){var e;a||!r()?e=!1:(e=d.activeEditor,b.text(c),e.selection.setContent(b.getContent(),{format:"raw"}),b.reset(),e.undoManager.add(),o(!1),e=!0);if(e||!a)return null;var g=[];a.contents().each(function(a,b){g.push(b)});o(!1);e=d.activeEditor;for(var c=j(g[0]).before(e.getDoc().createTextNode(c))[0].previousSibling,h=g.length-1;0<=h;h--)j(g[h]).remove();
e.undoManager.add();return c};g.addListener=function(a){h.push(a)};g.destroy=function(){o(!0);d.activeEditor.onBeforeGetContent.remove(i)};d.activeEditor.onBeforeGetContent.add(i);return g};return q});require("confluence/module-exporter").exportModuleAsGlobal("confluence-editor/tinymce3/plugins/searchreplace/searchreplace","Confluence.Editor.SearchManager");