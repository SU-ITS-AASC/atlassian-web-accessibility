(function($) {

    function findNextPageId(pageId, pages) {
        var thisPageIdIndex = -1;
        _.each(pages, function(element, index) {
            if (element.id == pageId) {
                thisPageIdIndex = index;
                return;
            }
        });
        return pages[thisPageIdIndex + 1].id;
    }

    /**
     * Currently only supports dialog wizards for an existing dialog. This simply helps handle the back and next buttons
     * and rendering of the wizard from templates.
     *
     * @param dialog AUI Dialog object to add the wizard to
     * @param finalAction function to callback when the last wizard page is submitted
     * @returns DialogWizard in the format {{newPage: Function, doFinalAction: Function}}
     * @constructor
     */
    Confluence.DialogWizard = function(dialog, finalAction) {
        function newPage(config, pageId, soyRenderContext, wizardData, wizard) {
            var wizardPage = _.find(config.wizard.pages, function(page) {
                return page.id == pageId;
            });

            wizard.trigger('pre-render.' + pageId, {
                soyRenderContext: soyRenderContext,
                wizardData: wizardData
            });

            try {
                // Try/catch because:
                // a. the templateKey might eval as an undefined error
                // b. the templateKey evaluates to something other than a function
                var soyTemplateFunction = eval(wizardPage.templateKey);
                var $soyRender = $(soyTemplateFunction(soyRenderContext));
            } catch (e) {
                throw Error("wizard points to a non-existent Soy template '" + wizardPage.templateKey + "'. Check your web-resources or server logs.");
            }

            // Set equal tab-index on all panel elements to respect tab-order. 10 feels good.
            $soyRender.find("a, area, button, input, object, select, textarea").attr("tabindex", "10");

            // The wizard content may fill the dialog page, or specify a description to appear on the right. In that case,
            // we wrap with our own template.
            var $panelContent;
            if (wizardPage.descriptionContent) {
                $panelContent = $(Confluence.Templates.DialogWizard.pageContainer({
                    descriptionHeaderLink: wizardPage.descriptionHeaderLink,
                    descriptionHeader: wizardPage.descriptionHeader,
                    descriptionContent: wizardPage.descriptionContent
                }));
                $panelContent.addClass('with-description')
                             .find('.dialog-wizard-page-main')
                             .append($soyRender);
            } else {
                $panelContent = $soyRender;
            }

            var dialogPageId = pageId;
            //for create dialog until we fix the styles in all the blueprints
            if (dialog.id == "create-dialog")
                dialogPageId = "create-dialog-" + pageId;

            var page = dialog.addPage(dialogPageId).page[dialog.curpage];
            page.addHeader(wizardPage.title)
                .addPanel("SinglePanel", $panelContent, "singlePanel");

            page.element.find('form').submit(function() {
                // WE handle submission of forms, not you. Obey!
                return false;
            });

            if (wizardPage.descriptionContent) {
                page.element.find('.dialog-panel-body').css({
                    padding: 0
                });
            }

            // Perform automatic bindings for autocompletes and other controls, based on element classes.
            Confluence.Binder.autocompleteMultiUser($soyRender);
            Confluence.Binder.placeholder($soyRender);

            function nextCallback(ev) {

                // clear out placeholder values for IE before we build the data
                $soyRender.find(".placeholded").val('');

                // We search down from the parent in case the $soyRender IS the form
                var pageData = {};
                var formArray = $soyRender.parent().find('form').serializeArray();
                _.each(formArray, function (item) {
                    pageData[item.name] = item.value;
                });

                var e = $.Event('submit.' + pageId);
                var state = {
                    $container: $soyRender,
                    wizardData: wizardData,
                    pageData: pageData
                };

                /**
                 * The validation may be async, in which case the submit handler will return false to block normal
                 * processing, and resolve or reject the validation attempt when it receives its response.
                 */
                var validationDeferred = $.Deferred();
                validationDeferred.done(function () {
                    wizardData.pages[pageId] = pageData;

                    var nextPageId;
                    if (state.nextPageId) {
                        // The submit handler specified a next page to go to.
                        nextPageId = state.nextPageId;
                    } else {
                        nextPageId = !wizardPage.last && findNextPageId(pageId, config.wizard.pages);
                    }

                    // CONFDEV-23025: should create a new page once the submit handler specifies a next page
                    if (!state.nextPageId && wizardPage.last) {
                        doFinalAction(ev, state, wizardData, finalAction, wizard);

                        dialog.popup.element.find(':input,a').filter(':visible').disable().addClass('disabled');
                        buttons.prepend(Confluence.Templates.DialogWizard.waitIcon());
                    } else {
                        newPage(config, nextPageId, soyRenderContext, wizardData, wizard);
                    }
                });
                validationDeferred.fail(function () {
                    AJS.log("dialog aborted by on-submit callback on page: " + pageId);
                });

                state.validationDeferred = validationDeferred;
                wizard.trigger(e, state);

                if (state.async) {
                    // The submit handler has indicated that it will call the deferred manually. Nothing to do here...
                    return;
                }

                if (e.isDefaultPrevented()) {
                    // Submit handler returned false, meaning that something failed. Don't submit, don't change page.
                    validationDeferred.reject();
                    return;
                }

                // Submit handler is not async and reports no problems. Continue!
                validationDeferred.resolve();
            }

            var buttons = dialog.addFullButtonPanel(page, nextCallback, null, wizardPage.last);
            buttons.find('.button-panel-back').click(function() {
                delete wizardData.pages[pageId];
            });
            // Set tabindex for Create button
            buttons.find(".aui-button-primary").attr("tabindex", "10");
            // Put here code for AFTER the page is visible in the browser
            $soyRender.find('input, select, textarea').eq(0).focus();

            wizard.trigger('post-render.' + pageId, {
                $container: $soyRender,
                wizardData: wizardData
            });
        }

        function doFinalAction(ev, state, wizardData, finalAction, wizard) {
            if (state.finalUrl) {
                // If action results from a middle-click, open in a new window.
                if (ev.type === "click" && ev.which === 2) {
                    window.open(state.finalUrl);
                } else {
                    window.location = state.finalUrl;
                }
            } else {
                _.each(wizardData.pages, function(pageData) {
                    _.extend(wizardData, pageData);
                });
                delete wizardData.pages;

                finalAction(ev, wizardData, null, wizard);
            }

            return {
                success: function(callback) {
                    callback();
                }
            };
        }

        return {
            newPage: newPage,
            doFinalAction: doFinalAction
        };
    }
})(AJS.$);