/**
 * @module confluence-editor/tinymce3/plugins/atlassianemotions/emotions
 */
define('confluence-editor/tinymce3/plugins/atlassianemotions/emotions', [
    'tinymce/popup',
    'jquery'
], function(
    tinyMCEPopup,
    $
) {
    "use strict";

    tinyMCEPopup.requireLangPack();

    var EmotionsDialog = {
        init : function(ed) {
            tinyMCEPopup.resizeToInnerSize();

            var self = this;
            $('.emoticon-table').on('click', 'img', function (e) {
                e.preventDefault();
                var emoticon = e.target;
                self.insert(emoticon.dataset.type, 'emotions_dlg.' + emoticon.id, emoticon.src);
            });

        },

        // ATLASSIAN the first parameter is no longer a file name. It is the emoticon name now.
        insert : function(emoticon, title, emoticonUrl) {
            var ed = tinyMCEPopup.editor;
            var dom = ed.dom;

            // ATLASSIAN - need to close first so that the selection is set correctly on Firefox, prior to the mceInsertContent
            // ed must now be used instead of tinyMCEPopup for the execCommand since closing the tinyMCEPopup makes the editor null.
            //
            tinyMCEPopup.restoreSelection();
            tinyMCEPopup.close();
            ed.execCommand('mceInsertContent', false, dom.createHTML('img', {
                src : emoticonUrl,
                alt : ed.getLang(title),
                title : ed.getLang(title),
                border : 0,
                "class" : "emoticon emoticon-" + emoticon,
                "data-emoticon-name" : emoticon
            }));

        }
    };

    return EmotionsDialog;
});

require('confluence/module-exporter').safeRequire('confluence-editor/tinymce3/plugins/atlassianemotions/emotions', function(EmotionsDialog) {
    require('tinymce/popup').onInit.add(EmotionsDialog.init, EmotionsDialog);
});

