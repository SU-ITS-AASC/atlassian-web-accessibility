/**
 * A generic, reusable pagination component.
 * You can see an example of usage of Pagination component in Page Properties Report macro
 *
 * Usage:
 *  require('confluence-ui-components/js/pagination').build({
 *           'scope': $(obj),
 *           'pageSize': 10,
 *           'totalPages': 30,
 *           'currentPage': 0,
 *           'path': "/rest/masterdetail/1.0/detailssummary",
 *           'data': {
 *               'spaceKey': AJS.Meta.get('space-key'),
 *               'label': $table.data('label'),
 *               'spaces': spaces,
 *               'headings': headings,
 *               'sortBy': sortBy,
 *               'reverseSort': reverseSort
 *           },
 *           'url': "#",
 *           'success': function (data, $container) { }
 *       });
 *
 * Legacy usage is via Confluence.UI.Components.Pagination
 */
define('confluence-ui-components/js/pagination', [
    'ajs',
    'confluence/hover-user',
    'confluence-ui-components/js/internal/soy-templates',
    'jquery',
    'underscore'
], function (
    AJS,
    UserHover,
    SoyTemplates,
    $,
    _
) {
    'use strict';

    var handlePagination = function ($paginationObj, totalPages, disable) {

        var links = $paginationObj.find("a").attr("aria-disabled", disable);

        if (disable) {
            links.attr("disabled", "disabled");
        }
        else {
            links.removeAttr("disabled");

            // enable/disable the prev/next buttons
            var selectedIndex = $(".aui-nav-selected", $paginationObj).data('index') + 1;
            $paginationObj.find(".aui-nav-next > a").attr("aria-disabled", selectedIndex === totalPages);
            $paginationObj.find(".aui-nav-previous > a").attr("aria-disabled", selectedIndex === 1);
        }
    };

    var optionDefaults = {
        scope: null, //jQuery object,
        success: null, //function object
        data: null, //object,
        path: "",
        url: "#",
        pageLimit: 7,
        currentPage: 0,
        adaptive: false,
        totalPages: 0,
        pageSize: 0
    };

    var calculateStartPage = function (currentPage, totalPages, pageLimit) {
        // Attempt to center the current page in the range of the pageLimit
        var idealRange = Math.floor(pageLimit / 2);
        var totalIdx = totalPages - 1;

        if (!pageLimit || totalPages <= pageLimit || currentPage - idealRange < 0) {
            return 0; // pages are zero indexed
        }

        if (currentPage + idealRange > totalIdx) {
            return totalPages - pageLimit;
        }

        return currentPage - idealRange;
    };

    var renderPagination = function (opts) {
        var totalPages = opts.totalPages;
        var currentPage = opts.currentPage;
        var pageLimit = opts.pageLimit;
        var adaptive = opts.adaptive;
        var itemsToRender;

        if (pageLimit) {
            if (adaptive) {
                totalPages = currentPage + pageLimit;
            }
            itemsToRender = pageLimit;
        } else {
            itemsToRender = totalPages;
        }

        var startPage = calculateStartPage(currentPage, totalPages, pageLimit);

        // Add the pagination footer
        return SoyTemplates.Pagination().paginationFooter({
            currentPage: currentPage || 0,
            startPage: startPage,
            itemsToRender: itemsToRender,
            totalPages: totalPages,
            pageSize: opts.pageSize,
            url: opts.url || "#"
        });
    };

    // export API
        /**
         * @param opts.path {String} a string containing the URL to which the request is sent.
         * @param opts.url {String} a url appears in href of anchor links in pagination, such as: next link, previous link. Default value is '#'
         * @param opts.scope {jQuery Object} place HTML of pagination is inserted after that
         * @param opts.data {Object} a object that is sent to server with the request.
         * @param opts.pageSize {Integer} number of items in one page.
         * @param opts.adaptive {boolean} a flag to indicate weather pagination is adaptive (in the case where the total number of pages is not initially known)
         * @param opts.totalPages {Integer} number of pages.
         * @param opts.pageLimit {Integer} the maximum number of pages to display at one time (in the pagination footer)
         * @param opts.currentPage {Integer} current page.
         * @param opts.success {Function} a callback function after calling is success.
         */
    var build = function (opts) {
        var options = _.extend({}, optionDefaults, opts);

        if (typeof options.success !== "function") {
            options.success = function () {
            };
        }

        var renderedPagination = renderPagination(options);
        options.scope.after(renderedPagination);

        var $paginationObj = options.scope.next();
        var initialPageIndex = $paginationObj.data("initial-page-index");

        $paginationObj.on('click', "a", function (e) {
            var $this = $(this);
            var $tableOrParent = $this.parents('ol').prev();
            /*
            The pagination will fail if you have a horizontal scrollbar. The returned element would be the scrollbar div instead of the div that includes the table
            floating-scrollbar is added in /confluence-webapp/src/main/webapp/includes/js/table-floating-scrollbar.js
            */
            if($tableOrParent.prop('id') === "floating-scrollbar") {
                $tableOrParent = $tableOrParent.prev();
            }

            var $table = $tableOrParent.is('table') ? $tableOrParent : $tableOrParent.find('table');

            var pageIndex = $table.data('pageIndex') || initialPageIndex;
            var $li = $this.parent("li");

            if ($li.hasClass("aui-nav-selected") || $li.find("> a[aria-disabled=true]").length) {
                return;
            }

            //NOTE the indexes are 0-based
            if ($li.hasClass("aui-nav-next")) {
                pageIndex++;
            } else if ($li.hasClass("aui-nav-previous")) {
                pageIndex--;
            } else {
                pageIndex = $li.data("index");
            }

            handlePagination($paginationObj, options.totalPages, true);

            var ajaxOptions = $.extend({}, {
                'pageSize': options.pageSize,
                'pageIndex': pageIndex
            }, options.data);

            $.getJSON(AJS.contextPath() + options.path, ajaxOptions)
                .done(function (data) {
                    pageIndex = data.currentPage;

                    var $tbody = $table.find('tbody');

                    $tbody.find('tr').remove();

                    $table.data('pageIndex', pageIndex);

                    _.each(data.detailLines, function (line) {
                        options.success(line, $tbody);
                    });

                    AJS.trigger("ui.components.pagination.updated", [data, options]);

                    var updatedOpts = $.extend({}, options, {
                        totalPages: data.totalPages,
                        adaptive: data.adaptive,
                        currentPage: pageIndex
                    });

                    $paginationObj.html(renderPagination(updatedOpts));
                    handlePagination($paginationObj, updatedOpts.totalPages, false);

                    UserHover();
                })
                .fail(function () {
                    handlePagination($paginationObj, options.totalPages, false);
                });
            e.preventDefault();
        });
    };
    return {
        build: build
    };
});
