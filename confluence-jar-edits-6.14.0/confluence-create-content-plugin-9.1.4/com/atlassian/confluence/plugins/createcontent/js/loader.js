/**
 * This file defines the Confluence.Blueprint.loadDialog() method, which loads the resources required for the create
 * dialog and then opens the dialog. This function is then attached to the relevant buttons and links.
 */
AJS.toInit(function ($) {

    Confluence.Blueprint = Confluence.Blueprint || {};

    var resourcesLoaded = false;

    var errorMessage;

    var spaceKey = AJS.Meta.get("space-key");

    Confluence.Blueprint.Dialog = Confluence.Dialogs.CreateDialogBase({
        dialogId: "create-dialog",
        webItemsPath: "/rest/create-dialog/1.0/blueprints/web-items",
        helpLinkTemplate: Confluence.Templates.Blueprints.helpLink,
        headingText: AJS.I18n.getText("create.content.plugin.create-dialog.header.create.label")
    });

    // CONFDEV-32120 Defer create content resources
    Confluence.Blueprint.loadDialog = function (options) {

        var deferred = AJS.$.Deferred();
        var createDialog;

        if (errorMessage) {
            options = AJS.$.extend(options, {
                errorMessage: errorMessage
            });
        }

        if (!resourcesLoaded) {
            // Immediately open the dialog with loading spinner
            createDialog = Confluence.Blueprint.Dialog.openDialog(options);

            var getResourcesPromise = WRM.require('wrc!create-content');

            // We need to request all spaces and pick the default, then we can request the appropriate web items
            var spacesDeferred = AJS.$.Deferred();

            Confluence.Blueprint.Dialog.requestSpaces().done(function() {
                var spaces = Confluence.Blueprint.Dialog.loadedSpaces,
                    defaultSpace = spaces.promotedSpaces.spaces[0] || spaces.otherSpaces.spaces[0];

                Confluence.Blueprint.Dialog.requestWebItems(defaultSpace.id).done(function() {
                    spacesDeferred.resolve();
                }).fail(function(error) {
                    spacesDeferred.resolve(error);
                });
            }).fail(function(error) {
                spacesDeferred.resolve(error);
            });

            // Once both sets of resources are loaded, we're ready to populate the dialog
            AJS.$.when(spacesDeferred.promise(), getResourcesPromise).done(function (spacesDeferredError) {
                // Trigger any lurking blueprints
                AJS.trigger("blueprint.wizard-register.load");

                Confluence.Dialogs.LocationPanel(Confluence.Blueprint.Dialog);

                options = AJS.$.extend(options, {
                    createDialog: createDialog,
                    dialogBase: Confluence.Blueprint.Dialog
                });

                if (spacesDeferredError) {
                    try {
                        var errorType = JSON.parse(spacesDeferredError.responseText).errorType;
                        if (errorType === "READ_ONLY") {
                            errorMessage = AJS.I18n.getText('read.only.mode.default.error.short.message')
                        }
                    } catch (e) {
                        errorMessage = AJS.I18n.getText('server.error.message');
                    } finally {
                        options = AJS.$.extend(options, {
                            errorMessage: errorMessage
                        });
                    }
                }

                resourcesLoaded = true;

                deferred.resolve(Confluence.Blueprint.Dialog.openDialog(options));

            }).fail(function () {
                AJS.log("Could not load resources for create dialog.");
            });
        } else {
            deferred.resolve(Confluence.Blueprint.Dialog.openDialog(options));
        }

        return deferred.promise();
    };

    // This is a bit hacky and should be removed when all plugins bind to AJS.toInit instead.
    // Ensures that 'blueprint.wizard-register.ready' is only called once.
    var blueprintWizardsRegistered = false;
    AJS.bind('blueprint.wizard-register.load', function() {
        if (!blueprintWizardsRegistered) {
            AJS.trigger('blueprint.wizard-register.ready');
            blueprintWizardsRegistered = true;
        }
    });

    // If there's no button, the current user can't create content so we have nothing to do.
    var createButton = $('#create-page-button:visible'),
        isClickAltered = false;
    if (!createButton.length) return;

    // Trigger the dialog from the header Create button, and the "Create child page" in the space sidebar.
    createButton.click(function (event) {
        if (shouldDisplayCreateDialog(event)) {
            AJS.trigger('analytics', {name: "confluence.quick.create.dialog.open"});
            Confluence.Blueprint.loadDialog({triggerSrc: 'create-page'});
            return false;
        }
    }).mousedown(function(event) {
            //We need to save the mouse state on mousedown, because IE8 doesn't provide the mouse state
            //in the click() handler.
            var button = event.which || event.button;
            if ($.browser.mozilla && button == 2 || button == 3) {
                // Don't remember the middle click on Firefox, and don't remember the right-click,
                // because those will not trigger a click() event.
                button = 0;
            }

            isClickAltered = button !== 0 && button !== 1 ||
                event.ctrlKey || event.altKey || event.shiftKey || event.metaKey;
        });
    setNaturalCreatePageLink(createButton);

    $(document).on('click', '.create-child-page-link', function () {
        Confluence.Blueprint.loadDialog({ location: 'child-page' });
        return false;
    });

    // Hide all add links in favour of the create button
    $("#addPageLink, #addBlogLink, .acs-pagetree-create-link").hide();

    //CONFDEV-34613
    renderQuickCreate(createButton);
    trackAnalyticEvent();

    function shouldDisplayCreateDialog(event) {
        if (!isClickAltered) {
            return true;
        }
        isClickAltered = false;

        var link = $(event.target).closest("a").attr('href');
        if (!link || link.indexOf('createpage.action') == -1) {
            return true;
        }
        return false;
    }

    function setNaturalCreatePageLink($createButton) {
        // If we are viewing content, a middle click on the create button should create a child page in a new tab
            var contentType = AJS.Meta.get("content-type"),
            contentId = AJS.Meta.get("content-id") || AJS.Meta.get("page-id"),
            base = AJS.contextPath() + "/pages/createpage.action",
            url;
        if (spaceKey) {
            if (contentType == "page") {
                url = base + "?" + $.param({
                    spaceKey: spaceKey,
                    fromPageId: contentId
                });
            } else {
                url = base + "?" + $.param({
                    spaceKey: spaceKey
                });
            }
            $createButton.attr('href', url);
        } else {
            $createButton.attr('href', '#');
        }
    }

    //CONFDEV-34613
    /**
     *
     * @param $createButton the normal Create button
     */
    function renderQuickCreate($createButton) {
        var $quickCreateButton = $("#quick-create-page-button");
        if (!$quickCreateButton.length) {
            $createButton.removeClass("clc-create-dialog-btn")
                .find("span").removeClass();
        } else if ($quickCreateButton.is(":visible")) {
            initDiscoveryTooltip($createButton);
            $quickCreateButton.on("click", quickCreateHandler);
        }
    }

    function quickCreateHandler(e) {
        AJS.trigger('analytics', {name: "confluence.quick.create.blank.click"});
    }

    function initDiscoveryTooltip($createButton) {
        var currentURL = window.location.href;

        var fromQuickCreate = currentURL.indexOf("src=quick-create") != -1;
        if (!fromQuickCreate) {
            $createButton.on("click", function () {
                addUserToStorage();
            });
            return;
        }

        $.getJSON(AJS.contextPath() + "/rest/create-dialog/1.0/storage/quick-create", function(data) {
            if (!data.isExist) {
                showDiscoveryTooltip($createButton);
            }
        });
    }

    function showDiscoveryTooltip($createButton) {
        var iDialog = new AJS.InlineDialog($("#create-page-button"), "discoveryTooltip",
            function (content, trigger, showPopup) {
                content.html(Confluence.Quick.Create.discoveryTooltip());
                showPopup();
                AJS.trigger('analytics', {name: "confluence.quick.create.discovery.open"});
            },
            {
                gravity: "s",
                width: 270,
                noBind: true,
                persistent: true
            }
        );
        iDialog.show();

        //close discoveryTooltip
        $(document).off("click", "#closeDisDialog").on("click", "#closeDisDialog", function () {
            AJS.trigger('analytics', {name: "confluence.quick.create.discovery.close"});
            iDialog.hide();
            addUserToStorage();
        });

        $createButton.on("click", function () {
            iDialog.hide();
            addUserToStorage();
        });
    }

    function addUserToStorage () {
        $.ajax({
            url: AJS.contextPath() + "/rest/create-dialog/1.0/storage/quick-create",
            type: 'PUT'
        });
    }

    /**
     * Track more analytics event for Quick create feature
     */
    function trackAnalyticEvent() {
        var pathname = window.location.pathname;
        if (pathname.indexOf("/draft-createpage.action") > -1) {
            AJS.bind("rte-ready", function(e) {
                //blue-print
                $("#rte-button-publish").click(function(){
                    AJS.trigger('analytics', {name: "confluence.quick.create.create-dialog.blue-print.save"});
                });
                $("#rte-button-cancel").click(function(){
                    AJS.trigger('analytics', {name: "confluence.quick.create.create-dialog.blue-print.close"});
                });
            });
        } else if (pathname.indexOf("/createpage.action") > -1) {
            var queryString = $("#createpageform input[name='queryString']").val();
            if (typeof queryString === "string" && queryString.indexOf("src=quick-create") > -1) {
                AJS.bind("rte-ready", function(e) {
                    //blank page from quick create
                    $("#rte-button-publish").click(function(){
                        AJS.trigger('analytics', {name: "confluence.quick.create.blank.save"});
                    });
                    $("#rte-button-cancel").click(function(){
                        AJS.trigger('analytics', {name: "confluence.quick.create.blank.close"});
                    });
                    $("#rte-button-location").click(function(){
                        AJS.trigger('analytics', {name: "confluence.quick.create.blank.change.location"});
                    });
                });
            } else {
                AJS.bind("rte-ready", function(e) {
                    //blank page from create dialog
                    $("#rte-button-publish").click(function(){
                        AJS.trigger('analytics', {name: "confluence.quick.create.create-dialog.blank.save"});
                    });
                    $("#rte-button-cancel").click(function(){
                        AJS.trigger('analytics', {name: "confluence.quick.create.create-dialog.blank.close"});
                    });
                });
            }
        }
    }

    // create keyboard shortcuts
    var $quickCreateButton = $("#quick-create-page-button");
    if ($quickCreateButton.is(":visible")) {
        AJS.whenIType('c').followLink('#quick-create-page-button')
    } else {
        AJS.whenIType('c').click('#create-page-button');
    }
});

// shortcuts-loaded.keyboardshortcuts is triggered when the AJAX request for the shortcuts returns, so it is guaranteed
// to run after this binding - and before the shortcuts are stored in the page's global JS scope.
AJS.bind("shortcuts-loaded.keyboardshortcuts", function (e, data) {
    // Suck out the Create Page keyboard shortcut

    AJS.$.each(data.shortcuts, function (index, shortcut) {
        if (shortcut.param == '#createPageLink') {
            // Remove this shortcut from the array and stop iterating.
            data.shortcuts.splice(index, 1);
            return false;
        }
    });
});
