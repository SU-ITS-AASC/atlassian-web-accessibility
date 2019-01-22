/**
 * @module confluence-editor/tinymce3/plugins/draggable/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/draggable/editor_plugin_src', [
    'jquery',
    'ajs'
], function ($,
             AJS) {
    "use strict";

    if ($.browser.msie && $.browser.version <= 8) {
        return; // Don't support IE8 or less;
    }

    var MOVE_SELECTOR = 'img.confluence-embedded-image,img.editor-inline-macro,table.wysiwyg-macro';//,td.draggable-table,td.draggable-column,td.draggable-row';
    var MOVE_INLINE_FILTER = 'img';
    var MIN_MOVEMENT = 10; // pixels

    // -------------------------

    var editor;
    var editorWin;
    var editorDoc;
    var editorBody;
    var containerWin;
    var adjustTop;
    var adjustLeft;
    var initialPageX;
    var initialPageY;
    var dragTarget;
    var dragOrigStyle;
    var firstMove;
    var scroller;
    var cm;

    // -------------------------

    var SCROLL_RATE = [
        800, 800, 400, 400, 400,
        300, 300, 300, 300, 300,
        300, 300, 300, 300, 300,
        200, 200, 200, 200, 200,
        200, 200, 200, 200, 200,
        200, 200, 200, 200, 200,
        100, 100, 100, 100, 100,
        100, 100, 100, 100, 100,
        100, 100, 100, 100, 100
    ];

    var synchronyId = 'confluence.draggable-plugin';

    function Scroller(scrollTarget) {

        var currentRate = 0;

        return {
            scrollUp: function (rate) {
                var duration;

                if (currentRate === -rate) {
                    return; // no rate change
                }

                currentRate = -rate;
                duration = (scrollTarget.scrollTop() / rate) * 1000;

                scrollTarget.stop(false, false);
                scrollTarget.animate({
                    scrollTop: 0
                }, {
                    duration: duration
                });
            },

            scrollDown: function (rate) {
                var duration;
                var height;

                if (currentRate === rate) {
                    return; // no rate change
                }

                currentRate = rate;
                height = scrollTarget[0].scrollHeight; // TODO cache?? // will adding a cursor change this ??
                duration = ((height - scrollTarget.scrollTop()) / rate) * 1000;

                scrollTarget.stop(false, false);
                scrollTarget.animate({
                    scrollTop: height
                }, {
                    duration: duration
                });
            },

            cancelScrolling: function () {
                currentRate = 0;

                scrollTarget.stop(true, false);
            },

            scrollHeight: function () {
                return scrollTarget[0].scrollHeight;
            }
        };
    }

    var PAGE_LAYOUT_TARGET = 'div.innerCell,div.cell';
    var SIMPLE_LAYOUT_TARGET = 'body';
    var VALID_TARGET = 'p,h1,h2,h3,h4,h5,h6,blockquote,li,td,th,img';
    var NONPREFERRED_TARGET = 'li,td,th';
    var PREFERRED_TARGET = 'p,h1,h2,h3,h4,h5,h6,blockquote';
    var INLINE_TARGET = 'li,td,th';

    function CursorManager(dragTarget) {

        // Should not change for the life of the CursorManager
        var hasPageLayout = !!editorBody.children('.contentLayout,.contentLayout2').length;

        function getIndicator() {
            return editorDoc.find('#move-indicator');
        }

        function hasIndicator() {
            return getIndicator().length > 0;
        }

        function isIndicator(el) {
            return el.attr('id') === 'move-indicator';
        }

        function createIndicator() {
            return $('<span id="move-indicator">|</span>');
        }

        function positionCursorNear(clientX, clientY) {
            var target;
            var before;
            target = findValidTarget(clientX, clientY);
            if (target) {
                positionIndicator(target.target, target.before);
            }
        }

        function findValidTarget(clientX, clientY) {
            var target = $(editorDoc[0].elementFromPoint(clientX, clientY));
            var before = true;

            if (isValidTarget(target)) {
                return {
                    target: target,
                    before: isBeforeTarget(target, clientX, clientY)
                };
            }

            if (isLayoutTarget(target)) {
                target = adjustLayoutTarget(target);
                if (isAtTopOfLayout(target, clientY)) {
                    // position indicator as start of layout
                    target = target.children().first();
                } else if (isAtBottomOfLayout(target, clientY)) {
                    // position indicator at end of layout
                    target = target.children().last();
                    before = false;
                } else if (isIndicatorInLayout(target)) {
                    // no need to move a indicator (i.e. just moved into an elements margin, falling through to it's layout cell)
                    return null;
                } else {
                    // find somewhere to put a cursor in the layout
                    target = findDefaultTarget(target);
                    before = false;
                }
                return {
                    target: target,
                    before: before
                };
            }
            return null;
        }

        function isValidTarget(target) {
            if (target.is(VALID_TARGET) && !isIndicator(target)) {
                // additional special checks
                if (target.is('td.wysiwyg-macro-body')) {
                    if (target.closest('table').attr('data-macro-body-type') === 'PLAIN_TEXT') {
                        // In plain text macro body - don't allow.
                        return false;
                    }
                }
                if (target.is('img') && !dragTarget.is('img')) {
                    // only allow images to be places inline with other images
                    return false;
                }
                return true;
            }
            return false;
        }

        function isLayoutTarget(target) {
            if (hasPageLayout) {
                return target.is(PAGE_LAYOUT_TARGET);
            }

            return target.is(SIMPLE_LAYOUT_TARGET);
        }

        function adjustLayoutTarget(target) {
            if (target.is('div.cell')) {
                return target.children('div.innerCell').first();
            }
            return target;
        }

        function adjustToPreferredTarget(target) {
            if (target.is(NONPREFERRED_TARGET)) {
                // attempt to move into a block element
                var possibleTarget = target.children().first();
                if (possibleTarget.is(PREFERRED_TARGET)) {
                    target = possibleTarget;
                }
            }
            return target;
        }

        function isAtTopOfLayout(layout, clientY) {
            return getDeltaFromTopOfTarget(layout.children().first(), clientY) < 0;
        }

        function isAtBottomOfLayout(layout, clientY) {
            return getDeltaFromBottomOfTarget(layout.children().last(), clientY) > 0;
        }

        function isIndicatorInLayout(layout) {
            return hasIndicator() && (getIndicator().parent(layout).length > 0);
        }

        function findDefaultTarget(layout) {
            var defaultTarget = dragTarget.parent(VALID_TARGET);

            // Not found a thing. Find the last valid target anywhere (since this is most likely due to the cursor below the last layout element).
            if (!defaultTarget.length) {
                defaultTarget = layout.find(VALID_TARGET).last();
            }

            if (!defaultTarget.length) {
                defaultTarget = editorBody.find(VALID_TARGET).last();
            }

            return defaultTarget;
        }

        function positionIndicator(target, before) {
            if (isIndicator(target)) {
                return;
            }

            var indicator = getIndicator();

            if (target.is(NONPREFERRED_TARGET) && target.find(indicator).length) {
                // indicator is in a non-prefered container and just bubbled up (i.e. don't move)
                return;
            }

            if (!indicator.length) {
                indicator = createIndicator();
            } else {
                indicator.detach();
            }

            target = adjustToPreferredTarget(target);

            if (!target.is('img') && AJS.Rte.Cursor.isTextContainerEmpty(target[0])) {
                // target is empty, always put cursor at start of element to prevent "jumping"
                target.prepend(indicator);
            } else if (target.is(INLINE_TARGET)) {
                if (before) {
                    target.prepend(indicator);
                } else {
                    target.append(indicator);
                }
            } else {
                if (before) {
                    target.before(indicator);
                } else {
                    target.after(indicator);
                }
            }
            // Include this if we can find a away to avoid it if a user wants to scroll down while
            // still hovering over the same page layout cell
            //AJS.Rte.showElement(target);
        }

        function isBeforeTarget(target, clientX, clientY) {
            if (target.is('img')) {
                // left / right check for images
                var relX = getDeltaFromLeftOfTarget(target, clientX);
                var targetWidth = target.width();
                return relX < (targetWidth / 2);
            }
            var relY = getDeltaFromTopOfTarget(target, clientY);
            var targetHeight = target.height();
            return relY < (targetHeight / 2);
        }

        function getDeltaFromTopOfTarget(target, clientY) {
            var pos = target.offset();
            var absY = clientY + editorDoc.scrollTop();
            var relYTop = absY - pos.top;
            return relYTop;
        }

        function getDeltaFromLeftOfTarget(target, clientX) {
            var pos = target.offset();
            var absX = clientX + editorDoc.scrollLeft();
            var relXLeft = absX - pos.left;
            return relXLeft;
        }

        function getDeltaFromBottomOfTarget(target, clientY) {
            var relYTop = getDeltaFromTopOfTarget(target, clientY);
            var targetHeight = target.height();
            var relYBottom = relYTop - targetHeight;
            return relYBottom;
        }

        function replaceIndicatorWith(el) {
            var indicator = getIndicator();
            if (indicator.length) {
                if (el.is(MOVE_INLINE_FILTER) && isLayoutTarget(indicator.parent())) {
                    // cursor is not in a block element, and el is not a block element - wrap
                    el = $('<p></p>').append(el);
                }
                indicator.replaceWith(el);
                /**
                 * CONF-45096:
                 * check for block elements because <p> (se.element) can not contain a block element
                 */
                if (editor.dom.isBlock(el[0]) && el.parent().is('p')) {
                    el.unwrap();
                }
                AJS.Rte.showElement(el);
                editor.selection.select(el[0]);
                editor.selection.collapse(true);
            } else {
                AJS.debug('No cursor - abort drop');
                editor.undoManager.undo();
            }
            AJS.Rte.Cursor.fixCursorTargets(AJS.Rte.getEditor().getBody());
        }

        function destroyCursor() {
            var indicator = getIndicator();
            if (indicator.length) {
                indicator.remove();
                AJS.Rte.Cursor.fixCursorTargets(AJS.Rte.getEditor().getBody());
            }
        }

        return {
            positionNear: positionCursorNear,
            replaceWith: replaceIndicatorWith,
            destroy: destroyCursor
        };
    }

    function adjustDragTarget(clicked) {
        dragOrigStyle = clicked.attr('style') || '';
        return clicked;
    }

    function startMove(e) {
        if (e.which !== 1) {
            return; // left click only
        }

        if (e.target !== e.currentTarget) {
            return; // nested draggable objects - ignore
        }

        if (dragTarget) {
            // dragging is still active (can occur if moves mouse outside of iframe and release button). Click now will end the drag.
            endMove(e);
            return;
        }

        dragTarget = $(e.target);

        editor.selection.select(e.target);
        e.preventDefault();

        editorDoc.bind({
            "mousemove.moveable-zone": showMove,
            "mouseup.moveable-zone": endMove,
            "keydown.moveable-zone": escapeListener,
            "mouseover.moveable-zone": removeTableSelection
        });
        var offset = dragTarget.offset();
        initialPageX = e.pageX;
        initialPageY = e.pageY;
        adjustTop = offset.top - initialPageY;
        adjustLeft = offset.left - initialPageX;
        firstMove = true;
        dragTarget = adjustDragTarget(dragTarget);
    }

    function escapeListener(e) {
        if (e.keyCode === 27) {
            cancelMove(e);
        }
    }

    function removeTableSelection() {
        editorDoc.find('.mceSelected').removeClass('mceSelected');
    }

    function notMovedEnough(e) {
        var deltaX = Math.abs(initialPageX - e.pageX);
        var deltaY = Math.abs(initialPageY - e.pageY);
        return deltaX < MIN_MOVEMENT && deltaY < MIN_MOVEMENT;
    }

    function showMove(e) {
        var top;
        var left;
        if (firstMove) {
            if (notMovedEnough(e)) {
                return;
            }

            AJS.Rte.BookmarkManager.storeBookmark();

            editor.undoManager.beforeChange();
            editor.undoManager.typing = true; // treat draggable as "typing" from an undo perspective
            editor.undoManager.add();
            AJS.trigger('synchrony.stop', {id: synchronyId});

            clearSelection();
            dragTarget.css({
                position: 'absolute',
                width: dragTarget.css('width'), // grab current width so it's the same when dragged (e.g. macro's in a table)
                'max-width': '50%'  // For large images
            });
            // HACK - to make sure property panel is removed
            AJS.Confluence.PropertyPanel.current && AJS.Confluence.PropertyPanel.destroy();
            // Detach, and make sure all cursor targets are valid (e.g. we removed something between 2 macros)
            dragTarget.detach();
            AJS.Rte.Cursor.fixCursorTargets(AJS.Rte.getEditor().getBody());
            editorBody.append(dragTarget);

            cm = CursorManager(dragTarget);

            firstMove = false;
        }

        e.preventDefault();

        dragTarget.hide(); // hide so we can find the target underneath the dragTarget

        scrollIfRequired(e.clientX, e.clientY);
        cm.positionNear(e.clientX, e.clientY);

        top = Math.min(e.pageY + adjustTop, scroller.scrollHeight() - dragTarget.outerHeight());
        left = e.pageX + adjustLeft;
        dragTarget.css({
            top: top,
            left: left,
            opacity: 0.5
        });

        dragTarget.show();
    }

    function clearSelection() {
        // While this call is successful in IE9, the cursor still remains visible and sometimes in the wrong spot
        // after making, for example, an image floating. IE9 is just a lost cause here.
        var selection = editor.selection.getSel();
        selection && selection.removeAllRanges && selection.removeAllRanges();
    }

    function scrollIfRequired(clientX, clientY) {
        var viewPortHeight;
        var clientYFromBottom;
        var scrollZoneHeight = SCROLL_RATE.length;
        clientY = Math.max(clientY, 0);
        if (clientY < scrollZoneHeight) {
            scroller.scrollUp(SCROLL_RATE[clientY]);
            return;
        }
        viewPortHeight = editorWin.height(); // TODO is this expensive - should we cache it??
        clientYFromBottom = Math.max(0, viewPortHeight - clientY);
        if (clientYFromBottom < scrollZoneHeight) {
            scroller.scrollDown(SCROLL_RATE[clientYFromBottom]);
            return;
        }

        // Outside scroll range, make sure we stop any existing scrolling.
        scroller.cancelScrolling();
    }

    function endMove(e) {
        editorDoc.unbind('.moveable-zone');
        scroller.cancelScrolling();
        if (firstMove) {
            // no movement - was a click
            dragTarget = null;
            return;
        }
        e.preventDefault();

        dragTarget.detach();
        dragTarget.attr('style', dragOrigStyle);
        cm.replaceWith(dragTarget);
        cm.destroy();
        dragTarget = null;
        cm = null;

        removeTableSelection();

        editor.undoManager.add();
        AJS.trigger('synchrony.start', {id: synchronyId});
    }

    function cancelMove(e) {
        scroller.cancelScrolling();
        editorDoc.unbind('.moveable-zone');
        editor.undoManager.undo();
        editor.selection.select(dragTarget[0]);
        editor.selection.collapse(false);
        dragTarget = null;
    }

    function bindMove() {
        editorDoc.delegate(MOVE_SELECTOR, {
            mousedown: startMove
        });
    }

    function ignore(e) {
        e.preventDefault();
    }

    return {
        init: function (ed, url) {
            editor = ed;
            ed.onInit.add(function (e, l) {
                var scrollElement;
                editorWin = $(ed.getWin());
                editorDoc = $(ed.getDoc());
                editorBody = $(ed.getBody());
                containerWin = $(editorWin[0].parent);
                if ($.browser.webkit) {
                    scrollElement = editorBody;
                } else {
                    scrollElement = editorDoc.find('html');
                }
                scroller = Scroller(scrollElement);
                bindMove();
                // TODO enable when stable:
                // bindTableDecorators();
            });
        },

        getInfo: function () {
            return {
                longname: 'Draggable objects (images, tables, placeholders) around the document via drag and drop',
                author: 'Atlassian',
                authorurl: 'http://www.atlassian.com',
                version: "1.0"
            };
        }
    };
});

