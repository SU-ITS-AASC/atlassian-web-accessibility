/**
 * @module confluence-keyboard-shortcuts/shortcut-dialog-tab-autoformat
 */
define('confluence-keyboard-shortcuts/shortcut-dialog-tab-autoformat', [
    'ajs',
    'confluence/templates',
    'jquery',
    'confluence-keyboard-shortcuts/confluence-keyboard-shortcuts'
], function(
    AJS,
    Templates,
    $,
    KeyboardShortcutsObject
) {
    "use strict";

    return function() {
        /*
         Adds the "Editor Autoformatting" tab to the Keyboard Shortcuts help dialog
         */

        // Adds the Autoformat array to the main KeyboardShortcuts dialog object if it does not already exist.
        if (KeyboardShortcutsObject.keyboardShortcuts.Autoformat === undefined) {
            KeyboardShortcutsObject.keyboardShortcuts.Autoformat = [];
        }

        var templates = Templates.KeyboardShortcutsDialog.Autoformat;

        var AutoformatItems = [
            {
                context: "autoformat.font_formatting",
                description: templates.boldDescription(),
                action: AJS.I18n.getText("keyboard.shortcuts.autoformat.bold.example")
            },
            {
                context: "autoformat.font_formatting",
                description: templates.underlineDescription(),
                action: AJS.I18n.getText("keyboard.shortcuts.autoformat.underline.example")
            },
            {
                context: "autoformat.font_formatting",
                description: templates.italicDescription(),
                action: AJS.I18n.getText("keyboard.shortcuts.autoformat.italic.example")
            },
            {
                context: "autoformat.font_formatting",
                description: templates.monospaceDescription(),
                action: AJS.I18n.getText("keyboard.shortcuts.autoformat.monospace.example")
            },
            {
                context: "autoformat.tables",
                description: templates.tableDescription(),
                action: AJS.I18n.getText("keyboard.shortcuts.autoformat.table.example")
            },
            {
                context: "autoformat.tables",
                description: templates.tableWithHeadingsDiscriptions(),
                action: AJS.I18n.getText("keyboard.shortcuts.autoformat.table_with_headings.example")
            },
            {
                context: "autoformat.styles",
                description: templates.h1Description(),
                action: AJS.I18n.getText("keyboard.shortcuts.autoformat.h1.example")
            },
            {
                context: "autoformat.styles",
                description: templates.h3Description(),
                action: AJS.I18n.getText("keyboard.shortcuts.autoformat.h3.example")
            },
            {
                context: "autoformat.styles",
                description: templates.bqDescription(),
                action: AJS.I18n.getText("keyboard.shortcuts.autoformat.bq.example")
            },
            {
                context: "autoformat.emoticons",
                img: AJS.I18n.getText("keyboard.shortcuts.autoformat.check.img"),
                action: AJS.I18n.getText("keyboard.shortcuts.autoformat.tick.example")
            },
            {
                context: "autoformat.emoticons",
                img: AJS.I18n.getText("keyboard.shortcuts.autoformat.smile.img"),
                action: AJS.I18n.getText("keyboard.shortcuts.autoformat.smile.example")
            },
            {
                context: "autoformat.lists",
                description: templates.numberedListDescription(),
                action: AJS.I18n.getText("keyboard.shortcuts.autoformat.list.example")
            },
            {
                context: "autoformat.lists",
                description: templates.bulletedListDescription(),
                action: AJS.I18n.getText("keyboard.shortcuts.autoformat.bults.example")
            },
            {
                context: "autoformat.lists",
                description: templates.inlineTaskListDescription(),
                action: AJS.I18n.getText("keyboard.shortcuts.autoformat.tasklist.example")
            },
            {
                context: "autoformat.autocomplete",
                description: AJS.I18n.getText("tinymce.confluence.conf_media"),
                action: AJS.I18n.getText("keyboard.shortcuts.autocomplete.conf_media_shortcut")
            },
            {
                context: "autoformat.autocomplete",
                description: AJS.I18n.getText("tinymce.confluence.conf_link"),
                action: AJS.I18n.getText("keyboard.shortcuts.autocomplete.conf_link_shortcut")
            },
            {
                context: "autoformat.autocomplete",
                description: AJS.I18n.getText("tinymce.confluence.conf_macro_browser"),
                action: AJS.I18n.getText("keyboard.shortcuts.autocomplete.conf_macro_shortcut")
            }
        ];

        var buildShortcutModule = function (title, context, itemBuilder) {
            var module = $(Templates.KeyboardShortcutsDialog.keyboardShortcutModule({title: title}));
            var list = module.find("ul");
            var items = getMenuItemsForContext(context);

            for (var i = 0, ii = items.length; i < ii; i++) {
                list.append(
                        itemBuilder(items[i])
                );
            }

            return module;
        };

        var buildStandardShortcutModule = function (title, context, itemTemplate) {
            return buildShortcutModule(
                    title,
                    context,
                    function (item) {
                        return itemTemplate({output: item.description, type: item.action});
                    }
            );
        };

        var buildEmoticonModule = function (title, context) {
            var emoticonResourceUrl = AJS.params.staticResourceUrlPrefix + "/images/icons/emoticons/";
            return buildShortcutModule(
                    title,
                    context,
                    function (item) {
                        return templates.emoticonHelpItem(
                                {src: emoticonResourceUrl + item.img, type: item.action}
                        );
                    }
            );
        };

        var getMenuItemsForContext = function (context) {
            return $.grep(AutoformatItems, function (e) {
                return e.context === context;
            });
        };

        var buildHelpPanel = function () {
            var autoformatHelpPanel = $(Templates.KeyboardShortcutsDialog.keyboardShortcutPanel({panelId: 'autoformat-shortcuts-panel'}));
            var autoformatHelpPanelMenu = autoformatHelpPanel.children(".shortcutsmenu");

            autoformatHelpPanelMenu.append(
                    buildStandardShortcutModule(
                            AJS.I18n.getText("keyboard.shortcuts.autoformat.module.font_formatting"),
                            "autoformat.font_formatting",
                            templates.simpleHelpItem
                    )
            );
            autoformatHelpPanelMenu.append(
                    buildStandardShortcutModule(AJS.I18n.getText("keyboard.shortcuts.autoformat.module.autocomplete"),
                            "autoformat.autocomplete",
                            templates.keyboardShortcutItem
                    )
            );
            autoformatHelpPanelMenu.append(
                    buildStandardShortcutModule(
                            AJS.I18n.getText("keyboard.shortcuts.autoformat.module.tables"),
                            "autoformat.tables",
                            templates.tableHelpItem
                    )
            );
            autoformatHelpPanelMenu.append(
                    buildStandardShortcutModule(
                            AJS.I18n.getText("keyboard.shortcuts.autoformat.module.styles"),
                            "autoformat.styles",
                            templates.styleHelpItem
                    ).addClass("styles-module")
            );
            autoformatHelpPanelMenu.append(
                    buildEmoticonModule(
                            AJS.I18n.getText("keyboard.shortcuts.autoformat.module.emoticons"),
                            "autoformat.emoticons"
                    )
            );
            autoformatHelpPanelMenu.append(
                    buildStandardShortcutModule(
                            AJS.I18n.getText("keyboard.shortcuts.autoformat.module.lists"),
                            "autoformat.lists",
                            templates.simpleHelpItem
                    )
            );

            if (AJS.Meta.get("remote-user")) {
                autoformatHelpPanel.find(".keyboard-shortcut-dialog-panel-header").append(
                        templates.configureAutocomplete(
                                {href: AJS.contextPath() + "/users/viewmyeditorsettings.action"}
                        )
                );
            }

            return autoformatHelpPanel;
        };

        return buildHelpPanel;
    };

});

require('confluence/module-exporter').safeRequire('confluence-keyboard-shortcuts/shortcut-dialog-tab-autoformat', function(AutoformatInitialisation) {

    var AJS = require('ajs');
    AJS.toInit(function() {
        var buildHelpPanel = AutoformatInitialisation();

        AJS.bind("keyboard-shortcut-dialog-ready", function (e, popup) {
            popup.addPanel(AJS.I18n.getText("keyboard.shortcuts.autoformat.panel.name"), buildHelpPanel());
        });
    });

});