/**
 * Quick edit utilities
 *
 * @module confluence-quick-edit/util
 */
define('confluence-quick-edit/util', [
    'window',
    'ajs'
], function(
    window,
    AJS
) {
    "use strict";

    return {

        /**
         * Generates unique identifier, used for comments.
         *
         * @returns a UUID.
         */
        generateUUID : function () {
            var s4 = function() {
                return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
            };

            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
        },

        /**
         * Return an object representing the base URL.
         */
        getBaseUrl : function() {
            // stripping ':' from protocol and '/' from pathname to handle cross browser inconsistency
            var baseUrl = window.location.protocol.replace(/:$/,"") + "://" + window.location.host + "/" +  window.location.pathname.replace(/^\//,"");

            var search = window.location.search.replace(/^\?/,""); // drop the leading '?'
            search = search.replace(/\&?focusedCommentId=\d+/,"");
            search = search.replace(/^\&/,"");

            return {
                url : baseUrl,

                search: search,

                addQueryParam : function(name, value) {
                    if (!this.search) {
                        this.search = name + "=" + value;
                    } else {
                        this.search = this.search + "&" + name + "=" + value;
                    }
                },

                toString: function() {
                    return this.url + "?" + this.search;
                }
            };
        },

        /**
         * Wrapper to reject a deferred object after a certain time if it has not been resolved.
         *
         * @param desc
         * @param obj
         * @param timeout
         */
        timeoutDeferred : function (desc, obj, timeout) {
            if (typeof obj.reject !== "function") {
                AJS.log("WARNING: invalid, not rejectable object passed to AJS.Confluence.QuickEdit.Util.timeoutDeferred. You should use a Deferred object");
            }
            setTimeout(function(){
                if (obj.state() === 'pending'){
                    AJS.logError('Timeout: ' + desc);
                    obj.reject('timeout');
                }
            }, timeout);
            return obj;
        }

    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-quick-edit/util', 'AJS.Confluence.QuickEdit.Util');
