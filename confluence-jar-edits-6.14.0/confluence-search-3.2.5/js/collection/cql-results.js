define("confluence-search/collection/cql-results",[
    'confluence-search/model/result',
    'confluence-search/utils',
    'ajs',
    'backbone',
    'underscore',
    'confluence/meta'
], function(
    ResultModel,
    searchUtils,
    AJS,
    Backbone,
    _,
    Meta
) {
    "use strict";

    return Backbone.Collection.extend({

        // search meta data
        totalSize: null,
        timeSpent: null,
        startIndex: null,
        pageSize: null,
        uuid: null,

        model: ResultModel,

        url: AJS.contextPath() + '/rest/searchv3/1.0/cqlSearch',

        initialize: function (options) {
            _.extend(this, options);
        },

        parse: function (response, options) {
            this.totalSize = response.totalSize;
            this.timeSpent = response.searchDuration;
            this.archivedResultsCount = response.archivedResultsCount;
            this.querySuggestion = response.querySuggestion;
            this.uuid = response.uuid;
            return response.results;
        },

        search: function (params) {
            var searchError = _.bind(this.trigger, this, "searchComplete searchError", this, params);
            var searchUnauthorized = _.bind(this.trigger, this, "searchComplete searchUnauthorized", this, params);
            var searchMissingQuery = _.bind(this.trigger, this, "searchComplete searchMissingQuery", this, params);
            var searchTimeoutError = _.bind(this.trigger, this, "searchComplete searchTimeout", this, params);


            var requestData = this._generateRequestData(params);
            if (!requestData.cql) {
                searchMissingQuery();
                return;
            }

            this.fetch({
                data: requestData,
                success: _.bind(this.trigger, this, "searchComplete searchSuccess", this, params),
                statusCode: {
                    400: searchError,
                    401: searchUnauthorized,
                    408: searchTimeoutError,
                    500: searchError
                },
                timeout: params.searchTimeoutMillis || 300000
            });

            this.trigger("search", params);
        },

        _generateRequestData: function(params) {
            // Make sure we always have a startIndex and it's a number, and includeArchivedSpaces and it's a boolean
            var start = +params.startIndex || 0;
            var includeArchivedSpaces = Boolean(params.includeArchivedSpaces);

            // add authenticated username to payload
            var requestData = {
                user: searchUtils.getRemoteUsername(),
                sessionUuid: Meta.get("search-query-session-uuid"),

                cql: params.cql,
                start: start,
                limit: 10,
                excerpt: 'highlight',
                includeArchivedSpaces: includeArchivedSpaces
            };
            return requestData;
        }
    });
});