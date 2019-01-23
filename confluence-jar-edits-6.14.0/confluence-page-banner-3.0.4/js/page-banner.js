define('confluence-page-banner/page-banner', [
    'ajs',
    'jquery',
    'confluence/templates',
    'confluence/legacy',
    'skate'
], function(
    AJS,
    $,
    Templates,
    Confluence,
    skate
) {
    // This function will check whether all children in the system-content-items section are hidden and if so, hide the parent container.
    function updateSystemContentItems() {
        var $systemContentItems = $('#system-content-items');

        if ($systemContentItems.children(':not(.hidden)').length == 0) {
            $systemContentItems.addClass('hidden');
        } else {
            $systemContentItems.removeClass('hidden');
        }
    }

    function hidePageBanner() {
        $('#page-metadata-banner').hide();
    }

    function applyTooltips() {
        var bannerItems = $('#system-content-items a:not(.tipsy-disabled),' +
            '.page-metadata-item a:not(.tipsy-disabled),' +
            '.page-metadata-modification-info a.last-modified:not(tipsy-disabled),' +
            '#draft-status-lozenge');
        applyTooltip(bannerItems);

        bannerItems.click(function(e) {
            hideTooltips($(e.target).closest('a'));
        });
        $(window).on('click scroll resize', hideTooltips)
    }

    function applyTooltip(selector) {
        // We construct a jQuery object using the selector to guarantee that the tooltip function can extract the object's selector.
        // This is required for the live param to work.
        $(selector).tooltip({
            live: true, // Dynamically added links are handled automatically
            gravity: 'n',
            title: 'title', // Tooltip text is specified in this attribute value
            delayIn: 500
        });
    }

    function hideTooltips(tooltipTrigger) {
        $('.tipsy').remove(); // Remove any tooltips that are currently visible
        if (tooltipTrigger) { // Attempt to stop any tooltips that are still pending display
            var pending = $(tooltipTrigger).data('tipsy');
            if (pending) {
                pending.hoverState = 'out';
            }
        }
    }

    var toggledRestrictions = function(event, data) {
        var $restrictionsIcon = $("#content-metadata-page-restrictions");
        var labelName = '';

        // Remove only the necessary css classes
        $restrictionsIcon.removeClass('aui-iconfont-locked aui-iconfont-unlocked restricted');

        // We only use this value if the new values are not being passed in,
        //  this allows us to support older versions of Confluence.
        var oldHasRestrictions = data.hasRestrictions && !(data.hasExplicitRestrictions || data.hasInheritedRestrictions);

        if (data.hasExplicitRestrictions || oldHasRestrictions) {
            $restrictionsIcon.addClass('aui-icon aui-icon-small aui-iconfont-locked restricted');
            labelName = AJS.I18n.getText("page.restrictions.apply");
        } else if (data.hasInheritedRestrictions) {
            $restrictionsIcon.addClass('aui-icon aui-icon-small aui-iconfont-unlocked restricted');
            labelName = AJS.I18n.getText("page.restrictions.apply");
        } else {
            $restrictionsIcon.addClass('aui-icon aui-icon-small aui-iconfont-unlocked');
            labelName = data.hasAnyExplicitRestrictions ?
                AJS.I18n.getText("page.restrictions.apply") : AJS.I18n.getText("page.restrictions.none");
        }

        $restrictionsIcon.attr('title', labelName);
        applyTooltip($restrictionsIcon);

        updateSystemContentItems();
    };

    var setup = function() {
        updateSystemContentItems();

        AJS.bind("system-content-metadata.toggled-restrictions", toggledRestrictions);
        AJS.bind("breadcrumbs.expanded", hidePageBanner);

        $('#page-metadata-banner').css('visibility', 'visible');
        applyTooltips();
    };

    var teardown = function() {
        AJS.unbind("system-content-metadata.toggled-restrictions", toggledRestrictions);
        AJS.unbind("breadcrumbs.expanded", hidePageBanner);
    };

    var init = function() {
        // Actual skate component hooking onto `system-metadata-restrictions` class on webitem
        skate('system-metadata-restrictions', {
            type: skate.types.CLASS,
            events: {
                'click': function(element, eventObject) {
                    eventObject.preventDefault();
                    AJS.trigger('system-content-metadata.open-restrictions-dialog');
                }
            },
            attached: setup,
            detached: teardown
        });
    };

    init();
});

require('confluence/module-exporter').safeRequire('confluence-page-banner/page-banner');