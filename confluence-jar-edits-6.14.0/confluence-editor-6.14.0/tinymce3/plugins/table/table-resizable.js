/**
 * @module confluence-editor/tinymce3/plugins/table/table-resizable
 */
define('confluence-editor/tinymce3/plugins/table/table-resizable', [
    'jquery',
    'ajs',
    'tinymce'
], function ($, AJS, tinymce) {
    'use strict';

    var sensitiveVerticalColumnMatchingThresholdInPixel = 0;
    var sensitiveHorizontalColumnMatchingThresholdInPixel = 1;

    function uuid() {
        function random4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
        }

        return random4() + random4() + '-' + random4() + '-' + random4() + '-' +
                random4() + '-' + random4() + random4() + random4();
    }

    function addColgroup($table) {
        var cols = 0;
        $table.find('>tbody >tr').each(function () {
            var rowCol = 0;
            $(this).find('>th,>td').each(function () {
                var $cell = $(this);
                if ($cell.attr('colspan')) {
                    rowCol += parseInt($cell.attr('colspan'));
                } else {
                    rowCol++;
                }
            });
            // CONFDEV-39492
            if (rowCol > cols) {
                cols = rowCol;
            }
        });

        var $colGroup = $table.find('>colgroup');
        var $existingCols = $colGroup.find('col');
        var noOfExistingCol = $existingCols.length;

        if (noOfExistingCol === cols) {
            return;
        }

        var isColGroupExisted = $colGroup.length > 0;
        if (!isColGroupExisted) {
            $colGroup = $('<colgroup>');
        }

        if (cols > noOfExistingCol) { // add missing col
            for (var i = 0; i < (cols - noOfExistingCol); i++) {
                var $col = $('<col>');
                $colGroup.append($col);
            }
        } else { // need to remove cols CONFDEV-39492
            for (var j = 0; j < noOfExistingCol - cols; j++) {
                $existingCols.last().remove();
            }
        }

        if (!isColGroupExisted) {
            $table.prepend($colGroup);
        }
        return $colGroup;
    }

    function calculateColumnsWidth($table, byPercentage, $activeColumn) {
        var $cols = $table.find('>colgroup>col');

        if ($cols.length === 0) {
            addColgroup($table);
            $cols = $table.find('>colgroup>col');
        }

        var noOfColumn = $cols.length;

        var $originalRow;
        var $cells;
        var $footer;
        // Looking for a row which is not merged
        var $rows = $table.find('>thead>tr,>tbody>tr,>tr');
        for (var i = 0; i < $rows.length; i++) {
            if (noOfColumn === $rows.eq(i).find('>th, >td').length) {
                $originalRow = $rows.eq(i);
                break;
            }
        }
        if ($originalRow) {
            $cells = $originalRow.find('>th, >td');
        } else { // Worst case, all rows were merge, poor me :(
            var $footerRow = $('<tr>');
            $footer = $('<tfoot>');
            $footer.append($footerRow);

            for (i = 0; i < noOfColumn; i++) {
                $footerRow.append($('<td>'));
            }

            $table.append($footer);

            $cells = $footerRow.find('>td');
        }

        var tableWidth = $table.outerWidth() - 1; // exclude 1 border

        var cellWidths = [];
        var boundingClientRects = [];

        // Need to do for loop twice to avoid col width being adjusted 'on the fly'
        // which cause subsequence affect to width calculation because the browser re-rendering will be involved
        for (i = 0; i < noOfColumn; i++) {
            // Calculate column width for each <col>
            var $cell = $cells.eq(i);
            var boundingClientRect = $cell[0].getBoundingClientRect();

            var cellWidth = !!byPercentage
                    ? (boundingClientRect.width / tableWidth * 100) + "%"
                    : $cell.outerWidth();

            cellWidths[i] = cellWidth;
            boundingClientRects[i] = boundingClientRect;
        }

        var bodyOffsetLeft = 0;

        if (tinymce.activeEditor) {
            bodyOffsetLeft = tinymce.activeEditor.getWin().pageXOffset;
        }

        for (i = 0; i < noOfColumn; i++) {
            $cols.eq(i)
                    .attr('data-resize-pixel', boundingClientRects[i].width)
                    .attr('data-resize-percent', boundingClientRects[i].width / tableWidth * 100)
                    .attr('data-offset-left', boundingClientRects[i].left + bodyOffsetLeft)
                    .attr('data-offset-right', boundingClientRects[i].right + bodyOffsetLeft)
                    .removeAttr('data-mce-style');//CONFDEV-40187

            // Shouldn't touch other columns' width if we just want to recalculate one specific column
            if ($activeColumn && (i !== $activeColumn.index() || i !== $activeColumn.next().index())) {
                continue;
            }
            $cols.eq(i)
                    .css({width: cellWidths[i]});
        }

        if ($footer) {
            $footer.remove();
        }

        //CONFDEV-40187: MUST remove to avoid value of this attr being set back to style when saving page
        $table.removeAttr('data-mce-style');
    }

    function findSuroundingTables($table) {
        var $nextTable = $table.nextAll('.confluenceTable').first();
        var $prevTable = $table.prevAll('.confluenceTable').first();
        return $.merge($prevTable, $nextTable);
    }

    function alignWithOtherTables($activeColumn, $doc, $tables) {
        var matchingMap = {};
        var match = false;

        var displayAlignment = function ($table, offset) {
            $('<div contenteditable="false" class="resize-alignment-bar">')
                    .css({
                        top: parseInt($table.offset().top),
                        left: offset,
                        height: $table.height()
                    }).appendTo($doc.find('body'));
        };

        $tables.each(function () {
            var $table = $(this);
            if (!isFixed($table)) {
                return;
            }

            $table.find('th, td').each(function () {

                // try to save a bit of performance
                if (matchingMap[$table]) {
                    return;
                }

                var $cell = $(this);
                var cellRight = $cell.offset().left + $cell.innerWidth();
                var delta = Math.abs(cellRight - parseInt($activeColumn.attr('data-offset-right')));
                if (delta <= sensitiveVerticalColumnMatchingThresholdInPixel) {
                    matchingMap[$table] = true;
                    match = true;
                    displayAlignment($table, cellRight);
                }
            });
        });

        return match;
    }


    function alignWithOtherColumns($currentColumn, $table, $body) {
        var match;

        if (Math.abs(parseInt($currentColumn.next().attr('data-resize-pixel')) - parseInt($currentColumn.attr('data-resize-pixel'))) <= sensitiveHorizontalColumnMatchingThresholdInPixel) {
            match = true;

            $body.find('.resizable-align-right').remove();
            $('<div contenteditable="false" class="resize-alignment-bar resizable-align-right">')
                    .css({
                        height: $table.height(),
                        top: parseInt($table.offset().top),
                        left: parseInt($currentColumn.next().attr('data-offset-right')) - 1
                    }).appendTo($body)
                    .clone()
                    .css({
                        left: parseInt($currentColumn.attr('data-offset-left')) - 1
                    }).appendTo($body);
        }

        if (Math.abs(parseInt($currentColumn.prev().attr('data-resize-pixel')) - parseInt($currentColumn.attr('data-resize-pixel'))) <= sensitiveHorizontalColumnMatchingThresholdInPixel) {
            match = true;
            $('<div contenteditable="false" class="resize-alignment-bar">')
                    .css({
                        height: $table.height(),
                        top: parseInt($table.offset().top),
                        left: parseInt($currentColumn.prev().attr('data-offset-right')) - 1
                    }).appendTo($body)
                    .clone()
                    .css({
                        left: parseInt($currentColumn.prev().attr('data-offset-left')) - 1
                    }).appendTo($body);
        }

        return match;
    }

    function removeAllAlignments($doc) {
        $doc.find('.resize-alignment-bar').remove();
    }

    var tableResizable = function (options) {
        var defaultOption = {$doc: $(document)};
        var $table = this;
        var tableUUID = $table.data('uuid');
        var isInitialized = $table.data('initialized');
        if (isInitialized) {
            return;
        }
        if (!tableUUID) {
            tableUUID = uuid();
            $table.data('uuid', tableUUID);
        }

        options = $.extend(defaultOption, options || {});

        var MIN_SIZE = 29; // px

        var $doc = options.$doc;
        var editor = options.editor;
        var $body = $doc.find('body');
        var pressed = false;
        var $activeColumn; // The element we should change the width
        var startX;
        var startWidth;
        var bounceBackPosition;
        var joinColumnWidth;
        var startWidthNextCol;
        var startColumnIndex = -1;
        var resizeIndicatorStartLeft;
        var isFirstColumn = false;
        var previousResizeIndicatorLeft;
        var columnMatchingSensitiveInPixel = 7;
        var holdMouse;
        var lastMovingDistance;
        var $surroundingTables;
        var $resizeIndicator = $('<div contenteditable="false" class="synchrony-exclude" id="resize-indicator">');
        var $resizeWidthHolder = $('<div contenteditable="false" class="synchrony-exclude resize-width-holder" unselectable="on">');
        var preResizeTableMode;//table mode before resizing

        var isShowingResizableIndicator = false;
        var minSizeToShowResizeIndicator = 4; // px

        function doResize(movingDistance, isMoveIndicator, e) {

            if (!startWidth) {
                startWidth = $activeColumn.width();
            }
            if ($activeColumn.attr('data-mce-style')) {
                $activeColumn.removeAttr('data-mce-style');
            }

            var reachFullWidth = false;
            if (lastMovingDistance) {

                var movingDelta = movingDistance - lastMovingDistance;

                var containerWidth = $table.parent().width();

                var tableWidthPercentage = $table.width() / containerWidth * 100;
                // hit the right size limit
                if (isRelative($table)
                        && (tableWidthPercentage > 99.9)
                        && (movingDelta > 1)) {
                    reachFullWidth = true;
                    !joinColumnWidth && (joinColumnWidth = $activeColumn.width() + $activeColumn.next().width());
                }

                // Make column matching a bit more sensitive by holding back a few pixel
                var absoluteMovingDelta = Math.abs((Math.abs(movingDistance) - Math.abs(lastMovingDistance)));
                if (absoluteMovingDelta >= columnMatchingSensitiveInPixel) {
                    holdMouse = false;
                }
                if (holdMouse && absoluteMovingDelta < columnMatchingSensitiveInPixel) {
                    return;
                }
            }

            var newWidth = startWidth + movingDistance;
            (newWidth < MIN_SIZE) && (newWidth = MIN_SIZE);

            $activeColumn.width(newWidth);

            if (reachFullWidth || bounceBackPosition) {
                $activeColumn.next().width(joinColumnWidth - newWidth);
                (!bounceBackPosition) && (bounceBackPosition = e.pageX);
            }

            (bounceBackPosition && bounceBackPosition > e.pageX) && (bounceBackPosition = null);

            calculateColumnsWidth($table, false, $activeColumn);

            if (!isFirstColumn && isMoveIndicator) {
                $resizeIndicator.css({
                    display: 'block',
                    top: parseInt($table.offset().top),
                    left: parseInt($activeColumn.attr('data-offset-right')) - 1,
                    height: $table.height()
                });

                if (isFixed($table)) {
                    var match = alignWithOtherTables($activeColumn, $doc, $surroundingTables) || alignWithOtherColumns($activeColumn, $table, $body);
                    match && (holdMouse = true);
                    !match && removeAllAlignments($body);
                }
            }

            lastMovingDistance = Math.abs(movingDistance);
        }

        var removeIndicator = function () {
            $resizeIndicator.remove();
            $table.removeClass('active-resizable');
            isShowingResizableIndicator = false;
            holdMouse = undefined;
            bounceBackPosition = null;
            joinColumnWidth = null;
            $body.attr('data-table-resizing', false);
        };

        var showIndicator = function (resizeIndicatorLeft) {
            if ($doc.find('#resize-indicator').length > 0) {
                $resizeIndicator = $doc.find('#resize-indicator');
            } else {
                $resizeIndicator.appendTo($body);
            }
            $table.addClass('active-resizable');
            $resizeIndicator.css({
                top: parseInt($table.offset().top),
                left: resizeIndicatorLeft,
                height: $table.height()
            });
            isShowingResizableIndicator = true;
        };

        var mouseMoveHandler = function (event) {
            if (!pressed) {
                return;
            }

            AJS.trigger('synchrony.stop', { id: 'confluence.table-resize-plugin' });
            doResize(event.pageX - startX, true, event);

            event.preventDefault();
        };

        // Add this holder to keep the current page size when resizing
        var addWidthHolder = function (force) {

            // stop processing if there's no scroll bar
            if ($body.outerWidth(true) === $body[0].scrollWidth) {
                return;
            }

            if (force) {
                removeWidthHolder($table);
            }

            if (!$body.find('#' + tableUUID + '-holder').length) {
                $resizeWidthHolder.css('width', $table.width() + parseInt($(editor.getBody()).css('margin-right')));
                $resizeWidthHolder.attr('id', tableUUID + '-holder');
                $table.after($resizeWidthHolder);
            }
        };

        var mouseUpHandler = function () {

            if (!pressed) {
                return;
            }

            // Fix for IE to capture mousemove outside browser window
            $table[0].releaseCapture && $table[0].releaseCapture();

            pressed = false;

            removeIndicator();
            removeAllAlignments($doc);
            removeWidthHolder($table);

            // CONFDEV-37226
            if ($activeColumn && $activeColumn.width() !== startWidth) {
                if (isFluid($table)) {
                    $table.addClass("relative-table");
                }

                AJS.Confluence.Analytics.publish(
                        'confluence.table.resize.from.' + preResizeTableMode,
                        {pageId: AJS.Meta.get('page-id')}
                );
            }

            if (isRelative($table)) {
                makeTableRelative($table);
            }

            if (isFixed($table)) {
                addWidthHolder(true);
            }

            // Support undo/redo for table resize
            if (editor) {
                editor.undoManager.add();
                AJS.trigger('synchrony.start', { id: 'confluence.table-resize-plugin' });
            }
        };

        $table.on('mousemove.table-resizable' + tableUUID, 'th, td', function(event) {

            if (pressed) {
                return;
            }

            if ($(this).parents('table.confluenceTable').length > 1) { // nested table
                return;
            }

            if (isFluid($table) && AJS.DarkFeatures.isEnabled("confluence.table.resizable.hide-indicator-on-fluid")) {
                return;
            }
            addColgroup($table);

            var $currentCell = $(this);
            var cellOffsetLeft = $currentCell.offset().left;
            var resizeIndicatorLeft;
            var resizeIndicatorHalfWidth = Math.round($resizeIndicator.outerWidth() / 2);
            var cellIndex = $currentCell.index();
            var $siblings = $currentCell.parent().children();

            startColumnIndex = -1;

            var currentRowIndex = $currentCell.closest("tr").index();
            $currentCell.closest('table.confluenceTable tr').prevAll('tr').each(function(){
                var $row = $(this);
                //get row index for search cells
                var rowIndex = $row.index();
                $row.children('td, th').each(function (){
                    //check if this cell comes before our current cell
                    if ($currentCell.offset().left > $(this).offset().left) {
                        // check if it has both rowspan and colspan
                        var colSpn = parseInt($(this).attr("colspan"));
                        var rowSpn = parseInt($(this).attr("rowspan"));
                        if (colSpn && rowSpn) {
                            if(rowIndex + rowSpn > currentRowIndex) {
                                cellIndex += colSpn;
                            }
                        } else if (rowSpn && (rowIndex + rowSpn > currentRowIndex)) {
                            cellIndex +=1;
                        }
                    }
                });
            });

            isFirstColumn = false;
            if ((event.pageX - $currentCell.offset().left) < $currentCell.outerWidth() / 2) { // Left side of cell

                cellIndex = cellIndex - 1;

                // don't support resizing on auto numbering column
                if (cellIndex === 0 && $currentCell.prev().hasClass('numberingColumn')) {
                    return;
                }

                if (cellIndex < 0) { // first column
                    isFirstColumn = true;
                    var $sibling = $siblings.eq(0);
                    if ($sibling.attr('colspan')) {
                        startColumnIndex += parseInt($sibling.attr('colspan'));
                    } else {
                        startColumnIndex++;
                    }
                } else {
                    for (var i = 0; i <= cellIndex; i++) {
                        $sibling = $siblings.eq(i);
                        if ($sibling.attr('colspan')) {
                            startColumnIndex += parseInt($sibling.attr('colspan'));
                        } else {
                            startColumnIndex++;
                        }
                    }
                }

                if (isFirstColumn) {
                    resizeIndicatorLeft = cellOffsetLeft + $currentCell.outerWidth() - resizeIndicatorHalfWidth;
                } else {
                    resizeIndicatorLeft = cellOffsetLeft - resizeIndicatorHalfWidth;
                }
            } else { // Right side of cell

                // don't support resizing on auto numbering column
                if (cellIndex === 0 && $currentCell.hasClass('numberingColumn')) {
                    return;
                }

                for (i = 0; i <= cellIndex; i++) {
                    $sibling = $siblings.eq(i);
                    if ($sibling.attr('colspan')) {
                        startColumnIndex += parseInt($sibling.attr('colspan'));
                    } else {
                        startColumnIndex++;
                    }
                }

                resizeIndicatorLeft = cellOffsetLeft + $currentCell.outerWidth() - resizeIndicatorHalfWidth;
            }

            $activeColumn = $currentCell.closest('table').find('col').eq(startColumnIndex);

            // Reduce Cyclomatic Complexity
            function updateIndicator() {
                if (Math.abs(previousResizeIndicatorLeft - resizeIndicatorLeft) <= 1) {
                    if (isShowingResizableIndicator) {
                        if (Math.abs(event.pageX - resizeIndicatorLeft - resizeIndicatorHalfWidth) <= minSizeToShowResizeIndicator) {
                            // Do nothing because mouse is near the indicator which is being showed
                            return;
                        } else {
                            removeIndicator();
                        }
                    } else {
                        if (Math.abs(event.pageX - resizeIndicatorLeft - resizeIndicatorHalfWidth) <= minSizeToShowResizeIndicator) {
                            showIndicator(resizeIndicatorLeft);
                        } else {
                            // Do nothing because mouse isn't near the indicator which isn't being showed
                            return;
                        }
                    }
                } else {
                    if (Math.abs(event.pageX - resizeIndicatorLeft - resizeIndicatorHalfWidth) <= minSizeToShowResizeIndicator) {
                        showIndicator(resizeIndicatorLeft);
                    } else {
                        removeIndicator();
                    }
                }
            }

            updateIndicator();

            previousResizeIndicatorLeft = resizeIndicatorLeft;

            if (isFixed($table)) {
                addWidthHolder();
            }
        });

        function mouseDownHandler(event) {

            /**
             * indicator has CSS "pointer-events: none;" which prevent any event happens on it
             * this means table can listen to mousedown event
             */
            if (!$activeColumn || !isShowingResizableIndicator) {
                return;
            }

            // mouse was released within 100ms, probably just a click to focus and not drag, return to prevent accidentally switch mode here
            //if (isFluid($table) && !pressed) {
            //    return;
            //}

            // CONFDEV-37226 save table mode before resizing
            if (isFixed($table)) {
                preResizeTableMode = 'fixed';
            } else if (isRelative($table)) {
                preResizeTableMode = 'relative';
            } else {
                preResizeTableMode = 'fluid';
            }

            pressed = true;

            calculateColumnsWidth($table);
            $table.updateTableModeInToolbar();

            if (AJS.DarkFeatures.isEnabled('confluence.table.resizable.relative.keep.width')) {
                if (!$activeColumn.next().length) {
                    $table.css({width: ''});
                }
            } else {
                $table.css({width: ''});
            }

            startX = event.pageX;

            // Fix for IE to capture mousemove outside browser window
            $table[0].setCapture && $table[0].setCapture();

            /* CONFDEV-38819 - Instead of using a class we use a data-attribute to avoid it being synchronized */
            $doc.find('body').attr('data-table-resizing', true);

            // Avoid call jQuery#width here because it will cause page scroll in page layout
            startWidth = parseInt($activeColumn.width(), 10);
            startWidthNextCol = parseInt($activeColumn.next().width(), 10);
            resizeIndicatorStartLeft = parseInt($resizeIndicator.css('left'));

            $surroundingTables = findSuroundingTables($table);

            // prevent cursor from jumping around.
            event.preventDefault();
        }

        $table.on('mousedown.table-resizable' + tableUUID, function (e) {
            mouseDownHandler(e);
            // CONFDEV-40191 this affects cell selection, need to find another solution to work around IE select issue
            // e.stopImmediatePropagation();
        });

        // need this because mouse move on $directCell couldn't detect and remove indicator
        // when we hover on the edge of the last column. Plus we don't support nested table anymore so this makes no harm
        $table.on('mouseout.table-resizable' + tableUUID, function () {
            if (!pressed) {
                removeIndicator();
            }
        });

        $doc.on('keypress.table-resizable' + tableUUID, function (event) {
            //prevent showing indicator in wrong position while typing and column width is increasing
            if (isShowingResizableIndicator) {
                removeIndicator();
            }
        });

        $doc.on('mousemove.table-resizable' + tableUUID, mouseMoveHandler);

        $doc.on('mouseup.table-resizable' + tableUUID, mouseUpHandler);

        $table.data('initialized', true);

        return this;
    };

    var convertToPixel = function ($table) {
        calculateColumnsWidth($table);
        return $table;
    };

    var convertToPercentage = function ($table) {
        calculateColumnsWidth($table, true);
        return $table;
    };

    var makeTableRelative = function ($table) {
        var containerWidth = $table.parent().width();
        var widthInPercentage = $table.width() / containerWidth * 100;
        // In case of switching from a > 100% fixed width to relative.
        // A relative table should never be bigger than 100%
        if (widthInPercentage > 100) {
            widthInPercentage = 100;
        }
        //CONFDEV-40037: backup widthInPercentage to an attr for copy/paste
        $table.css({width: widthInPercentage + '%'}).attr('data-resize-percent', widthInPercentage);
        convertToPercentage($table);
        return $table;
    };

    var removeWidthHolder = function ($table) {
        $table.parent('body').find('#' + $table.data('uuid') + '-holder').remove();
        return $table;
    };

    var isRelative = function ($table) {
        return $table.hasClass('relative-table');
    };

    var isFixed = function ($table) {
        return $table.hasClass('fixed-table');
    };

    var isFluid = function ($table) {
        return !isRelative($table) && !isFixed($table);
    };

    /*** Exported functions ***/

    var removeTableResizable = function (options) {
        var defaultOption = {$doc: $(document)};
        options = $.extend(defaultOption, options || {});
        var $doc = options.$doc;
        var $table = this;
        var tableUUID = $table.data('uuid');

        $doc.find('#resize-indicator').remove();
        $table.off('mousemove.table-resizable' + tableUUID);
        $table.off('mouseout.table-resizable' + tableUUID);
        $table.off('mousedown.table-resizable' + tableUUID);
        $doc.off('keypress.table-resizable' + tableUUID);
        $doc.off('mousemove.table-resizable' + tableUUID);
        $doc.off('mouseup.table-resizable' + tableUUID);

        $table.data('initialized', false);

        return this;
    };

    var toggleFluidColumnWidth = function () {
        removeWidthHolder($(this)).removeClass('relative-table fixed-table').removeAttr('style').find('>colgroup').remove();
        return this;
    };

    var toggleFixedColumnWidth = function () {
        var $table = $(this);
        removeWidthHolder($table);
        convertToPixel($table).css('width', '').removeClass('relative-table').addClass('fixed-table');
        return this;
    };

    var updateTableModeInToolbar = function () {
        var TinyMCELang = require('confluence-editor/i18n/translations.i18n');

        // don't enable the switch control for nested table
        if (this.parent().closest('table.confluenceTable').length) {
            $('#table-mode-picker .dropdown-text').text(TinyMCELang.table.responsive);
            $('#table-mode-picker .aui-dd-parent').addClass('disabled');
            return;
        } else {
            $('#table-mode-picker .aui-dd-parent').removeClass('disabled');
        }

        if (isFixed(this)) {
            $('#table-mode-picker .dropdown-text').text(TinyMCELang.table.fixed_width);
        } else {
            $('#table-mode-picker .dropdown-text').text(TinyMCELang.table.responsive);
        }
    };

    //CONFDEV-40037: Copy and paste table doesn't keep the resize values
    var handlePasteOnWebkit = function (e, pl, o) {
        if (!o.content) {
            return;
        }
        var $container = $("<div/>").append(o.content);
        var restoreStyleFromDataAttr = function ($el) {
            if ($el.data("resize-percent")) {
                //after resizing, data-mce-style contains old value, data-resize-percent has updated value
                $el.css({width: $el.data("resize-percent") + '%'});
            } else {
                //after saving/pasting, only data-mce-style remain on element <table>,<col>
                $el.attr("style", $el.data("mce-style"));
            }
            return $el;
        };

        $container.find("table.confluenceTable.relative-table, table.confluenceTable.relative-table > colgroup > col").each(function () {
            restoreStyleFromDataAttr($(this));
        });
        o.content = $container.html();
    };

    var initTableResize = function (e, data) {
        var $doc = $(data.editor.getWin().document);
        var ed = data.editor;

        var removeAllTableResizable = function () {
            $doc.find('table.confluenceTable').each(function () {
                $(this).removeTableResizable({$doc: $doc});
            });
        };

        ed.onChange.add(function () {
            var node = ed.selection.getNode();
            var $node = $(node);
            // if a nested table is inserted then .closest will return the nested table itself but we don't want to
            // enable resizing for it, so go up 1 level here.
            var $table = $node.parent().closest('table.confluenceTable').not('table.confluenceTable table.confluenceTable');
            if ($table.is('.confluenceTable')) {
                $table.removeTableResizable({$doc: $doc}).tableResizable({$doc: $doc, editor: ed, force: true});
            }
        });

        AJS.bind('confluence.editor.on.save', function () {
            removeAllTableResizable();

            $doc.find('#resize-indicator').remove();
            $doc.find('.resize-width-holder').remove();

            //CONFDEV-39481
            $(ed.getBody()).removeAttr('data-table-resizing');
        });

        $doc.on('mousemove', 'table.confluenceTable', function() {
            var $table = $(this);
            if ($table.parents('table.confluenceTable').length) { //nested table
                return;
            }
            if (!$table.data('initialized')) {
                $table.tableResizable({$doc: $doc, editor: ed});
            }
        });

        /**
         * CONFDEV-40037: Copy and paste table doesn't keep the resize values because:
         * on webkit, <table> width is auto converted to px, <col> width is auto set to 0px
         * only happens for relative-table
         */
        if (tinymce.isWebKit) {
            $(document).bind('prePaste', handlePasteOnWebkit);
        }

        if (tinymce.isIE) {
            $('<style type="text/css"></style>')
                    .html('.confluenceTable td, .confluenceTable th {overflow: hidden !important;}'
                            + '.confluenceTable .content-wrapper {overflow-x : visible !important}')
                    .appendTo($doc.find('head'));
        }

        return this;
    };

    /*** End exported functions ***/

    return {
        createJQueryPlugin: function () {
            $.fn.tableResizable = tableResizable;
            $.fn.removeTableResizable = removeTableResizable;
            $.fn.toggleFluidColumnWidth = toggleFluidColumnWidth;
            $.fn.toggleFixedColumnWidth = toggleFixedColumnWidth;
            $.fn.updateTableModeInToolbar = updateTableModeInToolbar;
        },
        initTableResize: initTableResize
    };
});

require('confluence/module-exporter').safeRequire('confluence-editor/tinymce3/plugins/table/table-resizable', function (TableResizable) {
    var AJS = require('ajs');
    if (AJS.DarkFeatures.isEnabled('confluence.table.resizable')) {
        TableResizable.createJQueryPlugin();
        AJS.bind("init.rte", TableResizable.initTableResize);
    }
});
