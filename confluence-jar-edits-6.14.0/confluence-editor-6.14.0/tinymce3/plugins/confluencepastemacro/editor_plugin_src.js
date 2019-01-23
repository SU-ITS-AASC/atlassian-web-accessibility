/**
 * This plugin removes all the html for the clipboard leaving only the text.
 * CONFDEV-4233 Only text from the clipboard should be pasted into the body of plain text macro
 * CONFDEV-4451 Code macro strips whitespace
 * @module confluence-editor/tinymce3/plugins/confluencepastemacro/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/confluencepastemacro/editor_plugin_src', [
    'jquery',
    'document',
    'tinymce'
], function(
    $,
    document,
    tinymce
) {
    "use strict";

    return {
        init: function(ed) {
            var that = this;
            var postPasteHandler = function(e, pl, o) {
                var document = ed.getDoc();
                var newPreNode;
                var newDivNode;

                if ( $(ed.selection.getStart()).closest("[data-macro-body-type='PLAIN_TEXT']").length ){
                    that.bindPostSerializeHandler(ed);
                    newPreNode = that.parseHtml(ed, o.node);
                    newDivNode = document.createElement('div');

                    newDivNode.appendChild(newPreNode);
                    o.node = newDivNode;
                }
            };

            ed.onInit.add(function() {
                $(document).bind('postPaste', postPasteHandler);
            });

            ed.onRemove.add(function(ed) {
                $(document).unbind('postPaste', postPasteHandler);
            });
        },

        /**
         * When pasting into a <pre> tag we create an extra <pre> tag inside of the standard div
         * That all pasted content is moved into. This causes TinyMCE's serializer to keep arbitrary
         * whitespace. Here we bind a callback to postProcess of TinyMCE's serializer to remove that
         * wrapping pre tag so that extra nesting is avoided.
         *
         * @param ed The editor instance whose serializer to bind callback against
         */
        bindPostSerializeHandler: function(ed){
            var onPostProcess = ed.serializer.onPostProcess;
            function postProcessCallback(scope, o) {
                //remove the wrapping pre
                o.content = o.content.replace(/^<pre>|<\/pre>$/g, '');
                onPostProcess.remove(postProcessCallback);
            }
            onPostProcess.add(postProcessCallback);
        },

        /* We're not using recursion here to avoid a stack overflow */
        parseHtml: function(ed, element) {
            var stack = $.makeArray(element.childNodes);
            var current;
            var insertElem;
            var document = ed.getDoc();
            var content = document.createElement('pre');

            while (stack.length) {
                current = stack.shift();

                if (current.childNodes.length) {
                    tinymce.html.Schema.blockElementsMap[current.nodeName] && stack.unshift(document.createElement('br'));
                    stack = $.makeArray(current.childNodes).concat(stack);
                } else {
                    insertElem = this.formatMacroContent(current, document);
                    insertElem && content.appendChild(insertElem);
                }
            }

            return content;
        },

        //Strip out html when pasting into a plain text macro
        formatMacroContent: function(element, document) {
            var content;
            var textNode = 3;
            var nonBreakingSpace = /\xA0/g;
            document = document || window.document;

            if (element.nodeType === textNode){
                content = document.createTextNode($(element).text().replace(nonBreakingSpace, ' '));
            } else if (element.nodeName === 'BR') {
                content = document.createElement('br');
            }

            return content;
        },

        getInfo: function() {
            return {
                longname: 'ConfluencePasteMacroPlugin',
                author: 'Atlassian',
                authorurl: 'http://www.atlassian.com',
                infourl: 'http://www.atlassian.com',
                version: '1.0'
            };
        }
    };
});

require('confluence/module-exporter')
        .safeRequire('confluence-editor/tinymce3/plugins/confluencepastemacro/editor_plugin_src', function(ConfluencePasteMacroPlugin) {
            var tinymce = require('tinymce');

            tinymce.create('tinymce.plugins.ConfluencePasteMacroPlugin', ConfluencePasteMacroPlugin);

            tinymce.PluginManager.add('confluencepastemacroplugin', tinymce.plugins.ConfluencePasteMacroPlugin);
        });