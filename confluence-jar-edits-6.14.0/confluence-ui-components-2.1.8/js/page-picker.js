define('confluence-ui-components/js/page-picker',
    [
        'ajs',
        'confluence-ui-components/js/space-page-picker'
    ],
    /**
     * Look at space-page-picker.js for any details.
     */
    function (AJS,
              SpacePagePicker) {
        'use strict';

        return {
            build: function (opts) {
                opts.placeholder = AJS.I18n.getText("confluence-ui-components.page-picker.placeholder");
                opts.contentType = ['page'];
                opts.showRecentlyViewedSpaces = false;
                opts.spaceCatKeys = [];
                opts.spaceKeys = [];

                return SpacePagePicker.build(opts);
            }
        };
    });