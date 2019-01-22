/**
 * @module confluence-quick-edit/handlers/shortcut
 */
define('confluence-quick-edit/handlers/shortcut', [
    'ajs'
], function(
    AJS
) {
    "use strict";

    // It is possible that the shortcut initialization events have fired prior to to QuickEdit binding
    // keyboard shortcuts. This will maintain the state to retro-actively bind the shortcuts
    var shortcutsInitialized = false;

    AJS.bind("initialize.keyboardshortcuts add-bindings.keyboardshortcuts", function() {
        shortcutsInitialized = true;
    });
    AJS.bind("remove-bindings.keyboardshortcuts", function() {
        shortcutsInitialized = false;
    });


    // TODO CONFDEV-29061
    // This should be moved to the shortcuts plugins, which should provide an API to register and maybe override shortcuts
    // respecting the shortcuts enabled flag
    return {
        /**
         * Given a keyboard shortcut key and an element to click, returns an object
         * with bind and unbind functions that will listen to Atlassian Keyboard Shortcut
         * plugin events and event bind appropriately.
         */
        createShortcut: function(key, elementSelectorToClick) {
            var shortcut;

            function bind() {
                shortcut = shortcut || AJS.whenIType(key).moveToAndClick(elementSelectorToClick);
            }

            function unbind() {
                shortcut && shortcut.unbind();
                shortcut = null;
            }

            var initialiseShortcut = function() {
                if (shortcutsInitialized) {
                    bind();
                }
                // Only bind when the keyboard shortcut plugin events are triggered,
                // so that we respect the global 'enable shortcuts' flag
                AJS.bind("initialize.keyboardshortcuts", bind);
                AJS.bind("add-bindings.keyboardshortcuts", bind);
                AJS.bind("remove-bindings.keyboardshortcuts", unbind);
            };

            var unbindShortcutAndUnregisterEventHandlers = function() {
                unbind();
                AJS.unbind("initialize.keyboardshortcuts", bind);
                AJS.unbind("add-bindings.keyboardshortcuts", bind);
                AJS.unbind("remove-bindings.keyboardshortcuts", unbind);
            };

            return {
                bind: initialiseShortcut,
                unbind: unbindShortcutAndUnregisterEventHandlers
            };
        }
    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-quick-edit/handlers/shortcut', 'AJS.Confluence.QuickEdit.KeyboardShortcuts');