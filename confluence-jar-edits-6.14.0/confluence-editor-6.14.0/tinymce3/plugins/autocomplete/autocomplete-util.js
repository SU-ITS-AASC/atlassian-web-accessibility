/**
 * @module confluence-editor/tinymce3/plugins/autocomplete/autocomplete-util
 */
define('confluence-editor/tinymce3/plugins/autocomplete/autocomplete-util', [
    'ajs',
    'jquery'
], function(
    AJS,
    $
) {
    "use strict";

    var loadData = function (json, query, callback, field, getRestSpecificAdditionLinks) {
        var hasErrors = json.statusMessage;
        var matrix;
        if (hasErrors) {
            matrix = [[{html: json.statusMessage, className: "error"}]];
        } else {
            var restMatrix = query ? AJS.REST.makeRestMatrixFromSearchData(json) : AJS.REST.makeRestMatrixFromData(json, field);
            matrix = AJS.REST.convertFromRest(restMatrix);
        }
        // do conversion
        function restSpecificAdditionLinksCallback(value, additionalLinks) {
            if (getRestSpecificAdditionLinks && typeof getRestSpecificAdditionLinks === "function") {
                getRestSpecificAdditionLinks(matrix, value, additionalLinks);
            }
        }
        callback(matrix, query, restSpecificAdditionLinksCallback);
    };

    return {
        /**
         * Returns the HTML of a AJS.dropdown link with an icon span. The icon span is required in the dropdown if we
         * want to use a sprite background for the link icon.
         * @param text escaped text of the dropdown item
         * @param className class name to be added to the link
         * @param iconClass class name to be added on the icon span
         * @return HTML string for the dropdown link
         */
        // we should remove this once AUI dropdown supports sprite icons
        dropdownLink : function(text, className, iconClass) {
            return "<a href='#' class='" + (className || "" ) + "'><span class='icon " + (iconClass || "") + "'></span><span>" + text + "</span></a>";
        },

        getRestData : function (autoCompleteControl, getUrl, getParams, val, callback, suggestionField, getRestSpecificAdditionLinks) {
            var url = getUrl(val);
            var cacheManager = autoCompleteControl.settings.cacheManager;
            var cachedData = cacheManager.get(val);
            var xhr;

            if (url) {
                xhr = $.ajax({
                    type: "GET",
                    url: url,
                    data: getParams(autoCompleteControl, val),
                    dataType: "json",
                    global: false,
                    timeout: 5000
                });

                //Always update the cache (eventual consistency)
                xhr.done(function(json){
                    cacheManager.put(val, json);
                });

                if (cachedData){
                    //Cached response
                    loadData(cachedData, val, callback, suggestionField, getRestSpecificAdditionLinks);
                } else {
                    //Async response
                    xhr.done(function(json){
                        loadData(json, val, callback, suggestionField, getRestSpecificAdditionLinks);
                    });
                    xhr.fail(function (xml, status) { // ajax error handler
                        if (status == "timeout") {
                            loadData({statusMessage: "Timeout", query: val}, val, callback, suggestionField);
                        }
                    });
                }
            } else {
                // If no url, default items may be displayed - run the callback with no data.
                callback([], val);
            }
        }
    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/tinymce3/plugins/autocomplete/autocomplete-util', 'Confluence.Editor.Autocompleter.Util');
