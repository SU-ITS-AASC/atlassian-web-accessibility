/**
 * @module atlassian-tinymce/plugins/table/table
 */
define('atlassian-tinymce/plugins/table/table', [
    'ajs',
    'tinymce',
    'tinymce/popup',
    'jquery',
    'document'
], function(
    AJS,
    tinymce,
    tinyMCEPopup,
    $,
    document
) {
    "use strict";

    var utils;
    var editableSelects;

    var Table = {
        insertTable: function (action) {
            var formObj = $("#tinymce-table-form")[0]; //ATLASSIAN
            var inst = AJS.Rte.getEditor();
            var dom = inst.dom; //ATLASSIAN
            var cols = 2;
            var rows = 2;
            var border = 0;
            var cellpadding = -1;
            var cellspacing = -1;
            var align;
            var width;
            var height;
            var className = tinymce.settings.confluence_table_style;
            var caption;
            var frame;
            var rules;
            var style = "";
            var html = '';
            var capEl;
            var elm;

            elm = dom.getParent(inst.selection.getNode(), 'table');

            /**
             * Custom ATLASSIAN form fields
             */
            var heading;
            var equalWidthColumns;
            heading = formObj.elements['heading'].checked;
            equalWidthColumns = formObj.elements['equal-width-columns'].checked;

            // Get form data
            cols = formObj.elements['cols'].value;
            rows = formObj.elements['rows'].value;

            width = $("#tinymce-table-form input[name='width']").val(); //ATLASSIAN

            // Create new table
            html += '<table';

            html += makeAttrib('data-mce-new', '1');

            if (width && inst.settings.inline_styles) {
                if (style) {
                    style += '; ';
                }

                // Force px
                if (/^[0-9\.]+$/.test(width)) {
                    width += 'px';
                }

                style += 'width: ' + width;
            } else {
                html += makeAttrib('width', width);
            }

            html += makeAttrib('class', className);
            html += makeAttrib('style', style);
            html += '>';

            // ATLASSIAN
            function capitaliseFirstChar(str) {
                return str.charAt(0).toUpperCase() + str.substring(1, str.length);
            }

            for (var y = 0; y < rows; y++) {
                html += "<tr>";

                for (var x = 0; x < cols; x++) {
                    var elementName;
                    var widthDeclaration;
                    var cellClassName;
                    if (y == 0 && heading) {
                        elementName = "th";
                        cellClassName = tinymce.settings.confluence_table_heading_style;
                    } else {
                        elementName = "td";
                        cellClassName = tinymce.settings.confluence_table_cell_style;
                    }
                    if (equalWidthColumns) {
                        widthDeclaration = " width=\"" + (Math.round((100 / cols) * 100) / 100) + "%\"";
                    }

                    html += "<" + elementName + (widthDeclaration ? widthDeclaration : "") + " class=\"" + cellClassName + "\">";
                    if (!tinymce.isIE || tinymce.isIE11) {
                        html += "<br data-mce-bogus=\"1\"/>";
                    } else if (tinymce.isIE9) {
                        html += "&nbsp;"; // ATLASSIAN - CONFDEV-5592
                    }
                    html += "</" + elementName + ">";
                }

                html += "</tr>";
            }

            html += "</table>";

            // Move table
            if (inst.settings.fix_table_elements) {
                var patt = '';

                //ATLASSIAN
                //inst.focus();
                AJS.Rte.BookmarkManager.restoreBookmark();

                inst.selection.setContent('<br class="_mce_marker" />');

                tinymce.each('h1,h2,h3,h4,h5,h6,p'.split(','), function (n) {
                    if (patt) {
                        patt += ',';
                    }

                    patt += n + ' ._mce_marker';
                });

                tinymce.each(inst.dom.select(patt), function (n) {
                    inst.dom.split(inst.dom.getParent(n, 'h1,h2,h3,h4,h5,h6,p'), n);
                });

                // ATLASSIAN - should be using selection.setContent instead of setOuterHTML to ensure that any selection.onSetContent listeners are called.
                var marker = dom.select('br._mce_marker')[0];
                inst.selection.select(marker);
                inst.selection.setContent(html);

                // ATLASSIAN - clean up the marker if it is still present
                inst.dom.remove(marker);
            } else {
                inst.execCommand('mceInsertContent', false, html);
            }

            tinymce.each(dom.select('table[data-mce-new]'), function (node) {
                //ATLASSIAN
                //// Fixes a bug in IE where the caret cannot be placed after the table if the table is at the end of the document
                //if (tinymce.isIE && node.nextSibling == null) {
                //    dom.insertAfter(dom.create('p'), node);
                //}

                //var tdorth = dom.select('td,th', node);

                //ATLASSIAN: puts the cursor in the first row
                //Could possibly use a first-child selector but this is a little more robust if we ever do thead/tbody etc
                var selector = heading ? 'th' : 'td';
                var tdorth = dom.select(selector, node);

                try {
                    // IE9 might fail to do this selection
                    inst.selection.setCursorLocation(tdorth[0], 0);
                } catch (ex) {
                    // Ignore
                }

                dom.setAttrib(node, 'data-mce-new', '');
            });

            inst.addVisual();
            inst.execCommand('mceEndUndoLevel', false, {}, {skip_undo: true});

            //tinyMCEPopup.close();

            //CONFDEV-37226
            if (elm && tinymce.DOM.hasClass(elm, "confluenceTable")) {
                //nested table
                AJS.Confluence.Analytics.publish(
                    'confluence.table.create.nested',
                    {pageId: AJS.Meta.get('page-id')}
                );
            } else {
                AJS.Confluence.Analytics.publish(
                    'confluence.table.create',
                    {pageId: AJS.Meta.get('page-id')}
                );
            }
        }
    };

    function makeAttrib(attrib, value) {
        var formObj = document.forms[0];
        var valueElm = formObj.elements[attrib];

        if (typeof(value) === "undefined" || value == null) {
            value = "";

            if (valueElm) {
                value = valueElm.value;
            }
        }

        if (value == "") {
            return "";
        }

        // XML encode it
        value = value.replace(/&/g, '&amp;');
        value = value.replace(/\"/g, '&quot;');
        value = value.replace(/</g, '&lt;');
        value = value.replace(/>/g, '&gt;');

        return ' ' + attrib + '="' + value + '"';
    }

    function init() {
        utils = require('atlassian-tinymce/utils/form_utils');
        editableSelects = require('atlassian-tinymce/utils/editable_selects');

        tinyMCEPopup.resizeToInnerSize();

        document.getElementById('backgroundimagebrowsercontainer').innerHTML = utils.getBrowserHTML('backgroundimagebrowser', 'backgroundimage', 'image', 'table');
        document.getElementById('backgroundimagebrowsercontainer').innerHTML = utils.getBrowserHTML('backgroundimagebrowser', 'backgroundimage', 'image', 'table');
        document.getElementById('bordercolor_pickcontainer').innerHTML = utils.getColorPickerHTML('bordercolor_pick', 'bordercolor');
        document.getElementById('bgcolor_pickcontainer').innerHTML = utils.getColorPickerHTML('bgcolor_pick', 'bgcolor');

        var cols = 2;
        var rows = 2;
        var st;
        var border = tinyMCEPopup.getParam('table_default_border', '0');
        var cellpadding = tinyMCEPopup.getParam('table_default_cellpadding', '');
        var cellspacing = tinyMCEPopup.getParam('table_default_cellspacing', '');
        var align = "";
        var width = "";
        var height = "";
        var bordercolor = "";
        var bgcolor = "";
        var className = "";
        var id = "";
        var summary = "";
        var style = "";
        var dir = "";
        var lang = "";
        var background = "";
        var rules = "";
        var frame = "";
        var inst = tinyMCEPopup.editor;
        var dom = inst.dom;
        var formObj = document.forms[0];
        var elm = dom.getParent(inst.selection.getNode(), "table");

        var action = tinyMCEPopup.getWindowArg('action');

        if (!action) {
            action = elm ? "update" : "insert";
        }

        if (elm && action != "insert") {
            var rowsAr = elm.rows;
            cols = 0;
            for (var i = 0; i < rowsAr.length; i++) {
                if (rowsAr[i].cells.length > cols) {
                    cols = rowsAr[i].cells.length;
                }
            }

            rows = rowsAr.length;

            st = dom.parseStyle(dom.getAttrib(elm, "style"));
            border = utils.trimSize(utils.getStyle(elm, 'border', 'borderWidth'));
            cellpadding = dom.getAttrib(elm, 'cellpadding', "");
            cellspacing = dom.getAttrib(elm, 'cellspacing', "");
            width = utils.trimSize(utils.getStyle(elm, 'width', 'width'));
            height = utils.trimSize(utils.getStyle(elm, 'height', 'height'));
            bordercolor = utils.convertRGBToHex(utils.getStyle(elm, 'bordercolor', 'borderLeftColor'));
            bgcolor = utils.convertRGBToHex(utils.getStyle(elm, 'bgcolor', 'backgroundColor'));
            align = dom.getAttrib(elm, 'align', align);
            frame = dom.getAttrib(elm, 'frame');
            rules = dom.getAttrib(elm, 'rules');
            className = tinymce.trim(dom.getAttrib(elm, 'class').replace(/mceItem.+/g, ''));
            id = dom.getAttrib(elm, 'id');
            summary = dom.getAttrib(elm, 'summary');
            style = dom.serializeStyle(st);
            dir = dom.getAttrib(elm, 'dir');
            lang = dom.getAttrib(elm, 'lang');
            background = utils.getStyle(elm, 'background', 'backgroundImage').replace(new RegExp("url\\(['\"]?([^'\"]*)['\"]?\\)", 'gi'), "$1");
            formObj.caption.checked = elm.getElementsByTagName('caption').length > 0;

            action = "update";
            formObj.insert.value = inst.getLang('update');
        }

        utils.addClassesToList('class', "table_styles");
        editableSelects.init();

        // Update form
        utils.selectByValue(formObj, 'align', align);
        utils.selectByValue(formObj, 'tframe', frame);
        utils.selectByValue(formObj, 'rules', rules);
        utils.selectByValue(formObj, 'class', className, true, true);
        formObj.cols.value = cols;
        formObj.rows.value = rows;
        formObj.border.value = border;
        formObj.cellpadding.value = cellpadding;
        formObj.cellspacing.value = cellspacing;
        formObj.width.value = width;
        formObj.height.value = height;
        formObj.bordercolor.value = bordercolor;
        formObj.bgcolor.value = bgcolor;
        formObj.id.value = id;
        formObj.summary.value = summary;
        formObj.style.value = style;
        formObj.dir.value = dir;
        formObj.lang.value = lang;
        formObj.backgroundimage.value = background;

        utils.updateColor('bordercolor_pick', 'bordercolor');
        utils.updateColor('bgcolor_pick', 'bgcolor');

        // Resize some elements
        if (utils.isVisible('backgroundimagebrowser')) {
            document.getElementById('backgroundimage').style.width = '180px';
        }

        // Disable some fields in update mode
        if (action == "update") {
            formObj.cols.disabled = true;
            formObj.rows.disabled = true;
        }
    }

    function changedSize() {
        var formObj = document.forms[0];
        var st = dom.parseStyle(formObj.style.value);

        /*    var width = formObj.width.value;
         if (width != "")
         st['width'] = tinyMCEPopup.getParam("inline_styles") ? utils.getCSSSize(width) : "";
         else
         st['width'] = "";*/

        var height = formObj.height.value;
        if (height != "") {
            st['height'] = utils.getCSSSize(height);
        } else {
            st['height'] = "";
        }

        formObj.style.value = dom.serializeStyle(st);
    }

    function isCssSize(value) {
        return /^[0-9.]+(%|in|cm|mm|em|ex|pt|pc|px)$/.test(value);
    }

    function cssSize(value, def) {
        value = tinymce.trim(value || def);

        if (!isCssSize(value)) {
            return parseInt(value, 10) + 'px';
        }

        return value;
    }

    function changedBackgroundImage() {
        var formObj = document.forms[0];
        var st = dom.parseStyle(formObj.style.value);

        st['background-image'] = "url('" + formObj.backgroundimage.value + "')";

        formObj.style.value = dom.serializeStyle(st);
    }

    function changedBorder() {
        var formObj = document.forms[0];
        var st = dom.parseStyle(formObj.style.value);

        // Update border width if the element has a color
        if (formObj.border.value != "" && (isCssSize(formObj.border.value) || formObj.bordercolor.value != "")) {
            st['border-width'] = cssSize(formObj.border.value);
        } else {
            if (!formObj.border.value) {
                st['border'] = '';
                st['border-width'] = '';
            }
        }

        formObj.style.value = dom.serializeStyle(st);
    }

    function changedColor() {
        var formObj = document.forms[0];
        var st = dom.parseStyle(formObj.style.value);

        st['background-color'] = formObj.bgcolor.value;

        if (formObj.bordercolor.value != "") {
            st['border-color'] = formObj.bordercolor.value;

            // Add border-width if it's missing
            if (!st['border-width']) {
                st['border-width'] = cssSize(formObj.border.value, 1);
            }
        }

        formObj.style.value = dom.serializeStyle(st);
    }

    function changedStyle() {
        var formObj = document.forms[0];
        var st = dom.parseStyle(formObj.style.value);

        if (st['background-image']) {
            formObj.backgroundimage.value = st['background-image'].replace(new RegExp("url\\(['\"]?([^'\"]*)['\"]?\\)", 'gi'), "$1");
        } else {
            formObj.backgroundimage.value = '';
        }

        if (st['width']) {
            formObj.width.value = utils.trimSize(st['width']);
        }

        if (st['height']) {
            formObj.height.value = utils.trimSize(st['height']);
        }

        if (st['background-color']) {
            formObj.bgcolor.value = st['background-color'];
            utils.updateColor('bgcolor_pick', 'bgcolor');
        }

        if (st['border-color']) {
            formObj.bordercolor.value = st['border-color'];
            utils.updateColor('bordercolor_pick', 'bordercolor');
        }
    }

    return Table;
});

require('confluence/module-exporter').safeRequire('atlassian-tinymce/plugins/table/table', function(Table) {
    var tinymce = require('tinymce');
    var $ = require('jquery');

    $.extend(tinymce.plugins.TablePlugin.prototype, Table);
});
