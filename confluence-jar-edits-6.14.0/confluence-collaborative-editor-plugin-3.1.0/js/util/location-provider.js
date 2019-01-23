define('confluence-collaborative-editor-plugin/util/location-provider', [
    'window'
], function (window) {
    'use strict';
    return {
        /**
         * A way to indirectly get the location, so that unit tests can mock it.
         */
        getLocation: function () {
            return window.location;
        }
    };
});
