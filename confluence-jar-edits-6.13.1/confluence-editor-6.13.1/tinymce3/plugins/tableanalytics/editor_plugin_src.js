/**
 * Send analytics events relating to actions on table
 * @module confluence-editor/tinymce3/plugins/tableanalytics/editor_plugin_src
 */
define("confluence-editor/tinymce3/plugins/tableanalytics/editor_plugin_src", [
    "jquery",
    "ajs",
    "tinymce"
], function ($, AJS, tinymce) {
    "use strict";

    var editor;

    return {
        init: function (ed, url) {
            var t = this;
            editor = ed;
            ed.onExecCommand.add(function (ed, cmd, ui, val) {
                switch (cmd) {
                    case "mceAutoWidth":
                    case "mceRelativeWidth":
                    case "mceFixedWidth":
                        t._onChangeTableMode();
                        break;
                    case "mceTableCopyRow":
                        t._onCopyRow();
                        break;
                    case "mceTablePasteRowBefore":
                    case "mceTablePasteRowAfter":
                        t._onPasteRow();
                        break;
                    case "mceTableCopyCol":
                        t._onCopyCol();
                        break;
                    case "mceTablePasteColBefore":
                    case "mceTablePasteColAfter":
                        t._onPasteCol();
                        break;
                    //copy-paste
                    case "mceInsertContent":
                        t._onInsertContent(val);
                        break;
                }
            });

            //insert image by drag-drop OR via dialog OR using "!"
            ed.onInit.add(function () {
                ed.selection.onSetContent.add(function (selection, args) {
                    if (t._isInsideTable() && args) {
                        t._onSetContent(args);
                    }
                });
            });

            //listen to analyticsEvent which is fired when resizing image
            AJS.bind("analyticsEvent", function (e, data) {
                if (t._isInsideTable()) {
                    t._onResizeImg(data);
                }
            });

            //listen to reliable save success
            AJS.bind("rte.safe-save.success", function () {
                t._onSavePage();
            });
        },

        _onChangeTableMode: function () {
            AJS.Confluence.Analytics.publish(
                    "confluence.table.mode.to." + this._getTableMode(),
                    {pageId: AJS.Meta.get("page-id")}
            );
        },

        _onCopyRow: function () {
            AJS.Confluence.Analytics.publish(
                    "confluence.table.row.copy",
                    {pageId: AJS.Meta.get("page-id")}
            );
        },

        _onPasteRow: function () {
            AJS.Confluence.Analytics.publish(
                    "confluence.table.row.paste",
                    {pageId: AJS.Meta.get("page-id")}
            );
        },

        _onCopyCol: function () {
            AJS.Confluence.Analytics.publish(
                    "confluence.table.col.copy",
                    {pageId: AJS.Meta.get("page-id")}
            );
        },

        _onPasteCol: function () {
            AJS.Confluence.Analytics.publish(
                    "confluence.table.col.paste",
                    {pageId: AJS.Meta.get("page-id")}
            );
        },

        /**
         * Send analytics if an image is pasted into a table
         * @param insertContent
         * @private
         */
        _onInsertContent: function (insertContent) {
            /**
             * CONFDEV-37491
             * insertContent might be special chars OR html
             * to avoid error "Syntax error, unrecognized expression", create a <div> and set content using .html()
             */
            var $container = $("<div/>").html(insertContent);

            //check if image is pasted into a table
            if ($container.find("img").length && this._isInsideTable()) {
                this._eventInsertImage();
            }

            //check if table is pasted
            if ($container.find("table.confluenceTable").length) {
                AJS.Confluence.Analytics.publish(
                        "confluence.table.paste",
                        {pageId: AJS.Meta.get("page-id")}
                );
            }
        },

        _onSetContent: function (args) {
            if ($("<div/>").html(args.content).find(".confluence-embedded-image")) {
                this._eventInsertImage();
            }
        },

        _onResizeImg: function (data) {
            var isImgBiggerThanCell = function () {
                var $img = $(editor.selection.getNode());
                var $cell = $img.closest("th, td");
                return $img.width() > $cell.width();
            };
            if (data && data.name && data.name.indexOf("confluence.editor.image.resize") >= 0) {
                AJS.Confluence.Analytics.publish(
                        "confluence.table.img.resize",
                        {
                            pageId: AJS.Meta.get("page-id"),
                            tableMode: this._getTableMode(),
                            isImgBiggerCell: isImgBiggerThanCell()
                        }
                );
            }
        },

        _eventInsertImage: function () {
            AJS.Confluence.Analytics.publish(
                    "confluence.table.image.insert",
                    {
                        pageId: AJS.Meta.get("page-id"),
                        tableMode: this._getTableMode()
                    }
            );
        },

        _isInsideTable: function () {
            return !!$(editor.selection.getNode()).closest("table.confluenceTable").length;
        },

        _getTableMode: function () {
            var $table = $(editor.selection.getNode()).closest("table.confluenceTable");
            if ($table.hasClass("fixed-table")) {
                return "fixed";
            }
            if ($table.hasClass("relative-table")) {
                return "relative";
            }
            return "fluid";
        },

        _onSavePage: function () {
            //get all tables in the page
            var $tables = $(editor.getBody()).find("table.confluenceTable");
            AJS.Confluence.Analytics.publish(
                    "confluence.table.quality.in.page",
                    {
                        pageId: AJS.Meta.get("page-id"),
                        total: $tables.length,
                        fixed: $tables.filter(".fixed-table").length,
                        fluid: $tables.filter(":not(.fixed-table,.relative-table)").length,
                        relative: $tables.filter(".relative-table").length,
                        nested: $tables.find("table.confluenceTable").length
                    }
            );
        },

        getInfo: function () {
            return {
                longname: "Table Analytics Plugin",
                author: "Atlassian",
                authorurl: "http://www.atlassian.com",
                version: "1.0"
            };
        }
    };
});

require("confluence/module-exporter").safeRequire("confluence-editor/tinymce3/plugins/tableanalytics/editor_plugin_src", function (TableAnalytics) {
    var tinymce = require('tinymce');

    tinymce.create("tinymce.plugins.TableAnalytics", TableAnalytics);
    tinymce.PluginManager.add("tableAnalytics", tinymce.plugins.TableAnalytics);
});