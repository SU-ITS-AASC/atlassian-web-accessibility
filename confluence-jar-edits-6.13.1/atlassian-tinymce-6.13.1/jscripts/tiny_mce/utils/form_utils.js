/**
 * form_utils.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 *
 * @module atlassian-tinymce/utils/form_utils
 */
define('atlassian-tinymce/utils/form_utils', [
    'tinymce',
    'tinymce/popup'
], function(
    tinymce,
    tinyMCEPopup
) {
    var utils = {};

    utils.themeBaseURL = tinyMCEPopup.editor.baseURI.toAbsolute('themes/' + tinyMCEPopup.getParam("theme"));

    utils.getColorPickerHTML = function(id, target_form_element) {
        var h = "";
        var dom = tinyMCEPopup.dom;

        var label = dom.select('label[for=' + target_form_element + ']')[0];
        if (label) {
            label.id = label.id || dom.uniqueId();
        }

        h += '<a role="button" aria-labelledby="' + id + '_label" id="' + id + '_link" href="javascript:;" onclick="tinyMCEPopup.pickColor(event,\'' + target_form_element +'\');" onmousedown="return false;" class="pickcolor">';
        h += '<span id="' + id + '" title="' + tinyMCEPopup.getLang('browse') + '">&nbsp;<span id="' + id + '_label" class="mceVoiceLabel mceIconOnly" style="display:none;">' + tinyMCEPopup.getLang('browse') + '</span></span></a>';

        return h;
    };

    utils.updateColor = function(img_id, form_element_id) {
        document.getElementById(img_id).style.backgroundColor = document.forms[0].elements[form_element_id].value;
    };

    utils.setBrowserDisabled = function(id, state) {
        var img = document.getElementById(id);
        var lnk = document.getElementById(id + "_link");

        if (lnk) {
            if (state) {
                lnk.setAttribute("realhref", lnk.getAttribute("href"));
                lnk.removeAttribute("href");
                tinyMCEPopup.dom.addClass(img, 'disabled');
            } else {
                if (lnk.getAttribute("realhref")) {
                    lnk.setAttribute("href", lnk.getAttribute("realhref"));
                }

                tinyMCEPopup.dom.removeClass(img, 'disabled');
            }
        }
    };

    utils.getBrowserHTML = function(id, target_form_element, type, prefix) {
        var option = prefix + "_" + type + "_browser_callback";
        var cb;
        var html;

        cb = tinyMCEPopup.getParam(option, tinyMCEPopup.getParam("file_browser_callback"));

        if (!cb) {
            return "";
        }

        html = "";
        html += '<a id="' + id + '_link" href="javascript:openBrowser(\'' + id + '\',\'' + target_form_element + '\', \'' + type + '\',\'' + option + '\');" onmousedown="return false;" class="browse">';
        html += '<span id="' + id + '" title="' + tinyMCEPopup.getLang('browse') + '">&nbsp;</span></a>';

        return html;
    };

    utils.openBrowser = function(img_id, target_form_element, type, option) {
        var img = document.getElementById(img_id);

        if (img.className != "mceButtonDisabled") {
            tinyMCEPopup.openBrowser(target_form_element, type, option);
        }
    };

    utils.selectByValue = function(form_obj, field_name, value, add_custom, ignore_case) {
        if (!form_obj || !form_obj.elements[field_name]) {
            return;
        }

        if (!value) {
            value = "";
        }

        var sel = form_obj.elements[field_name];

        var found = false;
        var option;
        for (var i=0; i<sel.options.length; i++) {
            option = sel.options[i];

            if (option.value == value || (ignore_case && option.value.toLowerCase() == value.toLowerCase())) {
                option.selected = true;
                found = true;
            } else {
                option.selected = false;
            }
        }

        if (!found && add_custom && value != '') {
            option = new Option(value, value);
            option.selected = true;
            sel.options[sel.options.length] = option;
            sel.selectedIndex = sel.options.length - 1;
        }

        return found;
    };

    utils.getSelectValue = function(form_obj, field_name) {
        var elm = form_obj.elements[field_name];

        if (elm == null || elm.options == null || elm.selectedIndex === -1) {
            return "";
        }

        return elm.options[elm.selectedIndex].value;
    };

    utils.addSelectValue = function(form_obj, field_name, name, value) {
        var s = form_obj.elements[field_name];
        var o = new Option(name, value);
        s.options[s.options.length] = o;
    };

    utils.addClassesToList = function(list_id, specific_option) {
        // Setup class droplist
        var styleSelectElm = document.getElementById(list_id);
        var styles = tinyMCEPopup.getParam('theme_advanced_styles', false);
        styles = tinyMCEPopup.getParam(specific_option, styles);

        if (styles) {
            var stylesAr = styles.split(';');

            for (var i=0; i<stylesAr.length; i++) {
                if (stylesAr != "") {
                    var key;
                    var value;

                    key = stylesAr[i].split('=')[0];
                    value = stylesAr[i].split('=')[1];

                    styleSelectElm.options[styleSelectElm.length] = new Option(key, value);
                }
            }
        } else {
            tinymce.each(tinyMCEPopup.editor.dom.getClasses(), function(o) {
                styleSelectElm.options[styleSelectElm.length] = new Option(o.title || o['class'], o['class']);
            });
        }
    };

    utils.isVisible = function(element_id) {
        var elm = document.getElementById(element_id);

        return elm && elm.style.display != "none";
    };

    utils.convertRGBToHex = function(col) {
        var re = new RegExp("rgb\\s*\\(\\s*([0-9]+).*,\\s*([0-9]+).*,\\s*([0-9]+).*\\)", "gi");

        var rgb = col.replace(re, "$1,$2,$3").split(',');
        if (rgb.length === 3) {
            var r = parseInt(rgb[0]).toString(16);
            var g = parseInt(rgb[1]).toString(16);
            var b = parseInt(rgb[2]).toString(16);

            r = r.length === 1 ? '0' + r : r;
            g = g.length === 1 ? '0' + g : g;
            b = b.length === 1 ? '0' + b : b;

            return "#" + r + g + b;
        }

        return col;
    };

    utils.convertHexToRGB = function(col) {
        if (col.indexOf('#') != -1) {
            col = col.replace(new RegExp('[^0-9A-F]', 'gi'), '');

            var r = parseInt(col.substring(0, 2), 16);
            var g = parseInt(col.substring(2, 4), 16);
            var b = parseInt(col.substring(4, 6), 16);

            return "rgb(" + r + "," + g + "," + b + ")";
        }

        return col;
    };

    utils.trimSize = function(size) {
        return size.replace(/([0-9\.]+)(px|%|in|cm|mm|em|ex|pt|pc)/i, '$1$2');
    };

    utils.getCSSSize = function(size) {
        size = utils.trimSize(size);

        if (size == "") {
            return "";
        }

        // Add px
        if (/^[0-9]+$/.test(size)) {
            size += 'px';
            // Sanity check, IE doesn't like broken values
        } else if (!(/^[0-9\.]+(px|%|in|cm|mm|em|ex|pt|pc)$/i.test(size))) {
            return "";
        }

        return size;
    };

    utils.getStyle = function (elm, attrib, style) {
        var val = tinyMCEPopup.dom.getAttrib(elm, attrib);

        if (val != '') {
            return '' + val;
        }

        if (typeof(style) == 'undefined') {
            style = attrib;
        }

        return tinyMCEPopup.dom.getStyle(elm, style);
    };

    return utils;
});

require('confluence/module-exporter').safeRequire('atlassian-tinymce/utils/form_utils', function(utils) {
    window.themeBaseURL = utils.themeBaseURL;
    window.getColorPickerHTML = utils.getColorPickerHTML;
    window.updateColor = utils.updateColor;
    window.setBrowserDisabled = utils.setBrowserDisabled;
    window.getBrowserHTML = utils.getBrowserHTML;
    window.openBrowser = utils.openBrowser;
    window.selectByValue = utils.selectByValue;
    window.getSelectValue = utils.getSelectValue;
    window.addSelectValue = utils.addSelectValue;
    window.addClassesToList = utils.addClassesToList;
    window.isVisible = utils.isVisible;
    window.convertRGBToHex = utils.convertRGBToHex;
    window.convertHexToRGB = utils.convertHexToRGB;
    window.trimSize = utils.trimSize;
    window.getCSSSize = utils.getCSSSize;
    window.getStyle = utils.getStyle;
});




