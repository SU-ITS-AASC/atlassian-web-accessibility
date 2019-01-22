/**
 * Atlassian Resize Editor plugin
 *
 * This plugin exists for IE8/9 and Opera which don't support dynamic resizing in nested elements using table layout.
 *
 * When the browser is resized we reset the editor, get the size of it's container (which can be dynamically scaled) and
 * apply this value to the editor.
 *
 * @module confluence-editor/tinymce3/plugins/resizeeditor/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/resizeeditor/editor_plugin_src', [
    'jquery',
    'document',
    'tinymce'
], function(
    $,
    document,
    tinymce
) {
    "use strict";

    /* This is a simplified resize function, As we're using table layout we only need to retrieve the size of a parent div*/
    var resizeEditor = function (extraHeight) {
        var iframeContainer = $('#wysiwyg');
        var iframe = iframeContainer.find("iframe");

        iframe.height(0).height(iframeContainer.height() + (extraHeight || 0)); //Resize the editor to allow it's parent to auto resize correctly
    };

    return {
        init : function (ed, url) {
            ed.onInit.add(function (e, l) {
                var editorWin;
                var containerWin;

                //This plugin is only used for IE/Opera where our 100% height solution does not work with CSS alone.
                if (tinymce.isIE || tinymce.isOpera) {
                    editorWin = ed.getWin();
                    containerWin = $(editorWin.parent);

                    /* In IE we need to ensure that scrollbars are only visible on the body
                     * when in the preview mode. That what these lines do.*/
                    $("body").css({"overflow": "hidden"});

                    $('#rte-button-preview').click(function() {
                        $("body").css({"overflow-y": "auto"});
                        $("body").css({"overflow-x": "hidden"});
                    });

                    $('#rte-button-edit').click(function () {
                        $("body").css({"overflow-y": "hidden"});
                        $("body").css({"overflow-x": "hidden"});
                        resizeEditor();
                    });

                    /* Setup the circumstances under which the resize function will be called */
                    containerWin.bind('resize.resizeplugin', function () {
                        resizeEditor();
                    });

                    containerWin.bind('messageClose', function (e) {
                        resizeEditor(e && ~$(e.target).height());
                    });

                    $(document).bind("resize.resizeplugin", function (e, data) {
                        resizeEditor(data && data.height);
                    });

                    ed.onChange.add(function () {
                        resizeEditor();
                    });

                    ed.onInit.add(function () {
                        //Some JS hackery to ensure that this is called last after everthing has rendered/executed.
                        setTimeout(function () {
                            resizeEditor();
                        }, 1);
                    });


                }
            });
        },

        createControl : function (n, cm) {
            return null;
        },

        getInfo : function () {
            return {
                longname : 'Resize Editor Plugin',
                description : 'adjusts height of editor so it always occupies the right space in between the toolbars',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                version : "1.0"
            };
        }
    };
});

require('confluence/module-exporter')
        .safeRequire('confluence-editor/tinymce3/plugins/resizeeditor/editor_plugin_src', function(ResizeEditorPlugin) {
            var tinymce = require('tinymce');

            tinymce.create('tinymce.plugins.ResizeEditorPlugin', ResizeEditorPlugin);

            tinymce.PluginManager.add('resizeeditorplugin', tinymce.plugins.ResizeEditorPlugin);
        });