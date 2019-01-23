/**
 * TEMP to be removed this should be delegated into plupload but until we update their queue support for gears, this will serve nicely.
 * @module confluence-drag-and-drop/drag-and-drop-support
 */
define('confluence-drag-and-drop/drag-and-drop-support', [
    'jquery'
], function(
    $
) {
    "use strict";

    var xhr;
    var xhrSupport;
    try {
        xhr = new XMLHttpRequest();
        xhrSupport = !!(xhr.sendAsBinary || xhr.upload)  && !($.browser.mozilla && $.browser.version.indexOf('1.9.1') > -1);
    }
    catch(e) {
        //fix for ie with xhr disabled
        xhrSupport = false;
    }
    xhr = null;

    return {
        hasXhrSupport :xhrSupport
    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-drag-and-drop/drag-and-drop-support', 'DragnDropSupport');