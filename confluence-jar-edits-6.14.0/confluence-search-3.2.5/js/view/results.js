define('confluence-search/view/results', [
    'confluence/dark-features',
    'confluence-search/utils',
    'confluence-search/history',
    'confluence-search/event/dispatcher',
    'confluence-search/event/constants',
    'ajs',
    'window',
    'backbone',
    'confluence/templates',
    'underscore'
], function(
    DarkFeatures,
    SearchUtils,
    SearchHistory,
    dispatcher,
    EVENT_CONSTANTS,
    AJS,
    window,
    Backbone,
    Templates,
    _
) {
    "use strict";

    return Backbone.View.extend({

        el: ".search-results-wrapper",

        events: {
            "click .pagination a": "clickPagination"
        },

        initialize: function () {
            this.searchResults = this.$(".search-results-container");
            this.pagination = this.$(".pagination-container");
            this.$searchBlanket = this.$(".search-blanket");

            // reload handler for search error
            this.searchResults.on("click", ".search-error", function () {
                window.location.reload();
            });

            // always clean up when search returns
            this.collection.on("searchComplete", function () {
                this.stopLoading();
                this.pagination.empty();
            }, this);

            // render on success
            this.collection.bind("searchSuccess", this.render, this);

            // search error
            this.collection.on("searchError", function (that, params, xhr) {
                var render;
                var jsonResponse = JSON.parse(xhr.responseText);
                var errorMessage = jsonResponse.message;
                render = Templates.CQLSearch.searchError({
                    errorMessage: errorMessage
                });
                this.searchResults.html(render);
            }, this);

            // search error
            this.collection.on("searchTimeout", function () {
                this.searchResults.html(Templates.Search.searchTimeout());
            }, this);

            // search error
            this.collection.on("searchUnauthorized", function () {
                this.searchResults.html(Templates.CQLSearch.searchUnauthorized());
            }, this);

            // search error
            this.collection.on("searchMissingQuery", function () {
                this.searchResults.html(Templates.CQLSearch.searchMissingQuery());
            }, this);

            this.collection.on("search", function () {
                this.startLoading();
            }, this);
        },

        render: function (collection, params) {
            var escapeAndHtmlHighlight = function (obj, fields) {
                var newObj = _.clone(obj); //shallow copy
                _.each(fields, function (field) {
                    var orig = newObj[field];
                    if (orig) {
                        var upd = AJS.escapeHtml(orig);
                        upd = upd.replace(/@@@hl@@@/g, "<strong>");
                        upd = upd.replace(/@@@endhl@@@/g, "</strong>");
                        newObj[field] = upd;
                    }
                });
                return newObj;
            };

            var htmlHighlight = function (obj, fields) {
                var newObj = _.clone(obj); //shallow copy
                _.each(fields, function (field) {
                    var orig = newObj[field];
                    if (orig) {
                        var upd = orig.replace(/@@@hl@@@/g, "<strong>");
                        upd = upd.replace(/@@@endhl@@@/g, "</strong>");
                        newObj[field] = upd;
                    }
                });
                return newObj;
            };

            var highlight = function (result) {
                return htmlHighlight(result, ["excerpt", "title"]);
            };

            var results = {
                searchResults: _.map(collection.toJSON(), highlight),
                pageSize: collection.pageSize,
                totalSize: collection.totalSize,
                timeSpent: collection.timeSpent,
                startIndex: +(params.startIndex || 0),
                queryString: params.queryString || ""
            };

            this.searchResults.html(Templates.CQLSearch.searchResults(results));

            if (collection.totalSize === 0) {
                this.searchResults.html(Templates.CQLSearch.noSearchResults({
                    queryString: params.queryString || "",
                    archivedResultsCount: +collection.archivedResultsCount
                }));
            } else if (collection.totalSize > collection.pageSize) {
                var params = _.omit(params, "startIndex");
                this.pagination.html(Templates.Pagination.pagination(_.extend({}, results, {
                    url: SearchUtils.getSearchResultsUrl(params) + "&"
                })));
            }
        },

        startLoading: function () {
            this.$searchBlanket.show();
            // show loading spinner if search didn't return within 600ms.
            this.loadingTimerId = window.setTimeout(function() {
                dispatcher.trigger(EVENT_CONSTANTS.SLOW_RUNNING_SEARCH);
            }, 600);
        },

        stopLoading: function () {
            window.clearTimeout(this.loadingTimerId);
            dispatcher.trigger(EVENT_CONSTANTS.SEARCH_FINISHED);
            this.$searchBlanket.fadeOut("fast");
            window.scrollTo(0, 0);
        },

        clickPagination: function (e) {
            // avoid page reload on push state enabled browsers
            if (SearchHistory.pushStateSupport) {
                e.preventDefault();
                var $a = this.$(e.currentTarget);
                var params = SearchUtils.getQueryStringParams($a.attr("href"));
                this.options.history.search(params);
            }
        }
    });
});