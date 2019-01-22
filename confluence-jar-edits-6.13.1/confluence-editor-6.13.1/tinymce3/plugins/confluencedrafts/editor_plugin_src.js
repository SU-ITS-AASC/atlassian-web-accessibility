/**
 * @module confluence-editor/tinymce3/plugins/confluencedrafts/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/confluencedrafts/editor_plugin_src', [
    'jquery',
    'ajs',
    'confluence/legacy',
    'confluence/meta',
    'tinymce',
    'confluence/api/constants'
], function(
    $,
    AJS,
    Confluence,
    Meta,
    tinymce,
    CONSTANTS
) {
    "use strict";

    return {

        init : function(ed) {

            var setIntervalId;

            function bindEventsToDraftDialog() {

                if ($("#draft-messages").is(':visible')) {
                    AJS.Confluence.Analytics.publish('rte.notification.draft');
                }

                $("#draft-messages").find("a.use-draft").click(function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    Confluence.Editor.Drafts.useDraft();
                    AJS.Confluence.Analytics.publish('rte.notification.draft.resume');
                });
                $("#draft-messages").find("a.discard-draft").click(function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    Confluence.Editor.Drafts.discardDraft(Meta.get('existing-draft-id'));
                    AJS.Confluence.Analytics.publish('rte.notification.draft.discard');
                });
            }

            /**
             * This should be a temporary feature to dogfood shared drafts.
             * If it ends up not being temporary, please implement correctly according to editor API status
             */
            function sharedDraftsFeatures(ed) {

                // If a draft exists, replaceState with a shareable URL
                if (Meta.get("draft-id") !== 0 && window.history && window.history.replaceState) {
                    var replacementUrl = Meta.get("base-url") + "/pages/resumedraft.action?draftId=" +
                            Meta.get("draft-id") + "&draftShareId=" + Meta.get("draft-share-id");
                    // Is granting access to unpublished draft
                    if (window.location.search.indexOf("grantAccess=true") !== -1) {
                        replacementUrl += "&" + getPersistentQueryParams();
                    }

                    window.history.replaceState(null, '', replacementUrl);
                }

                Confluence.Editor.UI.cancelButton.attr("data-tooltip", AJS.I18n.getText('editor.shared.draft.done.desc'));
                Confluence.Editor.UI.cancelButton.on("click", function() {
                    AJS.Confluence.Analytics.publish("confluence.editor.done.button.clicked");
                });
            }

            function getPersistentQueryParams() {
                var queryStr = window.location.search;
                if(typeof(queryStr) === 'undefined') {
                    return '';
                }

                if(queryStr.charAt(0) === '?') {
                    queryStr = queryStr.substr(1);
                }
                return queryStr
                        .split("&")
                        .filter(function(param) {
                            return param.indexOf("username=") === 0 ||
                                    param.indexOf("userFullName=") === 0 ||
                                    param.indexOf("accessType=") === 0 ||
                                    param.indexOf("grantAccess=") === 0 ||
                                    param.indexOf("src.") === 0;
                        })
                        .join("&");
            }

            function addCurrentUserAsDraftCollaborator() {
                if (!Meta.get('has-collaborated') && AJS.Rte.Content.editorHasContentChanged()) {
                    Meta.set('has-collaborated', true);

                    var userKey = Meta.get('remote-user-key');
                    var contentId = Meta.get('content-id');

                    if (userKey !== '') {
                        $.ajax({
                            type: "PUT",
                            url: CONSTANTS.CONTEXT_PATH + "/rest/experimental/relation/user/" + userKey + "/collaborator/toContent/" + contentId + "?targetStatus=draft",
                            error: function () {
                                Meta.set('has-collaborated', false);
                                AJS.error('Unable to store current user as a collaborator');
                            }
                        });

                        // See TouchRelationSupport for how this is handled on the backend.
                        // Remove any touch relation on the published page
                        // We don't really care if this fails since it should get cleaned up later anyway, so don't
                        // do any error handling.
                        $.ajax({
                            type: "DELETE",
                            url: CONSTANTS.CONTEXT_PATH + "/rest/experimental/relation/user/" + userKey + "/touched/toContent/" + contentId + "?targetStatus=current"
                        });

                        // Add a touch relation to the draft
                        $.ajax({
                            type: "PUT",
                            url: CONSTANTS.CONTEXT_PATH + "/rest/experimental/relation/user/" + userKey + "/touched/toContent/" + contentId + "?targetStatus=draft",
                            error: function () {
                                Meta.set('has-collaborated', false);
                                AJS.error('Unable to store touch relation for current user');
                            }
                        });
                    }
                }
            }

            var init = function(ed) {

                // eventually this plugin will be in charge of
                // creating the required UI and not just toggling visibility
                $('#draft-status').show();
                // will be rendered by the velocity template if there is any draft messages to be displayed
                $('#draft-messages').show();

                Confluence.Editor.Drafts.bindUnloadMessage();
                Confluence.Editor.UI.cancelButton.click(function() {
                    // The save function checks whether the editor content has changed, and exits early otherwise.
                    // This check is important because we don't want to override (by saving over) an existing draft
                    // if the user left edit mode without resuming the draft or making any changes.
                    Confluence.Editor.Drafts.save({
                        // Skip error handler because it shows a BRIGHT RED draft save ERROR due to the browser
                        // cancelling in-flight ajax requests during page unload even if the server received the
                        // draft request and saved it successfully but did not respond in time.
                        skipErrorHandler: true
                    });
                });

                bindEventsToDraftDialog();

                if (Meta.getBoolean('shared-drafts')){
                    sharedDraftsFeatures(ed);
                }

                return setInterval(Confluence.Editor.Drafts.save, +AJS.params.draftSaveInterval || 30000);
            };

            function previewActionSelectedHandler (){
                if (Confluence.Editor.editorHasContentChanged()){
                    Confluence.Editor.Drafts.save({forceSave: true});
                }
            }

            ed.onInit.add(function(){
                AJS.bind("rte-preview-action-selected", previewActionSelectedHandler);

                if (Meta.get('shared-drafts') && AJS.DarkFeatures.isEnabled('collaborative-audit-log')) {
                    AJS.bind("editor.local.change", addCurrentUserAsDraftCollaborator);
                }
            });

            ed.onRemove.add(function(){
                AJS.unbind("rte-preview-action-selected", previewActionSelectedHandler);
            });

            // ** PLEASE READ THIS **
            // Ideally, we want to use the tinymce plugin interface (onInit, onRemove) to start and teardown the plugin.
            // We have some problems that we need to address first though:
            // - Confluence.Editor.UI is not bound yet on ed.onInit yet (what happens on init.rte), so
            // we need to rely on AJS.bind instead, which gets triggered much after.
            // TODO: this needs to be fixed.

            AJS.bind("disable-draft-save", function() {
                AJS.debug("Clearing draft save interval");
                clearInterval(setIntervalId);
                setIntervalId = null;
            });

            AJS.bind("enable-draft-save", function() {
                AJS.debug("Enabling draft save interval");
                if (!setIntervalId) {
                    setIntervalId = setInterval(Confluence.Editor.Drafts.save, +AJS.params.draftSaveInterval || 30000);
                }
            });

            //ed.onInit.add(function(){ // this is the correct way of doing it that we should use in the future. See comment above.
            AJS.bind("rte-ready", function() {
                AJS.debug('confluence drafts plugin initialisation');
                setIntervalId = init(ed);
            });

            //ed.onRemove.add(function(){ // this is the correct way of doing it that we should use in the future. See comment above.
            AJS.bind("rte-destroyed", function() {
                AJS.debug('confluence drafts plugin tear down');
                clearInterval(setIntervalId);
            });

        },

        getInfo : function() {
            return {
                longname : 'Confluence Drafts',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };
});

require('confluence/module-exporter').safeRequire('confluence-editor/tinymce3/plugins/confluencedrafts/editor_plugin_src', function(ConfluenceDraftsPlugin) {
    var tinymce = require('tinymce');

    tinymce.create('tinymce.plugins.ConfluenceDrafts', ConfluenceDraftsPlugin);

    // Register plugin
    tinymce.PluginManager.add('confluencedrafts', tinymce.plugins.ConfluenceDrafts);
});
