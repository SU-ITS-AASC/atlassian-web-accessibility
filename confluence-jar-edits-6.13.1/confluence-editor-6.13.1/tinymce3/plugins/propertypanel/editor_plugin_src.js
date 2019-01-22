/**
 * Confluence property panels for images and links.
 *
 * @module confluence-editor/tinymce3/plugins/propertypanel/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/propertypanel/editor_plugin_src', [
    'jquery',
    'ajs',
    'document',
    'tinymce'
], function(
    $,
    AJS,
    document,
    tinymce
) {
    "use strict";

    var handlers = [];
    AJS.bind("add-handler.property-panel", function (e, data) {
        data && handlers.push(data);
    });

    return {
        init : function(ed) {
            /*
             A single selection event might have several contexts:
             - No current property panel
             -- Selected element that DOESN'T fire a panel
             -- Selected element that DOES fire a panel
             - Current property panel
             -- Selected element that DOESN'T fire a panel
             -- Selected element that DOES fire a panel
             --- Selected the anchor of the CURRENT property panel
             --- Selected a different element that DOES fire a panel
             ---- Selected a different element that DOES fire a panel of the SAME type
             ---- Selected a different element that DOES fire a panel of a DIFFERENT type

             To begin with it will be the responsibility of the element-specific code (img/a/etc) to determine the context;
             if enough overlap between IMG and A is found it can be centralized here.
             */
            AJS.debug("init property panel plugin");
            var boundElement;
            var isToolBarShowing = function() {
                return !!$(".toolbar-contextual").length;
            };
            var isElementInTable = function(el) {
                return !!el.closest("table:not(.wysiwyg-macro,.editor-inline-macro)").length;
            };
            var isRightClick = function (e) {
                if (e.type != "click") { return false; }
                if (e.which) { return (e.which === 3); }
                if (e.button) { return (e.button == 2); }
            };
            var getClosestAnchor = function($element) {
                if ($element.is("img")) {
                    return $element[0];
                }

                // WTF - everything is pluggable but this...
                var closest = $element.closest("a,table,.wysiwyg-macro,.editor-inline-macro,.text-placeholder");
                if (closest.length) {
                    return closest[0];
                }

                return "";
            };
            var handler = function (ed, e, focusedEl) {
                var data = {
                    focusedEl: focusedEl,
                    focusedNodeName: focusedEl.nodeName && focusedEl.nodeName.toLowerCase(),
                    ed: ed,
                    e: $.extend({},e) //lookds odd, but is needed for what appears to be a GC bug in ie8/9
                };
                var containerEl = getClosestAnchor($(focusedEl));
                var isInTable = isElementInTable($(focusedEl));
                var toolbarActive = isToolBarShowing();
                data.containerEl = containerEl;

                AJS.trigger("user-blurred-rte-element", data);
                if (containerEl && !isRightClick(e) && !isPanelShowing() &&  AJS.Confluence.PropertyPanel.shouldCreate) {
                    for (var i = 0, len = handlers.length; i < len; i++) {
                        if (handlers[i].canHandleElement($(containerEl))) {
                            if(toolbarActive || !isInTable) {
                                return handlers[i].handle(data);
                            }
                            //this now means that you get no return.
                            //if this becomes a problem we could use a promise
                            (function(handler) {
                                $(document).bind("shown.contextToolbar",function(e) {
                                    handler.handle(data);
                                });
                            })(handlers[i]);
                        }
                    }
                }
            };
            var isPanelShowing = function () {
                return !!AJS.Confluence.PropertyPanel.current;
            };

            /* All versions of IE apply drag/resize handles
             * (those white dots along the edges of elements)
             * to select elements in contentEditable regions that prevent the normal click
             * event from propagating.
             * Here, we're going to work around that fact.
             */
            if(tinymce.isIE) {
                ed.onMouseDown.add(function(ed, e) {
                    // Avoid memory leaks; kill any previous bound events.
                    // Bound to a custom namespace to avoid clobbering other click events.
                    boundElement && boundElement.unbind('mouseup.IEDragHandlesWorkaround');
                    boundElement = $(e.target);
                    // IE's drag/resize handles are applied to tables and images.
                    boundElement.filter("img, table").bind('mouseup.IEDragHandlesWorkaround', function() {
                        handler(ed, e, e.target);
                    });
                });
            }

            AJS.bind("trigger.property-panel", function(e, data) {
                handler(ed, e, data.elem);
            });

            ed.onClick.add(function(ed, e) {
                handler(ed, e, e.target);
            });
            ed.onKeyUp.addToTop(function (ed,e,o) {
                if (e.keyCode === 27) { return; } // ignore esc, it's handled by keydown listener
                handler(ed, e, ed.selection.getNode());
            });
            ed.onContextMenu.add(function() { // destroy property panel when a context menu is shown
                AJS.Confluence.PropertyPanel.destroy();
            });

            AJS.bind("user-blurred-rte-element", function (e, data) {
                if (isPanelShowing()) {
                    if (!data.containerEl || AJS.Confluence.PropertyPanel.current.hasAnchorChanged(data.containerEl)) {
                        AJS.Confluence.PropertyPanel.destroy();
                    } else {
                        AJS.trigger("same-anchor.property-panel");
                    }
                }
            });
            AJS.bind("created.property-panel", function (e, data) {
                // Need to defer (for IE) and activating the property panel can cause an initial scroll event to fire that we want to miss.
                setTimeout(function() {
                    AJS.Rte.bindScroll("property-panel", function (e) {
                        AJS.Confluence.PropertyPanel.destroy();
                    });
                }, 0);
                $(ed.getDoc()).bind("keydown.property-panel.escape", function (e) {
                    if (e.keyCode === 27 && isPanelShowing()) { // esc key
                        AJS.Confluence.PropertyPanel.destroy();
                    }
                });
            });
            AJS.bind("destroyed.property-panel", function (e, data) {
                AJS.Rte.unbindScroll("property-panel");
                $(ed.getDoc()).unbind("keydown.property-panel.escape");
            });
        },

        getInfo : function() {
            return {
                longname : 'Image, Link and Macro Property Panels',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };
});

require('confluence/module-exporter')
        .safeRequire('confluence-editor/tinymce3/plugins/propertypanel/editor_plugin_src', function(PropertyPanelPlugin) {
            var tinymce = require('tinymce');

            tinymce.create('tinymce.plugins.PropertyPanel', PropertyPanelPlugin);

            // Register plugin
            tinymce.PluginManager.add('propertypanel', tinymce.plugins.PropertyPanel);
        });