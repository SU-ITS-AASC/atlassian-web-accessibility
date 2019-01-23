(function($) {
    Confluence.Sidebar = {};

    AJS.toInit(function ($) {
        var $window = $(window);
        var $document = $(document);
        var defaultWidth = Math.min(285, $window.width() / 3); // Duplicated in SoySidebarHeaderContextProvider
        var minConfigureWidth = 285; // We at least 285px to stop the 'Done' and 'Add link' buttons wrapping across all browsers in German
        var collapseWidth = 150;
        var minWidth = 55;
        var maxWidth = 640;
        var sidebarStorage = AJS.storageManager('confluence', 'sidebar');
        var WIDTH_KEY = 'width';

        var contextPath = AJS.contextPath();
        var spaceKey = AJS.Meta.get('space-key');

        var splitterHandleTooltipShortcut = AJS.Meta.get('use-keyboard-shortcuts') ? " " + AJS.I18n.getText('sidebar.splitter.shortcut.help') : "";
        Confluence.Sidebar.collapseTooltip = AJS.I18n.getText('sidebar.splitter.collapse.help') + splitterHandleTooltipShortcut;
        Confluence.Sidebar.expandTooltip = AJS.I18n.getText('sidebar.splitter.expand.help') + splitterHandleTooltipShortcut;

        var $splitterPanes = $('.ia-splitter').children();
        var $splitter = $('.ia-splitter-left');

        // We currently don't load sidebar resources based on context (because there are additional conditions we need to
        // check), therefore we have this check to prevent any JS errors when this resource gets loaded but there isn't
        // actually a location in the markup for the sidebar to exist.
        if ($splitter.length < 1) {
            return;
        }

        var $sidebar = $('.acs-side-bar');
        var $fixedSidebar = $splitter.find('.ia-fixed-sidebar');
        var $splitterHandle = $('<div>', { 'class':'ia-splitter-handle tipsy-enabled', 'data-tooltip' : Confluence.Sidebar.collapseTooltip }).appendTo($fixedSidebar);
        $('<div>', { 'class': 'ia-splitter-handle-highlight confluence-icon-grab-handle' }).appendTo($splitterHandle);

        var $contextualNav = $('.ia-secondary-container');
        var $footer = $('#footer, #studio-footer');

        Confluence.Sidebar.throbberDiv = throbberDiv;

        $contextualNav.length && prepareContextualNav($contextualNav.attr('data-tree-type'));

        $window.scroll(fixSidebar);
        $window.resize(fixSidebar);
        $window.on("touchend", fixSidebar);
        $document.ready(fixSidebar);

        // Need to ensure that the sidebar is repositioned whenever the header height changes
        AJS.bind('confluence.header-resized', fixSidebar);
        $('#header-precursor img').load(fixSidebar);

        Confluence.Sidebar.applyTooltip = applyTooltip;
        applyTooltips();
        AJS.bind('sidebar.exit-configure-mode', applyTooltips);


        var storedWidth = sidebarStorage.getItem(WIDTH_KEY) || defaultWidth;
        var computedWidth = storedWidth > collapseWidth ? storedWidth : minWidth;

        setPanesWidth(computedWidth); // adds 'collapsed' class to the sidebar if necessary
        restrictScrolling(); // suppresses scroll behaviour of the page when within a scrollable section
        $fixedSidebar.css('visibility', 'visible');
        fixSidebar();
        prepareSplitterDragHandle();
        // Defer createFlyouts which are not visible on the screen till interacted with
        // Prefer not to use global underscore var to reduce dependence on the global vars
        setTimeout(function(){
            Confluence.Sidebar.createFlyouts($sidebar);
        }, 0);

        AJS.trigger('sidebar.finished-loading');    // Fire 'sidebar has been fully loaded' event

        $window.one('pagetree-children-loaded', function() {
            var $current = $('.plugin_pagetree_current');
            if ($current.length) {
                var offset = $current.offset();
                //Scroll current page approximately to a third of the sidebar height if it's not on the top half
                if(offset.top > $sidebar.height()/2) {
                    $sidebar.scrollTop(offset.top-$sidebar.height()/3);
                }
                //Scroll current page approximately to half of the sidebar width if it's not on the left half
                if(offset.left > $sidebar.width()/2) {
                    $sidebar.scrollLeft(offset.left-$sidebar.width()/2);
                }
            }
        });

        AJS.bind('sidebar.enter-configure-mode', function() {
            hideOverlays();
            setPanesWidthForConfigurationMode();
            $fixedSidebar.addClass('configure-mode');
        });
        AJS.bind('sidebar.exit-configure-mode', function() {
            hideOverlays();
            resetPanesWidthAfterConfigureMode();
            // Must wait for collapsed class to be added to sidebar (if necessary) before removing 'configure-mode'
            // so that we don't see a flash of 'Space Tools' (which has display: none when sidebar is collapsed or being configured)
            $fixedSidebar.removeClass('configure-mode');
        });

        function hideOverlays() {
            AJS.trigger('sidebar.hide-overlays');
        }

        function applyTooltip(selector, overrides) {
            var defaults = {
                live: true, // Created links are handled automatically
                gravity: 'w', // Point the arrow to the top left
                title: 'data-tooltip', // Tooltip text is specified in this attribute value
                delayIn: 500, // Can be removed once AUI-1214 is resolved
                delayOut: 0, // Can be removed once AUI-1214 is resolved
                offset: 5  // Can be removed once AUI-1214 is resolved
            };

            // We want to construct a jQuery object using the selector to guarantee that the tooltip function
            // can extract the object's selector (so that the live param will work)
            $(selector).tooltip(overrides ? $.extend(defaults, overrides) : defaults);
        }

        function applyTooltips() {
            $('.acs-side-bar .quick-links-section').attr('data-collapsed-tooltip', AJS.I18n.getText('sidebar.main.quick.links'));
            $('#space-tools-menu-trigger').attr('data-collapsed-tooltip', AJS.I18n.getText('sidebar.main.settings'));
            if ($contextualNav.attr('data-tree-type') == 'pages') {
                $('.acs-side-bar .ia-secondary-container').attr('data-collapsed-tooltip', AJS.I18n.getText('sidebar.pages.children'));
                applyTooltip('.collapsed .ia-secondary-container.tipsy-enabled', {title: 'data-collapsed-tooltip'});
            }

            applyTooltip('.expand-collapse-trigger');
            applyTooltip('.ia-splitter-handle.tipsy-enabled');
            applyTooltip(
                '.collapsed .quick-links-section.tipsy-enabled, ' +
                '.collapsed .acs-nav-item > a.tipsy-enabled, ' +
                '.collapsed #space-tools-menu-trigger.tipsy-enabled'
            , {title: 'data-collapsed-tooltip'});
            applyTooltip('.configure-mode .acs-side-bar-space-info.tipsy-enabled', {title: 'data-configure-tooltip'});

            /*
             * We may be able to remove this once CONFDEV-12362 is resolved. We additionally bind to mousedown so that:
             * (1) The tooltip disappears when the user is resizing the sidebar (click event doesn't fire until mouseup)
             * (2) The tooltip still gets hidden if anything calls stopImmediatePropagation on the click event
             */
            $sidebar.on('mousedown click scroll', hideOverlays);

            $(window).on('scroll resize', hideOverlays);

            AJS.bind('sidebar.hide-overlays', removeTooltips);
            AJS.bind('sidebar.disable-tooltip', disableTooltips);
            AJS.bind('sidebar.enable-all-tooltips', enableTooltips);

            function disableTooltips(event, trigger) {
                var $target = $(trigger).closest('.tipsy-enabled');
                if ($target.size() != 1) {
                    return;
                }
                $target
                    .removeClass('tipsy-enabled')
                    .addClass('tipsy-disabled')
                    .attr('title', '');
                var tipsyData = $target.data('tipsy');
                if (tipsyData) {
                    tipsyData.hoverState = 'out';
                }
                removeTooltips();
            }

            function enableTooltips() {
                $('.tipsy-disabled').removeClass('tipsy-disabled').addClass('tipsy-enabled');
            }

            function removeTooltips() {
                $('.tipsy').remove();
            }
        }

        function restrictScrolling() {
            $document.on('mousewheel', '.ia-scrollable-section', function (e, d) {
                var scrollTop = $(this).scrollTop();
                /* We subtract 1 to allow a bit of tolerance for any difference caused by sub-pixel rendering,
                 * this is currently necessary for this code to work in Chrome.
                 */
                var maxScroll = $(this).get(0).scrollHeight - $(this).innerHeight() - 1;

                if ((d > 0 && scrollTop <= 0) || (d < 0 && scrollTop >= maxScroll)) {
                    e.preventDefault();
                } else if ($.browser.msie) {
                    /*
                     * We must simulate scrolling in IE, because it will scroll the page as part of
                     * its default behaviour when it reaches the top or bottom of the scrollable div,
                     * and we have no way of predicting when this is going to happen when abs(delta) > 1.
                     */
                    e.preventDefault();
                    var arbitraryScrollSpeedMultiplier = 30;
                    $(this).scrollTop(scrollTop + (-1 * d * arbitraryScrollSpeedMultiplier));
                }

                e.stopPropagation();
            });
        }

        function throbberDiv() {
            var $throbberDiv = $(Confluence.Templates.Sidebar.throbber()),
                $spinnerEl = $throbberDiv.find('.spinner'),
                killSpinner = Raphael.spinner($spinnerEl[0], 10, '#666');
            $throbberDiv.find('.throbber').bind('remove', function() {
                killSpinner();
            });
            return $throbberDiv;
        }

        function prepareContextualNav(type) {
            if (type === "blogs") {
                installTreeHandlers($sidebar, makeBlogSubtreeRequest);
            } else if (type === "pages") {
                Confluence.Sidebar.Pages.installHandlers($sidebar);
            }
        }

        function makeBlogSubtreeRequest($parent, callback) {
            var groupType = $parent.attr('data-group-type');
            var groupValue = $parent.attr('data-group-value');
            var subtreeUrl = contextPath + '/rest/ia/1.0/pagetree/blog/subtree';
            $.get(subtreeUrl, {spaceKey:spaceKey, groupType:groupType, groupValue:groupValue}).done(callback);
        }

        function installTreeHandlers($sidebar, makeSubtreeRequest) {
            $sidebar.delegate('.acs-tree-item > .icon, .acs-tree-item > .node-title', 'click', function () {
                var $this = $(this);
                var $parent = $this.parent();
                var $icon = $parent.find('> .icon');
                if ($parent.hasClass('opened')) {
                    $parent.children('ul').hide();
                    $parent.removeClass('opened').addClass('closed');
                    $icon.removeClass('aui-iconfont-expanded').addClass('aui-iconfont-collapsed');
                } else if ($parent.hasClass('closed')) {
                    var $subtree = $parent.children('ul');
                    if ($subtree.length) {
                        $subtree.show();
                    } else {
                        var $throbber = $(Confluence.Templates.Sidebar.treeThrobber());
                        $parent.append($throbber);
                        makeSubtreeRequest($parent, function (data) {
                            var $subtree = $(Confluence.Templates.Sidebar.pagetreeList({pagetree:data, isSubtree:true}));
                            $throbber.remove();
                            $subtree.appendTo($parent);
                        })
                    }
                    $parent.removeClass('closed').addClass('opened');
                    $icon.removeClass('aui-iconfont-collapsed').addClass('aui-iconfont-expanded');
                }
            });
        }

        function fixSidebar() {
            var maxScroll = $splitter.offset().top, // can't cache as the header may wrap upon vertical resizing
                scrollTop = $window.scrollTop(),
                scrollLeft = $window.scrollLeft();

            // Prevent any weirdness when elastic scrolling is being used (e.g. Mac)
            if (scrollTop < 0)
                return; // Scrolled upwards or left past the end of the document
            if (scrollTop > ($document.height() - $window.height()))
                return; // Scrolled downwards past the end of the document
            if (scrollLeft < 0)
                return; // Scrolled towards the left past the leftmost edge of the document
            if (scrollLeft > ($document.width() - $window.width()))
                return; // Scrolled towards the right past the rightmost edge of the document

            if ($('#header').css('position') !== 'fixed') {
                $fixedSidebar.css({
                    'top': Math.max(maxScroll - scrollTop, 0) + 'px',
                    'left': Math.min(scrollLeft * -1, 0) + 'px'
                });
            } else {
                $fixedSidebar.css({
                    'left': Math.min(scrollLeft * -1, 0) + 'px'
                });
            }
        }

        function fixFooter() {
            $footer.css('margin-left', $fixedSidebar.outerWidth() + 'px');
        }

        function prepareSplitterDragHandle() {
            var $body = $('body');
            var moved = false;
            var dragging = false;
            var sidebarDrag = function (evt) {
                dragging = true;

                // prevent content selection when dragging
                evt.preventDefault();
                $splitterPanes.one('selectstart', function (evt) {
                    evt.preventDefault();
                });

                var mouseupHandler = function () {
                    if ($fixedSidebar.width() <= collapseWidth) {
                        setPanesWidth(minWidth);
                    } else {
                        defaultWidth = $fixedSidebar.width();
                    }
                    dragging = false;
                    $body.off('mousemove.ia-splitter');
                };

                moved = false;
                $body.on('mousemove.ia-splitter',function (evt) {
                    if (Confluence.Sidebar.Configure.mode && evt.pageX < minConfigureWidth) {
                        return;
                    }

                    setPanesWidth(evt.pageX);
                    moved = true;
                });
                $body.one('mouseup mouseleave', mouseupHandler);
            };

            $splitterHandle
                .on('mousedown.ia-splitter', function(evt) {
                    sidebarDrag(evt);
                    hideOverlays();
                })
                .click(function() {
                    /**
                     * We need a click handler as it's the easiest way to get the tooltip working with the whenitype
                     * infrastructure. However, a click will be triggered at the end of a drag, after the mouseup.
                     * By checking the moved flag we can ignore the 'click' if the splitter has been... moved.
                     */
                    if (!moved)
                        toggle();
                    else {
                        /**
                         * We need to reset the moved state at the VERY END of the mouse operation, which will be here - the
                         * click will trigger after the mousemove and the mouseup.
                         */
                        moved = false;
                    }
                });

            Confluence.Sidebar.toggle = toggle;
            function toggle(){
                if (Confluence.Sidebar.Configure.mode) {
                    return;
                }
                var currentWidth = $fixedSidebar.width();
                if (currentWidth > minWidth) {
                    if (currentWidth <= collapseWidth) {
                        /*
                            CONFDEV-17172 - we somehow got into a state where the width of the sidebar is within
                            the range where it should have been collapsed to minWidth (55px). Instead of storing
                            the current width of the sidebar in the defaultWidth variable, we'd better revert to
                            something safe, to prevent the situation where toggle() fails to expand the sidebar.
                         */
                        defaultWidth = minConfigureWidth;
                        setPanesWidth(defaultWidth);
                    } else {
                        defaultWidth = currentWidth;
                        setPanesWidth(minWidth);
                    }
                } else {
                    setPanesWidth(defaultWidth);
                }
            }
        }

        function setPanesWidth(width) {
            width = Math.max(width, minWidth);
            width = Math.min(width, maxWidth);

            sidebarStorage.setItemQuietly(WIDTH_KEY, width);

            if (width <= collapseWidth){
                $fixedSidebar.addClass('collapsed');
                $('.expand-collapse-trigger').removeClass('aui-iconfont-chevron-double-left').addClass('aui-iconfont-chevron-double-right');
                $splitterHandle.attr('data-tooltip', Confluence.Sidebar.expandTooltip);
                AJS.trigger('sidebar.collapsed');
            } else {
                if ($fixedSidebar.hasClass('collapsed')){
                    $fixedSidebar.removeClass('collapsed');
                    $splitterHandle.attr('data-tooltip', Confluence.Sidebar.collapseTooltip);
                    $('.expand-collapse-trigger').removeClass('aui-iconfont-chevron-double-right').addClass('aui-iconfont-chevron-double-left');
                    AJS.trigger('sidebar.expanded');
                }
            }
            $fixedSidebar.width(width);
            $splitterPanes.eq(1).css('margin-left', width + 'px');
            fixFooter();
        }

        function setPanesWidthForConfigurationMode() {
            if ($fixedSidebar.width() < minConfigureWidth) {
                Confluence.Sidebar.widthBeforeConfiguring = $fixedSidebar.width();
                setPanesWidth(minConfigureWidth);
            }
        }

        function resetPanesWidthAfterConfigureMode() {
            if (Confluence.Sidebar.widthBeforeConfiguring) {
                setPanesWidth(Confluence.Sidebar.widthBeforeConfiguring);
                Confluence.Sidebar.widthBeforeConfiguring = undefined;
            }
        }
    });
})(AJS.$);
