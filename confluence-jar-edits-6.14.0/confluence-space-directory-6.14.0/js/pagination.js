/**
 * @module confluence-space-directory/pagination
 * @tainted Raphael
 */
define('confluence-space-directory/pagination', [
    'jquery',
    'ajs',
    'confluence/legacy'
], function(
    $,
    AJS,
    Confluence
) {
    "use strict";

    function getPreviousIndexes(currentIndex, pageSize) {
        var previousIndexes = [];
        var numPrevPages = Math.floor((currentIndex + pageSize - 1) / pageSize);

        for (var i = 0; i < numPrevPages; i++)
        {
            previousIndexes[i] = i * pageSize;
        }

        return previousIndexes;
    }


    function getNextIndexes(currentIndex, pageSize, totalSize) {
        var nextIndexes = [];
        var nextIndex = currentIndex + pageSize >= totalSize ? -1 : currentIndex + pageSize;
        var remainingItems = totalSize - nextIndex;
        var numNextPages = Math.floor((remainingItems + pageSize - 1) / pageSize);

        if (nextIndex > 0) {
            for (var i = 0; i < numNextPages; i++)
            {
                nextIndexes[i] = (i * pageSize) + nextIndex;
            }
        }

        return nextIndexes;
    }

    function loadPrevious(paginationContainer, previousIndexes, pageUrl) {
        if (previousIndexes.length) {
            var previousStartIndex = previousIndexes[previousIndexes.length - 1];
            paginationContainer.append(Confluence.Templates.Pagination.previous({
                startIndex : previousStartIndex,
                url : pageUrl + "?startIndex=" + previousStartIndex
            }));
        } else {
            paginationContainer.append(Confluence.Templates.Pagination.previousDisabled());
        }

        var currentIndex = 1;
        for (var i = 0, il = previousIndexes.length; i < il; i++) {
            paginationContainer.append(Confluence.Templates.Pagination.item({
                startIndex : previousIndexes[i],
                pageNumber : currentIndex,
                url : pageUrl + "?startIndex=" + previousIndexes[i]
            }));
            currentIndex++;
        }

        return currentIndex;
    }

    function loadNext(paginationContainer, currentIndex, nextIndexes, pageUrl) {
        for (var j = 0, jl = nextIndexes.length; j < jl; j++) {
            paginationContainer.append(Confluence.Templates.Pagination.item({
                startIndex : nextIndexes[j],
                pageNumber : currentIndex,
                url : pageUrl + "?startIndex=" + nextIndexes[j]
            }));
            currentIndex++;
        }

        if (nextIndexes.length) {
            var nextStartIndex = nextIndexes[0];
            paginationContainer.append(Confluence.Templates.Pagination.next({
                startIndex : nextStartIndex,
                url : pageUrl + "?startIndex=" + nextStartIndex}));
        } else {
            paginationContainer.append(Confluence.Templates.Pagination.nextDisabled());
        }
    }

    function clearContainers(paginationContainer, listContainer) {
        paginationContainer.empty();
        paginationContainer.addClass("hidden");
        $(">:not(.list-header)", listContainer).remove();
        listContainer.addClass("hidden");
    }

    function finishLoading(namespace, waitSpinner, listContainer, container) {
        waitSpinner();
        waitSpinner.throbber.remove();
        listContainer.removeClass("hidden");
        container.removeClass("updating-container");
        AJS.trigger("update-list-complete." + namespace);
    }

    /**
     * Displays a pagination handle below a list
     * <br>
     * Options are:
     * <li>nameSpace - a unique name for the list (used for binding events). REQUIRED
     * <li>url - the url to the REST resource from which to retrieve more pages. REQUIRED
     * <li>insertResults - a function that uses the response to insert elements into the list. REQUIRED
     * <li>pageUrl - the url for the page. REQUIRED
     * <li>pageSize - the amount of elements to insert per page. OPTIONAL, Defaults to 10.
     * <li>preprocess - a function run before the container is updated.
     * <li>handleError - a function that handles the error response. REQUIRED.
     * <li>cache - if true the response is cached by the browser. Defaults to false.
     * <li>getParams - a function that will retrieve parameters (if any) from the page. OPTIONAL
     * @class pagination
     * @namespace $
     * @extends jQuery
     * @constructor
     * @param options {Object}
     */
    return function (options) {
        var container = $(this);
        AJS.bind("update-list." + options.nameSpace, function (e, data) {
            var params = {};
            var paginationContainer = $("ol.aui-nav-pagination", container);
            var listContainer = $(".list-container", container);

            container.addClass("updating-container");

            if (options.preprocess && typeof options.preprocess === "function") {
                options.preprocess(listContainer);
            }

            if (options.getParams && typeof options.getParams === "function") {
                params = options.getParams();
            }

            var throbberEl = $("<div></div>").addClass("list-loading");
            $(".loading-throbber").append(throbberEl);

            var waitSpinner = Raphael.spinner(throbberEl[0], 10, "#666");
            waitSpinner.throbber = throbberEl;

            params.pageSize = options.pageSize ? options.pageSize : 10;
            params.startIndex = data.startIndex;

            $.ajax({
                type: "GET",
                dataType: "json",
                cache: !!options.cache,
                data: params,
                url: options.url
            }).done(function(response) {
                clearContainers(paginationContainer, listContainer);

                options.insertResults(response, listContainer);

                if (response.totalSize) {
                    var totalSize = response.totalSize;
                    var pageSize = options.pageSize;
                    var startIndex = data.startIndex;
                    var previousIndexes = getPreviousIndexes(startIndex, pageSize);
                    var nextIndexes = getNextIndexes(startIndex,  pageSize, totalSize);

                    if (previousIndexes.length || nextIndexes.length) {
                        paginationContainer.removeClass("hidden");
                        var currentIndex = loadPrevious(paginationContainer, previousIndexes, options.pageUrl);

                        paginationContainer.append(Confluence.Templates.Pagination.current({
                            pageNumber : currentIndex
                        }));
                        currentIndex++;

                        loadNext(paginationContainer, currentIndex, nextIndexes, options.pageUrl);

                        $("a", paginationContainer).click(function (e) {
                            var startIndex = parseInt($(this).attr("data-index"), 10);
                            AJS.trigger("update-list." + options.nameSpace, {startIndex : startIndex});

                            /**
                             * CONFDEV-33536 - Confluence simplify journeys
                             *
                             *  Click pagination sends an analytics event
                             *
                             *  - confluence.space-directory.pagination.click
                             */
                            AJS.trigger('analytics', { name: 'confluence.space-directory.pagination.click', data: {
                                page: startIndex,
                                text: $.trim($(this).text())
                            }});

                            return e.preventDefault();
                        });
                    }
                }
            }).fail(function(response) {
                clearContainers(paginationContainer, listContainer);
                options.handleError(response, listContainer);
            }).always(function() {
                finishLoading(options.nameSpace, waitSpinner, listContainer, container);
            });
        });
    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-space-directory/pagination', '$.fn.paginate');
