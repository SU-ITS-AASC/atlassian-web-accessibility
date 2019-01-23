AJS.toInit(function ($) {
    function initPageBannerAnalytics() {
        if (!AJS.Confluence.Analytics || !AJS.Confluence.Analytics.setAnalyticsSource) {
            AJS.log("WARNING: Could not initialise analytics for the page banner: AJS.Confluence.Analytics.setAnalyticsSource is not defined.");
            return;
        }

        var setAnalyticsSource = AJS.Confluence.Analytics.setAnalyticsSource;
        var allBreadcrumbs = $('#breadcrumbs > li');

        // Default analytics type to 'breadcrumbs' (used to catch any links not caught in the overriding section
        setAnalyticsSource(allBreadcrumbs.filter(':not(#ellipsis)').find('a'), "breadcrumbs");

        // Override default analytics type
        setAnalyticsSource(allBreadcrumbs.filter('.hidden-crumb').find('a'), "breadcrumbs-expanded");
        setAnalyticsSource(allBreadcrumbs.filter(':last').find('a'), "breadcrumbs-parent");

        // Override first breadcrumb link analytics type based on theme (documentation theme has different breadcrumbs)
        var firstBreadcrumbSource = $('#com-atlassian-confluence').hasClass('theme-documentation') ? "breadcrumbs-homepage" : "breadcrumbs-collector";
        setAnalyticsSource(allBreadcrumbs.filter('.first').find('a'), firstBreadcrumbSource);
    }

    function initHoverEvent(target, timeout, callback) {
        var timeoutId = null;

        target.mouseover(function() {
            timeoutId = setTimeout(callback, timeout);
        });

        target.mouseout(function() {
            clearTimeout(timeoutId);
        });
    }

    AJS.bind("breadcrumbs.expanded", function() {
        AJS.trigger('analyticsEvent', {name: 'breadcrumbs-expanded'});
    });

    initPageBannerAnalytics();
});