/**
 * @module confluence-editor/tinymce3/plugins/referrer/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/referrer/editor_plugin_src', [
    'jquery',
    'tinymce'
], function(
    $,
    tinymce
) {
    "use strict";

    return {
        init : function(ed) {
            ed.onInit.add(function(){
                var $form = $('#createpageform');
                var $originalReferrer = $form.find('#originalReferrer');

                //If we are creating a new page that doesn't already has a referrer set and we have one
                if($form.length && !$originalReferrer.val() && document.referrer) {
                    $originalReferrer.val(document.referrer);
                }
            });
        },

        getInfo : function() {
            return {
                longname : 'Confluence Cancel Return Url',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };
});

require('confluence/module-exporter')
        .safeRequire('confluence-editor/tinymce3/plugins/referrer/editor_plugin_src', function(ReferrerPlugin) {
            var tinymce = require('tinymce');

            tinymce.create('tinymce.plugins.Referrer', ReferrerPlugin);

            // Register plugin
            tinymce.PluginManager.add('referrer', tinymce.plugins.Referrer);
        });