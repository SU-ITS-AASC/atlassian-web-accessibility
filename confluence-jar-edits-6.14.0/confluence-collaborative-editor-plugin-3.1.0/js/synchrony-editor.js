define('confluence-collaborative-editor-plugin/synchrony-editor', [
    'window',
    'jquery',
    'ajs',
    'confluence/legacy',
    'confluence-collaborative-editor-plugin/editor-blanket',
    'confluence-collaborative-editor-plugin/synchrony-util',
    'confluence-collaborative-editor-plugin/synchrony-content',
    'confluence-collaborative-editor-plugin/synchrony-auth',
    'confluence-collaborative-editor-plugin/synchrony-entity',
    'confluence-collaborative-editor-plugin/synchrony-handlers',
    'confluence-editor/support/atlassian-editor-support',
    'confluence-editor/loader/collaborative-helper',
], function (window,
             $,
             AJS,
             Confluence,
             EditorBlanket,
             Util,
             Content,
             Auth,
             SynchronyEntity,
             Handlers,
             EditorSupport,
             CollaborativeHelper) {

    'use strict';

    var exports = {};
    Util.time("confluence.editor.synchrony.jsLoad");

    // The optimistic snapshot request should expire after significant changes to the content have been performed.
    // We assume that in the general case content will not experience significant changes within a certain time limit.
    var OPTIMISTIC_SNAPSHOT_REQUEST_TIMEOUT_MS = 10 * 60 * 1000; // 10min
    var SYNCHRONY_CONNECTION_TIMEOUT_MS = 30 * 1000; // 30s

    var statusIndicator;
    var fatalError = false;

    var didSynchronyConnect = false;
    var didUserHitTimeout = false;

    var entity;

    $(window).bind("beforeunload", function () {
        if (!didSynchronyConnect) {
            AJS.trigger('analyticsEvent', {
                name: 'confluence.synchrony.exit.before.connecting',
                data: {
                    afterTimeout: didUserHitTimeout,
                    contentId: Confluence.getContentId()
                }
            });
        }
    });

    // For page objects to wait correctly in tests
    function setCollaborativeEditorStatus(status) {
        $('meta[name="ajs-collaborative-editor-status"]').attr('content', status);
    }

    function isSlowEdit() {
        return !AJS.Rte.isQuickEdit
    }

    // TODO Can this be moved to the status indicator file?
    function loadStatusIndicator() {
        // Let's make sure this is ready, as it's used on editor binding
        // Might not be necessary if this code is refactored and we don't need to pass the status indicator around
        var statusIndicatorReady = $.Deferred();

        AJS.$(function () {
            AJS.$('body').addClass('synchrony-active');
            var StatusIndicator = require('confluence-collaborative-editor-plugin/status-indicator-view');
            statusIndicator = new StatusIndicator({
                el: '#pluggable-status',
                model: new Backbone.Model({
                    minActiveTime: 500
                })
            });

            Auth.init(statusIndicator);
            statusIndicatorReady.resolve();
        });
        return statusIndicatorReady;
    }

    function showLoadFailureMessage(error) {
        var title, message;

        switch (error) {
            case 'timeout':
                title = AJS.I18n.getText('editor.collaborative-editing.websocket.fail.title');
                message = AJS.I18n.getText('editor.collaborative-editing.websocket.fail.body');
                break;
            case 'synchrony-requests':
                fatalError = true;
                title = "";
                message = AJS.I18n.getText('editor.collaborative-editing.synchrony-requests.fail');
                break;
            case 'limited-mode':
                fatalError = true;
                title = "";
                message = AJS.I18n.getText('editor.collaborative-editing.refresh-editor.error');
                break;
            default:
                fatalError = true;
                title = "";
                message = AJS.I18n.getText('editor.collaborative-editing.load.error');
                break;
        }
        AJS.trigger('editor.error.message', {
            title: title,
            messageKey: 'collaborative-editor-load-failure',
            message: message,
            disablePublish: true,
            close: 'manual'
        });
    }

    function hideLoadFailureMessage() {
        AJS.trigger('dismiss.editor.error.message', {
            messageKey: 'collaborative-editor-load-failure',
            enablePublish: true
        });
    }

    function alwaysResolve(promise, label) {
        var d = $.Deferred();
        promise.done(function () {
            Util.timeEnd(label);
        }, d.resolve);
        promise.fail(d.resolve);
        return d.promise();
    }

    function getRequestsError(snapshotRes, contentReconciliationRes) {
        // The condition where we trigger a resynchronisation of confluence and synchrony will be an invalid ancestor
        // error from the content reconciliation request which will occur whether they know about the entity or not.
        var crResponseContent = ((contentReconciliationRes[1] === 'error' && contentReconciliationRes[0].responseText)
            ? JSON.parse(contentReconciliationRes[0].responseText)
            : "");

        var behind = false;
        if (crResponseContent.type === 'invalid-ancestor') {
            behind = "synchrony";
        } else if (crResponseContent.type === 'out-of-order-revision') {
            behind = "confluence";
        }

        if (behind) {
            AJS.log('Performing synchrony recovery');
            $.ajax({
                url: AJS.contextPath() + '/rest/synchrony/1.0/content/' + Confluence.getContentId() + '/recovery?behind=' + behind + '&conflictingRev=' + crResponseContent['conflicting-rev'],
                type: 'PUT'
            });
            return 'synchrony-requests'; // error
        }

        if ((contentReconciliationRes[1] !== "success" && snapshotRes[1] !== "success") ||
            (contentReconciliationRes[1] !== "success" && crResponseContent.type !== "duplicate-mismatch")) {
            // client-side content-reconciliation has failed
            AJS.trigger("analyticsEvent", {
                name: "confluence.synchrony.client.content.reconciliation.failure",
                data: {
                    type: crResponseContent.type,
                    contentId: Confluence.getContentId()
                }
            });
            return 'synchrony-requests'; // error
        }

        return false;
    }

    exports._bindEditor = function (content, editor, snapshotRes, contentReconciliationRes, synchronyContentReady) {
        Util.time("confluence.editor.synchrony.init");

        var error = getRequestsError(snapshotRes, contentReconciliationRes);
        if (error) {
            return null; // error
        }

        var $revField = $('#syncRev');

        // If we have a snapshot then we want to use it as the base state of the
        // entity. 'history.base' is the state the entity will materialize into
        // the dom upon initialization.
        var history = null;
        if (snapshotRes[1] === 'success') {
            var snapshotInfo = snapshotRes[0];
            history = {
                base: {
                    rev: Synchrony.rev(snapshotInfo.stateAt),
                    state: snapshotInfo.state
                }
            };

            $revField.val(history.base.rev.toString());
        }

        AJS.log('Synchrony will load with contentId: ', Confluence.getContentId());

        try {
            // Ensure the document the user starts out with includes the
            // same title attribute as the one in the CR request,
            // otherwise the incoming changes from the CR request in the
            // connected event will overwrite any changes to the title
            // after the blanket is lifted and before the connected
            // event.
            var htmlDoc = editor.getBody();
            htmlDoc.setAttribute('data-title', content.title);

            entity = SynchronyEntity.bind(Synchrony, editor, htmlDoc, history, content);

            Handlers.handle(entity, editor, statusIndicator, synchronyContentReady);

            /**
             * When the Synchrony entity initialises, any content which was present in the editor is cleared,
             * and Synchrony appends a snapshot as the content in the editor.
             * We trigger a remote change so that any tinymce plugin can run through its init process again on the new content,
             * then mark the editor as not dirty.
             */
            AJS.trigger('editor.remote.change');
            editor.setDirty(false);

            Util.timeEnd("confluence.editor.synchrony.init");

            return entity;
        } catch (e) {
            AJS.logError(e);
            return null; // error
        }
    };

    // Fetches the head state of the document from synchrony.
    function requestSnapshot(cached) {
        function snapshotRequestProvider(token) {
            Util.time("confluence.editor.synchrony.snapshot");

            /**
             * Because we want to prevent CORS OPTIONS preflight requests for performance reasons,
             * we are doing this request as a "simple request"
             * (https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS?redirectlocale=en-US&redirectslug=HTTP_access_control#Simple_requests)
             * and passing the actual request in the payload
             */
            return alwaysResolve($.ajax({
                type: 'POST',
                url: encodeURI(Util.getServiceUrl() + '/data' + Util.getEntityId() + '?state-at=@head&state-format=type-tagged&rewrite-request=true&cached=' + cached),
                contentType: 'text/plain',
                dataType: 'json',
                data: JSON.stringify({
                    headers: {
                        'content-type': 'application/json',
                        'x-token': token
                    },
                    method: 'GET'
                })
            }).pipe(Util.asArray, Util.asArray), "confluence.editor.synchrony.snapshot");
        }

        return Auth.performRequest(snapshotRequestProvider);
    }

    // Reconciles the published page with synchrony or creates the document from the given content if it doesn't yet exist.
    function requestContentReconciliation(content) {
        function crRequestProvider(token) {
            Util.time("confluence.editor.synchrony.CR");

            /**
             * Because we want to prevent CORS OPTIONS preflight requests for performance reasons,
             * we are doing this request as a "simple request"
             * (https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS?redirectlocale=en-US&redirectslug=HTTP_access_control#Simple_requests)
             * and passing the actual request in the payload
             */
            return alwaysResolve($.ajax({
                type: 'POST',
                url: encodeURI(Util.getServiceUrl() + '/data' + Util.getEntityId() + '?optimistic=true&rewrite-request=true'),
                dataType: 'json',
                contentType: 'text/plain',
                data: JSON.stringify({
                    body: {
                        ancestor: content.syncRev,
                        rev: content.confRev,
                        state: {
                            format: 'html',
                            value: content.html
                        },
                        merges: {master: {meta: {type: 'client-reconciliation'}}}
                    },
                    headers: {
                        'content-type': 'application/json',
                        'x-token': token
                    },
                    method: 'PUT'
                })
            }).pipe(Util.asArray, Util.asArray), "confluence.editor.synchrony.CR");
        }

        // Don't do CR when content completely empty for new pages CONFDEV-47057
        if (!content.syncRev && Content.isUnpublished() && (content.raw.length === 0 || /^\s+$/.test(content.raw))) {
            return $.Deferred().resolve([{}, "success"]);
        } else if (Content.isContentEmpty(content.raw)) {
            AJS.trigger('analyticsEvent', {
                name: 'confluence.synchrony.client.content.reconciliation.blank-content',
                data: {
                    contentId: Confluence.getContentId()
                }
            });
            return $.Deferred().resolve([{}, "success"]);
        }
        return Auth.performRequest(crRequestProvider);
    }

    function trackEditorReady(collabEditorReady) {
        Util.time("confluence.editor.synchrony");

        $.when(Date.now(), collabEditorReady).pipe(function (startTime) {
            setCollaborativeEditorStatus('on');

            var endTime = Date.now();
            AJS.trigger('analyticsEvent', {
                name: 'confluence.synchrony.editor.loaded',
                data: {
                    durationMillis: (endTime - startTime),
                    contentId: Confluence.getContentId()
                }
            });

            AJS.trigger("rte-collab-ready");

            Util.timeEnd("confluence.editor.synchrony");
            Util.timeEnd("confluence.editor");
        });
    }

    function trackConnection() {
        // synchrony.connected is redundant due to how namespaced events work, but let's be explicit
        // or change the synchrony.connected.fake at some point (triggered from webdriver page objects)
        var synchronyConnected = makePromise('synchrony.connected synchrony.connected.fake');
        var firstConnection = makePromise('synchrony.connected synchrony.connected.fake synchrony-unsupported-extension', SYNCHRONY_CONNECTION_TIMEOUT_MS);

        // A timeout here could be for a number of reasons. Plugin not configured correctly, plugin disabled,
        // or a failure to connect to synchrony, or a very long response from synchrony.
        firstConnection.fail(function (error) {
            showLoadFailureMessage(error);
            AJS.trigger('analyticsEvent', {
                name: 'confluence.synchrony.editor.load.timeout',
                data: {
                    contentId: Confluence.getContentId()
                }
            });
            bindEvent2WebsocketErrMsg();

            didUserHitTimeout = true;

            // Connection recovered after a while
            synchronyConnected.done(function () {
                if (!fatalError) {
                    didSynchronyConnect = true;
                    hideLoadFailureMessage();
                }
            });
        });
    }

    exports._initialiseCollabEditingComponents = function (synchronyContentReady) {
        var indicatorPromise = loadStatusIndicator();
        // Needed for webdriver tests that run without a running synchrony service,
        // which would otherwise never have the blanket lifted.
        $(window).one('synchrony.connected.fake', function (e) {
            if (e.namespace === 'connected.fake') { //Namespaced events FTW
                indicatorPromise.resolve();
                synchronyContentReady.resolve();
                hideLoadFailureMessage();
                setCollaborativeEditorStatus('fake');
            }
        });
        return indicatorPromise;
    };

    exports._initialiseSynchrony = function () {
        Util.time("confluence.editor.synchrony.deps");
        // Synchrony's async loader API, copy&pasted from the Synchrony API documentation.
        (function (b) {
            var a = b.Synchrony = b.Synchrony || {};
            if (!a.ready) {
                var e = a._cbs = a._cbs || [];
                a.ready = function (a) {
                    e.push(a)
                }
            }
            var c = function () {
                1 === a.state && (a.SockJS = b.SockJS, a.init())
            };
            if (b.SockJS) a.init && c(); else {
                var d = b._sockjs_onload;
                b._sockjs_onload = function () {
                    c();
                    d && d.apply(this, arguments)
                }
            }
        })(window);

        var synchronyReadyDeferred = $.Deferred();
        Synchrony.ready(synchronyReadyDeferred.resolve);

        return $.when(
            synchronyReadyDeferred.promise(),
            // wait for script loading errors
            // the JS resources will be loaded by its order in the array
            Util.loadScript(['/js/vendor/sockjs.min.js', '/js/synchrony.min.js'])
        ).pipe(function (Synchrony) {
            Util.timeEnd("confluence.editor.synchrony.deps");
            AJS.log('Synchrony successfully initialised.');
            return Synchrony;
        });
    };

    function initialiseCollabEditing(editTriggered, contentLoaded, collabEditorLoaded) {
        var synchronyReady = exports._initialiseSynchrony();
        var collabEditorReady = makePromise('synchrony.connected.fake');
        // TODO Get rid of namespaced events. synchronyContentReady should listen to 'synchrony.connected.fake' only not to 'synchrony.connected'
        // and then we could avoid passing null and having to deal with synchronyContentReady in initialiseCollabEditingComponents
        var synchronyContentReady = makePromise(null);

        // Wait for contentLoaded instead of editTriggered, in case the edit trigger
        // results in an error like max editors, and the content doesn't load yet.
        contentLoaded.pipe(function () {
            // Add timeout here, otherwise time spent in view mode will count towards it
            setTimeout(synchronyContentReady.reject, SYNCHRONY_CONNECTION_TIMEOUT_MS, 'synchrony-requests'); // Same timeout as Synchrony connection
        });

        var componentsReady = exports._initialiseCollabEditingComponents(synchronyContentReady);

        // To optimize editor loading we load the state as soon as possible and expect the editor to be loaded very soon
        // afterwards. Note that this will also trigger requests in view mode.
        var optimisticSnapshotReqTime = Date.now();
        var optimisticSnapshotReq = null;
        var optimisticSnapshotResult = null;

        if (!AJS.DarkFeatures.isEnabled('synchrony-pessimistic-snapshot')) {
            optimisticSnapshotReq = synchronyReady.pipe(function () {
                return requestSnapshot(true);
            });
            optimisticSnapshotReq.done(function (snapshotRes) {
                optimisticSnapshotResult = snapshotRes[1];
            });
        }

        var snapshotReq = $.when(editTriggered, synchronyReady).pipe(function () {
            if (!optimisticSnapshotReq
                || optimisticSnapshotReq.state() === 'rejected'
                || optimisticSnapshotResult === 'error'
                || (OPTIMISTIC_SNAPSHOT_REQUEST_TIMEOUT_MS < Date.now() - optimisticSnapshotReqTime)) {
                return requestSnapshot(false);
            }

            return optimisticSnapshotReq;
        });

        collabEditorLoaded.pipe(function () {
            trackConnection();
            trackEditorReady(collabEditorReady);
            EditorBlanket.applyBlanket(collabEditorReady);
        });

        contentLoaded.pipe(function (content) {
            var contentReconciliationReq = synchronyReady.pipe(function () {
                return requestContentReconciliation(content);
            });

            snapshotReq = $.when(snapshotReq, synchronyReady).pipe(function (snapshotRes, Synchrony) {
                Util.time("confluence.editor.synchrony.unmarshal");

                var response = snapshotRes;
                if (snapshotRes[1] === 'success') {
                    response = [{
                        stateAt: snapshotRes[0].stateAt,
                        state: Synchrony.unmarshal(snapshotRes[0].state.value)
                    }, snapshotRes[1]];
                }

                Util.timeEnd("confluence.editor.synchrony.unmarshal");
                return response;
            });

            $.when(snapshotReq, contentReconciliationReq).pipe(function (snapshotRes, contentReconciliationRes) {
                var error = getRequestsError(snapshotRes, contentReconciliationRes);
                if (error) {
                    synchronyContentReady.reject(error);
                } else {
                    synchronyContentReady.resolve();
                }
            });

            // If content is up to date, no need to wait for content reconciliation, just check for recovery errors when it's done
            if (!AJS.DarkFeatures.isEnabled('synchrony-pessimistic-CR') && (content.syncRevSource === 'synchrony-ack' || Content.isUnpublished())) {
                // It might happen that synchrony connects and user publishes before CR request comes back
                // This is unlikely and maintaining the publish button disabled until CR finishes can be tricky and confusing for the user
                // instead, if that happens, we will make publish wait until CR is done or fail if CR fails (see handleBeforeSave in synchrony-handlers.js)
                AJS.debug("confluence.editor.synchrony: content up to date, not waiting for CR");
                synchronyContentReady.fail(showLoadFailureMessage);

                // We know Synchrony is ready from snapshotReq, otherwise add it here
                return $.when(content, collabEditorLoaded, snapshotReq, [{}, "success"], componentsReady);
            }

            // We know Synchrony is ready from snapshotReq, otherwise add it here
            return $.when(content, collabEditorLoaded, snapshotReq, contentReconciliationReq, componentsReady);
        }).pipe(function (content, editor, snapshotRes, contentReconciliationRes) {
            var entity = exports._bindEditor(content, editor, snapshotRes, contentReconciliationRes, synchronyContentReady);
            if (!entity) {
                AJS.trigger("analyticsEvent", {
                    name: "confluence.synchrony.bind.failure",
                    data: {
                        contentId: Confluence.getContentId()
                    }
                });
                return $.Deferred().reject('editor-binding-failed');
            }
            collabEditorReady.resolve();
        }).fail(function (error) {
            collabEditorLoaded.always(function () { //We need to wait until the editor is loaded to actually show the errors, etc.
                if (error !== 'synchrony-not-enabled') {
                    AJS.log('Failed to load the collaborative editor', error);
                    showLoadFailureMessage(error);
                    AJS.$(function () {
                        statusIndicator.onDisconnectedState();
                    });
                    setCollaborativeEditorStatus('failed');
                    AJS.trigger("analyticsEvent", {
                        name: "confluence.synchrony.error",
                        data: {
                            error: error,
                            contentId: Confluence.getContentId()
                        }
                    });
                }
            });
        });
    }

    exports.init = function () {
        if (EditorSupport.isCollaborativeContentType()) {
            var collabEditingEnabled = makeInitPromise('rte-quick-edit-init rte-collaborative-content-ready rte-initial-raw-content-ready', true);
            var editTriggered = makeInitPromise('rte-quick-edit-init rte-collaborative-content-ready rte-initial-raw-content-ready rte-collab-editor-loaded', false);

            var contentLoaded = makeInitPromise('rte-collaborative-content-ready rte-initial-raw-content-ready', false, Content.getContent);

            var collabEditorLoaded = makeInitPromise('rte-collab-editor-loaded', false, AJS.Rte.getEditor);
            collabEditorLoaded = makeInitPromise('rte-ready rte-begin-collab-editing', false, AJS.Rte.getEditor, isSlowEdit, collabEditorLoaded);

            collabEditingEnabled.pipe(function () {
                initialiseCollabEditing(editTriggered.promise(), contentLoaded.promise(), collabEditorLoaded.promise());
            });

            contentLoaded.fail(showLoadFailureMessage);

            AJS.trigger('synchrony-events-bound');

            collabEditorLoaded.fail(function (error) {
                if (error === 'synchrony-not-enabled') {
                    nonCollabEditingShenanigans();
                    AJS.log('Synchrony is not available in this context.');
                }
            });
        }
    };

    exports.register = function () {
        CollaborativeHelper.registerPlugin(exports);
    };

    exports.getSynchronisedEditorContent = function () {
        var ackState = entity.ackState();
        if (ackState.rev) {
            var domElement = Synchrony.makeDom(ackState.state, {
                document: document,
                whitelist: SynchronyEntity.makeWhitelist(Synchrony)
            });
            var tinymce = require('tinymce');
            return {
                content: tinymce.activeEditor.serializer.serialize(domElement),
                syncRev: ackState.rev.toString()
            };
        }
        AJS.logError('Synchrony hasn\'t acked any data, can\'t fetch draft data');
        return null;
    };

    // The editor is by default hidden. Collaborative draft-edit mode is handled by the Synchrony init process.
    // For any other editors/modes (comments), or when Synchrony is not enabled or can't be enabled,
    // we still have to show the editor every time it becomes ready (which may be multiple times on a single page).
    function nonCollabEditingShenanigans() {
        EditorBlanket.showEditor();
        setCollaborativeEditorStatus('off');
    }

    function makePromise(events, timeout, error) {
        var promise = $.Deferred();

        if (events) {
            AJS.bind(events, function handler(e, data) {
                AJS.debug("confluence.editor.synchrony.event: " + e.type + "." + e.namespace);
                AJS.unbind(events, handler);
                promise.resolve(data);
            });
        }

        if (timeout) {
            setTimeout(promise.reject, timeout, error || 'timeout');
        }

        return promise;
    }

    function makeInitPromise(events, immediateInit, dataProvider, conditionProvider, existingPromise) {
        var promise = existingPromise || $.Deferred();

        // If the editor is already initialised or we want to init already (and config is already available) we should be good to go
        if (Util.isEditorInitialised() || (immediateInit && Util.synchronyReady())) {
            return settlePromiseIfReady(promise, dataProvider);
        }

        AJS.bind(events, function handler(e, data) {
            AJS.debug('confluence.editor.event ' + e.type + "." + e.namespace);

            promise.always(function () {
                AJS.unbind(events, handler);
            });

            settlePromiseIfReady(promise, dataProvider, data, conditionProvider);
        });

        return promise;
    }

    function settlePromiseIfReady(promise, dataProvider, data, conditionProvider) {
        if (!Util.synchronyReady()) {
            return promise.reject('synchrony-not-enabled');
        }

        if (!conditionProvider || conditionProvider()) {
            var result = dataProvider ? dataProvider(data) : data;
            return result && result.error ? promise.reject(result.error) : promise.resolve(result);
        }

        return promise;
    }

    function bindEvent2WebsocketErrMsg() {
        $("#websocketRetry").on("click", function () {
            AJS.trigger("analyticsEvent", {
                name: "confluence.synchrony.editor.websocket.retry.click"
            });
            window.location.reload();
            return false;
        });
        $("#websocketFindmore").on("click", function () {
            AJS.trigger("analyticsEvent", {
                name: "confluence.synchrony.editor.websocket.findmore.click"
            });
        });
    }

    Util.timeEnd("confluence.editor.synchrony.jsLoad");

    return exports;
});

require('confluence/module-exporter').safeRequire('confluence-collaborative-editor-plugin/synchrony-editor', function (SynchronyEditor) {
    SynchronyEditor.register();
    SynchronyEditor.init();
});