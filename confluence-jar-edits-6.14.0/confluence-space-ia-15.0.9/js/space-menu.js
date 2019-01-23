AJS.toInit(function($) {
    var dropdown = $(Confluence.Templates.BrowseSpaces.spacesLink());
    $("#space-directory-link").replaceWith($(dropdown));

    var bindMenu = function(response) {
            var $spaceMenuLinkContent = $("#space-menu-link-content");
            $spaceMenuLinkContent.html(response.template);
            if (AJS && AJS.Confluence && AJS.Confluence.Analytics && AJS.Confluence.Analytics.setAnalyticsSource) {
                AJS.Confluence.Analytics.setAnalyticsSource($spaceMenuLinkContent.find('a'), "spacemenu");
            }

            $("#create-space-header").click(function () {
                AJS.trigger('analytics', { name: 'create-space-from-header' });
                Confluence.SpaceBlueprint.Dialog.launch();
                return false;
            });
        };

    $('#space-menu-link-content').on('aui-dropdown2-show', function() {
        AJS.trigger('analytics', { name: 'open-space-menu' });
        if (!$("#space-menu-link-content .aui-dropdown2-section") || !$("#space-menu-link-content .aui-dropdown2-section").length) {
            $.ajax({
                url: Confluence.getContextPath() + "/rest/ia/1.0/spacesmenu",
                type: "GET",
                dataType: "json",
                cache: false,
                success: bindMenu
            });
        }
        return false;
    });
});



