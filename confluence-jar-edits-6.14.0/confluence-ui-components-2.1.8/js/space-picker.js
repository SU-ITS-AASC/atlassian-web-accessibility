define('confluence-ui-components/js/space-picker',
    [
        'underscore',
        'ajs',
        'jquery',
        'confluence-ui-components/js/internal/space-resolver'
    ],
    /**
     * A generic, reusable space picker component. The component itself is just select2 (http://ivaynberg.github.io/select2/)
     * with a custom query/initSelection/placeholder properties. You can customize the component in the same way as you could
     * customize a standard select2.
     *
     * The default behaviour shows suggested (= recent) spaces when you open the picker, and starts to ajax search for spaces
     * that you have view permission for when you start to type.
     *
     * Caveats:
     * This thing is unfinished and doesn't work for every case yet. For example, you cannot only search for spaces that you have
     * edit permission for. By default, it will show all spaces that you have view permission for.
     *
     * Other issues:
     * - Search results don't paginate, for now it will display 25 hits for each term and that's it
     *
     * Discussion:
     * https://pug.jira.com/wiki/display/CONFDEV/Draft+for+Generic+Space+Picker
     *
     * Usage:
     *
     * Minimum case: $("#space-search").auiSelect2(require('confluence-ui-components/js/space-picker').build());
     *
     * If you want to customize the behaviour of the picker or the underlying select2 create an options object
     * that has the configuration of the space picker and additional options for select2.
     *
     * var options = _.extend(require('confluence-ui-components/js/space-picker').build(), {
 *   allowClear: true,
 *   placeholder: "my-placeholder"
 * });
     *
     * $("#space-search").auiSelect2(options);
     *
     *
     * If you want to use local data instead of the rest endpoint, use the data option:
     *
     * $("#space-search").auiSelect2(require('confluence-ui-components/js/space-picker').build({
 *  data: [
 *    { id: "FOO", text: "Foo Space" },
 *    { id: "MEW", text: "Cat Space" }
 *  ]
 * }));
     *
     */
    function (_,
              AJS,
              $,
              spaceResolver) {

        'use strict';

        var DEFAULTS = {
            data: null, /* object */
            suggestCategories: null /* array */
        };

        var createResultFormattingFn = function (resultFormatFn) {
            return function (match) {
                var item = {
                    id: match.spaceKey,
                    text: match.spaceName
                };
                if (typeof resultFormatFn === 'function') {
                    // The item may need further processing, e.g. to re-add +/- prefixes.
                    return resultFormatFn(item);
                }
                return item;
            };
        };

        var formatSearchResult;

        /**
         * Resolves the space name(s) for the initial value of the select.
         */
        var makeInitSelectionFn = function (opts) {
            return function (element, callback) {
                var spaceKeyStr = $(element).val();
                if (spaceKeyStr === "") {
                    return;
                }

                var spaceKeys = spaceKeyStr.split(',');

                function doDisplay(displayItems) {


                    // If select2 is configured as a multi-select then its callbacks will expect an array. If it is configured
                    // as a single select then its callbacks will expect an Object. This is a helper function to make sure we
                    // return the thing select2 is expecting.
                    if (!opts.multiple) {
                        displayItems = displayItems[0];
                    }

                    callback(displayItems);
                }

                spaceResolver.getSpaceDisplayItems(spaceKeys, doDisplay);
            };
        };

        /**
         * Default suggested space function resolves the recent spaces and caches the result. Can also show space categories
         * on top if options are provided.
         *
         * @returns {Function}
         */
        var makeSuggestFn = function (opts) {
            // contains the cached spaces
            var suggestedSpaces;

            // prepare suggested categories
            if (opts.suggestCategories) {
                var suggestCategories = {
                    text: AJS.I18n.getText('confluence-ui-components.space-picker.select.or.type'),
                    children: _.map(opts.suggestCategories, function (category) {
                        return {
                            id: category,
                            text: spaceResolver.getSpaceCategoryDisplayName(category)
                        };
                    })
                };
            }

            return function (query) {
                if (suggestedSpaces) {
                    query.callback(suggestedSpaces);
                    return;
                }

                function loadSuggestedSpaces(spaces) {
                    var data = {results: []};

                    // add categories if available
                    if (suggestCategories) {
                        data.results.push(suggestCategories);
                    }

                    // format and append recent spaces
                    if (spaces.length > 0) {
                        data.results.push({
                            text: AJS.I18n.getText("confluence-ui-components.space-picker.suggested-spaces"),
                            children: _.map(spaces, function (space) {
                                return {
                                    id: space.key,
                                    text: _.escape(space.name)
                                };
                            })
                        });
                    }

                    suggestedSpaces = data;
                    query.callback(suggestedSpaces);
                }

                $.getJSON(AJS.contextPath() + "/rest/recentlyviewed/1.0/recent/spaces")
                    .done(loadSuggestedSpaces)
                    .fail(function () {
                        AJS.log("Couldn't fetch recent spaces");
                        var data = {results: []};

                        // add categories if available
                        if (suggestCategories) {
                            data.results.push(suggestCategories);
                        }

                        query.callback(data);
                    });
            };
        };

        /**
         * Use select2.ajax to retrieve results via contentnamesearch.
         *
         * TODO error handling. Only possible once select2 is upgraded to 3.4.1
         *
         * @returns {*}
         */
        var makeSearchFn = function () {
            return window.Select2.query.ajax({
                url: AJS.contextPath() + "/rest/quicknav/1/search?type=spacedesc&type=personalspacedesc",
                data: function (term) {
                    return {
                        query: term,
                        maxPerCategory: 25
                    };
                },
                quietMillis: 250,
                results: function (data) {
                    var matches = data.contentNameMatches;
                    if (matches.length <= 1) {
                        // no search results
                        return {results: []};
                    } else {
                        // format results
                        var spaces = _.map(matches[0], formatSearchResult);

                        return {
                            results: [
                                {
                                    text: AJS.I18n.getText("confluence-ui-components.space-picker.search-results"),
                                    children: spaces
                                }
                            ]
                        };
                    }
                }
            });
        };


        /**
         * Builds the query function that is passed to select2.
         *
         * @param opts
         * @returns {Function}
         */
        function makeQueryFn(opts) {
            var search = makeSearchFn();
            var suggestSpaces = makeSuggestFn(opts);
            return function (query, stripPrefix, formatResult) {
                // Show suggestions until you typed at least 2 characters, then search.
                if (query.term.length < 2) {
                    return suggestSpaces(query);
                } else {
                    if (typeof stripPrefix === 'function') {
                        // Functions may be provided to allow prefix notation
                        // (i.e. -foo to exclude spaces called foo from search results)
                        query.term = stripPrefix(query.term);
                    }
                    formatSearchResult = createResultFormattingFn(formatResult);
                    return search(query);
                }
            };
        }

        function getExistingValues() {
            var select = $('.select2-container-active').next('input'); // sucky way of finding the original input field
            var val = select.val().trim();
            return (val !== '') ? val.split(',') : [];
        }

        function hasSpaceTypeValue(values) {
            var spaceTypes = _.intersection(values, spaceResolver.getSpaceTypeKeys());
            return spaceTypes.length > 0;
        }

        function isSpaceTypeResult(result) {
            return (typeof result.id !== 'undefined') && _.contains(spaceResolver.getSpaceTypeKeys(), result.id);
        }

        function recursivelyAdjustResults(results, spaceTypesOnly, existingValues) {
            var adjusted = [];
            // Note that we don't use .filter() because we may be modified nested result arrays.
            results.forEach(function (result) {
                if (result.children) {
                    var adjustedChildren = recursivelyAdjustResults(result.children, spaceTypesOnly, existingValues);
                    if (adjustedChildren.length) {
                        adjusted.push($.extend({}, result, {
                            children: adjustedChildren
                        }));
                    }
                } else {
                    var resultIsSpaceType = isSpaceTypeResult(result);
                    if ((spaceTypesOnly && resultIsSpaceType) ||
                        (!spaceTypesOnly && !resultIsSpaceType)) {

                        // Filter out existing values. Select2 normally does this to the returned results,
                        // but that could result in a "No results" message when the "Everything filtered"
                        // message should be shown.
                        if (!_.contains(existingValues, result.id)) {
                            adjusted.push(result);
                        }
                    }
                }

            });
            return adjusted;
        }

        // This function exists for ease of unit testing.
        function filterMixedTypesForValues(results, existingValues) {
            if (!results.length || !existingValues.length) {
                return results;
            }

            var spaceTypesOnly = hasSpaceTypeValue(existingValues);
            var filtered = recursivelyAdjustResults(results, spaceTypesOnly, existingValues);

            if (!filtered.length) {
                // Give the user some inkling of why nothing now matches.
                filtered.push({
                    text: AJS.I18n.getText('confluence-ui-components.space-picker.no.results.after.filter'),
                    disabled: true
                });
            }

            return filtered;
        }

        /** Hack to modify the results outside of the query function - sortResults is all that select2 provides. */
        function sortResults(results) {
            var existingValues = getExistingValues();
            return filterMixedTypesForValues(results, existingValues);
        }

        function build(opts) {
            opts = _.extend({}, DEFAULTS, opts);

            var select2Options = {
                placeholder: AJS.I18n.getText("confluence-ui-components.space-picker.placeholder"),

                formatResult: function (result, label, query) {
                    // Add a tooltip to disclose full result text (as we truncate it to fit the drop down)
                    label.attr("title", $("<div/>").html(result.text).text());
                    return $.fn.select2.defaults.formatResult.apply(this, arguments);
                },

                escapeMarkup: function (markup) {
                    // Do not escape by default, instead provide already escaped data to the component.
                    return markup;
                },

                multiple: opts.multiple === true
            };

            if (opts.disableMixedSpaceTypes) {
                select2Options.sortResults = sortResults;
            }

            // for local data we don't do any REST calls
            // TODO working initSelection method for when the input has a value
            if (opts.data) {
                return _.extend(select2Options, {data: opts.data});
            } else {
                return _.extend(select2Options, {
                    initSelection: makeInitSelectionFn(opts),
                    query: makeQueryFn(opts)
                });
            }
        }

        return {
            build: build,

            /**
             * Removes results for space/space.type if the existing values already contain the opposite result type.
             */
            filterMixedTypesForValues: filterMixedTypesForValues
        };
    });