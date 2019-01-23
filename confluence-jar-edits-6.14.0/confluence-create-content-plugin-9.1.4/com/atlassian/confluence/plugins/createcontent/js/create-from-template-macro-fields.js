AJS.toInit(function ($) {

    /**
     * @param {String} spaceKey
     * @param {function(!Object, !Object)} callback
     */
    function getWebItemsSync(spaceKey, callback) {
        spaceKey = spaceKey || AJS.Meta.get("space-key");

        Confluence.Blueprint.Dialog.requestWebItems(spaceKey, false).done(function (ev) {
            var configs = Confluence.Blueprint.Dialog.loadedWebitems[spaceKey];
            if (_.isEmpty(configs)) {
                AJS.log('create-from-template-macro-fields: No Create dialog web items found for spaceKey >' + spaceKey + '<');
                return;
            }

            callback(ev, configs);

        }).fail(function () {
            AJS.log('create-from-template-macro-fields: requestWebItems call for spaceKey >' + spaceKey + '< failed');
        });
    }

    function fillField(input, spaceKey) {
        getWebItemsSync(spaceKey, function(ev, configs) {
            var selected = input.val();
            input.empty();
            _.each(configs, function(config) {
                var itemModuleCompleteKey = config.itemModuleCompleteKey;
                // Blank pages and blog posts have now a contentBlueprintId - so we need to skip them somehow
                // As the macro does not support creating content from them
                if ((itemModuleCompleteKey == "com.atlassian.confluence.plugins.confluence-create-content-plugin:create-blank-page"
                        || itemModuleCompleteKey == "com.atlassian.confluence.plugins.confluence-create-content-plugin:create-blog-post"))
                    return;
                if (!(config.templateId || config.contentBlueprintId))
                    return;
                var option = $('<option></option>').text(config.name);
                option.attr("data-template-id", config.templateId);
                option.attr("data-blueprint-module-complete-key", config.blueprintModuleCompleteKey);
                option.attr("data-content-blueprint-id", config.contentBlueprintId);
                option.attr("data-create-result", config.createResult);
                option.val(config.templateId || config.contentBlueprintId);
                input.append(option);
            });
            //select the original template, if present, otherwise .val() will default to the first option.
            input.val(selected);
        });
    }

    var overrides = {
        fields: {
            "spacekey" : {
                "spaceKey" : function spaceKeyField(param) {
                    var field = AJS.MacroBrowser.ParameterFields["spacekey"](param),
                        currentSpace = field.input.val();

                    var refreshTemplateList = function() {
                        var newSpace = field.input.val();
                        if (newSpace != currentSpace) {
                            fillField(AJS.MacroBrowser.fields['templateName'].input, newSpace);
                        }
                        currentSpace = newSpace;
                    };

                    //change events are swallowed by the macro browser space key autocomplete so we need to
                    //use blur and check if the value changed.
                    field.input.bind("selected.autocomplete-content", refreshTemplateList);
                    field.input.blur(refreshTemplateList);

                    return field;
                }
            }
        },

        beforeParamsSet: function beforeParamSetOverride(selectedParams, selectedMacro) {
            //Set button label to current buttonLabel OR createButtonLabel (old style) or Default text.
            selectedParams.buttonLabel = selectedParams.buttonLabel || selectedParams.createButtonLabel || AJS.I18n.getText("com.atlassian.confluence.plugins.confluence-create-content-plugin.create-from-template.param.buttonLabel.default-value");

            fillField($("#macro-param-templateName"), selectedParams.spaceKey);

            return selectedParams;
        },

        beforeParamsRetrieved: function beforeParamsRetrievedOverride(paramMap, macro, sharedParamMap) {
            var option = AJS.MacroBrowser.fields['templateName'].input.find("option:selected");
            paramMap["blueprintModuleCompleteKey"] = option.data("blueprint-module-complete-key");
            paramMap["contentBlueprintId"] = option.data("content-blueprint-id");
            paramMap["templateId"] = option.data("template-id");
            paramMap["createResult"] = option.data("create-result");
            return paramMap;
        }
    };

    AJS.MacroBrowser.setMacroJsOverride("create-from-template", overrides);
});
