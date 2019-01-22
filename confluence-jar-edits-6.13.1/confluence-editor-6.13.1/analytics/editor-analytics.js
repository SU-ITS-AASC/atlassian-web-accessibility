/**
 * @module confluence-editor/analytics/editor-analytics
 */
define('confluence-editor/analytics/editor-analytics', [
    'ajs',
    'jquery',
    'window'
], function(
    AJS,
    $,
    window
) {
    "use strict";

    var PUBLISH_INTERVAL = 60 * 1000;

    var analyticsTimer;
    var events = {};
    var selectionLen = 0;

    var EditorAnalytics = {};

    EditorAnalytics.bindAnalyticsToEditorCommands = function () {
        var tinymce = require('tinymce');

        clearTimeout(analyticsTimer);
        analyticsTimer = setTimeout(publishAnalytics, PUBLISH_INTERVAL);

        tinymce.activeEditor.onExecCommand.add(function (ed, cmd, ui, val) {
            addToEventLog(mapToAnalyticsActionName[cmd]);
        });

        tinymce.activeEditor.onKeyPress.add(function(ed, e) {
            addToEventLog('keys');
        });

        tinymce.activeEditor.onKeyUp.add(function(ed, e) {
            if (e.keyCode === 46) {
                addToEventLog('delete', selectionLen);
            } else if (e.keyCode === 8) {
                addToEventLog('backspace', selectionLen);
            }
            selectionLen = ed.selection.getContent().length;
        });

        tinymce.activeEditor.onMouseUp.add(function(ed, e) {
            selectionLen = ed.selection.getContent().length;
        });

        tinymce.activeEditor.onPaste.add(function(ed, e) {
            addToEventLog('paste', e.clipboardData.getData('text/plain').length);
        });

        //happens when in-line comment is closed (removed from DOM)
        tinymce.activeEditor.onRemove.add(function (ed) {
            publishAnalytics();
            clearTimeout(analyticsTimer);
        });
    };

    // The editor doesn't fire commands for every action, we'll handle the missing cases here
    EditorAnalytics.bindAnalyticsToIconClicks = function () {
        $('#rte-button-insert-table').on('click', function () {
            addToEventLog('insert.table');
        });
    };

    EditorAnalytics.bindAnalyticsPublishingToWindowUnload = function () {
        // Gets swallowed based on dirty changes and in different situations
        window.addEventListener("beforeunload", function (e) {
            publishAnalytics();
        });
    };

    function addToEventLog (actionName, length) {
        if (actionName) {
            if (events[actionName]) {
                events[actionName]++;
            } else {
                events[actionName] = 1;
            }

            if (length) {
                var sizeKey = actionName + 'Size';
                if (events[sizeKey]) {
                    events[sizeKey] += length;
                } else {
                    events[sizeKey] = length;
                }
            }
        }
    }

    function publishAnalytics () {
        events['pageID'] = AJS.Meta.get('page-id');
        AJS.Confluence.Analytics.publish('confluence.editor.action', events);
        events = {};
        clearTimeout(analyticsTimer);
        analyticsTimer = setTimeout(publishAnalytics, PUBLISH_INTERVAL);
    }

    var mapToAnalyticsActionName = {
        Bold: 'bold',
        confCharmap: 'insert.symbol',
        confMonospace: 'monospace',
        confTableRowToggleHeading: 'table.row.toggle.heading',
        confTableColumnToggleHeading: 'table.column.toggle.heading',
        confTableSelectionToggleHighlight: 'table.selection.toggle.highlight',
        ForeColor: 'foreground.color',
        FormatBlock: 'format.block',
        Indent: 'indent',
        InsertHorizontalRule: 'insert.horizontal.rule',
        InsertOrderedList: 'insert.ordered.list',
        InsertUnorderedList: 'insert.unordered.list',
        InsertWikiMarkup: 'insert.wiki.markup',
        Italic: 'italic',
        JustifyCenter: 'justify.center',
        JustifyLeft: 'justify.left',
        JustifyRight: 'justify.right',
        mceConfimage: 'insert.files.images',
        mceConflink: 'insert.link',
        mceConfMacroBrowser: 'open.other.macros.browser',
        mceEmotion: 'insert.emoticon',
        mceTableCopyRow: 'table.copy.row',
        mceTableCutRow: 'table.cut.row',
        mceTableDelete: 'table.delete',
        mceTableDeleteCol: 'table.delete.column',
        mceTableDeleteRow: 'table.delete.row',
        mceTableInsertColAfter: 'table.insert.column.after',
        mceTableInsertColBefore: 'table.insert.column.before',
        mceTableInsertRowAfter : 'table.insert.row.after',
        mceTableInsertRowBefore: 'table.insert.row.before',
        mceTableMergeCells: 'table.merge.cells',
        mceTablePasteRowBefore: 'table.paste.row.before',
        mceTableSplitCells: 'table.split.cells',
        mcePageLayoutsToolbar: 'page.layouts.toolbar.toggle',
        mcePageLayoutAddSection: 'page.layouts.toolbar.add.section',
        mcePageLayoutRemoveSection: 'page.layouts.toolbar.remove.section',
        mcePageLayoutMoveSectionDown: 'page.layouts.toolbar.movedown.section',
        mcePageLayoutMoveSectionUp: 'page.layouts.toolbar.moveup.section',
        mcePageLayoutChangeSection: 'page.layouts.toolbar.change.section',
        mceConfShortcutDialog: 'open.help.dialog',
        mceSearchReplaceToolbar: 'search.replace.toolbar.toggle',
        mceConfSearchClose: 'search.replace.toolbar.close',
        mceConfSearch: 'search',
        mceConfReplace: 'replace',
        mceConfReplaceAll: 'replace.all',
        Outdent: 'outdent',
        Redo: 'redo',
        Strikethrough: 'strikethrough',
        subscript: 'subscript',
        superscript: 'superscript',
        Underline: 'underline',
        Undo: 'undo',
        InsertInlineTaskList: 'insert.inline.tasklist',
        InsertInlineTaskListNoToggle: 'insert.inline.tasklist.no.toggle'
    };

    return EditorAnalytics;
});

require('confluence/module-exporter').safeRequire('confluence-editor/analytics/editor-analytics', function(EditorAnalytics) {
    require('ajs').bind('rte-ready', function() {
        EditorAnalytics.bindAnalyticsToEditorCommands();
        EditorAnalytics.bindAnalyticsToIconClicks();
        EditorAnalytics.bindAnalyticsPublishingToWindowUnload();
    });
});