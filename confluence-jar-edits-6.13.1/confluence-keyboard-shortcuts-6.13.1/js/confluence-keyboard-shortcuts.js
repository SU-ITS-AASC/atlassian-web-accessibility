/**
 * @module confluence-keyboard-shortcuts/confluence-keyboard-shortcuts
 */
define('confluence-keyboard-shortcuts/confluence-keyboard-shortcuts', [
    'ajs',
    'jquery',
    'confluence/legacy',
    'window'
], function (AJS,
             $,
             Confluence,
             window
             ) {
    "use strict";
    var _logic = {

        createShortcutFunc: function createShortcutFunc(shortcut) {
            switch (shortcut.op) {
                case "click":
                    return function () {
                        $(shortcut.param).click();
                    };
                case "execute":
                    return shortcut.param;
                default:
                    return undefined;

            }
        },

        normalizeShortcutKeys: function normalizeShortcutKeys(shortcut, tinymce) {
            var lowercase = shortcut.toLowerCase();
            // When tinymce 3 do nothing because this conversion is already done in the modified tinymce 3 core.
            if (tinymce.isMac && tinymce.majorVersion === "4") {
                return lowercase.replace(
                    new RegExp('ctrl', 'g'),
                    'meta'
                );
            }

            return lowercase;
        },

        isAnyShortcutInEvent: function isAnyShortcutInEvent(event, normalizedShortcutKey) {
            var retVal = normalizedShortcutKey.some(
                function (normalizedShortcutKey) {
                    var totalKeys = 1;
                    if (event.metaKey) {
                        totalKeys++;
                    }
                    if (event.shiftKey) {
                        totalKeys++;
                    }
                    var isAllShortcutKeysInEvent =
                        normalizedShortcutKey
                            .split("+")
                            // Parses the shortcut and checks if correct keys are present.
                            .every( function (key) {
                                totalKeys--;
                                return _logic._isKeyInShortcutString(event, key);
                            });
                    return isAllShortcutKeysInEvent && totalKeys === 0;
                }
            );

            return retVal;
        },

        _isKeyInShortcutString: function isKeyInShortcutString(keyDownEvent, normalizedShortcutKey) {
            var code = keyDownEvent.keyCode ? keyDownEvent.keyCode : keyDownEvent.which;
            var codeStr = code ? String.fromCharCode(code).toLowerCase() : "";

            var isMetaKey = !!((normalizedShortcutKey === "meta" || normalizedShortcutKey === "ctrl") && keyDownEvent.metaKey);
            var isShiftKey = !!(normalizedShortcutKey === "shift" && keyDownEvent.shiftKey);
            var isCharacterInKey = normalizedShortcutKey === codeStr;

            return isMetaKey || isShiftKey || isCharacterInKey;
        }
    };

    var shortcutsInitialisation = function () {
        AJS.debug("confluence-keyboard-shortcuts initialising");

        // CGP-151/CONFDEV-811 - Skip this if you are in the Page Gadget
        if (AJS.PageGadget || (window.parent.AJS && window.parent.AJS.PageGadget)) {
            AJS.debug("Inside the Page Gadget. Skipping keyboard shortcuts");
            return;
        }

        Confluence.KeyboardShortcuts.enabled = AJS.Meta.getBoolean('use-keyboard-shortcuts');

        AJS.bind("shortcuts-loaded.keyboardshortcuts", function (e, data) {
            Confluence.KeyboardShortcuts.shortcuts = data.shortcuts;
            $("#keyboard-shortcuts-link").click(Confluence.KeyboardShortcuts.openDialog);
        });

        AJS.bind("register-contexts.keyboardshortcuts", function (e, data) {

            // Only bind the shortcuts for contexts if the user has the preference set
            if (!Confluence.KeyboardShortcuts.enabled) {
                return;
            }
            // Here we bind to register-contexts.keyboardshortcuts so that we can select which
            // keyboard shortcut contexts should be enabled. We use jQuery selectors to determine
            // which keyboard shortcut contexts are applicable to a page.

            var shortcutRegistry = data.shortcutRegistry;
            shortcutRegistry.enableContext("global");

            //See CONFDEV-12510 for why we need to check that Confluence.Editor.isVisible exists.
            var editorVisible = Confluence &&
                Confluence.Editor &&
                Confluence.Editor.isVisible &&
                Confluence.Editor.isVisible();

            if ($("#action-menu-link").length && !editorVisible) {
                shortcutRegistry.enableContext("viewcontent");
            }

            if ($("#viewPageLink").length) {
                shortcutRegistry.enableContext("viewinfo");
            }

            if (!editorVisible) {
                return Confluence.KeyboardShortcuts.ready = true;
            }

            shortcutRegistry.enableContext("editor");

            var tinymce = require('tinymce');

            // tinymce shortcuts are added through the tinymce apis
            var ed = tinymce.activeEditor;
            var editorForm = $("#rte").closest("form");

            Confluence.KeyboardShortcuts.shortcuts
                .filter(
                    function (shortcut) {
                        return shortcut.context.indexOf("tinymce") === 0;
                    }
                )
                .forEach(
                    function (shortcut) {
                        shortcut.keys.forEach(function (shortcutKey) {
                            var shortcutFunc = _logic.createShortcutFunc(shortcut);
                            if (!shortcutFunc) {
                                AJS.logError(
                                    "ERROR: unkown editor shortcut key operation " +
                                    shortcut.op +
                                    " for shortcut " +
                                    shortcutKey);
                            }


                            var shortcutKeysArray = Array.isArray(shortcutKey) ?
                                shortcutKey : [shortcutKey];
                            var normalizedShortcutKeys = shortcutKeysArray
                                .map(
                                    function (shortcutKey) {
                                        return _logic.normalizeShortcutKeys(shortcutKey, tinymce);
                                    }
                                );


                            var normalizedShortcutKeysStr = _logic.normalizeShortcutKeys(
                                normalizedShortcutKeys.join(","),
                                tinymce
                            );


                            AJS.debug("Adding shortcut for " + normalizedShortcutKeysStr);
                            ed.addShortcut(normalizedShortcutKeysStr, "", shortcutFunc);


                            // CONFDEV-3711: Binds a keydown event to the form input elements to capture the editor
                            // save and preview shortcuts
                            var isTinyMceActionWithKeyCombination = shortcut.context == "tinymce.actions" &&
                                normalizedShortcutKeysStr.indexOf("+") !== -1;

                            if ( isTinyMceActionWithKeyCombination ) {
                                AJS.debug("Binding shortcut on inputs too for " + normalizedShortcutKeysStr);
                                editorForm.delegate(":input", "keydown", function (event) {
                                    var isAnyShortcutInEvent = _logic.isAnyShortcutInEvent(event, normalizedShortcutKeys);

                                    if (isAnyShortcutInEvent) {
                                        shortcutFunc();
                                        event.preventDefault();
                                    }
                                });
                            }
                        });
            });


            Confluence.KeyboardShortcuts.ready = true;
        });

        // Why is this if statment needed? It seems that when we are ready to do an import, the pluginsystem is up, and we
        // pull down the super batch. This superbatch contains this code and it fires off a request to Confluence to get the
        // i18n resources. This request gets redirected to 'selectsetupstep.action' which due to the fact that the import is
        // running thinks we are done, and redirects to 'finishsetup.action' and things blow up.
        if (typeof AJS.contextPath() !== "undefined") {
            if ($("#rte").length) { //If there is an editor on the page wait for it to load before initializing shortcuts
                AJS.bind("init.rte", function () {
                    AJS.trigger("initialize.keyboardshortcuts");
                });
            } else {
                AJS.trigger("initialize.keyboardshortcuts");
            }
        }
    };

    // Add functions that are referenced from the execute shortcut operations in atlassian-plugin.xml here
    var KeyboardShortcuts = {
        Editor: [], // hack for jira issue plugin, remove once the plugin has been updated
        enabled: false,
        ready: false,
        dialog: null,
        closeDialog: function () {
            Confluence.KeyboardShortcuts.getDialog().then(function (dialog) {
                dialog.hide();
            });
            return false;
        },
        openDialog: function () {
            // remove "interactive" class from menu item. with "interactive" class, the menu does not close when clicking
            // on a menu item. "interactive" class added by help-analytics.js from atlassian-nav-links-plugin-3.2.12
            $(this).removeClass("interactive");
            Confluence.KeyboardShortcuts.getDialog().then(function (dialog) {
                dialog.show();
            });
            return false;
        }
    };

    var KeyboardShortcutsObject = {};
    KeyboardShortcutsObject.init = shortcutsInitialisation;
    KeyboardShortcutsObject.keyboardShortcuts = KeyboardShortcuts;
    KeyboardShortcutsObject._logic = _logic;

    return KeyboardShortcutsObject;
});

require('confluence/module-exporter').safeRequire('confluence-keyboard-shortcuts/confluence-keyboard-shortcuts', function (KeyboardShortcuts) {

    var Confluence = require('confluence/legacy');
    var AJS = require('ajs');

    Confluence.KeyboardShortcuts = KeyboardShortcuts.keyboardShortcuts;
    AJS.toInit(KeyboardShortcuts.init);

});