define("confluence-editor/tinymce3/plugins/template-editor/editor_plugin_src",["jquery","tinymce"],function(b,a){return{init:function(a){a.onInit.add(function(){b(a.getBody()).addClass("template-editor")})},getInfo:function(){return{longname:"Confluence Template Editor",author:"Atlassian",authorurl:"http://www.atlassian.com",version:a.majorVersion+"."+a.minorVersion}}}});
require("confluence/module-exporter").safeRequire("confluence-editor/tinymce3/plugins/template-editor/editor_plugin_src",function(b){var a=require("tinymce");a.create("tinymce.plugins.ConfluenceTemplateEditor",b);a.PluginManager.add("confluencetemplateeditor",a.plugins.ConfluenceTemplateEditor)});