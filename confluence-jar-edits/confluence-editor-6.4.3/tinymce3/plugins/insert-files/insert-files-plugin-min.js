define("confluence-editor/tinymce3/plugins/insert-files/insert-files-plugin",["ajs","jquery","confluence-editor/utils/environment"],function(b,a,c){return{init:function(a){a.addButton("confluence-insert-files",{title:b.I18n.getText("tinymce.confluence.files"),tooltip:b.I18n.getText("tinymce.confluence.conf_file_desc")+" ("+c.transformCmdKeyTextBasingOnOS(b.I18n.getText("tinymce.confluence.conf_file_shortcut"))+")",cmd:"mceConfimage",className:"insert-files",icon:"aui-icon aui-icon-small aui-iconfont-editor-files",
locationGroup:"rte-toolbar-group-files",weight:0})},getInfo:function(){return{longname:"Insert Files",author:"Atlassian",authorurl:"http://www.atlassian.com",infourl:"http://www.atlassian.com/",version:"1.0"}}}});require("confluence/module-exporter").safeRequire("confluence-editor/tinymce3/plugins/insert-files/insert-files-plugin",function(b){var a=require("tinymce");a.create("tinymce.plugins.InsertFiles",b);a.PluginManager.add("insertfiles",a.plugins.InsertFiles)});