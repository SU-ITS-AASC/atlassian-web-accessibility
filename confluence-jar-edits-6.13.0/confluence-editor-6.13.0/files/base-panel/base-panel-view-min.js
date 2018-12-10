define("confluence-editor/files/base-panel/base-panel-view",["backbone","ajs","jquery"],function(b,a,c){return b.View.extend({context:null,cssContainer:"",cssPanel:"",textErrorSearch:a.I18n.getText("image.browser.error.search"),textErrorRetrieving:a.I18n.getText("image.browser.error.retrieving.attachments"),textDefaultErrorMessage:a.I18n.getText("image.browser.upload.error"),textUploading:a.I18n.getText("image.browser.upload.image.uploading"),initialize:function(){},createPanel:function(d){this.context=
d;this.render();var a=this;if(d=this.context.getPanel(this.panelId))d.onselect=function(){a.context.clearSelection();a.focus&&a.focus()}},render:function(){return this},getPanelElement:function(){return c(this.cssPanel,this.context.baseElement)},getContainer:function(){return c(this.cssContainer)},getForm:function(){return c("form",this.getPanelElement())},clearContainer:function(){var a=this.getContainer();a.find(".loading-message").removeClass("hidden");a.find(".warning").addClass("hidden")},clearErrors:function(){this.messenger.clearMessages()},
displayErrors:function(a){this.uploader.displayErrors(a);this.getContainer().sizeToFit()},getNoFileContainer:function(){return this.getPanelElement().find(".no-files")},getFileListContainer:function(){return this.getPanelElement().find("ul.file-list")}})});
require("confluence/module-exporter").exportModuleAsGlobal("confluence-editor/files/base-panel/base-panel-view","Confluence.Editor.FileDialog.BasePanel",function(){var b=require("underscore"),a=require("backbone");require("confluence/legacy").Editor.FileDialog.eventListener=b.extend({},a.Events)});