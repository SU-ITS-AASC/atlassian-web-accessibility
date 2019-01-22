/**
 * @module confluence-quick-edit/comment-display-manager
 */
define('confluence-quick-edit/comment-display-manager', [
    'ajs',
    'confluence/legacy',
    'confluence/templates',
    'jquery'
], function(
    AJS,
    Confluence,
    Templates,
    $
) {
    "use strict";
    // TODO this should be merged with Confluence.Comments from comments.js in the core product.
    // At the moment it is kept separate because having it in a plugin is better for dev speed.
    // This script is dependent on templates in comments.soy

    var createTemplateInjectionContext = function() {
        return {
            "contextPath": AJS.Meta.get("context-path"),
            "staticResourceUrlPrefix": AJS.Meta.get("static-resource-url-prefix")
        };
    };

    var createTemplateParameters = function(commenter, comment, highlight) {
        return {
            "comment": comment,
            "commenter": commenter,
            "highlight": highlight,
            "context": createTemplateInjectionContext()
        };
    };

    var CommentDisplayManager = {};

    /**
     * Update the comments section heading if it exists with the current number
     * of comments.
     */
    CommentDisplayManager._updateCommentSectionTitle = function() {
        var $title = $("#comments-section-title");
        if ($title.length === 0) {
            return;
        }

        var count = this.commentCount();
        if (count === 1) {
            $title.text(AJS.I18n.getText("comment.singular"));
        } else {
            $title.text(AJS.format(AJS.I18n.getText("comment.plural"), count));
        }
    };

    /**
     * Add and focus the display on a new comment.
     *
     * @param commenter the person making the comment. This is an object with the following structure:
     * {
     *     userName:       (string)
     *     displayName:    (string)
     *     profilePicture: {
     *         isDefault: (boolean)
     *         path:      (string)
     *     }
     * }
     * @param comment the comment. This is an object with the following structure:
     * {
     *     id:               (number)
     *     html:             (string)
     *     ownerId:          (number)
     *     parentId:         (number) 0 indicates a top level comment
     *     primaryActions:    (array of actions) may be empty
     *     secondaryActions: (array of actions) may be empty
     * }
     * @param highlight true if you want the comment to appear highlighted
     * @param keepFocus true if you don't want to clear the focus
     * @returns a jQuery wrapped DOM Node which is the top container for the newly added comment.
     */
    CommentDisplayManager.addComment = function(commenter, comment, highlight, keepFocus) {
        var templateParams = createTemplateParameters(commenter, comment, highlight);
        var $renderedTemplate;

        if (!this.hasComments()) {
            templateParams.firstReply = true;
            $renderedTemplate = $(Templates.Comments.displayComment(templateParams));
            $renderedTemplate.addClass('fadeInComment');
            $("#comments-section").prepend($renderedTemplate);
        } else {

            var $appendLocation;

            if (comment.parentId === 0) {
                templateParams.firstReply = false;
                $appendLocation = $("#comments-section").find(".comment-threads.top-level");
            } else {
                var $commentThread = $("#comment-thread-" + comment.parentId);
                var $replyThread = $commentThread.children(".commentThreads");

                if ($replyThread.length) {
                    templateParams.firstReply = false;
                    $appendLocation = $replyThread;
                } else {
                    templateParams.firstReply = true;
                    $appendLocation = $commentThread;
                }
            }
            if (!keepFocus) {
                this.clearFocus();
            }

            $renderedTemplate = $(Templates.Comments.displayComment(templateParams));
            $renderedTemplate.addClass('fadeInComment');
            $appendLocation.append($renderedTemplate);
            this._updateCommentSectionTitle();
        }

        Confluence.Comments.bindRemoveConfirmation(comment.id);
        var $insertedComment = this.getCommentNode(comment.id);
        // Scroll to the newly added comment.
        $insertedComment.scrollToElement();
        return $insertedComment;
    };

    /**
     * Add or focus the display on a new comment, or update an existing comment.
     *
     * @see Confluence.CommentDisplayManager.addComment for more information.
     */
    CommentDisplayManager.addOrUpdateComment = function(commenter, comment, highlight, keepFocus) {
        var oldComment = this.getCommentNode(comment.id);
        if (oldComment) {
            oldComment.find('.comment-content').html(comment.html);
            if (!keepFocus) {
                this.clearFocus();
            }
            if (highlight) {
                oldComment.addClass('focused');
            }
            oldComment.addClass('fadeInComment');
            oldComment.scrollToElement();
            return oldComment;
        } else {
            return this.addComment.apply(this, arguments);
        }
    };

    /**
     * @return true if the comment section is visible.
     */
    CommentDisplayManager.isVisible = function() {
        return !$('#page-comments').hasClass("hidden");
    };

    /**
     * @return true if there are any comments displayed on the page.
     */
    CommentDisplayManager.hasComments = function() {
        return this.commentCount() > 0;
    };

    /**
     * @return the number of comments on the page.
     */
    CommentDisplayManager.commentCount = function() {
        return $("#comments-section .comment").not(".quick-comment-container").length;
    };

    /**
     * Remove the focus from all comments
     */
    CommentDisplayManager.clearFocus = function() {
        $(".comment").removeClass("focused");
    };

    /**
     * @param commentId the id of the comment required
     * @returns the jQuery wrapped DOM node for the top div of the identified comment or null if not found.
     */
    CommentDisplayManager.getCommentNode = function(commentId) {
        var $node = $("#comment-" + commentId);

        if (!$node.length) {
            return null;
        } else {
            return $node;
        }
    };

    /**
     * Get the id of the comment the indicated one is a reply to. If the comment is not a reply
     * then return 0.
     *
     * @param commentId the id of the comment whos parent is required
     * @return the id of the parent comment or 0 if the comment is not a reply.
     */
    CommentDisplayManager.getParentId = function(commentId) {
        var $comment = CommentDisplayManager.getCommentNode(commentId);

        if ($comment != null) {
            var $parentComment = $comment.closest("div.comment");
            if ($parentComment.length) {
                var idStr = $parentComment.attr("id");
                var id = /\d+/.exec(idStr);
                return parseInt(id);
            }
        }

        return 0;
    };

    return CommentDisplayManager;
});


require('confluence/module-exporter').exportModuleAsGlobal('confluence-quick-edit/comment-display-manager', 'Confluence.CommentDisplayManager');