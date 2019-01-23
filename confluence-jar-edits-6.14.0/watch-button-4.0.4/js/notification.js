define('confluence-watch-button/watch-notification', [
    'jquery',
    'aui/flag'
], function (
    $,
    flag
) {
    return function (message) {
        // CONFDEV-31505 auto-dismiss existing watch flag before showing a new one
        var existingNotification = document.getElementById('watch-notification');
        if (existingNotification != null) {
            existingNotification.close()
        }

        var notificationFlag = flag({
            type: 'success',
            body: message,
            close: 'auto'
        });

        notificationFlag.setAttribute('id', 'watch-notification');
    };
});