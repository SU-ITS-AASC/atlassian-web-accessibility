define("confluence-editor/tinymce3/plugins/draggable/editor_plugin_src",["jquery","ajs"],function(i,e){function G(b){if(1===b.which&&b.target===b.currentTarget)if(d)q(b);else{d=i(b.target);g.selection.select(b.target);b.preventDefault();h.bind({"mousemove.moveable-zone":H,"mouseup.moveable-zone":q,"keydown.moveable-zone":I,"mouseover.moveable-zone":l});var a=d.offset();t=b.pageX;u=b.pageY;x=a.top-u;y=a.left-t;r=!0;b=d;m=b.attr("style")||"";d=b}}function I(b){27===b.keyCode&&(k.cancelScrolling(),h.unbind(".moveable-zone"),
g.undoManager.undo(),g.selection.select(d[0]),g.selection.collapse(!1),d=null)}function l(){h.find(".mceSelected").removeClass("mceSelected")}function H(b){var a;if(r){a=Math.abs(t-b.pageX);var f=Math.abs(u-b.pageY);if(a<z&&f<z)return;e.Rte.BookmarkManager.storeBookmark();g.undoManager.beforeChange();g.undoManager.typing=!0;g.undoManager.add();e.trigger("synchrony.stop",{id:A});(a=g.selection.getSel())&&a.removeAllRanges&&a.removeAllRanges();d.css({position:"absolute",width:d.css("width"),"max-width":"50%"});
e.Confluence.PropertyPanel.current&&e.Confluence.PropertyPanel.destroy();d.detach();e.Rte.Cursor.fixCursorTargets(e.Rte.getEditor().getBody());n.append(d);var B=d,o=function(){return h.find("#move-indicator")},q=function(b,a){var c=i(h[0].elementFromPoint(b,a)),j=!0;if(c.is(s)&&"move-indicator"!==c.attr("id")&&!(c.is("td.wysiwyg-macro-body")&&"PLAIN_TEXT"===c.closest("table").attr("data-macro-body-type")||c.is("img")&&!B.is("img"))){j=c;if(c.is("img")){var d;d=c.offset();d=b+h.scrollLeft()-d.left;
c=c.width()}else d=v(c,a),c=c.height();c=d<c/2;return{target:j,before:c}}if(l?c.is(C):c.is(D)){c=c.is("div.cell")?c.children("div.innerCell").first():c;if(0>v(c.children().first(),a))c=c.children().first();else{d=c.children().last();j=v(d,a);d=d.height();if(0<j-d)c=c.children().last();else{if(0<o().length&&0<o().parent(c).length)return null;j=c;c=B.parent(s);c.length||(c=j.find(s).last());c.length||(c=n.find(s).last())}j=!1}return{target:c,before:j}}return null},v=function(b,d){var c=b.offset();return d+
h.scrollTop()-c.top},l=!!n.children(".contentLayout,.contentLayout2").length;p={positionNear:function(b,d){var c;if(c=q(b,d)){var a=c.target;c=c.before;if("move-indicator"!==a.attr("id")){var f=o();if(!a.is(E)||!a.find(f).length){f.length?f.detach():f=i('<span id="move-indicator">|</span>');if(a.is(E)){var g=a.children().first();g.is(J)&&(a=g)}!a.is("img")&&e.Rte.Cursor.isTextContainerEmpty(a[0])?a.prepend(f):a.is(K)?c?a.prepend(f):a.append(f):c?a.before(f):a.after(f)}}}},replaceWith:function(a){var b=
o();if(b.length){var c;if(c=a.is(L))c=b.parent(),c=l?c.is(C):c.is(D);c&&(a=i("<p></p>").append(a));b.replaceWith(a);g.dom.isBlock(a[0])&&a.parent().is("p")&&a.unwrap();e.Rte.showElement(a);g.selection.select(a[0]);g.selection.collapse(!0)}else e.debug("No cursor - abort drop"),g.undoManager.undo();e.Rte.Cursor.fixCursorTargets(e.Rte.getEditor().getBody())},destroy:function(){var a=o();a.length&&(a.remove(),e.Rte.Cursor.fixCursorTargets(e.Rte.getEditor().getBody()))}};r=!1}b.preventDefault();d.hide();
var f=b.clientY,m;a=w.length;f=Math.max(f,0);f<a?k.scrollUp(w[f]):(m=F.height(),f=Math.max(0,m-f),f<a?k.scrollDown(w[f]):k.cancelScrolling());p.positionNear(b.clientX,b.clientY);a=Math.min(b.pageY+x,k.scrollHeight()-d.outerHeight());d.css({top:a,left:b.pageX+y,opacity:0.5});d.show()}function q(b){h.unbind(".moveable-zone");k.cancelScrolling();r?d=null:(b.preventDefault(),d.detach(),d.attr("style",m),p.replaceWith(d),p.destroy(),p=d=null,l(),g.undoManager.add(),e.trigger("synchrony.start",{id:A}))}
var L="img",z=10,g,F,h,n,x,y,t,u,d,m,r,k,p,w=[800,800,400,400,400,300,300,300,300,300,300,300,300,300,300,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],A="confluence.draggable-plugin",C="div.innerCell,div.cell",D="body",s="p,h1,h2,h3,h4,h5,h6,blockquote,li,td,th,img",E="li,td,th",J="p,h1,h2,h3,h4,h5,h6,blockquote",K="li,td,th";return{init:function(b){g=b;b.onInit.add(function(){F=i(b.getWin());h=i(b.getDoc());n=i(b.getBody());
var a=i.browser.webkit?n:h.find("html"),d=0;k={scrollUp:function(b){d!==-b&&(d=-b,b=1E3*(a.scrollTop()/b),a.stop(!1,!1),a.animate({scrollTop:0},{duration:b}))},scrollDown:function(b){var e;d!==b&&(d=b,e=a[0].scrollHeight,b=1E3*((e-a.scrollTop())/b),a.stop(!1,!1),a.animate({scrollTop:e},{duration:b}))},cancelScrolling:function(){d=0;a.stop(!0,!1)},scrollHeight:function(){return a[0].scrollHeight}};h.delegate("img.confluence-embedded-image,img.editor-inline-macro,table.wysiwyg-macro",{mousedown:G})})},
getInfo:function(){return{longname:"Draggable objects (images, tables, placeholders) around the document via drag and drop",author:"Atlassian",authorurl:"http://www.atlassian.com",version:"1.0"}}}});require("confluence/module-exporter").safeRequire("confluence-editor/tinymce3/plugins/draggable/editor_plugin_src",function(i){var e=require("tinymce");e.create("tinymce.plugins.draggable",i);e.PluginManager.add("draggable",e.plugins.draggable)});