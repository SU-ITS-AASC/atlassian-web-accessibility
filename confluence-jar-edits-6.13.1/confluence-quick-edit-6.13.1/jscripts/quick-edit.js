/**
 * @module confluence-quick-edit/quick-edit
 */
define('confluence-quick-edit/quick-edit', [
    'ajs',
    'confluence/legacy',
    'confluence/templates',
    'confluence/meta',
    'jquery',
    'window',
    'document',
    'confluence-quick-edit/util',
    'wrm'
], function (AJS,
             Confluence,
             Templates,
             Meta,
             $,
             window,
             document,
             Util,
             WRM) {
    // Note: unit tests in confluence-test/confluence-qunit-test/src/main/resources/test/unit/
    /**
     * Quick edit plugin entry point
     */
    "use strict";

    var DEFAULT_LOAD_CONTENT_TIMEOUT = 4000; // ms

    var fullEditShortcutManager = {
        enableShortcut: function () {
            $('#editPageLink').addClass('full-load');
        },
        disableShortcut: function () {
            $('#editPageLink').removeClass('full-load');
        }
    };

    /**
     * Start resource loading
     * @returns {$.Deferred} a deferred object to keep tracking of resource loading
     */
    function getResourcesDeferred() {
        var loadResources = new $.Deferred();
        AJS.Confluence.EditorLoader.load(function () {
            setTimeout(function () {
                // the only reason for defering resolution to the next event loop
                // is to be able to reproduce a timeout when automated testing by setting loadingTimeout to 0.
                loadResources.resolve();
            }, 0);

        }, function () {
            loadResources.reject();
        });
        return loadResources;
    }

    /**
     * Currently, the editor preloading template gets loaded from a velocity template,
     * which contains all the necessary elements to create a full page editor (including things like
     * the editor precursor, breadcrumbs, etc)
     *
     * Ideally, we would want those elements not to be added to the DOM in the first place. Until we change that,
     * let's fix this by hiding everything that is not "default editor" related, and let's allow every
     * specific editor customisation to show them if necessary.
     */
    function hideEverythingNonEditorEssential() {
        $('#editor-precursor').hide();
        $('#rte-savebar').find('.toolbar-split-left').hide();
    }

    function isCollaborativeContentType() {
        // Content-type can be changed from page to comment on view-page, so we need to check both properties
        // TODO: Refactor this to use the utility method in atlassian-support.js. Having issues with almond resources causing the editor to fail to load in certain scenarios atm so just inlining the content type check.
        var contentType = Meta.get('content-type');
        return Meta.get('collaborative-content') && (contentType === 'page' || contentType === 'blogpost');
    }

    /**
     * See above for the reason this function lives here.
     * We do not want any collaborative specific rendering to take place for quick comment.
     * Content Type is not known at the time of compilation, so we need to compile this bit client side.
     */
    function renderQuickCommentCancel() {
        var html = Templates.Editor.Page.cancelButton({
            contentType: Meta.get('content-type'),
            sharedDraftsEnabled: Meta.getBoolean('shared-drafts')
        });

        var $rteCancel = $('#rte-button-cancel');
        var $doneContainer = $rteCancel.parent('.rte-toolbar-group-done');

        if ($doneContainer.length) {
            $doneContainer.remove();
            // The done container only exists when we're rendering the collaborative template, so we remove discard also.
            $('#rte-button-discard').remove();
        } else {
            $rteCancel.remove();
        }

        $('#rte-savebar').find('.toolbar-split-right').append(html);
    }

    /**
     * See above for the reason this function lives here.
     * We do not want any collaborative specific rendering to take place for quick comment.
     * Content Type is not known at the time of compilation, so we need to compile this bit client side.
     */
    function renderQuickCommentPreview() {
        var html = Templates.Editor.Page.previewButton({});
        $('#rte-button-ellipsis').parent().remove();
        $('#rte-savebar').find('.toolbar-group-preview').empty().append(html);
    }

    /**
     * Default pre initialisation.
     * This will be called after fetching editor resources and hence before tinymce is initialised
     *
     * @param {object} options.$container Editor main container (jquery object)
     * @param {object} options.content Content retrieved by the REST end-point, if any.
     * @param {object} options.$form Form (jquery object)
     * @param {function} options.replayBufferedKeys  Key buffer unblocker function (will replay typed keys)
     */
    function preInitialise(options) {
        $(".quick-comment-prompt", options.$container).hide();

        // TODO this only applies to comments, should it go into a comment preInitialise method?
        $(".quick-comment-body", options.$container).addClass("comment-body");

        var $preloadContainer = AJS.Confluence.EditorLoader.getPreloadContainer();

        // CONF-35371 load the latest content title
        if (options.content && options.content.title) {
            setContentTitle($preloadContainer, options.content.title);
        }

        options.$form.append($preloadContainer.children());
        $preloadContainer.show();

        hideEverythingNonEditorEssential();
        if (Meta.get('content-type') === 'comment') {
            $('#pluggable-status').hide();
            renderQuickCommentCancel();
            renderQuickCommentPreview();
        }
    }

    /**
     * Set the latest page's title to a preloaded container.
     * When page is viewed, its editor container is also loaded but with an old page title.
     * If a user clicks edit, the latest page's title must be loaded.
     * @param $preloadContainer preloaded editor container
     * @param title the latest page's title
     */
    function setContentTitle($preloadContainer, title) {
        var $title = $preloadContainer.find("#content-title");
        $title.val(title);
    }

    /**
     * If provided, set editor content.
     * @param editor
     * @param initialContent the initialContent to load into the editor, e.g. the current state of an existing page.
     */
    function setEditorContent(editor, initialContent, replayBufferedKeys) {
        if (initialContent) {
            AJS.debug("Initial Editor Content from quick edit: ", initialContent);
            // set initial content
            editor.setContent(initialContent);
            // CONFDEV-19832 - Since we are setting the editor content we also need to updated its start value
            // startContent is what tinymce uses with isDirty to determine if changes occurred
            editor.startContent = editor.getContent({format: 'raw', no_events: 1});

            //Ensure first undo step doesn't blow away the content we just set.  This isn't related to the startContent.
            editor.undoManager.clear();
        }
        if (replayBufferedKeys()) {
            editor.undoManager.add();
        }
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
    function postInitialise(options) {
        // hiding loading container
        var $loadingContainer = options.$container.find(".quick-comment-loading-container"); // the big grey comment-shaped box
        $loadingContainer.hide(); // hide the placeholder if it is shown

        options.$form.show();
        options.$form.addClass("fadeIn");

        var editorContent = options.content ? options.content.editorContent : '';
        setEditorContent(options.editor, editorContent, options.replayBufferedKeys);
        triggerEditorReadyEvents();
    }

    var handlers = [];

    function triggerEditorReadyEvents() {
        AJS.trigger('quickedit.success');
        AJS.trigger('quickedit.visible');
        AJS.trigger("add-bindings.keyboardshortcuts");
        AJS.trigger("active.dynamic.rte");
    }

    var QuickEdit = {

        /**
         * Timeout on the xhr request that loads content (edit page or edit comment)
         * before we fallback to slow edit.
         */

        loadingContentTimeout: DEFAULT_LOAD_CONTENT_TIMEOUT,

        /**
         * Register a quick edit handler (top-level, reply handler, etc)
         * @param handler
         */

        register: function (handler) {
            handlers.push(handler);
        },

        /**
         * Disable all handlers.
         * When activate a top-level comment, for example, we may want to disable the comment reply handlers
         * @param handler
         */

        disableHandlers: function () {
            $.each(handlers, function (i, current) {
                return current.disable();
            });
        },

        /**
         * Enables all handlers
         * @param handler
         */

        enableHandlers: function () {
            $.each(handlers, function (i, current) {
                return current.enable();
            });
        },


        /**
         * An object that binds actions to the save bar as necessary
         */

        SaveBarBinder: {
            bind: function (saveHandler, cancelHandler) {
                if (saveHandler) {
                    Confluence.Editor.addSaveHandler(saveHandler);
                }

                if (cancelHandler) {
                    Confluence.Editor.addCancelHandler(cancelHandler);
                }
            }
        },

        /**
         * Activates the editor
         *
         * @param options.fetchContent {object} Deferred object
         * @param options.fallbackUrl {object} Url to fall back to in case of failure. NOTE: this option is deprecated. To be removed in the next major version (5.8 or 6.0). Please use the promise returned to bind custom action if the editor fails to load instead.
         * @param options.$container {object} The container containing the necessary structure to activate the editor within.
         * @param options.$form {object} The target editor form.
         * @param options.saveHandler {object} Save handler.
         * @param options.cancelHandler {object} Cancel handler.
         * @param options.preActivate {object} (optional) Pre-activation handler. Gets executed before the call to fetch resources.
         * @param options.preInitialise {object} (optional) Pre-initialisation handler. Gets executed after the resources are fetched but before the editor gets loaded.
         * @param options.postInitialise {object} (optional) Post-initialisation handler. Gets executed after editor has loaded.
         * @param options.toolbar {object} (optional) Toolbar initialisation options.
         *        Ex: toolbar : { Style : false }
         *        or, when  we implement more granular options: toolbar : { Style : { Bold: true, Italic: false } }
         * @param options.plugins {Array} (optional) List of additional plugins to load
         * @param options.excludePlugins {Array} List of plugins to be excluded from the editor.
         *        Plugins in this list will override plugins from the parameter before.
         * @param options.postDeactivate {function} (optional) callback function execute after destroy editor.
         * @param options.timeoutResources {number} (optional) timeout for editor resources to be loaded (milliseconds)
         * @param options.additionalResources {Array} (optional) additional resources to include via WRM.require
         * @param options.onInitialise {Function} Callback to be executed right after TinyMCE was initialised
         *
         * @returns promise tracking editor activation
         */
        activateEditor: function (options) {
            function doActivate() {
                var replayBufferedKeys;
                var $deferredInitialisation = new $.Deferred();
                if (Meta.get("access-mode") === "READ_ONLY") {
                    AJS.logError('activateEditor could not be initialised: Read-only mode is enabled');
                    return $deferredInitialisation.reject('READ_ONLY');
                }
                if (AJS.Rte && AJS.Rte.getEditor()) {
                    AJS.debug('there is already an editor open');
                    return $deferredInitialisation.reject('EDITOR_OPEN');
                }

                if (!options.$container || !options.$form) {
                    AJS.logError("activateEditor could not be initialised: bad arguments", options);
                    return $deferredInitialisation.reject('BAD_ARGS');
                }

                // start capturing typed keys until editor shows up so we can replay them
                replayBufferedKeys = AJS.Confluence.BlockAndBuffer.block($(document));

                options.preActivate && options.preActivate();

                fullEditShortcutManager.disableShortcut();

                /**
                 * Called when all the necessary deferred objects to load the editor get resolved
                 *
                 * @param resources {object} object returned by resource loader
                 * @param content {object} Content, if any
                 */
                function loadEditor(resources, content) {
                    var initOptions = {
                        $container: options.$container,
                        content: content,
                        $form: options.$form,
                        replayBufferedKeys: replayBufferedKeys
                    };

                    // custom, injected pre-initialisation (top-level, reply, page, etc)
                    options.preInitialise && options.preInitialise(initOptions);

                    // default, common preInitialise. Goes after custom preinitialisation
                    preInitialise(initOptions);

                    var onInit = function () { // editor ready!
                        // custom and default post-initialisation
                        initOptions.editor = AJS.Rte.getEditor();
                        postInitialise(initOptions);
                        options.postInitialise && options.postInitialise(initOptions);

                        QuickEdit.SaveBarBinder.bind(options.saveHandler,
                            options.cancelHandler);

                        AJS.trigger('rte-quick-edit-ready');
                        if (isCollaborativeContentType()) {
                            AJS.trigger('rte-collab-editor-loaded');
                        }
                        AJS.unbind('rte-ready', onInit);
                        $deferredInitialisation.resolve();
                    };

                    AJS.bind("rte-ready", onInit);
                    AJS.bind("rte-destroyed", options.postDeactivate || function () {
                        });

                    AJS.Rte.BootstrapManager.initialise({
                        plugins: options.plugins,
                        toolbar: options.toolbar,
                        excludePlugins: options.excludePlugins,
                        isQuickEdit: true,
                        onInitialise: options.onInitialise
                    });
                }

                function handleErrorActivatingEditor(e, xhr) {
                    $deferredInitialisation.reject(e, xhr);
                    AJS.logError('Error loading page quick edit. Falling back to normal edit URL...');
                    AJS.trigger('analytics', {name: 'rte.quick-edit.activate-editor.failed'});

                    // Todo: remove fallbackURL in the next major version (5.8 or 6.0)
                    if (options.fallbackUrl) {
                        AJS.log('This parameter is deprecated. To be removed in the next major version (5.8 or 6.0). Please use the promise returned to bind custom action if the editor fails to load instead.');
                        window.location = options.fallbackUrl;
                    }
                }

                /**
                 * .-
                 *  Main
                 *  Loads the editor when the dependent deferred objects get resolved
                 *  -.
                 */
                var timeoutLoadingEditorResources = options.timeoutResources || AJS.Confluence.EditorLoader.loadingTimeout;
                var timeoutLoadingContent = QuickEdit.loadingContentTimeout;

                // Returns a deferred object form the WRM.require promise so it can be rejected
                function getWRMDeferred(resources) {
                    var deferred = new $.Deferred();
                    WRM.require(resources).done(function (data) {
                        deferred.resolve(data);
                    }).fail(function (e) {
                        deferred.reject(e);
                    });
                    return deferred;
                }

                var timeoutFn = Util.timeoutDeferred;
                $.when(
                    timeoutFn("resources", getResourcesDeferred(), timeoutLoadingEditorResources),
                    timeoutFn("fetch content", options.fetchContent || $.Deferred().resolve(), timeoutLoadingContent), // fetch content or use empty deferred (will resolve immediately)
                    timeoutFn("additional resources", options.additionalResources ? getWRMDeferred(options.additionalResources) : $.Deferred().resolve(), timeoutLoadingEditorResources) // fetch additional resources
                )
                    .done(loadEditor)
                    .fail(handleErrorActivatingEditor);

                return $deferredInitialisation.promise();
            }

            if (options.closeAnyExistingEditor && AJS.Rte && AJS.Rte.getEditor()) {
                var $deferredActivation = new $.Deferred();

                // Deactivate all existing editor
                this.deactivateEditor()
                    .done(function () {
                        // when it's done, activate new editor
                        doActivate().done(function () {
                            $deferredActivation.resolve();
                        }).fail(function (e) {
                            $deferredActivation.reject(e);
                        });
                    })
                    .fail(function () {
                        AJS.debug('Could not deactivate current editor.');
                        $deferredActivation.reject('Could not deactivate current editor.');
                    });

                return $deferredActivation.promise();
            } else {
                return doActivate();
            }
        },

        /**
         * Close and deactivate the editor.
         * @return promise tracking editor deactivation
         */
        deactivateEditor: function () {
            if (require('tinymce').majorVersion >= 4) {
                //tiny 4 API (fd-87.editor.spa, Foxy)
                require('tinymce').execCommand('mceRemoveEditor', true, 'wysiwygTextarea');
            } else {
                //tiny 3 API
                require('tinymce').execCommand('mceRemoveControl', true, 'wysiwygTextarea');
            }

            Confluence.Editor.UI.toggleSavebarBusy(false);

            // ensure cleanup
            var $preloadContainer = AJS.Confluence.EditorLoader.getPreloadContainer().empty();

            // not really happy with what we are doing here
            // lot of technical debt still to be paid
            $('.editor-container').remove();
            $('#editor-precursor').remove();
            $("#anonymous-warning").remove();

            $(".quick-comment-prompt").show();
            $('.bottom-comment-panels').show(); // show top level comment

            $('#editor-notification-container').empty();

            // enable all reply links back
            $('.action-reply-comment').removeAttr('reply-disabled');

            fullEditShortcutManager.enableShortcut();

            Confluence.Editor.removeAllSaveHandlers();
            Confluence.Editor.removeAllCancelHandlers();

            // wrapping the editor back
            return AJS.Confluence.EditorLoader.getEditorPreloadMarkup().done(function (markup) {
                $preloadContainer.append(markup);
                $preloadContainer.hide();

                // refresh captcha, if needed
                var captchaManager = new AJS.Confluence.QuickEditCaptchaManager($preloadContainer);
                captchaManager.refreshCaptcha();

                AJS.trigger("rte-destroyed");
                AJS.unbind("rte-destroyed");
            });
        }
    };

    return QuickEdit;

});

require('confluence/module-exporter')
    .exportModuleAsGlobal('confluence-quick-edit/quick-edit', 'AJS.Confluence.QuickEdit');
