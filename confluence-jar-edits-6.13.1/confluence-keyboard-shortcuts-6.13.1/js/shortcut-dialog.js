/**
 * @module confluence-keyboard-shortcuts/shortcut-dialog
 */
define('confluence-keyboard-shortcuts/shortcut-dialog', [
    'ajs',
    'confluence-keyboard-shortcuts/confluence-keyboard-shortcuts',
    'confluence/legacy',
    'confluence/templates',
    'jquery',
    'window'
], function(
    AJS,
    KeyboardShortcutsObject,
    Confluence,
    Templates,
    $,
    window
) {
    "use strict";

    return function () {

        var popup;

        KeyboardShortcutsObject.keyboardShortcuts.getDialog = function () {
            var dfr = $.Deferred();

            if (popup) {
                goToEditorTabWhenEditorIsOpened();
                return dfr.resolve(popup);
            }

            var shortcuts = KeyboardShortcutsObject.keyboardShortcuts.shortcuts;

            var cancel = function () {
                AJS.debug("Hiding Shortcuts help");
                popup.hide();
                return false;
            };

            //Same technique as tinyMCE.
            var isMac = window.navigator.platform.indexOf('Mac') !== -1;

            //Construct the key sequence diagram shown on the keyboard shortcuts help dialog
            //e.g. shortcut.keys = [["g", "d"]]
            var makeKeySequence = function (shortcut) {
                var sequenceSpan = AJS("span").addClass("item-action");
                for (var numberOfShortcut = 0; numberOfShortcut < shortcut.keys.length; numberOfShortcut++) {
                    if (numberOfShortcut > 0) {
                        sequenceSpan.append(makeKbdSeparator(AJS.I18n.getText("keyboard.shortcut.or")));
                    }
                    var keySequence = shortcut.keys[numberOfShortcut];
                    for (var i = 0; i < keySequence.length; i++) {
                        if (i > 0) {
                            sequenceSpan.append(makeKbdSeparator(AJS.I18n.getText("keyboard.shortcut.then")));
                        }

                        makeKeyCombo(keySequence[i], sequenceSpan);
                    }
                }

                return sequenceSpan;
            };

            var makeKeyCombo = function (combo, sequence) {
                var keys = combo.split("+");

                for (var i = 0; i < keys.length; i++) {
                    if (i > 0) {
                        sequence.append(makeKbdSeparator("+"));
                    }

                    makeKeyAlternatives(keys[i], sequence);
                }
            };

            var makeKeyAlternatives = function (key, sequence) {
                var keys = key.split("..");

                for (var i = 0; i < keys.length; i++) {
                    if (i > 0) {
                        sequence.append(makeKbdSeparator(AJS.I18n.getText("keyboard.shortcut.to")));
                    }

                    sequence.append(makeKbd(keys[i]));
                }
            };

            var makeKbd = function (key) {
                var kbd = AJS("kbd");

                switch (key) {
                    case "Shift":
                    case "Sh":
                        kbd.text(AJS.I18n.getText("keyboard.shortcut.shift"));
                        kbd.addClass("modifier-key");
                        break;
                    case "Ctrl":
                        var text = isMac ? '\u2318' : AJS.I18n.getText("keyboard.shortcut.ctrl");  //Apple command key
                        kbd.text(text);
                        kbd.addClass("modifier-key");
                        break;
                    case "Tab":
                        kbd.text(AJS.I18n.getText("keyboard.shortcut.tab"));
                        kbd.addClass("modifier-key");
                        break;
                    case "Alt":
                        kbd.text(AJS.I18n.getText("keyboard.shortcut.alt"));
                        kbd.addClass("modifier-key");
                        break;
                    default:
                        kbd.text(key);
                        kbd.addClass("regular-key");
                }

                return kbd;
            };

            var makeKbdSeparator = function (text) {
                var separator = AJS("span");
                separator.text(text);
                separator.addClass("key-separator");
                return separator;
            };

            var makeShortcutModule = function (title, contexts, shortcuts) {
                var module = $(Templates.KeyboardShortcutsDialog.keyboardShortcutModule({title: title}));
                var list = module.find("ul");

                for (var i = 0; i < shortcuts.length; i++) {
                    var shortcut = shortcuts[i];

                    if (shortcut.hidden) {
                        continue;
                    }

                    if ($.inArray(shortcut.context, contexts) !== -1) {
                        var shortcutItem = AJS("li").addClass("item-details");
                        var text = shortcut.description;
                        var desc = AJS("strong").addClass("item-description").append(text);
                        shortcutItem.append(desc);
                        shortcutItem.append(makeKeySequence(shortcut));
                        list.append(shortcutItem);
                    }
                }

                return module;
            };

            var makeGeneralShortcutsMenu = function () {
                var generalShortcutsMenuPane = $(Templates.KeyboardShortcutsDialog.keyboardShortcutPanel({panelId: "general-shortcuts-panel"}));
                var generalShortcutsMenu = $(generalShortcutsMenuPane).children(".shortcutsmenu");

                if (AJS.Meta.get("remote-user")) {
                    generalShortcutsMenuPane.find(".keyboard-shortcut-dialog-panel-header").append(Confluence.Templates.KeyboardShortcutsDialog.keyboardShortcutEnabledCheckbox());
                }

                generalShortcutsMenu.append(makeShortcutModule(AJS.I18n.getText("keyboard.shortcuts.dialog.module.global"), ["global"], shortcuts));
                generalShortcutsMenu.append(makeShortcutModule(AJS.I18n.getText("keyboard.shortcuts.dialog.module.page"), ["viewcontent", "viewinfo"], shortcuts));

                return generalShortcutsMenuPane;
            };

            var makeEditorShortcutsMenu = function () {
                var editorShortcutsMenuPane = $(Templates.KeyboardShortcutsDialog.keyboardShortcutPanel({panelId: "editor-shortcuts-panel"}));
                var editorShortcutsMenu = $(editorShortcutsMenuPane).children(".shortcutsmenu");

                editorShortcutsMenu.append(makeShortcutModule(AJS.I18n.getText("keyboard.shortcuts.dialog.module.block"), ["tinymce.block"], shortcuts));
                editorShortcutsMenu.append(makeShortcutModule(AJS.I18n.getText("keyboard.shortcuts.dialog.module.rich"), ["tinymce.rich"], shortcuts));
                editorShortcutsMenu.append(makeShortcutModule(AJS.I18n.getText("keyboard.shortcuts.dialog.module.editing-actions"), ["tinymce.actions"], shortcuts));

                return editorShortcutsMenuPane;
            };

            var toggleEnabled = function (event) {
                var enable = $(this).prop('checked');
                // TODO - after 3.4-m4 and blitz - error handling architecture
                $.ajax(
                        {
                            type: "POST",
                            url: AJS.contextPath() + "/rest/confluenceshortcuts/latest/enabled",
                            data: $.toJSON({
                                enabled: enable
                            }),
                            dataType: "json",
                            contentType: "application/json"
                        }).done(function () {
                            KeyboardShortcutsObject.keyboardShortcuts.enabled = enable;
                            KeyboardShortcutsObject.keyboardShortcuts.ready = false;
                            if (enable) {
                                AJS.trigger("add-bindings.keyboardshortcuts");
                            } else {
                                AJS.trigger("remove-bindings.keyboardshortcuts");
                            }
                        });
            };

            var initialiseEnableShortcutsCheckbox = function () {
                $('#keyboard-shortcut-enabled-checkbox')
                        .prop('checked', KeyboardShortcutsObject.keyboardShortcuts.enabled)
                        .click(toggleEnabled);
            };

            popup = AJS.ConfluenceDialog({
                width: 950,
                height: 660,
                id: "keyboard-shortcuts-dialog"
            });


            function goToEditorTabWhenEditorIsOpened() {
                // If you have an editor visible automatically open the Editor tab.
                var editorVisible = Confluence && Confluence.Editor && Confluence.Editor.isVisible && Confluence.Editor.isVisible();

                if (editorVisible) {
                    popup.overrideLastTab();
                    popup.gotoPanel(1);
                } else {
                    popup.gotoPanel(0);
                }
            }

            popup.addHeader(AJS.I18n.getText("keyboard.shortcuts.dialog.heading"));
            popup.addPanel(AJS.I18n.getText("keyboard.shortcuts.dialog.panel.general"), makeGeneralShortcutsMenu());
            popup.addPanel(AJS.I18n.getText("keyboard.shortcuts.dialog.panel.editor"), makeEditorShortcutsMenu());
            popup.addCancel(AJS.I18n.getText("close.name"), cancel);
            AJS.trigger("keyboard-shortcut-dialog-ready", popup);

            goToEditorTabWhenEditorIsOpened();

            dfr.resolve(popup);
            initialiseEnableShortcutsCheckbox();
            return dfr;
        };
    };
});

require('confluence/module-exporter').safeRequire('confluence-keyboard-shortcuts/shortcut-dialog', function(ShortcutDialog) {

    require('ajs').toInit(ShortcutDialog);

});