/**
 * The 3rd and 4th arguments ensure that this module is executed synchronously, to register
 * the ViewFilePoller plugin before AJS.Rte.BootstrapManager.initialise is executed.
 *
 * This is necessary at the moment because we're still in the process of switching over to using
 * AMD throughout the codebase, and don't yet have a holistic approach to ensuring that all
 * TinyMCE plugins are registered before AJS.Rte.BootstrapManager.initialise is called.
 */
require([
    "ajs",
    "tinymce",
    "vfm/components/view-file-macro-properties-panel",
    "vfm/components/view-file-macro-link-properties-panel",
    "vfm/components/vfm-editor-poller"
],
function (
    AJS,
    tinymce,
    ViewFileMacroPropertiesPanel,
    ViewFileMacroLinkPropertiesPanel,
    VFMEditorPoller
) {
    "use strict";

    AJS.toInit(function () {
        AJS.MacroBrowser.setMacroJsOverride("view-file", {opener: function (macro) {
            // do nothing because we don"t allow user to edit
        }});

        ViewFileMacroPropertiesPanel.init();
        ViewFileMacroLinkPropertiesPanel.init();
    });

    tinymce.create('tinymce.plugins.ViewFilePoller', {
        init: function (ed) {
            AJS.bind("rte-ready", function () {
                VFMEditorPoller.startPolling();
            });

            AJS.bind("rte-destroyed", function () {
                VFMEditorPoller.stopPolling();
            });
        }
    });

    // register plugin
    tinymce.PluginManager.add('viewFilePoller', tinymce.plugins.ViewFilePoller);

    // enable plugin in editor
    AJS.Rte.BootstrapManager.addTinyMcePluginInit(function(settings) {
        settings.plugins += ",viewFilePoller";
    });
},
undefined,
true);