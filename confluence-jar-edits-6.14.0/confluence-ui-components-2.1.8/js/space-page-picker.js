/**
 * This bases on space-picker.js so it has the same limitation as space-picker.js.
 *
 * Supported options:
 *      contentType: undefined or ['space','page'] or ['space'] or ['page'].
 *      showRecentlyViewedSpaces: undefined or true or false. If it is undefined, it will become false if contentType is page; and true if contentType contains space.
 *      showRecentlyViewedPages: undefined or true or false. If it is undefined, it will become false if contentType is space; and true if contentType contains page.
 *      spaceCatKeys: array or string that separate by comma of space category keys.
 *      spaceKeys: array or string that separate by comma of space keys that separate by comma.
 *      pageIds: array or string that separate by comma of page ids that separate by comma.
 *      manualInit: run initSelection function automatically or not; default is false (undefined)
 *
 * How to initialize selected values?: There are two official ways and they can be merged.
 *  1. Use html input form value: create 3 input hidden tags <component's id>SpaceCat, <component's id>Space, <component's id>Page and set their value by keys/values that separate by comma.
 *  2. Use javascript option: set values for spaceCatKeys, spaceKeys, pageIds.
 *
 * How to get keys/ids from the component?:
 *  Look at <component's name>SpaceCat for space category keys; <component's name>Space for spaceKeys; <component's name>Page for pageIds with values separated by comma.
 *
 *
 * Note:
 * .The element must have an id.
 *
 * .An normal example to use this to create an space and/or page picker
 *
 *    var $spaceAndPage = $('#space-and-page');
 *    $spaceAndPage.auiSelect2(SpacePagePicker.build({
 *      orgElement: $spaceAndPage
 *    }));
 *
 * .Look at task report macro blueprint for other examples.
 *
 * .select2-input selector is set for this component to by pass placeholder.js processing.
 */
