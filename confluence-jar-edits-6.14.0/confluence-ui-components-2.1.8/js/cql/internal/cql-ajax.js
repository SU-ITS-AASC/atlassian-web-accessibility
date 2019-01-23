define('confluence-ui-components/js/cql/internal/cql-ajax',
    [
        'jquery',
        'underscore',
        'ajs'
    ],
    /**
     * Handles server requests for CQL UI operations.
     */
    function ($,
              _,
              AJS) {

        'use strict';

        // CQL field definitions Deferred object. Cached to avoid unnecessary lookups, as it shouldn't change during a single
        // page view.
        var fieldsDeferred;

        /**
         * Retrieves CQL field definitions, made available via a jQuery Deferred that is resolved when the definitions are
         * available.
         */
        function getFields() {
            if (!fieldsDeferred) {
                // We wrap the AJAX call for the fields in a custom Deferred that lets us filter the results that are
                // passed to the listening code.
                fieldsDeferred = $.Deferred();

                var resolveFields = function (fieldMap) {
                    var fieldArrays = _.values(fieldMap);
                    if (!fieldArrays.length) {
                        // TODO - CRA-439 AJAX errors need love too.
                        throw Error("Unknown CQL field data returned from server - cannot initialise CQL fields.");
                    }

                    var fields = _.union.apply(_, fieldArrays);
                    fields = _.sortBy(fields, 'fieldName');

                    fieldsDeferred.resolve(fields);
                };
                var rejectFields = function () {
                    fieldsDeferred.reject();
                };

                $.getJSON(AJS.contextPath() + "/rest/cql/fields?filter=withUiSupport")
                    .done(resolveFields)
                    .fail(rejectFields);
            }
            return fieldsDeferred.promise();
        }

        /**
         * Parses expressions out of CQL, returning a list of fields and values.
         */
        function parseClauses(cql) {
            return $.getJSON(AJS.contextPath() + "/rest/cql/expressions?cql=" + encodeURIComponent(cql));
        }

        /**
         * Returns a list of content types available for CQL searches.
         */
        function getContentTypes() {
            return $.getJSON(AJS.contextPath() + "/rest/cql/contenttypes?category=content");
        }

        /**
         * Returns a list of all types available for CQL searches, including non-content types such as Spaces and Users.
         */
        function getTypes() {
            return $.getJSON(AJS.contextPath() + "/rest/cql/contenttypes?category=all");
        }

        return {
            getFields: getFields,
            parseClauses: parseClauses,
            getTypes: getTypes,
            getContentTypes: getContentTypes
        };
    });