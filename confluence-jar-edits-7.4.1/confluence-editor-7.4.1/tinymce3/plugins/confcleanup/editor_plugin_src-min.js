define("confluence-editor/tinymce3/plugins/confcleanup/editor_plugin_src",["tinymce","jquery"],function(d,f){return{init:function(g){if(d.isWebKit){var h={},i=function(a,c){var b=a[c];b||(b={},a[c]=b);return b};f("#format-dropdown").find("ul.aui-dropdown li").each(function(){var a=f("a",this),c=a.css("font-size"),b=a.css("font-weight"),a=a.css("color"),a=i(h,a),b=i(a,b);b[c]||(b[c]=f(this).attr("data-format"))});g.onNodeChange.add(function(a){for(var c=a.dom.select("span.Apple-style-span",a.dom.doc.body),
b=a.dom.select("font.Apple-style-span",a.dom.doc.body),c=c.concat(b),b=0,k=c.length;b<k&&!a.dom.is(c[b],'[face="mceinline"]');b++){var e;a:{e=f(c[b]);var d=h[e.css("color")],g=void 0;if(d&&(g=d[e.css("font-weight")])){e=g[e.css("font-size")];break a}e=null}e&&(d=a.selection.getBookmark(),e&&a.dom.remove(c[b],1),a.selection.moveToBookmark(d),a.execCommand("FormatBlock",!1,e))}})}g.onNodeChange.add(function(a){for(var c=a.dom.select("img",a.dom.doc.body),b=c.length,d=0;d<b;d++)"file:///"===c[d].src.substr(0,
8)&&a.dom.remove(c[d])});if(d.isIE9){var j=function(a){a.getBody().childNodes.length||a.setContent("<p>﻿</p>")};g.onNodeChange.add(j);g.onSetContent.add(j)}},getInfo:function(){return{longname:"ConfluenceCleanupPlugin",author:"Atlassian",authorurl:"http://www.atlassian.com",infourl:"http://www.atlassian.com",version:"1.0"}}}});
require("confluence/module-exporter").safeRequire("confluence-editor/tinymce3/plugins/confcleanup/editor_plugin_src",function(d){var f=require("tinymce");f.create("tinymce.plugins.ConfluenceCleanupPlugin",d);f.PluginManager.add("confluencecleanupplugin",f.plugins.ConfluenceCleanupPlugin)});