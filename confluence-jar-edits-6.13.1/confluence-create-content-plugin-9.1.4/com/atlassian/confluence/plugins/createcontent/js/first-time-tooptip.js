AJS.bind("sidebar.finished-loading", function() {
    var indexKey = AJS.Meta.get('blueprint-index-popup-key');
    AJS.debug("Index key for " + indexKey);
    if (indexKey) {
        Confluence.Blueprint.showIndexPagePopup(indexKey);
    }
});

Confluence.Blueprint = AJS.$.extend(Confluence.Blueprint, {
    showIndexPagePopup: function (indexKey) {
        var popupContents = function (title) {
            return function ($contents, trigger, doShowPopup) {
                $contents.html(Confluence.Templates.Blueprints.sidebarIndexPagePopup({indexPageTitle: title.toLowerCase()}));
                doShowPopup();
            };
        };

        var $elem = AJS.$(AJS.$("li.blueprint." + indexKey)[0]);
        var title = $elem.text();
        var $elemIcon = AJS.$(".icon", $elem);
        var popupIndex = "blueprintIndexSidebarPopup";
        var dialog = AJS.InlineDialog(
            $elemIcon.is(":visible") ? $elemIcon : AJS.$(".acs-nav-sections .quick-links-section"),
            popupIndex,
            popupContents(title),
            {addActiveClass: false, hideDelay: null, noBind: true}
        );

        // HACK until AUI allows doing this on the public API
        AJS.$(document).bind("showLayer", function (ev) {
            var externalClickNamespace = popupIndex + ".inline-dialog-check";
            AJS.$("body").unbind("click." + externalClickNamespace);
        });

        dialog.show();

        var dismissButton = function (dialog) {
            AJS.$(document).on("click", "#dismiss-index-popup", function () {
                dialog.hide();
                return false;
            });
        }(dialog);

        // hide the popup when invoking quick edit
        AJS.bind('quickedit.success', function () {
            dialog.hide();
        });
    }
});
