/**
 * Edit existing comment.
 *
 * @module confluence-quick-edit/handlers/comment/edit
 */
define('confluence-quick-edit/handlers/comment/edit', [
    'ajs',
    'confluence-quick-edit/handlers/comment',
    'jquery',
    'confluence/legacy'
], function(
    AJS,
    QuickComment,
    $,
    Confluence
) {
    "use strict";

    var disableSlowComment = AJS.DarkFeatures.isEnabled("editor.slow.comment.disable");

    /**
     * This will customize the default editor so it looks something like the target editor: a edit comment editor
     * This is called after we fetch the editor resources and before the editor gets displayed
     *
     * @param {object} options.content Content retrieved by the REST end-point, if any.
     * @param {object} options.$form Form (jquery object)
     * @param {function} options.replayBufferedKeys  Key buffer unblocker function (will replay typed keys)
     */
    function preInitialise(options){
        QuickComment.preInitialise(options);
        options.$container.scrollWindowToElement(); //use scroll-util jquery plugin
    }

    /**
     * Called after editor initialisation
     *
     * @param {object} options.editor Editor instance
     * @param {object} options.$container Editor main container (jquery object)
     * @param {object} options.content Content retrieved by the REST end-point, if any.
     * @param {object} options.$form Form (jquery object)
     * @param {function} options.replayBufferedKeys  Key buffer unblocker function (will replay typed keys)
     */
    function postInitialise (options){
        QuickComment.postInitialise(options);
    }

    function getCommentId($comment) {
        var match = $comment.attr("id").match(/comment-(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    /**
     * Create commenter from a comment UI. The author of the comment may not be the current logged in user.
     *
     * @param $comment the existing comment element
     * @return commenter object
     */
    function createCommenterFromComment($comment) {
        var $link = $comment.find(".author .confluence-userlink");
        var $userLogoImg = $comment.find(".comment-user-logo img.userLogo");

        return QuickComment.createCommenterParam($userLogoImg,
                $link.attr("data-username"), $link.text());
    }

    /**
     * Handle transition when opening the editor to edit a comment. The existing comment is temporarily hidden so that
     * we can show it after saving new content (to be replaced), or after cancelling editing.
     * Insert the html elements necessary to instantiate an editor on it.
     * Display the gray container with spinner if resources have not been loaded yet
     * @param $comment
     */
    function handleTransition($comment) {
        var commenter = createCommenterFromComment($comment);
        var params = {
            "contentId": Confluence.getContentId(),
            "commentId": getCommentId($comment),
            "commenter": commenter,
            "context": {
                "contextPath": AJS.Meta.get("context-path"),
                "staticResourceUrlPrefix": AJS.Meta.get("static-resource-url-prefix")
            },
            "mode": "edit"
        };

        var template = $(Confluence.Templates.Comments.displayEditEditorContainer(params));
        var $loadingContainer = $('.quick-comment-loading-container', template);
        $comment.hide();
        $comment.after(template);
        $loadingContainer.fadeIn().spin('medium');
        $loadingContainer[0].scrollIntoView();
    }

    /**
     * Retrieve an existing comment's editor format
     *
     * @param commentId the id of the comment to retrieve content
     * @returns {$.Deferred} resolved with the comment's editor format when AJAX call returns successfully
     */
    function fetchCommentContent(commentId) {
        var responseDeferred = new $.Deferred();

        $.ajax({
            url: AJS.contextPath() + "/rest/api/content/" + commentId + "?expand=body.editor",
            cache: false
        }).done(function(data){
            if (!data || !data.body || !data.body.editor){
                responseDeferred.reject('invalid response from loading comment rest endpoint');
            }
            else{
                responseDeferred.resolve({editorContent: data.body.editor.value});
            }
        }).fail(function(xhr, status, ex){
            responseDeferred.reject('error fetching content');
        });

        return responseDeferred;
    }

    function cleanResource() {
        var $commentEditing = $(".comment.edit");
        $commentEditing.prev(".comment").show();
        $commentEditing.remove();
    }

    /**
     * editHandler for use by QuickEdit
     */
    var editHandler = {

        /**
         * Will display the editor structure when edit is activated. Expects 'this' to be the DOM element
         * that was activated.
         *
         * @param e the event triggering the activation
         */
        activateEventHandler: function(e) {
            var self = this;
            e.preventDefault();
            e.stopPropagation(); // in case parent handlers are relying on us not allowing the click through.

            QuickComment.proceedWithActivation().done(function(){
                var $comment = $(self).closest("div.comment");

                handleTransition($comment);

                var $container = $comment.next(".quick-comment-container");

                // TODO why do we need this? documentation? tests?
                AJS.Meta.set("form-name", $("form", $container).attr("name"));

                AJS.Confluence.QuickEdit.activateEditor({
                    $container : $container,
                    $form: $('form.quick-comment-form[name=editcommentform]'),
                    fetchContent: fetchCommentContent(getCommentId($comment)),
                    preInitialise: preInitialise,
                    postInitialise: postInitialise,
                    saveHandler: QuickComment.createSaveHandler(QuickComment.delegatingSaveCommentHandler, QuickComment.saveCommentErrorHandler),
                    cancelHandler: QuickComment.cancelHandler,
                    plugins: AJS.Confluence.Editor._Profiles.createProfileForCommentEditor().plugins,
                    postDeactivate: cleanResource,
                    additionalResources: ["wrc!comment-editor"],
                    timeoutResources: QuickComment.timeout
                }).fail(function() {
                    if (disableSlowComment) {
                        QuickComment.showLoadingEditorErrorMessage();
                    } else {
                        window.location = $("#edit-comment-" + getCommentId($comment)).attr("href");
                    }
                });

            });
        },

        /**
         * Enables handlers for edit comment
         */

        enable: function() {
            $("#comments-section").delegate(".comment-action-edit", "click", editHandler.activateEventHandler);
        },

        /**
         * Disables handlers for edit comment
         */

        disable: function() {
            $("#comments-section").undelegate(".comment-action-edit", "click");
        }
    };

    AJS.Confluence.QuickEdit.register(editHandler);

    return {
        cancelComment : function () {
            AJS.log("'AJS.Confluence.QuickEdit.QuickComment.Edit.cancelComment' is deprecated in 5.7, consider using 'AJS.Confluence.QuickEdit.QuickComment.cancelComment' instead.");
            return QuickComment.cancelComment();
        }
    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-quick-edit/handlers/comment/edit', 'AJS.Confluence.QuickEdit.QuickComment.Edit');