/**
 * @module confluence-editor/support/atlassian-editor-support
 */
define('confluence-editor/support/atlassian-editor-support', [
    'ajs',
    'confluence/meta'
], function (AJS,
             Meta) {
    "use strict";

    return {
        inlineTasks: function () {
            var useInlineTasks = Meta.get('use-inline-tasks');
            return useInlineTasks === "true" || useInlineTasks === true;
        },
        isCollaborativeContentType: function () {
            var contentType = Meta.get('content-type');
            return Meta.get('collaborative-content') && (contentType === 'page' || contentType === 'blogpost');
        }
    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/support/atlassian-editor-support', 'AJS.Rte.Support');
