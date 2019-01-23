define("vfm/services/file-service", [
    "ajs",
    "jquery"
],
function (
    AJS,
    $
) {
    "use strict";

    return {
        getCommentCount: function (pageId, attachId) {
            var restUrl = "/rest/files/1.0/files/content/{0}/commentCount?attachmentId={1}";

            restUrl = AJS.contextPath() + AJS.format(restUrl, pageId, attachId);
            return $.get(restUrl);
        }
    };
});
