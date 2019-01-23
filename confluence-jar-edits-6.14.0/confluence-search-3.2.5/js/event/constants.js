define('confluence-search/event/constants', [
], function(
) {
    var NAMESPACE = "CONFLUENCE_SEARCH";
    return {
        SLOW_RUNNING_SEARCH: NAMESPACE + ".SLOW_RUNNING_SEARCH",
        SEARCH_FINISHED: NAMESPACE + ".SEARCH_FINISHED"
    }
});