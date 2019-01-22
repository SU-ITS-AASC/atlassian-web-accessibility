(function($) {
Confluence.Dialogs = Confluence.Dialogs || {};

/**
 * @param {Confluence.Dialogs.CreateDialogBase} originalDialog
 */
Confluence.Dialogs.LocationPanel = function LocationPanel(originalDialog) {

    AJS.bind(Confluence.Dialogs.Events.ITEM_SELECTED, refreshLocation);

    var webItemLoader, spaceAdminCheckLoader, $dialog, $locationDiv, origOpenDialog = originalDialog.openDialog;

    // The space select control, will be defined when the dialog is created.
    var $spaceSelect;

    // The id that Created pages will be created under - if null they'll be created under the Space home page.
    var parentPageId = null;

    var BLOG_POST_ITEM_KEY = 'com.atlassian.confluence.plugins.confluence-create-content-plugin:create-blog-post';

    function requestAndFillWebItems(spaceKey, createDialog) {
        var templateContainer = $dialog.find(".template-select-container");
        templateContainer.addClass("loading");

        $('#create-dialog').find('.wait-icon').spin('medium');

        createDialog.requestWebItems(spaceKey).done(function (data) {
            createDialog.fillWebItemsInDialog(false);
            $('#create-dialog').find('.wait-icon').spinStop();
        }).fail(function () {
            // CONFDEV-13610 We assume that most failures at this point will be session-related.
            Confluence.sessionFail && Confluence.sessionFail();
        });
    }

    originalDialog.openDialog = function(options) {
        var createDialog;

        // If there's already a dialog open, we should use that
        if (!options || !options.createDialog) {
            // Call the original openDialog function in create-dialog-base to instantiate new dialog
            createDialog = origOpenDialog(options)
        } else {
            createDialog = options.createDialog;
        }

        // Make sure we extend the latest version of the base dialog
        if (options && options.dialogBase) {
            AJS.$.extend(createDialog, options.dialogBase);
        }

        $dialog = createDialog.popup.element;

        if (options.errorMessage) {
            createDialog.setDialogError(options.errorMessage);
        } else {
            // Add the location panel to the dialog
            var $locationPanel = $dialog.find('.create-dialog-body').prepend(Confluence.Templates.Blueprints.createDialogLocationPanel({}));
            $locationDiv = $locationPanel.find('#create-dialog-parent-container');
            $spaceSelect = $locationPanel.find(".space-select");

            // All necessary AJAX calls have been made for us by loader.js, so we're ready to show the dialog
            // We use a cached copy of the AJAX data here to aid testing.
            var spaces = originalDialog.loadedSpaces;
            defaultSpace = spaces.promotedSpaces.spaces[0] || spaces.otherSpaces.spaces[0];

            fillSpacesInDialog(spaces, $dialog);

            if (!$dialog.options.showStepOne) {
                originalDialog.fillWebItemsInDialog(false);
            }

            if (!spaceAdminCheckLoader)
                spaceAdminCheckLoader = requestSpaceAdminCheck(defaultSpace.id);

            spaceAdminCheckLoader.done(function (data) {
                customiseTemplatesLink(data, $dialog);
            });

            // The space-select class selector is important - without it it's possible for the wrong input to be
            // found (i.e. the one the user types into, not the one with the final value), and the wrong text is used as
            // the space key.
            $dialog.find(".create-dialog-location-bar input.space-select").change(function () {
                var spaceKey = $(this).val();

                requestAndFillWebItems(spaceKey, createDialog);

                requestSpaceAdminCheck(spaceKey).done(function (data) {
                    customiseTemplatesLink(data, $dialog);
                });
            });
            // essential to sizing the height of the dialog correctly (once it's contents has been populated correctly)
            $dialog.options.updateHeight && createDialog.updateHeight();
        }
        return createDialog;
    };

    /**
     * Returns the parentPageId that any new content should be created under.
     */
    originalDialog.getParentPageId = function() {
        return parentPageId;
    };

    originalDialog.filterWebItems = function(webItems) {
        // When the dialog has been opened from the 'Create child page' link, don't show the blog post item.
        if ($dialog.options.location == 'child-page') {
            return _.reject(webItems, function (item) {
                return item.itemModuleCompleteKey == BLOG_POST_ITEM_KEY;
            });
        }
        return webItems;
    };

    originalDialog.getSpaceKey = function getSpaceKey() {
        var currentSpaceKey = $spaceSelect.val();
        return currentSpaceKey || AJS.Meta.get('space-key');
    };

    /**
     * Show the location that the page will be created under. If $item is specified, show or hide the location based on
     * that item.
     *
     * @param $dialog to locate the Location div in (may be out of main DOM)
     * @param {{ev: object, item: jQuery}=} data the currently-selected item
     */
    function refreshLocation(ev, data) {
        // FIXME - refreshLocation shouldn't be bound until the Create Content dialog is displayed.
        if (!$locationDiv || !$locationDiv.length) {
            AJS.log("WARNING: refreshLocation should not be getting triggered - $locationDiv is not set");
            return;
        }

        var config;
        if (data) {
            if (data.config) {
                config = data.config;
            } else if (data.item) {
                config = data.item.data();
            }
        }
        var itemKey = config && (config.itemModuleCompleteKey || config.templateId) || null,
            isPageRestricted = $('#page-restricted-container').length || $('.request-access-container').length;
        if (!data.noVisibleItem && !isPageRestricted && shouldShowLocation(itemKey, config.spaceKey))
        {
            var parentLocation = Confluence.Blueprint.Util.getParentPageLocation();
            $locationDiv.find('span').text(parentLocation.parentPageTitle);   // pageTitle will always be set if we get to this line
            $locationDiv.show();
            parentPageId = parentLocation.parentPageId;
        }
        else
        {
            $locationDiv.hide();
            parentPageId = null;
        }
    }

    /**
     * Only show locations when we're creating a child page in the same space as the parent page.
     * @param itemKey can be a blueprintModuleCompleteKey or templateId
     */
    function shouldShowLocation(itemKey, spaceKey) {
        if (!itemKey)
            return true;

        var currentSpaceKey = AJS.Meta.get('space-key'),
            targetSpaceKey = spaceKey || $spaceSelect.val();

        if (!currentSpaceKey || (currentSpaceKey != targetSpaceKey)) return false;

        // Can't be a child page if no parent!
        if (!Confluence.Blueprint.Util.getParentPageLocation().parentPageTitle) return false;

        // Only pages can have child pages
        if (AJS.Meta.get('content-type') != "page") return false;

        ////CONFDEV-18265 Hack to not show the parent for Shared Links.
        //Fix this when CONFDEV-18335 is fixed.
        if (itemKey == "com.atlassian.confluence.plugins.confluence-business-blueprints:sharelinks-blueprint-item") return false;

        // Never show location for Blog Posts.
        return (itemKey != BLOG_POST_ITEM_KEY);
    }

    function transformData(data) {
        var result = [];

        var promoted = data.promotedSpaces.spaces;
        if (promoted && promoted.length) {
            result.push({
                text: AJS.I18n.getText('create.content.plugin.promoted.spaces'),
                children: promoted
            });
        }

        // Don't add 'All Spaces' if they've been truncated.
        var other = data.otherSpaces && !data.otherSpaces.resultsTruncated && data.otherSpaces.spaces;
        if (other && other.length) {
            result.push({
                text: AJS.I18n.getText('spaces.all'),
                children: other
            });
        }

        return result;
    }

    function fillSpacesInDialog(data, $dialog) {
        if (data.otherSpaces && data.otherSpaces.resultsTruncated) {
            var tooManyMessage = $dialog.find(".space-select-control-container .description");
            tooManyMessage.removeClass('hidden');

            var tooltipOptions = {
                gravity: 'w', // notch is in the west
                delayIn: 500, // Can be removed once AUI-1214 is resolved
                delayOut: 0, // Can be removed once AUI-1214 is resolved
                offset: 5  // Can be removed once AUI-1214 is resolved
            };
            tooManyMessage.find('a').tooltip(tooltipOptions).click(function () {
                return false;
            });
        }

        $spaceSelect.auiSelect2({
            data: transformData(data),
            escapeMarkup: function (markup) { // override to hack around xss vulnerability in jquery select2 plugin
                return markup;
            },
            width: "270px",
            containerCssClass: "select2-space-select",
            formatResult: function (result, label, query) {
                // Add a tooltip to disclose full result text (as we truncate it to fit the drop down)
                label.attr("title", $("<div/>").html(result.text).text());
                return $.fn.select2.defaults.formatResult.apply(this, arguments);
            },
            openOnEnter: false
        });

        // Select the first space shown in the dropdown.
        var select2 = $spaceSelect.data('select2');
        select2.data(data.promotedSpaces.spaces[0] || data.otherSpaces.spaces[0]);

        // Don't show all spaces - there may be 1000's. Show a few and have the user search to see more.
        var allSpaceLimit = 50;
        var oldPopulateResults = select2.opts.populateResults;
        select2.opts.populateResults = function (container, results, query) {
            var shouldPop = false;

            var newResults = results;
            if (results[1] && results[1].children && results[1].children.length > allSpaceLimit) {
                // Don't show more than 50 results in 'All Spaces'. Get the user to type more to filter the list.

                // We need to defensive copy the results because the ref may be pointing to the original data set returned
                // by the AJAX call (if the select is opened with no search term) - and we don't want to alter the
                // original.
                newResults = [];
                $(results).each2(function() {
                    newResults.push($.extend(true, {}, this));
                });

                newResults[1].children = newResults[1].children.slice(0, allSpaceLimit);
                newResults[1].children.push({
                    text: AJS.I18n.getText('create.content.plugin.select.space.see.more')
                });
                shouldPop = true;
            }
            oldPopulateResults.call(select2, container, newResults, query);
            shouldPop && results[1].children.pop();
        };

        var $searchInput = $dialog.find(".select2-space-select .select2-input");
        if ($searchInput.length && "placeholder" in $searchInput[0]) {
            $searchInput.attr("placeholder", AJS.I18n.getText("create.content.plugin.create-dialog.space.dropdown.filter.placeholder-text") + " ...");
        }
    }

    function requestSpaceAdminCheck(spaceKey) {
        return $.ajax({
            url: Confluence.getContextPath() + "/rest/create-dialog/1.0/spaces/adminCheck",
            dataType: "json",
            data: {
                spaceKey: spaceKey
            }
        });
    }

    var isOnDemand = (AJS.Meta.get('confluence-flavour').toLowerCase() != "vanilla");

    /**
     *
     * @param {boolean} data
     * @param {jQuery} $dialog
     */
    function customiseTemplatesLink(data, $dialog)
    {
        var isSpaceAdmin = data,
            existingTemplatesLink = $dialog.find(".add-remove-customise-templates-trigger");

        if (!isSpaceAdmin && isOnDemand) {
            existingTemplatesLink.remove();
            return;
        }

        var customiseTemplateLinkUrl = Confluence.getContextPath(),
            customiseTemplateLinkText;
        if (isSpaceAdmin) {
            customiseTemplateLinkUrl += "/pages/templates2/listpagetemplates.action?key=" + $spaceSelect.val();
            customiseTemplateLinkText = AJS.I18n.getText("create.content.plugin.plugin.add.or.customize.templates");
        } else { // !isOnDemand
            customiseTemplateLinkUrl += "/plugins/servlet/upm/marketplace/featured?category=Blueprints";
            customiseTemplateLinkText = AJS.I18n.getText("create.content.plugin.plugin.find.more.content");
        }

        var templatesLinkHtml = Confluence.Templates.Blueprints.customiseTemplatesLink({
            linkUrl: customiseTemplateLinkUrl,
            linkText: customiseTemplateLinkText
        });

        if (existingTemplatesLink.length) {
            existingTemplatesLink.replaceWith(templatesLinkHtml);
        } else {
            // Add the link - only add it to the button-panel on the *first* dialog page
            $dialog.find(".dialog-button-panel:first").prepend(templatesLinkHtml);
        }
    }
}
}(AJS.$));
