define("confluence-editor/oninit/tinymce-cursor-fixes",["jquery","tinymce","ajs"],function(e,d,h){function l(a){if(0===e(a).closest("td").length)return!0;for(a=a.parentNode;"td"!==a.nodeName.toLowerCase();){if(e(a).prevAll().contents().filter(function(){return 3===this.nodeType}).length)return!1;a=a.parentNode}return!0}function m(a,b,g){if(b.compareEndPoints)return a=a.getBody().createTextRange(),a.moveToElementText(g),a.collapse(1),0===b.compareEndPoints("StartToStart",a)&&l(g);if(!a.selection.getSel().isCollapsed)return!1;
g=b.startContainer;if(3===g.nodeType)return!g.previousSibling&&0===b.startOffset&&l(g);if(e(g).is("p:first-child"))return 0===b.startOffset;if(e(g).is(".wysiwyg-macro-body"))return 1==b.startOffset&&3===b.startContainer.childNodes[0].nodeType&&"\n"==b.startContainer.childNodes[0].nodeValue}function k(a,b,g){if(b.compareEndPoints)return a=a.getBody().createTextRange(),a.moveToElementText(g),a.collapse(0),0===b.compareEndPoints("EndToEnd",a);if(!a.selection.getSel().isCollapsed)return!1;g=b.endContainer;
return 3===g.nodeType?g.wholeText.length==b.endOffset:e(g.childNodes[b.endOffset]).is(":last-child")}function i(a,b,g){var c=a.dom.create("p",0,d.isIE?"&nbsp;":'<br data-mce-bogus="1" />');g?b.after(c):b.before(c);a.selection.select(c,!0);a.selection.collapse()}return{insertParagraph:i,isCursorAtStart:m,isCursorAtEnd:k,bindCursorFixes:function(){var a=h.Rte.getEditor();d.isIE&&a.onKeyPress.add(function(b,a){var c=b.selection,f=c.getNode();if(13===a.keyCode&&"P"===f.nodeName&&b.dom.is(f,":first-child")&&
d.confluence.MacroUtils.isInMacro(f)){var e=b.dom.create("p","&#x200b");b.dom.insertAfter(e,f);c.select(e,1);c.collapse();return d.dom.Event.cancel(a)}});d.isGecko&&a.onKeyPress.add(function(b,a){var c,f,d;a.charCode===e.ui.keyCode.SPACE&&(c=b.selection.getNode(),f=e(c).closest("a"),d=b.selection.getRng(),f.length&&k(b,b.selection.getRng(),c)&&(d.setStartAfter(f[0]),d.setEndAfter(f[0]),b.selection.setRng(d),b.selection.collapse()))});a.onKeyPress.addToTop(function(b,a){if(13===a.keyCode&&!a.shiftKey){var c=
b.selection.getNode(),f=e(c).closest("pre");if(f.length&&!d.confluence.MacroUtils.isInMacro(f)&&k(b,b.selection.getRng(),c))return i(b,f,!0),d.dom.Event.cancel(a);f=e(c).closest("blockquote");if(f.length){var j=e(c).closest("p");if(j.is(":first-child")&&m(b,b.selection.getRng(),c))return i(b,f,!1),d.dom.Event.cancel(a);if(c=j.is(":last-child"))c=j.contents(),c=!c.length||1===c.length&&(c.is("br")||("&nbsp;"===c.html()||160===c.text().charCodeAt(0))||3===c[0].nodeType&&c[0].nodeValue===h.Rte.HIDDEN_CHAR)?
!0:!1;if(c)return b.dom.remove(j[0],!1),i(b,f,!0),d.dom.Event.cancel(a)}}return!0})}}});require("confluence/module-exporter").safeRequire("confluence-editor/oninit/tinymce-cursor-fixes",function(e){var d=require("ajs"),h=require("jquery");d.Rte=d.Rte||{};d.Rte.Cursor=d.Rte.Cursor||{};h.extend(d.Rte.Cursor,{insertParagraph:e.insertParagraph,isCursorAtStart:e.isCursorAtStart,isCursorAtEnd:e.isCursorAtEnd});d.bind("init.rte",e.bindCursorFixes)});