define("confluence-keyboard-shortcuts/shortcut-dialog-tab-autoformat",["ajs","confluence/templates","jquery","confluence-keyboard-shortcuts/confluence-keyboard-shortcuts"],function(a,d,g,c){return function(){void 0===c.keyboardShortcuts.Autoformat&&(c.keyboardShortcuts.Autoformat=[]);var b=d.KeyboardShortcutsDialog.Autoformat,j=[{context:"autoformat.font_formatting",description:b.boldDescription(),action:a.I18n.getText("keyboard.shortcuts.autoformat.bold.example")},{context:"autoformat.font_formatting",
description:b.underlineDescription(),action:a.I18n.getText("keyboard.shortcuts.autoformat.underline.example")},{context:"autoformat.font_formatting",description:b.italicDescription(),action:a.I18n.getText("keyboard.shortcuts.autoformat.italic.example")},{context:"autoformat.font_formatting",description:b.monospaceDescription(),action:a.I18n.getText("keyboard.shortcuts.autoformat.monospace.example")},{context:"autoformat.tables",description:b.tableDescription(),action:a.I18n.getText("keyboard.shortcuts.autoformat.table.example")},
{context:"autoformat.tables",description:b.tableWithHeadingsDiscriptions(),action:a.I18n.getText("keyboard.shortcuts.autoformat.table_with_headings.example")},{context:"autoformat.styles",description:b.h1Description(),action:a.I18n.getText("keyboard.shortcuts.autoformat.h1.example")},{context:"autoformat.styles",description:b.h3Description(),action:a.I18n.getText("keyboard.shortcuts.autoformat.h3.example")},{context:"autoformat.styles",description:b.bqDescription(),action:a.I18n.getText("keyboard.shortcuts.autoformat.bq.example")},
{context:"autoformat.emoticons",img:a.I18n.getText("keyboard.shortcuts.autoformat.check.img"),action:a.I18n.getText("keyboard.shortcuts.autoformat.tick.example")},{context:"autoformat.emoticons",img:a.I18n.getText("keyboard.shortcuts.autoformat.smile.img"),action:a.I18n.getText("keyboard.shortcuts.autoformat.smile.example")},{context:"autoformat.lists",description:b.numberedListDescription(),action:a.I18n.getText("keyboard.shortcuts.autoformat.list.example")},{context:"autoformat.lists",description:b.bulletedListDescription(),
action:a.I18n.getText("keyboard.shortcuts.autoformat.bults.example")},{context:"autoformat.lists",description:b.inlineTaskListDescription(),action:a.I18n.getText("keyboard.shortcuts.autoformat.tasklist.example")},{context:"autoformat.autocomplete",description:a.I18n.getText("tinymce.confluence.conf_media"),action:a.I18n.getText("keyboard.shortcuts.autocomplete.conf_media_shortcut")},{context:"autoformat.autocomplete",description:a.I18n.getText("tinymce.confluence.conf_link"),action:a.I18n.getText("keyboard.shortcuts.autocomplete.conf_link_shortcut")},
{context:"autoformat.autocomplete",description:a.I18n.getText("tinymce.confluence.conf_macro_browser"),action:a.I18n.getText("keyboard.shortcuts.autocomplete.conf_macro_shortcut")}],h=function(a,b,f){var a=g(d.KeyboardShortcutsDialog.keyboardShortcutModule({title:a})),k=a.find("ul"),c;c=g.grep(j,function(a){return a.context===b});for(var i=0,h=c.length;i<h;i++)k.append(f(c[i]));return a},f=function(a,b,d){return h(a,b,function(a){return d({output:a.description,type:a.action})})},l=function(d,e){var c=
a.params.staticResourceUrlPrefix+"/images/icons/emoticons/";return h(d,e,function(a){return b.emoticonHelpItem({src:c+a.img,type:a.action})})};return function(){var c=g(d.KeyboardShortcutsDialog.keyboardShortcutPanel({panelId:"autoformat-shortcuts-panel"})),e=c.children(".shortcutsmenu");e.append(f(a.I18n.getText("keyboard.shortcuts.autoformat.module.font_formatting"),"autoformat.font_formatting",b.simpleHelpItem));e.append(f(a.I18n.getText("keyboard.shortcuts.autoformat.module.autocomplete"),"autoformat.autocomplete",
b.keyboardShortcutItem));e.append(f(a.I18n.getText("keyboard.shortcuts.autoformat.module.tables"),"autoformat.tables",b.tableHelpItem));e.append(f(a.I18n.getText("keyboard.shortcuts.autoformat.module.styles"),"autoformat.styles",b.styleHelpItem).addClass("styles-module"));e.append(l(a.I18n.getText("keyboard.shortcuts.autoformat.module.emoticons"),"autoformat.emoticons"));e.append(f(a.I18n.getText("keyboard.shortcuts.autoformat.module.lists"),"autoformat.lists",b.simpleHelpItem));a.Meta.get("remote-user")&&
c.find(".keyboard-shortcut-dialog-panel-header").append(b.configureAutocomplete({href:a.contextPath()+"/users/viewmyeditorsettings.action"}));return c}}});require("confluence/module-exporter").safeRequire("confluence-keyboard-shortcuts/shortcut-dialog-tab-autoformat",function(a){var d=require("ajs");d.toInit(function(){var g=a();d.bind("keyboard-shortcut-dialog-ready",function(a,b){b.addPanel(d.I18n.getText("keyboard.shortcuts.autoformat.panel.name"),g())})})});