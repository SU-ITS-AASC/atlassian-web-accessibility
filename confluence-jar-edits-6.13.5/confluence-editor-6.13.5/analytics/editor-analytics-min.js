define("confluence-editor/analytics/editor-analytics",["ajs","jquery","window"],function(d,k,l){function e(a,i){if(a&&(c[a]?c[a]++:c[a]=1,i)){var b=a+"Size";c[b]=c[b]?c[b]+i:i}}function g(){c.pageID=d.Meta.get("page-id");d.Confluence.Analytics.publish("confluence.editor.action",c);c={};clearTimeout(f);f=setTimeout(g,j)}var j=6E4,f,c={},h=0,m={Bold:"bold",confCharmap:"insert.symbol",confMonospace:"monospace",confTableRowToggleHeading:"table.row.toggle.heading",confTableColumnToggleHeading:"table.column.toggle.heading",
confTableSelectionToggleHighlight:"table.selection.toggle.highlight",ForeColor:"foreground.color",FormatBlock:"format.block",Indent:"indent",InsertHorizontalRule:"insert.horizontal.rule",InsertOrderedList:"insert.ordered.list",InsertUnorderedList:"insert.unordered.list",InsertWikiMarkup:"insert.wiki.markup",Italic:"italic",JustifyCenter:"justify.center",JustifyLeft:"justify.left",JustifyRight:"justify.right",mceConfimage:"insert.files.images",mceConflink:"insert.link",mceConfMacroBrowser:"open.other.macros.browser",
mceEmotion:"insert.emoticon",mceTableCopyRow:"table.copy.row",mceTableCutRow:"table.cut.row",mceTableDelete:"table.delete",mceTableDeleteCol:"table.delete.column",mceTableDeleteRow:"table.delete.row",mceTableInsertColAfter:"table.insert.column.after",mceTableInsertColBefore:"table.insert.column.before",mceTableInsertRowAfter:"table.insert.row.after",mceTableInsertRowBefore:"table.insert.row.before",mceTableMergeCells:"table.merge.cells",mceTablePasteRowBefore:"table.paste.row.before",mceTableSplitCells:"table.split.cells",
mcePageLayoutsToolbar:"page.layouts.toolbar.toggle",mcePageLayoutAddSection:"page.layouts.toolbar.add.section",mcePageLayoutRemoveSection:"page.layouts.toolbar.remove.section",mcePageLayoutMoveSectionDown:"page.layouts.toolbar.movedown.section",mcePageLayoutMoveSectionUp:"page.layouts.toolbar.moveup.section",mcePageLayoutChangeSection:"page.layouts.toolbar.change.section",mceConfShortcutDialog:"open.help.dialog",mceSearchReplaceToolbar:"search.replace.toolbar.toggle",mceConfSearchClose:"search.replace.toolbar.close",
mceConfSearch:"search",mceConfReplace:"replace",mceConfReplaceAll:"replace.all",Outdent:"outdent",Redo:"redo",Strikethrough:"strikethrough",subscript:"subscript",superscript:"superscript",Underline:"underline",Undo:"undo",InsertInlineTaskList:"insert.inline.tasklist",InsertInlineTaskListNoToggle:"insert.inline.tasklist.no.toggle"};return{bindAnalyticsToEditorCommands:function(){var a=require("tinymce");clearTimeout(f);f=setTimeout(g,j);a.activeEditor.onExecCommand.add(function(a,b){e(m[b])});a.activeEditor.onKeyPress.add(function(){e("keys")});
a.activeEditor.onKeyUp.add(function(a,b){46===b.keyCode?e("delete",h):8===b.keyCode&&e("backspace",h);h=a.selection.getContent().length});a.activeEditor.onMouseUp.add(function(a){h=a.selection.getContent().length});a.activeEditor.onPaste.add(function(a,b){e("paste",b.clipboardData.getData("text/plain").length)});a.activeEditor.onRemove.add(function(){g();clearTimeout(f)})},bindAnalyticsToIconClicks:function(){k("#rte-button-insert-table").on("click",function(){e("insert.table")})},bindAnalyticsPublishingToWindowUnload:function(){l.addEventListener("beforeunload",
function(){g()})}}});require("confluence/module-exporter").safeRequire("confluence-editor/analytics/editor-analytics",function(d){require("ajs").bind("rte-ready",function(){d.bindAnalyticsToEditorCommands();d.bindAnalyticsToIconClicks();d.bindAnalyticsPublishingToWindowUnload()})});