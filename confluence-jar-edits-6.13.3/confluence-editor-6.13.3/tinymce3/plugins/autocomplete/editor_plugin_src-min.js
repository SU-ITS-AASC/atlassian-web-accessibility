define("confluence-editor/tinymce3/plugins/autocomplete/editor_plugin_src",["tinymce","confluence/legacy","ajs"],function(a,b,c){return{init:function(a){b.Editor.Autocompleter.Settings={};a.onPostRender.add(function(){c.debug("Autocomplete enabled, adding keyPress listener");a.onKeyPress.addToTop(b.Editor.Autocompleter.Manager.triggerListener);c.trigger("ready-editor-autocomplete")});a.onUndo.add(b.Editor.Autocompleter.Manager.reattach);a.onRedo.add(b.Editor.Autocompleter.Manager.reattach)},getInfo:function(){return{longname:"Auto Complete",
author:"Atlassian",authorurl:"http://www.atlassian.com",version:a.majorVersion+"."+a.minorVersion}}}});require("confluence/module-exporter").safeRequire("confluence-editor/tinymce3/plugins/autocomplete/editor_plugin_src",function(a){var b=require("tinymce");b.create("tinymce.plugins.AutoComplete",a);b.PluginManager.add("autocomplete",b.plugins.AutoComplete)});