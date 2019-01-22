/**
 * @module confluence-quick-edit/handlers/page
 */
define('confluence-quick-edit/handlers/page', [
    'jquery',
    'ajs',
    'confluence/legacy',
    'confluence/meta',
    'confluence-quick-edit/handlers/shortcut',
    'confluence/aui-overrides',
    'confluence/analytics-support',
    'window',
    'confluence/api/browser',
    'confluence-editor/editor/page-editor-message',
    'confluence/message-controller',
    'confluence/api/event'
], function (
    $,
    AJS,
    Confluence,
    Meta,
    KeyboardShortcuts,
    AUIOverrides,
    ConfluenceAnalyticsSupport,
    window,
    Browser,
    EditorMessage,
    MessageController,
    event
) {

    "use strict";

    var $deferredActivation; // used to track editor activation state.
    var savedViewPort;

    var browser = new Browser(window.navigator.userAgent);

    /**
     * Sets an spinner for the edit button while we transition to edit mode
     */
    function showEditSpinner() {
        var $editPageLink = $('#editPageLink');
        $editPageLink.find('.aui-icon').css('visibility', 'hidden'); // hide current icon
        $editPageLink.spin();
    }

    function removeEditSpinner() {
        var $editPageLink = $('#editPageLink');
        $editPageLink.find('.aui-icon').css('visibility', 'visible'); // hide current icon
        $editPageLink.parent().spinStop();
    }

    function updatePermissionFields(data) { //CONFDEV-13487 - Update permissions fields
        if (data.permissions) {
            for (var perm in data.permissions) {
                $("#" + perm).attr('value', data.permissions[perm]);
            }
        }
    }

    function isCollaborativeContentType() {
        // Content-type can be changed from page to comment on view-page, so we need to check both properties
        // TODO: Refactor this to use the utility method in atlassian-editor-support.js. Having issues with almond resources causing the editor to fail to load in certain scenarios atm so just inlining the content type check.
        var contentType = Meta.get('content-type');
        return Meta.get('collaborative-content') && (contentType === 'page' || contentType === 'blogpost');
    }

    /**
     * Save current view port
     * @param $container
     * @param topOffset
     * @param pageId
     * @returns {*}
     */
    function getCurrentViewPort($container, topOffset, pageId) {
        var viewPort = {
            pageId: pageId,
            blockIndex: -1,
            columnIndex: -1,
            index: -1,
            offset: 0,
            hasBlock: function () {
                return this.blockIndex !== -1;
            }
        };
        var found = false;

        var calculateViewport = function ($element, index) {
            var elementOffset = $element.offset();
            if (isElementInCurrentViewport($element)) {
                viewPort.index = index;
                viewPort.offset = topOffset - elementOffset.top;
                found = true;
            }
        };

        var isElementInCurrentViewport = function ($element) {
            var elementOffset = $element.offset();
            return elementOffset.top - 8 <= topOffset && elementOffset.top + $element.height() >= topOffset;
        };

        // Has page layout
        var hasPageLayout = $container.children().length === 1 && $container.children().first().hasClass('contentLayout2');
        if (hasPageLayout) {
            $container.children().first().children().each(function (index) {
                if (viewPort.hasBlock()) {
                    return;
                }
                if (isElementInCurrentViewport($(this))) {
                    viewPort.blockIndex = index;
                }
            });
            if (viewPort.hasBlock()) {
                var $columns = $container.children().first().children().eq(viewPort.blockIndex).find('.innerCell');
                $columns.each(function (index) {
                    if (viewPort.columnIndex !== -1) {
                        return;
                    }
                    var numberOfChildren = $(this).children().length;
                    if (numberOfChildren > 0) {
                        if (numberOfChildren < 2) {
                            // Optimize for case that just have one empty line in this column
                            if ($(this).children().first().height() > 25) {
                                viewPort.columnIndex = index;
                            }
                        } else {
                            viewPort.columnIndex = index;
                        }
                    }
                });
                $columns.eq(viewPort.columnIndex).children().each(function (index) {
                    if (found) {
                        return;
                    }
                    calculateViewport($(this), index);
                });
            }
        } else {
            $container.children().each(function (index) {
                if (found) {
                    return;
                }
                calculateViewport($(this), index);
            });
        }

        return found ? viewPort : null;
    }

    /**
     * This will customize the default editor so it looks something like the target: a page editor
     * This is called after we fetch the editor resources and before the editor gets displayed
     *
     * @param {object} options.$container Editor main container (jquery object)
     * @param {object} options.content Content retrieved by the REST end-point, if any.
     * @param {object} options.$form Form (jquery object)
     * @param {function} options.replayBufferedKeys  Key buffer unblocker function (will replay typed keys)
     */
    function preInitialise(options) {
        var tinymce = require('tinymce');

        // prevent to trigger quick edit again. CONFDEV-27904
        QuickPageEdit.disable();

        AUIOverrides.metaToParams();

        if (AJS.DarkFeatures.isEnabled('confluence.view.edit.transition')) {
            // Save viewport
            var $mainContent = $('#main-content');
            var $header = $('#header');
            var $mainHeader = $('#main-header');
            var mainHeaderPosition = window.pageYOffset + $header.outerHeight() + $mainHeader.outerHeight();
            savedViewPort = getCurrentViewPort($mainContent, mainHeaderPosition, AJS.params.pageId);

            AJS.trigger('quick-edit.viewport.saved');

            // Add class for page edit editor
            var addPageEditClass = function () {
                $(tinymce.activeEditor.getWin().document).find('body#tinymce').addClass('page-edit');
                // Reset padding to zero to avoid css context conflict problem from view mode
                $('#content').css({paddingRight: 0});
                AJS.unbind('quickedit.visible', addPageEditClass);
            };
            AJS.bind('quickedit.visible', addPageEditClass);
        }

        var $form = options.$form;

        var formActionTarget = AJS.Meta.get('content-type') === 'page' ? 'doeditpage' : 'doeditblogpost';
        var formAction = AJS.contextPath() + '/pages/' + formActionTarget + '.action?pageId=' + Confluence.getContentId();

        $('.ia-splitter-left').remove();

        try {
            $('#main').unwrap();
        } catch (e) {
            //this try catch is here in case a plugin puts scripts in the body which throw exceptions on unwrap.
        }

        $('#rte').removeClass('editor-default').addClass('editor-fullheight');
        //hide stuff we don't need
        options.$container.children().remove();
        //There should be a way to remove editor-container all together but I don't have time to look into it right now.
        $('.editor-container').children().eq(0).unwrap();
        //we have to modify a lot of stuff here, would be better if the vm or soy templates set these things correctly.
        $form.attr({
            "class": "editor aui",
            "action": formAction,
            "name": "editpageform",
            "id": "editpageform",
            "style": ""
        });
        options.$container.append($form);
        options.$container.removeClass('view').addClass('edit');
        $('body').addClass('contenteditor edit');
    }

    /**
     ** Update token in case of session timeout and user is using "remember me"
     * @param options
     */
    function setAtlToken(token) {
        AJS.Meta.set('atl-token', token);
        $('input[name="atl_token"]').val(token);
    }

    /**
     *
     * @param options.editor
     * @param options.$container
     * @param options.content - content retrieved, if any
     * @param options.form
     */
    function postInitialise(options) {
        var tinymce = require('tinymce');

        // Specific elements that are present in the template, are being hidden by
        // quick edit by default, but we need them for quick edit page.
        // This is a middle term solution until we change how the editor preload template
        // is created.
        $('#editor-precursor').show();
        $('#rte-savebar').find('.toolbar-split-left').show();

        function pushState() {
            var editLink = $("#editPageLink").attr("href");
            var currentRelativeUrl = window.location.pathname + window.location.search;
            if (editLink != currentRelativeUrl) {
                history.pushState({quickEdit: true}, "", editLink);
                AJS.trigger("rte-quick-edit-push-state", editLink);
            }
        }

        function pushHash() {
            window.location.hash = "editor";
            AJS.trigger("rte-quick-edit-push-hash");
        }

        if (!!window.history.pushState) {
            pushState();
        } else {
            pushHash();
        }

        updatePermissionFields(options.content);

        // Update all page version fields to latest version at the time quick edit is initiated.
        // This attribute is used by draft autosave.
        $('#originalVersion').val(options.content.pageVersion);

        // Used by reliable save.
        AJS.Meta.set("page-version", options.content.pageVersion);

        // Make sure we have the latest page title before attempting a content reconciliation.
        AJS.Meta.set("page-title", options.content.title);

        // Updating the tag as well to avoid mismatch issues (we don't want them out of sync).
        $('meta[name="page-version"]').attr("content", options.content.pageVersion);
        $('meta[name="ajs-page-version"]').attr("content", options.content.pageVersion);

        // Update to latest revisions for Content Reconciliation (this need to happen before Synchrony connects/initialises its entity)
        $('#syncRev').val(options.content.syncRev);
        AJS.Meta.set("conf-revision", options.content.confRev);
        $('meta[name="ajs-conf-revision"]').attr("content", options.content.confRev);

        setAtlToken(options.content.atlToken);

        AJS.trigger('analyticsEvent', {name: 'quick-edit-success'});

        // We can get rid of the page edit navigation now, since we can not go back to the view page
        // once we are in quick-edit mode without a new page load.
        // By removing the edit button inside this element we will prevent the user triggering navigation to the edit page
        // using key shortcuts.
        // We can only remove this element once we are not doing any further use of $("#editPageLink")
        $('#navigation').remove();

        var startEditTime = new Date();
        var sendTransitionAnalytics = function (ed, e) {
            if (!startEditTime) {
                return;
            }

            if (e.type === "keydown") {
                var nonPrintableAndNavigationKeyCodes = [
                    91, 92, 93, 224, // Windows key
                    33, // page up
                    34, // page down
                    37, 38, 39, 40, // arrow up down left right
                    16, // shift
                    17, // control
                    18, // alternate
                    20, // caplocks
                    112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123 // F1 -> F12
                ];
                if (nonPrintableAndNavigationKeyCodes.indexOf(e.keyCode) > -1) {
                    return;
                }
            }

            var delayTime = (new Date() - startEditTime);
            startEditTime = null;
            Confluence.Analytics.publish('confluence.editor.transition.firstkeydown', {delay: delayTime});
            options.editor.onKeyDown.remove(sendTransitionAnalytics);
            options.editor.onChange.remove(sendTransitionAnalytics);
        };
        options.editor.onKeyDown.add(sendTransitionAnalytics);
        options.editor.onChange.add(sendTransitionAnalytics);

        Confluence.debugTimeEnd("confluence.editor");
    }

    //CONFDEV-37087
    /**
     *
     * @param ed editor ref
     */
    function restoreViewPort(ed) {
        var getPageLayoutCol = function ($editorBody) {
            return $editorBody.children().first().children().eq(savedViewPort.blockIndex).find('.innerCell');
        };

        var scheduledRestoreViewport = function () {
            event.unbind('rte-ready', scheduledRestoreViewport);

            // Restore viewport
            if (!savedViewPort) {
                return;
            }
            var $element;
            var $editorBody = $(ed.getBody());

            if (savedViewPort.hasBlock()) {
                $element = getPageLayoutCol($editorBody).eq(savedViewPort.columnIndex).children().eq(savedViewPort.index);
            } else {
                $element = $editorBody.children().eq(savedViewPort.index);
            }

            ed.getWin().scrollTo(0, $element.offset().top + savedViewPort.offset);
            $('#main').css('visibility', 'visible');
        };

        /**
         * Wait for page to load its content
         * to make sure body has correct number of children
         */
        event.bind('rte-ready', scheduledRestoreViewport);
    }

    function triggerCollaborativeContentReady(data) {
        AJS.trigger('rte-collaborative-content-ready', data);
    }

    /**
     * Returns a deferred object that will be resolved when content gets fetched.
     * Ideally, this should call the new Confluence API.
     * @returns {$.Deferred}
     */
    function fetchContent() {
        var responseDeferred = new $.Deferred();

        Confluence.debugTime("confluence.editor.quick.fetchContent");

        var xhr = $.ajax({
            url: AJS.contextPath() + "/rest/tinymce/1/content/" + Confluence.getContentId() + ".json",
            cache: false
        });

        xhr.success(function (data) {
            if (AJS.Meta.get("edit-mode") && AJS.Meta.get("edit-mode") !== data.editMode) {
                responseDeferred.reject('edit mode change', xhr);
            }

            Confluence.debugTimeEnd("confluence.editor.quick.fetchContent");
            if (isCollaborativeContentType()) {
                triggerCollaborativeContentReady(data);
            }

            AJS.bind('synchrony-events-bound', function handler() {
                triggerCollaborativeContentReady(data);
                AJS.unbind('synchrony-events-bound', handler);
            });

            responseDeferred.resolve(data);
        });

        xhr.error(function (failedXhr, status, ex) {
            responseDeferred.reject('error fetching content', failedXhr);
        });

        return responseDeferred;
    }

    function isThemeQuickEditEnabled() {
        return $('body').is('.theme-default');
    }

    function isEditorBeingActivated($activationPromise) {
        return ($activationPromise && $activationPromise.state() === "pending");
    }

    function onFailActivateEditor(e, xhr) {
        if (xhr) {
            switch (xhr.status) {
                case 405:
                    removeEditSpinner();
                    MessageController.showError(MessageController.parseError(xhr), MessageController.Location.FLAG);
                    return;
                case 423:
                    var userName = JSON.parse(xhr.responseText).user;
                    removeEditSpinner();
                    var error = {
                        title: AJS.I18n.getText("editor.unavailable.title"),
                        body: AJS.I18n.getText("limited.mode.existing.editor.body", AJS.escapeHtml(userName))
                    };
                    MessageController.showError(error, MessageController.Location.FLAG);
                    return;
                case 412:
                    removeEditSpinner();
                    EditorMessage.handleMessage('collab.edit.user.limit.reached', {
                        type: 'warning',
                        title: AJS.I18n.getText("collab.edit.user.limit.msg.title"),
                        message: AJS.I18n.getText("collab.edit.user.limit.msg.body"),
                        close: 'manual'
                    });
                    ConfluenceAnalyticsSupport.publish(
                        "collab.edit.user.limit.reached",
                        {
                            browserName: browser.friendlyName(),
                            browserVersion: browser.version(),
                            pageId: Meta.get('page-id'),
                            editMode: 'quick',
                            numEditors: Meta.get('max-number-editors')
                        }
                    );
                    return;
            }
        }
        window.location = $("#editPageLink").attr("href");
    }

    var QuickPageEdit = {
        editShortcut: KeyboardShortcuts.createShortcut('e', "#editPageLink"),

        /**
         * Handle the triggering of edit
         *
         * @param e the event triggering the activation
         */
        activateEventHandler: function (e) {

            if (e.metaKey || e.shiftKey || e.ctrlKey || e.altKey || e.which === 2 || e.which === 3) {
                return;
            }

            e.preventDefault();

            if (isEditorBeingActivated($deferredActivation)) {
                AJS.debug('Editor is being activated. Ignoring handler...');
                return;
            }

            $deferredActivation = QuickPageEdit.activateEditor();
            showEditSpinner();

            var draftStatusLozenge = $("#draft-status-lozenge");
            if (draftStatusLozenge.text() !== "") {
                AJS.Confluence.Analytics.publish('confluence.drafts.referrer',
                    {
                        referrerPage: "view",
                        lozengeType: draftStatusLozenge.text()
                    }
                );
            }
        },

        enable: function () {
            // enable quick-edit unless using default theme. note that we can't check the theme until
            // DOM ready
            if (isThemeQuickEditEnabled()) {
                var $editPageLink = $("#editPageLink");
                $editPageLink.bind('click', QuickPageEdit.activateEventHandler);
                $editPageLink.removeClass('full-load');
                QuickPageEdit.editShortcut.bind();
                AJS.debug("QuickPageEdit enabled");
            } else {
                AJS.debug("QuickPageEdit not enabled");
            }
        },

        activateEditor: function () {
            Confluence.debugTime("confluence.editor");
            if (isCollaborativeContentType()) {
                AJS.trigger('rte-quick-edit-init');
            }

            var editPageProfileOptions = { // quick edit not available for "create"
                versionComment: true,
                notifyWatchers: true
            };

            // if we have already a form that we can use from quick-comments being enabled
            var availableEditorForm = $('#content').find(".quick-comment-form");

            var saveViewPort = function () {
                var tinymce = require('tinymce');

                var editorWindow = tinymce.activeEditor.getWin();
                var $editorBody = $(editorWindow.document).find('#tinymce');
                var viewPort = getCurrentViewPort($editorBody, editorWindow.pageYOffset, AJS.params.pageId);
                if (viewPort) {
                    sessionStorage.viewPort = JSON.stringify(viewPort);
                }
            };

            return AJS.Confluence.QuickEdit.activateEditor({
                fetchContent: fetchContent(),
                $container: $('#content'),
                $form: availableEditorForm.length ? availableEditorForm : $('<form method="post"></form>'),
                preInitialise: preInitialise,
                postInitialise: postInitialise,
                saveHandler: function () {
                    if (AJS.DarkFeatures.isEnabled('confluence.view.edit.transition')) {
                        // Save viewport
                        saveViewPort();
                    }
                    if (Confluence.Editor.getNumConcurrentEditors() > 1) {
                        AJS.Confluence.Analytics.publish('rte.notification.concurrent-editing.save', {
                            numEditors: Confluence.Editor.getNumConcurrentEditors(),
                            pageId: AJS.params.pageId,
                            draftType: AJS.params.draftType
                        });
                    }
                },
                cancelHandler: function () {
                    if (AJS.DarkFeatures.isEnabled('confluence.view.edit.transition')) {
                        // Save viewport
                        saveViewPort();
                    }
                    if (Confluence.Editor.getNumConcurrentEditors() > 1) {
                        AJS.Confluence.Analytics.publish('rte.notification.concurrent-editing.cancel', {
                            numEditors: Confluence.Editor.getNumConcurrentEditors(),
                            pageId: AJS.params.pageId,
                            draftType: AJS.params.draftType
                        });
                    }
                },
                plugins: AJS.Confluence.Editor._Profiles.createProfileForPageEditor(editPageProfileOptions).plugins,
                onInitialise: function onInitialisePageEdit(ed) {
                    if (AJS.DarkFeatures.isEnabled('confluence.view.edit.transition')) {
                        ed.onLoad.add(restoreViewPort);
                    }
                    AJS.messages.setup();
                }
            }).fail(onFailActivateEditor);
        },

        disable: function () {
            AJS.debug("QuickPageEdit disabled.");
            QuickPageEdit.editShortcut.unbind();
            var $editPageLink = $("#editPageLink");
            $editPageLink.unbind("click", QuickPageEdit.activateEventHandler);
        }
    };

    AJS.Confluence.QuickEdit.register(QuickPageEdit);

    return {

        /**
         * Disables quick edit page handlers. Intended to be used when another editor has been
         * activated (so that the keyboard shortcut to quick-edit a page doesn't kick-in, among other things).
         *
         * If quick edit was previously enabled, calling this function directly will effectively disable
         * the 'edit' keyboard shortcut for quick and slow edit (because the slow edit shortcut handler
         * is disabled by quick edit, and is only re-bound when another editor instance is deactivated).
         */
        disable: QuickPageEdit.disable,
        /**
         * object exports functions for testing purposes
         */
        _objForTesting: {
            onFailActivateEditor: onFailActivateEditor
        }
    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-quick-edit/handlers/page', 'AJS.Confluence.QuickEdit.QuickEditPage');
