define('confluence-search/analytics', [
    'confluence/api/event',
    'confluence/meta',
    'window',
    'jquery',
    'confluence-search/utils',
    'confluence-search/md5'
], function(
    event,
    Meta,
    window,
    $,
    SearchUtils,
    md5
) {
    "use strict";

    return function (collection) {

        // Search complete event.
        collection.on("searchComplete", function () {
            var queryParams = SearchUtils.getQueryStringParams(window.location.href);

            var queryString = queryParams.queryString || "";
            var cqlString = queryParams.cql || "";
            var startIndex = parseInt(queryParams["startIndex"] || "0");
            var sessionId = Meta.get("search-query-session-uuid") || "";

            // StartIndex > 0 means page navigation.
            if (startIndex == 0) {
                event.trigger("analyticsEvent", {
                    name: "confluence.search.SiteSearchComplete",
                    data: {
                        queryHash: queryString === "" ? "" : md5(queryString),
                        cqlHash: cqlString === "" ? "" : md5(cqlString),
                        numberOfTerms: (queryString.match(/\w+/g) || []).length,
                        numberOfDocs: collection.totalSize,
                        uuid: md5(queryString.concat(cqlString).concat(sessionId)),
                        odd: (sessionId.charCodeAt(sessionId.length - 1) & 1) == 1
                    }
                });
            }
        });

        // Search result click event.
        $(".search-results-container").on("mousedown", ".search-result-link", function () {
            var queryParams = SearchUtils.getQueryStringParams(window.location.href);

            var queryString = queryParams.queryString || "";
            var cqlString = queryParams.cql || "";
            var startIndex = parseInt(queryParams["startIndex"] || "0");
            var sessionId = Meta.get("search-query-session-uuid");

            var index = $(this).index(".search-result-link") + 1 + startIndex;

            event.trigger("analyticsEvent", {
                name: "confluence.search.SiteSearchResultClick",
                data: {
                    position: index,
                    uuid: md5(queryString.concat(cqlString).concat(sessionId)),
                    numberOfDocs: collection.totalSize,
                    pageSize: collection.pageSize
                }
            });
        });
    }
});
