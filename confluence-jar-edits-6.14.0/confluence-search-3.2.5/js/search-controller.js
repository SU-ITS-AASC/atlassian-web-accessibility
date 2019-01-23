define('confluence-search/search-controller', [
    'confluence/meta',
    'underscore',
    'confluence-search/utils'
], function(
    Meta,
    _,
    SearchUtils
) {
    "use strict";

    /**
     * Controller that handles the synchronization between multiple search views and the underlying collection.
     *
     * If one view wants to issue a search the controller asks all search views for their search params and then tells
     * the app to search for the sum all of terms.
     *
     * Any view that is to be controlled by this class needs to implement the following "interface":
     * - Object getParams() - Returns the params for this search as key/value pairs
     * - void disableInputs() - Disables the search inputs during search
     * - void enableInputs() - Enables the search inputs after search
     * - void restoreState(Object) - Restores the state of the search controls according to the key/value pairs in Object
     *
     * @param history
     * @param collection
     * @param views
     * @constructor
     */
    return function (history, collection, views) {

        var Search = {};

        /**
         * Get search params from all views and issue search.
         */
        Search._search = function () {
            var params = _.reduce(views, function (memo, view) {
                var viewParams = view.getParams();
                return _.extend(memo, viewParams);
            }, {});

            // we want to combine the queryString param from the search string view
            // with the cql param added from the CQL sidebar view.
            params = SearchUtils.normalizeCqlParams(params);

            history.search(params);

        };

        Search._disableInputs = function () {
            _.invoke(views, "disableInputs");
        };

        // when views trigger a search event, the controller performs the search against the collection
        _.each(views, function (view) {
            view.on("search", Search._search);
        });

        // enable/disable search input on all search views during search
        collection.on("search", Search._disableInputs);

        collection.on("searchComplete", function (results) {
            Meta.set("search-query-uuid", results.uuid);
        });

        collection.on("searchComplete searchError", function () {
            _.invoke(views, "enableInputs");
        });

        // delegate restoreState events to the views
        history.on("restoreState", function (state) {
            _.invoke(views, "restoreState", state);
        });

        return Search;
    };
});