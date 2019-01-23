AJS.toInit(function ($) {
    Confluence.Plugins.ExpandMacro.bind($, $("body"), "click keyup", function(e) {
        return !(e.type == "keyup" && e.keyCode != 13);
    });
});