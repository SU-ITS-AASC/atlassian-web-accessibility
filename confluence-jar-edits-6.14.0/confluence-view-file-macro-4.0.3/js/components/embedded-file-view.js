define("vfm/components/embedded-file-view", [
    "jquery",
    "backbone",
    "ajs",
    "confluence/legacy",
    "vfm/view-file-macro-utils"
],

function (
    $,
    Backbone,
    AJS,
    Confluence,
    viewFileMacroUtils
) {
    "use strict";

    function render(options) {
        var $el = $(options.el);
        //cache current embedded file/image
        var $embeddedFile = $el.find(".confluence-embedded-image, .confluence-embedded-file");
        if ($embeddedFile.hasClass("unknown-attachment") ||
            //TODO: this is temporary fix to prevent rendering overlay for unknown attachment.
            //CONFDEV-27688: should fix this
                ($embeddedFile.attr("src") && $embeddedFile.attr("src").indexOf("/confluence/plugins/servlet/confluence/placeholder/unknown-attachment") >= 0)) {
            return this;
        }

        var opts = {
            mimeType: "",
            niceType: ""
        };

        var isEmbeddedImage = $embeddedFile.hasClass("confluence-embedded-image");
        var isLinkedImage = $el.parent().is("a");
        var hasThumbnail = $embeddedFile.attr("data-has-thumbnail") === "true";
        if (isEmbeddedImage) {
            opts.mimeType = "image/png";
        } else {
            opts.mimeType = $embeddedFile.attr("data-mime-type");
            opts.niceType = $embeddedFile.attr("data-nice-type") !== "null" ? $embeddedFile.attr("data-nice-type") : "generic file";
        }

        var commentCountOverlay = !isLinkedImage ? _renderCommentCountOverlay($embeddedFile) : "";
        var fileTypeDescOverlay = (!isEmbeddedImage && hasThumbnail) ? _renderFileTypeDescOverlay(opts) : "";

        if (commentCountOverlay || fileTypeDescOverlay) {
            var overlay = Confluence.ViewFileMacro.Templates.overlayEmbeddedFile();
            $el.append(
                $(overlay)
                    .append(commentCountOverlay)
                    .append(fileTypeDescOverlay)
            );

            if (fileTypeDescOverlay) {
                $el.addClass("has-comment-overlay");
            }
        }
    }

    /**
     * If comment count is larger than 9, it will be formatted to "9+".
     * @param count comment count
     * @return String represent a count comment
     * @private
     */
    var _formatCommentCount = function (count) {
        count = parseInt(count, 10);
        count = $.isNumeric(count) ? count : 0;

        return count > 9 ? "9+" : count + "";
    };

    var _renderCommentCountOverlay = function ($embeddedFile) {
        var result = "",
                pageId = $embeddedFile.attr("data-linked-resource-container-id"),
                attachId = $embeddedFile.attr("data-linked-resource-id");

        if (pageId && attachId) {
            var commentCount = $embeddedFile.attr("data-unresolved-comment-count");
            var commentCountRep = _formatCommentCount(commentCount);
            if (commentCountRep !== "0") {
                result = Confluence.ViewFileMacro.Templates.overlayEmbeddedFileCommentCount({
                    commentCountRep: commentCountRep
                });
            }
        }
        return result;
    };

    var _renderFileTypeDescOverlay = function (opts) {
        return Confluence.ViewFileMacro.Templates.overlayEmbeddedFileFileTypeDesc({
            fileType: viewFileMacroUtils.getFileTypeTextFromNiceType(opts.niceType),
            iconClass: AJS.Confluence.FileTypesUtils.getAUIIconFromMime(opts.mimeType)
        });
    };

    return {
        render: render
    };
});
