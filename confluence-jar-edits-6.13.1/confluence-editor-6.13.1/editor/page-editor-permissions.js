/**
 * @module confluence-editor/editor/page-editor-permissions
 */
define('confluence-editor/editor/page-editor-permissions', [
    'ajs',
    'jquery'
], function(
    AJS,
    $
) {
    "use strict";

    var PageEditorPermissions = {};

    /**
     * Updates the icon of the restrictions button in the editor
     * Both hasExplicitRestrictions and hasInheritedRestrictions refer to view restrictions only.
     */
    PageEditorPermissions.updateEditPageRestrictions =
            function (hasExplicitRestrictions, hasInheritedRestrictions, hasAnyExplicitRestrictions, restrictionsHash) {
        var restrictionButton = $("#rte-button-restrictions");
        var icon = restrictionButton.find(".icon");
        var labelName = '';
        var allLockIconClasses = "aui-iconfont-locked aui-iconfont-unlocked icon-red";

        if (hasExplicitRestrictions || hasInheritedRestrictions) {
            var lockIconClass = hasExplicitRestrictions ? "aui-iconfont-locked icon-red" : "aui-iconfont-unlocked icon-red";
            icon.removeClass(allLockIconClasses).addClass(lockIconClass);
            labelName = AJS.I18n.getText("page.restrictions.apply");
        } else {
            icon.removeClass(allLockIconClasses).addClass("aui-iconfont-unlocked");
            labelName = hasAnyExplicitRestrictions ?
                    AJS.I18n.getText("page.restrictions.apply") : AJS.I18n.getText("page.restrictions.none");
        }

        restrictionButton.attr('data-tooltip', labelName);
        restrictionButton.attr('aria-label', labelName);
        restrictionButton.data('explicit-restrictions', hasExplicitRestrictions);
        restrictionButton.data('inherited-restrictions', hasInheritedRestrictions);
        restrictionButton.data('restrictionsHash', restrictionsHash);
    };

    PageEditorPermissions.handleHeartbeat = function (event, data) {
        if (typeof data.restrictionsHash === 'undefined') { return; }

        var restrictionButton = $("#rte-button-restrictions");

        if (restrictionButton.data('restrictionsHash') !== data.restrictionsHash) {
            var restrictionDialog = $('#update-page-restrictions-dialog');

            if (restrictionDialog.is(':visible') && AJS.PagePermissions.updateRestrictionsDialog) {
                AJS.PagePermissions.updateRestrictionsDialog();
                restrictionButton.data('restrictionsHash', data.restrictionsHash);
            } else {
                var hasAnyExplicitRestrictions = data.restrictionsHash !== "";
                var hasExplicitRestrictions = data.hasViewRestrictions;
                var hasInheritedRestriction = !!restrictionButton.data('inherited-restrictions');

                PageEditorPermissions.updateEditPageRestrictions(hasExplicitRestrictions, hasInheritedRestriction, hasAnyExplicitRestrictions, data.restrictionsHash);
            }
        }
    };

    PageEditorPermissions.init = function ($) {
        /**
         * Catches any heartbeat event and checks if the restrictions hash has changed. A new hash triggers the client to request
         * the new restrictions data from the server
         */
        AJS.bind("editor-heartbeat", PageEditorPermissions.handleHeartbeat);

        /**
         * Catches any changes in page permissions from the editor and updates the restrictions button icon where necessary
         */
        var handleEditPageRestrictionsUpdated = function(event, data) {
            PageEditorPermissions.updateEditPageRestrictions(data.hasExplicitRestrictions, data.hasInheritedRestrictions, data.hasAnyExplicitRestrictions, data.restrictionsHash);
        };
        AJS.bind("edit-page-restrictions-updated", handleEditPageRestrictionsUpdated);
    };

    return PageEditorPermissions;
});

require('confluence/module-exporter').safeRequire('confluence-editor/editor/page-editor-permissions', function(PageEditorPermissions) {
    var AJS = require('ajs');
    var $ = require('jquery');

    AJS.PagePermissions = AJS.PagePermissions || {};

    $.extend(AJS.PagePermissions, {
        updateEditPageRestrictions: PageEditorPermissions.updateEditPageRestrictions
    });

    AJS.toInit(PageEditorPermissions.init);
});
