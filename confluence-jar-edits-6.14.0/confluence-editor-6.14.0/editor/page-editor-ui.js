/**
 * This file encapsulates Confluence.Editor.UI related logic
 * (which is has been extracted from a big page-editor.js)
 *
 * Still some known issues about this approach (that need to be fixed):
 *
 * - "init.rte" event happens *after* all the plugins are initialised,
 * so you can not rely on the tinymce plugin initialisation onInit event to access
 * Confluence.Editor.UI (it won't be ready yet). Instead, what we do in some plugins
 * is to bind to editor init using "init.rte" so we can guarantee that we can access
 * Confluence.Editor.UI components at that time. This is wrong and we need to fix it.
 * While that happens, let's walk step by step towards a more maintainable editor code base.
 *
 * @module confluence-editor/editor/page-editor-ui
 */
define('confluence-editor/editor/page-editor-ui', [
    'jquery',
    'confluence/templates',
    'ajs',
    'confluence/meta',
    'confluence/legacy',
    'window',
    'moment',
    'document',
    'confluence/api/constants',
    'confluence-editor/editor/page-editor-message',
    'confluence-editor/editor/page-editor-quit-dialog'
], function(
    $,
    Templates,
    AJS,
    Meta,
    Confluence,
    window,
    moment,
    document,
    CONSTANTS,
    Message,
    QuitDialog
) {
    "use strict";

    return function () {
        var View = {};

        /**
         * Enable/disable buttons
         * @param enable
         * @param buttons Array of buttons
         */
        var setButtonsState = function (enable, buttons) {
            //default to View.buttons if not specify buttons
            buttons = buttons || View.buttons;
            for (var i = 0; i < buttons.length; i++) {
                setButtonState(enable, buttons[i]);
            }
        };

        var setExplicitButtonsState = function (enable, buttons) {
            buttons.forEach(function (button) {
                setButtonState(enable, button);
            });
        };

        var setButtonState = function (enable, $button) {
            if (!$button) {
                return;
            }

            if (enable) {
                $button.removeAttr('aria-disabled');
                $button.removeAttr('disabled');
                $button.removeClass('disabled');
            } else {
                $button.attr('aria-disabled', 'true');
                $button.attr('disabled', 'disabled');
                $button.addClass('disabled');
            }
        };

        var isButtonEnabled = function ($button) {
            // We check $button.length == true to determine if the jquery selector represents an element.
            return $button.length && $button.attr('aria-disabled') !== 'true';
        };

        var replaceWithHtml = function (selector, template) {
            $(selector).replaceWith(template);
            return $(selector); // need to reselect node after the replacement
        };

        var configureSaveButton = function () {
            return replaceWithHtml('#rte-button-publish',
                    Templates.Editor.Page.saveButton({
                        contentType: Meta.get('content-type'),
                        sharedDraftsEnabled: Meta.getBoolean('shared-drafts'),
                        isNewPage: isNewPage()
                    })
            );
        };

        var isNewPage = function () {
            return Meta.get('new-page');
        };

        var getPageTitlePrefix = function () {
            var prefix = "";

            if (!isNewPage()) {
                prefix = AJS.I18n.getText('edit.name') + " - ";
            }

            return prefix;
        };

        View.spinner = $('#rte-spinner');
        View.saveButton = configureSaveButton();
        View.overwriteButton = $('#rte-button-overwrite');
        View.editButton = $('#rte-button-edit');
        View.previewButton = $('#rte-button-preview');
        View.cancelButton = $('#rte-button-cancel');
        View.versionCommentInput = $('#versionComment');

        View.watchPageCheckbox = $('#watchPage');
        View.watchPageToolbarGroup = $('.toolbar-group-watch-page');
        View.buttons = [View.saveButton, View.overwriteButton, View.editButton,
            View.previewButton, View.cancelButton];

        AJS.bind('editor-shared-drafts-published', function () {
            //CONFDEV-46822
            var shortcutTitle = /\(.+\)/g.exec(View.saveButton.data("tooltip"))[0];
            View.saveButton.text(Templates.Editor.Page.saveButtonText({
                contentType: Meta.get('content-type'),
                sharedDraftsEnabled: Meta.getBoolean('shared-drafts'),
                isNewPage: isNewPage()
            })).attr('title', Templates.Editor.Page.saveButtonTitle({
                contentType: Meta.get('content-type'),
                sharedDraftsEnabled: Meta.getBoolean('shared-drafts'),
                isNewPage: isNewPage()
            }) + shortcutTitle).tooltip({gravity: 's'});
        });

        /**
         *
         * @param enabled if true then all the Editor 'chrome' buttons should be enabled. If false then disabled.
         */
        View.setButtonsState = setButtonsState;
        View.setButtonState = setButtonState;
        View.isButtonEnabled = isButtonEnabled;

        View.registerFormButton = function (name, button) {
            View[name] = button;
            View.buttons.push(button);
        };

        View.postingDatePicker = null;

        View.isFormEnabled = function () {
            for (var i = 0; i < View.buttons.length; i++) {
                if (isButtonEnabled(View.buttons[i])) {
                    return true;
                }
            }
            return false;
        };

        /**
         * Called when the editor is in the process of saving or cancelling and is responsible for
         * ensuring no other operations can be instigated (on the save bar).
         *
         * @param setBusy if true then set busy; if false then set to available
         * @return true if the editor has been set to the required state, or false if it hasn't (because it
         * is already in that state).
         */
        View.toggleSavebarBusy = function (setBusy) {
            if (setBusy) {
                // If the savebar is already busy, nothing to do here.
                if (!View.isFormEnabled()) {
                    return false;
                }

                View.spinner.addClass('aui-icon-wait');
                setButtonsState(false);
            } else {
                View.spinner.removeClass('aui-icon-wait');
                setButtonsState(true);
            }
            return true;
        };

        View.init = function () {
            QuitDialog.init();

            /***
             * CONFDEV-36296 Add the default save handler to prevent a user from triggering these other save handlers if Save/Publish button was disabled.
             */
            Confluence.Editor.addSaveHandler(function (e) {
                if (View.isButtonEnabled(View.saveButton)) {
                    View.toggleSavebarBusy(true);
                    AJS.trigger('confluence.editor.on.save');
                } else {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                }
            });

            AJS.trigger("rte.init.ui");

            if (Confluence.Editor.isNewPage()) {
                $("#content-title").focus().select();
            }

            Confluence.Editor.addCancelHandler(function (e) {
                if (Confluence.Editor.getNumConcurrentEditors() > 1) {
                    AJS.Confluence.Analytics.publish('rte.notification.concurrent-editing.cancel', {
                        numEditors: Confluence.Editor.getNumConcurrentEditors(),
                        pageId: AJS.params.pageId,
                        draftType: AJS.params.draftType
                    });
                }
                QuitDialog.process(e);
            });

            /**
             * This handler is conditionally injected in order to include the empty comment warning for slow editors.
             */
            if (Meta.get('content-type') === "comment") {
                Confluence.Editor.addSaveHandler(function () {
                    if (AJS.Rte.Content.isEmpty()) {
                        AJS.Confluence.EditorNotification.notify("warning", AJS.I18n.getText("content.empty"));
                        View.toggleSavebarBusy(false);
                        return false;
                    }
                });
            }

            /**
             * This handler is conditionally injected in order to include the cancel confirmation dialog for slow editors, including the template editor for CONFDEV-31248.
             */
            if ((Meta.get('content-type') === "comment") || (Meta.get('content-type') === "template")) {
                Confluence.Editor.addCancelHandler(function (e) {
                    if (View.isFormEnabled() && Confluence.Editor.hasContentChanged() && !Confluence.Editor.isEmpty()) {
                        var i18ContentLostString = Meta.get('content-type') === "comment" ? AJS.I18n.getText("unsaved.comment.lost") : AJS.I18n.getText("unsaved.template.lost");
                        if (!window.confirm(i18ContentLostString)) {
                            //CONFDEV-36296 Stop the following cancel handlers to be executed
                            e.stopImmediatePropagation();
                            return false;
                        }
                    }
                });
            }

            View.versionCommentInput.on("keypress", function (e) {
                //press Enter to save page
                if (e.keyCode === 13) {
                    QuitDialog.process(e);
                }
            });

            Confluence.Editor.addSaveHandler(function () {
                if (Confluence.Editor.getNumConcurrentEditors() > 1) {
                    AJS.Confluence.Analytics.publish('rte.notification.concurrent-editing.save', {
                        numEditors: Confluence.Editor.getNumConcurrentEditors(),
                        pageId: AJS.params.pageId,
                        draftType: AJS.params.draftType
                    });
                }
            });

            /**
             * When the form gets submitted "old school" (slow comment, and page edit (whatever it is quick or slow edit))
             */
            Confluence.Editor.addSubmitHandler(function (e) {
                return Confluence.Editor.contentFormSubmit(e);
            });

            this.currentEditMode = this.MODE_RICHTEXT;

            View.editButton.click(function (e) {
                var tinymce = require('tinymce');

                if (View.isFormEnabled()) {
                    Confluence.Editor.changeMode(Confluence.Editor.MODE_RICHTEXT);
                    // TODO CONFDEV-29060 Focus not restored in Chrome the first time
                    setTimeout(function () {
                        AJS.Rte.getEditor().focus();
                        if (tinymce.isGecko && Confluence.Editor.bookmark) {
                            AJS.Rte.getEditor().selection.moveToBookmark(Confluence.Editor.bookmark);
                        }
                    }, 0);
                    View.cancelButton.enable();
                }
                e.preventDefault();
            });

            function hideEllipsisMenu() {
                if ($('#rte-ellipsis-menu').is(':visible')) {
                    $('#rte-button-ellipsis').trigger('aui-button-invoke'); //This hides the dropdown
                }
            }

            View.previewButton.click(function (e) {
                var tinymce = require('tinymce');

                if (View.isFormEnabled() && Confluence.Editor.currentEditMode !== Confluence.Editor.MODE_PREVIEW) {
                    hideEllipsisMenu();

                    setButtonsState(false);
                    View.spinner.addClass('aui-icon-wait');

                    if (tinymce.isGecko && !Confluence.Editor.bookmark) {
                        Confluence.Editor.bookmark = tinymce.activeEditor.selection.getBookmark();
                    }

                    Confluence.Editor.changeMode(Confluence.Editor.MODE_PREVIEW, {
                        errorCallback: function () {
                            // preview load failed
                            setButtonsState(true);
                            View.spinner.removeClass('aui-icon-wait');
                        }
                    });
                    if ((Meta.get('content-type') === "comment") || (Meta.get('content-type') === "template")) {
                        View.cancelButton.disable();
                    } else {
                        View.cancelButton.enable();
                    }

                }
                e.preventDefault();
            });

            $("#rte-button-labels").bind("updateLabel", function () {
                var numLabels = +Meta.get("num-labels") || 0;
                var labelName = AJS.I18n.getText("editor.labels.zero");
                if (numLabels === 1) {
                    labelName = AJS.I18n.getText("editor.labels.singular", numLabels);
                } else if (numLabels > 1) {
                    labelName = AJS.I18n.getText("editor.labels.plural", numLabels);
                }

                $("#rte-button-labels").attr('data-tooltip', labelName);
            });

            // Add tooltip for draft/unpublished edits status lozenge
            if ($("#draft-status-lozenge").length) {
                $("#draft-status-lozenge").tooltip();
            }

            //init the date picker for the blog post stuff
            var $postingDate = $("#PostingDate");
            if ($postingDate.length) {
                $postingDate.attr("max", moment().format('YYYY-MM-DD'));
                View.postingDatePicker = $postingDate.datePicker({overrideBrowserDefault: true});
                View.postingDatePicker.hide();
            }

            // CONFDEV-4913 if the user clicks on the spinner put the focus on the editor
            $("#wysiwygTextarea_parent .mceProgress, #wysiwygTextarea_parent .mceBlocker").on("click", function () {
                AJS.Rte.getEditor().focus();
            });

            // bind the function to be run when the preview frame is loaded
            $(window).bind("render-content-loaded", function (e, body) {
                var iframe = $("#previewArea iframe");
                if (iframe.contents().find("body")[0] == body) {
                    Confluence.Editor.previewFrameOnload(body, iframe);

                    setExplicitButtonsState(true, [View.saveButton, View.overwriteButton, View.editButton, View.previewButton]);

                    iframe.focus();
                    window.focus(); // focus on the window to fix 'e' shortcut in Chrome

                    //This tells AUI that we have added a new iframe. In particular it makes whenitype.js pass through
                    //keypress events from the iframe to the parent, which makes our keyboard shortcuts work.
                    $(document).trigger("iframeAppended", iframe);
                }
            });

            //This bug probably played a part in CONFDEV-13020 (increase of number of session timeouts since heartbeat was not hitting the server).
            if (Meta.get('heartbeat')) {
                Confluence.Editor.heartbeat();
                Confluence.Editor.heartbeatType.normal();
                AJS.bind("rte-destroyed", Confluence.Editor.heartbeatType.cleanup);
            }

            // bind to the watch events so we can modify the 'watch' checkbox in the editor as appropriate
            AJS.bind("watchpage.pageoperation", function () {
                View.toggleWatchPage(false);
            });

            AJS.bind("unwatchpage.pageoperation", function () {
                View.toggleWatchPage(true);
            });

            // append prefix "Edit - " to the title in quick edit mode.
            if (Meta.get('new-page') && Meta.get('form-name') === "inlinecommentform") {
                document.title = AJS.I18n.getText('edit.name') + document.title;
            }

            var originalPageTitle = document.title;

            if (Meta.get('new-page') && $.trim($("input#content-title").val())) {
                document.title = getPageTitlePrefix() + $("input#content-title").val() + " - " + Meta.get('space-name') + " - " + Meta.get('site-title');
            }

            // change the title when editing (or adding) the page title (CONFDEV-25413)
            $("input#content-title").on('change input', function () {

                // don't handle title change for template page
                if (Meta.get('content-type') === "template") {
                    return;
                }

                var prefix = getPageTitlePrefix();

                // case of page title is not empty
                if ($.trim(this.value)) {
                    document.title = prefix + this.value + " - " + Meta.get('space-name') + " - " + Meta.get('site-title');
                    return;
                }

                // case of page title is empty
                document.title = originalPageTitle;
            });

            // Hack to make sure the more options menu is hidden when clicking on the editor iframe
            $('body', $('#wysiwygTextarea_ifr').contents()).click(hideEllipsisMenu);

            AJS.trigger("init.rte-control");
        };

        /**
         * Toggle the watch page checkbox between being visible or hidden. This checkbox should only be visible in the
         * comment editor.
         *
         * @param show if true then show, if false
         */
        View.toggleWatchPage = function (show) {
            if (show && Meta.get("content-type") === "comment") {
                View.watchPageToolbarGroup.show();

                // The user has just chosen to no longer watch the page
                // so default the check box to inactive.
                if (View.watchPageCheckbox.length) {
                    View.watchPageCheckbox[0].checked = false;
                }
            } else {
                View.watchPageToolbarGroup.hide();
            }
        };

        return View;
    };
});

require('confluence/module-exporter').safeRequire('confluence-editor/editor/page-editor-ui', function (ConfluenceEditorView) {
    var Confluence = require('confluence/legacy');
    require('ajs').bind("init.rte", function () {
        var confluenceEditorView = ConfluenceEditorView();

        // now that the editor is loaded we can create the Javascript object
        // to represent the UI 'chrome'.
        Confluence.Editor.UI = confluenceEditorView;

        confluenceEditorView.init();
    });
});

