/**
 * @module confluence-editor/tinymce3/plugins/confluencepastetable/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/confluencepastetable/editor_plugin_src', [
    'jquery',
    'document'
], function(
    $,
    document
) {
    "use strict";

    /*
     This plugin sanitises content when it is pasted into the editor.
     CONFDEV-2219 Cannot highlight a table row if the table was pasted from another source.

     The bugger of this is that we have to iterate though the whole paste, might need to do
     some performance enhancements...
     */
    var PasteTablePlugin = {

        init: function (ed) {

            /* We're not using recursion here to avoid 'Too much recursion errors'
             this iterative approach should be faster as well.*/
            function parseHtml(element, process) {
                var current = element;
                var previous = '';

                while (current) {
                    if (typeof process === 'function') {
                        current = process(current);
                    }

                    // if process has removed a node which had no child nodes then current will now be null
                    if (!current) {
                        break;
                    } else if (current.firstChild && !isParent(current, previous) && !isMacroPlaceHolder(current)) {
                        previous = current;
                        current = current.firstChild;
                    } else if (current.nextSibling) {
                        previous = current;
                        current = current.nextSibling;
                    } else {
                        previous = current;
                        current = current.parentNode;
                    }
                }

                return element;
            }

            /*
             if it's a table then we'll remove anything nasty and add in
             the appropriate classes to make it look like a confluence plugin.
             */
            function formatTable(element) {
                var attributeWhiteList = {
                    'id': true,
                    'class': true,
                    'style': true,
                    'rowspan': true,
                    'colspan': true,
                    'data-mce-style': true,
                    'data-mce-bogus': true,
                    'data-macro-name': true,
                    'data-macro-parameters': true,
                    'data-macro-body-type': true,
                    'data-highlight-colour' : true,
                    'data-highlight-class' : true /* deprecated since 4.3 */
                };
                var classWhiteList = [ 'highlight', 'nohighlight', 'relative-table', 'fixed-table' /* deprecated since 4.3 */ ];
                var attribute;
                var attributeIncrementor = 0;
                var className = [];
                var highlightClass;
                var highlightColour;
                var $element = $(element);

                //Not an element or a macro-placeholder? do nothing.
                if (!element || isMacroPlaceHolder(element)) {
                    return element;
                }

                if (isTableWrap(element)) {
                    var tableElement = $("table", element);
                    if (tableElement.length) {
                        $(tableElement).unwrap();
                        element = tableElement[0];
                    } else {
                        return null;
                    }
                }

                //Remove attributes not in the white list
                if (isTable(element) && element.attributes) {

                    while (attributeIncrementor <= element.attributes.length) {
                        attribute = element.attributes[attributeIncrementor];
                        if (attribute && attribute.specified === true && !attributeWhiteList[attribute.name]) {
                            element.removeAttribute(attribute.name);
                        } else {
                            attributeIncrementor++;
                        }
                    }

                    //overwrite existing classes, this is a conscious decision to prevent users
                    //from getting styling into their tables that they can't create with the editor
                    getTableClass(element) && className.push(getTableClass(element));

                    for (var i = 0, ii = classWhiteList.length; i < ii; i++) {
                        if(classWhiteList[i].exec) {
                            // regex

                        } else {
                            $element.hasClass(classWhiteList[i]) && className.push(classWhiteList[i]);
                        }
                    }

                    /* deprecated since 4.3 */
                    highlightClass = $element.attr('data-highlight-class');
                    highlightClass && className.push(highlightClass);

                    highlightColour = $element.attr('data-highlight-colour');
                    highlightColour && className.push("highlight-" + highlightColour);

                    $element.attr('class', className.join(' '));
                }
                return element;
            }

            /* This is a table paste plugin so we only want to format table elements.
             If the element is not a table element then we don't want to do anything with it */
            function isTable(element) {
                return !element.tagName ? false :
                    element.tagName === 'TABLE' ? true :
                        element.tagName === 'TR' ? true :
                            element.tagName === 'TH' ? true :
                                element.tagName === 'TD' ? true :
                                    element.tagName === 'TBODY' ? true :
                                        element.tagName === 'THEAD' ? true :
                                            element.tagName === 'TFOOT' ? true :
                                                element.tagName === 'COL' ? true :
                                                    element.tagName === 'COLGROUP' ? true :
                                                    element.tagName === 'CAPTION';
            }

            /* Confluence tables have an annoying class structure which we will need
             to replicate with any table being pasted into the editor */
            function getTableClass(element) {
                return !element.tagName ? '' :
                    element.tagName === 'TABLE' ? 'confluenceTable' :
                        element.tagName === 'TH' ? 'confluenceTh' :
                            element.tagName === 'TD' ? 'confluenceTd' : '';
            }

            function isMacroPlaceHolder(element) {
                var className = '';

                if (element && element.getAttribute)  {
                    className = element.getAttribute('class');
                }

                return !element.tagName ? false :
                    element.tagName !== 'TABLE' ? false :
                        !className ? false : className.indexOf('wysiwyg-macro') !== -1;
            }

            // Is this a table wrapping div which we generating when rendering tables (see ViewTableWrappingFragmentTransformer)
            // This wrapping div should not exist in the editor so remove it.
            function isTableWrap(element) {
                var className;
                if (element && element.getAttribute) {
                    className = element.getAttribute('class');
                }

                return className && className.indexOf('table-wrap') >= 0;
            }

            //is the first element a parent of the second element.
            function isParent(firstElement, secondElement) {
                return secondElement.parentNode === firstElement;
            }

            function postPasteHandler (e, pl, o) {
                o.node = parseHtml(o.node, formatTable);
            }

            ed.onInit.add(function () {
                $(document).bind('postPaste', postPasteHandler);
            });

            ed.onRemove.add(function () {
                $(document).unbind('postPaste', postPasteHandler);
            });
        },

        getInfo: function () {
            return {
                longname: 'ConfluencePasteTablePlugin',
                author: 'Atlassian',
                authorurl: 'http://www.atlassian.com',
                infourl: 'http://www.atlassian.com',
                version: '1.0'
            };
        }
    };

    return PasteTablePlugin;
});

require('confluence/module-exporter')
    .safeRequire('confluence-editor/tinymce3/plugins/confluencepastetable/editor_plugin_src', function(PasteTablePlugin) {
        var tinymce = require('tinymce');
        tinymce.create('tinymce.plugins.ConfluencePasteTablePlugin', PasteTablePlugin);
        tinymce.PluginManager.add('confluencepastetableplugin', tinymce.plugins.ConfluencePasteTablePlugin);
    });