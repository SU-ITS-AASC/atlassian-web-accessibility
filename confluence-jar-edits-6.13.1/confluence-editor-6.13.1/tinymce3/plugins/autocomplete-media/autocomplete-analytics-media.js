/**
 * Analytic events for media-autocomplete
 */
require(["ajs"], function (AJS) {
    "use strict";

    AJS.bind("init.rte", function () {
        AJS.bind("rte-autocomplete-on-show", function (sender, data) {
            if (data.triggerChar === "!") {
                AJS.trigger("analytics", {name: "confluence.editor.autocomplete.trigger", data: {type: "media"}});
            }
        });

        AJS.bind("rte-autocomplete-on-insert", function (sender, data) {
            if (data.triggerChar === "!") {
                _addInsertMediaAnalyticEvent(data.selectedFile);
            }
        });

    });

    AJS.bind("rte-destroyed", function () {
        AJS.unbind("rte-autocomplete-on-insert");
        AJS.unbind("rte-autocomplete-on-show");
    });

    var _addInsertMediaAnalyticEvent = function (selectedFile) {
        if (selectedFile && selectedFile.name) {
            var data = { extension: selectedFile.name.split(".").pop(), type: "media"};
            AJS.trigger("analytics", {name: "confluence.editor.autocomplete.insert", data: data});
        }
    };
});