define("confluence-editor/utils/tinymce-node-utils",["tinymce","ajs","jquery"],function(n,h,k){var o=0,m;return m={updateNode:function(a,c){var f=k(a,n.activeEditor.getDoc()),b="confluence.update-node-"+o++;h.trigger("synchrony.stop",{id:b});var d=m.prepareNodeForUpdate(f);return m.replaceNode(f,c).fail(d).always(function(){h.trigger("synchrony.start",{id:b})}).promise()},storeNodeState:function(a,c){for(var f={},b,d=0,e=c.length;d<e;d++)b=c[d],f[b]=a.attr(b);return function(){for(var b in f)a.attr(b,
f[b])}},prepareNodeForUpdate:function(a){var c=null;a.is("img")&&(c=m.storeNodeState(a,["width","height","src","class"]),a.addClass("image-hotswap").attr({src:h.contextPath()+"/images/border/spacer.gif",width:a.attr("width"),height:a.attr("height")}));return c},replaceNode:function(a,c){var f=m.getDoc(),b=k(c,f),d=k(a,f),e="confluence.replace-node-"+o++;h.trigger("synchrony.stop",{id:e});return k.Deferred(function(){var a=this;b.is("img")?(b[0].onload=function(){h.debug("replaceNode: new node's src has been loaded by the browser.");
this.onload=null;a.resolve(this)},k.browser.opera&&(b[0].src=b.attr("src")),f.createDocumentFragment().appendChild(b[0])):a.resolve(b[0])}).always(function(){h.trigger("synchrony.start",{id:e})}).done(function(a){d.replaceWith(a)}).promise()},replaceSelection:function(a){var c=n.activeEditor,f=c.selection.getRng(!0),b;b=c.getDoc().createRange();a=k(a).clone(!0,!1)[0];f.deleteContents();3===f.startContainer.nodeType&&""===f.startContainer.nodeValue&&(f.startContainer.nodeValue=h.Rte.HIDDEN_CHAR);f.insertNode(a);
f=c.getDoc().createTextNode(h.Rte.HIDDEN_CHAR);c.dom.insertAfter(f,a);b.setStartBefore(f);b.setEndAfter(f);b.collapse(!1);c.selection.setRng(b);return a},normalize:function(a){var c,f,b,d,e,g,h=n.activeEditor;e=h.selection.getRng(!0);var l,m=[];if(a&&a.childNodes){if(n.isWebKit)l=e;else if(n.isGecko&&(l=e.cloneRange(),c=k.inArray(e.startContainer,a.childNodes),f=l.startOffset,b=k.inArray(e.endContainer,a.childNodes),d=l.endOffset,g=e=g=e=void 0,-1<c||-1<b)){var p=[],q=0;k.each(a.childNodes,function(a,
b){var c={},f=p[a-1]||{};c.isTextNode=3===b.nodeType;c.textNodesBefore=(c.isTextNode&&f.isTextNode?1:0)+~~f.textNodesBefore;c.precedingTextLength=q;q=c.isTextNode?q+b.nodeValue.length:0;p.push(c)});m=p}a.normalize();if(n.isGecko){if(g=m[c])e=c-g.textNodesBefore,g=f+g.precedingTextLength,l.setStart(a.childNodes[e],g);if(g=m[b])e=b-g.textNodesBefore,g=d+g.precedingTextLength,l.setEnd(a.childNodes[e],g)}l&&h.selection.setRng(l)}},getDoc:function(){var a=n.activeEditor;return k.browser.mozilla||k.browser.opera?
document:a.getDoc()},isolateSelectedRange:function(){function a(a,b,d){var e;(e=c.dom.getParent(a,c.dom.isBlock))||(e=c.getBody());a:{var g,i=null,j=null,h;h=(g=!!d)?"nextSibling":"previousSibling";i=0===b;!i&&g&&(i=3===a.nodeType?b===a.length:b===a.childNodes.length);if(i){i=a[h];for(j=a;null===i;){if(j===e){a=void 0;break a}if(j.parentNode===e)break;j=j.parentNode;i=j[h]}}else 3===a.nodeType?(h=a.data,a.data=h.slice(b),i=f.createTextNode(h.slice(0,b)),j=a,k(i).insertBefore(j),g&&(h=j,j=i,i=h)):
(j=a.childNodes[b-(g?1:0)],i=j[h]);a=[j,i]}if(a)if(a[1]){b=a[1];a=a[0];for(d=!!d;a!==e&&a.parentNode!==e;){i=a.parentNode;g=i.cloneNode(!1);if(d)for(k(g).insertAfter(i);b;)j=b.nextSibling,g.appendChild(b),b=j;else{k(g).insertBefore(i);for(b=i.firstChild;b!==a;)j=b.nextSibling,g.appendChild(b),b=j}b=g;a=i}d=a}else d=a[0];else d=void 0;return d}var c=n.activeEditor,f=m.getDoc(),b=c.selection,d=b.getRng(!0),e=d.startContainer,g=d.startOffset,h=d.endContainer,l=d.endOffset,o;if(d.collapsed)return d;e===
h&&(o=l-g);(g=a(e,g))&&d.setStartBefore(g);e!==d.startContainer&&(l=o||l);(e=a(h,l,!0))&&d.setEndAfter(e);b.setRng(d);return d}}});require("confluence/module-exporter").exportModuleAsGlobal("confluence-editor/utils/tinymce-node-utils","tinymce.confluence.NodeUtils");