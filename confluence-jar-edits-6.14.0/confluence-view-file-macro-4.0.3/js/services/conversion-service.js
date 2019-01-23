define("vfm/services/conversion-service", [
        "ajs",
        "jquery"
],
function (
    AJS,
    $
) {
    "use strict";

    return {
        postThumbnailConversionResults: function (attachmentsMap) {
            var restUrl = AJS.contextPath() + "/rest/documentConversion/latest/conversion/thumbnail/results";
            var attachmentIds = Object.keys(attachmentsMap);
            var attachmentIdsAndVersions = _.map(attachmentIds, function(attachmentId) {
                return {id: attachmentId, v: attachmentsMap[attachmentId].version};
            });

            return $.ajax({
                type: "POST",
                url: restUrl,
                contentType: "application/json",
                data: JSON.stringify(attachmentIdsAndVersions)
            });
        },

        getThumbnailUrl: function(attachmentId, version) {
            return AJS.contextPath()
                + "/rest/documentConversion/latest/conversion/thumbnail/" + attachmentId + "/" + version;
        }
    };
});
