define('confluence-space-ia/sidebar-space-tools', [
    'ajs',
    'jquery',
    'confluence/legacy'
], function(
    AJS,
    $,
    Confluence
) {
    function SidebarSpaceTools() {
        var spaceToolLinks = [];
        var spaceLinks = [];
        var isAuiFiveSeven = AJS.version.indexOf('5.7') === 0;
        var spaceToolsMenu;
        var spaceToolsPopupOptions;
        var $spaceToolsMenuTrigger, $spaceToolsMenu;
        if (!isAuiFiveSeven) {
            $spaceToolsMenuTrigger = $('#space-tools-menu-trigger');
            $spaceToolsMenu = $('#space-tools-menu');
        }

        var $expandCollapseTrigger;

        // spaceToolsLinks and spaceLinks content comes from the DOM where it exists as a header menu that's displayed in
        // documentation theme, but hidden in the global theme (this is the theme that contains the sidebar). In the global
        // theme, the menu is instead presented in the bottom of the sidebar as "Configure sidebar". The items placed in
        // the "Configure sidebar" menu are scraped from the DOM

        // Data for rendering the top-level Space Tools web items
        if (isAuiFiveSeven) {
            $('#space-tools-web-items').children('div').each(function() {
                spaceToolLinks.push({
                    label: $(this).data('label'),
                    href: $(this).data('href')
                });
            });
        } else {
            AJS.warn('Remove legacy sidebar code when upgrade to AUI 5.8+');
            $spaceToolsMenu.on({
                'aui-dropdown2-show': function () {
                    AJS.trigger('sidebar.disable-tooltip', $spaceToolsMenuTrigger);
                },
                'aui-dropdown2-hide': function () {
                    AJS.trigger('sidebar.enable-all-tooltips');
                }
            });

            $('#space-tools-web-items').children('div').each(function() {
                spaceToolLinks.push({
                    text: $(this).data('label'),
                    href: $(this).data('href')
                });
            });
        }

        // Data for rendering other space related links in the menu
        if (isAuiFiveSeven) {
            $('#space-tools-menu-additional-items').children('div').each(function() {
                spaceLinks.push({
                    className: $(this).data('class'),
                    label: $(this).data('label'),
                    href: $(this).data('href')
                });
            });
        } else {
            $('#space-tools-menu-additional-items').children('div').each(function() {
                spaceLinks.push({
                    extraClasses: $(this).data('class'),
                    text: $(this).data('label'),
                    href: $(this).data('href')
                });
            });
        }

        // Build space tools menu
        if (isAuiFiveSeven) {
            spaceToolsPopupOptions = {
                hideDelay: null,
                width: 170,
                displayShadow: false, // shadow handled by dropdown CSS classes
                calculatePositions: function(popup, targetPosition) {
                    var targetOffset = targetPosition.target.offset();
                    return {
                        popupCss: {
                            top: targetOffset.top - popup.height(),
                            left: targetOffset.left
                        },
                        arrowCss: {
                            display: 'none'
                        }
                    };
                },
                hideCallback: function() {
                    AJS.trigger('sidebar.enable-all-tooltips');
                }
            };
            spaceToolsMenu = AJS.InlineDialog($('#space-tools-menu-trigger'), 'space-tools', function(content, trigger, showPopup) {
                content.html(Confluence.Templates.Sidebar.spaceToolsMenu({
                    spaceToolLinks: spaceToolLinks,
                    spaceLinks: spaceLinks,
                    isAuiFiveSeven: isAuiFiveSeven
                }));

                // Until https://ecosystem.atlassian.net/browse/AUI-1175 is implemented
                $(trigger).one('click', function (e) {
                    if ($('#inline-dialog-space-tools').is(':visible')) {
                        setTimeout(function () { // Make sure we execute hide after show in this case
                            spaceToolsMenu.hide();
                        }, 0);
                    }
                });

                // Don't show collapsed mode tooltip once we display the menu
                AJS.trigger('sidebar.disable-tooltip', trigger);
                AJS.trigger('sidebar.spacetools-loaded');

                showPopup();
                return false;
            }, spaceToolsPopupOptions);

            // Style space tools menu like a dropdown (we can't override AUI's dropdown to display above its trigger)
            spaceToolsMenu.addClass("aui-dropdown2 aui-style-default space-tools-dropdown");

            AJS.bind('sidebar.hide-overlays', spaceToolsMenu.hide);
        } else {
            $spaceToolsMenu.html(Confluence.Templates.Sidebar.spaceToolsMenu({
                spaceToolLinks: spaceToolLinks,
                spaceLinks: spaceLinks
            }));

            if (AJS && AJS.Confluence && AJS.Confluence.Analytics && AJS.Confluence.Analytics.setAnalyticsSource) {
                AJS.Confluence.Analytics.setAnalyticsSource($spaceToolsMenu.find('a:not(.configure-sidebar)'), "spacetools");
            }

            AJS.bind('sidebar.hide-overlays', function() {
                // If the Configure toolbar menu is visible, invoke the trigger to close it
                if ($spaceToolsMenu.filter('[aria-hidden="false"]').length) {
                    $('#space-tools-menu-trigger').trigger('aui-button-invoke');
                }
            });
        }

        // Collapse / expand trigger binding
        $expandCollapseTrigger = $('.expand-collapse-trigger');
        $expandCollapseTrigger.click(function(e) {
            e.preventDefault();
            Confluence.Sidebar.toggle();
        });
        $expandCollapseTrigger.attr('data-tooltip', $('.ia-fixed-sidebar').hasClass('collapsed') ? Confluence.Sidebar.expandTooltip : Confluence.Sidebar.collapseTooltip);
        AJS.bind('sidebar.collapsed', function() {
            $expandCollapseTrigger.attr('data-tooltip', Confluence.Sidebar.expandTooltip);
        });
        AJS.bind('sidebar.expanded', function() {
            $expandCollapseTrigger.attr('data-tooltip', Confluence.Sidebar.collapseTooltip);
        });
    }

    return SidebarSpaceTools;
});