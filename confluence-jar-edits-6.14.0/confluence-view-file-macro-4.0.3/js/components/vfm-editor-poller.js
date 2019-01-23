define("vfm/components/vfm-editor-poller", [
    "ajs",
    "jquery",
    "underscore",
    "tinymce",
    "vfm/view-file-macro-utils",
    "vfm/services/conversion-service"
], function(
    AJS,
    $,
    _,
    tinymce,
    viewFileMacroUtils,
    conversionService
) {

    "use strict";

    var poller;
    var isPollingEnabled = false;
    var pollingAttachmentsMap = {};
    var pollingInterval = viewFileMacroUtils.THUMBNAIL_POLLING_PERIOD;
    var pollingBackoffRatio = viewFileMacroUtils.THUMBNAIL_POLLING_BACKOFF_RATIO;

    function pollForThumbnails() {
        if (!tinymce.activeEditor || !isPollingEnabled) {
            return;
        }

        var $inProgressPlaceholders =
            $("img[data-macro-name='view-file']" +
                    "[src*='thumbnailStatus=" + viewFileMacroUtils.THUMBNAIL_STATUS_IN_PROGRESS + "']" +
                    "[data-thumbnail-status!='" + viewFileMacroUtils.THUMBNAIL_STATUS_ERROR + "']"
                , tinymce.activeEditor.dom.doc);

        if ($inProgressPlaceholders.length > 0) {
            var hasNewPlaceholder = false;
            $inProgressPlaceholders.each(function() {
                var $placeholder = $(this);
                var src = $placeholder.attr("src");
                var attachmentId = viewFileMacroUtils.getParameterByName(src, "attachmentId");
                var version = viewFileMacroUtils.getParameterByName(src, "version");

                if (!pollingAttachmentsMap[attachmentId] || pollingAttachmentsMap[attachmentId].version !== version) {
                    pollingAttachmentsMap[attachmentId] = {
                        version: version
                    };
                    hasNewPlaceholder = true;
                }
            });

            // if new files are added to editor, then reset the polling interval
            if (hasNewPlaceholder) {
                resetPollingInterval();
            }

            conversionService.postThumbnailConversionResults(pollingAttachmentsMap).then(function(results) {
                if (!tinymce.activeEditor || !isPollingEnabled) {
                    return;
                }
                _.each(results, function(status, attachmentId) {
                    if (!pollingAttachmentsMap[attachmentId]) {
                        return;
                    }
                    // get all placeholders having the same attachmentId
                    var $placeholders = $("img[data-macro-name='view-file']" +
                        "[src*='attachmentId=" + attachmentId + "']"
                        , tinymce.activeEditor.dom.doc);
                    var version = pollingAttachmentsMap[attachmentId].version;

                    $placeholders.attr("data-thumbnail-status", status);

                    if (status === viewFileMacroUtils.THUMBNAIL_STATUS_CONVERTED) {

                        var originalSrc = $placeholders.attr("src");
                        var thumbnailUrl = conversionService.getThumbnailUrl(attachmentId, version);
                        thumbnailUrl = viewFileMacroUtils.addParamsToUrl(thumbnailUrl, {
                            "attachmentId": attachmentId,
                            "mimeType": viewFileMacroUtils.getParameterByName(originalSrc, "mimeType")
                        });

                        $placeholders.attr("src", thumbnailUrl);

                        delete pollingAttachmentsMap[attachmentId];

                    } else if (status === viewFileMacroUtils.THUMBNAIL_STATUS_ERROR) {
                        delete pollingAttachmentsMap[attachmentId];
                    }
                });

                if (!_.isEmpty(pollingAttachmentsMap)) {
                    backoffPollingInterval();
                } else {
                    resetPollingInterval();
                }
                startPolling();
            });
        } else if ($inProgressPlaceholders.length === 0) {
            // keep doing polling because new files could be added to editor.
            resetPollingInterval();
            startPolling();
        }
    }

    function backoffPollingInterval() {
        pollingInterval = pollingInterval * pollingBackoffRatio;
    }

    function resetPollingInterval() {
        pollingInterval = viewFileMacroUtils.THUMBNAIL_POLLING_PERIOD;
    }

    function startPolling() {
        isPollingEnabled = true;
        if (poller) {
            clearTimeout(poller);
        }
        poller = setTimeout(pollForThumbnails, pollingInterval);
    }

    function stopPolling() {
        if (poller) {
            clearTimeout(poller);
            poller = undefined;
        }
        isPollingEnabled = false;
        pollingAttachmentsMap = {};
        resetPollingInterval();
    }

    var vfmEditorPoller = {
        startPolling: startPolling,
        stopPolling: stopPolling
    };

    return vfmEditorPoller;
});