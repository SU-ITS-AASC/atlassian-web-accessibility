define('confluence-editor/tinymceplugin/auiwindowmanager', [
    'ajs',
    'tinymce',
    'jquery',
    'raphael',
    'window',
    'confluence/api/constants'
], function (AJS,
             tinymce,
             $,
             Raphael,
             window,
             CONSTANTS) {
    "use strict";

    // Hard coded numbers not nice at all, but see dialog.js HEADER_HEIGHT and BUTTONS_HEIGHT :(
    var DIALOG_HEADER_SIZE = 56;
    var DIALOG_BUTTON_PANEL_SIZE = 51;
    var DIALOG_CONTENT_PADDING = 20;

    var Dispatcher = tinymce.util.Dispatcher;
    var each = tinymce.each;
    var isIE = tinymce.isIE;
    var isOpera = tinymce.isOpera;

    var AUIWindowManager = {
        init: function (ed, url) {
            // Replace window manager
            ed.onBeforeRenderUI.add(function () {
                ed.windowManager = new tinymce.AUIWindowManager(ed);
                // DOM.loadCSS(url + '/skins/' + (ed.settings.inlinepopups_skin || 'clearlooks2') + "/window.css");
            });
        },

        getInfo: function () {
            return {
                longname: 'AUIWindowManager',
                author: 'Atlassian',
                authorurl: 'http://www.atlassian.com',
                version: tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };

    var WindowManager = {
        /**
         * Create the AUIWindowManager plugin.
         * @constructor
         */
        AUIWindowManager: function (ed) {
            var t = this;

            t.editor = ed;
            t.onOpen = new Dispatcher(t);
            t.onClose = new Dispatcher(t);
            t.params = {};
            t.features = {};
            t.modalDialogsStack = [];
            t.dialogs = {};
            t.count = 0;
        },

        /**
         * Open and return a window as specified by the settings parameter.
         *
         * The created window is returned and should be supplied to the close function to dismiss it later.
         *
         * Note that regardless of the setting, all windows in this Window Manager are modal. Likewise, they are
         * not resizeable and their position is centred regardless of the position requested.
         *
         * The following settings are supported -
         *     name (string) - Window title resource key - will be localized.
         *     file (string) - URL of the file to open in the window.
         *     content (string) - HTML Content to be used. This is only applicable for non-popup windows and will be used
         *     in preference to the file setting
         *     width (int) - Width in pixels. (default 400)
         *     height (int) - Height in pixels. (default 250)
         *     popup (boolean) - defaults to true. Indicates that the window contents should be rendered in an
         *                       iframe, for compatibility with standard TinyMCE plugins.
         *
         * The following custom params are supported -
         *     cssClass (string) - a CSS class to put on the opened dialog (default is tinymce-auidialog)
         *     helpLink (string) - the property name of a help link you want added to the dialog.
         *     buttons (array[Object]) - an array of buttons to be added in order.
         *                               Each item in the array should have a label String and an action function.
         *     cancelLink (boolean) - specified whether a cancel button should be automatically added - defaults to true.
         *
         * @returns the id of the dialog opened.
         */
        open: function (settings, params) {
            var t = this;
            var f = '';
            var x;
            var y;
            var sw;
            var sh;
            var vp = tinymce.DOM.getViewPort();
            var u;

            settings = settings || {};
            t.initialiseSettings(settings);

            params = params || {};
            sw = isOpera ? vp.w : screen.width; // Opera uses windows inside the Opera window
            sh = isOpera ? vp.h : screen.height;

            params = this.setDefaultParameters(params);
            params.mce_width = settings.width;
            params.mce_height = settings.height;
            params.mce_auto_focus = settings.auto_focus;

            if (isIE) {
                settings.center = true;
                settings.help = false;
                settings.dialogWidth = settings.width + 'px';
                settings.dialogHeight = settings.height + 'px';
            }

            t.features = settings;
            t.params = params;
            t.onOpen.dispatch(t, settings, params);

            var height = settings.height;
            if (settings.name) {
                height += DIALOG_HEADER_SIZE;
            }

            if (params.cancelLink || params.buttons) {
                height += DIALOG_BUTTON_PANEL_SIZE;
            }

            // include the padding
            height += (2 * DIALOG_CONTENT_PADDING);

            // add an arbitrary amount to cope with the user agent border that is often applied to iframes
            if (settings.popup) {
                height = height + 8;
            }

            var id = settings.id || tinymce.DOM.uniqueId();
            var dialog = new AJS.ConfluenceDialog({
                width: settings.width,
                height: height,
                id: id,
                onCancel: function () {
                    dialog.hide().remove();
                }
            });
            if (settings.name) {
                dialog.addHeader(this.editor.getLang(settings.name));
            }

            this.createDialogButtons(dialog, params, id);

            settings.file = settings.file || settings.url;
            if (settings.file) {
                settings.file = tinymce._addVer(settings.file);
            }

            this.createDialogContent(dialog, settings, params, id);
            params.helpLink && this.createHelpLink(dialog, params.helpLink, params.helpName, id);
            params.hintText && this.createHintText(dialog, params.hintText, id);

            // Add window so it can be managed elsewhere if necessary
            var dialogDetails = {
                id: id,
                settings: settings,
                params: params,
                dialog: dialog
            };

            this.modalDialogsStack.push(dialogDetails);
            this.dialogs[id] = dialogDetails;
            this.count++;

            AJS.Rte.BookmarkManager.storeBookmark();
            dialog.show();

            if (dialog.takeFocus != undefined) {
                dialog.takeFocus();
            }

            // IE 8 is getting confused with the panel size layout and always including scrollbars.
            // This fixes it.
            if (isIE) {
                $("#" + id).css("overflow", "hidden");
                $("#" + id + " ." + params.cssClass).css("overflow", "hidden");
            }

            return id;
        },

        initialiseSettings: function (settings) {
            settings.width = parseInt(settings.width || 400, 10);
            settings.height = parseInt(settings.height || 250, 10);
            settings.resizable = false;
            if (settings.popup == undefined) {
                settings.popup = true;
            }

            if (settings.popup && settings.content != undefined) {
                settings.popup = false;
            }

            if (settings.scrollbars) {
                settings.scrollbars = "yes";
            } else {
                settings.scrollbars = "no";
            }
        },

        /**
         * Create any specified buttons on the dialog, as well as adding a help link if the parameter
         * is supplied
         */
        createDialogButtons: function (dialog, parameters, dialogId) {
            if (parameters.buttons) {
                var i = 0;
                for (i = 0; i < parameters.buttons.length; i++) {
                    var buttonDef = parameters.buttons[i];
                    dialog.addButton(this.editor.getLang(buttonDef.label), buttonDef.action);
                }
            }

            if (parameters.cancelLink) {
                dialog.addCancel(this.editor.getLang("auiwindowmanager.cancel"), function () {
                    return tinymce.activeEditor.windowManager.close(dialogId);
                });
            }
        },


        /**
         * Create the content of the dialog taking into account whether an iframe is required or
         * dynamic loading into the DOM.
         */
        createDialogContent: function (dialog, settings, params, id) {

            var contentId = this.createContentId(id);
            var panelId = "panel_" + contentId;
            if (settings.popup) {
                dialog.addPanel(panelId, $("<iframe id='" + contentId + "' width='100%' height='" + settings.height + "px' frameborder='0' name='auidialogiframe' src='" + settings.file + "' scrolling='" + settings.scrollbars + "'></iframe>"), params.cssClass);
                dialog.takeFocus = function () {
                    $("#" + contentId).focus();
                };
            } else {
                if (settings.content == undefined) {
                    // Dynamically loading the panel content from the settings.file
                    dialog.addPanel(panelId, $("<div id='" + contentId + "'/>"), params.cssClass);
                    // Load the content of the window
                    $("#" + contentId).load(settings.file);
                    // TODOXHTML Add some error handling for when the content doesn't load
                } else {
                    // Statically provided panel content
                    dialog.addPanel(panelId, $("<div id='" + contentId + "'>" + settings.content + "</div>"), params.cssClass);
                }

                dialog.takeFocus = function () {
                    // set the focus to the first input element found
                    var inputs = $("#" + contentId + " :input");
                    if (inputs.length) {
                        $(inputs[0]).focus();
                    } else {
                        // set focus to the first button found on the dialog
                        var buttons = $("#" + contentId + " .button-panel button");
                        if (buttons.length) {
                            $(buttons[0]).focus();
                        }
                    }
                };
            }

            dialog.gotoPanel(0, 0);
        },

        //can be used to render help text directly instead of making a request for a link
        createHintText: function (dialog, hintText, id) {
            var tip = $("<div></div>").addClass("dialog-tip");
            tip.text(tinymce.activeEditor.getLang(hintText));
            $("#" + id + " .dialog-button-panel").append(tip);
        },

        /**
         * If specified in the settings then add a help link to the button bar of the dialog.
         */
        createHelpLink: function (dialog, linkKey, linkName, id) {
            var helpLink = $("<div></div>").addClass("dialog-help-link");
            helpLink.load(CONSTANTS.CONTEXT_PATH + "/plugins/tinymce/helplink.action", {
                linkUrlKey: linkKey,
                linkNameKey: (linkName || "")
            });
            $("#" + id + " .dialog-components .dialog-title").prepend(helpLink);
        },

        /**
         * Close the specified window
         */
        close: function (win, id) {
            var dialogId;
            var dialog;
            if (typeof win === 'string') {
                dialogId = win;
            } else if (id) {
                dialogId = id;
            } else {
                // a window was supplied, without an id so we just assume the last opened dialog is to
                // be closed
                dialog = this.modalDialogsStack.pop();
                if (dialog) {
                    dialogId = dialog.id;
                }
            }

            if (!this.dialogs[dialogId]) {
                AJS.log("Couldn't find id " + dialogId + " in dialogs array so dialog is not closed.");
            } else {
                this.count--;
                dialog = this.dialogs[dialogId];
                dialog.dialog.remove();
                this.dialogs[dialogId] = null;

                // set focus back to the editor
                tinymce.activeEditor.focus();

                AJS.Rte.BookmarkManager.restoreBookmark();
            }
            return false;
        },

        alert: function (title, callback, scope, w) {
            var settings = {
                content: "<p>" + title + "</p>",
                width: 500,
                height: 160,
                popup: false
            };

            var alertDialogId;

            var okCallback = function () {
                tinymce.activeEditor.windowManager.toggleOtherDialogs(alertDialogId, true);
                tinymce.activeEditor.windowManager.close(alertDialogId);
                if (callback) {
                    callback.call(scope || this);
                }
            };

            var params = {
                buttons: [{
                    label: "auiwindowmanager.ok",
                    action: okCallback
                }],
                cancelLink: false,
                cssClass: "tinymce-auidialog-alert"
            };

            alertDialogId = this.open(settings, params);

            // Disable the buttons on all the other dialogs while the alert is shown.
            this.toggleOtherDialogs(alertDialogId, false);
        },

        createInstance: function (cl, a, b, c, d, e) {
            var f = tinymce.resolve(cl);

            return new f(a, b, c, d, e);
        },

        // Hide the button panel on all dialogs except the alert one that was just opened.
        // The button panel may contain a cancel link so disabling is not enough. A hide is required.
        toggleOtherDialogs: function (alertDialogId, enable) {
            var i = 0;
            for (i = 0; i < this.modalDialogsStack.length; i++) {
                var dialog = this.modalDialogsStack[i];
                if (dialog.id != alertDialogId) {
                    $("#" + dialog.id + " .dialog-button-panel").toggle(enable);
                }
            }
        },

        confirm: function (t, cb, s, w) {
            w = w || window;

            cb.call(s || this, w.confirm(this._decode(this.editor.getLang(t, t))));
        },

        /**
         * Change the busy status of the dialog. If true then the dialog will indicate it is busy and not accept
         * any input. If false then the dialog should revert to it's normal state.
         *
         *  @param dialogId The id of the dialog to change the status of
         *  @param status true or false.
         */
        setBusy: function (dialogId, busy) {
            var dialog = this.dialogs[dialogId];
            if (!dialog) {
                return;
            }

            if (busy) {
                var busyId;
                var busyPanel;
                var content;
                var contentId;

                // hide the content panel for this dialog
                contentId = this.createContentId(dialogId);
                content = $("#" + contentId);

                content.hide();
                var contentHolder = content.parent();
                busyId = this.createBusyContentId(dialogId);
                busyPanel = $("#" + busyId, contentHolder);
                if (!busyPanel.length) {
                    contentHolder.append($("<div id='" + busyId + "' class='spinner'></div>"));
                    busyPanel = $("#" + busyId, contentHolder);
                    Raphael.spinner(busyPanel[0], 50, "#666");
                }

                $(".button-panel button", $("#" + dialogId)).each(function (index, element) {
                    $(element).prop("disabled", true);
                });

                $(busyPanel[0]).show();
            } else {
                // hide the busy panel and show the content again
                busyId = this.createBusyContentId(dialogId);
                busyPanel = $("#" + busyId);
                if (busyPanel.length) {
                    $(busyPanel[0]).hide();
                }

                contentId = this.createContentId(dialogId);
                content = $("#" + contentId);

                $(".button-panel button", $("#" + dialogId)).each(function (index, element) {
                    $(element).prop("disabled", false);
                });

                $(content[0]).show();
            }
        },

        logMCESelection: function (title) {
            var s = tinymce.activeEditor.selection;
            AJS.log("******************************");
            AJS.log("Logging TinyMCE selection title:    " + title);
            AJS.log("Bookmark:");
            AJS.log(s.getBookmark());
            var rangeNodeText = $(s.getRng().startContainer).text() || $(s.getRng().startContainer.parentNode).text();
            AJS.log("Range: " + rangeNodeText);
            AJS.log(s.getRng());
        },

        //
        // ---- Internal functions --------------------------------------------
        //
        setDefaultParameters: function (params) {
            params.inline = false;

            if (!params.cssClass) {
                params.cssClass = "tinymce-auidialog";
            }

            if (params.cancelLink != false) {
                params.cancelLink = true;
            }

            return params;
        },

        /**
         * @param id the id to create a content id for.
         * @return a contentId for the supplied id
         */
        createContentId: function (id) {
            return "content_" + id;
        },

        createBusyContentId: function (id) {
            return "content_busy_" + id;
        }

    };

    /**
     * @exports confluence-editor/tinymceplugin/auiwindowmanager
     */
    return {
        AUIWindowManager: AUIWindowManager,
        WindowManager: WindowManager
    };
});


require('confluence/module-exporter').safeRequire('confluence-editor/tinymceplugin/auiwindowmanager', function (windowManager) {
    var tinymce = require('tinymce');

    tinymce.create('tinymce.plugins.AUIWindowManager', windowManager.AUIWindowManager);
    tinymce.create('tinymce.AUIWindowManager:tinymce.WindowManager', windowManager.WindowManager);

    // Register plugin
    tinymce.PluginManager.add('auiwindowmanager', tinymce.plugins.AUIWindowManager);
});