(function($) {
    "use strict";
    
    var setAnalyticsSource = AJS.Confluence.Analytics.setAnalyticsSource;

    function initSidebarAnalytics () {
        var sidebar = $(".acs-side-bar");
        // Default analytics type to 'sidebar'
        var spaceSidebarLinks = sidebar.find("a:not(.external_link a, #acs-configure-link)");
        setAnalyticsSource(spaceSidebarLinks, "sidebar");

        // Specifically set analytics source for Pages and Blogs
        var pageLink = sidebar.find("[data-collapsed-tooltip='"+AJS.I18n.getText("Pages")+"']");
        setAnalyticsSource(pageLink, "sidebar-pages");
        var blogLink = sidebar.find("[data-collapsed-tooltip='"+AJS.I18n.getText("Blog")+"']");
        setAnalyticsSource(blogLink, "sidebar-blogs");

        // Override analytics source
        var quickLinks = sidebar.find(".quick-links-section li:not(.external_link) a");
        setAnalyticsSource(quickLinks, "spaceshortcut");

        var contextualNav = sidebar.find(".ia-secondary-container a:not(.more-children-link)");
        if (sidebar.find(".ia-secondary-container").data("tree-type") == "pages") {
            setAnalyticsSource(contextualNav, "contextnavchildmode");
        } else if (sidebar.find(".ia-secondary-container").data("tree-type") == "page-tree") {
            setAnalyticsSource(contextualNav, "contextnavpagetreemode");
        } else {
            setAnalyticsSource(contextualNav, "contextnav");
        }
    }

    function clickHandlerFactory(linkType) {
        return function() {
            AJS.trigger('analytics', { name: 'space-ia-nav', data: {linkType: linkType} });
        };
    }

    AJS.toInit(function($) {
        // Register analytics events for contextual navigation usage
        $(".acs-side-bar").find('.ia-secondary-container .more-children-link').click(clickHandlerFactory('context-nav.more-children'));

        AJS.bind('sidebar.exit-configure-mode', initSidebarAnalytics);

        // Register analytics events for flyout usage
        AJS.bind('sidebar.flyout-triggered', function(e, data) {
            clickHandlerFactory('flyout-triggered.' + data.flyout)();
        });

        // Triggered by confluence-pagetree-plugin
        AJS.bind('pagetree-children-loaded', initSidebarAnalytics);


        initSidebarAnalytics();
    });
})(AJS.$);