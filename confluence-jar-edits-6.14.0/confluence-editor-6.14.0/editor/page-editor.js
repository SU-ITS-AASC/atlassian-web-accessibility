/**
 * @module confluence-editor/editor/page-editor
 */
define('confluence-editor/editor/page-editor', [
    'ajs',
    'confluence/legacy',
    'jquery',
    'document',
    'window',
    'confluence/meta',
    'confluence/api/constants',
    'confluence-editor/editor/page-editor-message'
], function (
    AJS,
    Confluence,
    $,
    document,
    window,
    Meta,
    CONSTANTS,
    Message
) {
    "use strict";

    var EDITOR_PREVIEW_FRAME_ID = 'editor-preview-iframe';
    var isEditorAjaxSaveEnabled = AJS.DarkFeatures.isEnabled('editor.ajax.save') && !AJS.DarkFeatures.isEnabled('editor.ajax.save.disable') &&
        Meta.get('remote-user') !== '';
    // Cancel handlers. These handlers are retained so they can conveniently all be removed.
    var cancelHandlers = [];

    // The handlers for the save button
    var saveHandlers = [];

    // Submit handlers. These handlers are retained so they can conveniently all be removed.
    var submitHandlers = [];

    var deferredBindingRequired = false;
    var numConcurrentEditors = 1;

    // Keep track of when we are publishing so that we don't trigger a draft save during or after this time.
    var _isPublishing = false;

    //ref to XHR startheartbeatactivity.action
    var ajaxHeartbeat;

    var setPublishButtonsState = function (enabled) {
        Confluence.Editor.UI.setButtonState(enabled, Confluence.Editor.UI.saveButton);
        Confluence.Editor.UI.setButtonState(enabled, Confluence.Editor.UI.previewButton);
        Confluence.Editor.UI.setButtonState(enabled, Confluence.Editor.UI.cancelButton);
    };

    var showErrorMessage = function (options) {
        options = options || {};
        var messageKey = options.messageKey || "editor-error-message";
        var message = options.message || AJS.I18n.getText("editor.generic.refresh");
        Message.handleMessage(messageKey, {
                title: options.title,
                type: "error",
                message: message
            },
            function () {
                if (options.disablePublish) {
                    setPublishButtonsState(false);
                }
            }
        );
    };

    var handleEditModeTransition = function (editMode) {
        if (editMode !== Meta.get('edit-mode')) {

            if (editMode === 'collaborative' && Meta.get('edit-mode') !== 'limited') {
                return; // Let draft autosave or reliable save handle this case, as they handle it better
            }

            // Update value so so we don't handle this more than once
            Meta.set('edit-mode', editMode);

            var message;

            if (editMode === 'collaborative') {
                message = AJS.I18n.getText("editor.collaborative.mode.enabled");
            } else {
                message = AJS.I18n.getText("editor.collaborative.mode.disabled");
            }

            showErrorMessage({
                messageKey: "edit-mode-transition",
                message: message,
                disablePublish: true
            });
        }
    };

    var isLimitedModeEnabled = function () {
        return Meta.get('edit-mode') === 'limited';
    };

    var onSave = function (e) {
        var saveAllowed = true;

        Message.closeMessages(["offline-before-save-error"]);

        for (var i = 0; i < saveHandlers.length; i++) {
            if (saveHandlers[i](e) === false) { //'undefined' means ok
                saveAllowed = false;
            }

            if (e.isImmediatePropagationStopped()) {
                break;
            }
        }

        if (!saveAllowed || e.isDefaultPrevented() || e.isPropagationStopped()) {
            return false;
        }

        // We prevent the default and execute whatever before save function is registered
        e.preventDefault();

        beforeSave(e)
            .done(doSave)
            .fail(doFail);
    };

    var doFail = function (e) {
        var error = e || {};

        showErrorMessage({
            messageKey: error.messageKey || "offline-before-save-error",
            message: error.disablePublish ? AJS.I18n.getText("editor.generic.refresh") : AJS.I18n.getText("editor.offline.before.save.error"),
            disablePublish: error.disablePublish
        });

        if (e) {
            AJS.trigger('analytics', {name: 'editor.save.error.' + e.origin + '.' + e.cause});
        }

        Confluence.Editor.UI.toggleSavebarBusy(false);
        // When clicking save, we unbind the unload message
        // If there has been an error saving, we must rebind it
        Confluence.Editor.Drafts.bindUnloadMessage();
    };

    // By default do nothing, but we allow to override this for Synchrony sync ack
    var beforeSave = function (e) {
        var deferred = $.Deferred();
        deferred.resolve(e);
        return deferred.promise();
    };

    // By default submit the form, but we allow to override this for reliable save
    var defaultDoSave = function () {
        var _internalDefaultDoSave = function () {
            _isPublishing = true; // We don't need to set it to false since we are submitting the form and unloading
            $(Confluence.Editor.getCurrentForm()).submit();
            AJS.trigger('analytics', {name: "confluence.editor.close", data: {source: "publishButton"}});
        };
        // Check if we are currently saving a draft and wait for it to be saved to
        // avoid race conditions in which finishes saving first.
        // We want a publish to always occur after a draft is saved, and never a
        // draft saved after the publish
        var draftSavingPromise = Confluence.Editor.Drafts.getDraftSavingPromise();
        if (draftSavingPromise) {
            draftSavingPromise.always(_internalDefaultDoSave)
        } else {
            _internalDefaultDoSave()
        }
    };

    var doSave = defaultDoSave;

    AJS.bind("rte-ready", function () {
        if (!AJS.Meta.getBoolean('collaborative-content')) {
            $('meta[name="ajs-collaborative-editor-status"]').attr('content', 'off');
        }
        Confluence.Editor.UI.saveButton.bind("click", onSave);
    });

    AJS.bind("editor.error.message", function (e, data) {
        showErrorMessage(data);
    });

    AJS.bind("dismiss.editor.error.message", function (e, options) {
        Message.closeMessages([options.messageKey]);
        if (options.enablePublish) {
            setPublishButtonsState(true);
        }
    });

    var deferredBinder = function () {
        var i;
        for (i = 0; i < cancelHandlers.length; i++) {
            Confluence.Editor.UI.cancelButton.click(cancelHandlers[i]);
        }

        var $form = $(Confluence.Editor.getCurrentForm());
        for (i = 0; i < submitHandlers.length; i++) {
            $form.submit(submitHandlers[i]);
        }

        $.unbind("init.rte", this);
    };

    var addHandler = function ($component, event, handler, handlerList) {
        // is the editor initialised already (i.e. is the component available)
        handlerList.push(handler);

        if (AJS.Rte && AJS.Rte.BootstrapManager && AJS.Rte.BootstrapManager.isInitComplete()) {
            $component.bind(event, handler);
        } else if (!deferredBindingRequired) {
            deferredBindingRequired = true;
            $.bind("init.rte", deferredBinder);
        }
    };

    var removeAllHandlers = function ($component, event, handlerList) {
        var unbindFunction = null;
        if (AJS.Rte && AJS.Rte.BootstrapManager && AJS.Rte.BootstrapManager.isInitComplete()) {
            unbindFunction = function ($c, e, h) {
                $c.unbind(e, h);
            };
        }

        var handler = handlerList.pop();
        while (handler) {
            unbindFunction && unbindFunction($component, event, handler);
            handler = handlerList.pop();
        }
    };

    function metadataSyncRequired() {
        var isSharedDraftsDarkFeatureEnabled = Meta.getBoolean('shared-drafts');
        var contentTypeSupportsConcurrentEditing = Meta.get('content-type') === 'page' || Meta.get('content-type') === 'blogpost';
        var isExistingContent = AJS.params.pageId !== '0';

        return contentTypeSupportsConcurrentEditing && (isExistingContent || isSharedDraftsDarkFeatureEnabled);
    }

    /**
     * Updates the page xsrf token
     * Currently, we persist this token in many different places:
     * - hidden form input field (so it can be submitted in saving post request)
     * - atl-token meta params. Used by plugins like "drag and drop"
     * - atlassian-token meta params. Used by some other plugins like the "like" plugin
     * @param xsrfToken
     */
    function updateXSRFToken(xsrfToken) {
        $('#editpageform').find("input[name='atl_token']").val(xsrfToken);
        Meta.set('atl-token', xsrfToken);
        Meta.set('atlassian-token', xsrfToken);
        $('#atlassian-token').attr('content', xsrfToken); // since Meta doesn't actually modify the original value from the META tag
        // and we are still reading it directly in some places (like in AJS.safe.ajax)
    }

    return {
        bookmark: '',
        MODE_RICHTEXT: "richtext",
        MODE_PREVIEW: "preview",
        PREVIEW_OUTPUT_TYPE: "PREVIEW",

        currentEditMode: null,
        contentHasChangedSinceLastSave: false,
        sourceInitialValue: false,


        /**
         * Stops the drafts from saving if the user is publishing the page.
         * @param newValue If given, will update the value.
         * @returns {boolean} The current value of isPublishing.
         */
        isPublishing: function (newValue) {
            if (typeof newValue !== 'undefined') {
                _isPublishing = newValue;
            }
            return _isPublishing;
        },

        isLimitedModeEnabled: isLimitedModeEnabled,

        /**
         * This is currently for Synchrony and should return a Promise.
         * Don't use this if you don't know what you are doing
         * If more plugins need to do stuff before saving, we need something more sophisticated
         * @param {Function} beforeSaveFunction this function must return a promise
         * AND must pass argument received from the function to the resolved promise
         */
        overrideBeforeSave: function (beforeSaveFunction) {
            beforeSave = beforeSaveFunction;
        },

        // This is currently for reliable save.
        // Don't use this if you don't know what you are doing
        overrideSave: function (saveFunction) {
            doSave = saveFunction;
        },

        restoreDefaultSave: function () {
            doSave = defaultDoSave;
        },

        getNumConcurrentEditors: function () {
            return numConcurrentEditors; //Will only be accurate after first heartbeat
        },

        /**
         * Add a function to be called when the editor's cancel operation is activated.
         *
         * @param handler the handler function taking a single event parameter
         */
        addCancelHandler: function (handler) {
            addHandler(Confluence.Editor.UI.cancelButton, "click", handler, cancelHandlers);
        },

        /**
         * Add a function to be called when the editor's save button is clicked.
         *
         * @param handler the handler function taking a single event parameter
         */
        addSaveHandler: function (handler) {
            saveHandlers.push(handler);
        },

        /**
         * Add a function to be called when the editor form is submitted. Please note that both cancel and
         * save are submit operations on the editor (only in page edit)
         *
         * @param handler the handler function taking a single event parameter
         * @return {undefined}
         */
        addSubmitHandler: function (handler) {
            addHandler($(Confluence.Editor.getCurrentForm()), "submit", handler, submitHandlers);
        },

        /**
         * Remove all the cancel handlers that have been bound.
         */
        removeAllCancelHandlers: function () {
            removeAllHandlers(Confluence.Editor.UI.cancelButton, "click", cancelHandlers);
        },

        /**
         * Remove all the save button handlers that have been bound.
         */
        removeAllSaveHandlers: function () {
            removeAllHandlers(Confluence.Editor.UI.saveButton, "click", saveHandlers);
        },

        /**
         * Remove all the submit handlers that have been bound.
         */
        removeAllSubmitHandlers: function () {
            removeAllHandlers($(Confluence.Editor.getCurrentForm()), "submit", submitHandlers);
        },

        hasContentChanged: function () {
            if (!this.inRichTextMode() && !this.contentHasChangedSinceLastSave) {
                return false;
            }
            return this.editorHasContentChanged();
        },

        editorHasContentChanged: function () {
            //TODO bit of a hack, dies during init otherwise sometimes
            // AJS.Rte lives in the atlassian-editor-plugin so should not be used here.
            if (AJS.Rte.getEditor() == null) {
                AJS.debug("Confluence.Editor: editorHasContentChanged - No active editor present. Returning false.");
                return false;
            }
            return AJS.Rte.Content.editorHasContentChanged();
        },

        /**
         * @returns true if there is no content (other than whitespace). False if there is content.
         */
        isEmpty: function () {
            var content = $(AJS.Rte.getEditor().getContent()).text();
            return !$.trim(content);
        },

        /**
         * Returns a relative URL to resume the draft saved for this page
         */
        getResumeDraftUrl: function () {
            var urlParts = [];
            urlParts.push(CONSTANTS.CONTEXT_PATH);
            urlParts.push("/pages/" + (AJS.params.newPage ? "create" : "edit") + AJS.params.draftType + ".action");
            urlParts.push("?useDraft=true");
            urlParts.push("&pageId=" + AJS.params.pageId);
            urlParts.push("&contentChanged=" + this.hasContentChanged());
            this.getCurrentForm().spaceKey && urlParts.push("&spaceKey=" + Meta.get('space-key'));
            return urlParts.join("");
        },

        /**
         * Returns the currently entered title.
         *
         * @return the current editor title, null if not in edit mode, or editing a comment (i.e. something without a title)
         */
        getCurrentTitle: function () {
            return $('#content-title') && $('#content-title').val();
        },

        /* This function will be invoked when the form gets submitted. */
        contentFormSubmit: function (e) {
            if (isLimitedModeEnabled() || !Confluence.Editor.Drafts.isSharedDraftsEnabled()) {
                Confluence.Editor.Drafts.unBindUnloadMessage();
            }
            // CONF-12750 Disable the title field outside the form
            // to prevent Safari 2.0 from sending the "title" field twice
            $(".editable-title #content-title").prop("disabled", true);

            return true;
        },

        metadataSyncRequired: metadataSyncRequired,

        /**
         * When editing a page then heartbeats will double up in function and also detect concurrent edits.
         * When creating a new page 'concurrent edit' is a bit meaningless so the heartbeat will serve just
         * the single purpose of keeping the session alive.
         */
        heartbeat: function () {
            var data = {
                dataType: "json",
                contentId: Meta.get("content-id"),
                /**
                 * inline comment doesn't update AJS.params.draftType after init editor (as comment doing)
                 * => IC heartbeat will have same draftType as page heartbeat if we depend on AJS.params.draftType
                 * and user is considered editing the page while he is actually working on IC
                 * We don't want this behavior to happen
                 */
                draftType: Meta.get("content-type"),
                spaceKey: AJS.params.spaceKey,
                contributorsHash: Meta.get("contributors-hash")
            };


            var activityCallback = function (resultData) {

                if (!metadataSyncRequired() && resultData) {
                    updateXSRFToken(resultData.atlToken);
                    AJS.Meta.set("shared-drafts", resultData.editMode !== 'legacy');
                    AJS.trigger("rte.heartbeat", resultData);
                    return;
                }

                if (!resultData || !resultData.atlToken || !(resultData.activityResponses instanceof Array)) {
                    // We need to be defensive here until CONFDEV-28680 gets resolved, as even after CONFDEV-28371
                    // actions get intercepted and we may not get the expected response
                    AJS.trigger("rte.heartbeat-error", 'Invalid server response');
                    AJS.logError('Unexpected server response for heartbeat:');
                    AJS.log(resultData);
                    return;
                }


                Meta.set("contributors-hash", resultData.contributorsHash);
                AJS.Meta.set("shared-drafts", resultData.editMode !== 'legacy');

                var activityResponses = resultData.activityResponses;
                updateXSRFToken(resultData.atlToken);
                Confluence.Editor.heartbeatType.normal();
                AJS.trigger("rte.heartbeat", activityResponses);
                numConcurrentEditors = (activityResponses.length || 0) + 1;

                if (numConcurrentEditors > 1) {
                    var $otherUsersEditingMessage = !isEditorAjaxSaveEnabled ? $("#other-users-span") : $("#reliable-other-users-span").length === 0 ? $("<span id='reliable-other-users-span'></span>") : $("#reliable-other-users-span");
                    $otherUsersEditingMessage.empty();
                    for (var i = 0; i < numConcurrentEditors - 1; ++i) {
                        if (i > 0) {
                            $otherUsersEditingMessage.append(", ");
                        }

                        var activityResponse = activityResponses[i];
                        $otherUsersEditingMessage.append(AJS('a').attr('href', CONSTANTS.CONTEXT_PATH + '/display/~' + encodeURIComponent(activityResponse.userName)).text(activityResponse.fullName));
                        if (activityResponse.lastEditMessage != null) {
                            $otherUsersEditingMessage.append(" ").append(AJS('span').addClass('smalltext').text(activityResponse.lastEditMessage));
                        }
                    }
                    if (isEditorAjaxSaveEnabled) {
                        if (!Message.isDisplayed(["heartBeat"]) && $otherUsersEditingMessage.html().trim() !== "") {
                            Message.handleMessage("heartBeat", {
                                type: "info",
                                message: AJS.I18n.getText("heartbeat.page.edited.info", "<span id='reliable-other-users-span'>" + $otherUsersEditingMessage.html() + "</span>")
                            });
                        }
                    }
                    if (!AJS.isVisible('#heartbeat-div')) { //Avoid sending the event on every heartbeat
                        AJS.Confluence.Analytics.publish('rte.notification.concurrent-editing', {
                            numEditors: numConcurrentEditors,
                            pageId: AJS.params.pageId,
                            draftType: AJS.params.draftType
                        });
                    }
                }

                isEditorAjaxSaveEnabled && numConcurrentEditors <= 1 && Message.closeMessages(["heartBeat"]);

                AJS.setVisible("#heartbeat-div", numConcurrentEditors > 1);
                $(document).trigger("resize.resizeplugin");

                AJS.trigger('editor-heartbeat', resultData);

                handleEditModeTransition(resultData.editMode);
            };

            ajaxHeartbeat = AJS.safe.post(
                CONSTANTS.CONTEXT_PATH + "/json/startheartbeatactivity.action",
                data,
                activityCallback,
                "json"
            ).fail(function (xhr, status, err) {
                if (xhr.status >= 500 || xhr.status === 0) { // server/network is down (normal response with reset it).
                    Confluence.Editor.heartbeatType.recovery();
                }
                if (xhr.status === 403 || xhr.status === 401) {
                    AJS.logError('Heartbeat error: Unauthorized');
                }
                else if (xhr.status === 405) {
                    AJS.logError('Heartbeat error: Method not allowed');
                }
                else {
                    AJS.logError('Server error on heartbeat request:');
                    AJS.log(err);
                }
                AJS.trigger("rte.heartbeat-error", xhr);
            });

        },

        /**
         * Allow adjusting of the heartbeat type. normal() for the default scheduling, or recovery() for initially
         * faster scheduling but with exponential backoff (e.g. if the network is down and we want to recover).
         *
         * Recovery mode is used after a 5xx http response is returned.
         */
        heartbeatType: (function () {
            var currentScheduler;

            function schedule(scheduler) {
                if (currentScheduler === scheduler) {
                    return;
                }

                if (currentScheduler) {
                    currentScheduler.clear();
                }

                scheduler.start(Confluence.Editor.heartbeat);

                currentScheduler = scheduler;
            }

            var defaultPeriod = Meta.getNumber('heartbeat-interval') || 30000;

            var normalScheduler = function () {
                var intervalId;

                return {
                    start: function (fn) {
                        AJS.debug('Changing heartbeat to the normal scheduler');

                        intervalId = setInterval(fn, defaultPeriod);
                    },
                    clear: function () {
                        clearInterval(intervalId);
                    }
                };
            }();

            var recoveryScheduler = function () {
                var baseRecoveryPeriod = Math.max(defaultPeriod / 5, 5000); // 6 seconds

                var timeoutId;
                var retryNumber;

                return {
                    start: function (fn) {
                        AJS.debug('Changing heartbeat to the recovery scheduler');

                        retryNumber = 0;

                        var invoker = function () {
                            fn();
                            var sleep = baseRecoveryPeriod * Math.pow(2, retryNumber);

                            // Max 5 min sleep.  It will hit this cap on the 7th attempt
                            timeoutId = setTimeout(invoker, Math.min(sleep, 1000 * 60 * 5));
                            retryNumber++;
                        };
                        timeoutId = setTimeout(invoker, baseRecoveryPeriod);
                    },
                    clear: function () {
                        clearTimeout(timeoutId);
                    }
                };
            }();

            return {
                normal: function () {
                    schedule(normalScheduler);
                },
                recovery: function () {
                    schedule(recoveryScheduler);
                },

                /**
                 * Used for tests to force the timer to fully reset, so it's at a known state and we can measure timing.
                 */
                reset: function () {
                    if (currentScheduler) {
                        currentScheduler.clear();
                    }

                    currentScheduler = normalScheduler;
                    currentScheduler.start(Confluence.Editor.heartbeat);
                },
                /**
                 * clear any interval calling to heartbeat
                 * should be used when closing editor
                 */
                cleanup: function () {
                    if (currentScheduler) {
                        currentScheduler.clear();
                        currentScheduler = null;
                    }
                    ajaxHeartbeat && ajaxHeartbeat.abort && ajaxHeartbeat.abort();
                }
            };
        }()),

        disableFrame: function (body) {
            //disable all forms, buttons and links in the iframe
            $("form", body).each(function () {
                $(this).unbind();
                this.onsubmit = function () {
                    return false;
                };
            });
            $("a", body).each(function () {
                // Unbind existing handlers.
                var $link = $(this);
                var href = $link.attr("href");

                $link.unbind();

                // We're disabling outgoing links, to permit same page anchor navigation.
                if (href && href.charAt(0) !== '#') {
                    // Add legacy attribute.
                    $link.attr("target", "_top");
                    // Swallow any clicks to prevent outgoing link navigation.
                    $link.bind("click", function(event) {
                        event.preventDefault();
                        $link.blur();
                    });
                }
            });
            $("input, img", body).each(function () {
                $(this).unbind();
            });
        },

        /* This function should be invoked when the preview frame has finished loading its content.
         * It is responsible for updating the height of frame body to the actual content's height.
         */
        previewFrameOnload: function (body, iframe) {
            var tinymce = require('tinymce');

            Confluence.Editor.setMode(Confluence.Editor.MODE_PREVIEW);
            tinymce.activeEditor.setProgressState(false);
            Confluence.Editor.disableFrame(body);
            $('.tipsy').remove();

            var content = $("#main", body)[0];

            if (Meta.get("content-type") !== "comment" && $(content).find("#main-header").length === 0) {
                var $titleHeading = $('#title-heading');
                var classes = $titleHeading.attr("class");
                $(content).prepend('<div id="preview-header"><div id="title-heading" class="' + classes + '">' + $titleHeading.html() + "</div></div>");
            }

            if ($(AJS.Rte.getEditor().getBody()).hasClass('resizable')) {
                var $iframe = $(iframe || "#previewArea iframe");
                var prevHeight = 0;
                var counter = 0;
                var timer;
                var originalHeight = $iframe.height();
                content && (function heightCheck() {
                    var height = $(content).outerHeight(true);
                    if (prevHeight !== height) {
                        if (height !== $iframe.height()) {
                            $iframe.height(0).height(Math.max(height, originalHeight));
                        }
                        prevHeight = height;
                        counter = 0;
                    } else {
                        counter++;
                    }

                    // upper limit check for content height changes
                    if (counter < 500) {
                        timer = setTimeout(heightCheck, 500);
                    }
                })();
                $(document).one("mode-changed.resize-editor", function (_, mode) {
                    if (mode !== Confluence.Editor.MODE_PREVIEW) {
                        timer && clearTimeout(timer);
                    }
                });
                //This is only needed for IE/Opera where our 100% height solution does not work with CSS alone.
            } else if (tinymce.isIE || tinymce.isOpera) {
                var windowHeight = $(window).height();
                var headerHeight = $("#header-precursor").height() + $("#header").height() + $("#editor-precursor").height();
                var footerHeight = $("#savebar-container").height();
                var magicNumber = 4; //HACK - CONF41 BN The bottom of the preview iframe is off by this much (no idea why).

                $("#preview iframe").height(windowHeight - headerHeight - footerHeight - magicNumber);

                // Reset the value used by the editor.
                $("#content.edit").height("auto");
            }
        },

        showRichText: function (show) {
            var tinymce = require('tinymce');

            AJS.setVisible("#wysiwyg", show);
            $(".toolbar-group-preview").toggleClass("assistive", !show);
            $(".toolbar-group-edit").toggleClass("assistive", show);

            $("#main").toggleClass("active-richtext", show);

            // CONFDEV-5601 - When the visibility of the editor is toggled in Firefox, the
            // arrow keys erroneously scroll instead of moving the cursor position. Toggling
            // the contenteditable state is a hack fix for buggy browser behaviour.
            if (tinymce.isGecko && show) {
                AJS.Rte.fixEditorFocus(Confluence.Editor.bookmark);
            }
        },

        showPreview: function (show) {
            // update the display title for preview
            if (Meta.get("content-type") !== "comment") {
                var $contentTitle = $("#content-title");
                if ($contentTitle.hasClass("placeholded")) {
                    $("#preview-title-text").text("");
                    $("#title-text").text("");
                } else {
                    $("#preview-title-text").text($contentTitle.val());
                    $("#title-text").text($contentTitle.val());
                }
            }

            AJS.setVisible("#preview", show);

            $(".toolbar-group-preview").toggleClass("assistive", show);
            $(".toolbar-group-edit").toggleClass("assistive", !show);

            $("#main").toggleClass("active-preview", show);
            !!$("#full-height-container").length && $("#full-height-container").toggleClass("active-preview", show);
        },

        /**
         * Set up the page for rich text or markup editing
         */
        setMode: function (mode) {
            AJS.debug("Set mode: " + mode);
            if (mode === Confluence.Editor.MODE_RICHTEXT) {
                this.showRichText(true);
                this.showPreview(false);
            } else if (mode === Confluence.Editor.MODE_PREVIEW) {
                this.showPreview(true);
                this.showRichText(false);

                Confluence.Editor.UI.spinner.removeClass('aui-icon-wait');
            }

            //hack to force UI to redraw after toolbar is modified. For some reason it redraws incorrectly the first time.
            setTimeout(function () {
                var preview = $(".toolbar-group-preview");
                preview.height(0);
                preview.height();
                preview.height('auto');
            }, 1);

            this.currentEditMode = mode;
            $(document).trigger("mode-changed", [mode]);
        },

        /**
         * @Deprecated: see confluence-webapp/src/main/webapp/includes/js/root.js
         */
        getContentId: function () {
            return Confluence.getContentId();
        },

        addErrorMessage: function (id, message, showInAllModes) {
            var container = $("#" + id);
            var appendToId = (showInAllModes ? "#all-messages" : "#editor-messages");
            if (container.length) {
                container.empty();
            } else {
                container = $("<div></div>").attr("id", id).appendTo(appendToId);
            }
            AJS.messages.error(container, {
                closeable: true,
                body: message
            });
        },

        changeMode: function (newMode, options) {
            var tinymce = require('tinymce');

            AJS.debug("Change mode: " + newMode);
            options = options || {};
            // Only allow the mode to be changed if the editor has been initialised
            if (this.inRichTextMode() && !AJS.Rte.BootstrapManager.isInitComplete()) {
                return false;
            }
            if (this.currentEditMode === newMode) {
                return false;
            }

            var prevMode = this.currentEditMode;

            // expose rte change mode event
            // Important: this needs to be called before this.currentEditMode gets assigned or
            // Confluence.Editor.hasContentChanged() will return something different to what you expect.
            // lots of technical debt to be paid around this area :/
            AJS.trigger('rte-changeMode', newMode);

            if (newMode === Confluence.Editor.MODE_PREVIEW) {
                var editor = AJS.Rte.getEditor();

                if (tinymce.isGecko && (prevMode === Confluence.Editor.MODE_RICHTEXT) && !Confluence.Editor.bookmark) { // CONFDEV-5601
                    Confluence.Editor.bookmark = tinymce.activeEditor.selection.getBookmark();
                }

                this.currentEditMode = newMode;
                var queryParams = {
                    "contentId": Confluence.getContentId(),
                    "contentType": Meta.get('content-type'),
                    "spaceKey": Meta.get('space-key'),
                    "xHtml": editor.getContent(),
                    "outputType": Confluence.Editor.PREVIEW_OUTPUT_TYPE
                };

                AJS.safe.ajax({
                    type: "POST",
                    url: CONSTANTS.CONTEXT_PATH + "/pages/rendercontent.action",
                    data: queryParams,
                    success: Confluence.Editor.replysetPreviewArea,
                    timeout: 20000,
                    error: function () {
                        AJS.trigger("rte-preview-action-selected");
                        AJS.trigger("rte.preview.error", {status: 0});
                        Message.closeMessages(["server-offline"]);
                        showErrorMessage({
                            messageKey: "server-offline",
                            message: AJS.I18n.getText("editor.offline.preview.error"),
                            disablePublish: false
                        });
                        Confluence.Editor.currentEditMode = prevMode;
                        options.errorCallback && options.errorCallback();
                    }
                });
            } else {
                this.setMode(newMode);
            }
            if (newMode === Confluence.Editor.MODE_RICHTEXT) {
                $(document).trigger("resize.resizeplugin");
            }
            if (prevMode === Confluence.Editor.MODE_PREVIEW) {
                var iframe = document.getElementById(EDITOR_PREVIEW_FRAME_ID);
                if (iframe) {
                    var doc = iframe.contentDocument || iframe.contentWindow.document;
                    doc.removeChild(doc.documentElement);
                    $(iframe).remove();
                }
            }

            return false;
        },

        replysetPreviewArea: function (html) {
            var tinymce = require('tinymce');

            AJS.trigger("rte-preview-action-selected");
            $("#preview-error").remove();
            // Set the iframe source to an empty JS statement to avoid secure/insecure warnings on HTTPS, without
            // needing a back-end call.
            tinymce.activeEditor.setProgressState(true);

            var $previewArea = $("#previewArea");
            var $iframe = $('<iframe id="' + EDITOR_PREVIEW_FRAME_ID + '" src="about:blank" scrolling="yes" frameborder="0"></iframe>');
            $previewArea.html($iframe);

            var doc = $iframe[0].contentDocument || $iframe[0].contentWindow.document;
            doc.open();
            doc.write(html);
            doc.close();
        },

        inRichTextMode: function () {
            return this.currentEditMode === Confluence.Editor.MODE_RICHTEXT;
        },

        isNewPage: function () {
            return $("#createpageform, #createpagetemplate").length > 0;
        },

        onInit: function () {
            Confluence.Editor.setMode(Confluence.Editor.MODE_RICHTEXT);
            AJS.Rte.getEditor().onClick.add(function (ed, e) {
                var picker = Confluence.Editor.UI.postingDatePicker;
                picker && picker.hide();
            });
        },

        contentChangeHandler: function () {
            this.contentHasChangedSinceLastSave = true;
        },

        getCurrentForm: function () {
            return AJS.Rte.getEditor().formElement;
        },

        setToolBarInactive: function (val) {
            $("#rte-toolbar").toggleClass("disabled", val);
        },

        /**
         * Check if any of the top level containers from atlassian-editor.vm are visible. More
         * explicitly if the editor, preview or source view are visible.
         *
         * It you only care whether the actual editor is visible it is suggested that you
         * make use of the AJS.Rte object.
         *
         * @returns true if any of the top level containers for the Confluence Editor are visible.
         */
        isVisible: function () {
            return ($("#wysiwyg:visible").length > 0) || ($("#preview:visible").length > 0);
        }
    };

});

