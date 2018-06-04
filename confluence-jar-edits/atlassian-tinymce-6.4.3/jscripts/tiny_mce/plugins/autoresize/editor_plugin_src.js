/**
 * editor_plugin_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

define('atlassian-tinymce/plugins/autoresize/editor_plugin_src', [
    'ajs',
    'underscore',
    'tinymce',
    'jquery'
], function(
    AJS,
    _,
    tinymce,
    $
) {
    "use strict";

    /**
     * Auto Resize
     *
     * This plugin automatically resizes the content area to fit its content height.
     * It will retain a minimum height, which is the height of the content area when
     * it's initialized.
     */
    return {
        /**
         * Initializes the plugin, this will be executed after the plugin has been created.
         * This call is done before the editor instance has finished it's initialization so use the onInit event
         * of the editor instance to intercept that event.
         *
         * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
         * @param {string} url Absolute URL to where the plugin is located.
         */
        init: function (ed, url) {

            ed.onInit.add(function () {
                // ATLASSIAN
                $(ed.getBody()).addClass('resizable');
            });

            var t = this;
            var oldSize = 0;

            if (ed.getParam('fullscreen_is_enabled')) {
                return;
            }
            /**
             * This method gets executed each time the editor needs to resize.
             * @param obj This can be Editor object if function is invoked from an event OR object that is passed as 2nd param to execCommand
             */
            function resize(obj) {
                var deltaSize;
                var d = ed.getDoc();
                var body = d.body;
                var de = d.documentElement;
                var DOM = tinymce.DOM;
                var resizeHeight = t.autoresize_min_height;
                var myHeight;
                var force = _.isObject(obj) ? obj.forceExec || false : false;

                // ATLASSIAN - Use jquery to work out height
                myHeight = $(d).height();
                // Get height differently depending on the browser used
                // myHeight = myHeight = tinymce.isIE ? body.scrollHeight : (tinymce.isWebKit && body.clientHeight == 0 ? 0 : body.offsetHeight);

                // Don't make it smaller than the minimum height
                if (myHeight > t.autoresize_min_height) {
                    resizeHeight = myHeight;
                }

                // If a maximum height has been defined don't exceed this height
                if (t.autoresize_max_height && myHeight > t.autoresize_max_height) {
                    resizeHeight = t.autoresize_max_height;
                    body.style.overflowY = "auto";
                    de.style.overflowY = "auto"; // Old IE
                } else {
                    body.style.overflowY = "hidden";
                    de.style.overflowY = "hidden"; // Old IE
                    body.scrollTop = 0;
                }

                // Resize content element
                if (force || (resizeHeight !== oldSize)) {
                    deltaSize = resizeHeight - oldSize;
                    DOM.setStyle(DOM.get(ed.id + '_ifr'), 'height', resizeHeight + 'px');
                    oldSize = resizeHeight;

                    // WebKit doesn't decrease the size of the body element until the iframe gets resized
                    // So we need to continue to resize the iframe down until the size gets fixed
                    if (tinymce.isWebKit && deltaSize < 0) {
                        resize();
                    }
                }
            }

            t.editor = ed;

            // Define minimum height
            t.autoresize_min_height = parseInt(ed.getParam('autoresize_min_height', ed.getElement().offsetHeight));

            // Define maximum height
            t.autoresize_max_height = parseInt(ed.getParam('autoresize_max_height', 0));

            // ATLASSIAN - not needed and causes editor to grow on each key press.
//          // Add padding at the bottom for better UX
//          ed.onInit.add(function(ed){
//              ed.dom.setStyle(ed.getBody(), 'paddingBottom', ed.getParam('autoresize_bottom_margin', 50) + 'px');
//          });

            // Add appropriate listeners for resizing content area
            ed.onChange.add(resize);
            ed.onSetContent.add(resize);
            ed.onPaste.add(resize);
            ed.onKeyUp.add(resize);
            ed.onPostRender.add(resize);

            if (ed.getParam('autoresize_on_init', true)) {
                ed.onLoad.add(resize);
                ed.onLoadContent.add(resize);
            }

            // Register the command so that it can be invoked by using tinyMCE.activeEditor.execCommand('mceExample');
            ed.addCommand('mceAutoResize', resize);
        },

        /**
         * Returns information about the plugin as a name/value array.
         * The current keys are longname, author, authorurl, infourl and version.
         *
         * @return {Object} Name/value array containing information about the plugin.
         */
        getInfo: function () {
            return {
                longname: 'Auto Resize',
                author: 'Moxiecode Systems AB',
                authorurl: 'http://tinymce.moxiecode.com',
                infourl: 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/autoresize',
                version: tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };

});

require('confluence/module-exporter').safeRequire('atlassian-tinymce/plugins/autoresize/editor_plugin_src', function(AutoResizePlugin) {
    var tinymce = require('tinymce');
    tinymce.create('tinymce.plugins.AutoResizePlugin', AutoResizePlugin);

    // Register plugin
    tinymce.PluginManager.add('autoresize', tinymce.plugins.AutoResizePlugin);
});
