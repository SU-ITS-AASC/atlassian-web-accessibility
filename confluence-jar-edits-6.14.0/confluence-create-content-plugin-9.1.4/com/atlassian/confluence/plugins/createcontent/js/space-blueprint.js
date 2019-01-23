define('confluence-create-content/space-blueprint', [], function() {
    return { loaded : AJS.$.Deferred() };
});

/**
 * Shim to continue providing newly-AMD-fied SpaceBlueprint global var.
 */
require('confluence/module-exporter').exportModuleAsGlobal('confluence-create-content/space-blueprint', 'Confluence.SpaceBlueprint');
// Warn developers that still use the shim
AJS.deprecate.prop(window.Confluence.SpaceBlueprint, 'Dialog', {
    sinceVersion: '6.0.6',
    extraInfo: "Use require('confluence-create-content/space-blueprint')"
});