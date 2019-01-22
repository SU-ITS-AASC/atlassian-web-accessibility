define('confluence-editor/loader/collaborative-helper', [
    'jquery',
    'ajs',
    'confluence/meta',
    'confluence/legacy'
], function ($,
             AJS,
             Meta,
             Confluence) {
    "use strict";

    //TODO Update port cloud for 6.3

    var collaborativePlugin;
    var collaborativePluginPromise = $.Deferred();

    function getStatus() {
        return Meta.get('collaborative-editor-status');
    }

    function isCollaborativeEditingAvailable(_content) {
        var content = _content || {};

        var id = content.id || Confluence.getContentId();
        var contentType = content.type || Meta.get('content-type');
        var editMode = content.editMode || Meta.get('edit-mode');

        var entityExists = id && id !== '0';
        var collaborativeMode = editMode === 'collaborative';

        return collaborativeMode && (contentType === 'page' || contentType === 'blogpost') && entityExists;
    }

    function registerPlugin(_collaborativePlugin) {
        collaborativePlugin = _collaborativePlugin;
        collaborativePluginPromise.resolve();
    }

    function getEditorContent() {
        // If the editor is in fake mode which is used in tests that use the collaborative editor, but don't connect to a proper synchrony, fall back to the old way of getting content
        return collaborativePluginPromise.pipe(function () {
            if (isCollaborativeEditingAvailable() && getStatus() !== 'fake') {
                return collaborativePlugin.getSynchronisedEditorContent();
            } else {
                return {
                    content: AJS.Rte.getEditor().getContent()
                };
            }
        });
    }

    return {
        registerPlugin: registerPlugin,
        isCollaborativeEditingAvailable: isCollaborativeEditingAvailable,
        getEditorContent: getEditorContent
    };
});