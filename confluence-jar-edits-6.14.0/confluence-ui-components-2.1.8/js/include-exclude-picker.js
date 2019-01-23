define('confluence-ui-components/js/include-exclude-picker',
    [
        'jquery',
        'underscore'
    ],
    /**
     * A component which will generate select2 options which modify ajax behaviour to allow the user to search
     * for entries using the +/- notation in the field. E.g. label = -foo for label != foo
     */
    function ($,
              _) {

        var searchTermPrefix = '';

        function stripPrefix(searchTerm) {
            var firstChar = searchTerm.charAt(0);
            if (_.contains(['-'], firstChar)) {
                searchTermPrefix = firstChar;
                searchTerm = searchTerm.substring(1);
            } else {
                searchTermPrefix = '';
            }
            return searchTerm;
        }

        function reAddPrefix(result) {
            var newResult = $.extend({}, result);
            if (newResult.children) {
                newResult.children = _.map(newResult.children, reAddPrefix);
            } else {
                newResult.id = searchTermPrefix + newResult.id;
                newResult.text = searchTermPrefix + newResult.text;
            }
            return newResult;
        }

        function stripPrefixBeforeAjax(dataFn) {
            return function (searchTerm) {
                searchTerm = stripPrefix(searchTerm);
                return dataFn(searchTerm);
            };
        }

        function reAddPrefixAfterAjax(fn) {
            return function (data) {
                var result = fn ? fn(data) : data;

                if (searchTermPrefix) {
                    result.results = _.map(result.results, reAddPrefix)
                }

                return result;
            }
        }

        function providePrefixAwareQueryFn(query) {
            return function (queryArgs) {
                return query(queryArgs, stripPrefix, reAddPrefix);
            }
        }

        function setStylingForNegatedSelections(result) {
            var firstChar = result.text.charAt(0);
            if (firstChar === "-") {
                return "select2-search-choice-subtle";
            }
            return;
        }

        /**
         * @param opts Options from the select2 API. They will override the defaults that are provided by this picker.
         */
        function build(opts) {
            // If we don't clone, we will end up modifying data and results functions in the incoming opts
            // which will result in these callbacks calling themselves for each new time the picker is built
            var newOpts = $.extend({
                formatSelectionCssClass: setStylingForNegatedSelections
            }, opts);
            if (newOpts.query) {
                newOpts.query = providePrefixAwareQueryFn(newOpts.query);
                return newOpts;
            } else {
                newOpts.ajax = $.extend({}, newOpts.ajax);
                newOpts.ajax.data = stripPrefixBeforeAjax(newOpts.ajax.data);
                newOpts.ajax.results = reAddPrefixAfterAjax(newOpts.ajax.results);
                return newOpts;
            }
        }

        return {
            build: build
        };
    });
