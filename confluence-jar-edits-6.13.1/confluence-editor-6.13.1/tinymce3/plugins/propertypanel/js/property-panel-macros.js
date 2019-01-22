/**
 * @module confluence-editor/tinymce3/plugins/propertypanel/js/property-panel-macros
 */
define('confluence-editor/tinymce3/plugins/propertypanel/js/property-panel-macros', [
    'ajs',
    'tinymce',
    'jquery',
    'confluence/legacy',
    'document',
    'confluence/macro-js-overrides',
    'underscore'
], function(
    AJS,
    tinymce,
    $,
    Confluence,
    document,
    MacroJsOverrides,
    _
) {
    "use strict";

    var registeredEvents = [];
    var globalInitHandlers = [];
    var macroInitHandlers = {};
    var eventNamespace = ".property-panel";
    var spacerKey = "__PROPERTY_PANEL_SPACER";
    var spacer = [{key: spacerKey}];

    return {
        name : "macro",

        registeredEvents: registeredEvents,

        canHandleElement : function ($element) {
            return ($element.hasClass("editor-inline-macro") || $element.hasClass("wysiwyg-macro"));
        },

        handle : function (data) {
            if (data.e.type !== "click" && data.e.type !== "mouseup") { // only activate this panel on click
                return;
            }

            var descriptor = this;
            var macroNode = data.containerEl;
            var $macroNode = $(macroNode);
            var macroName;
            var macroButtons = [];
            var bodyMacro = !$macroNode.hasClass("editor-inline-macro");
            var isKnownMacro = !$macroNode.hasClass("wysiwyg-unknown-macro");
            var buttons = [];
            var options = {
                originalHeight : bodyMacro && $macroNode.height(),
                anchorIframe: AJS.Rte.getEditorFrame()
            };

            var createButtonHandlerKey = function(eventName, macroName) {
                return  eventName + "-button-click" + (macroName ? macroName + ".macro" : "") + eventNamespace;
            };

            var asMacroButtons = function(controlsArray)
            {
                // At the moment we only support button controls
                var buttonsArray = _.filter(controlsArray, function(connectButton) { return connectButton.type === "button";});
                return _.map(buttonsArray, function(connectButton) {
                    return {
                        key: connectButton.key,
                        label: connectButton.name.value
                    };
                });
            };

            function storeButtonsForKnownMacro() {
                var connectControlsResolved = $.Deferred();
                macroName = $macroNode.attr("data-macro-name");
                if (AJS.MacroBrowser.getMacroMetadata(macroName)) {
                    macroButtons = AJS.MacroBrowser.getMacroMetadata(macroName).buttons;
                }
                var getConnectControls = MacroJsOverrides.getFunction(macroName, "getControls");
                if (getConnectControls) {
                    getConnectControls(function(controls)
                    {
                        var originalButtons = macroButtons;
                        var connectButtons = asMacroButtons(controls);
                        // Add spacers on either side of the connect buttons
                        macroButtons = originalButtons.concat(spacer).concat(connectButtons).concat(spacer);
                        connectControlsResolved.resolve();
                    });
                } else {
                    connectControlsResolved.resolve();
                }

                return connectControlsResolved.done(function() {
                    var editClass = "macro-placeholder-property-panel-edit-button";
                    if (macroButtons.length > 0 && macroButtons[0].key == spacerKey) {
                        editClass += " last";
                    }

                    buttons.push({
                        className: editClass,
                        text: AJS.I18n.getText("property.panel.macro.edit"),
                        click: function () {
                            AJS.Confluence.PropertyPanel.destroy();
                            tinymce.confluence.macrobrowser.editMacro($macroNode);
                        }
                    });

                    $.each(macroButtons, function(i, item) {
                        if (item.key == spacerKey) {
                            return;
                        }
                        var cls = "macro-property-panel-" + item.key;
                        if (i > 0 && macroButtons[i-1].key == spacerKey) {
                            cls += " first";
                        }
                        if (i < (macroButtons.length - 1) && macroButtons[i+1].key == spacerKey) {
                            cls += " last";
                        }

                        buttons.push({
                            className: cls,
                            text: item.label,
                            parameterName: item.key,
                            click: function() {
                                $(document).trigger(createButtonHandlerKey(item.key), $macroNode); // legacy support
                                $(document).trigger(createButtonHandlerKey(item.key, macroName), $macroNode);
                                AJS.Confluence.PropertyPanel.destroy();
                            }
                        });
                    });
                });
            }

            function setupOtherButtonsAndCreatePropertyPanel() {
                // Always add the remove button, whether we are known macro or not
                var removeClass = "macro-placeholder-property-panel-remove-button";
                if (macroButtons.length > 0 && macroButtons[macroButtons.length-1].key == spacerKey) {
                    removeClass += " first";
                }
                buttons.push({
                    className: removeClass,
                    text: AJS.I18n.getText("property.panel.macro.remove"),
                    click: function () {
                        AJS.Confluence.PropertyPanel.destroy();
                        // Using a command makes sure the code goes through the tinymce undo code paths.
                        // Ideally, we would use this command to remove the macro but there seems to be selection problems.
                        // AJS.Rte.getEditor().execCommand("mceRemoveNode", false, macroNode);
                        AJS.Rte.getEditor().execCommand("mceConfRemoveMacro", macroNode);
                    }
                });

                // If the macro has an 'atlassain-macro-output-type' parameter, add inline and block buttons
                if ($macroNode.attr("data-macro-parameters")) {

                    var macroParameters = Confluence.MacroParameterSerializer.deserialize($macroNode.attr("data-macro-parameters"));

                    if ("atlassian-macro-output-type" in macroParameters) {

                        var createClickHandlerFor = function (macroOutputType) {
                            return function (buttonElement) {
                                macroParameters["atlassian-macro-output-type"] = macroOutputType;
                                $macroNode.attr("data-macro-parameters", Confluence.MacroParameterSerializer.serialize(macroParameters));

                                if (macroOutputType == "INLINE") {
                                    $(".macro-placeholder-property-panel-display-newline-button").removeClass("active");
                                } else {
                                    $(".macro-placeholder-property-panel-display-inline-button").removeClass("active");
                                }

                                $(buttonElement).addClass("active");
                            };
                        };

                        buttons.push(null); // spacer
                        buttons.push({
                            className: "macro-placeholder-property-panel-display-newline-button",
                            tooltip: AJS.I18n.getText("property.panel.macro.display.newline"),
                            selected: macroParameters["atlassian-macro-output-type"] == "BLOCK",
                            click: createClickHandlerFor("BLOCK")
                        });
                        buttons.push({
                            className: "macro-placeholder-property-panel-display-inline-button",
                            tooltip: AJS.I18n.getText("property.panel.macro.display.inline"),
                            selected: macroParameters["atlassian-macro-output-type"] == "INLINE",
                            click: createClickHandlerFor("INLINE")
                        });
                    }
                }

                // Bind button handlers registered with 'registerButtonHandler'
                $.each(registeredEvents, function() {
                    if(!this.macroName /* legacy support */ || this.macroName == macroName) {
                        $(document).bind(createButtonHandlerKey(this.id, this.macroName), this.handler);
                    }
                });

                // Merge global init handlers with macro specific init handlers and then run them all
                var mergedInitHandlers = globalInitHandlers;
                if(macroName && macroInitHandlers[macroName]) {
                    mergedInitHandlers = mergedInitHandlers.concat(macroInitHandlers[macroName]);
                }
                $.each(mergedInitHandlers, function() {
                    try {
                        this(macroNode, buttons, options);
                    } catch (ex) {
                        AJS.debug("Property panel init handler failed for : " + macroName + ".  Is global handler : " + ($.inArray(this, globalInitHandlers) > -1), ex);
                    }
                });

                // Create property panel and inject iframe if macro has been added via connect
                if (buttons.length > 0) {
                    var currentPanel = AJS.Confluence.PropertyPanel.createFromButtonModel("macro", macroNode, buttons, options);

                    var propertyPanelIFrameInjector = MacroJsOverrides.getFunction(macroName, "propertyPanelIFrameInjector");
                    if (propertyPanelIFrameInjector) {
                        propertyPanelIFrameInjector(currentPanel);
                    }
                }
            }

            if (isKnownMacro) {
                storeButtonsForKnownMacro().then(setupOtherButtonsAndCreatePropertyPanel());
            } else {
                setupOtherButtonsAndCreatePropertyPanel();
            }
        },

        registerButtonHandler: function(ids, handler, macroName) {
            if (!Array.isArray(ids)) {
                ids = [ids];
            }
            ids.forEach(function(id) {
                registeredEvents.push({
                    id: id,
                    handler: handler,
                    macroName: macroName
                });
            });
        },

        registerInitHandler: function(handler, macroName) {
            if(macroName) {
                macroInitHandlers[macroName] = macroInitHandlers[macroName] || [];
                macroInitHandlers[macroName].push(handler);
            } else {
                globalInitHandlers.push(handler);
            }
        },

        yieldButtonFor: function(buttonsArray, parameterName) {
            var button;
            $.each(buttonsArray, function() {
                if(this.parameterName && this.parameterName == parameterName) {
                    button = this;
                }
            });
            return button;
        }
    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/tinymce3/plugins/propertypanel/js/property-panel-macros', 'AJS.Confluence.PropertyPanel.Macro', function(PropertyPanelMacro) {
    var AJS = require('ajs');

    AJS.bind("init.rte", function() {
        // defer trigger to ensure any listeners have had a chance to load.
        AJS.trigger("add-handler.property-panel", PropertyPanelMacro);
    });
});
