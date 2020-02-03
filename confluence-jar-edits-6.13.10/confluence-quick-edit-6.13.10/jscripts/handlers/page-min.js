define("confluence-quick-edit/handlers/page","jquery ajs confluence/legacy confluence/meta confluence-quick-edit/handlers/shortcut confluence/aui-overrides confluence/analytics-support window confluence/api/browser confluence-editor/editor/page-editor-message confluence/message-controller confluence/api/event".split(" "),function(c,b,g,m,v,w,x,l,y,z,j,p){function n(){var a=c("#editPageLink");a.find(".aui-icon").css("visibility","visible");a.parent().spinStop()}function q(){var a=m.get("content-type");
return m.get("collaborative-content")&&(a==="page"||a==="blogpost")}function r(a,b,d){var e={pageId:d,blockIndex:-1,columnIndex:-1,index:-1,offset:0,hasBlock:function(){return this.blockIndex!==-1}},h=false,g=function(a,c){var d=a.offset();if(i(a)){e.index=c;e.offset=b-d.top;h=true}},i=function(a){var c=a.offset();return c.top-8<=b&&c.top+a.height()>=b};if(a.children().length===1&&a.children().first().hasClass("contentLayout2")){a.children().first().children().each(function(a){if(!e.hasBlock()&&i(c(this)))e.blockIndex=
a});if(e.hasBlock()){a=a.children().first().children().eq(e.blockIndex).find(".innerCell");a.each(function(a){if(e.columnIndex===-1){var b=c(this).children().length;if(b>0)if(b<2){if(c(this).children().first().height()>25)e.columnIndex=a}else e.columnIndex=a}});a.eq(e.columnIndex).children().each(function(a){h||g(c(this),a)})}}else a.children().each(function(a){h||g(c(this),a)});return h?e:null}function A(a){var f=require("tinymce");i.disable();w.metaToParams();if(b.DarkFeatures.isEnabled("confluence.view.edit.transition")){var d=
c("#main-content"),e=c("#header"),h=c("#main-header"),e=l.pageYOffset+e.outerHeight()+h.outerHeight();k=r(d,e,b.params.pageId);b.trigger("quick-edit.viewport.saved");var j=function(){c(f.activeEditor.getWin().document).find("body#tinymce").addClass("page-edit");c("#content").css({paddingRight:0});b.unbind("quickedit.visible",j)};b.bind("quickedit.visible",j)}d=a.$form;e=b.Meta.get("content-type")==="page"?"doeditpage":"doeditblogpost";e=b.contextPath()+"/pages/"+e+".action?pageId="+g.getContentId();
c(".ia-splitter-left").remove();try{c("#main").unwrap()}catch(m){}c("#rte").removeClass("editor-default").addClass("editor-fullheight");a.$container.children().remove();c(".editor-container").children().eq(0).unwrap();d.attr({"class":"editor aui",action:e,name:"editpageform",id:"editpageform",style:""});a.$container.append(d);a.$container.removeClass("view").addClass("edit");c("body").addClass("contenteditor edit")}function B(a){require("tinymce");c("#editor-precursor").show();c("#rte-savebar").find(".toolbar-split-left").show();
if(l.history.pushState){var f=c("#editPageLink").attr("href");if(f!=l.location.pathname+l.location.search){history.pushState({quickEdit:true},"",f);b.trigger("rte-quick-edit-push-state",f)}}else{l.location.hash="editor";b.trigger("rte-quick-edit-push-hash")}f=a.content;if(f.permissions)for(var d in f.permissions)c("#"+d).attr("value",f.permissions[d]);c("#originalVersion").val(a.content.pageVersion);b.Meta.set("page-version",a.content.pageVersion);b.Meta.set("page-title",a.content.title);c('meta[name="page-version"]').attr("content",
a.content.pageVersion);c('meta[name="ajs-page-version"]').attr("content",a.content.pageVersion);c("#syncRev").val(a.content.syncRev);b.Meta.set("conf-revision",a.content.confRev);c('meta[name="ajs-conf-revision"]').attr("content",a.content.confRev);d=a.content.atlToken;b.Meta.set("atl-token",d);c('input[name="atl_token"]').val(d);b.trigger("analyticsEvent",{name:"quick-edit-success"});c("#navigation").remove();var e=new Date,h=function(b,c){if(e&&!(c.type==="keydown"&&[91,92,93,224,33,34,37,38,39,
40,16,17,18,20,112,113,114,115,116,117,118,119,120,121,122,123].indexOf(c.keyCode)>-1)){var d=new Date-e;e=null;g.Analytics.publish("confluence.editor.transition.firstkeydown",{delay:d});a.editor.onKeyDown.remove(h);a.editor.onChange.remove(h)}};a.editor.onKeyDown.add(h);a.editor.onChange.add(h);g.debugTimeEnd("confluence.editor")}function C(a){var b=function(){p.unbind("rte-ready",b);if(k){var d;d=c(a.getBody());d=k.hasBlock()?d.children().first().children().eq(k.blockIndex).find(".innerCell").eq(k.columnIndex).children().eq(k.index):
d.children().eq(k.index);a.getWin().scrollTo(0,d.offset().top+k.offset);c("#main").css("visibility","visible")}};p.bind("rte-ready",b)}function s(a){b.trigger("rte-collaborative-content-ready",a)}function D(){var a=new c.Deferred;g.debugTime("confluence.editor.quick.fetchContent");var f=c.ajax({url:b.contextPath()+"/rest/tinymce/1/content/"+g.getContentId()+".json",cache:false});f.success(function(c){b.Meta.get("edit-mode")&&b.Meta.get("edit-mode")!==c.editMode&&a.reject("edit mode change",f);g.debugTimeEnd("confluence.editor.quick.fetchContent");
q()&&s(c);b.bind("synchrony-events-bound",function h(){s(c);b.unbind("synchrony-events-bound",h)});a.resolve(c)});f.error(function(b){a.reject("error fetching content",b)});return a}function t(a,f){if(f)switch(f.status){case 405:n();j.showError(j.parseError(f),j.Location.FLAG);return;case 423:var d=JSON.parse(f.responseText).user;n();d={title:b.I18n.getText("editor.unavailable.title"),body:b.I18n.getText("limited.mode.existing.editor.body",b.escapeHtml(d))};j.showError(d,j.Location.FLAG);return;case 412:n();
z.handleMessage("collab.edit.user.limit.reached",{type:"warning",title:b.I18n.getText("collab.edit.user.limit.msg.title"),message:b.I18n.getText("collab.edit.user.limit.msg.body"),close:"manual"});x.publish("collab.edit.user.limit.reached",{browserName:u.friendlyName(),browserVersion:u.version(),pageId:m.get("page-id"),editMode:"quick",numEditors:m.get("max-number-editors")});return}l.location=c("#editPageLink").attr("href")}var o,k,u=new y(l.navigator.userAgent),i={editShortcut:v.createShortcut("e",
"#editPageLink"),activateEventHandler:function(a){if(!a.metaKey&&!a.shiftKey&&!a.ctrlKey&&!a.altKey&&!(a.which===2||a.which===3)){a.preventDefault();if(o&&o.state()==="pending")b.debug("Editor is being activated. Ignoring handler...");else{o=i.activateEditor();a=c("#editPageLink");a.find(".aui-icon").css("visibility","hidden");a.spin();a=c("#draft-status-lozenge");a.text()!==""&&b.Confluence.Analytics.publish("confluence.drafts.referrer",{referrerPage:"view",lozengeType:a.text()})}}},enable:function(){if(c("body").is(".theme-default")){var a=
c("#editPageLink");a.bind("click",i.activateEventHandler);a.removeClass("full-load");i.editShortcut.bind();b.debug("QuickPageEdit enabled")}else b.debug("QuickPageEdit not enabled")},activateEditor:function(){g.debugTime("confluence.editor");q()&&b.trigger("rte-quick-edit-init");var a=c("#content").find(".quick-comment-form"),f=function(){var a=require("tinymce").activeEditor.getWin(),e=c(a.document).find("#tinymce");if(a=r(e,a.pageYOffset,b.params.pageId))sessionStorage.viewPort=JSON.stringify(a)};
return b.Confluence.QuickEdit.activateEditor({fetchContent:D(),$container:c("#content"),$form:a.length?a:c('<form method="post"></form>'),preInitialise:A,postInitialise:B,saveHandler:function(){b.DarkFeatures.isEnabled("confluence.view.edit.transition")&&f();g.Editor.getNumConcurrentEditors()>1&&b.Confluence.Analytics.publish("rte.notification.concurrent-editing.save",{numEditors:g.Editor.getNumConcurrentEditors(),pageId:b.params.pageId,draftType:b.params.draftType})},cancelHandler:function(){b.DarkFeatures.isEnabled("confluence.view.edit.transition")&&
f();g.Editor.getNumConcurrentEditors()>1&&b.Confluence.Analytics.publish("rte.notification.concurrent-editing.cancel",{numEditors:g.Editor.getNumConcurrentEditors(),pageId:b.params.pageId,draftType:b.params.draftType})},plugins:b.Confluence.Editor._Profiles.createProfileForPageEditor({versionComment:true,notifyWatchers:true}).plugins,onInitialise:function(a){b.DarkFeatures.isEnabled("confluence.view.edit.transition")&&a.onLoad.add(C);b.messages.setup()}}).fail(t)},disable:function(){b.debug("QuickPageEdit disabled.");
i.editShortcut.unbind();c("#editPageLink").unbind("click",i.activateEventHandler)}};b.Confluence.QuickEdit.register(i);return{disable:i.disable,_objForTesting:{onFailActivateEditor:t}}});require("confluence/module-exporter").exportModuleAsGlobal("confluence-quick-edit/handlers/page","AJS.Confluence.QuickEdit.QuickEditPage");