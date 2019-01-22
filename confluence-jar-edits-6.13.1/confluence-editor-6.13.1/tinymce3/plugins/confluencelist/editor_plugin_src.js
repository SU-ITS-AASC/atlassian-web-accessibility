/**
 * Confluence List Plugin
 *
 * @module confluence-editor/tinymce3/plugins/confluencelist/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/confluencelist/editor_plugin_src', [
    'jquery',
    'ajs',
    'tinymce'
], function(
    $,
    AJS,
    tinymce
) {
    "use strict";

    return {
        init : function(ed, url) {
            !tinymce.isIE8 && ed.onKeyDown.add(function (ed, e) {
                if (e.keyCode !== 8) { // backspace
                    return;
                }

                var range = ed.selection.getRng(true);
                var $currentListItem = $(range.startContainer).closest("li", ed.getBody());

                if ($currentListItem.length === 0) {
                    return;
                }

                if (!AJS.EditorUtils.isCursorAtStartOf($currentListItem[0], range)) {
                    return;
                }

                var $previousListItem = $currentListItem.prev("li");
                var previousListItem;
                var currentListItem = $currentListItem[0];
                var $cursorElement; // the cursor will be set just before this element

                /**
                 * Appends a trailing BR element if the last child of the specified element is:
                 *
                 * (a) inline
                 * (b) and not already a BR element
                 *
                 */
                function appendBr(element) {
                    if (!element || !element.lastChild) {
                        return;
                    }

                    if (!ed.dom.isBlock(element.lastChild) && !$(element.lastChild).is("br")) {
                        $(element).append("<br/>");
                    }
                }

                if ($previousListItem.length > 0) {
                    previousListItem = $previousListItem[0];

                    $cursorElement = $(currentListItem.firstChild);
                    if (tinymce.isIE9 && $cursorElement.length === 0) {
                        $cursorElement = $("<br/>").appendTo($currentListItem);
                    } else if ($cursorElement.is("p")) {
                        $cursorElement = $cursorElement.contents().first();
                    }

                    ed.undoManager.beforeChange();
                    ed.undoManager.add();

                    if ($(previousListItem.lastChild).is("p") && !ed.dom.isBlock(currentListItem.firstChild)) {
                        appendBr(previousListItem.lastChild);
                        $currentListItem.contents().each(function (index, element) {
                            if (ed.dom.isBlock(element)) {
                                return false; // stop iterating
                            }
                            $(previousListItem.lastChild).append($(element).detach());
                        });
                    } else if ($(currentListItem.firstChild).is("p") && !ed.dom.isBlock(previousListItem.lastChild)) {
                        appendBr(previousListItem);
                        $.each($.makeArray($previousListItem.contents()).reverse(), function (index, element) {
                            if (ed.dom.isBlock(element)) {
                                return false; // stop iterating
                            }
                            $(currentListItem.firstChild).prepend($(element).detach());
                        });
                    } else {
                        appendBr(previousListItem);
                    }

                    $previousListItem.append($currentListItem.detach().contents());

                    if ($cursorElement[0]) {
                        AJS.EditorUtils.setCursorAtStartOfContents($cursorElement[0]);
                    }

                    ed.undoManager.add();

                    return tinymce.dom.Event.cancel(e);
                }
            });
        },

        getInfo : function() {
            return {
                longname : 'Confluence List Plugin',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };
});

require('confluence/module-exporter').safeRequire('confluence-editor/tinymce3/plugins/confluencelist/editor_plugin_src', function(ConfluenceListPlugin) {
    var tinymce = require('tinymce');

    tinymce.create('tinymce.plugins.ConfluenceListPlugin', ConfluenceListPlugin);

    tinymce.PluginManager.add("confluencelist", tinymce.plugins.ConfluenceListPlugin);
});


