/**
 * @module confluence-editor/utils/tinymce-macro-utils
 */
define('confluence-editor/utils/tinymce-macro-utils', [
    'tinymce',
    'ajs',
    'confluence/legacy',
    'confluence-editor/editor/page-editor-message',
    'jquery',
    'confluence/message-controller'
], function(
    tinymce,
    AJS,
    Confluence,
    Message,
    $,
    MessageController
) {
    "use strict";

    var that;

    /**
     * Places the editor cursor inside a bodied macro placeholder.
     */
    function focusMacroNode(macroNode) {
        var mb = tinymce.confluence.macrobrowser;
        var ed = tinymce.activeEditor;
        var doc = ed.getDoc();
        var nodeToFocus;
        var range = ed.selection.getRng(true);

        if (mb.isMacroWithBody(macroNode)) {
            // add a BR to allow the cursor to be positioned in the placeholder
            !tinymce.isIE && $("p, pre", macroNode).each(function () {
                if (this.childNodes.length === 0) {
                    this.appendChild(doc.createElement("br"));
                }
            });

            nodeToFocus = ed.dom.select('.wysiwyg-macro-body', macroNode)[0].firstChild;
            if (nodeToFocus) {
                range.setStart(nodeToFocus, 0);
                range.setEnd(nodeToFocus, 0);
            } else {
                AJS.debug("focusMacroNode: couldn't find anything to focus, cap'n!");
            }
        } else {
            range.setStartAfter(macroNode);
            range.setEndAfter(macroNode);
        }

        ed.selection.setRng(range);
    }

    var insertMacro = function (macro, nodeToReplace) {
        var request;

        if (macro.macro && macro.contentId) { // if macro data
            request = {
                type: "POST",
                url: AJS.contextPath() + "/rest/tinymce/1/macro/placeholder",
                contentType: "application/json; charset=utf-8",
                data: $.toJSON(macro),
                dataType: "text"
            };
        } else if (macro.url && macro.type) { // if jQuery AJAX request
            request = macro;
        } else {
            throw new Error("illegal argument received: " + macro);
        }

        /**
         * insertMacro consists of one or more asynchronous operations. This purpose of this $deferred object is to
         * allow insertMacro() and clients of insertMacro() to queue up callbacks to run after the asynchronous operation is complete.
         */
        var $deferred = $.Deferred();
        var ed = AJS.Rte.getEditor();
        var tempNode;
        var placeholderId;

        if (!nodeToReplace) {
            // Insert a temporary node that will be used to hold the fort while we wait for the server
            placeholderId = "macro-" + (new Date()).getTime();
            tempNode = ed.dom.create("span", {id: placeholderId});

            ed.selection.setNode(tempNode);
            /**
             * tinymce.dom.Selection.setNode() takes the node passed in, makes a copy of it internally
             * and then inserts into the editor's DOM. It does not return a reference to node it creates :/
             * hence we have to manually get a reference to it here.
             */
            nodeToReplace = tempNode = ed.dom.select("#" + placeholderId)[0];

            $deferred.fail(function () {
                $(tempNode).remove();
            });
        }

        /**
         * Mandate a sensible timeout. We don't want the editor buttons disabled for an unreasonable amount of time.
         * Better to re-enable them and fail the macro insertion and allow the user to save any changes they have made.
         */
        $.extend(request, {timeout: that.DEFAULT_INSERT_MACRO_TIMEOUT});

        AJS.debug('Insert macro timeout = ' + request.timeout);

        Confluence.Editor.UI.setButtonsState(false);

        $.ajax(request).done(function (macroMarkup) {
            if (macroMarkup[0] !== '<') {
                //change the markup into a text node so that it can be handled by jQuery
                macroMarkup = document.createTextNode(macroMarkup);
            }

            /**
             * Check if the node is still there before going any further.
             * The user could have deleted the node while the xhr request was in progress.
             * If that's the case and we manipulate a deleted node, we could expect some nasty
             * behaviour like CONFDEV-21949
             */
            function validNodeAttached(node) {
                return node && node.parentNode;
            }

            if (!validNodeAttached(nodeToReplace)) {
                AJS.logError("The node to be replaced has been already deleted from the document");
                $deferred.rejectWith(this, arguments);
            }
            else {
                tinymce.confluence.NodeUtils.updateNode(nodeToReplace, macroMarkup)
                        .done(function (newNode) {
                            $deferred.resolve(newNode, macroMarkup);
                        })
                        .fail($deferred.reject); // updateNode does not reject at this point in time
            }
        })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    AJS.logError("Macro placeholder request failed " + textStatus + ": '" + errorThrown + "'");
                    if ("timeout" === textStatus) {
                        Message.handleMessage("macro-placeholder-error", {
                            type: "error",
                            message: AJS.I18n.getText("macro.placeholder.timeout")
                        });
                    } else {
                        Message.handleMessage("macro-placeholder-error", {
                            type: "error",
                            message: MessageController.parseError(jqXHR, AJS.I18n.getText("macro.placeholder.error"))
                        });
                    }
                    $deferred.rejectWith(this, arguments);
                });

        /**
         * All operations that are to happen after all asynchronous operations are complete should be queued up here.
         */
        $deferred
                .done(function (newNode, newNodeMarkup) {
                    Confluence.Editor.UI.setButtonsState(true);

                    /**
                     * Split out body macro placeholder if it is inside a heading or paragraph (tables are not allowed inside these tags according to the html spec)
                     */
                    if (tinymce.confluence.macrobrowser.isMacroWithBody(newNode)
                            && /P|H\d/.test(newNode.parentNode.nodeName)) {
                        ed.dom.split(newNode.parentNode, newNode);
                    }

                    focusMacroNode(newNode);

                    /**
                     * One reason to call this here is to ensure the toolbar buttons are disabled when inside a plain text macro placeholder
                     */
                    ed.nodeChanged();

                    // ATLASSIAN - CONFDEV-3749 - make sure new element is visible
                    // ATLASSIAN - CONFDEV-6400 - Make sure that the whole macro is visible
                    AJS.Rte.showElement(newNode);

                    ed.selection.onSetContent.dispatch(ed.selection, {
                        content: newNodeMarkup,
                        format: "html"
                    });

                    tinymce.activeEditor.undoManager.add();

                    // This event is used with AJS.trace to allow WD tests to wait until the macro placeholder
                    // has been added to the Editor.
                    AJS.trigger("macro-browser.macro-inserted");
                })
                .fail(function () {
                    Confluence.Editor.UI.setButtonsState(true);
                });

        return $deferred.promise();
    };

    that = {

        DEFAULT_INSERT_MACRO_TIMEOUT: AJS.Meta.get('macro-placeholder-timeout'),

        /**
         * Inserts a macro into the editor asynchronously. The specified macro could be either:
         *
         * (1) macro data (consisting of macro and a contentId)
         * (2) an jQuery ajax request that returns macro markup in editor format
         *
         * @param macro macro data or a macro AJAX request
         * @param nodeToReplace (optional) if specified, this node will be replaced with the macro being inserted
         *
         * @return a jQuery promise object to allow callbacks to be queued up that will be invoked when this asynchronous operation is complete.
         */
        insertMacro: insertMacro,

        isInMacro: function (node) {
            var $node = node.jquery ? node : $(node);
            return $node.closest(".wysiwyg-macro").length > 0;
        },

        updateMacro: function (updatedParameters, updatedMacroBody, macroName, existingMacroNode) {

            var macroRenderRequest = {
                contentId: Confluence.getContentId(),
                macro: {
                    name: macroName,
                    params: updatedParameters,
                    body: updatedMacroBody ? updatedMacroBody : ""
                }
            };

            return insertMacro(macroRenderRequest, existingMacroNode);
        }
    };

    return that;
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/utils/tinymce-macro-utils', 'tinymce.confluence.MacroUtils');