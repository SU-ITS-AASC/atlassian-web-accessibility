/**
 * @module confluence-editor/breadcrumbs/tinymce-breadcrumbs-oninit-rte
 */
define('confluence-editor/breadcrumbs/tinymce-breadcrumbs-oninit-rte', [
    'ajs',
    'jquery',
    'document'
], function(
    AJS,
    $,
    document
) {
    "use strict";

    return function () {
        // Move breadcrumbs into editor precursor
        function moveIntoEditor() {
            var bc = $('#breadcrumbs');
            bc.detach();
            if(!bc.find('.edited-page-title').length && $title.length) {
                bc.append($title);
            }
            $('#editor-precursor .cell').prepend(bc);
        }

        function moveIntoTitle() {
            var bc = $('#breadcrumbs').detach();
            $title.detach();
            $('#breadcrumb-section').append(bc);
        }

        if (AJS.Meta.get('content-type') !== 'comment') {

            var $quickEditBreadcrumbs = $('#quickedit-breadcrumbs');
            if ($quickEditBreadcrumbs.length > 0) {
                $('#breadcrumbs').detach();
                $quickEditBreadcrumbs.attr('id', 'breadcrumbs');
                $('#breadcrumb-section').append($quickEditBreadcrumbs);
            }

            // Remove breadcrumb title added by velocity for later use
            var $title = $('.edited-page-title').parent().detach();

            moveIntoEditor();

            // Move breadcrumbs between preview / edit
            $(document).bind("mode-changed", function (e, mode) {
                if (mode === "preview") {
                    moveIntoTitle();
                } else if (mode === "richtext") {
                    moveIntoEditor();
                }
            });
        }
    };
});

require('confluence/module-exporter').safeRequire('confluence-editor/breadcrumbs/tinymce-breadcrumbs-oninit-rte', function(init) {
    require('ajs').bind("init.rte", init);
});