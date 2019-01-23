/**
 * @module confluence-editor/utils/attachments-insert-utils
 */
define("confluence-editor/utils/attachments-insert-utils", [
    "underscore",
    "confluence/meta",
    "jquery"
],
function (
    _,
    Meta,
    $
) {
    "use strict";

    return {
        insertFilePlaceholder: function (params, replacedNode, showPropertiesPanelAfterInsert) {
            var tinymce = require('tinymce');

            var DEFAULT_HEIGHT = "250";
            var DEFAULT_HEIGHT_IN_COMMENT = "150";

            params.height = (Meta.get("content-type") === "comment") ? DEFAULT_HEIGHT_IN_COMMENT : DEFAULT_HEIGHT;

            // do not send page title and space key if attachment is in same page
            if (params.ownerId && params.ownerId === Meta.get("content-id")) {
                delete params.page;
                delete params.space;
                delete params.date;
            }

            params = _.omit(_.pick(params, "name", "page", "space", "date", "height"), function (value) {
                return !value;
            });

            var macro = {
                contentId: Meta.get("content-id") || "0",
                macro: {
                    name: "view-file",
                    params: params
                }
            };

            var promise = tinymce.confluence.MacroUtils.insertMacro(macro, replacedNode);
            promise.done(function (macroNode) {
                if (showPropertiesPanelAfterInsert) {
                    $(macroNode).click();
                }
            });
        }
    };
});

require('confluence/module-exporter').safeRequire("confluence-editor/utils/attachments-insert-utils");