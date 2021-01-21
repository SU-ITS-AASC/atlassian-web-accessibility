define("confluence-editor/files/attachments-panel/attachments-panel-view","confluence-editor/files/file-list/file-list-view confluence-editor/files/file-item/file-item-model confluence-editor/files/file-list/file-list-collection confluence-editor/files/base-panel/base-panel-view confluence/templates confluence/legacy confluence/api/constants ajs confluence/meta underscore window jquery".split(" "),function(n,i,o,j,k,p,l,e,h,m,f,g){return j.extend({id:"attachments",panelId:"",cssPanel:".attachments-panel",
cssContainer:"#attached-files",textNoFileMessage:e.I18n.getText("file.browser.no.attachments"),textPanelTitle:e.I18n.getText("file.browser.attached.title"),initialize:function(a){j.prototype.initialize.call(this);this.eventListener=a.eventListener;this.context=null;this.collection=new o;this.fileListView=new n({collection:this.collection,eventListener:this.eventListener});this.xhrCount=0},render:function(){var a=this;this.eventListener.trigger("AttachmentsPanelView.render",this);this.fileListView.updateDialogContext(this.context);
this.panelId=this.context.addPanel(this.textPanelTitle,this.getPanel(),"attachments-panel");this.el=this.getPanelElement();this.$el=g(this.el);this.delegateEvents();this.fileListView.updatePanelContext({fileContainer:this.getContainer(),noFileMessage:this.textNoFileMessage,showContainerInfo:false,errors:[],displayErrors:function(b){a.uploader.clearErrors();a.uploader.displayErrors(b)}});this.uploader=this.getUploaderController(this.context);this.messenger=this.uploader.getMessageHandler();this.collection.reset();
this._canAttachFiles()?this.refresh({shouldClearSelection:true}):this.refresh({errors:[e.I18n.getText("attach.files.no.permission")],shouldClearSelection:true});return this},getPanel:function(){return k.File.uploadFileForm({isNonSupportDragDrop:!this._hasXhrSupport(),atlToken:h.get("atl-token"),hasAttachPermission:this._canAttachFiles()})+k.File.attachedFilesPanel()},_overideUploaderClientForNonDragDropSupport:function(){var a=this;return{onUploadSuccess:function(b){for(var c=0;c<b.length;c++){var d=
b[c].id,e=a.collection.get(d);e&&a.collection.removeFile(e);g.get(l.CONTEXT_PATH+"/rest/api/content/"+d+"?expand=version,container,space").done(function(b){b=new i(b);a.collection.addFile(b)})}},pack:function(){a.getContainer().sizeToFit()},getDefaultErrorMessage:function(){return a.textDefaultErrorMessage},getDefaultUploadingMessage:function(){return a.textUploading},displayErrors:function(b){this.getMessageHandler().displayMessages(b);a._showErrorIconInMessageBox();this.pack()}}},getUploaderController:function(){return p.AttachmentUploader({baseElement:this.getPanelElement()},
m.bind(this._overideUploaderClientForNonDragDropSupport,this))},refresh:function(a){var b=this,c=a.shouldClearSelection?this.getPanelElement().find(".loading-message"):false,d=this.xhrCount=this.xhrCount+1;e.getJSONWrap({url:this._getUrlREST(),messageHandler:this.messenger,loadingElement:c,errorMessage:this.textErrorRetrieving,successCallback:function(c){if(d===b.xhrCount){a.data=c;b._onSuccessLoadFiles(a)}},errorCallback:m.bind(this._onErrorLoadFiles,this)})},_onSuccessLoadFiles:function(a){this.fileListView.resetFileList(a.data.results,
a)},_onErrorLoadFiles:function(){this._showErrorIconInMessageBox()},_showErrorIconInMessageBox:function(){var a=this.messenger.getMessageContainer().find("ul");a.toggleClass("one-message",a.find("li").length===1)},setUploadInProgress:function(a,b){this.eventListener.trigger("file.placeholder.process",a,b)},attachmentUploaded:function(a,b){this.eventListener.trigger("uploadingfile.completed",a,b)},attachmentUploadingCancelled:function(a){this.eventListener.trigger("uploadingfile.cancelled",a)},_hasXhrSupport:function(){var a,
b;try{a=new XMLHttpRequest;b=!(!a.sendAsBinary&&!a.upload)&&!(g.browser.mozilla&&g.browser.version.indexOf("1.9.1")>-1)}catch(c){b=false}return b},addPreviewImage:function(a){var b=require("tinymce");if(f.File&&f.FileReader&&f.FileList&&f.Blob){var c=this,b=b.isIE?1048576:5242880;a.isImage=a.nativeFile&&a.nativeFile.type&&this._isImageType(a.nativeFile.type);if(a.isImage&&a.nativeFile.size<b){var d=new FileReader;d.onload=function(){c._addFilePlaceHolderToCollection(a,d.result)};d.readAsDataURL(a.nativeFile)}else this._addFilePlaceHolderToCollection(a,
null)}},_addFilePlaceHolderToCollection:function(a,b){var c=null,d=this.collection.findWhere({fileName:a.name});if(d){this.collection.removeFile(d);d.get("isFilePlaceHolder")?d.get("previousUploadedFile")&&(c=d.get("previousUploadedFile")):c=d}c=new i({isFilePlaceHolder:true,fileName:a.name,fileId:a.id,fileNative:a.nativeFile,url:b||"",isImage:a.isImage,niceType:a.isImage?"Image":"",fileType:a.nativeFile.type,thumbnailUrl:b||"",previousUploadedFile:c});this.collection.addFile(c)},_isImageType:function(a){return e.Confluence.FileTypesUtils.isImage(a)},
_canAttachFiles:function(){return h.getBoolean("can-attach-files")},_getUrlREST:function(){var a=parseInt(h.get("attachment-source-content-id"),10);return l.CONTEXT_PATH+"/rest/api/content/"+a+"/child/attachment?expand=version,container,space"},focus:function(){this.collection.clearSelection()}})});require("confluence/module-exporter").exportModuleAsGlobal("confluence-editor/files/attachments-panel/attachments-panel-view","Confluence.Editor.FileDialog.AttachmentsPanelView");