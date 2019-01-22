/**
 * @module confluence-editor/editor/page-editor-message
 */
/*eslint-env browser*/
define('confluence-editor/editor/page-editor-message', [
    'jquery',
    'ajs',
    'aui/flag',
    'document',
    'underscore'
], function (
    $,
    AJS,
    Flag,
    document,
    _) {
    'use strict';

    // map of message types
    var messageTypes = Object.create(null);
    var suppressedMessages = Object.create(null);

    // Remove message from array when it is closed.
    document.addEventListener('aui-flag-close', function (e) {
        if (e && e.target) {
            messageTypes = _.filter(Object.keys(messageTypes), function (groupMessage) {
                return !$(e.target).find('span').hasClass(groupMessage);
            });
        }
    });

    return {
        /**
         * Creates an Aui flag in the confluence editor.
         * @param groupMessage the message key
         * @param options options used to create the Flag
         * @param callback callback function to execute
         */
        handleMessage: function (groupMessage, options, callback) {
            if (messageTypes[groupMessage]) {
                return;
            }

            if (suppressedMessages[groupMessage]) {
                delete suppressedMessages[groupMessage];
                return;
            }

            if (options) {
                messageTypes[groupMessage] = Flag({
                    title: options.title ? options.title : '',
                    type: options.type,
                    close: options.close ? options.close : 'manual',
                    persistent: false,
                    body: "<span class='" + groupMessage + "'>" + options.message + "</span>"
                });

                if (callback) {
                    callback();
                }
            }
        },

        /**
         * Closes message flag windows.
         * @param groupMessages an array of strings indicating the messages to be closed.
         */
        closeMessages: function (groupMessages) {
            _.each(groupMessages, function (messageKey) {
                if (messageTypes[messageKey]) {
                    messageTypes[messageKey].close();
                    delete messageTypes[messageKey];
                }
            });
        },

        /**
         * Indicates whether a message flag with a particular key is open.
         * @param groupMessage message key to ask about
         * @returns {boolean} true or false
         */
        isDisplayed: function (groupMessage) {
            return groupMessage in messageTypes;
        },

        /**
         * Returns the keys for all currently displayed messages.
         * @returns {Array} of strings
         */
        displayedErrors: function () {
            return Object.keys(messageTypes);
        },

        /**
         * Marks a message key to not be displayed the next time it's attempted.
         */
        suppressMessage: function(groupMessage) {
            suppressedMessages[groupMessage] = {};
        }
    };
});