define('confluence-collaborative-editor-plugin/util/url-parser', [
    'window'
], function (window) {
    'use strict';
    return {
        /**
         * Parses the given urlString, and return an object containing the components of the url.
         * Internally uses the document object, and an anchor tag.
         * @param urlString a url. This may be relative. If relative, then will assume the domain of the current running script.
         * @returns {object} containing the following fields : {
         *      protocol : "http"
         *      hostname : "example.com"
         *      port : "3000"
         *      pathname : "/pathname/"  //empty string if no path
         *      search : "?search=test"
         *      hash : "hash"
         *      host : "example.com:3000"
         * }
         */
        parseUrl: function (urlString) {
            var parsedUrl = window.document.createElement('a');
            parsedUrl.href = urlString;
            return {
                //it's strange that the protocol contains a colon...removing
                protocol: parsedUrl.protocol.replace(":", ""),
                hostname: parsedUrl.hostname,
                port: parsedUrl.port,
                pathname: parsedUrl.pathname === "/" ? "" : parsedUrl.pathname,
                search: parsedUrl.search,
                //keep hashs consistent - remove the first hash, if it's there (but not any other)
                hash: parsedUrl.hash.substr(parsedUrl.hash.indexOf('#') + 1, parsedUrl.hash.length),
                host: parsedUrl.host
            };
        }
    };
});
