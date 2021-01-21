define("confluence-quick-edit/handlers/comment/edit","confluence/root confluence/templates wrm/context-path confluence/dark-features confluence/api/logger confluence/meta confluence-editor/profiles confluence-quick-edit/handlers/comment confluence-quick-edit/quick-edit jquery".split(" "),function(j,k,l,m,n,g,o,b,i,d){function p(a){b.preInitialise(a);a.$container.scrollWindowToElement()}function q(a){b.postInitialise(a)}function h(a){return(a=a.attr("id").match(/comment-(\d+)/))?parseInt(a[1],10):
0}function r(a){var b=new d.Deferred;d.ajax({url:l()+"/rest/api/content/"+a+"?expand=body.editor",cache:false}).done(function(a){!a||!a.body||!a.body.editor?b.reject("invalid response from loading comment rest endpoint"):b.resolve({editorContent:a.body.editor.value})}).fail(function(){b.reject("error fetching content")});return b}function s(){var a=d(".comment.edit");a.prev(".comment").show();a.remove()}var t=m.isEnabled("editor.slow.comment.disable"),f={activateEventHandler:function(a){var f=this;
a.preventDefault();a.stopPropagation();b.proceedWithActivation().done(function(){var a=d(f).closest("div.comment"),c;c=a.find(".author .confluence-userlink");var e=a.find(".comment-user-logo img.userLogo");c=b.createCommenterParam(e,c.attr("data-username"),c.text());c={contentId:j.getContentId(),commentId:h(a),commenter:c,context:{contextPath:g.get("context-path"),staticResourceUrlPrefix:g.get("static-resource-url-prefix")},mode:"edit"};c=d(k.Comments.displayEditEditorContainer(c));e=d(".quick-comment-loading-container",
c);a.hide();a.after(c);e.fadeIn().spin("medium");e[0].scrollIntoView();c=a.next(".quick-comment-container");g.set("form-name",d("form",c).attr("name"));i.activateEditor({$container:c,$form:d("form.quick-comment-form[name=editcommentform]"),fetchContent:r(h(a)),preInitialise:p,postInitialise:q,saveHandler:b.createSaveHandler(b.delegatingSaveCommentHandler,b.saveCommentErrorHandler),cancelHandler:b.cancelHandler,plugins:o.createProfileForCommentEditor().plugins,postDeactivate:s,additionalResources:["wrc!comment-editor"],
timeoutResources:b.timeout}).fail(function(){t?b.showLoadingEditorErrorMessage():window.location=d("#edit-comment-"+h(a)).attr("href")})})},enable:function(){d("#comments-section").delegate(".comment-action-edit","click",f.activateEventHandler)},disable:function(){d("#comments-section").undelegate(".comment-action-edit","click")}};i.register(f);return{cancelComment:function(){n.log("'AJS.Confluence.QuickEdit.QuickComment.Edit.cancelComment' is deprecated in 5.7, consider using 'AJS.Confluence.QuickEdit.QuickComment.cancelComment' instead.");
return b.cancelComment()}}});require("confluence/module-exporter").exportModuleAsGlobal("confluence-quick-edit/handlers/comment/edit","AJS.Confluence.QuickEdit.QuickComment.Edit");