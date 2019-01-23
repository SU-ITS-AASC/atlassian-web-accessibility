/**
 * editor_plugin_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 *
 * @module confluence-editor/tinymce3/plugins/atlassianemotions/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/atlassianemotions/editor_plugin_src', [
    'tinymce',
    'jquery'
], function(
    tinymce,
    $
) {
    "use strict";

    return {
        init : function(ed, url) {
            // Register commands
            ed.addCommand('mceEmotion', function() {
                ed.windowManager.open({
                    file : tinymce.settings.editor_plugin_action_base_path + '/emotions.action',
                    width : 190 + parseInt(ed.getLang('emotions.delta_width', 0)),
                    height : 125 + parseInt(ed.getLang('emotions.delta_height', 0)),
                    inline : 1,
                    id: "insert-emoticon-dialog",
                    name : "emotions_dlg.title"
                }, {
                    plugin_url : url
                });
            });

            // Register buttons
            ed.addButton('emotions', {title : 'emotions.emotions_desc', cmd : 'mceEmotion'});

            // CONFDEV-2652 - Deal with click of emoticons - reposition cursor to the left or right depending on where
            // the users clicked on the emoticon
            ed.onClick.add(function(ed, e) {
                var n = e.target;
                var $n;
                var rng;
                if(n.nodeName === 'IMG') {
                    $n = $(n);
                    if($n.hasClass('emoticon')) {
                        rng = ed.selection.getRng(true);
                        var clickOffsetX = e.offsetX || (e.layerX - n.x);
                        var width = n.width;
                        if(clickOffsetX < width / 2) {
                            // Click on left side - move cursor before
                            rng.setStartBefore(n);
                            rng.setEndBefore(n);
                        } else {
                            // Click on left side - move cursor after
                            rng.setStartAfter(n);
                            rng.setEndAfter(n);

                        }
                        ed.selection.setRng(rng);
                        ed.selection.collapse();

                        return tinymce.dom.Event.prevent(e);
                    }
                }
            });
        },

        getInfo : function() {
            return {
                longname : 'Emotions',
                author : 'Moxiecode Systems AB',
                authorurl : 'http://tinymce.moxiecode.com',
                infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/emotions',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };
});

require('confluence/module-exporter').safeRequire('confluence-editor/tinymce3/plugins/atlassianemotions/editor_plugin_src', function(EmotionsPlugin) {
    var tinymce = require('tinymce');
    tinymce.create('tinymce.plugins.EmotionsPlugin', EmotionsPlugin);
    // Register plugin
    tinymce.PluginManager.add('emotions', tinymce.plugins.EmotionsPlugin);
});