define("confluence-editor/insert-image-dialog/insert-image-dialog",["jquery","ajs","underscore","confluence/legacy"],function(c,f,e,h){var g={beforeShowListeners:[],panelComponent:[],sizeToFit:function(){this.each(function(){var a=this,b=c(this).parent(),d=b.height();b.children().each(function(){this!==a&&c(this).is(":visible")&&(d-=c(this).outerHeight())});b=c(this).outerHeight()-c(this).height();c(this).css("height",Math.max(0,d-b)+"px")});return this},defaultInsertImageDialog:function(){f.Rte.BookmarkManager.storeBookmark();
g.insertImageDialog(function(a){var b=require("tinymce");f.Rte.BookmarkManager.restoreBookmark();var d={};if(a.url)d={url:a.url,filename:a.url,contentId:a.contentId},b.confluence.ImageUtils.insertFromProperties(d);else{var i=!0,h=1<a.selectItems.length;e.each(a.selectItems,function(a){a.isImage()?(d={filename:a.getFileName(),contentId:a.get("ownerId")},b.confluence.ImageUtils.insertFromProperties(d,h)):(i=!1,f.MacroBrowser.getMacroMetadata("view-file")?g._insertFilePlaceholderToEditor(a):g._insertLinkToEditor(a))});
require(["confluence-drag-and-drop/analytics/files-upload-analytics"],function(b){b.triggerEvent("confluence.insert-files-dialog.insert",a.selectItems,i)})}c("#comments-section").length&&f.Rte.fixEditorFocus()},function(){f.Rte.BookmarkManager.restoreBookmark()})},findPanelComponentById:function(a){for(var b=h.Editor.ImageDialog.panelComponent,d=0,c=b.length;d<c;d++)if(b[d].id==a)return b[d]},insertImageDialog:function(a,b){var d=new h.Editor.FileDialog.FileDialogView({submitCallback:a,cancelCallback:b,
beforeShowListeners:g.beforeShowListeners,panelComponents:g.panelComponent});d.render();return d},_insertLinkToEditor:function(a){var b=h.Link.fromREST(a.attributes);b.attrs["data-linked-resource-container-id"]=a.get("ownerId");b.attrs.href=a.get("downloadUrl");b.insert()},_insertFilePlaceholderToEditor:function(a){var b={name:a.get("fileName"),page:a.get("parentTitle"),space:a.get("space")?a.get("space").key:"",date:a.get("datePath"),ownerId:a.get("ownerId")};require(["confluence-editor/utils/attachments-insert-utils"],
function(a){a.insertFilePlaceholder(b)})}};return g});
require("confluence/module-exporter").safeRequire("confluence-editor/insert-image-dialog/insert-image-dialog",function(c){var f=require("jquery"),e=require("confluence/legacy");f.fn.sizeToFit=c.sizeToFit;e.Editor.ImageDialog=c;e.Editor.defaultInsertImageDialog=c.defaultInsertImageDialog;e.Editor.ImageDialog.findPanelComponentById=c.findPanelComponentById;e.Editor.insertImageDialog=c.insertImageDialog;e.Editor.ImageDialog._insertLinkToEditor=c._insertLinkToEditor;e.Editor.ImageDialog._insertFilePlaceholderToEditor=
c._insertFilePlaceholderToEditor});