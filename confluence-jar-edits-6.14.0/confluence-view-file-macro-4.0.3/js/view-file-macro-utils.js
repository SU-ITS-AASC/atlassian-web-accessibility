define("vfm/view-file-macro-utils", [],
function () {
    "use strict";

    var module = {
        DEFAULT_HEIGHT: "250",
        DEFAULT_HEIGHT_IN_COMMENT: "150",

        THUMBNAIL_STATUS_IN_PROGRESS: 202,
        THUMBNAIL_STATUS_CONVERTED: 200,
        THUMBNAIL_STATUS_ERROR: 415,
        THUMBNAIL_STATUS_BUSY: 429,

        THUMBNAIL_POLLING_PERIOD: 1000, // milliseconds
        THUMBNAIL_POLLING_BACKOFF_RATIO: 1.25,

        MAP_NICE_TYPE_TO_TEXT: {
            "pdf document": AJS.I18n.getText("view.file.placeholder.pdf"),
            "word document": AJS.I18n.getText("view.file.placeholder.document"),
            "excel spreadsheet": AJS.I18n.getText("view.file.placeholder.spreadsheet"),
            "powerpoint presentation": AJS.I18n.getText("view.file.placeholder.presentation"),
            "generic file": AJS.I18n.getText("view.file.placeholder.generic")
        },
        
        getFileNameFromUrl: function (url) {
            if (!url) {
                return "";
            }

            // this remves the anchor at the end, if there is one
            var pos = url.indexOf("#");
            pos = (pos >= 0) ? pos : url.length;
            url = url.substring(0, pos);

            // this removes the query after the file name, if there is one
            pos = url.indexOf("?");
            pos = (pos >= 0) ? pos : url.length;
            url = url.substring(0, pos);

            // this removes everything before the last slash in the path
            pos = url.lastIndexOf("/");
            url = url.substring(pos + 1, url.length);

            return decodeURIComponent(url);
        },

        /**
         * Check the browser whether support "pointer-events" CSS or not
         * Reference: https://github.com/ausi/Feature-detection-technique-for-pointer-events/blob/master/modernizr-pointerevents.js
         */
        isSupportPointerEvents: function () {
            var element = document.createElement("x");
            element.style.cssText = "pointer-events:auto";
            return element.style.pointerEvents === "auto";
        },

        /**
         * Get value of a name of parameter.
         * @param url URL to parse.
         * @param name name of parameter.
         * @returns {string} value of parameter.
         */
        getParameterByName: function (url, name) {
            //remove hash from url
            var hashIndex = url.indexOf("#");
            if (hashIndex >= 0) {
                url = url.substring(0, hashIndex);
            }
            var result = new RegExp(name + "=([^&]*)", "i").exec(url);
            return result ? decodeURIComponent(result[1]) : null;
        },

        /**
         * Add new query string parameters to a simple url.
         * This does not support url having anchor # or replace existing parameter with the same name.
         * @param url
         * @param params
         * @returns {string}
         */
        addParamsToUrl: function(url, params) {
            var extraQueryString = "";
            if (url.indexOf("?") === -1) {
                extraQueryString = "?";
            } else {
                extraQueryString = "&";
            }
            var keys = Object.keys(params);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var value = params[key];
                if (i > 0) {
                    extraQueryString += "&";
                }
                extraQueryString += key + "=" + value;
            }

            return url + extraQueryString;
        },

        getFileTypeTextFromNiceType: function (niceType) {
            niceType = niceType ? niceType.toLowerCase() : "";
            return this.MAP_NICE_TYPE_TO_TEXT[niceType] ? this.MAP_NICE_TYPE_TO_TEXT[niceType] : niceType;
        }
    };

    return module;
});
