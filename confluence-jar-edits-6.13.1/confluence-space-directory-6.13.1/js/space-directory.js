/**
 * @module confluence-space-directory/space-directory
 */
define('confluence-space-directory/space-directory', [
    'jquery',
    'window',
    'confluence/meta',
    'confluence/legacy',
    'ajs',
    'confluence-space-directory/pagination'
], function(
    $,
    window,
    Meta,
    Confluence,
    AJS,
    pagination
) {
    "use strict";

    function SpaceDirectory() {

        var $spaceLabelItems = $("#space-directory .aui-nav li");
        var $queryTextBox = $("#space-search-query");
        var queryValue = "";

        var getSelectedSpaceCategory = function() {
            return $("#space-directory").data("selected-tab");
        };

        var getActiveTabDetails = function() {
            var activeTab = $("#space-directory .aui-nav-selected");
            return {
                type: activeTab.parent().attr("id"),
                tabName: activeTab.find("a").data("tab-name")
            };
        };

        var saveActiveTab = function() {
            window.localStorage.setItem("lastSelectedSpaceDirectoryTab", JSON.stringify(getActiveTabDetails()));
        };

        var isAllTabActive = function() {
            var activeTab = getActiveTabDetails();
            return activeTab.type == "space-system-list" && activeTab.tabName == "all";
        };

        var getLastVisitedTab = function() {
            return JSON.parse(localStorage.getItem("lastSelectedSpaceDirectoryTab"));
        };

        var setActiveTab = function (tab) {
            if (tab && tab.type && tab.tabName) {
                $("#" + tab.type + " a[data-tab-name=" + tab.tabName + "]").parent().addClass("aui-nav-selected");
            } else {
                $("#space-system-list a[data-tab-name=site]").parent().addClass("aui-nav-selected");
            }
        };

        $("#space-search-result").paginate({
            nameSpace : "space-directory",
            url : Meta.get("context-path") + "/rest/spacedirectory/1/search",
            cache: false, // Results may change for the same request
            pageUrl : Meta.get("context-path") + "/spacedirectory/view.action",
            getParams : function () {
                var userString = Meta.get("remote-user");
                var status = "current";
                var labels = [];
                var type;
                if (userString && $("#favourites-toggle").hasClass("aui-nav-selected")) {
                    labels = ["~" + userString + ":favourite", "~" + userString + ":favorite"];
                    $("#space-search-title-bar .space-search-title").text(AJS.I18n.getText("favourite.spaces"));
                }

                var selectedTeamLabel = $(".team-label.aui-nav-selected a");
                if (selectedTeamLabel.length > 0) {
                    labels.push("team:" + selectedTeamLabel.attr("data-tab-name"));
                    status = selectedTeamLabel.attr("data-status-name");
                    $("#space-search-title-bar .space-search-title").text(selectedTeamLabel.text());
                }

                if (!labels.length) {
                    var selectedTypeLabel = $(".space-type.aui-nav-selected a");
                    if (selectedTypeLabel.length > 0) {
                        type = selectedTypeLabel.attr("data-type-name");
                        status = selectedTypeLabel.attr("data-status-name");

                        $("#space-search-title-bar .space-search-title").text(selectedTypeLabel.text());
                    }

                    if (!type) {
                        $("#space-search-title-bar .space-search-title").text(AJS.I18n.getText("spaces.all"));
                    }
                }

                return {
                    query : queryValue,
                    label : labels,
                    type : type,
                    status : status
                };
            },
            pageSize: +AJS.params.pageSize,
            startIndex: 0,
            preprocess: function(listContainer) {
                $(".no-results").addClass("hidden");
                $("#aui-message-bar").empty();
            },
            insertResults : function(response, container) {
                var spaces = response.spaces;
                var noSpaces = spaces.length === 0;

                // Do not show the no results message if we're on the all tab and there is no query string.
                // In that case, we'll already be showing the blank experience panel instead.
                $(".no-results").toggleClass("hidden", (!noSpaces || (isAllTabActive() && !$queryTextBox.val())));
                $(".space-list-section").toggleClass("hidden", noSpaces);
                $("#space-directory-help").toggleClass("hidden", noSpaces);
                if ($('#space-list caption').length == 0) {
                    $('#space-list').prepend("<caption class='assistive' aria-label='Space List'>Space List</caption>");
                }

                for (var i = 0, il = spaces.length; i < il; i++) {
                    var space = spaces[i];
                    var spaceItemString = Confluence.Templates.SpaceDirectory.spaceListItem({
                        spaceKey : space.key,
                        spaceName : space.name,
                        truncatedSpaceName : space.name,
                        spaceDescHtml: space.description,
                        spaceUrl : space.link[1].href,
                        logoUrl : space.logo.href,
                        remoteUser: Meta.get("remote-user"),
                        accessMode: Meta.get("access-mode")
                    });

                    var spaceItem = $(spaceItemString);

                    container.append(spaceItem);

                    // Load in the extra details
                    var isFav = space.favourite;
                    $(".space-favourites a.aui-iconfont-star-filled", spaceItem).toggleClass("hidden", !isFav);
                    $(".space-favourites a.aui-iconfont-new-star", spaceItem).toggleClass("hidden", isFav);

                    // Load categories
                    var labels = space.labels.label;
                    if (labels.length > 0) {
                        var $labelList = $(".space-labels", spaceItem);
                        var labelsVisible = 0;
                        for (var j =0, ll = labels.length; j < ll; j++) {
                            if (labels[j].namespace === "team")
                            {
                                var labelItem = $(Confluence.Templates.SpaceDirectory.spaceLabel({spaceLabel: labels[j].name}));

                                // Only show 3 labels
                                if (labelsVisible > 2) {
                                    labelItem.addClass("hidden");
                                } else {
                                    labelsVisible++;
                                }

                                $labelList.append(labelItem);
                            }
                        }

                        if (labelsVisible > 2) {
                            $labelList.append(Confluence.Templates.SpaceDirectory.spaceLabelEllipsis());
                        }
                    }
                }

                $(".space-favourites").favourites({});
            },
            handleError: function() {
                AJS.messages.error({
                    body: AJS.I18n.getText("search.spaces.error"),
                    closeable: false
                });
            }
        });

        var updateList = function () {
            if (!$("#space-search-result").hasClass("updating-container")) {
                AJS.trigger("update-list.space-directory", {startIndex: 0});
            }
            saveActiveTab();
        };

        /**
         * CONFDEV-33536 - Confluence simplify journeys
         *
         *  - confluence.space-directory.view (server side)
         *  - confluence.space-directory.site-spaces-filter.click
         *  - confluence.space-directory.all-spaces-filter.click
         *  - confluence.space-directory.*-filter.click (personal|favourite|archived)
         *  - confluence.space-directory.category.click
         *  - confluence.space-directory.filter
         *  - confluence.space-directory.space.click
         *  - confluence.space-directory.space.category.click
         *  - confluence.space-directory.space.favourite.click (this is implemented on favourite.js - confluence-webapp/src/main/webapp/includes/js/components/binders/favourites.js)
         *  - confluence.space-directory.space.info.click
         *  - confluence.space-directory.pagination.click
         */

        var eventPrefix = "confluence.space-directory.";

        var track = function(name, data) {
            AJS.trigger('analytics', { name: eventPrefix + name, data: data || {} });
        };

        // utility function that replaces spaces by - and returns a lower case string
        var dasherize = function(text) {
            return text.toLowerCase().replace(/\s/g, '-');
        };

        $spaceLabelItems.click(function(e){
            var $this = $(this);
            e.preventDefault();
            $spaceLabelItems.removeClass('aui-nav-selected');
            $this.addClass('aui-nav-selected');
            $("#space-search-result").focus();

            updateList();

            // confluence.space-directory.*-filter.click
            // confluence.space-directory.category.click
            var filterName = dasherize($.trim($this.text()));
            var isCategory = $this.hasClass('team-label');
            var eventName = isCategory ? 'category' : filterName + '-filter';
            track(eventName + '.click', {
                category: getActiveTabDetails().tabName
            });

        });

        var $spaceList = $('#space-list');

        $spaceList.on('click', '.space-name a', function(e) {
            track('space.click');
        });

        $spaceList.on('click', '.space-label', function(e) {
            e.preventDefault();
            $spaceLabelItems.removeClass('aui-nav-selected');
            $(".team-label a[data-tab-name='" + $(this).text() + "']").parent().addClass('aui-nav-selected');
            updateList();
            $("#space-search-result").focus();

            track('space.category.click');
        });

        $spaceList.on('click', '.entity-info-icon a', function() {
            track('space.info.click');
        });


        var timer;
        $queryTextBox.keyup(function (e) {
            var queryString = $.trim($queryTextBox.val());
            if ($queryTextBox.hasClass("placeholded")) {
                queryString = "";
            }

            // Don't run the search if the string is short
            if (!(/^\S{1,2}$/).test(queryString)) {
                // Perform a partial text search
                if (queryString != "") {
                    var temp = queryString;
                    queryString = temp + " OR " + temp + "*";
                }

                if (queryValue != queryString) {
                    queryValue = queryString;
                    clearTimeout(timer);

                    timer = setTimeout(function () {
                        updateList();
                        track('filter');
                    }, 200);

                }
            }
        });

        $("#space-search-form").submit(function(e) {
            var spaceItems = $("#space-list .space-list-item");
            if (!$("#space-search-result").hasClass("updating-container") && spaceItems.length === 1) {
                window.location = $(spaceItems[0]).find(".space-name a").attr("href");
                return AJS.stopEvent(e);
            }
        });

        var selectedSpaceCategory = getSelectedSpaceCategory();
        if (selectedSpaceCategory) {
            setActiveTab({
                type: "space-labels-list",
                tabName: selectedSpaceCategory
            });
        } else {
            setActiveTab(getLastVisitedTab());
        }
        // Populate the space directory list based on the selected category tab
        updateList();
    }

    return SpaceDirectory;
});

require('confluence/module-exporter').safeRequire('confluence-space-directory/space-directory', function(SpaceDirectory) {
    require('ajs').toInit(SpaceDirectory);
});

