/**
 * @module confluence-editor/macrobrowser/tinymce-macrobrowser
 */
define('confluence-editor/macrobrowser/tinymce-macrobrowser', [
    'jquery',
    'tinymce',
    'ajs',
    'confluence/legacy',
    'confluence/api/constants'
], function(
    $,
    tinymce,
    AJS,
    Confluence,
    CONSTANTS
) {
    "use strict";

    return {
        /**
         * The current selection range in the editor
         */
        storedRange: null,
        /**
         * The current bookmark location in the editor
         */
        bookmark: null,

        getCurrentNode: function () {
            return $(tinymce.activeEditor.selection.getNode());
        },
        isMacroDiv: function (node) {
            return $(node).hasClass("wysiwyg-macro");
        },
        isMacroTag: function (node) {
            var $node = $(node);
            return $node.hasClass("wysiwyg-macro") || $node.hasClass("editor-inline-macro");
        },
        isBodylessMacro: function (node) { /** FIXME: This method's name is misleading. */
            return $(node).hasClass("editor-inline-macro");
        },
        isMacroWithBody: function (node) {
            return $(node).hasClass("wysiwyg-macro");
        },
        isMacroStartTag: function (node) {
            return $(node).hasClass("wysiwyg-macro-starttag");
        },
        isMacroEndTag: function (node) {
            return $(node).hasClass("wysiwyg-macro-endtag");
        },
        isMacroBody: function (node) {
            return $(node).hasClass("wysiwyg-macro-body");
        },
        hasMacroBody: function (node) {
            return $(node).attr("macrohasbody") == "true";
        },
        /**
         * Returns an array of macro names for macro divs enclosing the current node.
         */
        getNestingMacros: function (node) {
            var $node = $(node || this.getCurrentNode());
            var nestingMacros = [];
            $node.parents(".wysiwyg-macro").each(function () {
                nestingMacros.push($(this).attr("data-macro-name"));
            });
            return nestingMacros;
        },

        logMCESelection: function (title) {
            var s = tinymce.activeEditor.selection;
            AJS.log("******************************");
            AJS.log("Logging TinyMCE selection title:    " + title);
            AJS.log("Bookmark:");
            AJS.log(s.getBookmark());
            var rangeNodeText = $(s.getRng().startContainer).text() || $(s.getRng().startContainer.parentNode).text();
            AJS.log("Range: " + rangeNodeText);
            AJS.log(s.getRng());
        },

        getSelectedMacro: function (editor) {
            var t = tinymce.confluence.macrobrowser;
            var $selectionNode = t.getCurrentNode();
            AJS.log("getSelectedMacro: $selectionNode=" + $selectionNode[0]);
            return t.isMacroDiv($selectionNode) ? $selectionNode : tinymce.confluence.MacroUtils.isInMacro($selectionNode);
        },

        openMacro: function (macroDefinition) {
            AJS.MacroBrowser.open({
                selectedMacro: macroDefinition,
                onComplete: tinymce.confluence.macrobrowser.macroBrowserComplete,
                onCancel: tinymce.confluence.macrobrowser.macroBrowserCancel
            });
        },

        editMacro: function (macroNode) {
            var t = tinymce.confluence.macrobrowser;
            var $macroDiv = $(macroNode);
            t.editedMacroDiv = $macroDiv[0];

            /**
             * serialize() to ensure that any bogus tinymce tags + dirty browser markup are cleaned up.
             * macro node should be cloned before serialization, as we don't want serialization tampering with the actual DOM element.
             */
            var macroHtml = AJS.Rte.getEditor().serializer.serialize($macroDiv.clone()[0], {
                forced_root_block: false // Prevent serialize from wrapping in a <p></p>
            });

            AJS.Rte.getEditor().selection.select($macroDiv[0]);
            AJS.Rte.BookmarkManager.storeBookmark();

            $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: CONSTANTS.CONTEXT_PATH + "/rest/tinymce/1/macro/definition",
                data: $.toJSON({
                    contentId: Confluence.getContentId(),
                    macroHtml: macroHtml
                }),
                dataType: "text",
                success: function (macro) {
                    t.openMacro($.secureEvalJSON(macro));
                }
            });

        },

        /**
         * Called to insert a new macro.
         * If user has not selected text, just open the Macro Browser.
         * If user has selected text, it will convert it to wiki markup for the body of the macro
         */
        macroBrowserToolbarButtonClicked: function (options) {

            var t = tinymce.confluence.macrobrowser;
            var editor = tinymce.activeEditor;
            var $node = t.getCurrentNode();
            AJS.Rte.BookmarkManager.storeBookmark();

            // Inserting new macro
            var settings = $.extend({
                presetMacroName: null,
                nestingMacros: t.getNestingMacros($node),
                onComplete: t.macroBrowserComplete,
                onCancel: t.macroBrowserCancel,
                mode: "insert",
                selectedHtml: "",
                selectedText: ""
            }, options);

            if (!options.ignoreEditorSelection) {
                settings.selectedHtml = editor.selection.getContent();
                settings.selectedText = editor.selection.getContent({format: "text"});
            }
            AJS.MacroBrowser.open(settings);
        },
        /**
         * Takes macro markup (usually generated by the Macro Browser) and inserts/updates the relevant Macro macroHeader
         * in the RTE.
         * @param macro macro object describing inserted/edited macro
         */
        macroBrowserComplete: function (macro) {
            var t = tinymce.confluence.macrobrowser;
            var macroRenderRequest = {
                contentId: AJS.Meta.get('content-id') || "0",
                macro: {
                    name: macro.name,
                    params: macro.params,
                    defaultParameterValue: macro.defaultParameterValue,
                    body: macro.bodyHtml
                }
            };

            AJS.Rte.BookmarkManager.restoreBookmark();

            if (t.editedMacroDiv) {
                tinymce.confluence.MacroUtils.insertMacro(macroRenderRequest, t.editedMacroDiv);
                delete t.editedMacroDiv;
            } else {
                tinymce.confluence.MacroUtils.insertMacro(macroRenderRequest);
            }
        },

        // Called when the macro browser is closed to clean up and reset data.
        macroBrowserCancel: function () {
            var t = tinymce.confluence.macrobrowser;
            AJS.Rte.BookmarkManager.restoreBookmark();
            t.editedMacroDiv = null;
            t.editedMacro = null;
        }
    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/macrobrowser/tinymce-macrobrowser', 'tinymce.confluence.macrobrowser');