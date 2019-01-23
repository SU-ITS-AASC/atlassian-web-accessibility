define('confluence-collaborative-editor-plugin/synchrony-auth', [
    'jquery',
    'ajs',
    'confluence/meta',
    'confluence/legacy',
    'confluence-collaborative-editor-plugin/synchrony-util'
], function (
    $,
    AJS,
    Meta,
    Confluence,
    Util
) {
    'use strict';

    var statusIndicator, numFailedJwtRenewals = 0;

    function getToken() {
        return Util.retrieveMetadata('synchrony-token');
    }

    function getTokenExpiry() {
        return parseInt(Util.retrieveMetadata("synchrony-expiry"));
    }

    // This function simply checks if the expiry date returned by the server is in the future.
    function isTokenValid() {
        var exp = getTokenExpiry();
        if (isNaN(exp)) {
            return false;
        }
        return exp > (Date.now() / 1000);
    }

    function getResponseBody(response) {
        if (response[1] === 'error'
            && response[0].responseText) {
            return JSON.parse(response[0].responseText);
        } else {
            return response[0];
        }
    }

    function performRequest(requestProvider) {
        return getTokenPromise().pipe(requestProvider).pipe(function (response) {
            var responseBody = getResponseBody(response);

            if (response[1] === 'error' && responseBody.type && responseBody.type.match(/^jwt\//)) {
                var error = {
                    errorType: responseBody.type,
                    message: responseBody.message
                };
                return getTokenPromise(error).pipe(requestProvider);
            }

            return response;
        });
    }

    function updateToken(deferred, error) {
        Util.time("confluence.editor.synchrony.token");

        var errorString = error && error.errorType ? "?errorType=" + error.errorType : "";

        $.ajax({
            dataType: 'json',
            method: 'GET',
            url: encodeURI(AJS.contextPath() + '/rest/synchrony/1.0/token/' + Confluence.getContentId() + '/generate'  + errorString)
        }).done(function(data) {
            Meta.set("synchrony-token", data.synchronyToken);
            Meta.set("synchrony-expiry", data.synchronyExpiry);
            numFailedJwtRenewals = 0;
            deferred.resolve(data.synchronyToken);

            // Don't wait for statusIndicator to be bound to perform requests to Synchrony
            if (statusIndicator) {
                statusIndicator.onConfluenceConnectedState();
                statusIndicator.onTokenRenewedState();
            }
            
            AJS.trigger("dismiss.editor.error.message", {
                messageKey: "synchrony-token-expired",
                enablePublish: true
            });

            AJS.debug("Synchrony JWT token updated.");
            Util.timeEnd("confluence.editor.synchrony.token");
        }).fail(function() {
            numFailedJwtRenewals++;
            if (numFailedJwtRenewals >= 10) {
                AJS.trigger("editor.error.message", {
                    messageKey: "synchrony-token-expired",
                    message: AJS.I18n.getText("editor.collaborative-editing.synchrony.token-expired"),
                    disablePublish: true
                });
            }

            // Don't wait for statusIndicator to be bound to perform requests to Synchrony
            if (statusIndicator) {
                statusIndicator.onConfluenceDisconnectedState();
                statusIndicator.onTokenExpiredState();
            }

            AJS.log(error ? error.message : "Confluence failed to renew JWT token.");
            deferred.reject('token');
        });
    }

    function getTokenPromise(error) {
        var dfd = $.Deferred();

        if (!error && isTokenValid()) {
            dfd.resolve(getToken());
        } else {
            AJS.log("[" + new Date() + "] Synchrony JWT expired or invalid, retrieving new token.");
            updateToken(dfd, error);
        }

        return dfd.promise();
    }

    // TODO better approach with statusIndicator as dependency instead
    function init(_statusIndicator) {
        statusIndicator = _statusIndicator;
    }

    return {
        init: init,
        performRequest: performRequest,
        getTokenPromise: getTokenPromise
    };
});
