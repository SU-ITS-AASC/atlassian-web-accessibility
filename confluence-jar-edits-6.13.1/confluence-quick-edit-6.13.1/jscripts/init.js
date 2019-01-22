/**
 * @module confluence-quick-edit/init
 */
define('confluence-quick-edit/init', [
    'ajs',
    'jquery',
    'window'
], function(
    AJS,
    $,
    window
) {
    "use strict";

    /**
    * Depends on AJS.Confluence.EditorLoader.
    */
    var init = function(){
        // CONF-38277 There's no need to preload editor resources if the page is being displayed in a gadget
        var preloadEditorResources = !$('body').hasClass('page-gadget');

        if (preloadEditorResources) {
            /* CONFDEV-26003
             * This seems to be the cause of the performance regression, but any attempt that doesn't involve a
             * setTimeout with 1s delay doesn't fix it.
             *
             * Deferring editor async preloading until page load, as it shouldn't affect perceived performance,
             * and rebasing the affected performance build.
             */
            $(window).load(function() {
                AJS.debug("QuickComment: instigated background loading of the comment editor.");
                AJS.Confluence.EditorLoader.load();
            });
        }
        else {
            AJS.debug("QuickComment: editor preload is disabled");
        }

        AJS.Confluence.QuickEdit.enableHandlers();
        AJS.trigger("rte-quick-edit-enable-handlers");
    };

    return init;
});

require('confluence/module-exporter').safeRequire('confluence-quick-edit/init', function(Init) {
    var AJS = require('ajs');
    // Pre-load the editor (is there actually any point in having this delayed/in a different event loop?)
    // Useful for development if you have batching turned off and aren't testing Comments.
    if (AJS.DarkFeatures.isEnabled('disable-quick-edit')) {
        AJS.log("disable-quick-edit is turned on; run AJS.Confluence.EditorLoader.load() manually.");
    }
    else {
        AJS.toInit(Init);
    }
});