/**
 * This tinyMCE plugin wraps block elements,which are inside a table cell, into a DIV
 * So that when user resize a column to fix mode, these elements don't overlap a cell
 *
 * @module confluence-editor/tinymce3/plugins/tablecontentwrapper/editor_plugin_src
 */
define("confluence-editor/tinymce3/plugins/tablecontentwrapper/editor_plugin_src", [
    "jquery",
    "ajs",
    "tinymce"
], function ($, AJS, tinymce) {
    "use strict";

    var blockElements = ["img:not(.editor-inline-macro, .emoticon)"];
    var blockMacros = [".wysiwyg-macro"];
    var inlineElements = ["time.non-editable", ".editor-inline-macro", "a.confluence-link[data-linked-resource-type='userinfo']"];
    var elementsToWrap = blockElements.concat(inlineElements).concat(blockMacros).join(",");
    var contentWrapper = "<div class='content-wrapper'>";

    return {
        init: function (ed, url) {
            /**
             * CONFDEV-38889
             */
            function wrapAll() {
                var cssMarker = "wrapped";
                $(ed.dom.select("table.confluenceTable:not(." + cssMarker + ")")).each(function (i, table) {
                    //add CSS class to mark this table as processed
                    $(table).addClass(cssMarker)
                            .find("> tbody > tr > th, > tbody > tr > td, > thead > tr > th").each(function (i, cell) {
                        var $cell = $(cell);
                        if (!$cell.find("> .content-wrapper").length && $cell.find(elementsToWrap).length) {
                            $cell.wrapInner(contentWrapper);
                        }
                    });
                });
            }

            AJS.bind("rte-ready", function () {
                wrapAll();
            });
            ed.onChange.add(function () {
                var mceSelection = ed.selection;

                function mergeManyWrappers($wrappers) {
                    for (var i = 0; i < $wrappers.length; i++) {
                        if (!$wrappers.eq(i).find("> p, > table, > ul, > ol").length) {
                            /**
                             * <p> is the fundamental element to seperate lines and wrap inline element (e.g <img>, <span>)
                             * missing it will lead to unexpected behavior of tinyMCE
                             */
                            $wrappers.eq(i).wrapInner("<p/>");
                        }
                        //combine content of all other wrappers to the first one
                        if (i > 0) {
                            $wrappers.eq(0).append($wrappers.eq(i).children());
                            $wrappers.eq(i).remove();
                        }
                    }
                }

                function fixCursorPosition($currentNode) {
                    var range = mceSelection.getRng();
                    /**
                     * CONFDEV-41716
                     * if current node is TR, mceSelection.getBookmark() will append bookmark <span> directly to TR
                     * which will place cursor to wrong position after restore bookmark
                     * So need to move selection to child element of the TR
                     */
                    if ($currentNode.is("tr") && $(range.startContainer).is("tr") && range.collapsed) {
                        var $directCell = $currentNode.find(">td, >th").first();
                        //if cell only has text inside, we need "firstChild" to get TextNode
                        var startNode = $directCell.find(":first-child:not(.content-wrapper)")[0] || $directCell[0].firstChild;
                        range.setStart(startNode, 0);
                        range.setEnd(startNode, 0);

                        mceSelection.setRng(range);
                        AJS.log("confluence-editor/tinymce3/plugins/tablecontentwrapper/editor_plugin_src: fixCursorPosition()");
                    }
                }

                function saveBookmark() {
                    AJS.log("confluence-editor/tinymce3/plugins/tablecontentwrapper/editor_plugin_src: saveBookmark()");
                    return mceSelection.getBookmark();
                }

                function restoreBookmark(bookmark) {
                    AJS.log("confluence-editor/tinymce3/plugins/tablecontentwrapper/editor_plugin_src: restoreBookmark()");
                    mceSelection.moveToBookmark(bookmark);
                    /**
                     * we dont want to touch code of 'confluence-editor/atlassian-editor-bookmark-manager'
                     * we storeBookmark again, so that other module can restoreBookmark correctly
                     */
                    AJS.Rte.BookmarkManager.storeBookmark();
                }

                var node = mceSelection.getNode();
                var $node = $(node);
                //dont wrap anything inside nested table
                if (node && $node.closest("table.confluenceTable").not("table.confluenceTable table.confluenceTable").length) {
                    fixCursorPosition($node);

                    var $currentCell = $node.closest("table.confluenceTable > tbody > tr > th, table.confluenceTable > tbody > tr > td, table.confluenceTable > thead > tr > th");
                    var bookmark;

                    if ($currentCell.find(elementsToWrap).length) {
                        var $directWrapper = $currentCell.find("> .content-wrapper");
                        if (!$directWrapper.length) {
                            if ($currentCell.find("> p").length) {
                                bookmark = saveBookmark($node);
                                $currentCell.wrapInner(contentWrapper);
                                restoreBookmark(bookmark);
                            } else {
                                bookmark = saveBookmark($node);
                                /**
                                 * <p> is the fundamental element to seperate lines and wrap inline element (e.g <img>, <span>)
                                 * missing it will lead to unexpected behavior of tinyMCE
                                 */
                                $currentCell.wrapInner("<p/>").wrapInner(contentWrapper);
                                restoreBookmark(bookmark);
                            }
                        } else {
                            bookmark = saveBookmark($node);
                            mergeManyWrappers($directWrapper);
                            restoreBookmark(bookmark);
                        }
                    }
                }

                // Remove empty wrapper
                $(ed.getWin().document).find(".content-wrapper:empty").remove();
            });
        },

        getInfo: function () {
            return {
                longname: "Table Content Wrapper Plugin",
                author: "Atlassian",
                authorurl: "http://www.atlassian.com",
                version: "1.0"
            };
        }
    };
});

require("confluence/module-exporter").safeRequire("confluence-editor/tinymce3/plugins/tablecontentwrapper/editor_plugin_src", function (TableContentWrapper) {
    var tinymce = require("tinymce");
    var AJS = require("ajs");

    if (AJS.DarkFeatures.isEnabled("confluence.table.resizable")) {
        tinymce.create("tinymce.plugins.TableContentWrapperPlugin", TableContentWrapper);
        tinymce.PluginManager.add("tableContentWrapper", tinymce.plugins.TableContentWrapperPlugin);
    }
});