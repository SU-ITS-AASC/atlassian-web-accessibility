define("confluence-quick-edit/comment-display-manager",["ajs","confluence/legacy","confluence/templates","jquery"],function(g,j,h,c){var i={_updateCommentSectionTitle:function(){var a=c("#comments-section-title");if(0!==a.length){var b=this.commentCount();1===b?a.text(g.I18n.getText("comment.singular")):a.text(g.format(g.I18n.getText("comment.plural"),b))}},addComment:function(a,b,f,d){a={comment:b,commenter:a,highlight:f,context:{contextPath:g.Meta.get("context-path"),staticResourceUrlPrefix:g.Meta.get("static-resource-url-prefix")}};
if(this.hasComments()){if(0==b.parentId)a.firstReply=!1,f=c("#comments-section .comment-threads.top-level");else{var f=c("#comment-thread-"+b.parentId),e=f.children(".commentThreads");e.length?(a.firstReply=!1,f=e):a.firstReply=!0}d||this.clearFocus();d=c(h.Comments.displayComment(a));d.addClass("fadeInComment");f.append(d);this._updateCommentSectionTitle()}else a.firstReply=!0,d=c(h.Comments.displayComment(a)),d.addClass("fadeInComment"),c("#comments-section").prepend(d);j.Comments.bindRemoveConfirmation(b.id);
b=this.getCommentNode(b.id);b.scrollToElement();return b},addOrUpdateComment:function(a,b,c,d){var e=this.getCommentNode(b.id);return e?(e.find(".comment-content").html(b.html),d||this.clearFocus(),c&&e.addClass("focused"),e.addClass("fadeInComment"),e.scrollToElement(),e):this.addComment.apply(this,arguments)},isVisible:function(){return!c("#page-comments").hasClass("hidden")},hasComments:function(){return 0<this.commentCount()},commentCount:function(){return c("#comments-section .comment").not(".quick-comment-container").length},
clearFocus:function(){c(".comment").removeClass("focused")},getCommentNode:function(a){a=c("#comment-"+a);return a.length?a:null},getParentId:function(a){a=i.getCommentNode(a);return null!=a&&(a=a.closest("div.comment"),a.length)?(a=a.attr("id"),a=/\d+/.exec(a),parseInt(a)):0}};return i});require("confluence/module-exporter").exportModuleAsGlobal("confluence-quick-edit/comment-display-manager","Confluence.CommentDisplayManager");