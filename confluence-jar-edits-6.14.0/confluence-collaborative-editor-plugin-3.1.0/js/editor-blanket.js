define('confluence-collaborative-editor-plugin/editor-blanket', [
    'ajs',
    'jquery',
    'confluence/meta',
    'confluence-editor/support/atlassian-editor-support'
], function (
    AJS,
    $,
    Meta,
    EditorSupport
) {
    'use strict';

    var blanketProps = {};

    /**
     * Block the whole Editor with a pre-styled overlay
     * @param type blanket style: block/loading (default to loading)
     */
    function showBlanket(type) {
        switch (type) {
            case 'block':
                blanketProps.cssClass4Form = 'editor-block';
                blanketProps.ariaType4Form = 'aria-disabled';
                blanketProps.cssClass4EditorToolbar = '';
                break;
            default:
                blanketProps.cssClass4Form = 'editor-loading editor-loading-spinner';
                blanketProps.ariaType4Form = 'aria-busy';
                blanketProps.cssClass4EditorToolbar = 'editor-loading';
                break;
        }
        //only one of these should exist
        var pageForm = $('#editpageform, #createpageform');
        pageForm.addClass(blanketProps.cssClass4Form);
        pageForm.attr(blanketProps.ariaType4Form, true);
        $('#content-title').attr('tabindex', -1);
        $('#wysiwygTextarea_ifr').attr('tabindex', -1);
        $('.aui-toolbar2-primary').addClass(blanketProps.cssClass4EditorToolbar);
    }

    function hideBlanket() {
        var pageForm = $('#editpageform, #createpageform');
        pageForm.removeClass(blanketProps.cssClass4Form);
        pageForm.attr(blanketProps.ariaType4Form, false);
        $('#rte').css('opacity', 1).addClass('editor-blanket-ease-in');
        $('#content-title').attr('tabindex', 1);
        $('#wysiwygTextarea_ifr').attr('tabindex', 100);
        $('#content-title-div').css('opacity', 1).addClass('editor-blanket-ease-in');
        $('.aui-toolbar2-primary').removeClass(blanketProps.cssClass4EditorToolbar);
        //reset state
        blanketProps = {};
    }

    function showEditor() {
        $('#rte').css('opacity', 1);
        $('#content-title-div').css('opacity', 1);
    }

    function applyBlanket(liftPromise) {
        if (EditorSupport.isCollaborativeContentType()
            && liftPromise.state() === 'pending') {
            // show a comfort blanket till synchrony has bound and set editor contents
            showBlanket();
            liftPromise.done(hideBlanket);
        } else {
            showEditor();
        }
    }

    return {
        applyBlanket: applyBlanket,
        showEditor: showEditor,
        showBlanket: showBlanket
    };
});
