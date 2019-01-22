/**
 * @module confluence-editor/tinymce3/plugins/placeholder/placeholder
 */
define('confluence-editor/tinymce3/plugins/placeholder/placeholder', [
    'jquery',
    'ajs',
    'tinymce'
], function(
    $,
    AJS,
    tinymce
) {
    "use strict";

    var placeHolderTypes = [];
    var placeHolderTypeMap = {};

    AJS.Rte = AJS.Rte || {};
    AJS.Rte.Placeholder = AJS.Rte.Placeholder || {};

    var EMPTY_CARET;
    var EMPTY_CARET_LI;

    if(tinymce.isIE) {
        EMPTY_CARET = "\uFEFF{$caret}";
        EMPTY_CARET_LI = "<p>{$caret}</p>";
    } else if(tinymce.isWebKit) {
        EMPTY_CARET = "\uFEFF{$caret}<br>";
        EMPTY_CARET_LI = EMPTY_CARET;
    } else {
        EMPTY_CARET = "\uFEFF{$caret}";
        EMPTY_CARET_LI = EMPTY_CARET;
    }

    return {
        /**
         * Inserts the placeholder into the current cursor position in the editor.
         *
         * Examples:
         *   AJS.Rte.Placeholder.insertPlaceHolder('<p>Display text</p>', '<p>Activation text. Typing goes in here: "<span class="caret"></span>".</p>')
         *   AJS.Rte.Placeholder.insertPlaceHolder('<p>Enter new tasks here:</p><ul class="inline-task-list"><li data-inline-task-id>First task</li></ul>', '<ul class="inline-task-list"><li data-inline-task-id><span class="caret"></span><br/></li></ul>')
         *
         * @param displayContent the content to display for the placeholder
         */
        insertTextPlaceHolder : function(displayContent) {
            var ph = $('<div></div>').append(AJS.Rte.Placeholder.Templates.textPlaceholder({ content: EMPTY_CARET }));
            displayContent && ph.find('.text-placeholder').html(displayContent);
            AJS.Rte.getEditor().execCommand('mceInsertContent', false, ph.html());
        },

        /**
         * Removes the specified placeholder from the editor and places the cursor in its place
         * @param ph jquery placeholder
         */
        removePlaceholder : function(ph) {
            var ed = AJS.Rte.getEditor();
            var body = $(ed.getBody());
            var content = EMPTY_CARET;
            // Selecting of placeholder will not work (as the selection can get changed by handlePlaceholderNodeChange), so replace it with something selectable
            if(ph.parent()[0].nodeName === "LI") {
                content = EMPTY_CARET_LI;
            }
            ph.replaceWith('<span id="placeholder-cursor">&nbsp;</span>');

            var phCursor = body.find('#placeholder-cursor')[0];
            ed.selection.select(phCursor.firstChild);
            ed.execCommand('mceInsertContent', false, content);
            ed.dom.remove(phCursor, true);
        },

        /**
         * @param typeSpec of the form: { type: "example", label: "Example", tooltip: "The does example", activation: { click: true, keypress: false } }
         */
        addPlaceholderType : function(typeSpec) {
            if (!typeSpec || !typeSpec.type) {
                AJS.log('PlaceHolderRegister : unable to register new place holder type !');
                return;
            }
            placeHolderTypes.push(typeSpec);
            placeHolderTypeMap[typeSpec.type] = typeSpec;
        },

        getPlaceholderTypes : function() {
            return [].concat(placeHolderTypes);
        },

        getPlaceholderType : function(type) {
            return placeHolderTypeMap[type];
        }
    };
});

require('confluence/module-exporter').safeRequire('confluence-editor/tinymce3/plugins/placeholder/placeholder', function(Placeholder) {
    var $ = require('jquery');
    $.extend(require('ajs').Rte.Placeholder, Placeholder);
});

