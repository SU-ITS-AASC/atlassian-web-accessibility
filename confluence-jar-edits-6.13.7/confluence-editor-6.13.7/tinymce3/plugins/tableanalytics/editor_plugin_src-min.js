define("confluence-editor/tinymce3/plugins/tableanalytics/editor_plugin_src",["jquery","ajs","tinymce"],function(d,a){var e;return{init:function(b){var c=this;e=b;b.onExecCommand.add(function(a,b,d,e){switch(b){case "mceAutoWidth":case "mceRelativeWidth":case "mceFixedWidth":c._onChangeTableMode();break;case "mceTableCopyRow":c._onCopyRow();break;case "mceTablePasteRowBefore":case "mceTablePasteRowAfter":c._onPasteRow();break;case "mceTableCopyCol":c._onCopyCol();break;case "mceTablePasteColBefore":case "mceTablePasteColAfter":c._onPasteCol();
break;case "mceInsertContent":c._onInsertContent(e)}});b.onInit.add(function(){b.selection.onSetContent.add(function(b,a){c._isInsideTable()&&a&&c._onSetContent(a)})});a.bind("analyticsEvent",function(a,b){c._isInsideTable()&&c._onResizeImg(b)});a.bind("rte.safe-save.success",function(){c._onSavePage()})},_onChangeTableMode:function(){a.Confluence.Analytics.publish("confluence.table.mode.to."+this._getTableMode(),{pageId:a.Meta.get("page-id")})},_onCopyRow:function(){a.Confluence.Analytics.publish("confluence.table.row.copy",
{pageId:a.Meta.get("page-id")})},_onPasteRow:function(){a.Confluence.Analytics.publish("confluence.table.row.paste",{pageId:a.Meta.get("page-id")})},_onCopyCol:function(){a.Confluence.Analytics.publish("confluence.table.col.copy",{pageId:a.Meta.get("page-id")})},_onPasteCol:function(){a.Confluence.Analytics.publish("confluence.table.col.paste",{pageId:a.Meta.get("page-id")})},_onInsertContent:function(b){b=d("<div/>").html(b);b.find("img").length&&this._isInsideTable()&&this._eventInsertImage();b.find("table.confluenceTable").length&&
a.Confluence.Analytics.publish("confluence.table.paste",{pageId:a.Meta.get("page-id")})},_onSetContent:function(a){d("<div/>").html(a.content).find(".confluence-embedded-image")&&this._eventInsertImage()},_onResizeImg:function(b){var c=function(){var a=d(e.selection.getNode()),b=a.closest("th, td");return a.width()>b.width()};b&&(b.name&&0<=b.name.indexOf("confluence.editor.image.resize"))&&a.Confluence.Analytics.publish("confluence.table.img.resize",{pageId:a.Meta.get("page-id"),tableMode:this._getTableMode(),
isImgBiggerCell:c()})},_eventInsertImage:function(){a.Confluence.Analytics.publish("confluence.table.image.insert",{pageId:a.Meta.get("page-id"),tableMode:this._getTableMode()})},_isInsideTable:function(){return!!d(e.selection.getNode()).closest("table.confluenceTable").length},_getTableMode:function(){var a=d(e.selection.getNode()).closest("table.confluenceTable");return a.hasClass("fixed-table")?"fixed":a.hasClass("relative-table")?"relative":"fluid"},_onSavePage:function(){var b=d(e.getBody()).find("table.confluenceTable");
a.Confluence.Analytics.publish("confluence.table.quality.in.page",{pageId:a.Meta.get("page-id"),total:b.length,fixed:b.filter(".fixed-table").length,fluid:b.filter(":not(.fixed-table,.relative-table)").length,relative:b.filter(".relative-table").length,nested:b.find("table.confluenceTable").length})},getInfo:function(){return{longname:"Table Analytics Plugin",author:"Atlassian",authorurl:"http://www.atlassian.com",version:"1.0"}}}});
require("confluence/module-exporter").safeRequire("confluence-editor/tinymce3/plugins/tableanalytics/editor_plugin_src",function(d){var a=require("tinymce");a.create("tinymce.plugins.TableAnalytics",d);a.PluginManager.add("tableAnalytics",a.plugins.TableAnalytics)});