define('confluence-search/history', [
    'jquery',
    'window',
    'underscore',
    'backbone',
    'document',
    'confluence-search/utils'
], function(
    $,
    window,
    _,
    Backbone,
    document,
    SearchUtils
) {
    "use strict";

    /**
     * HTML5 History Controller. Uses pushstate when available other you get a full page refresh for search.
     *
     * @param collection
     * @constructor
     */
    var SearchHistory = function(collection) {
        this.collection = collection;
        this.pushedOnce = false;

        $(window).on("popstate", _.bind(this.restoreState, this));
    };

    SearchHistory.prototype = {

        search: function(params) {
            var locationUrl = SearchUtils.getSearchResultsUrl(params);

            if (SearchHistory.pushStateSupport) {
                window.history.pushState(params, document.title, locationUrl);
                this.pushedOnce = true;
                this.collection.search(params);
            } else {
                window.location.href = locationUrl;
            }

            return locationUrl;  // useful for tests
        },

        restoreState: function() {
            // ignore initial pop on chrome because it fires on page load.
            if (!this.pushedOnce) {
                return
            }

            var state = history.state;

            // get state after hitting back button after first ajax search (state is in the query params)
            if (_.isEmpty(state)) {
                state = SearchUtils.normalizeCqlParams(SearchUtils.getQueryStringParams(window.location.href));
            }

            // fire event for consumers to restore their state according to the history
            this.trigger("restoreState", _.clone(state));
            this.collection.search(state);
        }
    };

    SearchHistory.pushStateSupport = "pushState" in window.history;
    _.extend(SearchHistory.prototype, Backbone.Events);

    return SearchHistory;
});