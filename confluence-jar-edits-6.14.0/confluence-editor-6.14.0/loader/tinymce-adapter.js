/**
 * @module confluence-editor/loader/tinymce-adapter
 */
define('confluence-editor/loader/tinymce-adapter', [
    'ajs',
    'confluence/legacy',
    'jquery',
    'confluence/meta',
    'confluence-editor/support/atlassian-editor-support'
], function(
    AJS,
    Confluence,
    $,
    Meta,
    EditorSupport
) {
    'use strict';
    // Please read CONFDEV-26277 for the whole context.
    // By using AMD, we unveiled CQ-1043 in CQ so we need to delay the AMD
    // bit until CQ-1043 gets resolved

    // In the main time, we will undo the AMD related changes but leave the code
    // commented out, to better show our intentions and work progress.

    /********/

    // This function is a duplication of
    // confluence-editor/src/main/resources/tinymce3/settings/tinymce-default-settings.js
    //
    // When CQ-1043 gets fixed and we put AMD back, this method should be removed, and
    // we should be back to use the "settings" require dependency.
    //
    function getDefaultSettings (){
        var contextPath = AJS.contextPath();

        var plugins = [

            // please be aware that reordering this list may
            // not be such a good idea

            "auiwindowmanager",
            "table",
            "emotions",
            "confluence",
            "macroplaceholder",
            "customtoolbar",
            "insertwikimarkup",
            "propertypanel",
            "keyboardshortcuts",
            "confmonospace",
            "confcharmap",
            "lists",
            "aePaste",
            "cursorTarget",
            "confluencecleanupplugin",
            "conftable",
            "confluencepastetableplugin",
            "confluencepastemacroplugin",
            "pagelayoutplugin",
            "iosediting",
            "autoconvert",
            "confluencelist",
            "deletecommand",
            "draggable",
            "confluencesortabletablesplugin",
            "textplaceholders",
            "linkbrowser",
            "insertfiles",
            "tableAnalytics"
        ];

        if (AJS.DarkFeatures.isEnabled('confluence.table.resizable')) {
            plugins.push('tableContentWrapper');
        }

        return  {
            //atlassian specific settings
            autoresize_min_height: "100%", //default if not specified in AJS.Meta

            // general
            width: "100%",
            height: "100%",
            document_base_url: Confluence.getBaseUrl() + "/",
            plugins: plugins.join(','),

            // advanced theme params
            theme: "atlassian",
            // event though we don't use the advanced theme to generate the toolbar, we need the controls registered in TinyMCE
            theme_advanced_buttons1: "formatselect,bold,italic,underline,strikethrough,forecolor,separator," +
            "table,row_before,row_after,delete_row,col_before,col_after,delete_col,delete_table,separator," +
            "bullist,numlist,tasklist,outdent,indent,blockquote,justifyleft,justifycenter,justifyright,justifyfull,separator,sup,sub,separator," +
            "undo,redo,separator,confimage,conf_macro_browser,separator,code,customtoolbar,help,monospace,separator,searchreplace,linkbrowserButton",
            theme_advanced_toolbar_location: "top",
            theme_advanced_toolbar_align: "left",
            theme_advanced_resizing: false,
            theme_advanced_resize_horizontal: false,
            theme_advanced_statusbar_location: "none",
            theme_advanced_path: false,
            theme_advanced_blockformats: "p,h1,h2,h3,h4,h5,h6,pre,blockquote",

            // selectors for tinymce editors
            mode: "specific_textareas",
            editor_selector: "tinymce-editor",

            // layout settings
            body_class: "wiki-content",
            popup_css: false,
            content_css: false,
            editor_css: false,

            // undo settings
            custom_undo_redo: true,
            custom_undo_redo_levels: 20,

            // confluence-specific settings
            context_path: contextPath,
            plugin_action_base_path: contextPath + "/plugins/tinymce",
            editor_plugin_action_base_path: contextPath + "/plugins/editor/tinymce",
            page_id: AJS.Meta.get('page-id'),
            draft_type: null,
            form_name: AJS.Meta.get('form-name'),
            space_key: encodeURI(AJS.Meta.get('space-key')),
            confluence_popup_width: 620,
            confluence_popup_height: 550,
            editor_id: "wysiwygTextarea"
        };
    }

    function getProfileByContentType(contentType, isNewPage) {
        if (contentType === "template") {
            return AJS.Confluence.Editor._Profiles.createProfileForTemplateEditor();
        } else if (contentType === "comment") {
            return AJS.Confluence.Editor._Profiles.createProfileForCommentEditor();
        } else { //page, blogpost
            var options = {
                versionComment: !isNewPage,
                notifyWatchers: !isNewPage
            };
            return AJS.Confluence.Editor._Profiles.createProfileForPageEditor(options);
        }
    }

    /**
     * Initialises the TinyMCE editor. This can be run without waiting for DOM ready if the language pack variable.
     * TinyMCELang is available before calling this function.
     */
    return function() {
        var settings = getDefaultSettings();

        // alter settings for drafts
        if (settings.page_id == 0) { // please double check this var type if you remove the loose equality check
            settings.page_id = null;
            settings.draft_type = AJS.Meta.get('draft-type');
        }

        // Settings that are derived from the DOM cannot be assumed to exist yet so defer retrieval of their values
        AJS.Rte.BootstrapManager.addBeforeInitCallback(function(s) {
            s.contentCssTags = $("script[title='editor-css']").html();
            s.language = AJS.Meta.get('action-locale');

            var minHeight = AJS.Meta.get('min-editor-height');
            if (minHeight) {
                s.autoresize_min_height = minHeight;
            }
        });

        // this plugins will be added by default to any instance of the editor that gets created.
        // eventually we should remove them and make that every editor context opt-in for them
        var autocompleteEnabled = !(AJS.Meta.get('remote-user') && AJS.Meta.get('confluence.prefs.editor.disable.autocomplete'));
        if (autocompleteEnabled){
            settings.plugins +=',autocomplete,autocompletelink,autocompletemedia';
        }

        var autoStart = !!AJS.Meta.get('auto-start'); // slow comment, edit page/blogpost and template
        if (autoStart) {
            var editorContent = $('#' + settings.editor_id);
            // Content-type can be changed from page to comment on view-page, so we need to check both properties
            if (EditorSupport.isCollaborativeContentType()) {
                AJS.trigger("rte-collaborative-content-ready", {
                    title: Meta.get('page-title') || Meta.get('original-content-title') || '',
                    editorContent: editorContent.val(),
                    confRev: Meta.get('conf-revision'),
                    syncRev: $('#syncRev').val(),
                    syncRevSource: Meta.get('sync-revision-source')
                });
            }

            Confluence.debugTime("confluence.editor");

            if (autocompleteEnabled) {
                settings.plugins += ',autocompletemacro';
            }

            var newPage = ('' + AJS.Meta.get('page-id')) === '0';
            var profile = getProfileByContentType(AJS.Meta.get("content-type"), newPage);

            var contextPlugins = profile.plugins.join(',');
            if (contextPlugins){
                settings.plugins +="," + contextPlugins;
            }

            AJS.Rte.BootstrapManager.preInitialise(settings);
            AJS.Rte.BootstrapManager.initialise();

            Confluence.debugTimeEnd("confluence.editor");
        } else {

            // leave the editor ready to be quickly initialised
            // this is the case of quick edit, quick comments, or quick custom editor
            // We just use the default plugins. The caller must provide
            // any additional plugins to initialise the editor with on
            // the AJS.Rte.BootstrapManager.initialise() call

            // CQ will fall in this case as well, as it calls tinymce.init manually
            AJS.Rte.BootstrapManager.preInitialise(settings);
        }
    };
});

require('confluence/module-exporter').safeRequire('confluence-editor/loader/tinymce-adapter', function(initTinyMce) {
    require('ajs').toInit(initTinyMce);
});