require('confluence/module-exporter')
    .safeRequire('confluence-editor/tinymce3/plugins/draggable/editor_plugin_src', function (DraggablePlugin) {
        var tinymce = require('tinymce');

        tinymce.create('tinymce.plugins.draggable', DraggablePlugin);

        tinymce.PluginManager.add('draggable', tinymce.plugins.draggable);
    });

/** WIP Code
 // TODO Tables: fix copy and paste - need to remove decoration before copy
 // TODO Tables: be colspan / rowspan aware.

 function adjustDragTarget(clicked) {
     dragOrigStyle = '';
     if(clicked.hasClass('draggable-table')) {
         // clicked in cell - we want to move the whole table
         AJS.log('clicked in cell - we want to move the whole table');
         var table = clicked.closest('table');
         dragOrigStyle = table.attr('style');
         return table;
     } else if(clicked.hasClass('draggable-row')) {
         // extract row
         var detachedTable = $('<table class="confluenceTable"><tbody></tbody></table>');
         var row = clicked.closest('tr').detach();
         row.children('td:eq(0)').remove(); // remove decoration
         detachedTable.find('tbody').append(row);
         // First mouse move will position this correct. Just render offscreen and absolute to avoid glitching / reflow
         detachedTable.css({
             position: 'absolute',
             // left: -9999,
             // top: 0
         });
         editorBody.append(detachedTable);
         return detachedTable;
     } else if(clicked.hasClass('draggable-column')) {
         var detachedTable = $('<table class="confluenceTable"></table>');
         var tbody = $('<tbody></tbody>');
         var table = clicked.closest('table');
         var rows = table.children('tbody').children('tr').slice(1);
         var colNum = clicked.index() + 1;
         AJS.log('colNum: ' + colNum);
         rows.each(function() {
             var row = $(this);
             var newRow = $('<tr></tr>');
             var cell = row.children(':nth-col(' + colNum + ')');
             AJS.log('cell');
             AJS.log(cell);
             cell.detach();
             newRow.append(cell);
             tbody.append(newRow);
         });
         detachedTable.append(tbody);
         detachedTable.css({
             position: 'absolute',
             // left: -9999,
             // top: 0
         });
         editorBody.append(detachedTable);
         AJS.log('detachedTable:');
         AJS.log(detachedTable);
         return detachedTable;
     }
     dragOrigStyle = clicked.attr('style') || '';
     return clicked;
 }

 function repeat(s, num) {
     return new Array(num + 1).join(s);
 }


 function addTableDecorators() {
     AJS.log('adding table decorators');
     var tables = editorDoc.find('table.confluenceTable:not(.draggable)');
     tables.each(function() {
         var table = $(this);
         var sections = table.children('thead,tbody,tfoot');
         var rows = sections.children('tr');
         var numCol = rows.eq(0).children().length;
         // add row at the top.
         var grabCell = '<td></td>';
         var topRow = $('<tr class="draggable" contentEditable="false">' + repeat(grabCell, numCol + 1) + '</tr>');
         var topRowCells = topRow.find('td');
         topRowCells.eq(0).addClass('draggable-table');
         topRowCells.slice(1).addClass('draggable-column');
         sections.eq(0).prepend(topRow);
         // add column to left
         rows.prepend('<td class="draggable-row" contentEditable="false"></td>');
         table.addClass('draggable');
     })
 }

 function removeTableDecorators() {
     AJS.log('removing table decorators');
     var tables = editorDoc.find('table.draggable');
     tables.removeClass('draggable');
     tables.find('tr.draggable').remove(); // deals with draggable-table, draggable-column td's
     tables.find('td.draggable-row').remove();
 }

 function bindTableDecorators() {
     editor.onBeforeGetContent.add(function(e, o) {
         // Remove decorators - so they're not saved/etc.
         removeTableDecorators();
     });
     editor.onGetContent.add(function(e, o) {
         // Restore decorators
         addTableDecorators();
     });
     editor.onSetContent.add(function(e, o) {
         // Add decorators
         addTableDecorators();
     });
     // editor.onNodeChange.add(function(e, o)) {
     //     // Add decorators
     //     addTableDecorators();
     // }
     addTableDecorators();
 }

 */
