/**
 * editor_plugin_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 *
 * @module atlassian-tinymce/plugins/table/editor_plugin_src
 */
define('atlassian-tinymce/plugins/table/editor_plugin_src', [
    'tinymce',
    'ajs',
    'jquery',
    'confluence/storage-manager'
], function(
    tinymce,
    AJS,
    $,
    StorageManager
) {
    var editor;
    var each = tinymce.each;
    // ATLASSIAN - if you change this here, please change it in tinymce-table-toolbar as well
    var storageManager = StorageManager("atlassian.editor", "tables");

    // ATLASSIAN CONF-3393
    var CELL_BORDER_WIDTH = 1;
    var CELL_PADDING_LEFT_RIGHT = 10;
    var DEFAULT_COLUMN_WIDTH = 8;
    var copiedColumnWidth;

    // Checks if the selection/caret is at the start of the specified block element
    function isAtStart(rng, par) {
        var doc = par.ownerDocument;
        var rng2 = doc.createRange();
        var elm;

        rng2.setStartBefore(par);
        rng2.setEnd(rng.endContainer, rng.endOffset);

        elm = doc.createElement('body');
        elm.appendChild(rng2.cloneContents());

        // Check for text characters of other elements that should be treated as content
        return elm.innerHTML.replace(/<(br|img|object|embed|input|textarea)[^>]*>/gi, '-').replace(/<[^>]+>/g, '').length === 0;
    }

    function getSpanVal(td, name) {
        return parseInt(td.getAttribute(name) || 1);
    }

    /**
     * Table Grid class.
     */
    function TableGrid(table, dom, selection) {
        var grid;
        var startPos;
        var endPos;
        var selectedCell;
        var i;
        buildGrid();
        //CONFDEV-40905
        var closestConfluenceTableSelectors = [
            "table.confluenceTable > tbody > tr > th",
            "table.confluenceTable > tbody > tr > td",
            "table.confluenceTable > thead > tr > th",
            "table.confluenceTable > thead > tr > td"
        ];
        selectedCell = dom.select('td.mceSelected,th.mceSelected')[0] || $(selection.getStart()).closest(closestConfluenceTableSelectors.join(","))[0];
        if (selectedCell) {
            startPos = getPos(selectedCell);
            endPos = findEndPos();
            selectedCell = getCell(startPos.x, startPos.y);
        }

        function cloneNode(node, children) {
            node = node.cloneNode(children);
            node.removeAttribute('id');

            // ATLASSIAN CONFDEV-31959
            // Make sure we never copy the numbering column
            if (children && hasNumCol()) {
                node.removeChild(node.children[0]);
            }
            return node;
        }

        function buildGrid() {
            var startY = 0;

            grid = [];

            each(['thead', 'tbody', 'tfoot'], function(part) {
                var rows = dom.select('> ' + part + ' tr', table);

                each(rows, function(tr, y) {
                    y += startY;

                    each(dom.select('> td, > th', tr), function(td, x) {
                        var x2;
                        var y2;
                        var rowspan;
                        var colspan;

                        // Skip over existing cells produced by rowspan
                        if (grid[y]) {
                            while (grid[y][x]) {
                                x++;
                            }
                        }

                        // Get col/rowspan from cell
                        rowspan = getSpanVal(td, 'rowspan');
                        colspan = getSpanVal(td, 'colspan');

                        // Fill out rowspan/colspan right and down
                        for (y2 = y; y2 < y + rowspan; y2++) {
                            if (!grid[y2]) {
                                grid[y2] = [];
                            }

                            for (x2 = x; x2 < x + colspan; x2++) {
                                grid[y2][x2] = {
                                    part : part,
                                    real : y2 == y && x2 == x,
                                    elm : td,
                                    rowspan : rowspan,
                                    colspan : colspan
                                };
                            }
                        }
                    });
                });

                startY += rows.length;
            });
        }

        function getCell(x, y) {
            var row;

            row = grid[y];
            if (row) {
                return row[x];
            }
        }

        function setSpanVal(td, name, val) {
            if (td) {
                val = parseInt(val);

                if (val === 1) {
                    td.removeAttribute(name, 1);
                } else {
                    td.setAttribute(name, val, 1);
                }
            }
        }

        function isCellSelected(cell) {
            return cell && (dom.hasClass(cell.elm, 'mceSelected') || cell == selectedCell);
        }

        function getSelectedRows() {
            var rows = [];

            each(table.rows, function(row) {
                each(row.cells, function(cell) {
                    if (dom.hasClass(cell, 'mceSelected') || cell == selectedCell.elm) {
                        rows.push(row);
                        return false;
                    }
                });
            });

            return rows;
        }

        function deleteTable() {
            var rng = dom.createRng();

            rng.setStartAfter(table);
            rng.setEndAfter(table);

            selection.setRng(rng);

            dom.remove(table);
        }

        function cloneCell(cell) {
            var formatNode;

            // Clone formats
            tinymce.walk(cell, function(node) {
                var curNode;

                if (node.nodeType === 3) {
                    each(dom.getParents(node.parentNode, null, cell).reverse(), function(node) {
                        node = cloneNode(node, false);

                        if (!formatNode) {
                            formatNode = curNode = node;
                        } else if (curNode) {
                            curNode.appendChild(node);
                        }

                        curNode = node;
                    });

                    // Add something to the inner node
                    if (curNode) {
                        curNode.innerHTML = tinymce.isIE ? '&nbsp;' : '<br data-mce-bogus="1" />';
                    }

                    return false;
                }
            }, 'childNodes');

            cell = cloneNode(cell, false);
            setSpanVal(cell, 'rowSpan', 1);
            setSpanVal(cell, 'colSpan', 1);

            if (formatNode) {
                cell.appendChild(formatNode);
            } else {
                if (!tinymce.isIE) {
                    cell.innerHTML = '<br data-mce-bogus="1" />';
                }
            }

            // CONFDEV-33599 Make sure we don't clone any numbering column cells
            $(cell).attr('contenteditable', 'true').removeClass('numberingColumn');

            return cell;
        }

        function cleanup() {
            var rng = dom.createRng();

            // Empty rows
            each(dom.select('tr', table), function(tr) {
                if (tr.cells.length === 0) {
                    dom.remove(tr);
                }
            });

            // Empty table
            if (dom.select('tr', table).length === 0) {
                rng.setStartAfter(table);
                rng.setEndAfter(table);
                selection.setRng(rng);
                dom.remove(table);
                return;
            }

            // Empty header/body/footer
            each(dom.select('thead,tbody,tfoot', table), function(part) {
                if (part.rows.length === 0) {
                    dom.remove(part);
                }
            });

            // Restore selection to start position if it still exists
            restoreSelection();
        }

        function restoreSelection() {
            var row;
            var nextCell;

            buildGrid();

            row = grid[Math.min(grid.length - 1, startPos.y)];

            if (row) {
                nextCell = row[Math.min(row.length - 1, startPos.x)].elm;

                // Select the next cell if there is any available.
                nextCell && positionCursorCell(nextCell);
            }
        }

        function positionCursorCell(nodeCell) {
            if (tinymce.isIE9 || tinymce.isIE10up){
                selection.setCursorLocation(nodeCell, 0);
                selection.collapse(true);
            }
            else{
                selection.select(nodeCell, true);
                selection.collapse(true);
            }
        }

        function fillLeftDown(x, y, rows, cols) {
            var tr;
            var x2;
            var r;
            var c;
            var cell;

            tr = grid[y][x].elm.parentNode;
            for (r = 1; r <= rows; r++) {
                tr = dom.getNext(tr, 'tr');

                if (tr) {
                    // Loop left to find real cell
                    for (x2 = x; x2 >= 0; x2--) {
                        cell = grid[y + r][x2].elm;

                        if (cell.parentNode == tr) {
                            // Append clones after
                            for (c = 1; c <= cols; c++) {
                                dom.insertAfter(cloneCell(cell), cell);
                            }

                            break;
                        }
                    }

                    if (x2 == -1) {
                        // Insert nodes before first cell
                        for (c = 1; c <= cols; c++) {
                            tr.insertBefore(cloneCell(tr.cells[0]), tr.cells[0]);
                        }
                    }
                }
            }
        }

        function split() {
            each(grid, function(row, y) {
                each(row, function(cell, x) {
                    var colSpan;
                    var rowSpan;
                    var newCell;
                    var i;

                    if (isCellSelected(cell)) {
                        cell = cell.elm;
                        colSpan = getSpanVal(cell, 'colspan');
                        rowSpan = getSpanVal(cell, 'rowspan');

                        if (colSpan > 1 || rowSpan > 1) {
                            setSpanVal(cell, 'rowSpan', 1);
                            setSpanVal(cell, 'colSpan', 1);

                            // Insert cells right
                            for (i = 0; i < colSpan - 1; i++) {
                                dom.insertAfter(cloneCell(cell), cell);
                            }

                            fillLeftDown(x, y, rowSpan - 1, colSpan);
                        }
                    }
                });
            });
        }

        function merge(cell, cols, rows) {
            var startX;
            var startY;
            var endX;
            var endY;
            var x;
            var y;
            var startCell;
            var endCell;
            var children;
            var count;

            // Use specified cell and cols/rows
            if (cell) {
                var pos = getPos(cell);
                startX = pos.x;
                startY = pos.y;
                endX = startX + (cols - 1);
                endY = startY + (rows - 1);
            } else {
                // Use selection
                startX = startPos.x;
                startY = startPos.y;
                endX = endPos.x;
                endY = endPos.y;
            }

            // ATLASSIAN CONFDEV-31959
            // Prevent merging the numbering column
            if (startX == 0 && hasNumCol()) {
                return;
            }

            // Find start/end cells
            startCell = getCell(startX, startY);
            endCell = getCell(endX, endY);

            // Check if the cells exists and if they are of the same part for example tbody = tbody
            if (startCell && endCell && startCell.part == endCell.part) {
                // Split and rebuild grid
                split();
                buildGrid();

                // Set row/col span to start cell
                startCell = getCell(startX, startY).elm;
                setSpanVal(startCell, 'colSpan', (endX - startX) + 1);
                setSpanVal(startCell, 'rowSpan', (endY - startY) + 1);

                // Remove other cells and add it's contents to the start cell
                for (y = startY; y <= endY; y++) {
                    for (x = startX; x <= endX; x++) {
                        if (!grid[y] || !grid[y][x]) {
                            continue;
                        }

                        cell = grid[y][x].elm;

                        if (cell != startCell) {
                            // Move children to startCell
                            children = tinymce.grep(cell.childNodes);
                            each(children, function(node) {
                                startCell.appendChild(node);
                            });

                            // Remove bogus nodes if there is children in the target cell
                            if (children.length) {
                                children = tinymce.grep(startCell.childNodes);
                                count = 0;
                                each(children, function(node) {
                                    if (node.nodeName === 'BR' && dom.getAttrib(node, 'data-mce-bogus') && count++ < children.length - 1) {
                                        startCell.removeChild(node);
                                    }
                                });
                            }

                            // Remove cell
                            dom.remove(cell);
                        }
                    }
                }

                // Remove empty rows etc and restore caret location
                cleanup();
            }
        }

        function insertRow(before) {
            var posY;
            var cell;
            var lastCell;
            var x;
            var rowElm;
            var newRow;
            var newCell;
            var otherCell;
            var rowSpan;
            var highlightColour;
            var isHeading;

            // Find first/last row
            each(grid, function(row, y) {
                each(row, function(cell, x) {
                    if (isCellSelected(cell)) {
                        cell = cell.elm;
                        rowElm = cell.parentNode;
                        newRow = cloneNode(rowElm, false);
                        posY = y;

                        if (before) {
                            return false;
                        }
                    }
                });

                if (before) {
                    return !posY;
                }
            });

            for (x = 0; x < grid[0].length; x++) {
                // Cell not found could be because of an invalid table structure
                if (!grid[posY][x]) {
                    continue;
                }

                cell = grid[posY][x].elm;

                if (cell != lastCell) {
                    if (!before) {
                        rowSpan = getSpanVal(cell, 'rowspan');
                        if (rowSpan > 1) {
                            setSpanVal(cell, 'rowSpan', rowSpan + 1);
                            continue;
                        }
                    } else {
                        // Check if cell above can be expanded
                        if (posY > 0 && grid[posY - 1][x]) {
                            otherCell = grid[posY - 1][x].elm;
                            rowSpan = getSpanVal(otherCell, 'rowSpan');
                            if (rowSpan > 1) {
                                setSpanVal(otherCell, 'rowSpan', rowSpan + 1);
                                continue;
                            }
                        }
                    }

                    /**
                     * ATLASSIAN
                     * Insert new cell into new row (don't clone as it may be a heading that we don't want to keep)
                     */
                    isHeading = isColumnHeading(x);
                    newCell = isHeading ? dom.create("th") : dom.create("td");
                    newCell.colSpan = cell.colSpan;
                    newCell.width = cell.width;
                    newCell.innerHTML = tinymce.isIE9 ? "" : (tinymce.isIE ? '&nbsp;' : '<br data-mce-bogus="1" />');
                    newCell.className = cell.className;

                    if(!isHeading) {
                        // make sure if it was heading, class is correct
                        dom.removeClass(newCell, tinymce.settings.confluence_table_heading_style);
                        dom.addClass(newCell, tinymce.settings.confluence_table_cell_style);
                    }
                    highlightColour = dom.getAttrib(cell, 'data-highlight-colour');

                    // only keep cell highlight if the entire column is already highlighted
                    if (!isColumnHighlighted(x)) {
                        dom.removeClass(newCell, "highlight-" + highlightColour);
                    } else {
                        dom.setAttrib(newCell, 'data-highlight-colour', highlightColour);
                    }

                    newRow.appendChild(newCell);

                    lastCell = cell;
                }
            }

            if (newRow.hasChildNodes()) {
                if (!before) {
                    dom.insertAfter(newRow, rowElm);
                } else {
                    rowElm.parentNode.insertBefore(newRow, rowElm);
                }
            }

            updateNumCol();
        }

        /**
         * CONF-24289 Checks if all the cells in a column are heading cells
         * @param x Column to check
         */
        function isColumnHeading(x) {
            // Special case for single row tables
            if (grid.length === 1) {
                return false;
            }

            for (var y = 0; y < grid.length; y++) {
                if (grid[y][x].elm.tagName.toUpperCase() !== "TH") {
                    return false;
                }
            }

            return true;
        }

        /**
         * CONF-24289 Checks if all the cells in a column are highlighted
         * @param x Column to check
         */
        function isColumnHighlighted(x) {
            var colour = grid[0][x].elm.getAttribute('data-highlight-colour');

            if (colour === null) {
                return false;
            }

            for (var y = 0; y < grid.length; y++) {
                if (grid[y][x].elm.getAttribute('data-highlight-colour') !== colour) {
                    return false;
                }
            }

            return true;
        }

        function insertCol(before) {
            // ATLASSIAN - CONFDEV-31957
            var posX;
            var lastCell;
            var cells = [];

            // ATLASSIAN - custom cloneCell only clones classes
            function cloneCell(cell) {
                var highlightColour;
                var newCell = dom.create(cell.tagName);

                newCell.colSpan = cell.colSpan;
                newCell.width = cell.width;
                newCell.className = cell.className;
                newCell.innerHTML = tinymce.isIE ? '&nbsp;' : '<br data-mce-bogus="1"/>';

                // ATLASSIAN
                highlightColour = dom.getAttrib(cell, 'data-highlight-colour');
                if (highlightColour) {
                    dom.setAttrib(newCell, 'data-highlight-colour', highlightColour);
                }

                // CONFDEV-33599 Make sure we don't clone any numbering column cells
                $(newCell).attr('contenteditable', 'true').removeClass('numberingColumn');

                return newCell;
            }

            // Find first/last column
            each(grid, function (row, y) {
                each(row, function (cell, x) {
                    if (isCellSelected(cell)) {
                        posX = x;

                        if (before) {
                            return false;
                        }
                    }
                });

                if (before) {
                    return !posX;
                }
            });

            // ATLASSIAN CONFDEV-31959
            // You shouldn't be able to insert before the numbering column
            if (posX == 0 && before && hasNumCol()) {
                return false;
            }

            each(grid, function (row, y) {
                var cell;
                var rowSpan;
                var colSpan;

                if (!row[posX]) {
                    return;
                }

                cell = row[posX].elm;

                // CONF-3393
                if (AJS.DarkFeatures.isEnabled('confluence.table.resizable')) {
                    if (y === 0) { // Just do once
                        var $table = $(cell).closest('table');

                        var $targetCol = $table.find('>colgroup>col').eq(posX);
                        var $newCol = $('<col>');

                        if (before) {
                            $newCol.insertBefore($targetCol);
                        } else {
                            $newCol.insertAfter($targetCol);
                        }

                        // Only set width for col in fixed table
                        if ($table.hasClass('fixed-table')) {
                            if (!copiedColumnWidth || parseFloat(copiedColumnWidth) === 0) { // Insert new
                                $newCol.css({width: DEFAULT_COLUMN_WIDTH + CELL_PADDING_LEFT_RIGHT * 2 + CELL_BORDER_WIDTH});
                            } else { // Copy & Cut
                                $newCol.css({width: copiedColumnWidth});
                            }
                        }
                    }
                }

                if (cell != lastCell) {
                    colSpan = getSpanVal(cell, 'colspan');
                    rowSpan = getSpanVal(cell, 'rowspan');

                    // ATLASSIAN - CONFDEV-31957
                    if (colSpan == 1) {
                        var newCell = cloneCell(cell);
                        if (!before) {
                            dom.insertAfter(newCell, cell);
                            fillLeftDown(posX, y, rowSpan - 1, colSpan);
                        } else {
                            cell.parentNode.insertBefore(newCell, cell);
                            fillLeftDown(posX, y, rowSpan - 1, colSpan);
                        }
                        cells.push(newCell);
                    } else {
                        setSpanVal(cell, 'colSpan', cell.colSpan + 1);
                    }

                    lastCell = cell;
                }
            });

            return cells;
        }

        /**
         * ATLASSIAN CONFDEV-31959
         * Updates the numbering column. Should be called whenever a row is added or removed.
         */
        function updateNumCol() {
            if (hasNumCol()) {
                i = 1;
                var rowSpan = 0;
                var rowSpanCount = 0;

                each(table.rows, function(tr, y) {
                    tr = $(tr);

                    if (AJS.Rte.Table.areCellsHeadings(tr.children())) {
                        tr.children(':first')
                                .addClass('numberingColumn')
                                .attr('contenteditable', 'true');
                    } else if (rowSpanCount > 0) {
                        rowSpanCount--;
                    } else {
                        tr.children(':first')
                                .html(i)
                                .attr('contenteditable', 'false')
                                .addClass('numberingColumn');

                        rowSpan = tr.children(':first').attr('rowspan');
                        if (rowSpan > 1) {
                            rowSpanCount = rowSpan - 1;
                        }

                        i++;
                    }
                });
            }
        }

        /**
         * ATLASSIAN CONFDEV-31959
         * Adds or removes the numbering column
         */
        function toggleNumCol() {
            if (hasNumCol()) {
                // We already have a number column, let's get rid of it
                each(grid, function(row) {
                    var cell = row[0].elm;

                    if ($(cell).hasClass('numberingColumn') && cell.parentNode !== null) {
                        cell.parentNode.removeChild(cell);
                    }

                });

                setNumCol(false);
            } else {
                // Create a new column on the LHS of the table
                var prevCell;
                each(grid, function(row) {
                    var cell = row[0].elm;

                    if (prevCell == cell) {
                        return;
                    }

                    var newCell = cloneCell(cell);
                    cell.parentNode.insertBefore(newCell, cell);

                    if (cell.rowSpan > 1) {
                        newCell.rowSpan = cell.rowSpan;
                    }

                    prevCell = cell;
                });

                setNumCol(true);
            }
            updateNumCol();
        }

        /**
         * ATLASSIAN CONFDEV-31959
         * @returns {Boolean} Whether the table currently has a numbering column
         */
        function hasNumCol() {
            return $(table.rows[0]).children(':first').hasClass('numberingColumn');
        }

        /**
         * ATLASSIAN CONFDEV-31959
         * Adds/removes a class to the first cell of the table indicating the presence of a numbering column
         * @param hasNumCol Boolean
         */
        function setNumCol(hasNumCol) {
            if (hasNumCol) {
                $(table.rows[0]).children(':first').addClass('numberingColumn');
                // CONF-3393
                if (AJS.DarkFeatures.isEnabled('confluence.table.resizable')) {
                    var $table = $(table);

                    var $targetCol = $table.find('>colgroup>col').eq(0);
                    var $newCol = $('<col>');

                    $newCol.insertBefore($targetCol);

                    // Only set width for col in fixed table
                    if ($table.hasClass('fixed-table')) {
                        $newCol.css({width: DEFAULT_COLUMN_WIDTH + CELL_PADDING_LEFT_RIGHT * 2 + CELL_BORDER_WIDTH});
                    }
                }
            } else {
                $(table.rows[0]).children(':first').removeClass('numberingColumn');
                // CONF-3393
                if (AJS.DarkFeatures.isEnabled('confluence.table.resizable')) {
                    $(table).find('>colgroup>col').eq(0).remove();
                }
            }
        }

        function toggleFluidColumnWidth() {
            if (!table || !table.rows) {
                return;
            }
            $(table).toggleFluidColumnWidth();
            $('#table-mode-picker .dropdown-text').text(editor.getLang('table.responsive'));
        }


        function toggleFixedColumnWidth() {
            if (!table || !table.rows) {
                return;
            }
            $(table).toggleFixedColumnWidth();
            $('#table-mode-picker .dropdown-text').text(editor.getLang('table.fixed_width'));
        }

        function deleteCols() {
            var cols = [];

            // Get selected column indexes
            each(grid, function(row, y) {
                each(row, function(cell, x) {
                    if (isCellSelected(cell) && tinymce.inArray(cols, x) === -1) {
                        if (AJS.DarkFeatures.isEnabled('confluence.table.resizable')) {
                            $(cell.elm).closest('table').find('>colgroup>col').eq(x).remove();
                        }
                        each(grid, function(row) {
                            // ATLASSIAN- check that the cell is present otherwise ignore
                            if (row[x]) {
                                var cell = row[x].elm;
                                var colSpan;

                                colSpan = getSpanVal(cell, 'colSpan');

                                if (colSpan > 1) {
                                    setSpanVal(cell, 'colSpan', colSpan - 1);
                                } else {
                                    dom.remove(cell);
                                }
                            }
                        });
                        cols.push(x);
                    }
                });
            });

            cleanup();
        }

        function deleteRows() {
            var rows;

            function deleteRow(tr) {
                var nextTr;
                var pos;
                var lastCell;

                nextTr = dom.getNext(tr, 'tr');

                // Move down row spanned cells
                each(tr.cells, function(cell) {
                    var rowSpan = getSpanVal(cell, 'rowSpan');

                    if (rowSpan > 1) {
                        setSpanVal(cell, 'rowSpan', rowSpan - 1);
                        pos = getPos(cell);
                        fillLeftDown(pos.x, pos.y, 1, 1);
                    }
                });

                // Delete cells
                pos = getPos(tr.cells[0]);
                each(grid[pos.y], function(cell) {
                    var rowSpan;

                    cell = cell.elm;

                    if (cell != lastCell) {
                        rowSpan = getSpanVal(cell, 'rowSpan');

                        if (rowSpan <= 1) {
                            dom.remove(cell);
                        } else {
                            setSpanVal(cell, 'rowSpan', rowSpan - 1);
                        }

                        lastCell = cell;
                    }
                });
            }

            // Get selected rows and move selection out of scope
            rows = getSelectedRows();

            if(tinymce.isIE9 || tinymce.isIE10) {
                // ATLASSIAN - CONF-31548 - Before we remove any row, we move the cursor to an element that won't be removed.
                selectParent(rows[0]);
            }

            // Delete all selected rows
            each(rows.reverse(), function(tr) {
                deleteRow(tr);
            });

            cleanup();

            // ATLASSIAN CONFDEV-31959
            updateNumCol();
        }

        function cutRows() {
            var rows = getSelectedRows();

            if(tinymce.isIE9 || tinymce.isIE10) {
                // ATLASSIAN - CONF-31548 - Before we remove any row, we move the cursor to an element that won't be removed.
                selectParent(rows[0]);
            }

            dom.remove(rows);
            cleanup();

            updateNumCol();

            return rows;
        }

        function copyRows() {
            var rows = getSelectedRows();

            each(rows, function(row, i) {
                rows[i] = cloneNode(row, true);
            });

            return rows;
        }

        function pasteRows(rows, before) {
            var selectedRows = getSelectedRows();
            var targetRow = selectedRows[before ? 0 : selectedRows.length - 1];
            var targetCellCount = targetRow.cells.length;

            // Calc target cell count
            each(grid, function(row) {
                var match;

                targetCellCount = 0;
                each(row, function(cell, x) {
                    if (cell.real) {
                        targetCellCount += cell.colspan;
                    }

                    if (cell.elm.parentNode == targetRow) {
                        match = 1;
                    }
                });

                if (match) {
                    return false;
                }
            });

            if (!before) {
                rows.reverse();
            }

            each(rows, function(row) {
                var cellCount = row.cells.length;
                var cell;

                // ATLASSIAN CONFDEV-31959
                if ($(row.cells[0]).hasClass("numberingColumn")) {
                    row.removeChild(row.cells[0]);
                    cellCount--;
                }

                // Remove col/rowspans
                for (i = 0; i < cellCount; i++) {
                    cell = row.cells[i];
                    setSpanVal(cell, 'colSpan', 1);
                    setSpanVal(cell, 'rowSpan', 1);
                }

                // ATLASSIAN CONFDEV-31959
                // Make sure we don't paste into the numbering column
                if (hasNumCol()) {
                    row.insertBefore(row.firstChild.cloneNode(false), row.firstChild);
                    $(row.firstChild).addClass('numberingColumn');
                    cellCount++;
                }

                // Source needs more cells
                while(targetCellCount < cellCount) {
                    /**
                     * Atlassian - Insert a new column for each of the cells we are missing.
                     * This stops forming unbalanced table rows and fixes a TinyMCE Bug where cells go missing on Paste.
                     * */
                    insertCol(false);
                    targetCellCount++;
                }

                // Needs more cells
                for (i = cellCount; i < targetCellCount; i++) {
                    row.appendChild(cloneCell(row.cells[cellCount - 1]));
                }

                // Add before/after
                if (before) {
                    targetRow.parentNode.insertBefore(row, targetRow);
                } else {
                    dom.insertAfter(row, targetRow);
                }
            });

            // ATLASSIAN CONFDEV-31959
            updateNumCol();
        }

        // ATLASSIAN - CONFDEV-31957 Copy/Paste Column support
        function copyColumns() {

            var cells = {};
            // Get selected column indexes
            each(grid, function(row, y) {
                each(row, function(cell, x) {
                    if (isCellSelected(cell)) {
                        if (AJS.DarkFeatures.isEnabled('confluence.table.resizable')) {
                            copiedColumnWidth = $(cell.elm).closest('table').find('>colgroup>col').eq(x).css('width');
                            if (parseFloat(copiedColumnWidth) === 0) {
                                // Copying from fluid table, so there is no width in <col>
                                copiedColumnWidth = cell.elm.getBoundingClientRect().width;
                            }
                        }
                        if (!cells[x]) {
                            cells[x] = [];
                        }
                    }
                });
            });

            //Add the column cells to the copied elements
            each(grid, function(row, y) {
                each(row, function(cell, x) {
                    if(cells[x]) {
                        cells[x].push(cell.elm.innerHTML);
                    }
                });
            });

            return cells;
        }

        // ATLASSIAN - CONFDEV-31957 Copy/Paste Column support
        function prepareTableForColPasteAndCheckIfNeedToRepaint(columns){
            var numberOfRequiredRows = columns[Object.keys(columns)[0]].length;

            var lastRowIndex;
            var lastColIndex;
            var needToRepaint = false;

            each(grid, function(row, y) {
                numberOfRequiredRows--;
                lastRowIndex = y;
                each(row, function(cell, x){
                    lastColIndex = x;
                });
            });

            if (numberOfRequiredRows > 0) {
                needToRepaint = true;
                //Ensure the new row(s) are pasted after the last row.
                selectedCell = getCell(lastColIndex, lastRowIndex);
                for (i = 0; i < numberOfRequiredRows; i++) {
                    insertRow(false);
                }
            }

            return needToRepaint;
        }

        // ATLASSIAN - CONFDEV-31957 Copy/Paste Column support
        function pasteColumns(columns, before) {
            var keys = Object.keys(columns);
            if (!before) {
                keys.reverse();
            }

            $.each(keys, function (i, key) {
                var cellArray = insertCol(before);
                for(i=0; i<cellArray.length; i++) {
                    cellArray[i].innerHTML = columns[key][i] || "";
                }
            });
        }

        // ATLASSIAN - CONFDEV-31957 Copy/Paste Column support
        function cutColumns() {
            var cells = copyColumns();
            deleteCols();

            return cells;
        }

        /**
         * ATLASSIAN
         */
        function selectParent(el) {
            if(el && el.parentNode) {
                selection.select(el.parentNode);
                selection.collapse(true);
            }
        }

        /**
         * ATLASSIAN
         */
        function selectCellPos(position, toStart) {
            var cell = getCell(position.x, position.y);
            var cellNode = cell.elm;
            var collapseToStart = typeof(toStart) === 'undefined' ? true : toStart;

            // ATLASSIAN - tabbing in IE9 doesn't work if you select the full cell
            if ((tinymce.isGecko || tinymce.isIE) && cellNode.firstChild) {
                cellNode = cellNode.firstChild;
            }

            // ATLASSIAN - CONFDEV-4322, CONFDEV-12503 select doesn't work on empty table cells in IE9 or IE10. Do it manually.
            if (tinymce.isIE9 || tinymce.isIE10up) {
                var r1 = selection.getRng(1);

                if (collapseToStart) {
                    r1.setStart(cellNode, 0);
                    r1.setEnd(cellNode, 0);
                } else {
                    r1.setStartAfter(cellNode, 0);
                    r1.setEndAfter(cellNode, 0);
                }

                selection.setRng(r1);
            } else {
                selection.select(cellNode, true);
                selection.collapse(collapseToStart);
            }

        }

        /**
         * ATLASSIAN
         * Required when the table has been modified.
         */
        function updateStartPos() {
            startPos = getPos(dom.getParent(selection.getStart(), 'th,td'));
        }

        /**
         * ATLASSIAN
         */
        function moveCaretToNextCell() {
            var nextCellPos = getNextCell();

            if (!nextCellPos) {
                insertRow(false);
                buildGrid(); // update grid now that we have inserted a new
                nextCellPos = getNextCell();
            }
            selectCellPos(nextCellPos);
        }

        /**
         * ATLASSIAN
         */
        function getNextCell() {
            var nextCellPos;
            var gridWidth = grid[0].length;
            if (!(startPos.x == gridWidth - 1 && startPos.y == grid.length - 1)) {
                if (startPos.x == gridWidth - 1 && hasNumCol()) {
                    nextCellPos = {x: 1, y: startPos.y + 1};

                    // If the row is a heading row, we are allowed to move into the (0, y) cell
                    if (AJS.Rte.Table.areCellsHeadings($(grid[nextCellPos.y][0].elm).parent().children())) {
                        nextCellPos.x = 0;
                    }

                } else if (startPos.x == gridWidth - 1) {
                    nextCellPos = {x: 0, y: startPos.y + 1};
                } else {
                    nextCellPos = {x : startPos.x + 1, y : startPos.y};
                }
            }

            return nextCellPos;
        }

        /**
         * ATLASSIAN
         */
        function moveCaretToPrevCell() {
            var prevCellPos = getPrevCell();

            if (!prevCellPos) {
                insertRow(true);
                buildGrid(); // update grid now that we have inserted a new
                updateStartPos();
                prevCellPos = getPrevCell();
            }
            selectCellPos(prevCellPos, false);
        }

        /**
         * ATLASSIAN
         */
        function getPrevCell() {
            var prevCellPos;
            var y1;

            if (!(startPos.x == 0 && startPos.y == 0)) {
                // Don't move into the first cell if the table has a numbering column
                if (startPos.x == 1 && hasNumCol() && startPos.y > 0) {
                    y1 = startPos.y - 1;
                    prevCellPos = {x: grid[y1].length - 1, y: y1};
                } else if (startPos.x > 0) {
                    prevCellPos = {x: startPos.x - 1, y: startPos.y};
                } else {
                    y1 = startPos.y - 1;
                    prevCellPos = {x : grid[y1].length - 1, y : y1};
                }
            }

            return prevCellPos;
        }

        function getPos(target) {
            var pos;

            each(grid, function(row, y) {
                each(row, function(cell, x) {
                    if (cell.elm == target) {
                        pos = {x : x, y : y};
                        return false;
                    }
                });

                return !pos;
            });

            return pos;
        }

        function setStartCell(cell) {
            startPos = getPos(cell);
        }

        function findEndPos() {
            var pos;
            var maxX;
            var maxY;

            maxX = maxY = 0;

            each(grid, function(row, y) {
                each(row, function(cell, x) {
                    var colSpan;
                    var rowSpan;

                    if (isCellSelected(cell)) {
                        cell = grid[y][x];

                        if (x > maxX) {
                            maxX = x;
                        }

                        if (y > maxY) {
                            maxY = y;
                        }

                        if (cell.real) {
                            colSpan = cell.colspan - 1;
                            rowSpan = cell.rowspan - 1;

                            if (colSpan) {
                                if (x + colSpan > maxX) {
                                    maxX = x + colSpan;
                                }
                            }

                            if (rowSpan) {
                                if (y + rowSpan > maxY) {
                                    maxY = y + rowSpan;
                                }
                            }
                        }
                    }
                });
            });

            return {x : maxX, y : maxY};
        }

        function setEndCell(cell) {
            var startX;
            var startY;
            var endX;
            var endY;
            var maxX;
            var maxY;
            var colSpan;
            var rowSpan;

            endPos = getPos(cell);

            if (startPos && endPos) {
                // Get start/end positions
                startX = Math.min(startPos.x, endPos.x);
                startY = Math.min(startPos.y, endPos.y);
                endX = Math.max(startPos.x, endPos.x);
                endY = Math.max(startPos.y, endPos.y);

                // Expand end positon to include spans
                maxX = endX;
                maxY = endY;

                // Expand startX
                var y;
                for (y = startY; y <= maxY; y++) {
                    cell = grid[y][startX];

                    if (!cell.real) {
                        if (startX - (cell.colspan - 1) < startX) {
                            startX -= cell.colspan - 1;
                        }
                    }
                }

                // Expand startY
                for (var x = startX; x <= maxX; x++) {
                    cell = grid[startY][x];

                    if (!cell.real) {
                        if (startY - (cell.rowspan - 1) < startY) {
                            startY -= cell.rowspan - 1;
                        }
                    }
                }

                // Find max X, Y
                for (y = startY; y <= endY; y++) {
                    for (x = startX; x <= endX; x++) {
                        cell = grid[y][x];

                        if (cell.real) {
                            colSpan = cell.colspan - 1;
                            rowSpan = cell.rowspan - 1;

                            if (colSpan) {
                                if (x + colSpan > maxX) {
                                    maxX = x + colSpan;
                                }
                            }

                            if (rowSpan) {
                                if (y + rowSpan > maxY) {
                                    maxY = y + rowSpan;
                                }
                            }
                        }
                    }
                }

                // Remove current selection
                dom.removeClass(dom.select('td.mceSelected,th.mceSelected'), 'mceSelected');

                // Add new selection
                for (y = startY; y <= maxY; y++) {
                    for (x = startX; x <= maxX; x++) {
                        if (grid[y][x]) {
                            dom.addClass(grid[y][x].elm, 'mceSelected');
                        }
                    }
                }
            }
        }

        // Expose to public
        tinymce.extend(this, {
            deleteTable : deleteTable,
            split : split,
            merge : merge,
            insertRow : insertRow,
            insertCol : insertCol,
            insertNumCol: toggleNumCol,
            updateNumCol: updateNumCol,
            deleteCols : deleteCols,
            deleteRows : deleteRows,
            cutRows : cutRows,
            copyRows : copyRows,
            pasteRows : pasteRows,
            getPos : getPos,
            setStartCell : setStartCell,
            setEndCell : setEndCell,
            /**
             * ATLASSIAN API additions
             */
            moveCaretToNextCell : moveCaretToNextCell,
            moveCaretToPrevCell : moveCaretToPrevCell,
            cutColumns : cutColumns,
            copyColumns: copyColumns,
            pasteColumns: pasteColumns,
            prepareTableForColPasteAndCheckIfNeedToRepaint : prepareTableForColPasteAndCheckIfNeedToRepaint,
            toggleFluidColumnWidth: toggleFluidColumnWidth,
            toggleFixedColumnWidth: toggleFixedColumnWidth,
        });
    }

    var TablePlugin = {
        init : function(ed, url) {
            editor = ed;
            var winMan;
            var clipboardRows;
            var clipboardColumns;
            var hasCellSelection = true; // Might be selected cells on reload

            function createTableGrid(node) {
                // ATLASSIAN CONF-6919 - getParent returns the current element, which is not what we want for a selection.
                var selection = ed.selection;
                var tblElm;
                node = node || selection.getNode().parentNode;
                //CONFDEV-40905
                tblElm = ed.dom.getParent(node, 'table.confluenceTable');

                if (tblElm) {
                    return new TableGrid(tblElm, ed.dom, selection);
                }
            }

            function cleanup() {
                // Restore selection possibilities
                ed.getBody().style.webkitUserSelect = '';

                if (hasCellSelection) {
                    ed.dom.removeClass(ed.dom.select('td.mceSelected,th.mceSelected'), 'mceSelected');
                    hasCellSelection = false;
                }
            }

            // Register buttons
            each([
                ['table', 'table.desc', 'mceInsertTable', true],
                ['delete_table', 'table.del', 'mceTableDelete'],
                ['delete_col', 'table.delete_col_desc', 'mceTableDeleteCol'],
                ['delete_row', 'table.delete_row_desc', 'mceTableDeleteRow'],
                ['col_after', 'table.col_after_desc', 'mceTableInsertColAfter'],
                ['col_before', 'table.col_before_desc', 'mceTableInsertColBefore'],
                ['row_after', 'table.row_after_desc', 'mceTableInsertRowAfter'],
                ['row_before', 'table.row_before_desc', 'mceTableInsertRowBefore'],
                ['row_props', 'table.row_desc', 'mceTableRowProps', true],
                ['cell_props', 'table.cell_desc', 'mceTableCellProps', true],
                ['split_cells', 'table.split_cells_desc', 'mceTableSplitCells', true],
                ['merge_cells', 'table.merge_cells_desc', 'mceTableMergeCells', true]
            ], function(c) {
                ed.addButton(c[0], {title : c[1], cmd : c[2], ui : c[3]});
            });

            // Select whole table is a table border is clicked
            if (!tinymce.isIE) {
                ed.onClick.add(function(ed, e) {
                    e = e.target;

                    if (e.nodeName === 'TABLE') {
                        ed.selection.select(e);
                        ed.nodeChanged();
                    }
                });
            }

            ed.onPreProcess.add(function(ed, args) {
                var nodes;
                var i;
                var node;
                var dom = ed.dom;
                var value;

                nodes = dom.select('table', args.node);
                i = nodes.length;
                while (i--) {
                    node = nodes[i];
                    dom.setAttrib(node, 'data-mce-style', '');

                    if ((value = dom.getAttrib(node, 'width'))) {
                        dom.setStyle(node, 'width', value);
                        dom.setAttrib(node, 'width', '');
                    }

                    if ((value = dom.getAttrib(node, 'height'))) {
                        dom.setStyle(node, 'height', value);
                        dom.setAttrib(node, 'height', '');
                    }
                }
            });

            // Handle node change updates
            ed.onNodeChange.add(function(ed, cm, n) {
                var p;

                n = ed.selection.getStart();
                p = ed.dom.getParent(n, 'td,th,caption');
                cm.setActive('table', n.nodeName === 'TABLE' || !!p);

                // Disable table tools if we are in caption
                if (p && p.nodeName === 'CAPTION') {
                    p = 0;
                }

                cm.setDisabled('delete_table', !p);
                cm.setDisabled('delete_col', !p);
                cm.setDisabled('delete_table', !p);
                cm.setDisabled('delete_row', !p);
                cm.setDisabled('col_after', !p);
                cm.setDisabled('col_before', !p);
                cm.setDisabled('row_after', !p);
                cm.setDisabled('row_before', !p);
                cm.setDisabled('row_props', !p);
                cm.setDisabled('cell_props', !p);
                cm.setDisabled('split_cells', !p);
                cm.setDisabled('merge_cells', !p);
            });

            ed.onInit.add(function(ed) {
                var startTable;
                var startCell;
                var dom = ed.dom;
                var tableGrid;

                winMan = ed.windowManager;

                // Add cell selection logic
                ed.onMouseDown.add(function(ed, e) {
                    if (e.button != 2) {
                        cleanup();

                        startCell = dom.getParent(e.target, 'td,th');
                        startTable = dom.getParent(startCell, 'table');
                    }
                });

                dom.bind(ed.getDoc(), 'mouseover', function(e) {
//                    var sel, table, target = e.target;

//                    if (startCell && (tableGrid || target != startCell) && (target.nodeName == 'TD' || target.nodeName == 'TH')) {
                    // ATLASSIAN - fix table grid for images
                    var sel;
                    var table;
                    var target = dom.getParent(e.target, 'td,th');
                    if (startCell && (tableGrid || target != startCell) && target) {
                        table = dom.getParent(target, 'table');
                        if (table == startTable) {
                            if (!tableGrid) {
                                tableGrid = createTableGrid(table);
                                tableGrid.setStartCell(startCell);

                                ed.getBody().style.webkitUserSelect = 'none';
                            }

                            tableGrid.setEndCell(target);
                            hasCellSelection = true;
                        }

                        // Remove current selection
                        sel = ed.selection.getSel();

                        try {
                            if (sel.removeAllRanges) {
                                sel.removeAllRanges();
                            } else {
                                sel.empty();
                            }
                        } catch (ex) {
                            // IE9 might throw errors here
                        }

                        e.preventDefault();
                    }
                });

                ed.onMouseUp.add(function(ed, e) {
                    var rng;
                    var sel = ed.selection;
                    var selectedCells;
                    var nativeSel = sel.getSel();
                    var walker;
                    var node;
                    var lastNode;
                    var endNode;

                    // Move selection to startCell
                    if (startCell) {
                        if (tableGrid) {
                            ed.getBody().style.webkitUserSelect = '';
                        }

                        function setPoint(node, start) {
                            var walker = new tinymce.dom.TreeWalker(node, node);

                            do {
                                // Text node
                                if (node.nodeType === 3 && tinymce.trim(node.nodeValue).length !== 0) {
                                    if (start) {
                                        rng.setStart(node, 0);
                                    } else {
                                        rng.setEnd(node, node.nodeValue.length);
                                    }

                                    return;
                                }

                                // BR element
                                if (node.nodeName === 'BR') {
                                    if (start) {
                                        rng.setStartBefore(node);
                                    } else {
                                        rng.setEndBefore(node);
                                    }

                                    return;
                                }
                            } while (node = (start ? walker.next() : walker.prev()));
                        }

                        // Try to expand text selection as much as we can only Gecko supports cell selection
                        selectedCells = dom.select('td.mceSelected,th.mceSelected');
                        if (selectedCells.length > 0) {
                            rng = dom.createRng();
                            node = selectedCells[0];
                            endNode = selectedCells[selectedCells.length - 1];
                            rng.setStartBefore(node);
                            rng.setEndAfter(node);

                            setPoint(node, 1);
                            walker = new tinymce.dom.TreeWalker(node, dom.getParent(selectedCells[0], 'table'));

                            do {
                                if (node.nodeName === 'TD' || node.nodeName === 'TH') {
                                    if (!dom.hasClass(node, 'mceSelected')) {
                                        break;
                                    }

                                    lastNode = node;
                                }
                            } while (node = walker.next());

                            setPoint(lastNode);

                            sel.setRng(rng);
                        }

                        ed.nodeChanged();
                        startCell = tableGrid = startTable = null;
                    }
                });

                /**
                 * ATLASSIAN: If we restore an undo snapshot that contains selected table cells with class="mceSelected", this
                 * call back will ensure the user can reset the selection.
                 *
                 * At the moment cleanup(), which is responsible for stripping mceSelected, is guarded by the variable
                 * hasCellSelection (which spocke introduced to fix performance issues which are related to doing running
                 * a class selector over the DOM on each mouse down.
                 */
                ed.onUndo.add(function (ed, cm, e) {
                    hasCellSelection = ed.dom.select("td.mceSelected, th.mceSelected").length > 0;
                });

                ed.onKeyUp.add(function(ed, e) {
                    cleanup();
                });

                ed.onKeyDown.add(function (ed, e) {
                    fixTableCellSelection(ed);
                });

                ed.onMouseDown.add(function (ed, e) {
                    if (e.button != 2) {
                        fixTableCellSelection(ed);
                    }
                });
                function tableCellSelected(ed, rng, n, currentCell) {
                    // The decision of when a table cell is selected is somewhat involved.  The fact that this code is
                    // required is actually a pointer to the root cause of this bug. A cell is selected when the start
                    // and end offsets are 0, the start container is a text, and the selection node is either a TR (most cases)
                    // or the parent of the table (in the case of the selection containing the last cell of a table).
                    var TEXT_NODE = 3;
                    var table = ed.dom.getParent(rng.startContainer, 'TABLE');
                    var tableParent;
                    var allOfCellSelected;
                    var tableCellSelection;
                    if (table) {
                        tableParent = table.parentNode;
                    }
                    allOfCellSelected =rng.startContainer.nodeType === TEXT_NODE &&
                            rng.startOffset == 0 &&
                            rng.endOffset == 0 &&
                            currentCell &&
                            (n.nodeName==="TR" || n==tableParent);
                    tableCellSelection = (n.nodeName==="TD"||n.nodeName==="TH")&& !currentCell;
                    return  allOfCellSelected || tableCellSelection;
                    // return false;
                }

                // this nasty hack is here to work around some WebKit selection bugs.
                function fixTableCellSelection(ed) {
                    if (!tinymce.isWebKit) {
                        return;
                    }

                    var rng = ed.selection.getRng();
                    var n = ed.selection.getNode();
                    var currentCell = ed.dom.getParent(rng.startContainer, 'TD,TH');

                    if (!tableCellSelected(ed, rng, n, currentCell)) {
                        return;
                    }
                    if (!currentCell) {
                        currentCell=n;
                    }

                    // Get the very last node inside the table cell
                    var end = currentCell.lastChild;
                    while (end.lastChild) {
                        end = end.lastChild;
                    }

                    // Select the entire table cell. Nothing outside of the table cell should be selected.
                    rng.setEnd(end, end.nodeValue.length);
                    ed.selection.setRng(rng);
                }
                ed.plugins.table.fixTableCellSelection=fixTableCellSelection;

                // Add context menu
                if (ed && ed.plugins.contextmenu) {
                    ed.plugins.contextmenu.onContextMenu.add(function(th, m, e) {
                        var sm;
                        var se = ed.selection;
                        var el = se.getNode() || ed.getBody();

                        if (ed.dom.getParent(e, 'td') || ed.dom.getParent(e, 'th') || ed.dom.select('td.mceSelected,th.mceSelected').length) {
                            m.removeAll();

                            if (el.nodeName === 'A' && !ed.dom.getAttrib(el, 'name')) {
                                m.add({title : 'advanced.link_desc', icon : 'link', cmd : ed.plugins.advlink ? 'mceAdvLink' : 'mceLink', ui : true});
                                m.add({title : 'advanced.unlink_desc', icon : 'unlink', cmd : 'UnLink'});
                                m.addSeparator();
                            }

                            if (el.nodeName === 'IMG' && el.className.indexOf('mceItem') === -1) {
                                m.add({title : 'advanced.image_desc', icon : 'image', cmd : ed.plugins.advimage ? 'mceAdvImage' : 'mceImage', ui : true});
                                m.addSeparator();
                            }

                            m.add({title : 'table.desc', icon : 'table', cmd : 'mceInsertTable', value : {action : 'insert'}});
                            m.add({title : 'table.props_desc', icon : 'table_props', cmd : 'mceInsertTable'});
                            m.add({title : 'table.del', icon : 'delete_table', cmd : 'mceTableDelete'});
                            m.addSeparator();

                            // Cell menu
                            sm = m.addMenu({title : 'table.cell'});
                            sm.add({title : 'table.cell_desc', icon : 'cell_props', cmd : 'mceTableCellProps'});
                            sm.add({title : 'table.split_cells_desc', icon : 'split_cells', cmd : 'mceTableSplitCells'});
                            sm.add({title : 'table.merge_cells_desc', icon : 'merge_cells', cmd : 'mceTableMergeCells'});

                            // Row menu
                            sm = m.addMenu({title : 'table.row'});
                            sm.add({title : 'table.row_desc', icon : 'row_props', cmd : 'mceTableRowProps'});
                            sm.add({title : 'table.row_before_desc', icon : 'row_before', cmd : 'mceTableInsertRowBefore'});
                            sm.add({title : 'table.row_after_desc', icon : 'row_after', cmd : 'mceTableInsertRowAfter'});
                            sm.add({title : 'table.delete_row_desc', icon : 'delete_row', cmd : 'mceTableDeleteRow'});
                            sm.addSeparator();
                            sm.add({title : 'table.cut_row_desc', icon : 'cut', cmd : 'mceTableCutRow'});
                            sm.add({title : 'table.copy_row_desc', icon : 'copy', cmd : 'mceTableCopyRow'});
                            sm.add({title : 'table.paste_row_before_desc', icon : 'paste', cmd : 'mceTablePasteRowBefore'}).setDisabled(!clipboardRows);
                            sm.add({title : 'table.paste_row_after_desc', icon : 'paste', cmd : 'mceTablePasteRowAfter'}).setDisabled(!clipboardRows);

                            // Column menu
                            sm = m.addMenu({title : 'table.col'});
                            sm.add({title : 'table.col_before_desc', icon : 'col_before', cmd : 'mceTableInsertColBefore'});
                            sm.add({title : 'table.col_after_desc', icon : 'col_after', cmd : 'mceTableInsertColAfter'});
                            sm.add({title : 'table.delete_col_desc', icon : 'delete_col', cmd : 'mceTableDeleteCol'});
                        } else {
                            m.add({title : 'table.desc', icon : 'table', cmd : 'mceInsertTable'});
                        }
                    });
                }

                // Fix to allow navigating up and down in a table in WebKit browsers.
                if (tinymce.isWebKit) {
                    function moveSelection(ed, e) {
                        var VK = tinymce.VK;
                        var key = e.keyCode;

                        function handle(upBool, sourceNode, event) {
                            var siblingDirection = upBool ? 'previousSibling' : 'nextSibling';
                            var currentRow = ed.dom.getParent(sourceNode, 'tr');
                            var siblingRow = currentRow[siblingDirection];

                            if (siblingRow) {
                                moveCursorToRow(ed, sourceNode, siblingRow, upBool);
                                tinymce.dom.Event.cancel(event);
                                return true;
                            } else {
                                var tableNode = ed.dom.getParent(currentRow, 'table');
                                var middleNode = currentRow.parentNode;
                                var parentNodeName = middleNode.nodeName.toLowerCase();
                                if (parentNodeName === 'tbody' || parentNodeName === (upBool ? 'tfoot' : 'thead')) {
                                    var targetParent = getTargetParent(upBool, tableNode, middleNode, 'tbody');
                                    if (targetParent !== null) {
                                        return moveToRowInTarget(upBool, targetParent, sourceNode, event);
                                    }
                                }
                                return escapeTable(upBool, currentRow, siblingDirection, tableNode, event);
                            }
                        }

                        function getTargetParent(upBool, topNode, secondNode, nodeName) {
                            var tbodies = ed.dom.select('>' + nodeName, topNode);
                            var position = tbodies.indexOf(secondNode);
                            if (upBool && position === 0 || !upBool && position === tbodies.length - 1) {
                                return getFirstHeadOrFoot(upBool, topNode);
                            } else if (position === -1) {
                                var topOrBottom = secondNode.tagName.toLowerCase() === 'thead' ? 0 : tbodies.length - 1;
                                return tbodies[topOrBottom];
                            } else {
                                return tbodies[position + (upBool ? -1 : 1)];
                            }
                        }

                        function getFirstHeadOrFoot(upBool, parent) {
                            var tagName = upBool ? 'thead' : 'tfoot';
                            var headOrFoot = ed.dom.select('>' + tagName, parent);
                            return headOrFoot.length !== 0 ? headOrFoot[0] : null;
                        }

                        function moveToRowInTarget(upBool, targetParent, sourceNode, event) {
                            var targetRow = getChildForDirection(targetParent, upBool);
                            targetRow && moveCursorToRow(ed, sourceNode, targetRow, upBool);
                            tinymce.dom.Event.cancel(event);
                            return true;
                        }

                        function escapeTable(upBool, currentRow, siblingDirection, table, event) {
                            var tableSibling = table[siblingDirection];
                            if (tableSibling) {
                                moveCursorToStartOfElement(tableSibling);
                                return true;
                            } else {
                                var parentCell = ed.dom.getParent(table, 'td,th');
                                if (parentCell) {
                                    return handle(upBool, parentCell, event);
                                } else {
                                    var backUpSibling = getChildForDirection(currentRow, !upBool);
                                    moveCursorToStartOfElement(backUpSibling);
                                    return tinymce.dom.Event.cancel(event);
                                }
                            }
                        }

                        function getChildForDirection(parent, up) {
                            var child =  parent && parent[up ? 'lastChild' : 'firstChild'];
                            // BR is not a valid table child to return in this case we return the table cell
                            return child && child.nodeName === 'BR' ? ed.dom.getParent(child, 'td,th') : child;
                        }

                        function moveCursorToStartOfElement(n) {
                            ed.selection.setCursorLocation(n, 0);
                        }

                        function isVerticalMovement() {
                            return key == VK.UP || key == VK.DOWN;
                        }

                        function isInTable(ed) {
                            var node = ed.selection.getNode();
                            var currentRow = ed.dom.getParent(node, 'tr');
                            return currentRow !== null;
                        }

                        function columnIndex(column) {
                            var colIndex = 0;
                            var c = column;
                            while (c.previousSibling) {
                                c = c.previousSibling;
                                colIndex = colIndex + getSpanVal(c, "colspan");
                            }
                            return colIndex;
                        }

                        function findColumn(rowElement, columnIndex) {
                            var c = 0;
                            var r = 0;
                            each(rowElement.children, function(cell, i) {
                                c = c + getSpanVal(cell, "colspan");
                                r = i;
                                if (c > columnIndex) {
                                    return false;
                                }
                            });
                            return r;
                        }

                        function moveCursorToRow(ed, node, row, upBool) {
                            var srcColumnIndex = columnIndex(ed.dom.getParent(node, 'td,th'));
                            var tgtColumnIndex = findColumn(row, srcColumnIndex);
                            var tgtNode = row.childNodes[tgtColumnIndex];
                            var rowCellTarget = getChildForDirection(tgtNode, upBool);
                            moveCursorToStartOfElement(rowCellTarget || tgtNode);
                        }

                        function shouldFixCaret(preBrowserNode) {
                            var newNode = ed.selection.getNode();
                            var newParent = ed.dom.getParent(newNode, 'td,th');
                            var oldParent = ed.dom.getParent(preBrowserNode, 'td,th');
                            return newParent && newParent !== oldParent && checkSameParentTable(newParent, oldParent);
                        }

                        function checkSameParentTable(nodeOne, NodeTwo) {
                            return ed.dom.getParent(nodeOne, 'TABLE') === ed.dom.getParent(NodeTwo, 'TABLE');
                        }

                        if (isVerticalMovement() && isInTable(ed)) {
                            var preBrowserNode = ed.selection.getNode();
                            setTimeout(function() {
                                if (shouldFixCaret(preBrowserNode)) {
                                    handle(!e.shiftKey && key === VK.UP, preBrowserNode, e);
                                }
                            }, 0);
                        }
                    }

                    ed.onKeyDown.add(moveSelection);
                }

                // Fixes an issue on Gecko where it's impossible to place the caret behind a table
                // This fix will force a paragraph element after the table but only when the forced_root_block setting is enabled
                if (!tinymce.isIE) {
                    function fixTableCaretPos() {
                        /*
                         * ATLASSIAN - this processing is not needed. We use our own CursorTargetPlugin instead to ensure
                         * a table is always surrounded in paragraphs if needed.

                         var last;

                         // Skip empty text nodes form the end
                         for (last = ed.getBody().lastChild; last && last.nodeType == 3 && !last.nodeValue.length; last = last.previousSibling) ;

                         if (last && last.nodeName == 'TABLE')
                         ed.dom.add(ed.getBody(), 'p', null, '<br mce_bogus="1" />');
                         */
                    }

                    // Fixes an bug where it's impossible to place the caret before a table in Gecko
                    // this fix solves it by detecting when the caret is at the beginning of such a table
                    // and then manually moves the caret infront of the table
                    if (tinymce.isGecko) {
                        ed.onKeyDown.add(function(ed, e) {
                            var rng;
                            var table;
                            var dom = ed.dom;

                            // On gecko it's not possible to place the caret before a table
                            if (e.keyCode === 37 || e.keyCode === 38) {
                                rng = ed.selection.getRng();
                                table = dom.getParent(rng.startContainer, 'table');

                                if (table && ed.getBody().firstChild == table) {
                                    if (isAtStart(rng, table)) {
                                        rng = dom.createRng();

                                        rng.setStartBefore(table);
                                        rng.setEndBefore(table);

                                        ed.selection.setRng(rng);

                                        e.preventDefault();
                                    }
                                }
                            }
                        });
                    }

                    ed.onKeyUp.add(fixTableCaretPos);
                    ed.onSetContent.add(fixTableCaretPos);
                    ed.onVisualAid.add(fixTableCaretPos);

                    /*
                     ATLASSIAN: CONF-24090 - The purpose of this listener is to remove the paragraph that is added after the last table on the page to allow
                     the cursor to be placed after it. Since we have commented out the "adding" of this paragraph above (since we have our own
                     cursor target plugin that handles this, we should similarly comment out this listener removes this extra paragraph on cleanup (which is typically run before save)

                     ed.onPreProcess.add(function(ed, o) {
                     var last = o.node.lastChild;

                     if (last && last.childNodes.length == 1 && last.firstChild.nodeName == 'BR')
                     ed.dom.remove(last);
                     });
                     */


                    /**
                     * Fixes bug in Gecko where shift-enter in table cell does not place caret on new line
                     */
                    if (tinymce.isGecko) {
                        ed.onKeyDown.add(function(ed, e) {
                            if (e.keyCode === tinymce.VK.ENTER && e.shiftKey) {
                                var node = ed.selection.getRng().startContainer;
                                var tableCell = dom.getParent(node, 'td,th');
                                if (tableCell) {
                                    var zeroSizedNbsp = ed.getDoc().createTextNode("\uFEFF");
                                    dom.insertAfter(zeroSizedNbsp, node);
                                }
                            }
                        });
                    }


                    fixTableCaretPos();
                    ed.startContent = ed.getContent({format : 'raw'});
                }
            });

            // ATLASSIAN move these later
            function storeRowCells(cells) {
                var cellsToSave = [];
                var cellString = "";

                for(var i = 0; i < cells.length; i++) {
                    cellsToSave.push(AJS.Rte.getEditor().serializer.serialize(cells[i]));
                }

                // ATLASSIAN
                cellString = "<tr>" + cellsToSave.join("</tr><tr>") + "</tr>";
                storageManager.setItem("copied",cellString,(60 * 60) * 2); //replace with something other than a comma.
            }

            // ATLASSIAN : FYI: IE will generate an error if you try to set the innerHTML of a table. See this for more information:
            // http://support.microsoft.com/kb/239832
            function retriveRowCells() {
                var rows = [];
                var cellString = storageManager.getItem("copied") || "";
                var element;

                if(cellString) {
                    element = ed.getDoc().createElement("div");
                    element.innerHTML = "<table>" + cellString + "</table>";
                    rows = $(element).find('tr');
                }

                return rows;
            }

            // ATLASSIAN - CONFDEV-31957 Copy/Paste Column support
            function storeColumnCells(cells) {
                storageManager.setItem("copiedCols", JSON.stringify(cells));
            }

            // ATLASSIAN - CONFDEV-31957 Copy/Paste Column support
            function retrieveColumnCells() {
                return JSON.parse(storageManager.getItem("copiedCols")) || {};
            }

            // Register action commands
            each({
                mceTableSplitCells : function(grid) {
                    grid.split();
                },

                mceTableMergeCells : function(grid) {
                    var rowSpan;
                    var colSpan;
                    var cell;

                    cell = ed.dom.getParent(ed.selection.getNode(), 'th,td');
                    if (cell) {
                        rowSpan = cell.rowSpan;
                        colSpan = cell.colSpan;
                    }
                    //ATLASSIAN: removed the modal popup for non selected cells.
                    //check if we can do something and merge.
                    if (ed.dom.select('td.mceSelected,th.mceSelected').length) {
                        grid.merge();
                    }

                },

                mceTableInsertRowBefore : function(grid) {
                    grid.insertRow(true);
                },

                mceTableInsertRowAfter : function(grid) {
                    grid.insertRow();
                },

                // ATLASSIAN CONFDEV-31959
                mceTableInsertNumberingCol: function(grid) {
                    grid.insertNumCol();
                },

                // ATLASSIAN CONFDEV-31959
                mceTableUpdateNumberingCol: function(grid) {
                    grid.updateNumCol();
                },

                // ATLASSIAN CONF-3393
                mceAutoWidth: function (grid) {
                    grid.toggleFluidColumnWidth();
                },

                // ATLASSIAN CONF-3393
                mceFixedWidth: function (grid) {
                    grid.toggleFixedColumnWidth();
                },

                mceTableInsertColBefore : function(grid) {
                    copiedColumnWidth = null;
                    grid.insertCol(true);
                },

                mceTableInsertColAfter : function(grid) {
                    copiedColumnWidth = null;
                    grid.insertCol();
                },

                mceTableDeleteCol : function(grid) {
                    grid.deleteCols();
                },

                mceTableDeleteRow : function(grid) {
                    grid.deleteRows();
                },

                mceTableCutRow : function(grid) {
                    clipboardRows = grid.cutRows();
                    storeRowCells(clipboardRows);
                },

                mceTableCopyRow : function(grid) {
                    clipboardRows = grid.copyRows();
                    storeRowCells(clipboardRows);
                },

                mceTablePasteRowBefore : function(grid) {
                    grid.pasteRows(retriveRowCells(), true);
                },

                mceTablePasteRowAfter : function(grid) {
                    grid.pasteRows(retriveRowCells());
                },

                mceTableDelete : function(grid) {
                    grid.deleteTable();
                },

                /**
                 * ATLASSIAN
                 */
                mceTableMoveCaretToNextCell : function(grid) {
                    grid.moveCaretToNextCell();
                },

                /**
                 * ATLASSIAN
                 */
                mceTableMoveCaretToPrevCell : function(grid) {
                    grid.moveCaretToPrevCell();
                },

                /**
                 * ATLASSIAN
                 */
                mceTableCopyCol : function(grid) {
                    clipboardColumns = grid.copyColumns();
                    storeColumnCells(clipboardColumns);
                },

                /**
                 * ATLASSIAN
                 */
                mceTableCutCol : function(grid) {
                    clipboardColumns = grid.cutColumns();
                    storeColumnCells(clipboardColumns);
                },

                /**
                 * ATLASSIAN
                 */
                mceTablePasteColBefore : function(grid) {
                    var columns = retrieveColumnCells();
                    if(grid.prepareTableForColPasteAndCheckIfNeedToRepaint(columns)) {
                        ed.execCommand('mceRepaint');
                        grid = createTableGrid();
                    }
                    grid.pasteColumns(columns, true);
                },

                /**
                 * ATLASSIAN
                 */
                mceTablePasteColAfter : function(grid) {
                    grid.pasteColumns(retrieveColumnCells(), false);
                }

            }, function(func, name) {
                ed.addCommand(name, function() {
                    var grid = createTableGrid();

                    if (grid) {
                        func(grid);
                        ed.execCommand('mceRepaint');
                        cleanup();
                    }
                });
            });

            // Register dialog commands
            each({
                mceInsertTable : function(val) {
                    winMan.open({
                        url : url + '/table.htm',
                        width : 400 + parseInt(ed.getLang('table.table_delta_width', 0)),
                        height : 320 + parseInt(ed.getLang('table.table_delta_height', 0)),
                        inline : 1
                    }, {
                        plugin_url : url,
                        action : val ? val.action : 0
                    });
                },

                mceTableRowProps : function() {
                    winMan.open({
                        url : url + '/row.htm',
                        width : 400 + parseInt(ed.getLang('table.rowprops_delta_width', 0)),
                        height : 295 + parseInt(ed.getLang('table.rowprops_delta_height', 0)),
                        inline : 1
                    }, {
                        plugin_url : url
                    });
                },

                mceTableCellProps : function() {
                    winMan.open({
                        url : url + '/cell.htm',
                        width : 400 + parseInt(ed.getLang('table.cellprops_delta_width', 0)),
                        height : 295 + parseInt(ed.getLang('table.cellprops_delta_height', 0)),
                        inline : 1
                    }, {
                        plugin_url : url
                    });
                }
            }, function(func, name) {
                ed.addCommand(name, function(ui, val) {
                    func(val);
                });
            });
        }
    };

    return TablePlugin;
});

require('confluence/module-exporter').safeRequire('atlassian-tinymce/plugins/table/editor_plugin_src', function (TablePlugin) {
    var tinymce = require('tinymce');

    tinymce.create('tinymce.plugins.TablePlugin', TablePlugin);

    // Register plugin
    tinymce.PluginManager.add('table', tinymce.plugins.TablePlugin);
});
