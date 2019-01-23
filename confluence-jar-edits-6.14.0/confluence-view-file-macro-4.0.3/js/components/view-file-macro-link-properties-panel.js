define("vfm/components/view-file-macro-link-properties-panel", [
    "jquery",
    "ajs",
    "tinymce",
    "vfm/view-file-macro-utils"
],
function (
    $,
    AJS,
    tinymce,
    viewFileMacroUtils
) {
    "use strict";

    var VIEW_FILE_MACRO_NAME = "view-file";

    function _isShowConvertToThumbnailButton(linkNode) {
        if (linkNode) {
            var $linkNode = $(linkNode);
            var resourceType = $linkNode.attr("data-linked-resource-type");
            var contentType = $linkNode.attr("data-linked-resource-content-type");

            return AJS.MacroBrowser.getMacroMetadata(VIEW_FILE_MACRO_NAME) &&
                resourceType === "attachment" && // ignore non-attachment link
                !(contentType && contentType.indexOf("image") === 0); //ignore link to image
        }

        return false;
    }

    function _convertLinkToThumbnail(linkNode) {
        var url = AJS.REST.makeUrl("attachment/" + $(linkNode).attr("data-linked-resource-id") + ".json");
        $.ajax({
            type: "GET",
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        }).success(function (data) {
            var params = {"name": data.fileName};

            //do not send page title and space key if attachment is in same page
            if (AJS.Data.get("content-id") !== data.ownerId) {
                params.page = data.parentTitle;
                params.space = data.space.key;

                //calculate blogpost date
                if (data.parentContentType === "blogpost") {
                    var splitDate = data.createdDate.date.split("-");
                    params.date = splitDate[0] + "/" + splitDate[1] + "/" + splitDate[2].substring(0, 2) + "/";
                }
            }

            params.height = (AJS.Meta.get("content-type") === "comment") ? viewFileMacroUtils.DEFAULT_HEIGHT_IN_COMMENT : viewFileMacroUtils.DEFAULT_HEIGHT;

            var macro = {
                contentId: AJS.Meta.get("content-id") || "0",
                macro: {
                    name: VIEW_FILE_MACRO_NAME,
                    params: params
                }
            };

            //after convert to thumbnail, display its properties panel
            var promise = tinymce.confluence.MacroUtils.insertMacro(macro, linkNode);
            promise.done(function (macroNode) {
                $(macroNode).click();
            });
        });
    }

    return {
        init: function () {
            AJS.bind("link-property-panel-buttons.created", function (event, data) {
                var buttons = data.buttons;
                var linkNode = data.link;
                if (_isShowConvertToThumbnailButton(linkNode)) {
                    buttons.push({
                        className: "link-property-panel-convert-to-thumbnail-button",
                        text: AJS.I18n.getText("propertypanel.link.button.convert.to.thumbnail"),
                        tooltip: AJS.I18n.getText("propertypanel.link.button.convert.to.thumbnail.tooltip"),
                        click: function () {
                            AJS.Confluence.PropertyPanel.destroy();
                            _convertLinkToThumbnail(linkNode);
                            AJS.trigger('analyticsEvent', {name: 'confluence.view-file.convert.to-thumbnail-trigger'});
                        }
                    });
                }
            });
        }
    };
});
