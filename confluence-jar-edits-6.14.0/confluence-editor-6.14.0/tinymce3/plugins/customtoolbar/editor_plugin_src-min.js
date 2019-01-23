define("confluence-editor/tinymce3/plugins/customtoolbar/editor_plugin_src",["jquery","ajs","confluence/legacy","document","tinymce"],function(b,g,s,n,t){function u(a){var c=function(){a&&a.hide()};b(n).bind("showLayer",function(b,d,f){"dropdown"==d&&f==a&&(b=g.Rte.getEditor(),b.onClick.add(c),b.onKeyUp.add(c))}).bind("hideLayer",function(b,d,f){"dropdown"==d&&f==a&&(b=g.Rte.getEditor(),b.onClick.remove(c),b.onKeyUp.remove(c))})}function v(b){b.addCallback("show",function(){b.$.parents(".disabled").length&&
b.hide()})}function w(a,c){var e=k(c);b("#"+e).removeClass("disabled")}function x(a,c){var e=k(c);b("#"+e).addClass("disabled")}function q(b,c){c?b.closest(".aui-button").prop("disabled",!0).attr("aria-disabled","true").toggleClass("disabled",c):b.closest(".aui-button").prop("disabled",!1).removeAttr("aria-disabled").toggleClass("disabled",c)}function p(a,c,e,d){var f=b("#toolbar"),h=f.find(".toolbar-item"),i=b("#insert-menu, #more-menu"),j=b("#insert-menu, #color-picker-control"),l=b("#format-dropdown"),
d=d||function(){return!0};h.toggleClass("disabled",a);i.toggleClass("disabled",a);j.toggleClass("disabled",a);l.toggleClass("disabled",!!c);g.Rte.TablePicker[a?"disable":"enable"]();"undefined"!==typeof e&&f.find("button, input").filter(d).toggleClass("disabled",e).prop("disabled",e)}function k(b){var c="default";b&&b.id&&(c=b.id);return"rte-toolbar-row-"+c}function y(a,c){var e=c.animate;void 0==e&&(e=!0);var d=function(){b(this).remove();b(n).trigger("resize.resizeplugin");if(c.onHide)c.onHide()};
clearTimeout(m);m=setTimeout(function(){var a=k(c),a=b("#"+a);e?a.slideUp(400,d):(a.hide(),d.call(a))},100)}function z(a,c){var e=k(c),d=c.animate;void 0==d&&(d=!0);if(0<b("#"+e).length)b("#"+e+":hidden").slideDown(400,function(){g.debug("Prevented toolbar deferred display race condition")});else{var f=b("<div></div>").addClass("toolbar-split toolbar-split-row toolbar-contextual");f.attr("id",e);c.editorAdjacent&&f.addClass("editor-adjacent");for(var e=!c.topToolbar?b("#savebar-container .aui-toolbar:visible"):
b("#rte-toolbar.aui-toolbar:visible"),h=0,i=c.buttons.length;h<i;h++)f.append(c.buttons[h].render());f.css({display:"none"});c.editorAdjacent?e.append(f):(h=b(".editor-adjacent",e).filter(":first"),h.length?h.before(f):e.append(f));f.find(".toolbar-dropdown").each(function(){l(this)});var j=function(){b(n).trigger("resize.resizeplugin").trigger("shown.contextToolbar");if(c.onVisible)c.onVisible()};clearTimeout(m);m=setTimeout(function(){if(d)f.slideDown(400,j);else{f.show();j()}},100)}}function l(a){var a=
b(a),c=a.dropDown("Standard",{alignment:a.data("dropdown-alignment")||"left"})[0];a.find(".dropdown-item").click(function(a){var d=b(this),f=d.attr("data-macro-name"),h=d.attr("data-command"),i=d.attr("data-format"),d=d.attr("data-control-id"),j=g.Rte.getEditor();f&&t.confluence.macrobrowser.macroBrowserToolbarButtonClicked({presetMacroName:f});h&&j.execCommand(h,!1);i&&j.theme.controlHandlers.formatselect.click.dispatch(i);d&&j.theme.controlHandlers.buttons.click.dispatch(d);c.hide();a.preventDefault()});
v(c);u(c)}var m;return{init:function(a){l("#format-dropdown");l("#more-menu .aui-dd-parent");l("#insert-menu .aui-dd-parent");b("#pagelayout-menu").length&&l("#pagelayout-menu .aui-dd-parent");b("#template-menu").length&&l("#template-menu .aui-dd-parent");var c=b("#color-picker-control");if(c.length){var e=c.find(".aui-dd-parent"),d=b("#rte-button-color"),f=d.find(".selected-color"),e=e.dropDown("Standard",{alignment:"left"})[0],h=d.attr("data-color");f.css("background-color","#"+h);c.delegate("a[data-color]",
"click",function(a){var c=b(this),e=c.attr("data-color");a.preventDefault();c.closest(".disabled").length||(t.execCommand("ForeColor",!1,"#"+e),d.attr("data-color",e),f.css("background-color","#"+e))});v(e);u(e)}g.Rte.TablePicker.bindToControl(g.Rte.getEditor(),b("#insert-table-dropdown"));var c=require("confluence-editor/i18n/translations.i18n"),e=[],i;for(i in c.hints)e.push("hints."+i);var j=s.hintManager(e),k=function(){b("#rte-savebar .hints-text").html(g.Rte.getEditor().getLang(j.getNextHint()))};
k();b("#rte-savebar a.hints-close").click(function(a){b(this).closest(".toolbar-split").addClass("hidden");a.preventDefault()});b("#rte-savebar a.hints-next").click(function(b){k();b.preventDefault()});i=g.Rte.EventDelegator(a);b(n).trigger("initContextToolbars.Toolbar",a);b(n).bind("createContextToolbarRow.Toolbar",z).bind("removeContextToolbarRow.Toolbar",y).bind("enableContextToolbarRow.Toolbar",w).bind("disableContextToolbarRow.Toolbar",x);i.addEventsForComponent("TableToolbar",s.Editor.tableToolbar.Events);
var o=b("#format-dropdown"),m=o.find("span.dropdown-text");a.onBeforeExecCommand.add(function(a,c,e,d,f){b.each(["pre","blockquote"],function(){"FormatBlock"==c&&d==this&&(a.formatter.remove("alignleft"),a.formatter.remove("aligncenter"),a.formatter.remove("alignright"))});if(b(a.selection.getNode()).closest("pre,.text-placeholder").length)for(var e="Bold Italic Underline Strikethrough InsertUnorderedList InsertOrderedList InsertInlineTaskList InsertInlineTaskListNoToggle superscript subscript mceConfMacroBrowser mceConfimage mceConfAttachments mceEmotion InsertWikiMarkup mceConflink mceInsertTable mceConfAutocompleteLink".split(" "),
h=e.length,r=0;r<h;r++)c==e[r]&&(f.terminate=!0);"FormatBlock"==c&&"pre"==d&&(a.undoManager.add(),a.execCommand("removeFormat"));"FormatBlock"==c&&"p"==d?(e=o.find(".dropdown-item[data-format='blockquote']").text(),m.text()==e&&(f.terminate=!0,a.execCommand("FormatBlock",!1,"blockquote"))):"FormatBlock"==c&&("removeformat"==d&&a.selection.isCollapsed())&&(f.terminate=!0,g.debug("Not removing format for no selected text"))});a.onExecCommand.add(function(b,a,c,e){"FormatBlock"==a&&(b=o.find(".dropdown-item[data-format='"+
e+"']"),b.length||(b=o.find(".dropdown-item[data-format='p']")),m.text(b.text()))});a.onNodeChange.add(function(a,c,e){var d,f=e,f=b(f).closest("PRE,BLOCKQUOTE,.text-placeholder");d=function(b){return f.is(b)};var a=d("BLOCKQUOTE"),g=d("PRE");d=d(".text-placeholder");g?(c=b(e).parents("table").is("[data-macro-body-type='PLAIN_TEXT']"),p(!0,c)):d?p(!0):a?(c.setDisabled("justifyleft",a),c.setDisabled("justifycenter",a),c.setDisabled("justifyright",a)):p(!1)});a.onInit.add(function(a){g.debug("customtoolbar: ed.onInit function");
var c={};b(".aui-toolbar").find("[data-control-id]").each(function(e,d){var f,d=b(d);d.closest(".toolbar-item");f=d.attr("data-control-id");"formatselect"==f?(f=a.theme.controlHandlers[f],f.state.add(function(a){var c=g.Rte.getEditor();"p"==a&&(c=c.selection.getNode(),b(c).closest("p").parent().is("blockquote")&&(a="blockquote"));(a=o.find(".dropdown-item[data-format='"+a+"']").text())&&m.text(a)})):c[f]=d});var e=a.theme.controlHandlers.buttons;e.state.add(function(a,b,e){var d=c[a];d&&(a=d.find(".icon-check"),
d=d.closest(".toolbar-item"),a.length?a.toggleClass("hidden",!e):d.toggleClass(b,e))});b(".aui-toolbar").delegate(".toolbar-item","click",function(a){var c=b(this);if(c.hasClass("disabled"))a.preventDefault();else if(c=c.children(".toolbar-trigger[data-control-id]").attr("data-control-id"))e.click.dispatch(c),a.preventDefault()});b.support.shrinkWrapBlocks=!1;g.debug("customtoolbar: finished ed.onInit function")})},toggleToolbarButton:q,disableToolbarButton:function(a){q(b("."+a.replace(".","")),
!0)},enableToolbarButton:function(a){q(b("."+a.replace(".","")),!1)},focusToolbarButton:function(a){b("."+a.replace(".","")).closest(".aui-button").focus()},isToolbarRowEnabled:function(a){a=k({id:a});return 0<b("#"+a).length&&!b("#"+a).hasClass("disabled")},getToolbarRow:function(a){a=k({id:a});a=b("#"+a);return a.length?a[0]:null},isToolbarButtonEnabled:function(a){return!b("."+a.replace(".","")).closest(".aui-button").prop("disabled")},bindDropdownMenu:l,toggleToolbarButtons:p,getInfo:function(){return{longname:"customtoolbar",
author:"Atlassian",authorurl:"http://www.atlassian.com",infourl:"http://www.atlassian.com/",version:"1.0"}}}});require("confluence/module-exporter").safeRequire("confluence-editor/tinymce3/plugins/customtoolbar/editor_plugin_src",function(b){var g=require("tinymce");g.create("tinymce.plugins.customtoolbar",b);g.PluginManager.add("customtoolbar",g.plugins.customtoolbar)});