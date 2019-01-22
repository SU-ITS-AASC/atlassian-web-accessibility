/**
 * Reply to comment.
 *
 * @module confluence-quick-edit/handlers/comment/reply
 */
define('confluence-quick-edit/handlers/comment/reply', [
    'ajs',
    'confluence/legacy',
    'jquery'
], function(
    AJS,
    Confluence,
    $
) {
    "use strict";

    var disableSlowComment = AJS.DarkFeatures.isEnabled("editor.slow.comment.disable");

    /**
     * This will customize the default editor so it looks something like the target editor: a reply comment editor
     * This is called after we fetch the editor resources and before the editor gets displayed
     *
     * @param {object} options.content Content retrieved by the REST end-point, if any.
     * @param {object} options.$form Form (jquery object)
     * @param {function} options.replayBufferedKeys  Key buffer unblocker function (will replay typed keys)
     */
    function preInitialise(options){
        AJS.Confluence.QuickEdit.QuickComment.preInitialise(options);
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
        AJS.Confluence.QuickEdit.QuickComment.postInitialise(options);
    }

    function getCommentId($comment) {
        var match = $comment.attr("id").match(/comment-(\d+)/);
        var parentCommentId = 0;
        if (match) {
            parentCommentId = parseInt(match[1]);
        } else {
            AJS.trigger('analytics', { name: 'rte.quick-edit.get-reply-parent.failed' });
            AJS.logError("replyHandler: activateEventHandler - could not extract a parent comment Id from the comment id " + $comment.attr("id"));
        }
        return parentCommentId;
    }

    /**
     * Handle transition when opening the editor
     * Insert the html elements necessary to instantiate an editor on it.
     * Display the gray container with spinner if resources have not been loaded yet
     * @param $comment
     */
    function handleTransition($comment) {
        var $placeHolderLogo = $(".quick-comment-container img.userLogo");
        var commenter = AJS.Confluence.QuickEdit.QuickComment.createCommenterParam($placeHolderLogo);
        var params = {
            "contentId": Confluence.getContentId(),
            "parentCommentId": getCommentId($comment),
            "commenter": commenter,
            "context": {
                "contextPath": AJS.Meta.get("context-path"),
                "staticResourceUrlPrefix": AJS.Meta.get("static-resource-url-prefix")
            }
        };

        var template = $(Confluence.Templates.Comments.displayReplyEditorLoadingContainer(params));
        var $loadingContainer = $('.quick-comment-loading-container', template);

        $loadingContainer.hide(); // we don't want to show the loading transition if we have the resources ready
        $comment.after(template);

        if (!AJS.Confluence.EditorLoader.resourcesLoaded()) {
            AJS.trigger('analytics', { name: 'rte.quick-edit.reply-comment.spinner' });
            $comment.after(template);
            $loadingContainer.fadeIn();
            $loadingContainer.spin('medium');
            $loadingContainer[0].scrollIntoView();
        }
        else {
            AJS.trigger('analytics', { name: 'rte.quick-edit.reply-comment.no-spinner' });
        }
    }

    function cleanResource(){
        var $comment = $(".comment.reply");
        var $commentThread = $comment.closest('.comment-threads');
        $commentThread.remove();
    }
    /**
     * replyHandler for use by QuickEdit
     */
    var replyHandler = {

        /**
         * Will display the editor structure when reply is activated. Expects 'this' to be the DOM element
         * that was activated.
         *
         * @param e the event triggering the activation
         */
        activateEventHandler: function(e) {

            e.preventDefault();
            e.stopPropagation();

            var self = this;

            if ($(self).attr('reply-disabled')){
                return false;
            }

            AJS.Confluence.QuickEdit.QuickComment.proceedWithActivation().done(function(){
                var $comment = $(self).closest("div.comment");

                handleTransition($comment);

                var $container = $(self).closest(".comment-thread").find(".quick-comment-container");

                // TODO why do we need this? documentation? tests?
                AJS.Meta.set("form-name", $("form", $container).attr("name"));

                AJS.Confluence.QuickEdit.activateEditor({
                    $container : $container,
                    $form: $('form.quick-comment-form[name=threadedcommentform]'),
                    preInitialise: preInitialise,
                    postInitialise: postInitialise,
                    saveHandler: AJS.Confluence.QuickEdit.QuickComment.createSaveHandler(AJS.Confluence.QuickEdit.QuickComment.delegatingSaveCommentHandler,
                        AJS.Confluence.QuickEdit.QuickComment.saveCommentErrorHandler),
                    cancelHandler: AJS.Confluence.QuickEdit.QuickComment.cancelHandler,
                    plugins: AJS.Confluence.Editor._Profiles.createProfileForCommentEditor().plugins,
                    postDeactivate: cleanResource,
                    additionalResources: ["wrc!comment-editor"],
                    timeoutResources: AJS.Confluence.QuickEdit.QuickComment.timeout
                }).fail(function() {
                    if (disableSlowComment) {
                        AJS.Confluence.QuickEdit.QuickComment.showLoadingEditorErrorMessage();
                    } else {
                        window.location = $("#reply-comment-" + getCommentId($comment)).attr("href");
                    }
                });

                $(self).attr('reply-disabled', true);
            });
        },

        /**
         * Enables handlers for reply comment
         */

        enable: function() {
            $("#comments-section").delegate(".action-reply-comment", "click", replyHandler.activateEventHandler);
        },

        /**
         * Disables handlers for reply comment
         */

        disable: function() {
            $("#comments-section").undelegate(".action-reply-comment", "click");
        }
    };

    AJS.Confluence.QuickEdit.register(replyHandler);

    return {
        cancelComment : function (){
            AJS.log("'AJS.Confluence.QuickEdit.QuickComment.Reply.cancelComment' is deprecated in 5.7, consider using 'AJS.Confluence.QuickEdit.QuickComment.cancelComment' instead.");
            return AJS.Confluence.QuickEdit.QuickComment.cancelComment();
        }
    };

});


require('confluence/module-exporter').exportModuleAsGlobal('confluence-quick-edit/handlers/comment/reply', 'AJS.Confluence.QuickEdit.QuickComment.Reply');