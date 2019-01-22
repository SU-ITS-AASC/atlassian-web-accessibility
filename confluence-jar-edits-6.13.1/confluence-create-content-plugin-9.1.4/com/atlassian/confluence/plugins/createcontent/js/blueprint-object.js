(function($, require) {
    var registeredItems = {};

    // Set when the Wizard is triggered
    var selectedWebItemData;
    var selectedSpaceKey;

    var directCallbacks = {};
    var wizards = {};

    function getRestTail(createResult) {
        switch (createResult) {
            case 'view':
                return 'content-blueprint/create-content';
            case 'space':
                return 'space-blueprint/create-space';
            default:
                return 'content-blueprint/create-draft';
        }
    }

    /**
     * Go to the create action. Where the user is taken afterwards depends on the create-result value of the
     * supplied blueprint module.
     *
     * @param title (optional) the title of the page to create. If blank, a default title will be used.
     * @param context (optional) a map of String-primitive pairs to pass to the page creation logic
     * @param dialog (required) the create dialog
     * @param wizard (optional) if this Blueprint has a registered wizard, then that
     */
    function create(ev, wizardData, dialog, wizard) {
        AJS.trigger("blueprint.before-create");

        // Getting all items that have been already used
        var confluenceLocalStorage = Confluence.storageManager("confluence-create-content-plugin");
        var usedItems = $.parseJSON(confluenceLocalStorage.getItem("used"));

        if (usedItems == null) {
            usedItems = [];
        }

        usedItems.push(selectedWebItemData.itemModuleCompleteKey);
        confluenceLocalStorage.setItemQuietly("used", JSON.stringify(usedItems));

        var title = '';
        if (_.isString(ev)) {
            title = ev;
        }
        var createResult = selectedWebItemData.createResult;

        // Allow plugin wizards to override the REST call that is made to create the Page or Space.
        var path;
        if (wizard && wizard.getSubmissionRestPath) {
            path = wizard.getSubmissionRestPath();
        } else {
            path = "/rest/create-dialog/1.0/" + getRestTail(createResult);
        }
        var url = Confluence.getContextPath() + path;

        var parentPageId = dialog ? dialog.getParentPageId() : '';

        // Not included in the submission, goToIndexPage determines which page the user is taken to after the
        // AJAX request completes.
        var goToIndexPage = !!wizardData.goToIndexPage;
        delete wizardData.goToIndexPage;

        var submissionObject;
        if (wizard && wizard.assembleSubmissionObject) {
            submissionObject = wizard.assembleSubmissionObject(wizardData);
        } else {
            if (createResult == 'space') {
                submissionObject = assembleSpaceSubmissionObject(wizardData);
            } else {
                submissionObject = assemblePageSubmissionObject(title, wizardData, parentPageId);
            }
        }

        var data = JSON.stringify(submissionObject);
        var spinner = AJS.$('.create-dialog-button-spinner');
        var buttonPanel = AJS.$("#create-dialog .dialog-button-panel");
        var createButton = buttonPanel.find(".create-dialog-create-button");

        if (spinner.length === 0) {
            buttonPanel.prepend('<div class="create-dialog-button-spinner"></div>');
            spinner = AJS.$(".create-dialog-button-spinner").spin("small");
        }

        $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: data
        }).done(function (data) {
            // The returned Page/Draft/Space object will specify a URL.
            // successUrl is a mediate url that directs to the target page with index popup flash var
            var location = goToIndexPage
                ? (data.indexPage.createSuccessRedirectUrl || data.indexPage.url)
                : (data.createSuccessRedirectUrl || data.url);
            window.location = location;
        }).fail(function (xhr, textStatus, err) {
            var errorMessage = JSON.parse(xhr.responseText).errorMessage || "";
            var title = AJS.I18n.getText("create.content.plugin.plugin.templates.error-message.title");
            var flag = require('aui/flag');

            flag({type: "error", title: title, body: errorMessage});

            if (createButton.length && createButton.prop("disabled")) {
                createButton.prop("disabled", false);
            }
        }).always(function () {
            spinner.spinStop();
            spinner.remove();
        });
        AJS.trigger("blueprint.after-create");
    }

    // Matches the CreateBlueprintSpaceRestEntity at the back-end
    function assembleSpaceSubmissionObject(context) {
        var obj = {
            spaceKey: context['spaceKey'],
            name: context['name'],
            description: context['description'],
            permissions: context['spacePermission'],
            spaceBlueprintId: selectedWebItemData.contentBlueprintId
        };
        obj.context = context;
        return obj;
    }

    // Matches the CreateBlueprintPageRestEntity at the back-end
    function assemblePageSubmissionObject(title, wizardData, parentPageId) {
        wizardData = wizardData || {};

        title = wizardData.title || title || '';

        var viewPermissionsUsers = wizardData.viewPermissionsUsers || '';
        var contentTemplateId = wizardData.contentTemplateId || '';

        // DEPRECATED
        var contentTemplateKey = wizardData.contentTemplateKey || '';   // for backwards-compatibility only

        parentPageId = wizardData['parentPageId'] || parentPageId;

        var object = {};
        object.spaceKey = selectedSpaceKey;
        object.contentBlueprintId = selectedWebItemData.contentBlueprintId;
        object.contentTemplateId = contentTemplateId;
        object.contentTemplateKey = contentTemplateKey;
        object.title = title;
        object.viewPermissionsUsers = viewPermissionsUsers;
        object.context = wizardData;
        object.parentPageId = parentPageId;

        return object;
    }

    function storeItemAsUsed(itemKey) {
        // Getting all items that have been already used
        var confluenceLocalStorage = Confluence.storageManager("confluence-create-content-plugin");
        var usedItems = $.parseJSON(confluenceLocalStorage.getItem("used"));

        if (usedItems == null)
            usedItems = [];

        if ($.inArray(itemKey, usedItems) == -1)
            usedItems.push(itemKey);

        confluenceLocalStorage.setItemQuietly("used", JSON.stringify(usedItems));
    }

    /**
     * Blueprint defines methods for plugins to register with and call.
     */
    Confluence.Blueprint = AJS.$.extend(Confluence.Blueprint, {

        /**
         * Register this callback for handling selection of the specified web-item.
         *
         * @param itemModuleCompleteKey the complete plugin-module key for the WebItem being registered
         * @param callback a function accepting arguments createDialog, selectedSpaceKey
         */
        register: function (itemModuleCompleteKey, callback) {
            // callback will be passed the arguments createDialog, selectedSpaceKey.
            registeredItems[itemModuleCompleteKey] = callback;
        },

        /**
         * Validates the title field and returns true if valid, false otherwise.
         *
         * It displays an error message in an error div which is expected to be a sibling of the title field.
         *
         * @param $titleField jquery object for the title field to validate
         * @param spaceKey the spaceKey the page is going to be created in
         * @returns {boolean} true if page title in titleField is valid
         */
        validateTitle: function ($titleField, spaceKey, emptyMesage, conflictMessage) {
            var pageTitle = $.trim($titleField.val()),
                error;

            if (!emptyMesage)
                emptyMesage = AJS.I18n.getText("create.content.plugin.create-dialog.page.title.emtpy");
            if (!conflictMessage)
                conflictMessage = AJS.I18n.getText("create.content.plugin.create-dialog.page.title.conflict");

            if (!pageTitle) {
                error = emptyMesage;
            }
            else if (!Confluence.Blueprint.canCreatePage(spaceKey, pageTitle)) {
                error = conflictMessage;
            }
            if (error) {
                $titleField.focus().siblings(".error").html(error);
                return false;
            }

            return true;
        },

        /**
         * A synchronous validation function to check if the logged-in User can create a page with the given space and
         * title. Will return false if the user does not have permission, or if the page already exists.
         * @param spaceKey the space the page will be created in
         * @param pageTitle the title of the page to be created
         */
        canCreatePage: function (spaceKey, pageTitle) {
            var result = false;
            $.ajax({
                url: Confluence.getContextPath() + "/rest/create-dialog/1.0/blueprints/can-create-page",
                dataType: "json",
                data: {
                    spaceKey: spaceKey,
                    pageTitle: pageTitle
                },
                async: false
            }).done(function (data) {
                result = data;
            }).fail(function (data) {
                AJS.log("Failed to call 'can-create-page' - " + data);
            });
            return result;
        },

        hasWizard: function hasWizard(itemKey, config) {
            return (wizards[itemKey] || (config && config.wizard)) && !directCallbacks[itemKey];
        },

        /**
         * Called by plugins to register their <dialog-wizard> JavaScript callbacks (if any)
         * @param itemKey   web-item module complete key
         * @param callback used to make calls on the wizard object this method creates
         */
        setWizard: function setWizard(itemKey, callback) {
            var wizard = $({});
            callback(wizard);
            wizards[itemKey] = wizard;
        },

        getWizard: function (itemKey) {
            return wizards[itemKey] || $({});
        },

        setDirectCallback: function (itemKey, callback) {
            directCallbacks[itemKey] = callback;
        },

        getDirectCallback: function (itemKey) {
            return directCallbacks[itemKey];
        },

        // Called when the user clicks the "Next/Submit" button of the create dialog.
        // data is the .data() object returned from the selected WebItem element.
        fireWizard: function (ev, config, createDialog) {
            var context = createDialog.initContext || {};
            selectedSpaceKey = config.spaceKey;
            selectedWebItemData = config;

            /*
             Clicks on create dialog items can go four ways:
             1. It has an associated blueprint module - just call that via the CreateAction
             2. It has a registered Wizard - call that
             3. It's actually a PageTemplate - go to the action for that
             4. It, uh, something we don't know about? ABORT! ABORT!!
             */

            var itemKey = config.itemModuleCompleteKey;
            var parentPageId = createDialog.getParentPageId();

            // We store it as used - so if it has been recently installed the new lozenge does not appear any longer
            storeItemAsUsed(itemKey);

            if (itemKey) {
                // ANALYTICS
                // Graphite needs A_B_C_D, not A.B.C:D
                var friendlyKey = itemKey.replace(/\.|:/g, '_');
                AJS.trigger('analytics', {
                    name: createDialog.id + '.submit.' + friendlyKey,
                    data: {spaceKey: selectedSpaceKey}
                });

                // Redirect to given URL if a directLink parameter is defined.
                // The context keys will be replaced by the actual value.
                // For example: If the given URL is "/display/{spaceKey}/someaction.acton?fromPageId={fromPageId}"
                // Then user will be redirected to "/display/ds/someaction.acton?fromPageId=123"
                if (config.directLink) {
                    var parameterContext = {
                        templateId: config.templateId,
                        spaceKey: selectedSpaceKey,
                        title: config.title || '',
                        newSpaceKey: selectedSpaceKey,
                        fromPageId: (parentPageId && selectedSpaceKey === AJS.Meta.get('space-key')) ? parentPageId : ''
                    };
                    $.extend(parameterContext, context);

                    // Replace context in direct link
                    var redirectUrl = config.directLink;
                    for (var parameterContextKey in parameterContext) {
                        redirectUrl = redirectUrl.replace(
                            new RegExp('\{' + escapeRegExp(parameterContextKey) + '\}', 'g'),
                            parameterContext[parameterContextKey]);
                    }

                    // Remove the empty parameters.
                    // For example: param1 and param2 will be removed in "/display/ds/someaction.acton?param1=&param2=&param3=123"
                    window.location = Confluence.getContextPath() + removeEmptyParamsAndEncode(redirectUrl);

                    // Terminate early as window.location will not be come effective until function block have finished executing.
                    return;
                }

                // Blueprint Plugins may choose to use a less-flexible but easier API by using the default create action.
                // This action provides default behaviour for page titles, index pages, and page pins in the sidebar.
                // If the blueprint *does* register a callback for the 'Next' button click, it must either call
                // the passed create() function itself, or create the new content with custom code.
                var callback;
                var directCallback = this.getDirectCallback(itemKey);
                if (directCallback) {
                    callback = function newDirectlySubmitCallback() {
                        var state = {
                            spaceKey: selectedSpaceKey,
                            pageData: {},
                            initContext: context
                        };
                        directCallback(ev, state);
                        var wizardData = $.extend(context, {
                            pageData: state.pageData
                        });
                        new Confluence.DialogWizard(createDialog, create).doFinalAction(ev, state, wizardData, create);
                    }
                }
                else if (config.wizard) {
                    var firstId = config.wizard.pages[0].id;

                    callback = function newWizardCallback() {
                        var wizard = Confluence.Blueprint.getWizard(itemKey);
                        Confluence.DialogWizard(createDialog, create).newPage(config, firstId, {}, $.extend(context, {
                            spaceKey: selectedSpaceKey,
                            pages: {
                                // object keyed by pageId's
                            },
                            parentPageId: createDialog.getParentPageId(),
                            title: config.title
                        }), wizard);
                    }
                }
                else if (registeredItems[itemKey]) {
                    callback = function handrolledWizardCallback() {
                        registeredItems[itemKey](createDialog, selectedSpaceKey, create);
                    };
                }
                else if (config.contentBlueprintId) {
                    // A default blueprint with no wizard.
                    callback = function noWizardCallback() {
                        create(null, $.extend(context, config), createDialog);
                    };
                }
                else {
                    throw Error('No way to process item: ' + itemKey);
                }

                if (config.howToUseTemplate) {
                    Confluence.Blueprint.HowToUse.check(createDialog, config, callback);
                }
                else {
                    callback();
                }
            }
            else if (config.templateId) {
                AJS.trigger('analytics', {
                    name: createDialog.id + '.submit.template',
                    data: {spaceKey: selectedSpaceKey, templateId: config.templateId}
                });
                var createFromTemplateUrl = Confluence.getContextPath() + "/pages/createpage-entervariables.action"
                    + "?templateId=" + encodeURIComponent(config.templateId)
                    + "&spaceKey=" + encodeURIComponent(selectedSpaceKey)
                    + "&title=" + encodeURIComponent(config.title || "")
                    + "&newSpaceKey=" + encodeURIComponent(selectedSpaceKey);

                for (var key in context) {
                    createFromTemplateUrl += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(context[key]);
                }
                if (parentPageId && selectedSpaceKey == AJS.Meta.get("space-key")) {
                    createFromTemplateUrl += "&fromPageId=" + encodeURIComponent(parentPageId);
                }

                window.location = createFromTemplateUrl;
            } else {
                throw new Error('Unknown item: ' + config);
            }
        }
    });

    /**
     * Handle both in page display or content-editor
     * @returns {parentPageId: string, parentPageTitle: string}
     */
    function getParentPageLocation() {
        var location = {};
        if (AJS.Meta.get("page-title")) {
            location.parentPageId = AJS.Meta.get("page-id");
            location.parentPageTitle = AJS.Meta.get("page-title");
        } else { // in editor
            location.parentPageId = AJS.Meta.get("parent-page-id");
            location.parentPageTitle = AJS.Meta.get("from-page-title");
        }
        //TODO: when in Editor, user changes location, respect the new location?
        return location;
    }

    /**
     * Remove all empty url parameters and encode all the valid ones.
     *
     * @param url
     * @returns {string} Url
     */
    function removeEmptyParamsAndEncode(url) {
        // Wrapping the whole file into require causes timing problem on other files
        // So we just inline it here.
        var parseUrl = require('confluence/api/url');
        var urlComponents = parseUrl.parse(url);
        var params = urlComponents.queryParams;

        // Remove empty params
        // params is an object with following structure {'key1': ['value1', 'value2'], 'key2': ['']}
        urlComponents.queryParams = Object.keys(params).reduce(function(prev, key) {
            var values = params[key].filter(function(value) {
                return !!value;
            });

            if (values.length) {
                prev[key] = values;
            }

            return prev;
        }, {});

        return parseUrl.format(urlComponents);
    }

    function escapeRegExp(str) {
        return str.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
    }

    Confluence.Blueprint.Util = {};
    Confluence.Blueprint.Util.getParentPageLocation = getParentPageLocation;
})(AJS.$, require);
