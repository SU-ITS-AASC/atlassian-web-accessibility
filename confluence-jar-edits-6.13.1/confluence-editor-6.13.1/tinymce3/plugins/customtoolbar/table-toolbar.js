/**
 * @module confluence-editor/tinymce3/plugins/customtoolbar/table-toolbar
 *
 */
define('confluence-editor/tinymce3/plugins/customtoolbar/table-toolbar', [
    'ajs',
    'jquery',
    'confluence/legacy',
    'tinymce',
    'document',
    'window'
],
function (
    AJS,
    $,
    Confluence,
    tinyMCE,
    document,
    window
) {
    'use strict';
    return {
        initContextToolbars: function (e, editor) {
            var handlingNodeChange;

            var getLang = function (key) {
                var title = editor.getLang(key);
                var shortcut = editor.getLang(key + '_shortcut', '');
                if (shortcut) {
                    title += ' (' + shortcut + ')';
                }
                return title;
            };

            var isChildOfTable = function (node) {
                var table = $(node).closest('table:not(.wysiwyg-macro)');
                return table.length;
            };

            var hasColOrRowSpan = function (node) {
                //not the most efficent of solutions
                //but the table plugin is rather, well basically i am not touching it.
                function parseSpan(node, type) {
                    return parseInt(node.attr(type), 10);
                }

                return node.filter(function (index) {
                    var temp = $(this);
                    return parseSpan(temp, 'rowspan') > 1 || parseSpan(temp, 'colspan') > 1;
                }).length >= 1;
            };

            var updateSplitButton = function (node) {

                var clickedCell = $(node).closest('td,th');
                var selectedCells = $('.mceSelected', clickedCell.closest('table'));

                if (hasColOrRowSpan(clickedCell.add(selectedCells))) {
                    editor.plugins.customtoolbar.enableToolbarButton('aui-iconfont-table-split');
                } else {
                    editor.plugins.customtoolbar.disableToolbarButton('aui-iconfont-table-split');
                }
            };

            var updateInsertNumberButton = function (node) {
                 if($(node).closest('table').find('.numberingColumn').length > 0) {
                     $('#insert-numbering-column').addClass('active');
                 } else {
                     $('#insert-numbering-column').removeClass('active');
                 }
            };

            var updateTableMode = function(node) {
                $.fn.updateTableModeInToolbar && $(node).closest('table').updateTableModeInToolbar();
            };

            var storageManager = AJS.storageManager('atlassian.editor', 'tables');

            // Can't follow the event delegation model, as NodeChange events don't supply an
            // event parameter (only an element), so the type of the event cannot be determined.
            editor.onNodeChange.add(function (ed, cm, e) {
                // required, as show/removing of toolbar seems to fire another nodeChangeEvent
                // CONFDEV-3419: Parent node null check to prevent table toolbar from being removed when
                // callbacks occur with the document or body nodes (this may happen when multiple cells are selected).
                var body = $('body');
                var animate = !body.hasClass('no-tools') || body.hasClass('no-tools-toolbars-visible');
                if ((!handlingNodeChange) && (e.parentNode != null) && (e.nodeName !== 'BODY')) {
                    handlingNodeChange = true;
                    if (isChildOfTable(e)) {
                        $(document).trigger('createContextToolbarRow.Toolbar', {
                            buttons: Confluence.Editor.tableToolbar.Buttons,
                            topToolbar: true,
                            animate: animate
                        }).trigger('enableContextToolbarRow.Toolbar');

                        if (AJS.DarkFeatures.isEnabled('confluence.table.resizable')) {
                            updateTableMode(e);
                        }
                        updateSplitButton(e);
                        updateInsertNumberButton(e);
                    } else {
                        $(document).trigger('disableContextToolbarRow.Toolbar', {
                            animate: animate
                        });
                    }
                    handlingNodeChange = false;
                }
            });

            editor.onUndo.add(function (ed, cm, e) {
                //seems the bookmark gets restored after the node change from setcontent is triggered. Odd.
                ed.nodeChanged();
            });


            function highlightColourPicker() {
                var colourPicker = $('<ul/>').addClass('table-highlight-picker');
                var colourClasses = ['grey', 'red', 'green', 'blue', 'yellow', ''];
                var colourNames = [
                    getLang('table.cell_color_grey'),
                    getLang('table.cell_color_red'),
                    getLang('table.cell_color_green'),
                    getLang('table.cell_color_blue'),
                    getLang('table.cell_color_yellow'),
                    getLang('table.cell_color_clear')
                ];
                var removeColour = [false, false, false, false, false, true];

                $.each(colourClasses, function(idx, colour) {
                    var li = $('<li/>');
                    var link = $('<a href="#"></a>');

                    if (removeColour[idx]) {
                        link.addClass('remove-highlight')
                            .attr('data-remove-highlight', true);
                    } else {
                        link.addClass('highlight-' + colour)
                            .attr('data-highlight-colour', colour);
                    }
                    link.attr('title', colourNames[idx]);
                    link.attr('aria-label', colourNames[idx]);
                    link.tooltip();
                    li.append(link);
                    colourPicker.append(li);
                });

                return colourPicker;
            }

            function selectColour(e) {
                var $buttonLink = $(this);
                var colourWidget = $('#table-highlight-group');
                var currentHighlightColour = colourWidget.attr('data-highlight-colour');
                var currentHighlightRemoval = colourWidget.attr('data-remove-highlight');
                if (currentHighlightColour) {
                    colourWidget.removeClass('highlight-' + currentHighlightColour);
                    colourWidget.removeAttr('data-highlight-colour');
                }
                colourWidget.removeClass('remove-highlight');

                if (currentHighlightRemoval) {
                    colourWidget.removeAttr('data-remove-highlight');
                }

                var highlightColour = $buttonLink.attr('data-highlight-colour');
                if (highlightColour) {
                    colourWidget.addClass('highlight-' + highlightColour);
                    colourWidget.attr('data-highlight-colour', highlightColour);
                }
                if ($buttonLink.attr('data-remove-highlight')) {
                    colourWidget.addClass('remove-highlight');
                    colourWidget.attr('data-remove-highlight', true);
                }

                editor.focus();
                editor.execCommand('confTableSelectionToggleHighlight', false, {
                    alwaysHighlight: true
                });
                e.preventDefault();
            }

            function tableModeList() {
                var $ul = $('<ul/>').addClass('table-mode-list');
                var tableModes = [
                    {
                        name: getLang('table.responsive'),
                        mceCmd: 'mceAutoWidth',
                        tooltip: getLang('table.responsive_tooltip')
                    },
                    {
                        name: getLang('table.fixed_width'),
                        mceCmd: 'mceFixedWidth',
                        tooltip: getLang('table.fixed_width_tooltip')
                    }
                ];

                $.each(tableModes, function (idx, mode) {
                    var $li = $('<li/>').addClass('dropdown-item').attr('data-tooltip', mode.tooltip);
                    var $link = $('<a href="#">' + mode.name + '</a>').addClass('item-link');
                    $li.on('click', function () {
                        tinyMCE.execCommand(mode.mceCmd, false, '');
                    });

                    $ul.append($li.append($link));
                });
                return $ul;
            }

            editor.onInit.add(function () {
                $(document).delegate('#table-highlight-colour .aui-dropdown a', 'click', selectColour);
            });

            editor.onRemove.add(function () {
                $(document).undelegate('#table-highlight-colour .aui-dropdown a', 'click', selectColour);
            });

            var classPrefix = 'aui-icon aui-icon-small aui-iconfont-';
            Confluence.Editor.tableToolbar = {
                Buttons: [
                    new Confluence.Editor.Toolbar.Components.Group([
                        new Confluence.Editor.Toolbar.Components.Button({
                            text: getLang('table.row_before_desc'),
                            iconClass: classPrefix + 'insert-row-before',
                            click: function () {
                                tinyMCE.execCommand('mceTableInsertRowBefore', false, '');
                            }
                        }),

                        new Confluence.Editor.Toolbar.Components.Button({
                            text: getLang('table.row_after_desc'),
                            iconClass: classPrefix + 'insert-row-after',
                            click: function () {
                                tinyMCE.execCommand('mceTableInsertRowAfter', false, '');
                            }
                        }),

                        new Confluence.Editor.Toolbar.Components.Button({
                            text: getLang('table.delete_row_desc'),
                            iconClass: classPrefix + 'remove-row',
                            click: function () {
                                tinyMCE.execCommand('mceTableDeleteRow', false, '');
                            }
                        })
                    ]),

                    new Confluence.Editor.Toolbar.Components.Group([
                        new Confluence.Editor.Toolbar.Components.Button({
                            text: getLang('table.cut_row_desc'),
                            iconClass: classPrefix + 'cut-table-row',
                            click: function () {
                                tinyMCE.execCommand('mceTableCutRow', false, '');
                                editor.plugins.customtoolbar.enableToolbarButton('aui-iconfont-paste-table-row');
                            }
                        }),

                        new Confluence.Editor.Toolbar.Components.Button({
                            text: getLang('table.copy_row_desc'),
                            iconClass: classPrefix + 'copy-table-row',
                            click: function () {
                                tinyMCE.execCommand('mceTableCopyRow', false, '');
                                editor.plugins.customtoolbar.enableToolbarButton('aui-iconfont-paste-table-row');
                            }
                        }),

                        new Confluence.Editor.Toolbar.Components.Button({
                            text: getLang('table.paste_row_before_desc'),
                            iconClass: classPrefix + 'paste-table-row',
                            click: function () {
                                tinyMCE.execCommand('mceTablePasteRowBefore', false, '');
                            },
                            disabled: !storageManager.doesContain('copied')
                        })
                    ]),

                    new Confluence.Editor.Toolbar.Components.Group([
                        new Confluence.Editor.Toolbar.Components.Button({
                            text: getLang('table.col_before_desc'),
                            iconClass: classPrefix + 'insert-column-before',
                            click: function () {
                                tinyMCE.execCommand('mceTableInsertColBefore', false, '');
                            }
                        }),

                        new Confluence.Editor.Toolbar.Components.Button({
                            text: getLang('table.col_after_desc'),
                            iconClass: classPrefix + 'insert-column-after',
                            click: function () {
                                tinyMCE.execCommand('mceTableInsertColAfter', false, '');
                            }
                        }),

                        new Confluence.Editor.Toolbar.Components.Button({
                            text: getLang('table.delete_col_desc'),
                            iconClass: classPrefix + 'remove-column',
                            click: function () {
                                tinyMCE.execCommand('mceTableDeleteCol', false, '');
                            }
                        })
                    ]),

                    new Confluence.Editor.Toolbar.Components.Group([
                        new Confluence.Editor.Toolbar.Components.Button({
                            text: getLang('table.merge_cells_desc'),
                            iconClass: classPrefix + 'merge-table-cells',
                            click: function () {
                                tinyMCE.execCommand('mceTableMergeCells', false, '');
                            }
                        }),

                        new Confluence.Editor.Toolbar.Components.Button({
                            text: getLang('table.split_cells_desc'),
                            iconClass: classPrefix + 'split-merged-table-cells',
                            click: function () {
                                tinyMCE.execCommand('mceTableSplitCells', false, '');
                            }
                        })
                    ]),

                    new Confluence.Editor.Toolbar.Components.Group([
                        new Confluence.Editor.Toolbar.Components.Button({
                            text: getLang('table.row_highlight'),
                            iconClass: classPrefix + 'heading-row',
                            click: function () {
                                tinyMCE.execCommand('confTableRowToggleHeading', false);
                                tinyMCE.execCommand('mceTableUpdateNumberingCol', false);
                            }
                        }),

                        new Confluence.Editor.Toolbar.Components.Button({
                            text: getLang('table.col_highlight'),
                            iconClass: classPrefix + 'heading-column',
                            click: function () {
                                tinyMCE.execCommand('confTableColumnToggleHeading', false);
                            }
                        }),

                        new Confluence.Editor.Toolbar.Components.Button({
                            text: getLang('table.numbering_column_desc'),
                            iconClass: 'aui-icon aui-icon-small aui-iconfont-insert-numbered-column',
                            id: 'insert-numbering-column',
                            click: function () {
                                tinyMCE.execCommand('mceTableInsertNumberingCol', false, '');
                            }
                        })
                    ]),

                    new Confluence.Editor.Toolbar.Components.SplitGroup([
                        new Confluence.Editor.Toolbar.Components.Button({
                            text: getLang('table.selection_highlight'),
                            iconClass: classPrefix + 'paint-bucket',
                            click: function () {
                                tinyMCE.execCommand('confTableSelectionToggleHighlight', false);
                            }
                        })
                    ], {
                        id: 'table-highlight-group',
                        dropDownOptions: {
                            id: 'table-highlight-colour',
                            dropDownContent: highlightColourPicker(),
                            alignment: 'right'
                        },
                        postProcess: function (group) {
                            group.attr('data-highlight-colour', 'grey');
                            group.addClass('highlight-grey');

                            // Overlay for showing the current highlight colour
                            var highlightIndicator = $('<span>&nbsp;</span>');
                            highlightIndicator.addClass('highlight-indicator');

                            group.find('.icon.aui-iconfont-paint-bucket').after(highlightIndicator);
                        }
                    }),

                    new Confluence.Editor.Toolbar.Components.Group([
                        new Confluence.Editor.Toolbar.Components.Button({
                            text: getLang('table.del'),
                            iconClass: classPrefix + 'remove-table',
                            click: function () {
                                tinyMCE.execCommand('mceTableDelete', false, '');
                            }
                        })
                    ])
                ],

                // takes an array of {type: tinymceEvent, shouldTrigger: function, callback: function, missed: function }
                Events: []
            };

            if (AJS.DarkFeatures.isEnabled('confluence.table.resizable')) {
                Confluence.Editor.tableToolbar.Buttons.splice(0, 0, new Confluence.Editor.Toolbar.Components.Group([
                        new Confluence.Editor.Toolbar.Components.DropDownButton({
                            id: 'table-mode-picker',
                            text: getLang('table.auto_width'),
                            dropDownContent: tableModeList()
                        })
                    ]));
            }

            if (!AJS.DarkFeatures.isEnabled('confluence-table-enhancements.copy-cut-paste-cols.disabled')) {
                // We only add the buttons group in here because we need a way to dark-feature it
                Confluence.Editor.tableToolbar.Buttons.splice(3, 0,
                    new Confluence.Editor.Toolbar.Components.Group([
                        new Confluence.Editor.Toolbar.Components.Button({
                            text: getLang('table.col_cut_desc'),
                            iconClass: classPrefix + 'cut-table-column',
                            click: function () {
                                tinyMCE.execCommand('mceTableCutCol', false, '');
                                editor.plugins.customtoolbar.enableToolbarButton('aui-iconfont-paste-table-column');
                            }
                        }),

                        new Confluence.Editor.Toolbar.Components.Button({
                            text: getLang('table.col_copy_desc'),
                            iconClass: classPrefix + 'copy-table-column',
                            click: function () {
                                tinyMCE.execCommand('mceTableCopyCol', false, '');
                                editor.plugins.customtoolbar.enableToolbarButton('aui-iconfont-paste-table-column');
                            }
                        }),

                        new Confluence.Editor.Toolbar.Components.Button({
                            text: getLang('table.col_paste_desc'),
                            iconClass: classPrefix + 'paste-table-column',
                            click: function () {
                                tinyMCE.execCommand('mceTablePasteColBefore', false, '');
                            },
                            disabled: !storageManager.doesContain('copied')
                        })
                    ])
                );
            }
        }
    };
});

require('confluence/module-exporter').safeRequire('confluence-editor/tinymce3/plugins/customtoolbar/table-toolbar', function (TinyMceTableToolbar) {
    var $ = require('jquery');
    var document = require('document');

    $(document).bind('initContextToolbars.Toolbar', TinyMceTableToolbar.initContextToolbars);
});