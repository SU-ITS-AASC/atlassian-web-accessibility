/**
 * A Manager that handles comment operations, as instigated by the Editor. This caveat basically means that
 * this manager deals with Editor formatted content. This Manager will deal with both handling the server side
 * operations involved in working with comments as well as also handling the displaying of comment operations by
 * delegating to the Confluence.CommentDisplayManager.
 *
 * @module confluence-quick-edit/editor-comment-manager
 */
define('confluence-quick-edit/editor-comment-manager', [
    'ajs',
    'jquery',
    'confluence/legacy'
], function(
    AJS,
    $,
    Confluence
) {
    "use strict";

    return function () {

        function getAddNewCommentUrl(contentId) {
            return AJS.contextPath() + "/rest/tinymce/1/content/" + contentId + "/comment?actions=true";
        }

        function getReplyToCommentUrl(contentId, parentCommentId) {
            return AJS.contextPath() + "/rest/tinymce/1/content/" + contentId + "/comments/" + parentCommentId + "/comment?actions=true";
        }

        function getEditCommentUrl(contentId, commentId) {
            return AJS.contextPath() + "/rest/tinymce/1/content/" + contentId + "/comments/" + commentId + "?actions=true";
        }

        function doAjaxSaveComment(url, editorHtml, watch, uuid, captcha, successCallback, errorCallback) {
            var saveCommentSuccessHandler = function(data, textStatus, jqXHR) {
                successCallback(data);
            };

            var saveCommentErrorHandler = function(jqXhr, textStatus, errorThrown) {
                var message = textStatus + ": " + errorThrown;
                if (jqXhr.responseText) {
                    message = message + " - " + jqXhr.responseText;
                }
                errorCallback(message, jqXhr);
            };

            AJS.trigger("analytics", {name: "confluence.page.comment.create", data: {
                pageID:  AJS.Meta.get('page-id')
            }});

            var ajaxData = {
                type: "POST",
                url: url,
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                data: {
                    "html": editorHtml,
                    "watch": watch,
                    "uuid": uuid
                },
                dataType : "json",
                cache: false,
                headers: {
                    "X-Atlassian-Token" : "no-check"
                },
                success : saveCommentSuccessHandler,
                error : saveCommentErrorHandler,
                timeout: 120000
            };

            if (captcha && captcha.id) {
                ajaxData.headers["X-Atlassian-Captcha-Id"] = captcha.id;
                ajaxData.headers["X-Atlassian-Captcha-Response"] = captcha.response;
            }

            $.ajax(ajaxData);
        }

        return {

            /**
             * Save a new comment and display it if successful.
             *
             * @param contentId the id of the content being commented on
             * @param parentId the of the comment being replied to. This should be 0 if this is not a reply
             * @param editorHtml editor formatted HTML which is the body of the comment
             * @param watch if true then start watching the content that is being commented on.
             * @param captcha the supplied captcha value (may be null if there is none supplied).
             * @param highlight true if you want the comment to appear highlighted
             * @param commenter the person making the comment. This is an object with the following structure:
             * {
             *     userName: (string),
             *     displayName: (string),
             *     profilePicture: {
             *         isDefault: (boolean),
             *         path: (string)
             *     }
             * }
             * @param successCallback a function taking a single parameter which represents the server returned comment that
             * is called on success. The parameter has the structure:
             * {
             *    id: (number) the id of the comment
             *    html: (HTML string) the rendered content of the comment
             *    ownerId: (number) the id of the content commented upon
             *    parentId: (number) the id of the comment this one is in reply to
             * }
             * @param errorCallback a function taking a single parameters which describes the error returned
             */
            addComment: function(contentId, parentId, editorHtml, watch, captcha, highlight, commenter, successCallback, errorCallback) {
                var saveCommentSuccessHandler = function(data) {
                    Confluence.CommentDisplayManager.addComment(commenter, data, highlight);
                    successCallback(data);
                };

                Confluence.Editor.CommentManager.saveComment(contentId, parentId, editorHtml, saveCommentSuccessHandler, errorCallback);
            },

            /**
             * Save a new comment. If you also want to display the saved comment you should call addComment.
             *
             * @param contentId the id of the content being commented on
             * @param parentId the of the comment being replied to. This should be 0 if this is not a reply
             * @param editorHtml editor formatted HTML which is the body of the comment
             * @param watch if true then start watching the content that is being commented on.
             * @param uuid a unique identifier for the comment
             * @param captcha the supplied captcha object
             * @param successCallback a function taking a single parameter which represents the server returned comment that
             * is called on success. The parameter has the structure:
             * {
             *    id: (number) the id of the comment
             *    html: (HTML string) the rendered content of the comment
             *    ownerId: (number) the id of the content commented upon
             *    parentId: (number) the id of the comment this one is in reply to
             * }
             * @param errorCallback a function taking a single parameters which describes the error returned
             */
            saveComment: function(contentId, parentId, editorHtml, watch, uuid, captcha, successCallback, errorCallback) {
                var url = null;
                if (parentId) {
                    url = getReplyToCommentUrl(contentId, parentId);
                } else {
                    url = getAddNewCommentUrl(contentId);
                }

                doAjaxSaveComment(url, editorHtml, watch, uuid, captcha, successCallback, errorCallback);
            },

            /**
             * Update an existing comment
             *
             * @param contentId the id of the content being commented on
             * @param commentId the id of the comment to be updated
             * @param editorHtml editor formatted HTML which is the body of the comment
             * @param watch if true then start watching the content that is being commented on.
             * @param captcha the supplied captcha object
             * @param successCallback a function taking a single parameter which represents the server returned comment that
             * is called on success. The parameter has the structure:
             * {
             *    id: (number) the id of the comment
             *    html: (HTML string) the rendered content of the comment
             *    ownerId: (number) the id of the content commented upon
             *    parentId: (number) the id of the comment this one is in reply to
             * }
             * @param errorCallback a function taking a single parameters which describes the error returned
             */
            updateComment: function(contentId, commentId, editorHtml, watch, captcha, successCallback, errorCallback) {
                var url = getEditCommentUrl(contentId, commentId);
                doAjaxSaveComment(url, editorHtml, watch, null, captcha, successCallback, errorCallback);
            }
        };
    };
});

require('confluence/module-exporter').safeRequire('confluence-quick-edit/editor-comment-manager', function(CommentManager) {
    var Confluence = require('confluence/legacy');

    require('ajs').bind("init.rte", function() {
        Confluence.Editor.CommentManager = CommentManager();
    });
});
