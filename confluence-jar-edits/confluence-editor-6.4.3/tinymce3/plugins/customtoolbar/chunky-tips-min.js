define("confluence-editor/tinymce3/plugins/customtoolbar/chunky-tips",["ajs","tinymce","jquery"],function(b,j,a){return function(){function h(b,d,c){if("dropdown"===d&&(a(".tipsy").remove(),c&&(c.trigger&&c.trigger.jquery)&&(b=c.trigger.data("tipsy"))))b.hoverState="out"}function i(){a(".tipsy").remove()}b.debug("Enabling Chunky Tooltip for the editor");var e={live:!0,gravity:"n",title:function(){return a(this).attr("data-tooltip")||""},delayIn:250,delayOut:0},f=a.fn.tipsy.autoBounds2(50,"n"),g=a.fn.tipsy.autoBounds2(50,
"s"),k=a.fn.tipsy.autoBounds2(50,"w"),f=a.extend({},e,{gravity:f}),g=a.extend({},e,{gravity:g}),e=a.extend({},e,{gravity:k});a("#rte-toolbar [data-tooltip]:not(.dropdown-item)").tooltip(f);a("#rte-toolbar .dropdown-item[data-tooltip]").tooltip(e);a("#rte-savebar [data-tooltip]").tooltip(g);a("#editor-precursor [data-tooltip]").tooltip(f);a("#property-panel [data-tooltip]").tooltip(f);a(document).bind("showLayer",h);a(document).bind("hideLayer",h);b.bind("created.property-panel",i);b.bind("destroyed.property-panel",
i);var l=/\+/g;b.bind("register-contexts.keyboardshortcuts",function(){setTimeout(function(){a("#rte-savebar .aui-button[title]").each(function(){var b=a(this),d=b.attr("title");b.removeAttr("title");if(j.isMac){var c=d.indexOf("(");0<=c&&(d=d.substr(0,c)+d.substr(c).replace(l,""))}b.attr("data-tooltip",d)})},0)})}});require("confluence/module-exporter").safeRequire("confluence-editor/tinymce3/plugins/customtoolbar/chunky-tips",function(b){require("ajs").bind("init.rte",b)});