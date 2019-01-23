define(
"collaborative-editing-initialise-metrics-collection",
["confluence/legacy"],
function(Confluence) {
    'use strict';
    var initialiseMetrics = function() {
        var name = "confluence.editor.quickedit.loading.times";
        var triggers = {
            "confluence.editor": true,
            "confluence.editor.preload": true,
            "confluence.editor.quick.fetchContent": true,
            "confluence.editor.tinymce": true,
            "confluence.editor.synchrony": true,
            "confluence.editor.synchrony.CR": true,
            "confluence.editor.synchrony.connect": true,
            "confluence.editor.synchrony.deps": true,
            "confluence.editor.synchrony.init": true,
            "confluence.editor.synchrony.jsLoad": true,
            "confluence.editor.synchrony.snapshot": true,
            "confluence.editor.synchrony.unmarshal": true
        };
        var endingEvents = {
            "confluence.editor.synchrony.connect": true,
        };

        if (Confluence.registerPerformanceSession) {
            Confluence.registerPerformanceSession(name, triggers, endingEvents);
        }
    };

    return initialiseMetrics;
});

require('confluence/module-exporter')
    .safeRequire(
        'collaborative-editing-initialise-metrics-collection',
        function(initialiseMetrics) {
            initialiseMetrics();
        }
    );
