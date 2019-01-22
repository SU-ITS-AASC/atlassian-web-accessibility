/**
 * @module confluence-editor/analytics/editor-ready-collab-mode-analytics
 */
define('confluence-editor/analytics/editor-ready-collab-mode-analytics', [
    'ajs',
    'confluence/dark-features',
    'confluence/meta'
], function (AJS, DarkFeatures, Meta) {
    "use strict";

    var SYNCHRONY_DARK_FEATURE = 'site-wide.synchrony';
    var SYNCHRONY_SHARED_DRAFTS_DARK_FEATURE = 'site-wide.shared-drafts';

    var EDITING_MODE_ON = 'on';
    var EDITING_MODE_LIMITED = 'limited';
    var EDITING_MODE_OFF = 'off';

    var EVENT_PREFIX = 'confluence.editor.ready.collab.mode';

    /**
     * @returns {boolean} true if the user is creating/editing a page, or a blogpost, as opposed to a comment, or something.
     * @private
     */
    function _isEditPage() {
        return AJS.Rte && AJS.Rte.getEditor() && (!!AJS.$('#editpageform').length || !!AJS.$('#createpageform').length);
    }

    /**
     * Figures out the current collaborative editing mode and publishes the corresponding analytics event.
     * @private
     */
    function _publishCollaborativeEditingModeEvent() {
        var eventName = _getAnalyticsName(_getCurrentEditingMode());
        var connectionOrder = Meta.get("synchrony-connection-order") ? Meta.get("synchrony-connection-order") : "";
        var connectionType = Meta.get("synchrony-connection-type") ? Meta.get("synchrony-connection-type") : "";
        AJS.trigger('analyticsEvent', {
            name: eventName,
            data: {
                connectionOrder: connectionOrder,
                connectionType: connectionType
            }
        });
    }

    /**
     * @returns {string} the analytics name for the corresponding editing mode.
     * @param {string} editingMode Current editing mode
     * @private
     */
    function _getAnalyticsName(editingMode) {
        return EVENT_PREFIX + '.' + editingMode;
    }

    /**
     * @returns {string} the current editing mode based on the dark features
     * @private
     */
    function _getCurrentEditingMode() {
        if (DarkFeatures.isEnabled(SYNCHRONY_DARK_FEATURE) && DarkFeatures.isEnabled(SYNCHRONY_SHARED_DRAFTS_DARK_FEATURE)) {
            return EDITING_MODE_ON;
        }

        if (DarkFeatures.isEnabled(SYNCHRONY_SHARED_DRAFTS_DARK_FEATURE)) {
            return EDITING_MODE_LIMITED;
        }

        return EDITING_MODE_OFF;
    }

    return {
        trigger: function () {
            if (_isEditPage()) {
                _publishCollaborativeEditingModeEvent();
            }
        }
    };
});

require('confluence/module-exporter').safeRequire('confluence-editor/analytics/editor-ready-collab-mode-analytics',
    function (EditorAnalytics) {
        require('ajs').bind('rte-ready', function () {
            EditorAnalytics.trigger();
        });
    });
