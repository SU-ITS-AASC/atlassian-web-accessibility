define('confluence-collaborative-editor-plugin/synchrony-handlers', [
    'underscore',
    'jquery',
    'ajs',
    'confluence/meta',
    'confluence/analytics-support',
    'confluence/legacy',
    'confluence-editor/editor/page-editor-message',
    'confluence-collaborative-editor-plugin/lib/SyncManager',
    'confluence-collaborative-editor-plugin/synchrony-util',
    'confluence-collaborative-editor-plugin/synchrony-content',
    'confluence-collaborative-editor-plugin/synchrony-presence',
    'confluence-collaborative-editor-plugin/util/location-provider',
    'confluence-collaborative-editor-plugin/util/url-parser',
    'confluence-collaborative-editor-plugin/util/editor-format-fixer'
], function (
    _,
    $,
    AJS,
    Meta,
    Analytics,
    Confluence,
    Message,
    SyncManager,
    Util,
    Content,
    SynchronyPresence,
    LocationProvider,
    UrlParser,
    EditorFormatFixer
) {
    'use strict';

    var $revField;
    var statusIndicator;
    var editor;
    var htmlDoc;
    var entity;
    var syncManager;
    var synchronyContentReady;
    var lastKnownContributors = [];

    function handle(_entity, _editor, _statusIndicator, _synchronyContentReady) {
        Util.time("confluence.editor.synchrony.connect");
        entity = _entity;
        editor = _editor;
        statusIndicator = _statusIndicator;
        synchronyContentReady = _synchronyContentReady.pipe(null, function (error) {
            entity.destroy();
            statusIndicator.onDisconnectedState();
            return getPublishError(error, 'collaborative-editor-load-failure', true);
        });

        $revField = $('#syncRev');
        htmlDoc = editor.getBody();

        entity.on('init', handleInit)
            .on('update', handleUpdate)
            .on('ack', handleAck)
            .on('connected', handleConnected)
            .on('disconnected', handleDisconnected)
            .on('error', handleError);

        // responsible for managing entity.start/entity.stop abstraction layer
        syncManager = new SyncManager(entity, {
            DEBUG_MODE: true
        });

        Content.bindPostPasteFix();
        Content.readTitleFromRootElement(htmlDoc);
        Confluence.Editor.overrideBeforeSave(handleBeforeSave);
        $('#content-title').keyup(Content.writeTitleToRootElement);
    }

    function handleHeartbeatEvent(e, data) {
        if (data.contributors) {
            lastKnownContributors = data.contributors;
            AJS.unbind(e, handleHeartbeatEvent);
        }
    }

    AJS.bind('editor-heartbeat', handleHeartbeatEvent);

    function handleInit(event) {
        $revField.val(event.rev.toString());
    }

    function handleAck(event) {
        $revField.val(event.rev.toString());

        AJS.trigger('synchrony.entity.ack', { 'pendingChanges': event.pending.length > 0 });
    }

    function handleDisconnected() {
        statusIndicator.onDisconnectedState();
        AJS.log('Synchrony disconnected!');
    }

    function handleError(event) {
        //TODO: We probably want to fire a confluence.synchrony.connection.error event similar to the backend to indicate a connection failure here, but the error comes from within sockjs and we can't handle it yet. https://jira.atlassian.com/browse/WD-463
        if (event.level === 'fatal') {
            AJS.trigger("editor.error.message", {
                disablePublish: true
            });
        }
    }

    function handleConnected(event) {
        Util.timeEnd("confluence.editor.synchrony.connect");
        AJS.log('Synchrony connected.');

        SynchronyPresence.appendTo(event.sid, entity, lastKnownContributors);
        statusIndicator.onConnectedState(entity);

        AJS.trigger('synchrony.connected');

        Content.fixTinymceCaretContainer(htmlDoc, editor);
    }

    function getPublishError(cause, messageKey, disablePublish) {
        return {
            origin: 'synchrony',
            cause: cause,
            messageKey: messageKey,
            disablePublish: disablePublish
        };
    }

    function handleBeforeSave(e) {
        var timeout = 5000;
        var changesAcked = $.Deferred();

        function synchronySuccess() {
            changesAcked.resolve(e);
        }

        function onAck(event) {
            if (!event.pending.length) {
                entity.off('ack', onAck);
                $revField.val(event.rev.toString());
                synchronySuccess();
            }
        }

        var synced = !entity.ackState().pending.length;
        if (synced) {
            synchronySuccess();
        }
        else {
            entity.on('ack', onAck);

            setTimeout(function () {
                entity.off('ack', onAck);
                changesAcked.reject(getPublishError('timeout'));
            }, timeout);
        }

        return $.when(changesAcked, synchronyContentReady).promise();
    }

    function userNameFromUpdateEvent(event) {
        var latestWithUser = Util.getLatestRevisionWithAttr(event.revisions, "user");
        return latestWithUser ? latestWithUser.meta.user : AJS.I18n.getText("anonymous.name");
    }

    function notifyPublished(userName) {
        Message.handleMessage('editor.synchrony.page-published', {
            type: 'info',
            message: AJS.I18n.getText('editor.synchrony.publish-page.message', AJS.escapeHtml(userName)),
            close: 'auto'
        });

        AJS.trigger('analyticsEvent', {
            name: 'confluence.synchrony.external-changes.publish'
        });
        AJS.trigger('editor-shared-drafts-published');
    }

    function updateMetadataForPublish() {
        Meta.set("new-page", false);
        Meta.set("page-id", Confluence.getContentId());
        Meta.set("draft-id", "0"); // We don't know the draft ID at this stage, but we know it's invalid.

        // Here we enable the discard button only if limited mode is not enabled.
        if (!Confluence.Editor.isLimitedModeEnabled()) {
            Confluence.Editor.UI.setButtonState(true, $('#rte-button-discard'));
        }
    }

    function handleUpdate(event) {
        if (event.updateType === 'remote') {
            $revField.val(event.revisions[event.revisions.length - 1].rev.toString());

            if (Util.hasRevisionTrigger(event.revisions, 'reset')) {
                Message.handleMessage('editor.synchrony.revert-page', {
                    type: 'info',
                    message: AJS.I18n.getText('editor.synchrony.revert-page.message', AJS.escapeHtml(userNameFromUpdateEvent(event)))
                });

                // Collaborators will be cleared from the draft upon reset. If the client continues editing, they will
                // need to be added as a collaborator again
                Meta.set('has-collaborated', false);

                resetDirtyFlag();

                AJS.trigger('analyticsEvent', {
                    name: 'confluence.synchrony.external-changes.revert'
                });

                //CONFDEV-47416: notify other modules to cleanup data if necessary
                AJS.trigger("editor-shared-drafts-discarded");

                // Here we trigger a heartbeat to keep things in sync.
                Confluence.Editor.heartbeat();
            }

            if (Util.hasRevisionTrigger(event.revisions, 'publish')) {
                if (Content.isUnpublished()) {
                    updateMetadataForPublish();
                }
                // Collaborators will be cleared from the draft upon publishing. If the client continues editing, they will
                // need to be added as a collaborator again
                Meta.set('has-collaborated', false);

                resetDirtyFlag();

                notifyPublished(userNameFromUpdateEvent(event));

                // Here we trigger a heartbeat to keep things in sync.
                Confluence.Editor.heartbeat();
            }

            if (Util.hasRevisionType(event.revisions, 'external')) {
                AJS.trigger('editor.external.change');
            }

            var latestWithConfVersion = Util.getLatestRevisionWithAttr(event.revisions, "confVersion");

            if (latestWithConfVersion && latestWithConfVersion.meta.confVersion) {
                $('meta[name="page-version"]').attr('content', latestWithConfVersion.meta.confVersion);
                $('meta[name="ajs-page-version"]').attr('content', latestWithConfVersion.meta.confVersion);
                Meta.set('page-version', latestWithConfVersion.meta.confVersion);
            }
        }
        // DOM mutations must not happen in the update event
        setTimeout(function () {
            if (event.updateType === 'init' || event.updateType === 'remote') {
                //We consider init a remote change because of the content reconciliation,
                //which now uses editor format directly (not modified by editor javascript)
                //pagelayouts listen for this and otherwise they wouldn't be editable
                AJS.trigger('editor.remote.change'); //CONFDEV-43345
                Content.readTitleFromRootElement(htmlDoc);
            }
            //A hack fix for  https://jira.atlassian.com/browse/CONFSERVER-52060
            if (event.updateType == 'init') {
                /**
                 * This fix is only applied
                 * if the base url of the location is the same as the configured base url (this prevents possibly breaking page content
                 * due to misconfigured base urls).
                 */
                if (isContextPathInLocation(LocationProvider.getLocation())) {
                    editor.undoManager.ignore(function () {
                        var count = EditorFormatFixer.fixStaleBaseUrl(htmlDoc);
                        if (count > 0) {
                            Analytics.publish('collab.edit.format.stale.fix.count', {
                                staleformatfixed: count
                            });
                        }
                    });
                } else {
                    AJS.log("Request url does not match the configured base url. Not performing fixStaleBaseUrl().");
                }
                //fix for https://jira.atlassian.com/browse/CONFSRVDEV-6580 (and related https://jira.atlassian.com/browse/CONFDEV-40982)
                editor.undoManager.ignore(function(){
                    EditorFormatFixer.fixMentions(htmlDoc);
                });
            }

            Content.fixTinymceCaretContainer(htmlDoc, editor);

            if (event.updateType === 'local') {
                /**
                 * If the undo manager discards changes (> 256 changes)
                 * and the user undoes all >256 changes we will incorrectly
                 * call reset and not show the discard dialog even though
                 * the user has undoable changes that have been discarded
                 */
                if (!editor.undoManager.hasUndo()) {
                    editor.setDirty(false);
                }
                AJS.trigger('editor.local.change');
            }
        }, 0);
    }

    function resetDirtyFlag() {
        /**
         * edge case might happen when user B discard/publish
         * before user A get notification, he keeps typing
         * when user A get notification, dirty flag MUST NOT be reset
         * because new letters haven't been saved yet
         * => only reset dirty flag when there is no pending change
         */
        if (entity.ackState().pending.length === 0) {
            // We need to set the dirty flag back to false when unpublished changes are discarded/published
            editor.setDirty(false);
        }
    }

    /**
     * Checks whether the given location url contains the contextPath, and that the contextpath is the same
     * as the contextpath in the base-url.
     * @param location {Location} the window.location object
     * @returns {boolean}
     */
    function isContextPathInLocation (location) {
        var contextPath = Meta.get('context-path');
        var configuredBaseUrl = UrlParser.parseUrl(Meta.get('base-url'));
        var locationUrl = UrlParser.parseUrl(location);
        var constructedBaseUrl = UrlParser.parseUrl(locationUrl.protocol + "://" + locationUrl.host + contextPath);
        return _.isEqual(configuredBaseUrl, constructedBaseUrl);
    }

    return {
        handle: handle
    };
});