require('confluence/module-exporter').safeRequire('confluence-editor/editor/page-editor', function (PageEditor) {
    var Confluence = require('confluence/legacy');
    var $ = require('jquery');
    var AJS = require('ajs');

    Confluence.Editor = $.extend(Confluence.Editor || {}, PageEditor);

    AJS.toInit(function ($) {
        // Initialisation
        // We should note here that the content has NOT finished loading
        $(document).ajaxError(function(event, jqXhr) {
            if (jqXhr.status === 405) {
                try {
                    var reason = JSON.parse(jqXhr.responseText).reason;
                    if (typeof reason !== 'undefined' && reason === 'READ_ONLY') {
                        AJS.log("*** READ_ONLY mode detected ***");
                        // we simulate a rte.heartbeat-error event so that the error flag and the AJS meta tag can be set
                        AJS.trigger("rte.heartbeat-error", null, jqXhr);
                    }
                } catch (err) {
                    AJS.logError("Cannot parse xhr.responseText: " + err);
                }
            }
        });
        AJS.bind("init.rte", Confluence.Editor.onInit);
    });

    /**
     * @deprecated since 4.0, Use Confluence.Editor instead.
     * It is critical that this variable is kept being a reference to Confluence.Editor
     * as there are plugins extending it further.
     */
    AJS.Editor = Confluence.Editor;
});

