define("confluence-editor/tinymce3/plugins/confcharmap/editor_plugin_src",["tinymce"],function(b){return{init:function(a){a.addCommand("confCharmap",function(){a.windowManager.open({id:"insert-char-dialog",url:b.settings.editor_plugin_action_base_path+"/charmap.action",width:600+parseInt(a.getLang("advanced.charmap_delta_width",0),10),height:290+parseInt(a.getLang("advanced.charmap_delta_height",0),10),inline:!0,name:"advanced.charmap_desc"})})},getInfo:function(){return{longname:"Confluence Charmap Plugin",
author:"Atlassian",authorurl:"http://www.atlassian.com",version:b.majorVersion+"."+b.minorVersion}}}});require("confluence/module-exporter").safeRequire("confluence-editor/tinymce3/plugins/confcharmap/editor_plugin_src",function(b){var a=require("tinymce");a.create("tinymce.plugins.ConfCharmapPlugin",b);a.PluginManager.add("confcharmap",a.plugins.ConfCharmapPlugin)});