define('confluence-collaborative-editor-plugin/telepointer-cleaner', [
    'confluence-editor-reliable-save/reliable-save',
    'jquery'
], function(
    SafeSave,
    $
) {
    'use strict';

    var cleanTelepointers = function(content) {
        var $contentContainer = $("<div>");
        $contentContainer.append(content);
        $contentContainer.find(".synchrony-container, .synchrony-tp").remove();
        return $contentContainer.html();
    };

    SafeSave.registerCleanupFunction(cleanTelepointers);
});