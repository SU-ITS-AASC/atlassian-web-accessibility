define("vfm/components/view-file-macro-properties-panel", [
    "jquery",
    "underscore",
    "ajs",
    "confluence/legacy",
    "confluence/jsUri",
    "tinymce",
    "vfm/view-file-macro-utils"
],
function (
    $,
    _,
    AJS,
    Confluence,
    Uri,
    tinymce,
    viewFileMacroUtils
) {
    "use strict";

    var VIEW_FILE_MACRO_NAME = "view-file";
    var EDIT_MACRO_BUTTON_CLASS = "macro-placeholder-property-panel-edit-button";
    var REMOVE_MACRO_BUTTON_CLASS = "macro-placeholder-property-panel-remove-button";
    var UNKNOWN_ATTACHMENT_SRC = "placeholder/unknown-attachment";
    var DATA_MACRO_PARAMS = "data-macro-parameters";

    var SIZE_BUTTON_IDS = {
        "view-file-size-small" : "150",
        "view-file-size-medium" : "250",
        "view-file-size-large" : "400"
    };

    var viewFileMacroPropertiesPanelButtons = [
        {
            className: "macro-property-panel-view-file-size-small editor-resize resize-small",
            text: "",
            tooltip: AJS.I18n.getText("propertypanel.view.file.macro.button.size.small.tooltip"),
            iconClass: "aui-icon aui-icon-small aui-iconfont-image-resize",
            click: sizeButtonOnClick
        },
        {
            className: "macro-property-panel-view-file-size-medium editor-resize resize-medium",
            text: "",
            tooltip: AJS.I18n.getText("propertypanel.view.file.macro.button.size.medium.tooltip"),
            iconClass: "aui-icon aui-icon-small aui-iconfont-image-resize",
            click: sizeButtonOnClick
        },
        {
            className: "macro-property-panel-view-file-size-large editor-resize resize-large",
            text: "",
            tooltip: AJS.I18n.getText("propertypanel.view.file.macro.button.size.large.tooltip"),
            iconClass: "aui-icon aui-icon-small aui-iconfont-image-resize",
            click: sizeButtonOnClick
        },
        null, // spacer
        {
            className: "macro-property-panel-view-file-convert-to-link",
            text: AJS.I18n.getText("propertypanel.view.file.macro.button.convert.to.link"),
            tooltip: AJS.I18n.getText("propertypanel.view.file.macro.button.convert.to.link.tooltip"),
            click: linkButtonOnClick
        }
    ];

    function setSelectedButton(buttons, size) {
        var selectedButtonId = _.find(Object.keys(SIZE_BUTTON_IDS), function (buttonId) {
            return SIZE_BUTTON_IDS[buttonId] === size;
        });

        if (selectedButtonId) {
            for (var i = 0, length = buttons.length; i < length; i++) {
                var button = buttons[i];
                var className = button.className.replace(" active", "");
                if (className.indexOf("macro-property-panel-" + selectedButtonId) !== -1) {
                    className += " active";
                }

                button.className = className;
            }
        }
    }

    /**
     * This method is used to remove Edit and Remove buttons from the property panel
     *
     * @param buttons the original buttons of the property panel
     */
    function removeUnusedButtons(buttons) {
        var macroButtons = _.reject(buttons, function (button) {
            return button.className.indexOf(EDIT_MACRO_BUTTON_CLASS) > -1 ||
                button.className.indexOf(REMOVE_MACRO_BUTTON_CLASS) > -1;
        });
        buttons.splice(0, buttons.length);
        for (var i = 0; i < macroButtons.length; i++) {
            buttons.push(macroButtons[i]);
        }
    }

    /**
     * This method is used to resize the node to the specific height
     *
     * @param macroNode the node need to be update
     * @param height the new height
     */
    function resizeToPresetHeight(macroNode, height) {
        var $macroNode = $(macroNode);
        $macroNode.attr("height", height);

        var src = $macroNode.attr("src");
        if (isPlaceholder(src)) {
            $macroNode.attr("src", getNewURLWithNewHeight($macroNode.attr("src"), height));
            $macroNode.attr("data-mce-src", getNewURLWithNewHeight($macroNode.attr("data-mce-src"), height));

            if (tinymce.isGecko) {
                // Repaint to clear the image handles from their old positions.
                AJS.Rte.getEditor().execCommand('mceRepaint', false);
            }
        }

        updateMacroParams($macroNode, height);

        tinymce.activeEditor.undoManager.add();
    }

    function isPlaceholder(src) {
        return (src != null && src.indexOf("/servlet/view-file-macro/placeholder") >= 0);
    }

    /**
     * Create an new URL by replacing height attribute from the old URL
     *
     * @param oldURL
     * @param height
     * @returns {String}
     */
    function getNewURLWithNewHeight(oldURL, height) {
        var uri = new Uri(oldURL);
        if (uri.getQueryParamValue("height") !== "") {
            uri.replaceQueryParam("height", height);
        }
        return uri.toString();
    }

    /**
     * This method to return the array params of the macro node.
     * This is javascript version of a existing java version:
     * com.atlassian.confluence.content.render.xhtml.editor.macro.DefaultMacroParameterSerializer
     * private static List<String> split(final String str, final char splitChar)
     *
     * @param $macroNode the jquery object of the node
     * @returns {Array} the array params
     */
    function getMacroParams($macroNode) {
        var dataMacroParams = $macroNode.attr(DATA_MACRO_PARAMS);

        var params = [];
        var temp = "";
        for (var i = 0; i < dataMacroParams.length; i++) {
            var c = dataMacroParams[i];
            if (c === "\\") {
                temp += c;
                if (i + 1 !== dataMacroParams.length) {
                    temp += dataMacroParams[++i];
                }
            } else if (c === "|") {
                params.push(temp);
                temp = "";
            } else {
                temp += c;
            }
        }
        params.push(temp);

        return params;
    }

    /**
     * This method is used to update the "height" parameter for the macro
     *
     * @param $macroNode the jquery object of the node
     * @param height the new height
     */
    function updateMacroParams($macroNode, height) {
        var newParamString = "height=" + height;
        var params = getMacroParams($macroNode);

        // Looking for the "height" param
        var valueOfHeight = getMacroParamByKey($macroNode, "height");

        // If not found "height" param, then add the new one to array params. Otherwise, modify the current param
        if (valueOfHeight) {
            var paramHeightIndex = _.indexOf(params, "height=" + valueOfHeight);
            params[paramHeightIndex] = newParamString;
        } else {
            params.push(newParamString);
        }

        // Update the macro params to the macro node
        $macroNode.attr(DATA_MACRO_PARAMS, params.join("|"));
    }

    /**
     * Get a value based on parameter name of jquery macro element.
     * @param $macroNode the jquery object of the node.
     * @param key key of parameter.
     * @returns {string} value of the parameter, if not found, return null,
     */
    function getMacroParamByKey($macroNode, key) {
        var params = getMacroParams($macroNode);

        var foundParam = _.find(params, function (param) {
            return (param.indexOf(key + "=") >= 0);
        });

        return foundParam ? foundParam.split("=")[1] : null;
    }

    /**
     * This button is handler for 3 size buttons
     */
    function sizeButtonOnClick(button, macroNode) {
        // if that button is select, do nothing
        if ($(button).attr("class").indexOf("active") !== -1) {
            return;
        }

        AJS.Confluence.PropertyPanel.destroy();
        var ids = Object.keys(SIZE_BUTTON_IDS);
        var buttonClasses = $(button).attr("class");
        for (var i = 0; i < ids.length; i++) {
            if (buttonClasses.indexOf(ids[i]) !== -1) {
                resizeToPresetHeight(macroNode, SIZE_BUTTON_IDS[ids[i]]);
                // reopen properties panel
                $(macroNode).click();
                AJS.trigger('analyticsEvent', {name: 'confluence.view-file.resize.' + ids[i].substring(ids[i].lastIndexOf('-') + 1, ids[i].length)});
                return;
            }
        }
    }

    /**
     * This button is handler for convert to link button
     */
    function linkButtonOnClick(button, macroNode) {
        AJS.trigger('analyticsEvent', {name: 'confluence.view-file.convert.to-link-trigger'});
        AJS.Confluence.PropertyPanel.destroy();
        insertLink(macroNode);

        function insertLink(macroNode) {
            var attachmentId = viewFileMacroUtils.getParameterByName($(macroNode).attr("src"), "attachmentId");
            var restUrl = AJS.REST.makeUrl("attachment/" + attachmentId + ".json");

            $.ajax({
                type: "GET",
                url: restUrl,
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            }).success(function (data) {
                var link = Confluence.Link.fromREST(data);
                var newLinkNode = link.insert();

                tinymce.activeEditor.undoManager.add();
                tinymce.activeEditor.focus();

                newLinkNode.click();
            });
        }
    }

    /**
     * Render file icon and file name in property panel for view-file macro.
     */
    function renderFileIconAndNameInPanel () {

        AJS.bind("created.property-panel", function (e, propertyPanel) {
            var $macroPlaceHolder = $(propertyPanel.anchor);
            var macroName = $macroPlaceHolder.attr("data-macro-name");

            if (macroName !== VIEW_FILE_MACRO_NAME) {
                return;
            }

            var getTemplate = Confluence.ViewFileMacro.Templates.Editor.viewFilePropertyPanelHeader;
            var fileName = getMacroParamByKey($macroPlaceHolder, "name");
            var mimeType = viewFileMacroUtils.getParameterByName($macroPlaceHolder.attr("src"), "mimeType");
            var fileIcon = AJS.Confluence.FileTypesUtils.getAUIIconFromMime(mimeType);

            var $header = $(getTemplate({
                fileName: fileName,
                fileIcon: fileIcon
            }));
            propertyPanel.panel.find(".aui-property-panel").prepend($header);

            // Adjust position of bottom arrow because height of property panel is changed (include $header).
            if (propertyPanel.shouldFlip) {
                propertyPanel.tip.css({
                    top: propertyPanel.panel.outerHeight()
                });
            }
        });
    }

    return {
        init: function () {
            AJS.Confluence.PropertyPanel.Macro.registerInitHandler(function (initMacroNode, buttons, options) {
                // remove edit and remove buttons
                removeUnusedButtons(buttons);

                var $macroNode = $(initMacroNode);
                var dataMceSrc = $macroNode.attr("data-mce-src");
                // do not show panel for unknown attachment
                if (dataMceSrc && dataMceSrc.indexOf(UNKNOWN_ATTACHMENT_SRC) > -1) {
                    return;
                }

                // add custom buttons
                for (var i = 0, length = viewFileMacroPropertiesPanelButtons.length; i < length; i++) {
                    buttons.push(viewFileMacroPropertiesPanelButtons[i]);
                }

                var currentHeight = $macroNode.attr("height");
                if (!currentHeight) {
                    currentHeight = (AJS.Meta.get("content-type") === "comment") ? viewFileMacroUtils.DEFAULT_HEIGHT_IN_COMMENT : viewFileMacroUtils.DEFAULT_HEIGHT;
                }

                setSelectedButton(buttons, currentHeight);
            }, VIEW_FILE_MACRO_NAME);
            renderFileIconAndNameInPanel();
        }
    };
});
