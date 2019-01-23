AJS.$(function() {
    Confluence.Sidebar.Configure = {
        // mode is true when the sidebar is being configured
        mode:false
    };
    var $ = AJS.$,
        contextPath = AJS.Meta.get('context-path'),
        spaceKey = AJS.Meta.get('space-key'),
        $sidebar = $('.acs-side-bar'),
        $secondaryNav = $sidebar.find('.ia-secondary-container'),
        $throbber,
        $container,
        currentCollectorKey,
        navType,
        $navOptions = $('.acs-nav'),
        navRefresh = false;

    // We don't want to see a cached set of links (e.g. when using IE9) after we've made some edits
    $.ajaxSetup({cache:false});

    $('body').on('click', '#acs-configure-link, a.configure-sidebar', function(e) {
        e.preventDefault();
        enterConfigureMode();
    });

    $('#space-favourite-remove').on('click', function() {
        toggleFavouriteSpace("remove");
    });

    $('#space-favourite-add').on('click', function() {
        toggleFavouriteSpace("add");
    });

    function toggleFavouriteSpace(state) {
        var ajaxType;
        var analyticsEvent;

        var $favouriteContainer = $('.space-information-container .favourite-space-icon');
        $favouriteContainer.addClass('disabled');

        if (state === "add") {
            ajaxType = "PUT";
            analyticsEvent = 'confluence.space-sidebar.favourite.click';
        } else {
            ajaxType = "DELETE";
            analyticsEvent = 'confluence.space-sidebar.favourite-remove.click';
        }

        $.ajax({
            url: contextPath + "/rest/experimental/relation/user/current/favourite/toSpace/" + spaceKey,
            type: ajaxType,
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({spaceKey: spaceKey})
        }).done(function() {
            var $addFavouriteStar = $('#space-favourite-add');
            var $removeFavouriteStar = $('#space-favourite-remove');
            if (state === "add") {
                $addFavouriteStar.prop("data-favourited", "true");
                $removeFavouriteStar.show();
                $addFavouriteStar.hide();
            } else {
                $addFavouriteStar.prop("data-favourited", "false");
                $addFavouriteStar.show();
                $removeFavouriteStar.hide();
            }
        }).fail(function(jqXhr) {
            var MessageController = require("confluence/message-controller");
            MessageController.showError(MessageController.parseError(jqXhr), MessageController.Location.FLAG);
        }).always(function() {
            $favouriteContainer.removeClass('disabled');
        });

        AJS.trigger('analyticsEvent', {name: analyticsEvent});
    }

    function enterConfigureMode() {
        AJS.trigger('sidebar-before-enter-configure-mode');

        var $customSidebarContent = $('.custom-sidebar-content');
        var hasSidebarCustomisation = $customSidebarContent.length;
        var sidebarCustomisation;
        var adminLink;
        if (hasSidebarCustomisation) {
            adminLink = contextPath + '/spaces/custompagecontent.action?key=' + spaceKey;
            sidebarCustomisation = $customSidebarContent.children().html();
        }

        navType = $navOptions.data('nav-type');
        Confluence.Sidebar.Configure.mode = true;
        currentCollectorKey = $('.acs-nav-sections .acs-nav-item.current-item').data('collector-key');

        // Replace DOM elements
        $throbber = Confluence.Sidebar.throbberDiv();
        var $navSections = $('.acs-nav-sections');
        $throbber.height($navSections.height());
        $secondaryNav.hide();
        $navSections.replaceWith($throbber);
        var sidebarConfigs = Confluence.Templates.Sidebar.configure({
            pageTree: navType === "page-tree",
            quickLinksState: $navOptions.data('quick-links-state'),
            pageTreeState: $navOptions.data('page-tree-state'),
            hasSidebarCustomisation: hasSidebarCustomisation,
            customContentAdminLink: adminLink,
            sidebarCustomisation: sidebarCustomisation,
            accessMode: AJS.Meta.get('access-mode')
        });
        $container = $(sidebarConfigs).hide();
        $throbber.after($container);

        prepareLinkBrowser();
        prepareQuickLinksSection();
        restfulTablesInit();

        // Show configuration view
        var loaded = {};
        var finishedLoading = function () {
            $throbber.replaceWith($container);
            $container.show();
        };

        $('#acs-nav-list-main').one(AJS.RestfulTable.Events.INITIALIZED, function () {
            loaded.main = true;
            loaded.quick && finishedLoading();
        });

        $('#acs-nav-list-quick').one(AJS.RestfulTable.Events.INITIALIZED, function () {
            loaded.quick = true;
            loaded.main && finishedLoading();
        });

        $('.acs-nav-type').change(function(e){
            setSidebarOption("nav-type", $(this).val(), function(value){
                $secondaryNav.data('tree-type', value);
                $navOptions.data('nav-type', value);
            });
        });

        $('.acs-done-link').click(function (e) {
            e.preventDefault();
            $('.acs-done-link').attr("aria-disabled", true).prop("disabled", true);
            exitConfigureMode();
        });

        $('.quick-links-header a').click(function (e) {
            e.preventDefault();
            var newState = $navOptions.data('quick-links-state') === "hide" ? "show" : "hide";
            setSidebarOption("quick-links-state", newState, toggleSidebarQuickLinks);
        });

        $('.page-tree-header a').click(function (e) {
            e.preventDefault();
            var newState = $navOptions.data('page-tree-state') === "hide" ? "show" : "hide";
            var navRadioOptions = $('.acs-nav-type');
            if (newState === "show") {
                navRadioOptions.attr('disabled', false);
            } else {
                navRadioOptions.attr('disabled', true);
            }
            setSidebarOption("page-tree-state", newState, toggleSidebarPageTree);
        });

        AJS.$('.acs-side-bar-space-info').on('click.configurelogo', loadLogoConfiguration);
        AJS.trigger('sidebar.enter-configure-mode');
    }

    function loadLogoConfiguration(e) {
        var $spinnerEl = AJS.$(".acs-side-bar-space-info > .flyout-handle");
        $spinnerEl.addClass("loading").spin();

        var deferred = WRM.require("wr!com.atlassian.confluence.plugins.confluence-space-ia:avatar-picker", function() {
            AJS.trigger("deferred.spaceia.open.configure.space");
        });

        deferred.always(function() {
            $spinnerEl.removeClass("loading").spinStop();
        });

        e.preventDefault();
    }

    function setSidebarOption(option, value, callback) {
        $.ajax({
            url: contextPath + "/rest/ia/1.0/space/option",
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({spaceKey: spaceKey, option: option, value: value}),
            success: function (xhr) {
                callback(value);
            }
        });
    }

    function exitConfigureMode() {
        if(navType !== $navOptions.data('nav-type') || navRefresh === true) {
            location.reload();
            navRefresh = false;
            return;
        }

        var $customSidebarContent = $('.custom-sidebar-content');
        var hasSidebarCustomisation = $customSidebarContent.length;
        var sidebarCustomisation;

        if (hasSidebarCustomisation) {
            sidebarCustomisation = $customSidebarContent.children().html();
        }

        // Replace DOM elements
        $throbber = Confluence.Sidebar.throbberDiv();
        $throbber.height($container.height());
        $container.replaceWith($throbber);

        restfulTablesCleanup();

        $secondaryNav.show().css('display', ''); // JQuery adds style that overrides 'display: none' when sidebar is collapsed

        // Fetch and populate sidebar links
        var populateLinks = function () {
            var $renderedLinks = $(Confluence.Templates.Sidebar.renderLinks({
                mainLinks:fetchedLinks['main'],
                quickLinks:fetchedLinks['quick'].reverse(),
                advancedLinks:fetchedLinks['advanced'],
                hasConfigurePermission:true,
                collectorToHighlight:currentCollectorKey,
                quickLinksState: $navOptions.data('quick-links-state'),
                hasSidebarCustomisation: hasSidebarCustomisation,
                sidebarCustomisation: sidebarCustomisation
            }));
            $throbber.replaceWith($renderedLinks);
            Confluence.Sidebar.Configure.mode = false;
            AJS.trigger('sidebar.exit-configure-mode');
        };
        var fetchedLinks = {};
        $.get(contextPath + "/rest/ia/1.0/link/main", {spaceKey:spaceKey, includeHidden:false}).done(function (data) {
            fetchedLinks.main = data;
            fetchedLinks.quick && fetchedLinks.advanced && populateLinks();
        });
        $.get(contextPath + "/rest/ia/1.0/link/quick", {spaceKey:spaceKey}).done(function (data) {
            fetchedLinks.quick = data;
            fetchedLinks.main && fetchedLinks.advanced && populateLinks();
        });
        $.get(contextPath + "/rest/ia/1.0/link/advanced", {spaceKey:spaceKey}).done(function (data) {
            fetchedLinks.advanced = data;
            fetchedLinks.main && fetchedLinks.quick && populateLinks();
        });

        //unbind logo configuration
        Confluence.Sidebar.Configure.Logo && Confluence.Sidebar.Configure.Logo.unbind();
    }

    function prepareLinkBrowser() {
        WRM.require("wr!com.atlassian.confluence.plugins.confluence-space-ia:link-dialog", function() {
            var linkBrowserAvailable = new $.Deferred(); // no need to use promise as all of this code is privileged
            $('.acs-add-link')
                .click(function (e) {
                    linkBrowserAvailable.done(function () {
                        e.preventDefault();
                        if ($navOptions.data('quick-links-state') !== "hide") {
                            Confluence.Sidebar.LinkAdapter.hijackLinkBrowser();
                            Confluence.Editor.LinkBrowser.open();
                            $('#recentlyviewed-panel-id').click();
                        }
                    });
                })
                .addClass('acs-add-link-ready');
            // ensure we are in a space before trying to load the editor otherwise load the link browser directly
            if (AJS.Meta.get('space-key')) {
                AJS.Confluence.EditorLoader.load(function () {
                    linkBrowserAvailable.resolve();
                }, function () {
                    //editor load failed
                    AJS.log('Attempted to load editor for space ia side bar. Loading the editor failed.');
                    linkBrowserAvailable.reject();
                });
            } else {
                linkBrowserAvailable.resolve();
            }
        });
    }

    function prepareQuickLinksSection() {
        var $quickLinks = $('#acs-nav-list-quick');
        var $tip = $('.acs-nav-sections .tip').hide();

        var updateQuickLinksSection = function () {
            if (Confluence.Sidebar.Configure.QuickLinks.isEmpty()) {
                $quickLinks.hide(); //If it is not hidden there's extra space
                $tip.show();
            } else {
                $tip.hide();
                $quickLinks.show();
            }
        };
        AJS.bindEvt(AJS.RestfulTable.Events.INITIALIZED, updateQuickLinksSection);
        AJS.bindEvt(AJS.RestfulTable.Events.ROW_ADDED, updateQuickLinksSection);
        AJS.bindEvt(AJS.RestfulTable.Events.ROW_REMOVED, updateQuickLinksSection);
    }

    function restfulTablesInit() {
        Confluence.Sidebar.Configure.MainLinks = new AJS.Confluence.ConfigurableNav({
            $el:$('#acs-nav-list-main'),
            resources:{
                all:contextPath + "/rest/ia/1.0/link/main?spaceKey=" + spaceKey + "&includeHidden=true",
                self:contextPath + "/rest/ia/1.0/link"
            }
        });
        Confluence.Sidebar.Configure.QuickLinks = new AJS.Confluence.ConfigurableNav({
            $el:$('#acs-nav-list-quick'),
            resources:{
                all:contextPath + "/rest/ia/1.0/link/quick?spaceKey=" + spaceKey,
                self:contextPath + "/rest/ia/1.0/link"
            },
            reverseOrder:true
        });
    }

    function restfulTablesCleanup() {
        Confluence.Sidebar.Configure.MainLinks.remove();
        Confluence.Sidebar.Configure.MainLinks.unbind();

        Confluence.Sidebar.Configure.QuickLinks.remove();
        Confluence.Sidebar.Configure.QuickLinks.unbind();

        $(AJS).unbind(AJS.RestfulTable.Events.INITIALIZED);
        $(AJS).unbind(AJS.RestfulTable.Events.ROW_ADDED);
        $(AJS).unbind(AJS.RestfulTable.Events.ROW_REMOVED);
    }

    function toggleSidebarQuickLinks(state) {
        $navOptions.data('quick-links-state', state);

        if (state === "hide") {
            $('.acs-nav-list-quick-section').addClass('hidden-section');
            $('.quick-links-header a').removeClass('aui-iconfont-plan-disabled').addClass('aui-iconfont-add-circle');

        } else {
            $('.acs-nav-list-quick-section').removeClass('hidden-section');
            $('.quick-links-header a').removeClass('aui-iconfont-add-circle').addClass('aui-iconfont-plan-disabled');
        }
    }

    function toggleSidebarPageTree(state) {
        $navOptions.data('page-tree-state', state);
        //we use this so we don't reload every time someone enters the configure screen
        navRefresh = true;

        if (state === "hide") {
            $('.acs-nav-list-page-tree-section').addClass('hidden-section');
            $('.page-tree-header a').removeClass('aui-iconfont-plan-disabled').addClass('aui-iconfont-add-circle');
        } else {
            $('.acs-nav-list-page-tree-section').removeClass('hidden-section');
            $('.page-tree-header a').removeClass('aui-iconfont-add-circle').addClass('aui-iconfont-plan-disabled');
        }
    }
});