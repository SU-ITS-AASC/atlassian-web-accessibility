define('confluence-search/confluence-search', [
    'confluence/api/event',
    'confluence/meta',
    'confluence-search/history',
    'confluence-search/collection/cql-results',
    'confluence-search/view/cql-filter',
    'confluence-search/view/results',
    'confluence-search/view/search',
    'confluence-search/search-controller',
    'confluence-search/utils',
    'confluence-search/analytics'
], function(
    event,
    Meta,
    History,
    CQLResultsCollection,
    CQLFilterView,
    ResultsView,
    SearchView,
    SearchController,
    SearchUtils,
    setupAnalytics
) {
    "use strict";

    return function () {

        var resultOptions = {
            startIndex: +Meta.get("search-start-index"),
            pageSize: +Meta.get("search-page-size"),
            totalSize: +Meta.get("search-total-size")
        };

        var searchView = new SearchView();
        var filterView;
        var collection;

        collection = new CQLResultsCollection(resultOptions);
        filterView = new CQLFilterView({collection: collection, searchView: searchView});

        var history = new History(collection);
        var resultsView = new ResultsView({collection: collection, history: history});

        var searchController = new SearchController(history, collection, [filterView, searchView]);

        setupAnalytics(collection);
    };
});