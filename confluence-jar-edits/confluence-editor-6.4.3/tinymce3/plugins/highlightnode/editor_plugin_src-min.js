define("confluence-editor/tinymce3/plugins/highlightnode/editor_plugin_src",["jquery","ajs","document","tinymce"],function(b,a,g,f){return{init:function(f){a.debug("Hightlight Current Node Plugin");var j="strong em u s sub sup a code h1 h2 h3 h4 h5 h6 pre".split(" "),h={strong:"Bold",em:"Italic",u:"Underline",s:"Strikethrough",sub:"subscript",sup:"superscript"};f.onNodeChange.add(function(c,e,d){var e=b(d),a=b(".highlight-marker",c.getBody()),c=-1!=b.inArray(d.nodeName.toLowerCase(),j)&&!(d.nodeName.toLowerCase()in
h&&!c.queryCommandState(h[d.nodeName.toLowerCase()]))&&!(!(d.nodeName.toLowerCase()in h)&&!c.formatter.match(d.nodeName.toLowerCase()));if(!e.hasClass("highlight-marker")||!c)a&&a.removeClass("highlight-marker"),c&&e.addClass("highlight-marker")});var i=function(c){b(".highlight-marker",c).each(function(){b(this).removeClass("highlight-marker")})};b(g).bind("mode-changed",function(c,a){"preview"===a&&i(b("iframe").contents().find("#content"))});f.onSaveContent.add(function(a,e){var d=b("<div>"+e.content+
"</div>");i(d);e.content=d[0].innerHTML})},getInfo:function(){return{longname:"Atlassian Show Current Node",author:"Atlassian",authorurl:"http://www.atlassian.com",version:f.majorVersion+"."+f.minorVersion}}}});
require("confluence/module-exporter").safeRequire("confluence-editor/tinymce3/plugins/highlightnode/editor_plugin_src",function(b){var a=require("tinymce"),g=require("ajs");a.create("tinymce.plugins.ShowCurrentNode",b);g.DarkFeatures.isEnabled("highlightnode")&&a.PluginManager.add("highlightnode",a.plugins.ShowCurrentNode)});