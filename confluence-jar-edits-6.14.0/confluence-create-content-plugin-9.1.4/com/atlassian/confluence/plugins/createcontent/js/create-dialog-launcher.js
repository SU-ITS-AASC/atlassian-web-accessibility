(function() {

/**
 * @param {String} spaceKey
 * @param {function(!Object, !Object)} callback
 */
function getWebItems(spaceKey, async, callback) {
    Confluence.Blueprint.Dialog.requestWebItems(spaceKey, async).done(function (ev) {
        var configs = Confluence.Blueprint.Dialog.loadedWebitems[spaceKey];
        if (_.isEmpty(configs)) {
            AJS.log('create-from-template-macro: No Create dialog web items found for spaceKey >' + spaceKey + '<');
            return;
        }

        callback(ev, configs);

    }).fail(function () {
        AJS.log('create-from-template-macro: requestWebItems call for spaceKey >' + spaceKey + '< failed');
    });
}

/**
 * Returns an initial context for the create dialog with the parameters from InitCreateDialogAction
 */
function getInitContext() {
    var context = {};
    AJS.$('#create-dialog-init-params div').each(function() {
        context[$(this).data('key')] = $(this).data('value');
    });
    return context;
}

AJS.toInit(function () {
/**
 * Opens the Create dialog to a given Space and Blueprint/Template, as if the user had opened it manually.
 *
 * If the following options are specified, this will also advance the dialog to a How-to-Use page or JS Wizard
 * if necessary, or redirect to the Editor:
 * - spaceKey: indicates the space to create the page in
 * - contentBlueprintId or templateId: indicates the type of page to create
 *
 * Used by the Create-from-template macro and URLs.
 */
Confluence.Blueprint = $.extend(Confluence.Blueprint, {
    loadDialogAndOpenTemplate: function (options) {
        if (!_.isObject(options)) {
            throw new Error("Confluence.Blueprint.loadDialogAndOpenTemplate called with no options")
        }

        var spaceKey = options.spaceKey,
            contentBlueprintId = options.contentBlueprintId,
            templateId = options.templateId,
            title = options.title,
            initContext = options.initContext ? options.initContext : getInitContext();

        if (spaceKey) {
            Confluence.Blueprint.loadDialog({
                showDialog: true,
                updateHeight: false,
                showStepOne: true,
                initContext: initContext
            }).done(function(createDialog) {
                // The spaceKey will probably be the same as the current space (i.e. creates content in same space as button)
                // so this async call will return immediately.
                getWebItems(spaceKey, true, function(ev, configs) {
                    var config = _.find(configs, function(element) {
                        if (contentBlueprintId)
                            return element.contentBlueprintId == contentBlueprintId;

                        return element.templateId == templateId;
                    });
                    if (!config) {
                        // Show error, contentBlueprintId or templateId could be wrong
                        AJS.log('create-from-template-macro: No Create dialog web item found for contentBlueprintId >' +
                        contentBlueprintId + '< and templateId >' + templateId + '<');
                        return;
                    }

                    var itemModuleCompleteKey = config.itemModuleCompleteKey;
                    config = $.extend({}, config);
                    config.title = title;
                    config.spaceKey = "" + spaceKey; // make sure we pass around a string

                    // Needed to ensure that the location is updated.
                    AJS.trigger(Confluence.Dialogs.Events.ITEM_SELECTED, {config: config});

                    Confluence.Blueprint.fireWizard(ev, config, createDialog);

                    // CONFDEV-17165 hide back button on the page as the user shouldn't be able to select a different template
                    createDialog.removeBackButton();

                    var showHowToUse = config.howToUseTemplate && !config.skipHowToUse;
                    if (showHowToUse || Confluence.Blueprint.hasWizard(itemModuleCompleteKey, config)) {
                        createDialog.show();
                    }
                });
            });
        } else {
            Confluence.Blueprint.loadDialog({
                initContext: initContext
            });
        }
    }
});

});

// TOOD - needs adding as useful global method in another JS file, or replacing with some 3rd-party-library function. dT
AJS.getWindowQueryParams = function() {
    var params = {};
    // window.location.search will be something like "?foo=bar&baz=other", if not blank
    if (window.location.search.length > 1) {
        var queryPairs = window.location.search.substr(1).split("&");
        for (var i = 0; i < queryPairs.length; i++) {
            var pair = queryPairs[i].split("=");
            var key = unescape(pair[0]);
            var value = pair.length > 1 ? unescape(pair[1]) : "";
            params[key] = value;
        }
    }
    return params;
};

/**
 * Allow direct links to the Create dialog - picks up the following URL query params:
 * - createDialogSpaceKey
 * - createDialogBlueprintId
 * - createDialogTemplateId
 * - createDialog: opens the dialog without making any default selections
 */
AJS.toInit(function () {
    var initContext = getInitContext();
    if (initContext.createSpaceDialog) {
        Confluence.SpaceBlueprint.loaded.then(function() {
            Confluence.SpaceBlueprint.Dialog.launch();
        });
        return;
    }
    var params = AJS.getWindowQueryParams();
    var spaceKey = params.createDialogSpaceKey;

    if (!params.createDialog && !spaceKey) {
        return; // nothing to do. Just a normal page.
    }

    var moduleCompleteKey = params.createDialogBlueprintKey;
    if (spaceKey && moduleCompleteKey) {
        getWebItems(spaceKey, false, function(ev, configs) {
            var config = _.find(configs, function(element) {
                return element.blueprintModuleCompleteKey == moduleCompleteKey;
            });
            if (config) {
                params.createDialogBlueprintId = config.contentBlueprintId;
            } else {
                AJS.log("No blueprint found with key: " + moduleCompleteKey);
            }
        });
        delete params.createDialogBlueprintKey;
    }

    // Looks like someone wants to trigger the Create dialog. Is the call correct?
    if (spaceKey && !params.createDialogBlueprintId && !params.createDialogTemplateId) {
        // For now, we don't handle this, and the implication is that the person creating the link has done
        // something bad. Show an alert informing them of their badness.
        AJS.log("Confluence.Blueprint.launchDialog triggered with incorrect options - please check the URL query: " + window.location.search);
        return;
    }

    Confluence.Blueprint.loadDialogAndOpenTemplate({
        spaceKey: spaceKey,
        contentBlueprintId: params.createDialogBlueprintId,
        templateId: params.createDialogTemplateId,
        initContext: initContext
    });
});

})();