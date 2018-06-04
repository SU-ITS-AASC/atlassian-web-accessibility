define("confluence-editor/files/search-panel/search-panel-view","confluence-editor/files/file-item/file-item-model confluence-editor/files/file-list/file-list-view confluence-editor/files/file-list/file-list-collection confluence-editor/files/base-panel/base-panel-view confluence/templates confluence/meta confluence/defaults confluence/highlighter underscore ajs jquery".split(" "),function(l,g,h,d,i,e,j,k,f,c,b){return d.extend({id:"search",panelId:"",cssPanel:".search-panel",cssContainer:"#searched-images",
template:i.File.searchPanel,events:{"submit form":"_submit"},initialize:function(){d.prototype.initialize.call(this);this.context=null;this.collection=new h;this.fileListView=new g({collection:this.collection})},getPanel:function(){this.$el=b(this.template({spaceKey:e.get("space-key"),spaceName:e.get("space-name")}));this.el=this.$el[0];this.delegateEvents();return this.el},render:function(){this.fileListView.updateDialogContext(this.context);this.panelId=this.context.addPanel(c.I18n.getText("file.browser.search.title"),
this.getPanel(),"search-panel");this.fileListView.updatePanelContext({fileContainer:this.getContainer(),noFileMessage:c.I18n.getText("image.browser.search.no.attachments"),showContainerInfo:true})},_submit:function(a){a.preventDefault();a.stopPropagation();if(this._getQuery()){this.clearContainer();this.collection.reset();this._loadImages().then(f.bind(this._onSuccessLoadFiles,this),f.bind(this._onErrorLoadFiles,this))}},_loadImages:function(){return b.ajax({type:"GET",dataType:"json",url:c.contextPath()+
c.REST.getBaseUrl()+"search.json",data:{spaceKey:this.getForm().find(".search-space").val(),query:this._getQuery(),search:"name",type:"attachment",attachmentType:[],groupResults:true,maxResultsPerGroup:50,searchParentName:true,pageSize:j.maxResults}})},_onSuccessLoadFiles:function(a){var b={result:[]};a.result&&a.result.length>0?b=a:a.group&&a.group[0]&&(b=a.group[0]);this.fileListView.highlighter=new k(this._getQuery().split(" "));this.fileListView.resetFileList(b.result,{shouldClearSelection:true})},
_onErrorLoadFiles:function(){var a=this.getContainer();a.find(".loading-message").addClass("hidden");a.append(b("<p class='warning'>"+b(this.textErrorSearch).text()+"</p>"))},_getSearchText:function(){return b("input.search-image-text",this.getForm())},_getQuery:function(){return this._getSearchText().val()||""},focus:function(){this.collection.clearSelection();this._getSearchText().focus()}})});
require("confluence/module-exporter").exportModuleAsGlobal("confluence-editor/files/search-panel/search-panel-view","Confluence.Editor.FileDialog.SearchPanelView");