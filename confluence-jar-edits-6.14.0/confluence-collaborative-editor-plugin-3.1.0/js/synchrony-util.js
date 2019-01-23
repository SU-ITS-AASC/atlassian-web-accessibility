define('confluence-collaborative-editor-plugin/synchrony-util', [
    'ajs',
    'jquery',
    'underscore',
    'confluence/meta',
    'confluence/legacy'
], function (AJS,
             $,
             _,
             Meta,
             Confluence) {
    'use strict';

    var lastSuccessfulBaseUrl;

    function retrieveMetadata(name) {
        // First we check if the AJS.Meta produces a result.
        var metaValue = Meta.get(name);
        if (metaValue === undefined) {
            // If not we will try reading the value from the DOM.
            metaValue = $('meta[name="ajs-' + name + '"]').attr('content');
            if (metaValue !== undefined) {
                // Here we set the AJS.Meta value as a contingency (also doubles as a cache for this call).
                Meta.set(name, metaValue);
            } else {
                console.error("Missing '" + name + "' metadata value");
                /**
                 * CONFSRV-746: display error if a metadata is not retrieved
                 * we are depending on <meta>: 'shared-drafts' and 'content-type'
                 * because they exist in the DOM from very first stage
                 */
                if (isEditorInitialised()) {
                    AJS.trigger('editor.error.message', {
                        messageKey: 'collaborative-editor-load-failure',
                        message: AJS.I18n.getText('editor.collaborative-editing.refresh-editor.error'),
                        close: 'manual'
                    });
                }
            }
        }
        return metaValue;
    }

    function getEntityId() {
        return '/' + retrieveMetadata('synchrony-app-id') + '/confluence-' + Confluence.getContentId();
    }

    function entityExists() {
        return Confluence.getContentId() !== '0';
    }

    function synchronyReady() {
        return entityExists();
    }

    /**
     * @private
     * @returns {Array} of base URLs
     */
    function getSynchronyBaseUrls() {
        return retrieveMetadata('synchrony-base-url').split(",");
    }

    /**
     * @public
     * @returns {string}
     */
    function getServiceUrl() {
        return (lastSuccessfulBaseUrl ? lastSuccessfulBaseUrl : getSynchronyBaseUrls()[0]) + "/v1";
    }

    function getXhrFallbackFlag() {
        return retrieveMetadata('use-xhr-fallback');
    }

    /**
     * @private
     * @param base
     * @param path
     * @returns {string}
     */
    function getResourcesUrl(base, path) {
        return base + "/resources" + path;
    }

    function getLatestRevisionWithAttr(revisions, attr) {
        return _.last(revisions.filter(function (revision) {
            return revision.meta && revision.meta[attr];
        }));
    }

    function hasRevisionType(revisions, type) {
        return revisions.some(function (revision) {
            return revision.meta && revision.meta.type === type;
        });
    }

    function hasRevisionTrigger(revisions, trigger) {
        return revisions.some(function (revision) {
            return revision.meta && revision.meta.trigger === trigger;
        });
    }

    function asArray() {
        return Array.prototype.slice.call(arguments);
    }

    function time(key) {
        Confluence.debugTime && Confluence.debugTime(key);
    }

    function timeEnd(key) {
        Confluence.debugTimeEnd && Confluence.debugTimeEnd(key);
    }

    /**
     * @private
     * @param base
     * @returns {string}
     */
    function getHeartbeatUrl(base) {
        return base + "/heartbeat";
    }

    function loadScript(paths) {
        var deferred = $.Deferred();
        var baseServiceUrls = getSynchronyBaseUrls();
        loadScriptForUrls(deferred, paths, baseServiceUrls);
        return deferred.promise();
    }

    function loadScriptForUrls(deferred, paths, urls) {
        if (urls.length === 0 || paths.length === 0) {
            deferred.reject();
            return;
        }
        var baseUrl = urls[0];
        var promise = $.ajax({
            url: getHeartbeatUrl(baseUrl),      // heartbeat check
            cache: false
        });

        promise.done(function(data, textStatus, jqXHR) {
            if (jqXHR.status === 200) {
                lastSuccessfulBaseUrl = baseUrl;

                var connectionOrder = urls.slice(1).length > 0 ? "primary" : "secondary";
                var connectionType = lastSuccessfulBaseUrl.indexOf("synchrony-proxy") > 0 ? "synchrony-proxy" : "synchrony-direct";

                Meta.set("synchrony-connection-order", connectionOrder);
                Meta.set("synchrony-connection-type", connectionType);

                // fetch scripts using successful base url
                $.when.apply(this, paths.map(function(path){
                    return $.ajax({
                        url: getResourcesUrl(baseUrl, path),
                        dataType: "script",
                        cache: true // don't load the script if it has been cached.
                    });
                })).then(function() {
                    deferred.resolve();
                });
            } else {
                loadScriptForUrls(deferred, paths, urls.slice(1));
            }
        }).fail(function () {
            loadScriptForUrls(deferred, paths, urls.slice(1));
        });
    }

    function isEditorInitialised() {
        return AJS.Rte.getEditor() && AJS.Rte.getEditor().initialized;
    }

    return {
        retrieveMetadata: retrieveMetadata,
        getEntityId: getEntityId,
        synchronyReady: synchronyReady,
        getServiceUrl: getServiceUrl,
        getXhrFallbackFlag: getXhrFallbackFlag,
        getLatestRevisionWithAttr: getLatestRevisionWithAttr,
        hasRevisionType: hasRevisionType,
        hasRevisionTrigger: hasRevisionTrigger,
        asArray: asArray,
        time: time,
        timeEnd: timeEnd,
        loadScript: loadScript,
        isEditorInitialised: isEditorInitialised
    };
});
