/**
 * @module confluence-editor/tinymce3/plugins/confcleanup/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/confcleanup/editor_plugin_src', [
    'tinymce',
    'jquery'
], function(
    tinymce,
    $
) {
    return {
        init: function(ed) {
            //CONFDEV-2853/CONFDEV-3594 - When you delete in webkit the there is possibility that a Apple-style-span could be added. Make sure that it is removed.
            if(tinymce.isWebKit) {
                var colorMap = {};
                var getOrCreateMap = function (map, key) {
                    var value = map[key];
                    if (!value) {
                        value = {};
                        map[key] = value;
                    }
                    return value;
                };
                var getFormat = function (span) {
                    var weightMap = colorMap[span.css("color")];
                    var sizeMap;
                    if (weightMap) {
                        sizeMap = weightMap[span.css("font-weight")];
                        if (sizeMap) {
                            return sizeMap[span.css("font-size")];
                        }
                    }

                    return null;
                };

                // CONFDEV-4061 - Map the heading formats to their corresponding styles.
                $("#format-dropdown").find("ul.aui-dropdown li").each(function () {
                    var link = $("a", this);
                    var size = link.css("font-size");
                    var weight = link.css("font-weight");
                    var color = link.css("color");
                    var weightMap = getOrCreateMap(colorMap, color);
                    var sizeMap = getOrCreateMap(weightMap, weight);

                    if (!sizeMap[size]) {
                        sizeMap[size] = $(this).attr("data-format");
                    }
                });

                ed.onNodeChange.add(function(ed, e) {
                    var appleStyleSpans = ed.dom.select('span.Apple-style-span', ed.dom.doc.body);
                    var appleStyleFonts = ed.dom.select('font.Apple-style-span', ed.dom.doc.body);
                    var appleStyle= appleStyleSpans.concat(appleStyleFonts);

                    for(var i=0, ii=appleStyle.length; i<ii; i++) {
                        if (ed.dom.is(appleStyle[i], '[face="mceinline"]')) {
                            break; //don't remove if it's mceinline as tiny places these in and later formats them correctly
                        }

                        var format = getFormat($(appleStyle[i]));
                        //if we find a format to use, replace the span with the format, otherwise, leave the apple-style-span
                        if (format) {
                            var bm = ed.selection.getBookmark();
                            format && ed.dom.remove(appleStyle[i], 1);
                            ed.selection.moveToBookmark(bm);
                            ed.execCommand("FormatBlock", false, format);
                        }
                    }
                });
            }

            // CONFDEV-3864 - Firefox 3.6 creates extra img tags as part of its drag and drop behaviour when dragging
            // an image into the editor, with the src of these tags pointing to the local filesystem. This cleans these img tags up.
            ed.onNodeChange.add(function(ed) {
                var localPrefix = "file:///";
                var images = ed.dom.select('img',  ed.dom.doc.body);
                var numImages = images.length;

                for (var i = 0; i < numImages; i++) {
                    if (images[i].src.substr(0, localPrefix.length) === localPrefix) {
                        ed.dom.remove(images[i]);
                    }
                }
            });

            // HACK - CONFDEV-6230, CONFDEV-6628: remove this if the placement of the cursor in an empty body is fixed in IE9.
            if (tinymce.isIE9) {
                function fillBody(ed) {
                    if (!ed.getBody().childNodes.length) {
                        ed.setContent("<p>\uFEFF</p>");
                    }
                }

                ed.onNodeChange.add(fillBody);
                ed.onSetContent.add(fillBody);
            }
        },

        getInfo: function() {
            return {
                longname: 'ConfluenceCleanupPlugin',
                author: 'Atlassian',
                authorurl: 'http://www.atlassian.com',
                infourl: 'http://www.atlassian.com',
                version: '1.0'
            };
        }
    };
});

require('confluence/module-exporter').safeRequire('confluence-editor/tinymce3/plugins/confcleanup/editor_plugin_src', function(ConfluenceCleanupPlugin) {
    var tinymce = require('tinymce');
    tinymce.create('tinymce.plugins.ConfluenceCleanupPlugin', ConfluenceCleanupPlugin);
    tinymce.PluginManager.add('confluencecleanupplugin', tinymce.plugins.ConfluenceCleanupPlugin);
});
