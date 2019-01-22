/**
 * @module confluence-editor/utils/environment
 */
define("confluence-editor/utils/environment", [
    'ajs'
],
function (
    AJS
) {
    "use strict";

    var module = {
        isMac: (navigator.platform.indexOf('Mac') >= 0),

        transformCmdKeyTextBasingOnOS: function (text) {
            var ctrl = AJS.I18n.getText("keyboard.shortcut.ctrl"); //for non-Mac
            var cmd = '\u2318'; //for Mac

            return this.isMac ? text.replace(new RegExp(ctrl, 'g'), cmd) : text;
        }
    };

    return module;
});