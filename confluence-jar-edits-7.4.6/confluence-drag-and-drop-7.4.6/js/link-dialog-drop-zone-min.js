define("confluence-drag-and-drop/link-dialog-drop-zone",["ajs"],function(a){return function(b){a.bind("dialog-shown.link-browser",function(){a.DragAndDropUtils.bindDrop(b("#insert-link-dialog")[0],function(a){a.preventDefault();a.stopPropagation()})})}});require("confluence/module-exporter").safeRequire("confluence-drag-and-drop/link-dialog-drop-zone",function(a){require("ajs").toInit(a)});