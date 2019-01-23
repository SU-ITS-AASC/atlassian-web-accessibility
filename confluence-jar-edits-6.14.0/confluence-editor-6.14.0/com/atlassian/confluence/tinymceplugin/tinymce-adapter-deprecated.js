/**
 * @module confluence-editor/tinymceplugin/tinymce-adapter-deprecated
 */
define('confluence-editor/tinymceplugin/tinymce-adapter-deprecated', [
    'tinymce',
    'ajs',
    'confluence/legacy',
    'jquery'
], function(
    tinymce,
    AJS,
    Confluence,
    $
) {
    "use strict";

    return {
        /**
         * Used for selenium tests apparently.
         * @deprecated since 4.0 this doesn't work properly across all the browsers
         */
        putCursorAtPostionInElement : function (selector, position, node) {
            var ed = tinymce.activeEditor;
            var doc = ed.getDoc();

            // need the #text node inside the selected element, so filter the child nodes of the selector
            var el = $(selector, node || doc);
            el = el.contents().filter(function(){ return this.nodeType === 3; })[0];
            var range = ed.selection.getRng(true);
            range.setStart(el, position);
            range.setEnd(el, position);
            ed.selection.setRng(range);
        },

        /**
         * Stores the currently selected range and scroll position of the editor so we can get back to to it later.
         * @deprecated since 4.0 use AJS.Rte.BookmarkManager.storeBookmark();
         */
        storeCurrentSelectionState : AJS.Rte.BookmarkManager.storeBookmark,

        /**
         * Moves the scroll position and selected range in the editor back to where it used to be.
         * @deprecated since 4.0 use AJS.Rte.BookmarkManager.restoreBookmark();
         */
        restoreSelectionState : AJS.Rte.BookmarkManager.restoreBookmark,


        /**
         * @deprecated Since 4.0. Call Confluence.Editor.LinkUtils.insertLink directly.
         */
        insertLink: function (linkObj, existingLinkNode) {
            // Note: we call the method instead of assigning it directly because
            // Confluence.Editor.LinkUtils might not exist when Confluence.Editor.Adapter
            // is created.
            if (existingLinkNode) {
                AJS.Rte.getEditor().selection.select(existingLinkNode);
            }
            Confluence.Editor.LinkAdapter.setLink(linkObj);
        },

        /**
         * gets the base url from the current location.
         * @deprecated use AJS.Rte.getCurrentBaseUrl()
         */
        getCurrentBaseUrl : AJS.Rte.getCurrentBaseUrl,

        /**
         * Adds a callback that will be executed after this editor instance has been initialised.
         * @param callback
         * @deprecated since 4.1 use AJS.Rte.BootstrapManager.addOnInitCallback
         */
        addOnInitCallback: function(callback) {
            AJS.debug("Adding callback to AJS.Rte.BootstrapManager. AJS.Rte.BootstrapManager = " + AJS.Rte.BootstrapManager);
            AJS.Rte.BootstrapManager.addOnInitCallback(callback);
        },

        /**
         * Binds a namespaced callback to the editor scroll event.
         * @param namespace used for unbinding e.g. property-panel
         * @param callback the function to run when the event occurs
         * @deprecated since 4.1 use AJS.Rte.bindScroll
         */
        bindScroll: function(namespace, callback) {
            AJS.Rte.bindScroll(namespace, callback);
        },

        /**
         * Unbinds a namespace bound to the RTE window scroll event
         * @param namespace
         * @deprecated since 4.1 use AJS.Rte.unbindScroll
         */
        unbindScroll: function(namespace) {
            AJS.Rte.unbindScroll(namespace);
        },

        /**
         * @deprecated since 4.1, use AJS.Rte.BootstrapManager.isInitComplete();
         */
        getTinyMceHasInit: function () {
            return AJS.Rte.BootstrapManager.isInitComplete();
        },

        /**
         * Returns the current active editor
         * @deprecated use AJS.Rte.getEditor()
         */
        getEditor : AJS.Rte.getEditor,

        /**
         * @deprecated since 4.1 use AJS.Rte.BootstrapManager.addTinyMcePluginInit
         */
        addTinyMcePluginInit: function(func) {
            AJS.Rte.BootstrapManager.addTinyMcePluginInit(func);
        },

        /**
         * @deprecated since 4.1 use Confluence.Link.isExternalLink
         */
        isExternalLink: function(destination) { //Same check as ConfluenceLinkResolver
            return Confluence.Link.isExternalLink(destination);
        },

        /**
         * @deprecated since 4.1 use tinymce.confluence.MacroUtils.isInMacro
         */
        isInMacroPlaceholder: function (node) {
            return tinymce.confluence.MacroUtils.isInMacro(node);
        },

        /**
         * @deprecated since 4.1 Not sure what this used for try: AJS.Rte.BootstrapManager.preInitialise(settings)
         * followed by AJS.Rte.BootstrapManager.initialise()
         */
        initialiseTinyMce : function() {
            var t = AJS.Editor.Adapter;
            tinymce.EditorManager.preInit.apply(tinymce.EditorManager);
            tinymce.EditorManager.init(t.settings);
        },

        /**
         * Returns the offset of the element in relation to the parent frame.
         * @param element
         * @deprecated since 4.1 Use AJS.Rte.Content.offset
         */
        offset: function (element) {
            AJS.Rte.Content.offset(element);
        },

        /**
         * Returns the text currently selected in the RTE
         * @deprecated since 4.1 Use AJS.Rte.Content.getSelectedText
         */
        getSelectedText : function(){
            return AJS.Rte.Content.getSelectedText();
        },

        /**
         * put the text in newValue into the editor. This is called when the editor needs new
         * content -- it is *not* called to set the initial content. That should be done either by providing the
         * editor with the content as part of the initial HTML, or by calling javascript from editorOnLoad()
         * @param newValue the html to set the content to.
         * @deprecated since 4.1 user AJS.Rte.Content.setHtml
         */
        setEditorValue : function (newValue) {
            AJS.Rte.Content.setHtml(newValue);
        },


        /**
         * @return the current HTML contents of the editor. This *must* return a JavaScript string,
         * not a JavaObject wrapping a java.lang.String
         * @deprecated since 4.1 use AJS.Rte.Content.getHtml
         */
        getEditorHTML : function () {
            return "" + AJS.Rte.getEditor.getContent();
        },

        /**
         * @returns true if the contents of the editor has been modified by the user since
         * the last time editorResetContentChanged()
         * @deprecated since 4.1 use AJS.Rte.Content.editorHasContentChanged
         */
        editorHasContentChanged : function () {
            return AJS.Rte.getEditor().isDirty();
        },

        /**
         * Resets the contents change indicator
         * @deprecated since 4.1 use AJS.Rte.Content.editorResetContentChanged
         */
        editorResetContentChanged : function () {
            AJS.Rte.getEditor().setDirty(false);
        },

        /**
         * Finds the index of the supplied childNode in the parentNode
         * @returns the index of the child node in the parent node. If the child
         * cannot be found in the parent -1 is returned.
         * @deprecated since 4.1 use AJS.Rte.Content.getChildIndex
         */
        getChildIndex: function(parentNode, childNode) {
            var children = parentNode.childNodes;
            for (var i = 0, len = children.length; i < len; i++) {
                if (children[i] == childNode) {
                    return i;
                }
            }
            return -1;
        },

        /**
         * @returns a reference to the main editor instance.
         * @deprecated since 4.1 use AJS.Rte.getMainEditor
         */
        getMainEditor: function () {
            return AJS.Rte.getMainEditor();
        },

        /**
         * @returns the element atlassian draws the editor into
         * @deprecated since 4.1 use AJS.Rte.getEditorContainer
         */
        getEditorContainer : function () {
            return AJS.Rte.getEditorContainer();
        },

        /**
         * @returns the iframe containing the current active editor
         * @deprecated since 4.1 use AJS.Rte.getEditorFrame
         */
        getEditorFrame: function() {
            return AJS.Rte.getEditorFrame();
        },
        /**
         * @returns a jquery object containing a table that houses the current active editor iframe
         * @deprecated since 4.1 use AJS.Rte.getEditorTable
         */
        getEditorTable: function() {
            return AJS.Rte.getEditorTable();
        },

        /**
         * @deprecated since 4.1 use AJS.Rte.webResourcePath
         */
        webResourcePath : AJS.Rte.webResourcePath,

        /**
         * @returns the static resource url prefix, which will include the caching headers
         * @deprecated since 4.1 use AJS.Rte.getResourceUrlPrefix
         */
        getResourceUrlPrefix : function() {
            return AJS.Rte.getResourceUrlPrefix();
        },

        /**
         * @returns the absolute url path to the tinymce web resources, which will include the caching headers
         * @deprecated since 4.1 use AJS.Rte.getTinyMceBaseUrl
         */
        getTinyMceBaseUrl : function() {
            return AJS.Rte.getTinyMceBaseUrl();
        },

        /**
         * @deprecated since 4.1 use AJS.Rte.getMinEditorHeight
         */
        getMinEditorHeight: function() {
            return AJS.Rte.getMinEditorHeight();
        },

        /**
         * Returns the total height of the editor including the toolbar and anything in the header.
         * @param extraHeight
         * @deprecated since 4.1 use AJS.Rte.getTinyMceEditorMinHeight
         */
        getTinyMceEditorMinHeight: function(extraHeight) {
            return AJS.Rte.getTinyMceEditorMinHeight(extraHeight);
        }
    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/tinymceplugin/tinymce-adapter-deprecated', 'AJS.Editor.Adapter');
