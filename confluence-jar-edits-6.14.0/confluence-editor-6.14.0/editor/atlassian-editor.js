define('confluence-editor/editor/atlassian-editor', [
    'tinymce',
    'ajs',
    'jquery',
    'window',
    'document'
], function(
    tinymce,
    AJS,
    $,
    window,
    document
) {
    "use strict";

    var browserVersion = parseInt($.browser.version, 10);

    /**
     * When given an html element or jquery element:
     * - normalise to the html element,
     * - switch to the parent for text or <br>
     * - filter out document nodes
     * - return the element or return null for documents or null
     */
    function asHtmlElementWithHeightOrNull(element) {
        element = element && element.jquery ? element[0] : element;
        if (!element) { return false; }

        if (element.tagName === "BR" || element.nodeType === 3) { // Node.TEXT_NODE = 3
            element = element.parentNode; // No height on a BR or text nodes, so get parent
        }
        if (element && element.nodeType === 9) { // Node.DOCUMENT_NODE = 9
            element = null; // disallow the document element
        }
        return element;
    }

    /**
     * @exports confluence-editor/editor/atlassian-editor
     */
    var AtlassianEditor = {};

    /**
     * @namespace
     */
    AtlassianEditor.Rte = {
        // Used to ensure that a TextNode exists under the search-text span when the ranges are set.
        HIDDEN_CHAR: "\ufeff",
        ZERO_WIDTH_WHITESPACE: "&#x200b;",

        editorId : "wysiwygTextArea",

        isQuickEdit: false,

        /**
         * Returns the current active editor
         */
        getEditor : function () {
            return tinymce.activeEditor;
        },

        /**
         * Gets the base url from the current location.
         */
        getCurrentBaseUrl : function() {
            if (!this.currentBaseUrl) {
                var l = document.location;
                this.currentBaseUrl = l.protocol + "//" + l.hostname + (l.port ? ":" + l.port : "");
            }
            return this.currentBaseUrl;
        },

        /**
         * Scrolls the current editor selection if not visible, or completely visible.
         *
         * @param afterShown function to call after selection becomes visible
         */
        showSelection: function(afterShown) {
            AJS.Rte.showElement(tinymce.activeEditor.selection.getStart(), afterShown);
        },

        /**
         * Returns true if an element is visible at all.
         *
         * @param element an HTML element or jquery element.
         */
        isAnyPartShown: function(element) {
            element = asHtmlElementWithHeightOrNull(element);
            if(!element) {
                AJS.debug('AJS.Rte.isAnyPartShown: no element to find');
                return false;
            }

            var $element = $(element);
            var elementTop = $element.offset().top;
            var elementBottom = elementTop + $element.outerHeight();
            var viewTop = $(AJS.Rte.getEditor().getDoc()).scrollTop();
            var viewBottom = viewTop + $(AJS.Rte.getEditorFrame()).height();

            return elementBottom > viewTop && elementTop < viewBottom;
        },

        /**
         * Scrolls to an element if not visible, or completely visible
         *
         * @param e an HTML element
         * @param afterShown function to call after element becomes visible
         */
        showElement: function(e, afterShown) {
            var checkNode = asHtmlElementWithHeightOrNull(e);

            if(!checkNode) {
                AJS.log('AJS.Rte.showElement: no element to show - skipping');
                return false;
            }

            var $e = $(checkNode);
            var ed = AJS.Rte.getEditor();
            var doc = $(ed.getDoc());
            var top = $e.offset().top;
            var bottom = top + $e.outerHeight();
            var viewTop = doc.scrollTop();
            var viewBottom = viewTop + $(AJS.Rte.getEditorFrame()).height();
            var bindAfterShown = function() {
                AJS.Rte.bindScroll("AJS.Rte.showElement", function() {
                    AJS.Rte.unbindScroll("AJS.Rte.showElement");
                    // defer so to run outside of this event handler (required for property panel on added images)
                    setTimeout(afterShown, 1); // ATLASSIAN CONFDEV-6400 timeout value of 1 rather than 0
                });
            };

            if(top < viewTop) {
                AJS.Rte.scrollTo(top);
                afterShown && bindAfterShown();
            } else if(bottom > viewBottom) {
                AJS.Rte.scrollTo(Math.min(top, viewTop + bottom - viewBottom));
                afterShown && bindAfterShown();
            } else {
                afterShown && afterShown();
            }
        },

        scrollTo : function (pos) {
            var ed = AJS.Rte.getEditor();
            pos = Math.ceil(pos); //Normalise the number that will be scrolled to. (FF rounds / Webkit only rounds up)
            $(ed.getDoc()).scrollTop(pos);
        },
        /**
         * Binds a namespaced callback to the editor scroll event.
         * @param namespace used for unbinding e.g. property-panel
         * @param callback the function to run when the event occurs
         */
        bindScroll: function(namespace, callback) {
            var ed = AJS.Rte.getEditor();
            $(document).add(ed.getDoc()).add(ed.getWin()).bind("scroll." + namespace, callback);
        },

        /**
         * Unbinds a namespace bound to the RTE window scroll event
         * @param namespace
         */
        unbindScroll: function(namespace) {
            var ed = AJS.Rte.getEditor();
            $(document).add(ed.getDoc()).add(ed.getWin()).unbind("scroll." + namespace);
        },

        /**
         * @returns a reference to the main editor instance.
         * @deprecated since 4.1 use AJS.Rte.getEditor
         */
        getMainEditor: function () {
            var e = tinymce.EditorManager.editors[AJS.Rte.editorId];
            if (!e) {
                throw new Error("Main editor has not been initialised yet and is therefore not accessible via tinymce.EditorManager.editors");
            }
            return e;
        },

        /**
         * @returns the element atlassian draws the editor into
         */
        getEditorContainer : function () {
            return $("#wysiwyg");
        },

        /**
         * @returns the iframe containing the current active editor
         */
        getEditorFrame: function() {
            return $("#" + AJS.Rte.getEditor().id + "_ifr")[0];
        },

        /**
         * @returns a jquery object containing a table that houses the current active editor iframe
         * @deprecated since 4.1 there is no table.
         */
        getEditorTable: function() {
            return $("#" + AJS.Rte.getEditor().id + "_tbl");
        },

        webResourcePath : "/download/resources/com.atlassian.confluence.tinymceplugin%3Atinymceeditor/",

        /**
         * @returns the static resource url prefix, which will include the caching headers
         */
        getResourceUrlPrefix : function() {
            if (!this.resourceUrlPrefix) {
                this.resourceUrlPrefix = this.getCurrentBaseUrl() + AJS.Meta.get('editor-plugin-resource-prefix');
            }
            return this.resourceUrlPrefix;
        },

        /**
         * @returns the absolute url path to the tinymce web resources, which will include the caching headers
         */
        getTinyMceBaseUrl : function() {
            if (!this.absoluteUrl) {
                this.absoluteUrl =  this.getResourceUrlPrefix() + this.webResourcePath + "tinymcesource/";
            }
            return this.absoluteUrl;
        },

        getMinEditorHeight: function() {
            return + AJS.Meta.get('min-editor-height');
        },

        /**
         * Returns the total height of the editor including the toolbar and anything in the header.
         * @param extraHeight
         */
        getTinyMceEditorMinHeight: function(extraHeight) {
            extraHeight = extraHeight || 0;
            var height = AJS.Rte.getMinEditorHeight();
            var chromeHeight = 0;
            if (height) { return height; }

            $("#editor-precursor,#header-precursor,#header").each(function() {
                chromeHeight += $(this).outerHeight(true);
            });
            return ($(window).height() - chromeHeight -  extraHeight);
        },

        /**
         * Firefox seems to have some odd behaviour sometimes around cursor positioning and focus in the editor.
         * Setting the contentEditable off/on seems to re-enforce caret mode in the editor.

         * @deprecated since 5.6
         * @param bookmark
         */
        fixEditorFocus: function(bookmark) {
            AJS.log('WARNING: The fixEditorFocus method has been deprecated and it will be removed in an upcoming Confluence release.');
            if (tinymce.isGecko && !isNaN(browserVersion) && browserVersion < 30) {
                var ed = AJS.Rte.getEditor();
                var b = ed.getBody();

                AJS.log("Fixing FF cursor positioning");

                if(b.contentEditable == "true") {
                    b.contentEditable = false;
                    b.contentEditable = true;
                }
            }
        },

        /**
         * Focus method
         *
         * This is sort of the way tinymce uses to auto_focus (if you set settings.auto_focus)
         * tinymce defers the focus though using a setTimeout, and it uses ed.getBody() instead of ed.dom.getRoot,
         * so we have our own focus function what give us more granular control.
         *
         * @since 5.6
         * @param ed editor
         */
        editorFocus: function (ed) {
            if (!ed || ed.destroyed){
                return;
            }

            function getFocusTarget() {
                var targetNode = ed.dom.getRoot(); // this will get use the default root, so it will be Page Layouts aware.
                if (tinymce.isWebKit && !$(targetNode).parents("body").length){ // CONFDEV-28137
                    // set focus on the first paragraph element.
                    // be aware that this wouldn't work in IE11 for example, since we are not placing any empty paragraph in empty documents (we probably should)
                    targetNode = $(ed.getBody()).find("p:first-child")[0];
                }
                return targetNode;
            }

            var focusNode = getFocusTarget();
            if (focusNode) {
                ed.selection.select(focusNode, 1);
                ed.selection.collapse(1);
                focusNode.focus();
            } else {
                AJS.log("editorFocus was called with an invalid node");
            }

            ed.getBody().focus(); // required for FF
            ed.getWin().focus();
        }

    };

    /**
     * @namespace
     */
    AtlassianEditor.KEYS = {
        /** @constant */
        BACKSPACE: 8,
        /** @constant */
        TAB: 9,
        /** @constant */
        ENTER: 13,
        /** @constant */
        SHIFT: 16,
        /** @constant */
        CTRL: 17,
        /** @constant */
        ALT: 18,
        /** @constant */
        ESCAPE: 27,
        /** @constant */
        LEFT: 37,
        /** @constant */
        UP: 38,
        /** @constant */
        RIGHT: 39,
        /** @constant */
        DOWN: 40,
        /** @constant */
        DELETE: 46,
        /** @constant */
        META: 91 // Command key on OSX, WinKey on Windows.
    };

    return AtlassianEditor;
});

require('confluence/module-exporter').safeRequire('confluence-editor/editor/atlassian-editor', function(AtlassianEditor) {
    var AJS = require('ajs');
    var $ = require('jquery');
    var tinymce = require('tinymce');

    AJS.Rte = $.extend(AtlassianEditor.Rte, AJS.Rte);

    // Extend tinymce's VK space with some more key shortcuts
    tinymce.VK = $.extend(AtlassianEditor.KEYS, tinymce.VK);
});