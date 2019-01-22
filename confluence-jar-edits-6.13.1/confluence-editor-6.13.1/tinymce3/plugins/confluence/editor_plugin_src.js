/**
 * Confluence TinyMCE plugin. Creates controls and commands for:
 * - inserting images
 * - macro browser
 * - unlinking
 *
 * TODOXHTML: clean this up and split into separate TinyMCE plugins
 *
 * @module confluence-editor/tinymce3/plugins/confluence/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/confluence/editor_plugin_src', [
    'jquery',
    'ajs',
    'confluence/legacy',
    'tinymce'
], function(
    $,
    AJS,
    Confluence,
    tinymce
) {
    "use strict";

    return {
        init : function(ed, url) {
            ed.addCommand("mceConfUnlink", function (ui, val) {
                var ed = AJS.Rte.getEditor();
                var s = ed.selection;
                var n = val || s.getNode();
                var $n = $(n);

                if (n.nodeName !== 'A') {
                    var parent = $n.closest("a");
                    if (!parent.length) {
                        return;
                    }
                    n = parent[0];
                    $n = parent;
                }

                var href = $n.attr("href");
                if (!href) { // fix broken links before attempting to unlink
                    href = "#";
                    $n.attr("href", href);
                }
                // unlinking external links requires wrapping it a span with a class
                // so we don't automatically convert them to links on the server
                var removeTrailingSlash = function (text) {
                    var trailingSlashRegexResult = /(.*)[\/]$/.exec(text);
                    return trailingSlashRegexResult != null ? trailingSlashRegexResult[1] : text;
                };
                if (!$n.attr("data-linked-resource-id") && Confluence.Link.isExternalLink(href) && $n.text() == removeTrailingSlash(href)) {
                    var span = ed.dom.create("span", {"class": "nolink"}, href);
                    ed.dom.replace(span, n, false);
                }
                else {
                    s.select(n);
                    // Firefox doesn't remove link classes when it unlinks so we remove them manually
                    $n.removeClass("createlink unresolved confluence-link user-mention confluence-userlink current-user-mention");
                    ed.execCommand("UnLink");
                }
            });

            // Register buttons
            ed.addButton("confimage", {title : "confluence.confimage_desc", cmd : "mceConfimage"});
            ed.addButton("conf_macro_browser", {title : "confluence.conf_macro_browser_desc", cmd : "mceConfMacroBrowser"});
        },

        getInfo : function () {
            return {
                longname : "Confluence TinyMCE Plugin",
                author : "Atlassian",
                authorurl : "http://www.atlassian.com",
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };
});

require('confluence/module-exporter').safeRequire('confluence-editor/tinymce3/plugins/confluence/editor_plugin_src', function(ConfluencePlugin) {
    var tinymce = require('tinymce');

    // Register commands and onclicks
    tinymce.create('tinymce.plugins.ConfluencePlugin', ConfluencePlugin);

    // Register plugin
    tinymce.PluginManager.add("confluence", tinymce.plugins.ConfluencePlugin);
});
