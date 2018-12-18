define("confluence-quick-edit/handlers/comment/edit",["ajs","confluence-quick-edit/handlers/comment","jquery","confluence/legacy"],function(e,b,d,i){function j(a){b.preInitialise(a);a.$container.scrollWindowToElement()}function k(a){b.postInitialise(a)}function h(a){return(a=a.attr("id").match(/comment-(\d+)/))?parseInt(a[1]):0}function l(a){var b=new d.Deferred;d.ajax({url:e.contextPath()+"/rest/api/content/"+a+"?expand=body.editor",cache:!1}).done(function(a){!a||!a.body||!a.body.editor?b.reject("invalid response from loading comment rest endpoint"):
b.resolve({editorContent:a.body.editor.value})}).fail(function(){b.reject("error fetching content")});return b}function m(){var a=d(".comment.edit");a.prev(".comment").show();a.remove()}var n=e.DarkFeatures.isEnabled("editor.slow.comment.disable"),g={activateEventHandler:function(a){var g=this;a.preventDefault();a.stopPropagation();b.proceedWithActivation().done(function(){var a=d(g).closest("div.comment"),c;c=a.find(".author .confluence-userlink");var f=a.find(".comment-user-logo img.userLogo");
c=b.createCommenterParam(f,c.attr("data-username"),c.text());c={contentId:i.getContentId(),commentId:h(a),commenter:c,context:{contextPath:e.Meta.get("context-path"),staticResourceUrlPrefix:e.Meta.get("static-resource-url-prefix")},mode:"edit"};c=d(i.Templates.Comments.displayEditEditorContainer(c));f=d(".quick-comment-loading-container",c);a.hide();a.after(c);f.fadeIn().spin("medium");f[0].scrollIntoView();c=a.next(".quick-comment-container");e.Meta.set("form-name",d("form",c).attr("name"));e.Confluence.QuickEdit.activateEditor({$container:c,
$form:d("form.quick-comment-form[name=editcommentform]"),fetchContent:l(h(a)),preInitialise:j,postInitialise:k,saveHandler:b.createSaveHandler(b.delegatingSaveCommentHandler,b.saveCommentErrorHandler),cancelHandler:b.cancelHandler,plugins:e.Confluence.Editor._Profiles.createProfileForCommentEditor().plugins,postDeactivate:m,additionalResources:["wrc!comment-editor"],timeoutResources:b.timeout}).fail(function(){n?b.showLoadingEditorErrorMessage():window.location=d("#edit-comment-"+h(a)).attr("href")})})},
enable:function(){d("#comments-section").delegate(".comment-action-edit","click",g.activateEventHandler)},disable:function(){d("#comments-section").undelegate(".comment-action-edit","click")}};e.Confluence.QuickEdit.register(g);return{cancelComment:function(){e.log("'AJS.Confluence.QuickEdit.QuickComment.Edit.cancelComment' is deprecated in 5.7, consider using 'AJS.Confluence.QuickEdit.QuickComment.cancelComment' instead.");return b.cancelComment()}}});
require("confluence/module-exporter").exportModuleAsGlobal("confluence-quick-edit/handlers/comment/edit","AJS.Confluence.QuickEdit.QuickComment.Edit");