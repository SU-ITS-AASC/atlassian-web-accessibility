define('confluence-collaborative-editor-plugin/synchrony-content', [
    'jquery',
    'underscore',
    'ajs',
    'confluence/meta',
    'confluence/legacy',
    'confluence-collaborative-editor-plugin/synchrony-util'
], function ($,
             _,
             AJS,
             Meta,
             Confluence,
             Util) {
    'use strict';

    var lastKnownTitle;

    function getSyncRev(syncRev) {
        return syncRev === 'dummy-sync-rev' ? null : syncRev;
    }

    function toSynchronyFormat(title, editorContent) {
        return "<body data-title='" + _.escape(title) + "'>" + editorContent + "</body>";
    }

    function hasError(editorContent) {
        // TODO Is there a better way?
        return !!$('<div>' + editorContent + '</div>').find('.fatal-render-error').length;
    }

    /**
     * Parses an object and retrieves properties related to a content entity.
     *
     * @param data.title - page title
     * @param data.editorContent - the contents of the editor
     * @param data.confRev - the current revision of the entity
     * @param data.syncRev - the revision for the ancestor of the entity
     * @param data.syncRevSource - the source/state of synchrony for the entity
     * @returns {title: *, raw: *, html: *, error: *, confRev: *, syncRev: *, syncRevSource: *} object containing the properties required for synchrony initilisation
     */
    function getContent(data) {
        if (data.syncRevSource === 'limited') {
            return {error: 'limited-mode'};
        }
        var title = data.title;
        var editorContent = data.editorContent;

        return {
            title: title,
            raw: editorContent,
            html: toSynchronyFormat(title, editorContent),
            error: hasError(editorContent),
            confRev: data.confRev,
            syncRev: getSyncRev(data.syncRev),
            syncRevSource: data.syncRevSource
        };
    }

    function isUnpublished() {
        return Util.retrieveMetadata('new-page');
    }

    function isSynchronyContainerTheFirstElement(htmlDoc) {
        return (htmlDoc.firstChild
        && htmlDoc.firstChild.classList
        && htmlDoc.firstChild.classList.contains('synchrony-container')
        // This regex is optional and only added for extra paranoia
        && (/^\s*$/).test(htmlDoc.firstChild.textContent));
    }

    function doesNotHaveAValidCaretContainer(htmlDoc) {
        return !htmlDoc.childNodes.length || (htmlDoc.childNodes.length === 1 && isSynchronyContainerTheFirstElement(htmlDoc));
    }

    function fixTinymceCaretContainer(htmlDoc, editor) {
        if (doesNotHaveAValidCaretContainer(htmlDoc)) {
            // tinymce setContent when supplied with an empty string will default to
            // include an empty paragraph with a bogus br for some browsers or a space for others
            // this will ensure we always have a tinymce caret container
            editor.setContent('');
        }
    }

    function writeTitleToRootElement() {
        var title = $('#content-title').val();
        if (title !== lastKnownTitle) {
            var docFrame = frames['wysiwygTextarea_ifr'];
            var document = docFrame.contentDocument !== undefined ? docFrame.contentDocument : docFrame.document;
            document.body.setAttribute('data-title', title);
            lastKnownTitle = title;
        }
    }

    function readTitleFromRootElement(body) {
        if (body.hasAttribute('data-title')) {
            var title = body.getAttribute('data-title');
            if (title !== lastKnownTitle) {
                $('#content-title').val(title);
                lastKnownTitle = title;
            }
        }
    }

    function bindPostPasteFix() {
        var $doc = $(document);
        var synchronyId = 'confluence.postpaste-fix';

        $doc.bind('prePaste', function () {
            AJS.trigger('synchrony.stop', {
                id: synchronyId
            });
        }).bind('postPaste', function () {
            setTimeout(function () {
                AJS.trigger('synchrony.start', {
                    id: synchronyId
                });
            }, 0);
        });
    }

    function isContentEmpty(rawContent) {
        // empty if just whitespace or html with empty text nodes
        return /^\s+$/.test(rawContent) || $(rawContent).text().trim().length === 0;
    }

    return {
        getContent: getContent,
        isUnpublished: isUnpublished,
        fixTinymceCaretContainer: fixTinymceCaretContainer,
        writeTitleToRootElement: writeTitleToRootElement,
        readTitleFromRootElement: readTitleFromRootElement,
        bindPostPasteFix: bindPostPasteFix,
        isContentEmpty: isContentEmpty
    };
});
