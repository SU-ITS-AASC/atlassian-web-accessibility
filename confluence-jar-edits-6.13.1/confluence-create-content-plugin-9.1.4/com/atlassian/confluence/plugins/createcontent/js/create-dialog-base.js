/**
 * This file defines the main behaviour for the Create Dialog.
 */

Confluence.Dialogs = Confluence.Dialogs || {};

(function($) {
/**
 *
 * @param createOptions object which supports:
 * dialogId - element id for the dialog
 * webItemsPath - url of ajax call for web items
 * headingText - literal text for the dialog heading
 * helpLinkTemplate - function to render a help link
 * @returns {{dialogId: string, openDialog: Function, requestWebItems: Function, fillWebItemsInDialog: Function}}
 * @constructor
 */
Confluence.Dialogs.CreateDialogBase = function CreateDialogBase(createOptions) {
    /**
     * @type {AJS.Dialog} createDialog
     */
    var createDialog,
        $dialog,
        dialogId = createOptions.dialogId,
        webItemsPath = createOptions.webItemsPath,
        newWebItems = [],
        hasPromotedItems = false,
        confluenceLocalStorage = Confluence.storageManager("confluence-create-content-plugin"),
        triggerSrc;

    function closeDialog() {
        // Ignore Cancels triggered by click or Escape key if the link is disabled.
        if ($dialog.find('.button-panel-cancel-link:visible').is('.disabled'))
            return;

        if (Confluence.Blueprint.HowToUse) {
            Confluence.Blueprint.HowToUse.notifyCancel(createDialog);
        }

        AJS.trigger('analytics', {name: dialogId + '.cancel' + triggerSrc});
        createDialog.remove();
        $('.tipsy').remove();   // just in case the 'Too many' tooltip was showing and the user pressed Escape.
        createDialog = null;
        $dialog = null;
        return false;
    }

    function getSubmitButton() {
        return $(".create-dialog-create-button:visible");
    }

    function hasVisibleTemplates() {
        return $('.create-dialog-body .template:visible').length;
    }

    /**
     * @param {jQuery} $el
     * @returns {string}
     */
    function getItemUuid($el) {
        return $el.data('content-blueprint-id');
    }

    /**
     * @param {jQuery} $el
     * @returns {*}
     */
    function findWebItemData($el) {
        var contentBlueprintId = getItemUuid($el),
            templateId = $el.data('template-id'),
            value = contentBlueprintId || templateId,
            key = contentBlueprintId ? "contentBlueprintId" : "templateId";

        if (!value) {
            return findWebItemDataWithKeyValue("itemModuleCompleteKey", $el.data("item-module-complete-key"));
        }

        return findWebItemDataWithKeyValue(key, value);
    }

    /**
     * Just sucks state out of the View and passes it to the Controller
     */
    function dialogSubmitted(ev) {
        // Don't do anything if no templates are visible
        if (!hasVisibleTemplates())
            return false;

        // Ignore multiple triggers
        if ($(this).attr('disabled') === 'disabled')
            return false;

        $(this).attr("disabled", "disabled")
            .before('<div class="create-dialog-button-spinner"></div>');

        $('.create-dialog-button-spinner').spin('small');

        var selectedSpaceKey = myObj.getSpaceKey();
        var selectedItem = $(".template.selected");

        var data = findWebItemData(selectedItem);

        if (!data) {
            // Null data? How did you get here? It should be impossible to have no selected item.
            throw new Error("Expected at least one template to be selected");
        }
        data.spaceKey = selectedSpaceKey;

        Confluence.Blueprint.fireWizard(ev, data, createDialog);
    }


    function refreshSubmitButton() {
        if (!hasVisibleTemplates()) {
            getSubmitButton().attr("disabled", "disabled");
        }else{
            getSubmitButton().removeAttr("disabled");
        }
    }

    function findWebItemDataWithKeyValue(key, value) {
        return _.find(myObj.loadedWebitems[myObj.getSpaceKey()], function(item) {
            return item[key] == value;
        });
    }

    /**
     *
     * @param {string} uuid
     * @returns {*}
     */
    function findWebItemDataWithUuid(uuid) {
        return findWebItemDataWithKeyValue('contentBlueprintId', uuid);
    }

    /**
     * Change the submit button text to "Next" or "Create" based on whether the web-item Blueprint defines a
     * dialogWizard or not.
     * @param {string} uuid
     */
    function refreshSubmitButtonInPicker(uuid) {
        var webItem = findWebItemDataWithUuid(uuid);
        var hasWizard = webItem && webItem.wizard;
        var text = getSubmitButtonText(!hasWizard);
        getSubmitButton().text(text);
    }

    /**
     * @param {jQuery} $item
     */
    function selectWebItem($item) {
        $item.addClass("selected").siblings().removeClass("selected");
        refreshSubmitButtonInPicker(getItemUuid($item));
        AJS.trigger(Confluence.Dialogs.Events.ITEM_SELECTED, {item: $item});
    }

    /**
     * Move the selection in the template container forward or backward by a specified number of templates
     * @param container the template container jQuery object
     * @param {int} delta - positive to move forward, negative to move backward
     */
    function moveSelection(container, delta) {
        var results = container.find('.template');
        var selected = results.filter('.selected');
        var index = results.index(selected) + delta;
        index = index % results.length;  // loop to start or end

        var next = results.eq(index);
        selectWebItem(next);
        next.focus();
        container.simpleScrollTo(next);
    }

    /**
     * Converts arrow directions into sibling movement amounts in a grid.
     * @param {int} which - the code of the key pressed
     * @return {Number} the amount to move, or 0 if no move should occur for this key code
     */
    function getMoveDeltaForKey(which) {
        var rowLength = 2;
        switch (which) {
            case 37: return -1; // left
            case 39: return +1; // right
            case 38: return -rowLength; // up
            case 40: return +rowLength; // down
        }
        return 0;
    }

    /**
     * Key-bindings on arrow-keys to change the selected template in the template container.
     */
    function bindTemplateContainer(container) {
        container.bind("keydown", function (e) {
            var delta = getMoveDeltaForKey(e.which);
            if (delta) {
                moveSelection(container, delta);
                return AJS.stopEvent(e);
            }
        });
    }

    function fillWebItemsInDialog(showJustNew, fadeOut) {
        var spaceKey = myObj.getSpaceKey();
        var webItems = myObj.loadedWebitems[spaceKey];

        webItems = myObj.filterWebItems(webItems);

        // promoted bp are always located at the start of the list if present
        hasPromotedItems = webItems && webItems.length > 0 && webItems[0].isPromoted;

        // Gets new items: recently installed and NOT used by the user already
        newWebItems = getNewItems(webItems);
        if (!hasPromotedItems && showJustNew) {
            webItems = newWebItems;
        }

        // Fill in create dialog with items
        var templatesHtml = Confluence.Templates.Blueprints.templates({
            webItems: webItems,
            spaceKey: spaceKey
        });


        var $newTemplateContainer = $(templatesHtml);

        var $defaultItem = getDefaultBlueprint($newTemplateContainer);

        // Hide non promoted ones, if there isn't a default option to show.
        if (hasPromotedItems && $defaultItem === undefined) {
            var spaceKey = myObj.getSpaceKey();
            var showMoreUsage = $.parseJSON(confluenceLocalStorage.getItem("showMore")) || {};
            var spaceShowMoreUsage = showMoreUsage[spaceKey];

            // Only hide non-promoted items for this space if the user doesn't select 'Show More' often
            if (!spaceShowMoreUsage || spaceShowMoreUsage < 3) {
                var results = $newTemplateContainer.find('.template');
                _.each(results, function(webItem) {
                    var $webItem = $(webItem);
                    var data = findWebItemData($webItem);
                    if (!data.isPromoted) {
                        $webItem.hide();
                    }
                });

                var templatesParent = $newTemplateContainer.append(Confluence.Templates.Blueprints.Promoted.showMore())[0];
                $('#promoted-link', templatesParent).click(function() {
                    showMoreUsage[spaceKey] = (spaceShowMoreUsage || 0) + 1;
                    confluenceLocalStorage.setItemQuietly("showMore", JSON.stringify(showMoreUsage));

                    $(this).closest('.templates').find('.template').css('display', '');
                    $(this).closest('li').remove();
                    refreshSubmitButton();
                });
            }
        }

        var $oldTemplateContainer = $dialog.find(".templates");
        if ($oldTemplateContainer.length) {
            if (fadeOut) {
                $oldTemplateContainer.fadeOut(150, function(){
                    $oldTemplateContainer.replaceWith($newTemplateContainer.fadeIn(150));
                    resizeTemplatesContainerWhenDiscoverNewBannerIsPresent();
                    bindTemplateEvents();
                    bindTemplateContainer($newTemplateContainer);
                });
            } else {
                $oldTemplateContainer.replaceWith($newTemplateContainer);
            }
        } else {
            $(".template-select-container-body").append($newTemplateContainer);
        }

        if (shouldShowDiscoverNewBanner()) {
            // if show just new we show a link to view all
            var showLinkToNew = !showJustNew;
            appendRecentlyInstalledBanner(newWebItems.length, showLinkToNew);
        } else{
            hideRecentlyInstalledBanner();
        }


        // Have the searcher pick up the new DOM elements, and rerun the current filter (if any)
        if ($dialog.searcher) {
            $dialog.searcher.refreshItems();
            $dialog.searcher.filter();
        }

        $dialog.find(".loading").removeClass("loading");
        $dialog.trigger("create-content.loaded");

        bindTemplateEvents();
        bindTemplateContainer($newTemplateContainer);

        if (shouldShowDiscoverNewBanner()) {
            // Resizing needs to be called when all elements are loaded properly
            // otherwise outerHeight returns funny stuff
            resizeTemplatesContainerWhenDiscoverNewBannerIsPresent();
        }

        if($defaultItem !== undefined) {
            $dialog.find('.templates').simpleScrollTo($defaultItem.first().click());
        }
        refreshSubmitButton();
    }

    function getDefaultBlueprint($templateContainer) {
        if (!createDialog.initContext)
            return;

        var blueprintToSelect;
        var $match;

        var selectors = Confluence.Blueprint.Selector.getSelectors();
        for(var i = 0, len = selectors.length; i < len; i++) {
            blueprintToSelect = selectors[i](createDialog.initContext);
            if (blueprintToSelect && blueprintToSelect.length) {
                $match = $templateContainer.find('.template[data-item-module-complete-key="' + blueprintToSelect + '"]');
                if ($match.length) {
                    return $match;
                } else {
                    AJS.log("Attempted to select a blueprint that could not be found in the create dialog: " + blueprintToSelect);
                }
            }
        }
    }

    // Resizing Create Dialog when discover-new is present so it does not get longer when included
    function resizeTemplatesContainerWhenDiscoverNewBannerIsPresent() {
        var templates = $(".templates");
        templates.css("height", templates.outerHeight(false) - $("#discover-new-banner").outerHeight());
    }

    function bindTemplateEvents() {
        $(".template")
            .click(function() {
                selectWebItem($(this));
            })
            .dblclick(function() {
                getSubmitButton().click();
            })
            .focus(function () {
                $(this).click();
            });
        // First template appears selected by default
        $(".template:visible:first").click();
    }

    function getNewItems(webItems) {
        var hasBeenUsed = "",
            newWebItems = [],
            usedItems = [];

        for (var i = 0, max = webItems.length; i < max; i++) {
            if (webItems[i].isNew) {    // the item has been recently installed
                // We save which items were new so this banner is not shown again just for these ones
                usedItems = getUsedItems();
                hasBeenUsed = ($.inArray(webItems[i].itemModuleCompleteKey, usedItems) != -1);

                if (hasBeenUsed)        // an already used item is not new anymore
                    webItems[i].isNew = false;
                else
                    newWebItems.push(webItems[i]);
            }
        }

        return newWebItems;
    }

    function getDismissedItems() {
        // We save which items were new so this banner is not shown again just for these ones
        var dismissedItems = $.parseJSON(confluenceLocalStorage.getItem('dismissed'));
        return dismissedItems || [];
    }

    function getUsedItems() {
        // We save which items were new so this banner is not shown again just for these ones
        var usedItems = $.parseJSON(confluenceLocalStorage.getItem('used'));
        return usedItems || [];
    }

    function hideRecentlyInstalledBanner() {
        var banner = $("#discover-new-banner");
        if (banner.length)
            banner.remove();
    }

    function appendRecentlyInstalledBanner(newItemsNo, showLinkToNew) {
        hideRecentlyInstalledBanner();

        var recentlyInstalledTemplates = Confluence.Templates.Blueprints.discoverNewBanner(
            {newItemsNo: newItemsNo, showLinkToNew: showLinkToNew});
        var $container = $(".template-select-container-body");
        $container.prepend(recentlyInstalledTemplates);

        $container.find(".aui-button-link").click(function() {
            var showJustNew = !$(this).data("is-filtered");
            myObj.fillWebItemsInDialog(showJustNew, true);
        });

        $("#discover-new-banner .icon-close").click(function() {
            $("#discover-new-banner").slideUp(150);

            var dismissedItems = getDismissedItems();
            var i, item;
            for (i = 0, max = newWebItems.length; i < max; i++) {
                item = newWebItems[i].itemModuleCompleteKey;
                if ($.inArray(item, dismissedItems) == -1)
                    dismissedItems.push(item);
            }

            confluenceLocalStorage.setItemQuietly('dismissed', JSON.stringify(dismissedItems));

            myObj.fillWebItemsInDialog(false);
        });
    }

    // Returns whether the Discover-New banner should be shown or not
    function shouldShowDiscoverNewBanner() {
        if (newWebItems.length == 0 || hasPromotedItems)
            return false;

        // Get all web items that have been dismissed
        var dismissedItems = getDismissedItems();

        if (dismissedItems.length == 0)
            return true;

        for (var i = 0; i < newWebItems.length; ++i) {
            // If there is at least one new un-dmismissed web item then we show the banner
            if ($.inArray(newWebItems[i].itemModuleCompleteKey, dismissedItems) == -1)
                return true;
        }

        return false; // No new undismissed items
    }

    /**
     *
     * @param {{showDialog:boolean, updateHeight: boolean, showStepOne:boolean}=} options
     * @returns {{addButtonPanel: Function, addFullButtonPanel: Function, addBackButton: Function}}
     */
    function openDialog(options) {
        var options = options || {},
            keypressListener = function (e) {
                if (createDialog) {
                    if (e.keyCode === 27) {
                        closeDialog();
                    }
                    else if (e.keyCode === 13) {
                        // Submit on Enter
                        var nodeName = e.target.nodeName && e.target.nodeName.toLowerCase();
                        if (nodeName == "textarea")
                            return;                 // we care not for your typing in textareas

                        getSubmitButton().click();
                    }
                }
            };
        triggerSrc = options.triggerSrc ? '.' + options.triggerSrc : "";

        var dialogOptions = {
            width: 840,
            height: 449,
            id: dialogId,
            closeOnOutsideClick: false,
            keypressListener: keypressListener,
            focusSelector: '.templates'
        };

        createDialog = $.extend(new AJS.Dialog(dialogOptions), myObj);
        $dialog = createDialog.popup.element;
        createDialog.addHeader(createOptions.headingText);
        createDialog.initContext = options.initContext;

        var searcher = $dialog.searcher = Confluence.DomFilterField({
            items: '#create-dialog .templates .template',
            inputId: 'createDialogFilter',
            placeholderText: AJS.I18n.getText("create.content.plugin.filter.name"),
            postSearch: function ($visibleItems) {
                if ($visibleItems.length == 0) {
                    AJS.trigger(Confluence.Dialogs.Events.ITEM_SELECTED, {noVisibleItem: true});
                } else {
                    $visibleItems.eq(0).click();
                }
                // Select the first visible item
                if (!options.showStepOne)
                    refreshSubmitButton();
            },
            submitCallback: function ($visibleItems, searchText) {
                // Select the first visible item and pretend-press 'Next'.
                $visibleItems.eq(0).dblclick();
            }
        });
        searcher.form.find('input').attr('tabindex', 100);
        $dialog.find(".dialog-title").prepend(createOptions.helpLinkTemplate(), searcher.form);

        createDialog.addPanel("SinglePanel", Confluence.Templates.Blueprints.createDialogBody(), "loading");

        $.extend(createDialog, {
            addButtonPanel: addButtonPanel ,
            addFullButtonPanel: addFullButtonPanel,
            addBackButton: addBackButton,
            removeBackButton: removeBackButton
        });

        createDialog.addButtonPanel(createDialog.getPage(0), dialogSubmitted);

        /* prevPage() will take the user from a wizard override prevPage() to clear remove the disabled state and waiting gif from the "Next" button */
        createDialog.prevPage = function () {
            $dialog.find('.create-dialog-button-spinner').remove();
            $dialog.find(".create-dialog-create-button").removeAttr("disabled");
            return AJS.Dialog.prototype.prevPage.apply(createDialog, arguments);
        };

        // Next and Close should be next in tab-order after the last web-item. All tabbable elements in the dialog
        // have index 100 so that we navigation in DOM order within the dialog.
        $dialog.find('.dialog-button-panel').find("button, .button-panel-link").attr("tabindex", 100);

        $dialog.options = options = $.extend({
            showDialog: true,
            updateHeight: true
        }, options);

        createDialog.getPanel(0).setPadding(0);
        createDialog.gotoPanel(0);

        $('#create-dialog').find('.wait-icon').spin('medium');

        options.showDialog && createDialog.show();

        Confluence.sessionCheck();

        return createDialog;
    }

    /**
     * Returns "Submit" or "Next" depending on the type of webItem selected, I18N'd
     *
     * @param {boolean} isLastPage
     *
     * @returns {string}
     */
    function getSubmitButtonText(isLastPage) {
        return isLastPage
            ? AJS.I18n.getText('create.content.plugin.create-dialog.submit-button.label')
            : AJS.I18n.getText('create.content.plugin.create-dialog.next-button.label');
    }

    // AUI-2061: In order to correctly propagate events callbacks should return
    // true and manually preventDefault when an event (e) is provided to the callback
    function propagateEvent(func) {
        return function (dialog, page, e) {
            var retVal = func && func.call(this, dialog, page);
            if (retVal !== true && e) {
                e.preventDefault();
            } else {
                return retVal;
            }
        }
    }

    /**
     *
     * @param page
     * @param {function(Object) : void} nextCallback
     * @param {boolean} isLastPage
     * @param {string} className
     */
    function addButtonPanel(page, nextCallback, isLastPage, className) {
        var submitText = getSubmitButtonText(isLastPage);
        page.addButton(AJS.I18n.getText(submitText), null, "create-dialog-create-button");
        /* button-panel-button class doesn't have disabled styles, using .aui-button instead */
        page.buttonpanel.find('.button-panel-button').removeClass('button-panel-button').addClass('aui-button');
        page.buttonpanel.find('.create-dialog-create-button').addClass('aui-button-primary').click(nextCallback);

        if (className) {
            page.buttonpanel.addClass(className);
        }

        this.addCancel(AJS.I18n.getText("close.name"),  propagateEvent(closeDialog));
    }

    /**
     * For use by plugins or our standard Wizard chrome, adds previous, next and cancel buttons.
     *
     * @param {AJS.Page} page
     * @param {function(Object) : void} nextCallback
     * @param {function() : void} backCallback
     * @param {boolean} isLastPage
     *
     * @returns {HTMLDivElement}
     */
    function addFullButtonPanel(page, nextCallback, backCallback, isLastPage) {
        this.addBackButton(page, backCallback);
        this.addButtonPanel(page, propagateEvent(nextCallback), isLastPage);

        return page.buttonpanel;
    }


    /**
     *
     * @param {AJS.Page} page
     * @param {function() : void} backCallback
     */
    function addBackButton(page, backCallback) {
        page.addButton(AJS.I18n.getText("create.content.plugin.create-dialog.prev-button.label"), propagateEvent(function (dialog) {
            backCallback && backCallback();

            if (dialog.curpage == 1) {
                // Back to Create Dialog first page - where web-items are listed
                dialog.fillWebItemsInDialog();
            }

            dialog.prevPage();

            // When navigating back to the first page, resize the blueprint area when banner is present
            if (dialog.curpage == 0) {
                resizeTemplatesContainerWhenDiscoverNewBannerIsPresent();
            }

            // Need to remove the DOM element for the page, plus the Page object ref in the Dialog
            page.remove();
            dialog.page.pop();
            if (hasVisibleTemplates() && !$(".template.selected").length) {
                $(".template:visible:first").click();
            }
        }), "button-panel-back");
    }

    function removeBackButton() {
        var page = this.getPage(this.curpage);
        var backButton = page.buttonpanel.find('.button-panel-back');
        backButton.remove();
    }

    /**
     *
     * @param {string} spaceKey
     *
     * @returns {AJS.$.Deferred}
     */
    function requestWebItems(spaceKey, async) {
        var thisDialog = this,
            async = _.isUndefined(async) ? true : async;

        thisDialog.loadedWebitems = thisDialog.loadedWebitems || {};
        var data = this.loadedWebitems[spaceKey];
        if (data) {
            return AJS.$.Deferred().resolveWith(data);
        }
        return $.ajax({
            url: Confluence.getContextPath() + webItemsPath,
            dataType: "json",
            data: {
                spaceKey: spaceKey
            },
            async: async
        }).done(function(data) {
            thisDialog.loadedWebitems[spaceKey] = data;
        });
    }

    function requestSpaces() {
        var thisDialog = this;

        return AJS.$.getJSON(
            Confluence.getContextPath() + "/rest/create-dialog/1.0/spaces", {
                promotedSpaceKey: AJS.params.spaceKey,
                promotedSpacesLimit: 10,
                otherSpacesLimit: 1000
            }
        ).done(function (data) {
                thisDialog.loadedSpaces = data;
                AJS.trigger('create-dialog.data-ready');
            }
        );
    }

    function setDialogError(errorMessage) {
        // Display the error
        AJS.messages.error(".create-dialog-body", {
            body: errorMessage,
            id: "create-dialog-error-message",
            closeable: false
        });
        // Remove the loading spinner, 'next/create' button and 'filter' search fields from the dialog
        $dialog.find(".loading").removeClass("loading");
        $dialog.find(".create-dialog-create-button").remove();
        $dialog.find("#createDialogFilter").remove();
    }

    var myObj = {
        openDialog : openDialog,
        closeDialog : closeDialog,
        requestWebItems: requestWebItems,
        requestSpaces: requestSpaces,
        loadedWebitems: {},
        loadedSpaces: {},

        fillWebItemsInDialog: fillWebItemsInDialog,
        filterWebItems: function(webItems) { return webItems; },
        getSpaceKey: function() { return null; },
        setDialogError: setDialogError
    };
    return myObj;
};

}(AJS.$));

Confluence.Dialogs.Events = {};
Confluence.Dialogs.Events.ITEM_SELECTED = "create-dialog.item-selected";