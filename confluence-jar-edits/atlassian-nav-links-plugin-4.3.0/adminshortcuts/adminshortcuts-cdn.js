AJS.toInit(function () {
    if (AJS.DarkFeatures && AJS.DarkFeatures.isEnabled('rotp.admin.shortcuts')) {
        NavLinks.AdminShortcuts.render();
    }
});