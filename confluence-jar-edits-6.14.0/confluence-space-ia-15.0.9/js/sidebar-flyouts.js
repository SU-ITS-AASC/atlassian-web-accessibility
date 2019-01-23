(function($) {
    var quickLinksFlyout, childPagesFlyout, pageTreeFlyout;

    Confluence.Sidebar.createFlyouts = function($sidebar) {
        quickLinksFlyout = createFlyout(
            $('.collapsed .quick-links-section'),
            Confluence.Sidebar.Pages.quickLinksContent,
            'sidebar-quick-links-flyout',
            {flyout: 'quick-links'}
        );

        var contextualNav = $sidebar.find('.ia-secondary-container');
        if (contextualNav.length && contextualNav.attr('data-tree-type') == 'pages') {
            childPagesFlyout = createFlyout(
                $('.collapsed .ia-secondary-header-title.wiki'),
                Confluence.Sidebar.Pages.childPageCollapsedContent,
                'sidebar-children-flyout',
                {flyout: 'children'}
            );
        }

        if (contextualNav.length && contextualNav.attr('data-tree-type') == 'page-tree') {
            pageTreeFlyout = createFlyout(
                $('.collapsed .ia-secondary-header-title.page-tree'),
                Confluence.Sidebar.Pages.pageTreeCollapsedContent,
                'sidebar-page-tree-flyout',
                {flyout: 'pagetree'}
            );
        }
    };

    function createFlyout($trigger, contentFn, identifier, analyticsData) {
        var dialogLoadOverride = function(content, trigger, showPopup) {
            $(content).addClass('acs-side-bar-flyout ia-scrollable-section');
            $(content).empty().append(Confluence.Sidebar.throbberDiv());
            contentFn().done(function(html) {
                $(content).html(html);
            });
            AJS.trigger('sidebar.flyout-triggered', analyticsData);
            showPopup();

            //Change implementation when https://ecosystem.atlassian.net/browse/AUI-1175 is done
            $(trigger).one('click', function(e) {
                if($('#inline-dialog-'+identifier).is(':visible')) {
                    setTimeout(function() { //Make sure we execute hide after show in this case
                        flyout.hide();
                    },0);
                }
            });
            AJS.trigger('sidebar.disable-tooltip', trigger);
        };

        var flyout = AJS.InlineDialog($trigger, identifier, dialogLoadOverride, {
            gravity: 'w',
            calculatePositions: calculateFlyoutPositions,
            useLiveEvents: true,
            hideDelay: null,
            hideCallback: function() {
                AJS.trigger('sidebar.enable-all-tooltips');
            }
        });

        AJS.bind('sidebar.hide-overlays', flyout.hide);

        return flyout;
    }

    function calculateFlyoutPositions(popup, targetPosition, mousePosition, opts) {
        var targetOffset = targetPosition.target.offset();
        var targetWidth = targetPosition.target.width();
        var targetHeight = targetPosition.target.height();
        var popupCss = {
            top: targetOffset.top + targetHeight/2 - 15,
            left: targetOffset.left + targetWidth + 5,
            right: 'auto'
        };

        // Set the max height of the flyout so that it doesn't extend past the bottom edge of the viewport
        var $window = $(window);
        var gapFromBottomOfViewport = 20;
        popupCss.maxHeight = $window.height() + $window.scrollTop() - popupCss.top - gapFromBottomOfViewport;
        if ($.browser.msie && parseInt($.browser.version, 10) <= 8)
            popupCss.maxHeight -= 40; // IE8 adds padding to the max-width despite border-box sizing

        var arrowCss = {
            top: 9
        };

        return {
            popupCss: popupCss,
            arrowCss: arrowCss,
            gravity: 'w'
        };
    }
})(AJS.$);
