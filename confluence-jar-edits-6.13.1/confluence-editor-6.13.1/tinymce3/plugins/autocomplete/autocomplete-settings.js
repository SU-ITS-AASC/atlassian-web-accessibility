/**
 * @module confluence-editor/tinymce3/plugins/autocomplete/autocomplete-settings
 */
define('confluence-editor/tinymce3/plugins/autocomplete/autocomplete-settings', [
    'ajs'
], function(
    AJS
) {
    "use strict";

    return {
        Settings : {},

        /**
         * Custom logging function allows for more structured output. log4javascript on the horizon.
         * @param owner the "class" this logger is for
         *
         * Params accepted by the returned log function:
         *  - caller : name of the calling method
         *  - desc : the actual log body
         *  - obj : an object or string to be rendered
         */
        log : function (owner) {
            return function (caller, desc, obj) {
                // Log string objects on the same line, else on the next line
                var objIsStr = (obj != null && typeof obj !== "object");
                var objStr = obj != null ? (objIsStr ? (" = " + obj) : " >") : "";
                AJS.debug(owner + " - " + caller + " : " + (desc || null) + objStr);
                obj && !objIsStr && AJS.debug(obj);
            };
        }
    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/tinymce3/plugins/autocomplete/autocomplete-settings', 'Confluence.Editor.Autocompleter');