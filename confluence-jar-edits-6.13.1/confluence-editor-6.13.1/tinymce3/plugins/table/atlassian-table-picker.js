/**
 * Table picker for inserting tables
 *
 * @module confluence-editor/tinymce3/plugins/table/atlassian-table-picker
 */
define('confluence-editor/tinymce3/plugins/table/atlassian-table-picker', [
    'ajs',
    'tinymce',
    'jquery',
    'document'
], function(
    AJS,
    tinymce,
    $,
    document
) {
    "use strict";

    var _internal = {};

    // Static data
    var doc;
    var body;
    var backdrop;
    var button;
    var buttonLink;
    var ddParent;
    var container;
    var pickerBox;
    var pickerCell;
    var pickerHeading;
    var pickerSelectedCell;
    var pickerSelectedHeading;
    var desc;
    var DEFAULT_WIDTH = 4;
    var DEFAULT_HEIGHT = 4;
    var MAX_WIDTH = 15;
    var MAX_HEIGHT = 20;
    var TABLE_PICKER_WIDTH = 25;
    var TABLE_PICKER_HEIGHT = 17;
    var DESC_HEIGHT = 20;
    // Dead zone where grow / shrink cannot occur
    var RESIZE_DEAD_ZONE = 0;

    // State
    var pickerWidth;
    var pickerHeight;
    var highlightWidth;
    var highlightHeight;
    var includeHeading;
    var disabled = false;

    function bindToControl(editor) {
        AJS.debugEnabled() && AJS.debug('Table Picker - bind to control');

        doc = $(document);
        body = doc.find('body');
        button = $('#insert-table-dropdown');
        buttonLink = $('#rte-button-insert-table');
        ddParent = button.find('.aui-dd-parent');
        container = $('#table-picker-container');
        pickerBox = container.find('.table-picker-box');
        pickerCell = container.find('.picker-cell');
        pickerHeading = container.find('.picker-heading');
        pickerSelectedCell = container.find('.picker-selected-cell');
        pickerSelectedHeading = container.find('.picker-selected-heading');
        desc = pickerBox.find('.desc');

        // Invisible backdrop behind the table picker for picking up clicks to close the picker
        backdrop = $('<div></div>')
                        .attr('id', 'table-picker-backdrop')
                        .addClass('hidden')
                        .appendTo(button);

        buttonLink.click(function(e) {
            e.preventDefault();
            if (!disabled) {
                AJS.Rte.BookmarkManager.storeBookmark();
                showPopup();
            }
        });

        backdrop.click(exitClickListener);
        pickerSelectedCell.click(insertTable);
        pickerSelectedHeading.click(insertTable);
    }

    function calculatePopupOffset() {
        // Calculate the offset for the table
        // selector menu.
        container.css({
            top: $('#insert-table-dropdown').outerHeight(true)
        });

        // NOOP this function for future calls.
        calculatePopupOffset = function() {};
    }

    function showPopup() {
        var i;
        var list;
        var desc;
        var buttonPos;

        calculatePopupOffset();
        includeHeading = true;
        setSize(1, 1);
        bindInteractions();
        backdrop.removeClass('hidden');
        container.removeClass('hidden');
        ddParent.addClass('active');
        // CONFDEV-5397 - Ensure that the main window has focus and not the editor iframe
        buttonLink.focus();
    }

    function removePopup() {
        if(!container.hasClass('hidden')) {
            unbindInteractions();
            container.addClass('hidden');
            backdrop.addClass('hidden');
            ddParent.removeClass('active');
        }
    }

    function bindInteractions() {
        var edDoc = $(AJS.Rte.getEditor().getDoc());
        doc.bind('mousemove.atlassian-table-picker', mouseMove);
        doc.bind('keydown.atlassian-table-picker', keylistener);
        doc.bind('keyup.atlassian-table-picker', keylistener);
        edDoc.bind('keydown.atlassian-table-picker', keylistener);
        edDoc.bind('keyup.atlassian-table-picker', keylistener);
    }

    function unbindInteractions() {
        var edDoc = $(AJS.Rte.getEditor().getDoc());
        doc.unbind('.atlassian-table-picker');
        edDoc.unbind('.atlassian-table-picker');
    }

    function disable() {
        disabled = true;
        button.addClass("disabled");
    }

    function enable() {
        disabled = false;
        button.removeClass("disabled");
    }

    function setSize(width, height) {
        AJS.debugEnabled() && AJS.debug('setSize(' + [width,height] + ')');

        if(width == highlightWidth && height == highlightHeight) {
            return;
        }

        // Restrict size to 1..MAX_WIDTH and 1..MAX_HEIGHT
        width = Math.max(1, Math.min(MAX_WIDTH, width));
        height = Math.max(1, Math.min(MAX_HEIGHT, height));

        pickerWidth = Math.max(DEFAULT_WIDTH, width);
        pickerHeight = Math.max(DEFAULT_HEIGHT, height);
        highlightWidth = width;
        highlightHeight = height;

        pickerBox.width(pickerWidth*TABLE_PICKER_WIDTH + 1);
        pickerBox.height(pickerHeight*TABLE_PICKER_HEIGHT + DESC_HEIGHT);

        setPickerSize(pickerCell, pickerWidth, pickerHeight);
        setPickerSize(pickerSelectedCell, highlightWidth, highlightHeight);
        setPickerSize(pickerHeading, pickerWidth, 1);
        setPickerSize(pickerSelectedHeading, highlightWidth, 1);
        refreshHeading();

        desc.text(highlightWidth + ' x ' + highlightHeight);
    }

    function refreshHeading() {
        pickerHeading.toggleClass('hidden', !includeHeading);
        pickerSelectedHeading.toggleClass('hidden', !includeHeading);
    }

    function setPickerSize(picker, width, height) {
        picker.width(TABLE_PICKER_WIDTH * width + 1);
        picker.height(TABLE_PICKER_HEIGHT * height + 1);
    }

    function mouseMove(e) {
        var spPos = pickerCell.offset();
        var spTop = spPos.top - doc.scrollTop();
        var spLeft = spPos.left - doc.scrollLeft();
        var spBottomGrow = spTop + pickerCell.outerHeight(true) + RESIZE_DEAD_ZONE;
        var spBottomShrink = spBottomGrow - TABLE_PICKER_HEIGHT - RESIZE_DEAD_ZONE; // Allow for paddin
        var spRightGrow = spLeft + pickerCell.outerWidth(true) + RESIZE_DEAD_ZONE;
        var spRightShrink = spRightGrow - TABLE_PICKER_WIDTH - RESIZE_DEAD_ZONE; // Allow for paddin
        var mouseY = e.clientY;
        var mouseX = e.clientX;
        var delta;
        var pickerDelta;
        var newWidth = pickerWidth;
        var newHeight = pickerHeight;

        AJS.debugEnabled() && AJS.debug('[mouseX,spLeft,spRightShrink,spRightGrow][mouseY,spTop,spBottomShrink,spBottomGrow] = ' + [mouseX,spLeft,spRightShrink,spRightGrow] + '/' + [mouseY,spTop,spBottomShrink,spBottomGrow]);

        // resize x
        if(mouseX > spRightGrow) {
            delta = mouseX - spRightGrow;
            pickerDelta = ~~((delta / TABLE_PICKER_WIDTH) + 1);
            newWidth += pickerDelta;
            AJS.debugEnabled() && AJS.debug('grow: xdelta = ' + pickerDelta);
        } else if (mouseX < spRightShrink) {
            delta = mouseX - spRightShrink;
            pickerDelta = ~~((delta / TABLE_PICKER_WIDTH) - 1);
            newWidth += pickerDelta;
            AJS.debugEnabled() && AJS.debug('shrink: xdelta = ' + pickerDelta);
        }
        // resize y
        if(mouseY > spBottomGrow) {
            delta = mouseY - spBottomGrow;
            pickerDelta = ~~((delta / TABLE_PICKER_HEIGHT) + 1);
            newHeight += pickerDelta;
            AJS.debugEnabled() && AJS.debug('grow: ydelta = ' + pickerDelta);
        } else if (mouseY < spBottomShrink) {
            delta = mouseY - spBottomShrink;
            pickerDelta = ~~((delta / TABLE_PICKER_HEIGHT) - 1);
            newHeight += pickerDelta;
            AJS.debugEnabled() && AJS.debug('shrink: ydelta = ' + pickerDelta);
        }

        setSize(newWidth, newHeight);
    }

    function enableHeading(enable) {
        AJS.debugEnabled() && AJS.debug('enableHeading(' + enable + ')');
        if(enable != includeHeading) {
            includeHeading = enable;
            refreshHeading();
        }
    }


    function calcWidthHeight(e) {
        var left = ~~(e.offsetX || e.originalEvent.layerX);
        var top = ~~(e.offsetY || e.originalEvent.layerY);
        var width = (~~(left / TABLE_PICKER_WIDTH)) + 1;
        var height = (~~(top / TABLE_PICKER_HEIGHT)) + 1;
        if(width < 1 || width > MAX_WIDTH || height <  1 || height > MAX_HEIGHT) {
            return null; // Outisde of range - ignore
        }
        return {
            width: width,
            height: height
        };
    }

    function insertTable(e) {
        var size = calcWidthHeight(e);
        e.preventDefault();
        AJS.debug('insertTable: size = ' + (size && [size.width,size.height]));
        if(size) {
            // If on cell insert table and remove popup otherwise ignore
            removePopup();
            shamefulInsertTable(size.width, size.height, includeHeading);
        }
    }

    // Table plugin exposed an insertTable function that takes a form - hence the shameful function name. (CONFDEV-7141)
    function shamefulInsertTable(width, height, includeHeading) {
        var existingForm;
        var form;
        var formContainer;
        AJS.debugEnabled() && AJS.debug('shamefulInsertTable(' + width + ',' + height + ',' + includeHeading + ')');
        // "API" is a form - WTF!
        existingForm = $('#tinymce-table-form');
        if(!existingForm.length) {
            // No existing form, create a temporary one
            form = AJS.renderTemplate("tableForm", height, width);
            formContainer = $('<div></div>').addClass('hidden');
            formContainer.append(form);
            body.append(formContainer);
        } else {
            existingForm.find('input[name="rows"]').val(height);
            existingForm.find('input[name="cols"]').val(width);
        }
        $('#table-heading-checkbox').prop('checked', includeHeading);
        AJS.Rte.BookmarkManager.restoreBookmark();
        tinymce.activeEditor.undoManager.beforeChange();
        tinymce.activeEditor.plugins.table.insertTable();
        formContainer && formContainer.remove();
    }


    function keylistener(e) {
        AJS.debugEnabled() && AJS.debug('key: ' + e.charCode + '/' + e.keyCode + '/' + e.shiftKey);
        AJS.debug('key: ' + e.charCode + '/' + e.keyCode + '/' + e.shiftKey);
        if($.browser.msie) {
            // This is still required for IE9
            if(e.keyCode === 16) {
                // modifier only
                enableHeading(!e.shiftKey);
            }
            if(e.keyCode === 27) {
                // escape
                removePopup();
            }
        } else {
            if(e.charCode === 0) {
                // modifier only
                enableHeading(!e.shiftKey);
            }
            if(e.keyCode === 27 && e.charCode === 0) {
                // escape
                removePopup();
            }
        }
    }

    function exitClickListener(e) {
        removePopup();
    }

    // Exposed for testing purposes.
    _internal.insertTable = insertTable;

    return {
        bindToControl: bindToControl,
        disable: disable,
        enable: enable,
        close: removePopup,
        _internal: _internal // Exposed for testing purposes
    };
});


require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/tinymce3/plugins/table/atlassian-table-picker', 'AJS.Rte.TablePicker');