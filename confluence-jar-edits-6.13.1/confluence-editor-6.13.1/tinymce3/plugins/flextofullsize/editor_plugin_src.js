/**
 * @module confluence-editor/tinymce3/plugins/flextofullsize/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/flextofullsize/editor_plugin_src', [
    'jquery',
    'window',
    'tinymce'
], function(
    $,
    window,
    tinymce
) {
    "use strict";

    var editorWin;
    var editorDoc;
    var containerWin;
    var iframe;
    var table;
    var edHeight;
    var $topToolbar;
    var $bottomToolbar;
    var extraChromeHeight;
    var shadowMargins = 5;

    /* This is a simplified resize function, As we're using table layout we only need to retrieve the size of a parent div*/
    var resizeEditor = function (extraHeight) {
        var iframeContainer = $('#wysiwyg').is(":hidden") ? $('#preview') : $('#wysiwyg');
        iframe = iframeContainer.find("iframe");
        var $headerPrecursor = $("#header-precursor");

        var windowHeight = $(window).height();
        var headerHeight = $headerPrecursor.offset().top + $headerPrecursor.height() + $("#header").height();
        $("#content.edit").height(windowHeight - headerHeight);

        // Ensure that the iframe resizes _after_ the container is resized.
        setTimeout(function () {
            if($('#preview').is(':hidden')) {
                iframe.height(0).height(iframeContainer.height());
            } else {
                $("#content.edit").height("auto");
                var footerHeight = $("#savebar-container").height();

                headerHeight += $("#editor-precursor").height() + $('#conflict-wrapper').height();

                //HACK - CONF41 BN The bottom of the preview iframe is off by this much (no idea why).
                var magicNumber = 4;
                iframe.height(windowHeight - headerHeight - footerHeight - magicNumber);
            }
        }, 1);
    };

    return {
        init : function (ed, url) {
            ed.onInit.add(function (e, l) {
                var editorWin;
                var containerDoc;

                $(ed.getBody()).addClass('fullsize');

                //This plugin is only used for IE/Opera where our 100% height solution does not work with CSS alone.
                if (tinymce.isIE || tinymce.isOpera) {
                    editorWin = ed.getWin();
                    containerWin = $(editorWin.parent);
                    containerDoc = $(editorWin.parent.document);

                    /* In IE we need to ensure that scrollbars are only visible on the body
                     * when in the preview mode. That what these lines do.*/
                    $('body').css({"overflow": "hidden"});

                    /* Setup the circumstances under which the resize function will be called */
                    containerWin.bind('resize.resizeplugin', function () {
                        resizeEditor();
                    });

                    /* Custom events don't bubble to the window. Fixed in jquery 1.6 http://bugs.jquery.com/ticket/8712 */
                    containerDoc.bind('messageClose', function (e) {
                        // messageClose is fired _before_ the element is removed.
                        setTimeout(resizeEditor, 0);
                    });

                    containerDoc.bind("resize.resizeplugin", function (e, data) {
                        resizeEditor(data && data.height);
                    });

                    containerDoc.bind('mode-changed', function (e, data) {
                        resizeEditor();
                    });

                    ed.onChange.add(function () {
                        resizeEditor();
                    });

                    ed.onInit.add(function () {
                        resizeEditor();
                    });
                }
            });
        },

        getInfo : function () {
            return {
                longname : 'flex editor to full size plugin',
                description : 'adjusts height of editor so it always occupies the right space in between the toolbars',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                version : "1.0"
            };
        }
    };
});

require('confluence/module-exporter')
        .safeRequire('confluence-editor/tinymce3/plugins/flextofullsize/editor_plugin_src', function(FlexToFullSizePlugin) {
            var tinymce = require('tinymce');

            tinymce.create('tinymce.plugins.flextofullsizeplugin', FlexToFullSizePlugin);

            tinymce.PluginManager.add('flextofullsize', tinymce.plugins.flextofullsizeplugin);
        });
