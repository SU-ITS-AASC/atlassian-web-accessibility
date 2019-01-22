/**
 * @module confluence-editor/profiles
 */
define('confluence-editor/profiles', [
    'jquery',
    'ajs'
], function(
    $,
    AJS
) {
    "use strict";

    function createProfileForCommentEditor() {

        var plugins = [
            'searchreplace',
            'confluenceimagedialog',
            'autocompletemacro',
            'confluencemacrobrowser',
            'confluenceleavecomment', // will ask for confirmation before leaving a dirty editor
            'confluencewatch',
            'autoresize'
        ];

        return {
            plugins: plugins
        };
    }

    function createProfileForPageEditor(options){
        var plugins = [
            'searchreplace',
            'confluencedrafts',
            // save bar UI elements will be inserted according to this ordering
            'confluenceimagedialog',
            'autocompletemacro',
            'confluencemacrobrowser',
            'flextofullsize',
            'referrer'
        ];

        if (AJS.Meta.getBoolean('shared-drafts') && AJS.DarkFeatures.isEnabled('unpublished-changes-lozenge')) {
            plugins.push('unpublishedchanges');
        }

        if (options && options.versionComment) {
            plugins.push('confluenceversioncomment');
        }

        if (options && options.notifyWatchers) {
            plugins.push('confluencenotifywatchers');
        }

        return {
            plugins: plugins
        };
    }

    function createProfileForTemplateEditor(){
        var plugins = [
            'searchreplace',
            // save bar UI elements will be inserted according to this ordering
            'confluenceimagedialog',
            'autocompletemacro',
            'confluencemacrobrowser',
            'confluenceleavetemplate', // confirmation on dirty editor
            'flextofullsize',
            'confluencetemplateeditor'
        ];

        return {
            plugins: plugins
        };
    }

    return {

        /**
         * Editor profile for comments
         * @param {object} options initialisation options
         * @param {object} options.watch includes the watch plugin
         */

        createProfileForCommentEditor: createProfileForCommentEditor,

        /**
         * Editor profile for page/blogpost edition
         */

        createProfileForPageEditor: createProfileForPageEditor,

        /**
         * Editor profile for template edition
         */

        createProfileForTemplateEditor: createProfileForTemplateEditor
    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/profiles', 'AJS.Confluence.Editor._Profiles');