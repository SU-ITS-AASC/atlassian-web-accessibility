function submitBlankPage(e, state) {
    var createPageUrl = Confluence.getContextPath() + "/pages/createpage.action?spaceKey=" + encodeURIComponent(state.spaceKey);

    /* if the parent page is not in the selected space, we shouldn't use it :) */
    var parentPageId = Confluence.Blueprint.Util.getParentPageLocation().parentPageId,
        isPageRestricted = $('#page-restricted-container').length || $('.request-access-container').length;
    if (!isPageRestricted && parentPageId && state.spaceKey == AJS.Meta.get("space-key") && AJS.Meta.get('content-type') == "page") {
        createPageUrl += "&fromPageId=" + encodeURIComponent(parentPageId);
    }

    if (state.initContext) {
        for (var key in state.initContext) {
            createPageUrl += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(state.initContext[key]);
        }
    }

    state.finalUrl = createPageUrl;
}

Confluence.Blueprint.setDirectCallback('com.atlassian.confluence.plugins.confluence-create-content-plugin:create-blank-page', submitBlankPage);