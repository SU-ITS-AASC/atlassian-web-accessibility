define("confluence-editor/tinymce3/plugins/autocomplete/autocomplete-control",["ajs","jquery","confluence/legacy","confluence-editor/tinymce3/plugins/autocomplete/autocomplete-settings","document"],function(d,f,t,z,A){var v=function(a,q){var g,c,i=z.log("Autocompleter.Control"),s=require("tinymce"),b={},o=a.selection,u=o.getRng(!0),p=u.startOffset,k=u.startContainer;c=k.nodeValue;var m=q.leadingChar,x=a.getDoc(),n=q.backWords||0,F=q.insertedFromMenu||!1,j=z.Settings[m||"["];g=!j||"undefined"===typeof j.preventStartNodes?
"div.code, a[href], img, pre":j.preventStartNodes;if(f("#autocomplete",x).length)return d.debug("init","Autocomplete already exists, returning null."),null;b.backWords=n;b.maxResults=q.maxResults||10;null==c&&(u.collapsed&&p&&k.childNodes[p-1])&&(k=k.childNodes[p-1],p=(c=k.nodeValue)&&c.length||0);var r="";if(null!=c)for(var r=(c+"").substring(0,p),l=k.previousSibling;l&&3===l.nodeType;)r=l.nodeValue+r,l=l.previousSibling;var l=[/([("'<\u201c\u2018]\[|[\ufeff\u200b\u2014\s\xa0].)$/,/(\([^!])$/,/(\/\/)$/],
h;if(h=!n)if(h=r){a:{r+=m;h=0;for(var G=l.length;h<G;h++)if(l[h].test(r)){l=!0;break a}l=!1}h=!l}if(h)return i("init","Cursor is in wrong word location to start autocomplete, returning null."),null;if(f(k).closest(g).length)return i("init","Cursor is in wrong node to start autocomplete, returning null."),null;t.PropertyPanel&&t.PropertyPanel.current&&(t.PropertyPanel.shouldCreate=!1,t.PropertyPanel.destroy());!m&&null==c&&(d.debug("init","No text available for suggestion, range is",u),c="");b.getContainer=
function(){return f("#autocomplete",x)};if(u.collapsed&&n&&c){g=k;c=p;l=function(b,e,a){!e.global&&(e=RegExp(e.source,"g"+"i".slice(0,e.ignoreCase)+"m".slice(0,e.multiLine)));a==null?a=b.length:a<0&&(a=0);for(var b=b.substring(0,a+1),a=-1,c=0,d;(d=e.exec(b))!=null;){a=d.index;e.lastIndex=++c}return a};for(r=0;r<n;r++){h=g.nodeValue.substring(0,c);for(c=l(h,/\s+/,c);-1==c;)if((h=g.previousSibling)&&3===h.nodeType)g=h,(h=h.nodeValue)&&(c=l(h,/\s+/,h.length));else{r=n;break}}c+=1;s.isIE&&1==n?(n=o.getRng(),
n.moveStart("character",c-p),n.select()):(n=o.getRng(!0),n.setStart(g,c),n.setEnd(k,p),o.setRng(n))}p=o&&o.getNode()&&o.getNode().classList.contains("placeholder-inline-tasks")?"":o.getContent({format:"text"}).replace("\n","");i("init","suggestionHtml",p);k=f("<span></span>").attr("id","autocomplete");q.classNames&&k.addClass(q.classNames);m&&k.append(f("<span></span>").attr("id","autocomplete-trigger").text(m));m=f("<span></span>").attr("id","autocomplete-search-text");m.text(d.Rte.HIDDEN_CHAR);
k.append(m);o.setNode(k[0]);var w=b.getContainer();b.previousSearchText="";b.settings=j;!1!==j.cache&&!j.cacheManager?j.cacheManager=new d.Confluence.localStorageCacheManager(j.ch):!1===j.cache&&!j.cacheManager&&(j.cacheManager={get:f.noop,put:f.noop});j=f("#autocomplete-search-text",b.getContainer());m=f(x.createElement("span")).text(p||d.Rte.HIDDEN_CHAR);j.empty().append(m);o.select(m[0],!0);o.collapse();var B=function(H,e){if(b.onBeforeKey&&!b.onBeforeKey(e,b.text())){s.dom.Event.cancel(e);i("before",
"blocked by onBeforeKey: "+e.keyCode);return false}},C=function(H,e){var a=o.getRng(true),d=b.getContainer(),c=a.startContainer,a=c.parentNode;c.nodeType===3&&(a=a.parentNode);var g=(c=a?a.parentNode:null)?c.parentNode:null,d=a!==d[0]&&c!==d[0]&&g!==d[0];if(e.keyCode===27||d){i("after","dying because of: "+(d?"outside search span":"escape pressed"));b.die()}else if(b.onAfterKey&&!b.onAfterKey(e,b.text())){s.dom.Event.cancel(e);i("after","blocked by onAfterKey: "+e.keyCode);return false}},D=function(a,
e){if(b.onKeyPress&&!b.onKeyPress(e,b.text())){s.dom.Event.cancel(e);i("press","blocked by onKeyPress: "+e.keyCode);return false}},E=function(a,e){if(b.getContainer()[0]!=e.target.parentNode){i("click","Clicked outside of autocomplete, closing.");b.die()}};a.onKeyDown.addToTop(B);a.onKeyUp.addToTop(C);a.onKeyPress.addToTop(D);a.onClick.addToTop(E);b.word="";q.keepAlias?i("init","No suggestion based on previous or selected text"):b.word=p;d.Rte.showElement(w[0]);j=s.DOM.getPos(w[0]);m=w.height();b.left=
j.x;b.top=j.y+m;b.text=function(a){var e=f("#autocomplete-search-text",b.getContainer());if(a!=null){e.html(a);return this}a=d.escapeEntities(e.text());return a.replace(d.Rte.HIDDEN_CHAR,"")};b.plainText=function(a){var e=f("#autocomplete-search-text",b.getContainer());if(a!=null){e.text(a);return this}a=e.text();return a.replace(d.Rte.HIDDEN_CHAR,"")};var y=function(a,e){var d=b.getContainer();return v.replaceWithTextAndGetRange(d,a,e)};b.replaceWithSelectedSearchText=function(){var a=b.text();i("replaceWithSelectedSearchText",
a);y(a,false);return a};b.die=function(c){if(b.dying)d.debug("die","Already dying, returning.");else{b.dying=true;if(t.PropertyPanel)t.PropertyPanel.shouldCreate=true;if(b.getContainer().length){i("die","Tearing down autocomplete, cleaning up autocompleter");c=(c||q.backWords||F?"":b.settings.ch)+b.text();u=y(c,true)}setTimeout(function(){i("die","Removing autocomplete-control keyboard listeners.");a.onKeyDown.remove(B);a.onKeyUp.remove(C);a.onClick.remove(E);a.onKeyPress.remove(D)},1);d.Rte.unbindScroll("autocomplete");
f(A).unbind("click.autocomplete-outside");this.onDeath&&this.onDeath()}};d.Rte.bindScroll("autocomplete",function(a){d.debug("scrolling:",a);if(d.Rte.isAnyPartShown(w))b.onScroll();else b.die()});f(A).bind("click.autocomplete-outside",function(a){var c=a.srcElement&&a.srcElement.id==="rte-insert-date";!f(a.target).closest("#autocomplete-dropdown, .aui-datepicker-dialog, .ui-datepicker-header").length&&!c&&b.die()});d.Rte.getEditor().onBeforeExecCommand.add(function(a,c){c=="mceConfSavePage"&&b.die()});
b.update=function(a){d.Rte.BookmarkManager.storeBookmark();y("",true);this.settings.update(this,a)};b.removeSpan=function(){b.getContainer().remove()};return b};v.removeOrphanedControl=function(){var a=f(d.Rte.getEditor().getDoc()),q=a.find("#autocomplete"),g;if(!q.length)return null;g=a.find("#autocomplete-trigger").text();a=a.find("#autocomplete-search-text").text();v.replaceWithTextAndGetRange(q,a,!1);return{leadingChar:g,content:a}};v.replaceWithTextAndGetRange=function(a,f,g){if(a.length){var f=
f||"",g=g||!f,c=d.Rte.getEditor(),i=a[0].parentNode,s=d.Rte.Content.getChildIndex(i,a[0]),b=g?1:0,g=c.selection.getRng(!0);g.setStart(i,s+b);g.setEnd(i,s+1);a.before(f||d.Rte.HIDDEN_CHAR).remove();c.selection.setRng(g);return g}d.log("replaceWithTextAndGetRange Error: attempting to replace a non-existent element")};return v});require("confluence/module-exporter").exportModuleAsGlobal("confluence-editor/tinymce3/plugins/autocomplete/autocomplete-control","Confluence.Editor.Autocompleter.Control");