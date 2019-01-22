/**
 * @module confluence-editor/tinymce3/plugins/customtoolbar/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/customtoolbar/editor_plugin_src', [
    'jquery',
    'ajs',
    'confluence/legacy',
    'document',
    'tinymce'
], function(
    $,
    AJS,
    Confluence,
    document,
    tinymce
) {
    "use strict";

    function wireToolbarContext(delegator,editor) {
        //not happy about this. Will be finding a better way to wind everything up.
        //don't want the dependence on the TableToolbar want to query for that some how.
        //the levels of async call backs and editor loading here made it hard.
        $(document).trigger("initContextToolbars.Toolbar", editor);
        $(document).bind("createContextToolbarRow.Toolbar", createContextToolbar)
            .bind('removeContextToolbarRow.Toolbar', removeContextToolbar)
            .bind('enableContextToolbarRow.Toolbar', enableContextToolbar)
            .bind('disableContextToolbarRow.Toolbar', disableContextToolbar);
        delegator.addEventsForComponent("TableToolbar", Confluence.Editor.tableToolbar.Events);
    }

    /**
     *  Adds bindings to close the dropdown menu when typed or clicked in the RTE
     */
    function bindCloseDropDown(dd) {
        var closeMenu = function() {
            dd && dd.hide();
        };

        $(document).bind("showLayer", function(e, type, data){
            if (type=="dropdown" && data == dd) {
                var editor = AJS.Rte.getEditor();
                editor.onClick.add(closeMenu);
                editor.onKeyUp.add(closeMenu);
            }
        }).bind("hideLayer", function(e, type, data) {
            if (type=="dropdown" && data == dd) {
                var editor = AJS.Rte.getEditor();
                editor.onClick.remove(closeMenu);
                editor.onKeyUp.remove(closeMenu);
            }
        });
    }

    //CONFDEV-1921 Formatting should not be allowed inside plain text macro bodies
    function disableDropDown(dropdown) {
        dropdown.addCallback('show', function() {
            if(dropdown.$.parents('.disabled').length) {
                dropdown.hide();
            }
        });
    }

    /**
     * Binds to the color controls and displays picker when needed
     */
    function colorPicker() {
        var control = $('#color-picker-control');

        if (!control.length) {
            return;
        }

        var menu = control.find('.aui-dd-parent');
        var changeColorButton = $('#rte-button-color');
        var colorPreview = changeColorButton.find('.selected-color');
        var dropdown = menu.dropDown('Standard', { alignment: 'left' })[0];
        var defaultColor = changeColorButton.attr('data-color');

        colorPreview.css('background-color', '#' + defaultColor);
        control.delegate('a[data-color]', 'click', function(e) {
            var $this = $(this);
            var color = $this.attr('data-color');

            e.preventDefault();
            if ( $this.closest('.disabled').length ) { //if this part of the toolbar is disabled
                return;
            }

            tinymce.execCommand('ForeColor',false,'#' + color);
            changeColorButton.attr('data-color', color);
            colorPreview.css('background-color','#' + color);
        });

        disableDropDown(dropdown);
        bindCloseDropDown(dropdown);
    }

    /**
     * Binds to the insert table control and displays the picker when needed
     */
    function tablePicker() {
        AJS.Rte.TablePicker.bindToControl(AJS.Rte.getEditor(), $('#insert-table-dropdown'));
    }

    function executeToolbarItem(item, event) {
        var macroName = item.attr("data-macro-name");
        var command = item.attr("data-command");
        var format = item.attr("data-format");
        var controlId = item.attr("data-control-id");
        var editor = AJS.Rte.getEditor();

        if (macroName) {
            tinymce.confluence.macrobrowser.macroBrowserToolbarButtonClicked({presetMacroName: macroName});
        }
        if (command) {
            editor.execCommand(command, false);
        }
        if (format) {
            editor.theme.controlHandlers['formatselect']['click'].dispatch(format);
        }
        if(controlId) {
            editor.theme.controlHandlers['buttons']['click'].dispatch(controlId);
        }
    }

    function enableContextToolbar(e, options) {
        var toolbarId = convertIdToRowId(options);

        $("#" + toolbarId).removeClass("disabled");
    }

    function disableContextToolbar(e, options) {
        var toolbarId = convertIdToRowId(options);

        $("#" + toolbarId).addClass("disabled");
    }

    //could be extended to disable a command as well
    function disableToolbarButton(buttonClass) {
        toggleButton($("." + buttonClass.replace(".","")),true);
    }

    function enableToolbarButton(buttonClass) {
        toggleButton($("." + buttonClass.replace(".","")),false);
    }

    /**
     * Used to toggle a button state
     *
     * @param {jQueryHTMLElement} $button - Button to be disabled
     * @param {boolean} disable - DisabledState
     */
    function toggleButton($button, disable) {
        if (disable) {
            $button.closest(".aui-button").prop("disabled", true).attr("aria-disabled", "true").toggleClass("disabled", disable);
        } else {
            $button.closest(".aui-button").prop("disabled", false).removeAttr("aria-disabled").toggleClass("disabled", disable);
        }
    }

    function isToolbarButtonEnabled(buttonClass) {
        var button = $("." + buttonClass.replace(".",""));
        return !button.closest(".aui-button").prop("disabled");
    }

    function focusToolbarButton(buttonClass) {
        $("." + buttonClass.replace(".","")).closest(".aui-button").focus();
    }

    /**
     * @return the HTML element representing the identified toolbar, or null if not found.
     */
    function getToolbarRow(id) {
        var rowId = convertIdToRowId({ id: id});

        var row = $("#" + rowId);
        if (row.length) {
            return row[0];
        } else {
            return null;
        }
    }

    /**
     * Toggles the disabled state of the toolbar buttons
     *
     * @param {boolean} state - DisabledState
     * @param {boolean} [disableFormatState=false] - Defaults to false
     * @param {boolean} [deep=false] - Disable all inner button and inputs.
     * @param {function} [deepFilter] - jQuery search filter to run on the inner deep disable, defaults to no filter
     */
    function toggleToolbarButtons(state, disableFormatState, deep, deepFilter) {
        var toolBar = $("#toolbar");
        var toolBarItems = toolBar.find(".toolbar-item");
        var moreMenu =   $("#insert-menu, #more-menu");
        var colorPicker = $("#insert-menu, #color-picker-control");
        var formatMenu = $("#format-dropdown");
        var disabledClass = "disabled";
        var filter = deepFilter || function() {
            return true;
        };

        toolBarItems.toggleClass(disabledClass, state);
        moreMenu.toggleClass(disabledClass, state);
        colorPicker.toggleClass(disabledClass, state);

        // format should not disabled by default
        formatMenu.toggleClass(disabledClass, !!disableFormatState);
        AJS.Rte.TablePicker[state ? "disable" : "enable"]();

        // Disable all inner buttons and inputs applied over a filter
        typeof deep!=="undefined" && toolBar.find("button, input").filter(filter).toggleClass("disabled", deep).prop("disabled", deep);
    }

    var formattingDisable = function() {
        var shouldDisable = function(node) {
                node = $(node).closest('PRE,BLOCKQUOTE,.text-placeholder');
                return function(type) {
                    return node.is(type);
                };
            };


        return function(ed,cm,e) {
            var isType = shouldDisable(e);
            var isBlockQuote = isType("BLOCKQUOTE");
            var isPre = isType("PRE");
            var isPlaceholder = isType(".text-placeholder");
            var isInsideNoFormatMacro;

            if (isPre) {
                //check to see if we area also in a macro
                isInsideNoFormatMacro = $(e).parents('table').is("[data-macro-body-type='PLAIN_TEXT']");
                toggleToolbarButtons(true, isInsideNoFormatMacro);
            } else if (isPlaceholder) {
                toggleToolbarButtons(true);
            } else if (isBlockQuote) {
                cm.setDisabled('justifyleft',isBlockQuote);
                cm.setDisabled('justifycenter', isBlockQuote);
                cm.setDisabled('justifyright', isBlockQuote);
            } else {
                //re-enable everything
                toggleToolbarButtons(false);
            }
        };
    };

    // Convert a supplied value to a value suitable for identifying a toolbar row
    function convertIdToRowId(options) {
        var toolbarId = "default";
        if (options && options.id) {
            toolbarId = options.id;
        }

        return "rte-toolbar-row-" + toolbarId;
    }

    // check if a toolbar with the supplied id already exists
    function isAlreadyPresent(val) {
        return $("#" + val).length > 0;
    }

    /**
     * @return true if the identifier toolbar is enabled.
     */
    function isToolbarRowEnabled(id) {
        var toolbarId = convertIdToRowId({ id: id });

        return isAlreadyPresent(toolbarId) && !$("#" + toolbarId).hasClass("disabled");
    }

    //added a timeouts to ensure that if we change between showing and hiding it will not flicker and slide in and out.
    //better ux
    var toolbarTimeout;

    function removeContextToolbar(e, options) {
        var animate = options.animate;
        if (animate == undefined) {
            animate = true;
        }

        var callback = function() {
            $(this).remove();
            $(document).trigger("resize.resizeplugin");
            if (options.onHide) {
                options.onHide();
            }
        };
        clearTimeout(toolbarTimeout);
        toolbarTimeout = setTimeout(function() {
            var toolbarId = convertIdToRowId(options);
            var toolbar = $("#" + toolbarId);
            if (animate) {
                toolbar.slideUp(400, callback);
            } else {
                toolbar.hide();
                callback.call(toolbar);
            }

        }, 100);
    }

    /**
     * options.editorAdjacent - if true then the toolbar is preferred to remain the nearest one to the editor
     * even when later toolbars are opened.
     */
    function createContextToolbar(e, options) {
        var toolbarId = convertIdToRowId(options);

        var animate = options.animate;
        if (animate == undefined) {
            animate = true;
        }

        if (isAlreadyPresent(toolbarId)) {
            // CONFDEV-25560 Prevent race condition when the deferred row.slideDown gets cancel
            // and we end up with an existent (but hidden) toolbar element that can not be shown again.
            // This pretends to be a small, safe change to avoid a major refactoring at this time.
            $("#" + toolbarId + ":hidden").slideDown(400, function(){
                AJS.debug('Prevented toolbar deferred display race condition');
            });
            return;
        }

        var row = $("<div></div>").addClass("toolbar-split toolbar-split-row toolbar-contextual");

        row.attr("id",toolbarId);

        if (options.editorAdjacent) {
            row.addClass("editor-adjacent");
        }

        //CONFDEV-39705: select toolbar which is visible to make sure it is element of active editor
        var toolbar = !options.topToolbar ? $("#savebar-container .aui-toolbar:visible")  : $("#rte-toolbar.aui-toolbar:visible");
        for(var i = 0, length = options.buttons.length; i < length; i++) {
            row.append(options.buttons[i].render());
        }

        row.css({"display": "none"});

        if (options.editorAdjacent) {
            toolbar.append(row);
        } else {
            // insert this new toolbar immediately before the first editorAdjacent one found
            var firstEditorAdjacentToolbar = $(".editor-adjacent", toolbar).filter(":first");
            if (firstEditorAdjacentToolbar.length) {
                firstEditorAdjacentToolbar.before(row);
            } else {
                toolbar.append(row);
            }
        }

        row.find('.toolbar-dropdown').each(function() {
            bindDropdownMenu(this);
        });

        var callback = function() {
            $(document).trigger("resize.resizeplugin").trigger("shown.contextToolbar");
            if (options.onVisible) {
                options.onVisible();
            }
        };

        clearTimeout(toolbarTimeout);
        toolbarTimeout = setTimeout(function() {
            if (animate) {
                row.slideDown(400, callback);
            } else {
                row.show();
                callback();
            }
        }, 100);
    }

    function bindDropdownMenu(id) {
        var menu = $(id);
        var dropdown = menu.dropDown("Standard", { alignment: menu.data('dropdown-alignment') || "left" })[0];

        menu.find(".dropdown-item").click(function(e) {
            var item = $(this);
            executeToolbarItem(item, e);
            dropdown.hide();
            e.preventDefault();
        });

        disableDropDown(dropdown);
        bindCloseDropDown(dropdown);
    }

    function editorHints() {
        var TinyMCELang  = require('confluence-editor/i18n/translations.i18n');
        var hints = [];
        for (var hint in TinyMCELang.hints) {
            hints.push("hints." + hint);
        }
        var hintManager = Confluence.hintManager(hints);
        var updateHint = function () {
            $("#rte-savebar .hints-text").html(AJS.Rte.getEditor().getLang(hintManager.getNextHint()));
        };
        updateHint();
        $("#rte-savebar a.hints-close").click(function (e) {
            $(this).closest(".toolbar-split").addClass("hidden");
            e.preventDefault();
        });
        $("#rte-savebar a.hints-next").click(function (e) {
            updateHint();
            e.preventDefault();
        });
    }

    return {

        init: function (ed) {
            bindDropdownMenu("#format-dropdown");
            bindDropdownMenu("#more-menu .aui-dd-parent");
            bindDropdownMenu("#insert-menu .aui-dd-parent");
            if ($("#pagelayout-menu").length) {
                bindDropdownMenu("#pagelayout-menu .aui-dd-parent");
            }
            if ($("#template-menu").length) {
                bindDropdownMenu("#template-menu .aui-dd-parent");
            }

            colorPicker();
            tablePicker();
            editorHints();

            // TODO: we still need to think about this
            wireToolbarContext(AJS.Rte.EventDelegator(ed),ed);

            var formatDropDown = $("#format-dropdown");
            var dropDownTextHolder = formatDropDown.find("span.dropdown-text");

            ed.onBeforeExecCommand.add(function(ed, cmd, ui, val, context) {
                // CONFDEV-3535: Reset to left alignment if in style that does not support alignment.
                $.each(['pre','blockquote'], function() {
                    if (cmd == "FormatBlock" && val == this) {
                        ed.formatter.remove('alignleft');
                        ed.formatter.remove('aligncenter');
                        ed.formatter.remove('alignright');
                    }
                });

                // CONFDEV-767/CONFDEV-1408: Prevent styles, links and macros from being used within a pre block or text placeholder.
                if ($(ed.selection.getNode()).closest("pre,.text-placeholder").length) {
                    var toDisable = ["Bold", "Italic", "Underline", "Strikethrough", "InsertUnorderedList",
                        "InsertOrderedList", "InsertInlineTaskList", "InsertInlineTaskListNoToggle", "superscript", "subscript", "mceConfMacroBrowser", "mceConfimage",
                        "mceConfAttachments", "mceEmotion", "InsertWikiMarkup", "mceConflink", "mceInsertTable",
                        "mceConfAutocompleteLink"];
                    var toDisableLen = toDisable.length;

                    for (var i = 0; i < toDisableLen; i++) {
                        if (cmd == toDisable[i]) {
                            context.terminate = true;
                        }
                    }
                }

                // Remove existing formatting before applying a pre style.
                if ((cmd == "FormatBlock") && (val == "pre")) {
                    ed.undoManager.add();
                    ed.execCommand("removeFormat");
                }

                // Block
                // if going from blockquote to paragraph format, we need to execute the
                // blockquote command again to remove formatting - that's just how tinymce works
                if (cmd == "FormatBlock" && val == "p") {
                    var blockquote = formatDropDown.find(".dropdown-item[data-format='blockquote']").text();
                    if (dropDownTextHolder.text() == blockquote) {
                        context.terminate = true;
                        ed.execCommand("FormatBlock", false, "blockquote");
                    }
                }
                // only remove format if text is selected
                else if (cmd == "FormatBlock" && val == "removeformat" && ed.selection.isCollapsed()) {
                    context.terminate = true;
                    AJS.debug("Not removing format for no selected text");
                }
            });

            // Update format dropdown display text
            ed.onExecCommand.add(function(ed, cmd, ui, val, context) {
                if (cmd == "FormatBlock") {
                    var format = formatDropDown.find(".dropdown-item[data-format='" + val + "']");
                    if (!format.length) { // default to paragraph format
                        format = formatDropDown.find(".dropdown-item[data-format='p']");
                    }
                    dropDownTextHolder.text(format.text());
                }
            });

            ed.onNodeChange.add(formattingDisable());

            ed.onInit.add(function(ed) {
                AJS.debug("customtoolbar: ed.onInit function");
                var toolbarButtons = {};
                $(".aui-toolbar").find('[data-control-id]').each(function(i, trigger) {
                    var toolbarItem;
                    var id;
                    var control;

                    trigger = $(trigger);
                    toolbarItem = trigger.closest(".toolbar-item");
                    id = trigger.attr("data-control-id");

                    if (id == "formatselect") {
                        // bindings for format drop down
                        control = ed.theme.controlHandlers[id];
                        control['state'].add(function(name) {
                            var editor = AJS.Rte.getEditor();
                            if (name == "p") {
                                var n = editor.selection.getNode();
                                // fix bug in advanced theme where it always shows paragraph format when in a blockquote
                                if($(n).closest("p").parent().is("blockquote")) {
                                    name = "blockquote";
                                }
                            }
                            var text = formatDropDown.find(".dropdown-item[data-format='" + name + "']").text();
                            if (text) {
                                dropDownTextHolder.text(text);
                            }
                        });
                    } else {
                        toolbarButtons[id] = trigger;
                    }
                });

                var control = ed.theme.controlHandlers['buttons'];

                //state can be: 'disabled' or 'active'
                control['state'].add(function(format, state, toggle){
                    var button = toolbarButtons[format];

                    if (!button) {
                        return;
                    }

                    var icon = button.find('.icon-check');

                    var toolbarItem = button.closest(".toolbar-item");

                    if (!icon.length) {
                        toolbarItem.toggleClass(state, toggle);
                    } else {
                        icon.toggleClass('hidden', !toggle);
                    }
                });

                $('.aui-toolbar').delegate('.toolbar-item', 'click', function (e) {
                    var $self = $(this);
                    if (!$self.hasClass('disabled')) {
                        var format = $self.children('.toolbar-trigger[data-control-id]').attr('data-control-id');
                        if (format) {
                            control['click'].dispatch(format);
                            e.preventDefault();
                        }
                    } else {
                        // stop activation of navigation to # (i.e. top of page) when disabled
                        e.preventDefault();
                    }
                });

                // https://jira.atlassian.com/browse/CONFDEV-11912#comment-439048
                $.support.shrinkWrapBlocks = false;

                AJS.debug("customtoolbar: finished ed.onInit function");
            });
        },
        toggleToolbarButton: toggleButton,
        disableToolbarButton: disableToolbarButton,
        enableToolbarButton: enableToolbarButton,
        focusToolbarButton: focusToolbarButton,
        isToolbarRowEnabled : isToolbarRowEnabled,
        getToolbarRow : getToolbarRow,
        isToolbarButtonEnabled : isToolbarButtonEnabled,
        bindDropdownMenu : bindDropdownMenu,
        toggleToolbarButtons: toggleToolbarButtons,

        getInfo: function () {
            return {
                longname: 'customtoolbar',
                author: 'Atlassian',
                authorurl: 'http://www.atlassian.com',
                infourl: 'http://www.atlassian.com/',
                version: "1.0"
            };
        }
    };
});

require('confluence/module-exporter')
        .safeRequire('confluence-editor/tinymce3/plugins/customtoolbar/editor_plugin_src', function(CustomToolbarPlugin) {
            var tinymce = require('tinymce');

            tinymce.create('tinymce.plugins.customtoolbar', CustomToolbarPlugin);

            // Register plugin
            //noinspection JSUnresolvedVariable
            tinymce.PluginManager.add('customtoolbar', tinymce.plugins.customtoolbar);
        });