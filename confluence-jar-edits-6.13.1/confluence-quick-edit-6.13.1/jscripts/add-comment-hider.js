/**
 * @module confluence-quick-edit/add-comment-hider
 */
define('confluence-quick-edit/add-comment-hider', [
], function(
) {
    "use strict";
    return function ($) {
        $("#comments-actions").hide();
    };
});

require('confluence/module-exporter').safeRequire('confluence-quick-edit/add-comment-hider', function(AddCommentHider) {
    require('ajs').toInit(AddCommentHider);
});
