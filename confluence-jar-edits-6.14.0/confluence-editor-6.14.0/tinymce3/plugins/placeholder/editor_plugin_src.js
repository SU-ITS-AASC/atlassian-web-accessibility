/**
 * @module confluence-editor/tinymce3/plugins/placeholder/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/placeholder/editor_plugin_src', [
    'jquery',
    'ajs',
    'tinymce'
], function(
    $,
    AJS,
    tinymce
) {
    "use strict";

    /* CONFDEV-15591 - If defining a display style of inline-block, regardless of whether there another rule overriding
     * it in IE, the element will end up with "resize" handles and not behave how we want, so we need to inject the
     * appropriate CSS depending on the browser.
     *
     * Not pretty and don't like doing special behaviour like this for anything other than IE.
     */
    var IE_STYLES = '<style type="text/css">.wiki-content .text-placeholder { display: inline; }</style>';
    var OTHER_STYLES = '<style type="text/css">.wiki-content .text-placeholder { display: inline-block; }</style>';

    var DEFAULT_ACTIVATION = {
        click: false,
        keypress: true
    };

    var VK = tinymce.VK;
    var Event = tinymce.dom.Event;
    // placeholders are editable (template mode)
    var editable = (AJS.Meta.get("content-type") === "template");

    // Custom styles per browser as needed where overrides in CSS don't work
    function applyStyles() {
        var head = $(AJS.Rte.getEditor().getDoc()).find('head');
        if($.browser.msie) {
            head.append(IE_STYLES);
        } else {
            head.append(OTHER_STYLES);
        }
    }

    // Template mode
    function initialiseTemplatePlaceholders(ed) {
        AJS.trigger('cursor-target-refresh');

        $('#rte-button-insert-placeholder').click(function(e) {
            e.preventDefault();
            AJS.Rte.Placeholder.insertTextPlaceHolder();
        });

        // Enter will escape a placeholder when editing
        ed.onKeyPress.addToTop(function(ed, e) {
            if (e.keyCode === 13 && !e.shiftKey) {
                var selectedNode = ed.selection.getNode();
                var placeholder = $(selectedNode).closest(".text-placeholder");

                if(placeholder.length && AJS.Rte.Cursor.isCursorAtEnd(ed, ed.selection.getRng(), selectedNode)) {
                    AJS.Rte.Cursor.insertParagraph(ed, placeholder, true);
                    return tinymce.dom.Event.cancel(e);
                }
            }
        });
    }

    // These should probably be in tinymce
    var NOT_SELECTABLE = {
        'UL' : true,
        'OL' : true,
        'LI' : true,
        'TABLE' : true,
        'TBODY': true
    };

    function isSelectable(node) {
        return !NOT_SELECTABLE[node.nodeName];
    }

    function selectPreviousValidNode(ed, node) {
        var prev = node.previousSibling;
        var selNode;
        // find prev sibling or walk up tree until we find a parents prev sibling
        while(node && !prev) {
            node = node.parentNode;
            prev = node.previousSibling;
        }
        if(prev) {
            selNode = prev;
            while(!isSelectable(selNode)) {
                if(!selNode.lastChild) {
                    break; // no more children select node anyway
                }

                selNode = selNode.lastChild;
            }
            // Try to select last child
            ed.selection.select(selNode.lastChild || selNode);
            ed.selection.collapse(false);
            ed.selection.normalize();
        }
    }

    function selectNextValidNode(ed, node) {
        var next = node.nextSibling;
        var selNode;
        // find next sibling or walk up tree until we find a parents next sibling
        while(node && !next) {
            node = node.parentNode;
            next = node.nextSibling;
        }
        if(next) {
            selNode = next;
            while(!isSelectable(selNode)) {
                if(!selNode.firstChild) {
                    break; // no more children select node anyway
                }

                selNode = selNode.firstChild;
            }
            // Try to select first child
            ed.selection.select(selNode.firstChild || selNode);
            ed.selection.collapse(true);
            ed.selection.normalize();
        }
    }


    // Normal page mode mode
    function initialiseNormalPlaceholders(ed) {
        function selectPlaceholder() {
            var body = $(AJS.Rte.getEditor().getBody());
            var ph = body.find('.text-placeholder.selected');
            if(ph.length) {
                AJS.Rte.getEditor().selection.select(ph[0]);
            }
        }

        function addActivationHandlers(ed) {
            ed.onKeyDown.addToTop(navigationHandler);
            ed.onKeyPress.addToTop(replaceHandler);
            ed.onClick.addToTop(replaceHandler);
        }

        function removeActivationHandlers(ed) {
            ed.onKeyDown.remove(navigationHandler);
            ed.onKeyPress.remove(replaceHandler);
            ed.onClick.remove(replaceHandler);
        }

        function navigationHandler(ed, e) {
            var body = $(ed.getBody());
            var ph = body.find('.text-placeholder.selected');

            // Handler still active, but no placeholder selected, unregister
            if(!ph.length) {
                removeActivationHandlers(ed);
                return;
            }

            // Special cases:
            // Up/left/right/down - move cursor
            // Delete/backspace - remove completely (or should to put replacement content in?)
            if(e.keyCode === VK.LEFT || e.keyCode === VK.UP) {
                // move cursor up
                selectPreviousValidNode(ed, ph[0]);
                return Event.cancel(e);
            } else if(e.keyCode === VK.RIGHT || e.keyCode === VK.DOWN) {
                // move cursor down
                selectNextValidNode(ed, ph[0]);
                return Event.cancel(e);
            } else if(e.keyCode === VK.BACKSPACE || e.keyCode === VK.DELETE) {
                AJS.Rte.Placeholder.removePlaceholder(ph);
                return Event.cancel(e);
            }
        }

        function replaceHandler(ed, e) {
            if (tinymce.isGecko && (!e.isChar && e.type === 'keypress')) {
                return; // non-printable
            }

            var body = $(ed.getBody());
            var ph = body.find('.text-placeholder.selected');

            // Handler still active, but no placeholder selected, unregister
            if(!ph.length) {
                removeActivationHandlers(ed);
                return;
            }

            if(ph.length) {
                var placeholderType = ph.attr('data-placeholder-type');
                if(shouldActivate(placeholderType, e.type)) {
                    AJS.Rte.Placeholder.removePlaceholder(ph);
                    // Notify listeners of activation
                    AJS.trigger('editor.text-placeholder.activated', {
                        placeholderType: placeholderType || '',
                        triggerEvent: e
                    });
                }
            }
        }

        function shouldActivate(type, eventType) {
            var typeSpec = AJS.Rte.Placeholder.getPlaceholderType(type);
            var activation = $.extend({}, DEFAULT_ACTIVATION, typeSpec && typeSpec.activation);
            return !!activation[eventType];
        }

        function handlePlaceholderNodeChange(ed, cm, el) {
            var ph = $(el).closest('.text-placeholder');

            $(ed.getBody()).find('.text-placeholder.selected').not(ph).removeClass('selected');
            if(ph.length) {
                if(!ph.hasClass('selected')) {
                    ph.addClass('selected');
                    addActivationHandlers(ed);
                }
                // Force selection as clicking in an already selected placeholder would otherwise place the caret inside the placeholder.
                // Need to defer as a click handler undoes this.
                setTimeout(selectPlaceholder, 0);
            } else {
                removeActivationHandlers(ed);
            }
        }

        ed.onNodeChange.addToTop(handlePlaceholderNodeChange);
    }

    return {
        init: function(ed) {
            ed.onInit.add(function() {
                if(editable) {
                    initialiseTemplatePlaceholders(ed);
                } else {
                    initialiseNormalPlaceholders(ed);
                }
                applyStyles();
            });
        },

        getInfo: function() {
            return {
                longname: 'Text Placeholder Plugin',
                author: 'Atlassian',
                authorurl: 'http://www.atlassian.com',
                infourl: 'http://www.atlassian.com',
                version: '1.0'
            };
        }
    };
});

require('confluence/module-exporter')
        .safeRequire('confluence-editor/tinymce3/plugins/placeholder/editor_plugin_src', function(TextPlaceholderPlugin) {
            var tinymce = require('tinymce');
            tinymce.create('tinymce.plugins.TextPlaceholderPlugin', TextPlaceholderPlugin);
            tinymce.PluginManager.add('textplaceholders', tinymce.plugins.TextPlaceholderPlugin);
        });