define("confluence-collaborative-editor-plugin/util/editor-format-fixer",["underscore","confluence/meta","confluence-collaborative-editor-plugin/util/url-parser"],function(d,e,f){var c=function(h){var k=0;var q="img[data-base-url]";var n=e.get("base-url");var t=f.parseUrl(n);var l=h.querySelectorAll(q);for(var m=0;m<l.length;m++){var j=l[m];var p=f.parseUrl(j.attributes["data-base-url"].value);if(!d.isEqual(p,t)){var s=j.attributes["data-image-src"].value;var o=j.attributes.src.value;var r=s.replace(p.pathname,t.pathname);var u=o.replace(p.pathname,t.pathname);j.setAttribute("data-base-url",n);j.setAttribute("data-image-src",r);j.setAttribute("src",u);k++}}return k};var g=function(j){var l=0;var s=["a[data-base-url][href][data-linked-resource-type='page']","a[data-base-url][href][data-linked-resource-type='blogpost']","a[data-base-url][href][data-linked-resource-type='comment']","a[data-base-url][href][data-linked-resource-type='space']","a[data-base-url][href][data-linked-resource-type='attachment']","a[data-base-url][href][data-linked-resource-type='custom']"].join(",");var r=e.get("base-url");var q=f.parseUrl(r);var m=j.querySelectorAll(s);for(var n=0;n<m.length;n++){var k=m[n];var p=f.parseUrl(k.attributes["data-base-url"].value);if(!d.isEqual(p,q)){var h=f.parseUrl(k.attributes.href.value);var o=r+h.pathname.replace(p.pathname,"")+h.search+(h.hash?"#"+h.hash:"");k.setAttribute("data-base-url",r);k.setAttribute("href",o);l++}}return l};var b=function(h){var m=0;var r="img[data-macro-name='view-file']";var u=f.parseUrl(e.get("base-url"));var n=h.querySelectorAll(r);for(var q=0;q<n.length;q++){var k=n[q];var t=k.attributes.src.value;var l=["/rest/documentConversion/latest/","/plugins/servlet/confluence/placeholder/unknown-attachment?"];for(var p=0;p<l.length;p++){var s=l[p];var o=t.indexOf(s);if(o!=-1){var w=t.substr(0,o);if(w!==u.pathname){var v=u.pathname+t.substr(o);k.setAttribute("src",v);m++}}}}return m};var a=function(j){var i="a[data-linked-resource-id][data-linked-resource-type='userinfo'][userkey]";var h=j.querySelectorAll(i);Array.prototype.forEach.call(h,function(k){k.removeAttribute("data-linked-resource-id")});return h.length};return{fixStaleBaseUrl:function(j){var h=c(j);var k=b(j);var i=g(j);return h+k+i},fixMentions:function(h){return a(h)}}});