define("confluence-editor/tinymce3/plugins/notifywatchers/editor_plugin_src",["jquery","ajs","confluence/legacy","tinymce"],function(c,a,d,b){return{init:function(b){b.onInit.add(function(){var b={contentId:a.params.contentId,defaultVersionComment:a.params.versionComment};c("#rte-savebar-tinymce-plugin-point").append(d.Templates.Editor.SaveBar.NotifyWatchers.render(b))});require(["confluence/persistable"])},getInfo:function(){return{longname:"Confluence Notify Watchers",author:"Atlassian",authorurl:"http://www.atlassian.com",
version:b.majorVersion+"."+b.minorVersion}}}});require("confluence/module-exporter").safeRequire("confluence-editor/tinymce3/plugins/notifywatchers/editor_plugin_src",function(c){var a=require("tinymce");a.create("tinymce.plugins.ConfluenceNotifyWatchers",c);a.PluginManager.add("confluencenotifywatchers",a.plugins.ConfluenceNotifyWatchers)});