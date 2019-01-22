/**
 * Monospace formatting in the Editor "More Menu"
 * @module confluence-editor/tinymce3/plugins/confmonospace/editor_plugin_src
 */
define('confluence-editor/tinymce3/plugins/confmonospace/editor_plugin_src', [
    'tinymce'
], function(
    tinymce
) {
    "use strict";

    return {
        init : function(ed, url) {
            // Register commands
            ed.addCommand('confMonospace', function() {
                ed.formatter.toggle("monospace", undefined);
            });

            tinymce.activeEditor.onInit.add(function(ed) {
                ed.formatter.register({monospace : {inline : 'code'}});

                ed.editorCommands.addCommands({
                    'confMonospace': function(){
                        return ed.formatter.match('monospace');
                    }
                }, 'state');
            });

            // Register button
            ed.addButton('monospace', {title : 'monospace', cmd : 'confMonospace'});
        },

        getInfo : function() {
            return {
                longname : 'Monospace Formatting',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    };
});

require('confluence/module-exporter')
        .safeRequire('confluence-editor/tinymce3/plugins/confmonospace/editor_plugin_src', function(ConfMonospacePlugin) {
            var tinymce = require('tinymce');

            tinymce.create('tinymce.plugins.ConfMonospacePlugin', ConfMonospacePlugin);

            // Register plugin
            tinymce.PluginManager.add("confmonospace", tinymce.plugins.ConfMonospacePlugin);
        });