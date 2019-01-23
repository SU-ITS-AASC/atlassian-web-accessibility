/**
 * Overridden so that if the current node has a table layout DIV parent, it will be
 * returned as the root element. This is used when normalizing selections and wrapping blocks.
 *
 * @module confluence-editor/tinymce3/overrides/dom-utils
 */
define('confluence-editor/tinymce3/overrides/dom-utils', [
    'ajs',
    'jquery'
], function (AJS,
             $) {
    "use strict";

    var DOMUtils = {};

    DOMUtils.getRoot = function () {
        var ed = AJS.Rte.getEditor();
        // We don't set root_element but keeping this from tinymce src for forwards compatibility.
        var dom = ed.dom;
        var settings = dom.settings;

        function getRootNode(dom) {
            var $pageLayoutDiv = $(ed.selection.getNode()).closest("div.innerCell");
            if ($pageLayoutDiv.length > 0) {
                return $pageLayoutDiv[0];
            }
            return dom.doc.body;
        }

        return (settings && dom.get(settings.root_element)) || getRootNode(dom);
    };

    DOMUtils.setRoot = function (element) {
        var ed = AJS.Rte.getEditor();
        ed.dom.settings.root_element = element;
    };

    return DOMUtils;
});


require('confluence/module-exporter').safeRequire('confluence-editor/tinymce3/overrides/dom-utils', function (DOMUtils) {
    var tinymce = require('tinymce');

    tinymce.dom.DOMUtils.prototype.getRoot = DOMUtils.getRoot;
    tinymce.dom.DOMUtils.prototype.setRoot = DOMUtils.setRoot;
});