define('confluence-ui-components/js/space-page-picker', [
    'underscore',
    'ajs',
    'confluence-ui-components/js/internal/soy-templates',
    'jquery'
], function (
    _,
    AJS,
    SoyTemplates,
    $
) {
    'use strict';
    /**
     * Mapping of space category keys to name.
     */
    var SPACE_CATEGORIES = {
        "conf_all": AJS.I18n.getText("confluence-ui-components.space-picker.categories.all-spaces"),
        "conf_favorites": AJS.I18n.getText("confluence-ui-components.space-picker.categories.favourite-spaces"),
        "conf_global": AJS.I18n.getText("confluence-ui-components.space-picker.categories.site-spaces"),
        "conf_personal": AJS.I18n.getText("confluence-ui-components.space-picker.categories.personal-spaces"),
        "conf_current": AJS.I18n.getText("confluence-ui-components.space-picker.categories.current-space")
    };

    var CONTENT_FUNCTIONS = {
        "currentContent()": AJS.I18n.getText('confluence-ui-components.space-page-picker.current-content')
    };

    var DEFAULTS = {
        data: null, /* object */
        suggestCategories: null /* array */
    };

    // It is used to trigger initSelection if there is no value.
    var TRIGGER_VALUE = "SPACE-PAGE-TRIGGER-VALUE";

    var select2Options = {
        placeholder: AJS.I18n.getText("confluence-ui-components.space-page-picker.placeholder"),
        multiple: true,
        formatInputTooShort: function () {
            return AJS.I18n.getText("confluence-ui-components.space-page-picker.input-too-short");
        },
        formatResult: function (result, label, query) {
            if (result.children) {
                label.addClass('space-page-picker-result-category');
                return $.fn.select2.defaults.formatResult.apply(this, arguments);
            }
            else {
                if (result.id) {
                    // Add a tooltip to disclose full result text (as we truncate it to fit the drop down)
                    label.attr("title", result.text);
                    label.addClass('space-page-picker-result-label-with-icon');
                    var textObj = $('<span/>').addClass(result.className + ' ' + 'item-text').html($.fn.select2.defaults.formatResult.apply(this, arguments));
                    var subTextObj = (result.subText) ? $('<span/>').addClass('space-name').html(result.subText) : $('');
                    var itemObj = $('<span/>').attr(getIdentifyAttributeName(result.id), result.id).append(textObj).append(subTextObj);
                    var wrappedObj = $('<span/>').append(itemObj);
                    return wrappedObj;
                }
                else {
                    label.addClass(result.className);
                    return $.fn.select2.defaults.formatResult.apply(this, arguments);
                }
            }
        },
        formatSelection: function (result, container) {
            container.addClass("space-page-picker-selected-item");
            container.attr("title", result.text);
            var textObj = $('<span/>').attr(getIdentifyAttributeName(result.id), result.id)
                .addClass(result.className + ' ' + 'item-text').text($.fn.select2.defaults.formatSelection.apply(this, arguments));
            container.append(textObj);
        },
        escapeMarkup: function (markup) {
            // Do not escape by default, instead provide already escaped data to the component.
            // The data is always escape so we must not escape again.
            // quicknav escapes result data.
            // recentlyviewed, prototy, ui rest api do not escape result data.
            return markup;
        },
        formatResultCssClass: function (object) {
            //separator
            return (object.children || object.id) ? '' : 'select2-result-space-page-separator';
        },
        containerCssClass: 'space-page-picker-container',
        dropdownCssClass: 'space-page-picker-drop'
    };

    /**
     * Must set a value for value attribute so select2 involves this method. Support single value only
     *
     *
     * @param $sel2El
     * @param callback
     */
    var initSelection = function ($sel2El, callback) {
        var manualInit = $sel2El.data("select2").opts.manualInit;
        if (manualInit === true) {
            return;
        }
        setValue($sel2El.val(), $sel2El, callback);
    };

    function buildResultsFromResultsMap(typeAndKeys, resultMap, multiple) {
        var results = _.map(typeAndKeys, function (typeAndKey) {
            return resultMap[typeAndKey];
        });
        return (multiple) ? results : ((results.length > 0) ? results[0] : null);
    }

    /**
     * Default suggested space/page function resolves the recent spaces/pages and caches the result. Can also show space categories
     * on top if options are provided.
     *
     * @returns {Function}
     */
    var makeSuggestFn = function (opts) {
        // contains the cached spaces/pages
        var suggestedResults;

        // prepare suggested categories
        if (opts.suggestCategories) {
            var suggestCategories = {
                text: AJS.I18n.getText("confluence-ui-components.space-page-picker.suggested-categories"),
                children: _.map(opts.suggestCategories, function (category) {
                    return buildCategoryData(category);
                })
            };
        }
        if (opts.suggestedContentFunctions) {
            var suggestedContentFunctions = _.map(opts.suggestedContentFunctions, function (category) {
                return buildContentFunctionData(category);
            });
        }

        return function (query) {
            if (suggestedResults) {
                query.callback(suggestedResults);
                return;
            }

            var searchers = [];
            suggestedResults = {results: []};
            if (showRecentlyViewedSpaces(opts)) {
                var spaceSearch = $.getJSON(AJS.contextPath() + "/rest/recentlyviewed/1.0/recent/spaces")
                    .done(function (spaces) {
                        var data = (suggestCategories) ? [suggestCategories] : [];
                        (spaces.length > 0) && data.push({
                            text: AJS.I18n.getText("confluence-ui-components.space-page-picker.suggested-spaces"),
                            children: _.map(spaces, function (space) {
                                return buildSpaceData(space.key, _.escape(space.name), null, true);
                            })
                        });
                        (data.length > 0) && (suggestedResults.results = suggestedResults.results.concat(data));
                    })
                    .fail(function () {
                        AJS.debug("Couldn't fetch recent spaces");
                        var data = (suggestCategories) ? [suggestCategories] : [];
                        (data.length > 0) && (suggestedResults.results = suggestedResults.results.concat(data));
                    });
                searchers.push(spaceSearch);
            }

            if (showRecentlyViewedPages(opts)) {
                var pageSearch = $.getJSON(AJS.contextPath() + "/rest/recentlyviewed/1.0/recent/pages", {noTrashedContent: true})
                    .done(function (pages) {
                        if (pages.length > 0 || suggestedContentFunctions) {
                            var children = [];
                            if (suggestedContentFunctions) {
                                children = children.concat(suggestedContentFunctions);
                            }
                            if (pages.length > 0) {
                                children = children.concat(_.map(pages, function (page) {
                                    return buildPageData(page.id, _.escape(page.title), _.escape(page.space), 'content-type-page', true);
                                }));
                            }
                            suggestedResults.results.push({
                                text: AJS.I18n.getText("confluence-ui-components.space-page-picker.suggested-pages"),
                                children: children
                            });
                        }
                    })
                    .fail(function () {
                        AJS.debug("Couldn't fetch recent pages");
                    });
                searchers.push(pageSearch);
            }

            $.when.apply($, _.map(searchers, function (searcher) {
                var monitor = $.Deferred();
                searcher.always(function () {
                    monitor.resolve();
                });
                return monitor;
            })).done(function () {
                if (suggestedResults.results.length === 0) {
                    suggestedResults.results = [
                        {text: '', children: []}
                    ];
                }
                query.callback(suggestedResults);
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
    var makeSearchFn = function (type) {
        var queryString = "";
        if (!type || type.length === 2 && type.indexOf('space') >= 0 && type.indexOf('page') >= 0) {
            queryString = "type=spacedesc&type=personalspacedesc&type=page";
        }
        else if (type.length === 1 && type[0] === 'space') {
            queryString = "type=spacedesc&type=personalspacedesc";
        }
        else if (type.length === 1 && type[0] === 'page') {
            queryString = "type=page";
        }
        else {
            return;
        }

        return window.Select2.query.ajax({
            url: AJS.contextPath() + "/rest/quicknav/1/search?" + queryString,
            data: function (term, page) {
                return {
                    query: term,
                    maxPerCategory: 25
                };
            },
            quietMillis: 250,
            results: function (data, page) {
                // The latest match contains searching information, not result.
                var matches = data.contentNameMatches;
                if (matches.length <= 1) {
                    // no search results
                    return {results: []};
                }
                else {
                    var finalResults = [];
                    var buildContent = function (match) {
                        return buildContentItem(match.spaceKey, match.spaceName, match.id, match.name, match.className);
                    };
                    for (var i = 0; i < matches.length - 1; i++) {
                        var results = [];
                        for (var j = 0; j < matches[i].length; j++) {
                            var contentItem = buildContent(matches[i][j]);
                            if (contentItem) {
                                results.push(contentItem);
                            }
                        }
                        if (results.length > 0) {
                            finalResults = finalResults.concat(results);
                            finalResults.push({id: '', text: '', subText: '', className: '', disabled: true});
                        }
                    }
                    return {
                        results: [
                            {
                                text: AJS.I18n.getText("confluence-ui-components.space-page-picker.search-results"),
                                children: finalResults
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
    var makeQueryFn = function (opts) {
        var search = makeSearchFn(opts.contentType);
        var suggestSpaces = makeSuggestFn(opts);

        // Show suggestions until you typed at least 2 characters, then search.
        return function (query) {
            if (query.term.length < 2) {
                suggestSpaces(query);
            }
            else {
                search(query);
            }
        };
    };

    function getIdentifyAttributeName(id) {
        return (id.indexOf("page:") === 0) ? "data-item-id" : "data-item-key";
    }

    function buildSpaceData(key, text, className, found) {
        className = (className) ? className : ((key.indexOf("~") === 0) ? 'content-type-personalspacedesc' : 'content-type-spacedesc');
        return buildContentData('space', key, text, '', className, found);
    }

    function buildCategoryData(key) {
        var desc = SPACE_CATEGORIES[key];
        return buildContentData("space-cat", key, desc, '', 'content-type-space-category', desc);
    }

    function buildContentFunctionData(key) {
        var desc = CONTENT_FUNCTIONS[key];
        return buildContentData("content-function", key, desc, '', 'content-type-page', desc);
    }

    function buildPageData(id, text, subText, className, found) {
        return buildContentData('page', id, text, subText, className, found);
    }

    function buildContentData(contentType, keyOrId, text, subtext, className, found) {
        var idStr = concatId(contentType, keyOrId);
        text = (!text) ? keyOrId : text;
        className = (found) ? className : (className + ' content-not-found');
        return {id: idStr, text: text, subText: subtext, className: className, disabled: (found ? false : true)};
    }

    function buildCompoundSpaceCatKey(spaceCatKey) {
        return 'space-cat:' + spaceCatKey;
    }

    function buildCompoundContentFunctionKey(key) {
        return 'content-function:' + key;
    }

    function buildCompoundSpaceKey(spaceKey) {
        return 'space:' + spaceKey;
    }

    function buildCompoundPageKey(pageId) {
        return 'page:' + pageId;
    }

    /**
     * var classNameMap = {'space-cat': 'content-type-category', 'space': 'content-type-spacedesc', 'page': 'content-type-page'};
     * var contentTypeMap = {'content-type-category': 'space-cat', 'content-type-spacedesc': 'space', 'content-type-page': 'page'};
     *
     * @param spaceKey
     * @param spaceName
     * @param id
     * @param name
     * @param className
     * @returns {string}
     */
    function buildContentItem(spaceKey, spaceName, id, name, className) {
        // Don't have category here because it is gotten from another place.
        var result;
        if (className === 'content-type-spacedesc' || className === 'content-type-personalspacedesc') {
            result = buildSpaceData(spaceKey, spaceName, className, true);
        }
        else if (className === 'content-type-page') {
            result = buildPageData(id, name, spaceName, className, true);
        }
        return result;
    }

    function concatId() {
        // Using any char except a comma because select2 uses comma as default separator to separate items' ids.
        var args = Array.prototype.slice.apply(arguments);
        return args.join(":");
    }

    /**
     * Recently-viewed space will be shown if showRecentlyViewedSpaces is true or contentType contains space and showRecentlyViewedSpace is not explicit false.
     *
     *
     * @param opts
     * @returns {boolean}
     */
    function showRecentlyViewedSpaces(opts) {
        return ((!opts.contentType || opts.contentType.length === 0 || opts.contentType.indexOf('space') >= 0) && opts.showRecentlyViewedSpaces !== false);
    }

    /**
     * Recently-viewed page will be shown if showRecentlyViewedPages is true or contentType contains page and showRecentlyViewedPages is not explicit false.
     *
     *
     * @param opts
     * @returns {boolean}
     */
    function showRecentlyViewedPages(opts) {
        return ((!opts.contentType || opts.contentType.length === 0 || opts.contentType.indexOf('page') >= 0) && opts.showRecentlyViewedPages !== false);
    }

    function buildHiddenForSpaceCat($el, options) {
        var idAndName = createIdAndName("SpaceCat", $el, options.inputSpaceCatId, (options.inputSpaceCatName) ? options.inputSpaceCatName : options.inputSpaceCatId);
        return buildHiddenWithName($el, idAndName.id, idAndName.name);
    }

    function buildHiddenForContentFunction($el, options) {
        // HACK - this and the rest of the hidden-field logic will be removed in CONFDEV-40396. dT
        // This id is only set because no plugin is actually passing in inputContentFunctionId and shouldn't have to.
        var id = options.inputContentFunctionId || 'legacy-macro-param-content-funcs';
        var idAndName = createIdAndName("ContentFunction", $el, id, options.inputContentFunctionName || id);
        return buildHiddenWithName($el, idAndName.id, idAndName.name);
    }

    function buildHiddenForSpace($el, options) {
        var idAndName = createIdAndName('Space', $el, options.inputSpaceId, (options.inputSpaceName) ? options.inputSpaceName : options.inputSpaceId);
        return buildHiddenWithName($el, idAndName.id, idAndName.name);
    }

    function buildHiddenForPage($el, options) {
        var idAndName = createIdAndName('Page', $el, options.inputPageId, (options.inputPageName) ? options.inputPageName : options.inputPageId);
        return buildHiddenWithName($el, idAndName.id, idAndName.name);
    }

    function createIdAndName(suffix, $el, id, name) {
        var orgId;
        if (!id) {
            orgId = $el.attr("id");
            if (!orgId) {
                return null;
            }
            id = orgId + suffix;
        }

        if (!name) {
            var orgName = $el.attr("name") || orgId;
            name = orgName + suffix;
        }

        return {
            id: id,
            name: name
        };
    }

    function buildHiddenWithName($el, id, name) {
        var $hidden = $('#' + id);
        if ($hidden.length === 0) {
            $hidden = $(SoyTemplates.Components().hiddenField({id: id, name: name}));
            $el.after($hidden);
        }
        return $hidden;
    }

    function populateEntriesWithPrefix($el, value, prefix) {
        if (!$el) {
            return;
        }

        var items = _.filter(value, function (item) {
            return item.indexOf(prefix) === 0;
        });

        items = _.map(items, function (item) {
            return item.substring(prefix.length, item.length);
        });
        $el.val(items.join(","));
    }

    /**
     *
     * Merge specific values from javascript and html input fields to the component.
     *
     *
     * @param $el
     * @param prefix
     * @param jsKeyOrIdValue
     * @param htmlKeyOrIdValue
     */
    function mergeSeparateValuesToElement($el, prefix, jsKeyOrIdValue, htmlKeyOrIdValue) {
        jsKeyOrIdValue = (jsKeyOrIdValue) ? (_.isArray(jsKeyOrIdValue) ? jsKeyOrIdValue : jsKeyOrIdValue.split(',')) : [];
        htmlKeyOrIdValue = (htmlKeyOrIdValue) ? htmlKeyOrIdValue.split(",") : [];

        var keyOrIdValues = _.union(jsKeyOrIdValue, htmlKeyOrIdValue);
        var typeAndKeys = _.map(keyOrIdValues, function (keyOrId) {
            return prefix + keyOrId;
        });
        var objectValue = $el.val();
        var objectTypeAndKeys = objectValue ? objectValue.split(',') : [];

        var finalTypeAndKeys = _.union(objectTypeAndKeys, typeAndKeys);
        if (finalTypeAndKeys.length > 0) {
            $el.val(finalTypeAndKeys.join(','));
        }
    }

    function build(opts) {
        var options = _.extend({}, DEFAULTS, select2Options, opts);
        if (!opts.data) {
            options = _.extend({}, {
                initSelection: initSelection,
                query: makeQueryFn(options)
            }, options);
        }

        var $orgElement = $(options.orgElement);
        if (!$orgElement || $orgElement.length !== 1) {
            return options;
        }

        // Always call initSelection if it is not manualInit
        if (!$orgElement.val() && !options.manualInit) {
            $orgElement.val(TRIGGER_VALUE);
        }

        // To skip placeholder process in placeholder.js
        $orgElement.addClass("select2-input");

        return options;
    }

    /**
     *
     * $sel2El will be cleared and its value will be replaced by initValue as long as values from javascript, child hidden fields.
     * Which automatic init, initValue is $sel2El.val()
     *
     *
     * @param initValue
     * @param $sel2El
     * @param callback
     */
    function setValue(initValue, $sel2El, callback) {
        var options = $sel2El.data("select2").opts;
        var placeholder = options.placeholder || $sel2El.data("placeholder");

        // Add extra hidden fields
        // The code must be here because the request information may be not ready at the build time, ex: id, name...
        var inputSpaceCat = buildHiddenForSpaceCat($sel2El, options);
        var inputContentFunction = buildHiddenForContentFunction($sel2El, options);
        var inputSpace = buildHiddenForSpace($sel2El, options);
        var inputPage = buildHiddenForPage($sel2El, options);

        $sel2El.on("change", function (e) {
            populateEntriesWithPrefix(inputSpaceCat, e.val, "space-cat:");
            populateEntriesWithPrefix(inputContentFunction, e.val, "content-function:");
            populateEntriesWithPrefix(inputSpace, e.val, "space:");
            populateEntriesWithPrefix(inputPage, e.val, "page:");
        });

        // Clean element's value attribute to avoid duplication if using automatic init (<> manualInit).
        $sel2El.val("");

        var multiple = ($sel2El["0"].tagName === "SELECT") ? ($sel2El.context.multiple) : (options.multiple);
        var gettingSpaceCatKeys = [];
        var gettingSpaceKeys = [];
        var gettingContentFunctionKeys = [];
        var gettingPageIds = [];
        var resultMap = {};
        var typeAndKeys = (initValue) ? initValue.split(",") : [];

        // Fix IE 8 and 9 issue that uses value field for placeholder
        // Also to remove trigger value if there is no default value.
        typeAndKeys = _.filter(typeAndKeys, function (typeAndKey) {
            var typeAndKeyPair = typeAndKey.split(":");
            if (typeAndKeyPair.length === 2) {
                return true;
            }
            // Should never happen
            else if (typeAndKeyPair.length < 0 || typeAndKeyPair.length >= 3 || (typeAndKeyPair.length === 1 && (typeAndKeyPair[0] !== TRIGGER_VALUE && typeAndKeyPair[0] !== placeholder))) {
                AJS.debug("Error value: " + typeAndKeyPair);
            }
        });

        // after removing all unwanted values
        initValue = typeAndKeys.join(",");
        $sel2El.val(initValue);

        mergeSeparateValuesToElement($sel2El, 'space-cat:', options.spaceCatKeys, (inputSpaceCat) ? inputSpaceCat.val() : "");
        mergeSeparateValuesToElement($sel2El, 'content-function:', options.pageCatKeys, (inputContentFunction) ? inputContentFunction.val() : "");
        mergeSeparateValuesToElement($sel2El, 'space:', options.spaceKeys, (inputSpace) ? inputSpace.val() : "");
        mergeSeparateValuesToElement($sel2El, 'page:', options.pageIds, (inputPage) ? inputPage.val() : "");

        // after merge all values
        initValue = $sel2El.val();

        typeAndKeys = (initValue) ? initValue.split(",") : [];
        populateEntriesWithPrefix(inputSpaceCat, typeAndKeys, "space-cat:");
        populateEntriesWithPrefix(inputContentFunction, typeAndKeys, "content-function:");
        populateEntriesWithPrefix(inputSpace, typeAndKeys, "space:");
        populateEntriesWithPrefix(inputPage, typeAndKeys, "page:");

        if (typeAndKeys.length === 0) {
            return;
        }

        _.each(typeAndKeys, function (typeAndKey, index) {
            var typeAndKeyPair = typeAndKey.split(":");
            if (typeAndKeyPair.length === 2) {
                var type = typeAndKeyPair[0];
                var key = typeAndKeyPair[1];
                if (type === 'space-cat') {
                    gettingSpaceCatKeys.push(key);
                }
                else if (type === 'content-function') {
                    gettingContentFunctionKeys.push(key);
                }
                else if (type === 'space') {
                    gettingSpaceKeys.push(key);
                }
                else if (type === 'page') {
                    gettingPageIds.push(key);
                }
            }
        });

        _.each(gettingSpaceCatKeys, function (spaceCatKey) {
            resultMap[buildCompoundSpaceCatKey(spaceCatKey)] = buildCategoryData(spaceCatKey);
        });

        _.each(gettingContentFunctionKeys, function (pageCatKey) {
            resultMap[buildCompoundContentFunctionKey(pageCatKey)] = buildContentFunctionData(pageCatKey);
        });

        var searchers = [];
        if (gettingSpaceKeys.length > 0) {
            var searchSpace = $.getJSON(AJS.contextPath() + "/rest/prototype/1/space", {spaceKey: gettingSpaceKeys}).done(function (results) {
                var foundKeys = [];
                _.each(results.space, function (space) {
                    resultMap[buildCompoundSpaceKey(space.key)] = buildSpaceData(space.key, _.escape(space.name), null, true);
                    foundKeys.push(space.key);
                });

                var noFoundKeys = _.difference(gettingSpaceKeys, foundKeys);
                _.each(noFoundKeys, function (spaceKey) {
                    resultMap[buildCompoundSpaceKey(spaceKey)] = buildSpaceData(spaceKey, spaceKey, null, false);
                });
            }).fail(function () {
                AJS.debug("Couldn't resolve spaceKeys:", gettingSpaceKeys);
                _.each(gettingSpaceKeys, function (spaceKey) {
                    resultMap[buildCompoundSpaceKey(spaceKey)] = buildSpaceData(spaceKey, spaceKey, null, false);
                });
            });
            searchers.push(searchSpace);
        }

        // there is no rest api to get me a list of page, going to call the existing api for each page
        _.each(gettingPageIds, function (pageId) {
            var searchPage = $.getJSON(AJS.contextPath() + "/rest/api/content/" + pageId, {expand: "space"}).done(function (page) {
                resultMap[buildCompoundPageKey(page.id)] = buildPageData(page.id, _.escape(page.title), _.escape(page.space.name), 'content-type-page', true);
            }).fail(function () {
                AJS.debug("Couldn't resolve pageId:", pageId);
                resultMap[buildCompoundPageKey(pageId)] =
                    buildPageData(pageId, pageId, AJS.I18n.getText("confluence-ui-components.space-page-picker.space.unknow"), 'content-type-page', false);
            });
            searchers.push(searchPage);
        });

        // wait for all requests to finish, whether they passed/failed and then populate the field value
        $.when.apply($, _.map(searchers, function (searcher) {
            var monitor = new $.Deferred();
            searcher.always(function () {
                monitor.resolve();
            });
            return monitor.promise();
        })).done(function () {
            callback(buildResultsFromResultsMap(typeAndKeys, resultMap, multiple));
        });
    }

    return {
        build: build,

        setValue: function (initValue, $sel2El) {
            setValue(initValue, $sel2El, function (data) {
                $sel2El.auiSelect2("data", data);
            });
        }
    };
});