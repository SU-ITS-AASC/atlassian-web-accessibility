define('confluence-collaborative-editor-plugin/unsupported-extension', [
    'ajs',
    'jquery',
    'confluence/legacy',
    'confluence-editor/editor/page-editor-message',
    'window',
    'confluence-collaborative-editor-plugin/editor-blanket'
], function(
    AJS,
    $,
    Confluence,
    Message,
    window,
    EditorBlanket
) {
    'use strict';

    function checkGrammarly() {
        var editorBody = AJS.Rte.getEditor().getBody();
        //block only if Grammarly is activated on Confluence Editor
        if (editorBody.hasAttribute("data-gramm") && editorBody.hasAttribute("data-gramm_id")) {
            AJS.trigger('synchrony.stop', {
                id: 'confluence.editor.block.by.grammarly',
                //365 days in milliseconds to prevent Auto recovery
                maxWaitTimeToRestart: 1000*60*60*24*365
            });
            AJS.trigger("analyticsEvent", {
                name: "confluence.synchrony.editor.grammarly.block"
            });
            //disable contenteditable on Body
            editorBody.setAttribute('contentEditable', false);
            //disable contenteditable on Page layout
            $(editorBody).find(".contentLayout2 .innerCell").each(function () {
                this.setAttribute('contentEditable', false);
            });
            //show blanket
            EditorBlanket.showBlanket("block");
            //disable buttons
            Confluence.Editor.UI.setButtonsState(false,Confluence.Editor.UI.buttons);
            //show message
            Message.handleMessage("collaborative-editor-unsupported-extension", {
                type: "error",
                title: AJS.I18n.getText("collab.grammarly.flag.title"),
                message: AJS.I18n.getText("collab.grammarly.flag.body", 'href="#" id="collabGrammarlyReload"')
            });
            $("#collabGrammarlyReload").click(function () {
                AJS.trigger("analyticsEvent", {
                    name: "confluence.synchrony.editor.grammarly.reload.click"
                });
                window.location.reload();
                return false;
            });
            AJS.trigger("synchrony-unsupported-extension");
        }
    }

    function check() {
        checkGrammarly();
    }
    
    return {
        check: check
    }
});