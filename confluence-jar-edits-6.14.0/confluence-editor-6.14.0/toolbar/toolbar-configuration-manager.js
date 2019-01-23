/**
 * @module confluence-editor/toolbar/toolbar-configuration-manager
 */
define('confluence-editor/toolbar/toolbar-configuration-manager', [
    'jquery'
], function(
    $
) {
    "use strict";

    /**
     * Editor toolbar configuration manager
     * At the moment it is tinymce agnostic.
     *
     * IMPORTANT: This is not meant to be used publicly since it will change once our toolbar
     * gets created dynamically on the client side instead of using a velocity template.
     */
    return function ($toolbar) {

        var TOOLBAR_GROUP_SELECTOR_MAP = {

            // left toolbar split
            Formatting: '.rte-toolbar-group-formatting',
            Style: '.rte-toolbar-group-style',
            Indentation: '.rte-toolbar-group-indentation',
            Lists: '.rte-toolbar-group-lists',
            Tasks: '.rte-toolbar-group-task-lists',
            Justification: '.rte-toolbar-group-justification',
            Links: '.rte-toolbar-group-link',
            Table: '.rte-toolbar-group-table',
            Insert: '.rte-toolbar-group-insert',
            Undo: '.rte-toolbar-group-undo',
            PageLayouts : '#page-layout-2-group',

            // right toolbar split
            SearchReplace: '.rte-toolbar-group-searchreplace',
            Help: '.rte-toolbar-group-help'

        };

        function hideGroup(groupSelector){
            $(groupSelector, $toolbar).hide();
        }

        /**
         * Hide a specific toolbar group
         *
         * @param {object/boolean} groupOptions. It can be a boolean, so we disable the toolbar group at all,
         * or it can contain an object, like { Bold : false}, for when we implement more
         * granular button visibility control in the future.
         * @param {string} groupSelector toolbar group selector
         */
        function setVisibilityForGroup(groupOptions, groupSelector) {
            if (groupOptions === false){
                hideGroup(groupSelector);
            }

            // we probably don't need it right now, but in the future we can be more granular
            // maintaining this same API just by parsing the options parameter as an object as well,
            // after checking that is not a boolean, like in:
            // options = { Formatting.bold : true }'
        }

        function configureToolbar (toolbarOptions){
            if (toolbarOptions === false) { // explicitly hiding toolbar
                $toolbar.hide();
                return;
            }

            toolbarOptions = toolbarOptions || {};

            for (var key in toolbarOptions){
                if (toolbarOptions.hasOwnProperty(key)) {
                    if (TOOLBAR_GROUP_SELECTOR_MAP[key]) { // valid config option
                        setVisibilityForGroup(toolbarOptions[key], TOOLBAR_GROUP_SELECTOR_MAP[key]);
                    }
                }
            }
        }

        return {

            /**
             * Sets what default toolbar groups to display.
             *
             * @param {object} toolbarOptions toolbar display options
             *
             *      toolbar: {
             *           Formatting : false,
             *           Style: false,
             *           Indentation: false,
             *           Lists: false,
             *           Justification: true,
             *           Links: false,
             *           Table: false,
             *           Insert: false,
             *           Undo: false,
             *           SearchReplace: false,
             *           Help: false
             *       }
             */
            configureToolbar: configureToolbar
        };
    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/toolbar/toolbar-configuration-manager', 'AJS.Confluence._ToolbarConfigurationManager');
