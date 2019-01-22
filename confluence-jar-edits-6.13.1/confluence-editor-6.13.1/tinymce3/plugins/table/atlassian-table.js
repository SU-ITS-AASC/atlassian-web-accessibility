/**
 * @module confluence-editor/tinymce3/plugins/table/atlassian-table
 */
define('confluence-editor/tinymce3/plugins/table/atlassian-table', [
    'jquery',
    'ajs',
    'tinymce'
], function ($,
        AJS,
        tinymce) {
    "use strict";

    /**
     * Customisations to tinymce table plugin.
     */
    function getSelectedHighlightColour() {
        return $('#table-highlight-group').attr('data-highlight-colour') || '';
    }

    function isHighlightRemoval() {
        return !!$('#table-highlight-group').attr('data-remove-highlight');
    }

    function isDefaultColour() {
        return !getSelectedHighlightColour();
    }

    function setBackgroundColour(cells) {
        var getLang = function(key) {
            var editor = AJS.Rte.getEditor();
            return editor.getLang(key);
        };
        var colourNames = {
            red: getLang('table.cell_color_red'),
            grey: getLang('table.cell_color_grey'),
            green: getLang('table.cell_color_green'),
            blue: getLang('table.cell_color_blue'),
            yellow: getLang('table.cell_color_yellow')
        };

        var colour;
        var cellColourLabel;
        clearBackgroundColour(cells);
        if (!isDefaultColour()) {
            colour = getSelectedHighlightColour();
            cellColourLabel = getLang('table.cell_background_color').replace('{0}', colourNames[colour]);
            cells.attr('data-highlight-colour', colour);
            cells.attr('title', cellColourLabel);
            cells.children().attr('title', '');
            cells.addClass('highlight-' + colour);
        }
    }

    function clearBackgroundColour(cells) {
        var i;
        var l;
        var cell;
        for (i = 0, l = cells.length; i < l; i++) {
            cell = cells.eq(i);
            if (cell.attr('data-highlight-colour')) {
                cell.removeAttr('data-highlight-colour');
            }
            if (cell.attr('title')) {
                cell.removeAttr('title');
            }
            /**
             * CONFDEV-37873
             * somehow, there are many CSS class "highlight-" on a cell
             * should remove all of them, not only the one stored in "data-highlight-colour"
             */
            cell[0].className = cell[0].className.replace(/( |^)highlight(-\w+)+/g, "");
        }
    }

    function isSelectedColour(highlights) {
        var hlColour = getSelectedHighlightColour();
        var i;
        var l;
        var cellColour;
        for (i = 0, l = highlights.length; i < l; i++) {
            cellColour = highlights.eq(i).attr('data-highlight-colour') || '';
            if (cellColour !== hlColour) {
                return false;
            }
        }
        return true;
    }

    /* Keep simple only consider start position -> means cursor gets collapsed. */
    function isCursorInCell($origEl) {
        var $node = $(AJS.Rte.getEditor().selection.getNode());
        if (!$node.length) {
            return false;
        }

        if ($node[0] === $origEl[0]) {
            return true;
        }

        return !!$node.closest($origEl).length;
    }

    function changeTagType($origEl, newTag) {
        if (!$origEl.length) {
            return;
        }

        var ed = AJS.Rte.getEditor();

        var cursorInCell = isCursorInCell($origEl);

        var origEl = $origEl[0];
        var doc = origEl.ownerDocument;
        var newEl = doc.createElement(newTag);

        var attrs = origEl.attributes;
        for (var i = 0, l = attrs.length; i < l; i++) {
            var attr = attrs[i];
            newEl.setAttribute(attr.nodeName, attr.nodeValue);
        }

        while (origEl.hasChildNodes()) {
            newEl.appendChild(origEl.firstChild);
        }

        var newCursorTarget;
        origEl.parentNode.replaceChild(newEl, origEl);

        if (cursorInCell) {
            // Put cursor at end of cell if cursor was previously in this cell
            ed.selection.select(newEl, true);
            ed.selection.collapse();
        }


        return $(newEl);
    }

    var rteTable = {
        convertToNormalCells: function (cells) {
            cells.filter('th').each(function () {
                var $el = $(this);
                $el = changeTagType($el, 'td');
                $el.removeClass('confluenceTh');
                $el.addClass('confluenceTd');
            });
        },
        convertToHeadingCells: function (cells) {
            cells.filter('td').each(function () {
                var $el = $(this);
                $el = changeTagType($el, 'th');
                $el.removeClass('confluenceTd');
                $el.addClass('confluenceTh');
            });
        },
        areCellsHeadings: function (cells) {
            var headings = cells.filter("th");
            var headingCount = headings.length;
            return (cells.length === headingCount);
        },
        isColumnHeading: function (table, index) {
            var rows = $(table).children("tbody").children("tr");
            if (rows.length === 1) {
                return false; // special case for single row table
            }
            var headingColumnCells = rows.children().nthCol(index).filter('th');
            return (headingColumnCells.length === rows.length);
        },
        areCellsHighlighted: function (cells) {
            var highlighted = cells.filter("td[data-highlight-colour],th[data-highlight-colour]");
            var highlightedCount = highlighted.length;
            return (cells.length === highlightedCount && isSelectedColour(highlighted));
        },
        /**
         * Returns true if the given column index of the table is highlighted in the same colour. Note that the index is 1-based.
         */
        isColumnHighlighted: function (table, index) {
            var columnCells = $(table).children("tbody").children("tr").children("th,td").nthCol(index);
            var highlighted = columnCells.filter("td[data-highlight-colour],th[data-highlight-colour]");
            var highlightedCount = highlighted.length;

            if (columnCells.length !== highlightedCount) {
                return false;
            }

            var highlightColour = columnCells.eq(0).attr('data-highlight-colour');
            for (var i = 1, l = columnCells.length; i < l; i++) {
                if (highlightColour !== columnCells.eq(i).attr('data-highlight-colour')) {
                    return false;
                }
            }
            return true;
        }
    };

    function tableCustomisations(e, data) {

        var dialog;
        var ed = data.editor;
        var getSelectedRow = function (editor) {
            var selectedCells = $(editor.getBody()).find('td.mceSelected,th.mceSelected');
            if (!selectedCells.length) {
                selectedCells = $(editor.selection.getNode());
            }
            var row = selectedCells.closest("tr");
            var parent = row.parent();
            var table = parent.is("tbody") ? row.parent().parent() : parent;

            while (row.length !== 0 && !table.is(".confluenceTable")) {
                row = table.closest("tr");
                parent = row.parent();
                table = parent.is("tbody") ? row.parent().parent() : parent;
            }

            return row;
        };
        var getSelectedCell = function (editor) {
            return $(editor.selection.getNode()).closest("th.confluenceTh,td.confluenceTd");
        };
        var getSelectedCells = function (editor) {
            var selectedCells = $(editor.getBody()).find('th.confluenceTh.mceSelected,td.confluenceTd.mceSelected');
            if (selectedCells.length) {
                return selectedCells;
            }

            // Return the cell based on the cursor position
            return getSelectedCell(editor);
        };
        var isTableAllHeadings = function (table) {
            return table.find("tbody > tr > td").length === 0;
        };

        /**
         * Override default command.
         * <p>
         * Simple insert table dialog.
         */
        ed.addCommand("mceInsertTable", function (ui, val) {
            AJS.Rte.BookmarkManager.storeBookmark();

            if (!dialog) {
                dialog = new AJS.Dialog({
                    width: 400,
                    height: 230,
                    id: "insert-table-dialog",
                    keypressListener: function (e) {
                        if (e.keyCode === 27) {
                            dialog.hide();
                        }
                    }
                });
                dialog.addHeader("Insert Table");
                dialog.addPanel("Panel 1", "panel1");
                dialog.getCurrentPanel().html(AJS.renderTemplate("tableForm", "4", "3"));

                $("#tinymce-table-form input[type='text']").click(function () {
                    $(this).select();
                });

                var insert = function (dialog) {
                    dialog.hide();
                    ed.plugins.table.insertTable();
                };

                $("#tinymce-table-form").keypress(function (e) {
                    if (e.keyCode === 13) {
                        insert(dialog);
                    }
                });

                dialog.addButton("Insert", insert, "ok");
                dialog.addCancel("Cancel", function (dialog) {
                    dialog.hide();
                    return false;
                }, "cancel");
            }

            dialog.show();
        });

        /**
         * Toggle row highlighting favours highlighting, so
         * if one or more cells are not highlighted, then highlight.
         * <p>
         * "highlight" is used for td's.
         * "nohighlight" is used for th's (to support existing content).
         */
        ed.addCommand("confTableRowToggleHeading", function (ui, options) {
            //button && button.toggleClass("selected");
            var row = getSelectedRow(this);
            var rowCells = row.children("td,th");
            var columnIdx = 0;

            if (rteTable.areCellsHeadings(rowCells)) {
                // all cells highlighted - remove highlighting unless heading column
                if (!isTableAllHeadings(row.closest('table'))) {
                    rowCells = rowCells.filter(function () {
                        var cell = $(this);
                        var table = cell.closest('table');
                        columnIdx += cell.attr('colspan') || 1;
                        // exclude cells that form a column heading
                        return !rteTable.isColumnHeading(table, columnIdx);
                    });
                }
                rteTable.convertToNormalCells(rowCells);
            } else {
                // not all cells are highlighted - ensure all are highlighted
                rteTable.convertToHeadingCells(rowCells);
            }
        });
        /**
         * Toggle column highlighting favours highlighting, so
         * if one or more cells are not highlighted, then highlight.
         * <p>
         * Highlighting is not removed from the heading cell (th) if
         * the heading row if highlighted.
         * <p>
         * "highlight" is used for td's.
         * "nohighlight" is used for th's (to support existing content).
         */
        ed.addCommand("confTableColumnToggleHeading", function (ui, options) {

            function getColumnCells(selectedCells) {
                var cells = $([]);
                selectedCells.each(function () {
                    var selectedCell = $(this);
                    var index = selectedCell.index() + 1; //nth-child is 1-indexed
                    var table = selectedCell.closest("table.confluenceTable");
                    var rows = table.children("tbody").children("tr");
                    cells = cells.add(rows.children().nthCol(index));
                });
                return cells;
            }

            var selectedCells = getSelectedCells(this);
            var columnCells = getColumnCells(selectedCells);

            // removes columnCells where an entire row is a heading
            if (rteTable.areCellsHeadings(columnCells)) {
                // all cells highlighted unless there's a row of th
                if (!isTableAllHeadings(columnCells.closest('table'))) {
                    columnCells = columnCells.filter(function () {
                        var cell = $(this);
                        var row = cell.parent('tr');
                        var siblingCells = row.children();
                        var siblingThCells = siblingCells.filter('th');
                        return siblingCells.length !== siblingThCells.length;
                    });
                }
                rteTable.convertToNormalCells(columnCells);
            } else {
                // not all cells are highlighted - ensure all are highlighted
                rteTable.convertToHeadingCells(columnCells);
            }
        });

        /**
         * Highlights the current table cell selection, or if none the current cell.
         */
        ed.addCommand("confTableSelectionToggleHighlight", function (ui, options) {
            var alwaysHighlight = options && options.alwaysHighlight;
            var selectedCells = getSelectedCells(this);
            var td = selectedCells.filter("td");
            var th = selectedCells.filter("th");
            if (rteTable.areCellsHighlighted(selectedCells) && !alwaysHighlight || isHighlightRemoval()) {
                clearBackgroundColour(selectedCells);
            } else {
                setBackgroundColour(selectedCells);
            }
        });

        if (tinymce.isIE8 || AJS.DarkFeatures.isEnabled("confluence-table-enhancements.auto-row")) {
            ed.onKeyDown.add(function (_, e) {
                function isEdgeElement(element, cell, direction) {
                    while (element != cell) {
                        if (element[direction]) {
                            return false;
                        }

                        element = element.parentNode;
                    }

                    return true;
                }

                function isCaretAtEdgeOfCell(cell, direction) {
                    var rng = ed.selection.getRng(true);
                    var sc = rng.startContainer;
                    if (rng.collapsed) {
                        var edgeElement = isEdgeElement(sc, cell, direction);
                        if (sc.nodeType === 3) {
                            return edgeElement && rng.startOffset == ((direction == "nextSibling") ? sc.length : 0);
                        } else if (sc == cell) {
                            // sc.childNodes.length - 1 because a <br> tag is included in empty table cells by default
                            return rng.startOffset == ((direction == "nextSibling") ? sc.childNodes.length - 1 : 0);
                        } else {
                            return edgeElement;
                        }
                    }

                    return false;
                }

                // If we're in the first cell of the table, we need to let the normal event proceed and move the cursor
                // out of the table
                function isCaretInFirstCell() {
                    var selectedNode = ed.selection.getNode();
                    var $table = $(selectedNode).parents("table").first();
                    var firstCell = $table.find('tr:first-child').children().first()[0];

                    return firstCell == selectedNode;
                }

                // Similarly if we're in the last cell of the table
                function isCaretInLastCell() {
                    var selectedNode = ed.selection.getNode();
                    var $table = $(selectedNode).parents("table").first();
                    var lastCell = $table.find('tr:last-child').children().last()[0];

                    return lastCell == selectedNode;
                }

                if ((e.keyCode === 37 || e.keyCode === 39) && !e.shiftKey) {
                    var $selectedCell = getSelectedCell(this);
                    if ($selectedCell.length) {
                        var selectedCell = $selectedCell[0];
                        if (e.keyCode === 37 && (isCaretAtEdgeOfCell(selectedCell, "previousSibling")) && !isCaretInFirstCell()) {
                            ed.execCommand("mceTableMoveCaretToPrevCell");
                            return tinymce.dom.Event.cancel(e);
                        } else if (e.keyCode === 39 && isCaretAtEdgeOfCell(selectedCell, "nextSibling") && !isCaretInLastCell()) {
                            ed.execCommand("mceTableMoveCaretToNextCell");
                            return tinymce.dom.Event.cancel(e);
                        }
                    }
                }
            });
        }

        if (tinymce.isWebKit) {
            // CONFDEV-5475 - Add Chrome specific style to work around truncation of spaces at the end of content when content is reformatted.
            // Not necessary if http://code.google.com/p/chromium/issues/detail?id=92287 is fixed (CONFDEV-5700).
            var whitespaceStyle = $('<style type="text/css"></style>').html('.confluenceTable th,td { white-space: pre-wrap; }');
            $(ed.getDoc().head).append(whitespaceStyle);
        }

        function isInTable() {
            var selectionNode = ed.selection.getNode();

            if ($(selectionNode).parents("table").is(".confluenceTable")) {
                // lists have precedence over tables
                var inList = ed.dom.getParent(selectionNode, 'UL,OL');
                return !inList;
            }
            return false;
        }

        // Handle tabbing in a table.
        ed.onKeyDown.add(function (_, e) {
            if (e.keyCode === 9) {
                if (isInTable()) {
                    var command = e.shiftKey ? "mceTableMoveCaretToPrevCell" : "mceTableMoveCaretToNextCell";
                    ed.execCommand(command);

                    e.preventDefault();
                    return false;
                }
            }
        });

        if (AJS.DarkFeatures.isEnabled("confluence-table-enhancements.auto-row")) {
            // If the numbering column is clicked, move the cursor to the next cell
            ed.onClick.add(function (_, e) {
                var $selectedCell = getSelectedCell(this);

                if ($selectedCell.hasClass('numberingColumn') && !$selectedCell.hasClass('confluenceTh')) {
                    ed.execCommand("mceTableMoveCaretToNextCell");
                }
            });

            // We need to handle moving down or up from the first cell of a heading row
            ed.onKeyDown.addToTop(function (_, e) {
                if ((e.keyCode === 38 || e.keyCode === 40) && isInTable()) {
                    if (getSelectedCell(this).hasClass('numberingColumn')) {
                        ed.execCommand("mceTableMoveCaretToNextCell");
                        e.preventDefault();
                        return false;
                    }
                }
            });
        }
    }

    AJS.bind("init.rte", tableCustomisations);

    function setNumberingColumnUneditable() {
        var $editorContent = $(AJS.Rte.getEditor().getDoc().body);
        var numberingColumnCells = $editorContent.find('.confluenceTd.numberingColumn');

        numberingColumnCells.attr('contenteditable', 'false');
    }

    // On editor init, we need to prevent the numbering column from being editable
    if (AJS.DarkFeatures.isEnabled("confluence-table-enhancements.auto-row")) {
        // init.rte is fired too early in the quickedit process, so bind to both events
        AJS.bind("quickedit.success", setNumberingColumnUneditable);
        AJS.bind("init.rte", setNumberingColumnUneditable);
    }

    return rteTable;
});

require('confluence/module-exporter')
        .exportModuleAsGlobal('confluence-editor/tinymce3/plugins/table/atlassian-table', 'AJS.Rte.Table');
