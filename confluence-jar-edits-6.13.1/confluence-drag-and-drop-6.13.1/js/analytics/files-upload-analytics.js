/**
 * @module conf/confluence-drag-and-drop/analytics/files-upload-analytics
 */
define("confluence-drag-and-drop/analytics/files-upload-analytics", [
    "ajs",
    "underscore"
],
/**
 * Analytic helper methods for uploading files
 */
function (
    AJS,
    _
) {

    "use strict";

    var FilesUploadAnalytics = {

        triggerEvent: function(eventName, files, isAllImage) {
            if (!files || !files.length) {
                return;
            }

            var data = {
                multiple: files.length > 1,
                number: files.length,
                isAllImage: isAllImage === undefined ? this._isAllImages(files) : isAllImage
            };

            AJS.trigger("analyticsEvent", {name: eventName, data: data});
        },

        _isAllImages : function (files) {
            return _.every(files, function (file) {
                return file.nativeFile && file.nativeFile.type && file.nativeFile.type.indexOf("image/") === 0;
            });
        }
    };

    return FilesUploadAnalytics;

});