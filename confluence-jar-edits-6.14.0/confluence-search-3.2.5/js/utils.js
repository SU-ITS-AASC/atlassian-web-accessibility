define('confluence-search/utils', [
    'jquery',
    'confluence/meta',
    'ajs',
    'underscore',
    'window'
], function (
    $,
    Meta,
    AJS,
    _,
    window
) {
    "use strict";

    /**
     * Encodes for URI but allows spaces to be represented as '+' instead of '%20' - just for looks!
     */
    function encodeURIComponentPlus(str) {
        var result = window.encodeURIComponent(str);
        return result.replace(/%20/g, '+');
    }

    return {
        getFormParams: function ($form) {
            var params = {};
            $.each($form.serializeArray(), function (key, param) {

                if (!param.value.length) {
                    return true;
                }

                params[param.name] = param.value;
            });
            return params;
        },

        getQueryStringParams: function (url) {
            var query = $("<a />", {href: url}).prop("search");
            var regex = /[?&;]*(.*?)=([^&;]*)/g;
            var match;
            var params = {};

            if (query) {
                while (match = regex.exec(query)) {
                    params[match[1]] = window.decodeURIComponent(match[2]).replace(/\+/g, " ");
                }
            }

            return params;
        },

        getSearchResultsUrl: function (queryString) {
            if (_.isObject(queryString)) {
                queryString = this.serializeParams(queryString);
            }

            // remove leading question mark
            queryString = queryString.replace(/^\?/, "");

            // Remove empty params to not pollute URL.
            queryString = queryString.replace(/(&|\?)[^=]+=(?=&|$)/g, "");

            return AJS.contextPath() + "/dosearchsite.action?" + queryString;
        },

        serializeParams: function (data) {
            var pairs = function (obj) {
                var pairs = [];
                for (var key in obj) if (_.has(obj, key)) { pairs.push([key, obj[key]]); }
                return pairs;
            };

            return _.map(pairs(data), function (pair) {
                return _.map(pair, encodeURIComponentPlus).join("=");
            }).join("&");
        },
        /**
         * Normalizes the given params with the cql query parameters, if it doesn't have a cql parameter.
         * @param params an object containing potentially a 'queryString' parameter.
         * @returns If it does, this method will append a 'cql' property,or create a new 'cql' property if it didn't exist.
         */
        normalizeCqlParams: function(params) {
            if (params.queryString) {
                var originalCql = params.cql;
                var queryString = params.queryString.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
                params.cql = 'siteSearch ~ "' + queryString + '"';
                if (originalCql) {
                    params.cql = params.cql + " and " + originalCql;
                }
                // NOTE: we require the queryString to be maintained in the state for use with history, see
                // search.js restoreState() where the queryString field in params matches the queryString name of the
                // input element.
            }
            return params;
        },
        getRemoteUsername: function () {
            return Meta.get("remote-user") || "";
        }
    };
});