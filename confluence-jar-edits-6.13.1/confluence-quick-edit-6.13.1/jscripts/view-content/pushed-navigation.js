/**
 * This resource is included in the editor and view page context, not just quick-edit
 *
 * We need to hook into the popstate event even if the editor is in full mode to be able to handle
 * navigation actions into "pushed" history entries.
 *
 * @module confluence-quick-edit/view-content/pushed-navigation
 */
define('confluence-quick-edit/view-content/pushed-navigation', [
    'jquery',
    'underscore',
    'window',
    'confluence/legacy',
    'ajs',
    'confluence-quick-edit/view-content/pushed-navigation-util'
], function(
    $,
    _,
    window,
    Confluence,
    AJS,
    PushedNavUtil
) {
    "use strict";

    var supportsPushState = !!window.history.pushState; // Everything but IE8 and IE9
    var ignoreNextPushState = false;

    var currentPath = window.location.href;

    var hashChangeFilters = [PushedNavUtil.filterPreviewHashChange];
    var popStateFilters   = [PushedNavUtil.filterPreviewNavigationEvent];

    /**
     * Perform reloading page.
     */
    function actuallyNavigatePlease() {
         // Logic for IE9 and below
        if (!supportsPushState) {
            // CONFDEV-25865 - hasOnlyHashChanged evaluates to true when cancelling out of quick edit in IE9
            if (hasOnlyHashChanged(currentPath, window.location.href) &&
                !isNavigatingAwayFromQuickEdit(currentPath)) {
                return; // nothing to do here, let the browser handle the hashchange event
            }

            window.location.reload();
        } else { // Logic for browsers that do support pushState
             if (!hasOnlyHashChanged(currentPath, window.location.href)) {
                 $(window).unbind('popstate', handleNavigationEvent);
                 window.location.reload();
             }
        }
    }

     // Only required while we support IE9
    function isNavigatingAwayFromQuickEdit(initialPath) {
        return initialPath.split('#')[1] === 'editor';
    }

    function hasOnlyHashChanged(initialPath, newPath){
        return initialPath.split('#')[0] == newPath.split("#")[0];
    }

    function trackLocation(e){
        currentPath = window.location.href;
    }

    function isInEditPage() {
        return PushedNavUtil.isInEditPage();
    }

    // In order to support pushstate navigation, we need to "intercept" the onbeforeunload event handler
    // so we can add our own logic to restore the URL if the navigation gets cancelled
    function handleEditorNavigationEvent() {
        function restoreUrl() {
            if (supportsPushState) {
                // ignore the next pushstate that history.forward is going to trigger.
                ignoreNextPushState = true;
                window.history.forward();
            } else {
                window.location.hash = "editor";
            }
        }

        var message = Confluence.Editor.Drafts.unloadMessage();

        // If we have a message it means we should implement our own version of beforeunload.
        if (message) {

            // disable before unload for quick-edit when an unloadMessage is available
            Confluence.Editor.Drafts.unBindUnloadMessage();

            if (confirm(message + "\n\n" + AJS.I18n.getText("confirmation.leave.dialog"))) {
                // If the user pressed OK it means they want to leave the page
                AJS.trigger("analytics", { name: "rte.quick-edit.confirmation.leaving" });
                actuallyNavigatePlease();
            } else {
                // If the user pressed cancel they want to keep editing so we need to restore the edit url
                AJS.trigger("analytics", { name: "rte.quick-edit.confirmation.staying" });
                restoreUrl();

                // We also bind the beforeUnload message again
                Confluence.Editor.Drafts.bindUnloadMessage();
            }
        } else {
            actuallyNavigatePlease();
        }
    }

    function handleHashChange() {
        // Only page and blog post edits support drafts
        var inEditPage = isInEditPage();

        if (!inEditPage) {
            actuallyNavigatePlease();
        } else if (window.location.hash !== '#editor') {
            handleEditorNavigationEvent();
        }
    }

    function handleNavigationEvent() {
        if (ignoreNextPushState){
            ignoreNextPushState = false;
            return;
        }

        // Only page and blog post edits support drafts
        if (isInEditPage()) {
            handleEditorNavigationEvent(); // want to leave an open editor
        } else {
            actuallyNavigatePlease();
        }
    }

    function handleEvent(handler, filters) {
        return function() {
            if(_.every(filters, function (filter) {return filter();})) {
                handler();
            }
        };
    }

    var init = function(){
        // the page url could have changed on page load (i.e: by the analytics plugin)
        // so we make sure we save the current href as the initial one.
        trackLocation();

        if (!supportsPushState) {
            // IE9 doesn't support pushState.
            $(window).bind("hashchange", handleEvent(handleHashChange, hashChangeFilters));

            // CONFDEV-25865: In IE9, if the use clicks Ok button to exit Quick Edit in IE9,
            // we need to reload page.
            // Because when the confirmation dialog is showing,
            // the #editor hash is removed out of current URL,
            // so "currentPath" and "window.location.href" are always the same.
            // Here we are trying to keep track of current URL in "currentPath".
            $(window).bind("rte-quick-edit-push-hash", trackLocation);
        }
        else {
            $(window).bind("popstate", handleEvent(handleNavigationEvent, popStateFilters));
            $(window).bind("rte-quick-edit-push-state", trackLocation);
        }
    };

    // this needs to be bound before DOM ready because 'rte-quick-edit-enable-handlers' event will be
    // triggered by quick-edit in DOM ready. We need to ensure there is an event handler
    // bound to #editPageLink click event before actually triggering it.
    AJS.bind("rte-quick-edit-enable-handlers", function(){
        // keeping compatibility with urls created by browsers that don't support pushState.
        if (window.location.hash === '#editor'){
            $('#editPageLink').click();
        }
    });

    return init;

});

require('confluence/module-exporter').safeRequire('confluence-quick-edit/view-content/pushed-navigation', function(init) {
    require('ajs').toInit(function(){
        // CONFDEV-25365
        // https://code.google.com/p/chromium/issues/detail?id=63040
        // avoid the popstate event that WebKit fires on document load
        setTimeout(init, 0);
    });
});