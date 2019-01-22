/**
 * editable_selects.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 *
 * @module atlassian-tinymce/utils/editable_selects
 */
define('atlassian-tinymce/utils/editable_selects', [
    'document',
    'tinymce/popup',
    'window'
], function (
    document,
    tinyMCEPopup,
    window
) {
    "use strict";

    var editableSelects = {};

    editableSelects.editSelectElm = null;

    editableSelects.init = function () {
        var nl = document.getElementsByTagName("select");
        var i;
        var d = document;
        var o;

        for (i = 0; i < nl.length; i++) {
            if (nl[i].className.indexOf('mceEditableSelect') != -1) {
                o = new Option(tinyMCEPopup.editor.translate('value'), '__mce_add_custom__');

                o.className = 'mceAddSelectValue';

                nl[i].options[nl[i].options.length] = o;
                nl[i].onchange = editableSelects.onChangeEditableSelect;
            }
        }
    };

    editableSelects.onChangeEditableSelect = function (e) {
        var d = document;
        var ne;
        var se = window.event ? window.event.srcElement : e.target;

        if (se.options[se.selectedIndex].value == '__mce_add_custom__') {
            ne = d.createElement("input");
            ne.id = se.id + "_custom";
            ne.name = se.name + "_custom";
            ne.type = "text";

            ne.style.width = se.offsetWidth + 'px';
            se.parentNode.insertBefore(ne, se);
            se.style.display = 'none';
            ne.focus();
            ne.onblur = editableSelects.onBlurEditableSelectInput;
            ne.onkeydown = editableSelects.onKeyDown;
            editableSelects.editSelectElm = se;
        }
    };

    editableSelects.onBlurEditableSelectInput = function () {
        var se = editableSelects.editSelectElm;
        var utils = require('atlassian-tinymce/utils/form_utils');

        if (se) {
            if (se.previousSibling.value != '') {
                utils.addSelectValue(document.forms[0], se.id, se.previousSibling.value, se.previousSibling.value);
                utils.selectByValue(document.forms[0], se.id, se.previousSibling.value);
            } else {
                utils.selectByValue(document.forms[0], se.id, '');
            }

            se.style.display = 'inline';
            se.parentNode.removeChild(se.previousSibling);
            editableSelects.editSelectElm = null;
        }
    };

    editableSelects.onKeyDown = function (e) {
        e = e || window.event;

        if (e.keyCode === 13) {
            editableSelects.onBlurEditableSelectInput();
        }
    };

    return editableSelects;
});

require('confluence/module-exporter').exportModuleAsGlobal('atlassian-tinymce/utils/editable_selects', 'TinyMCE_EditableSelects');