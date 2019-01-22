/**
 * @module confluence-drag-and-drop/drag-and-drop-utils
 */
define('confluence-drag-and-drop/drag-and-drop-utils', [
    'jquery',
    'window',
    'ajs'
], function(
    $,
    window,
    AJS
) {
    var desktop;
    var base = /^\w+:\/\/[^\/?#]+/.exec(location.href);

    return {
        defaultMimeType: 'application/octet-stream',
        base: base,
        bindDragEnter: function (object, callback) {
            if (object.addEventListener) {
                callback  = (this.isFireFox35OrLater() ? this.firefox35DragEnterAndOverCallbackWrapper(callback) : callback);
                callback && object.addEventListener('dragenter', callback, false);
            } else if (object.attachEvent) {
                var wrappedCallback = this.ieDragEnterAndDragOverCallbackWrapper(callback);
                object.attachEvent('ondragenter', wrappedCallback);
                $(window).unload(function () {
                    object.detachEvent("ondragenter", wrappedCallback);
                });
            }
        },
        bindDragOver: function (object, callback) {
            if (object.addEventListener) {
                if (this.isFireFox35OrLater()) {
                    callback = this.firefox35DragEnterAndOverCallbackWrapper(callback);
                } else if ($.browser.safari) {
                    callback = this.safariDragOverCallbackWrapper(callback);
                }
                callback && object.addEventListener('dragover', callback, false);
            } else if (object.attachEvent) {
                var wrappedCallback = this.ieDragEnterAndDragOverCallbackWrapper(callback);
                object.attachEvent('ondragover', wrappedCallback);
                $(window).unload(function () {
                    object.detachEvent("ondragover", wrappedCallback);
                });
            }
        },
        bindDragLeave: function (object, callback) {
            if (!callback) {
                return;
            }

            //because of a bug of $.browser in IE11 so we need to use tinymce.isIE11 to check IE11
            if ($.browser.safari || this.isFireFox35OrLater() || tinymce.isIE11) {
                object.addEventListener('dragleave', callback, false);
            } else if ($.browser.msie) {
                object.attachEvent('ondragleave', callback);
                $(window).unload(function () {
                    object.detachEvent("ondragleave", callback);
                });
            } else if ($.browser.mozilla) {
                object.addEventListener('dragexit', callback, false);
            }
        },
        /**
         * Bind a drop callback handler. Please note, the drop event, once handled, will not be propagated. This is
         * intentional to prevent a particular file from being attached/processed multiple times (unintentionally).
         * @param object element to bind drop callback to
         * @param callback [optional] callback function invoked when drop event is fired
         */
        bindDrop: function (object, callback) {
            if ($.browser.mozilla) {
                var eventName = (this.isFireFox35OrLater() ? "drop" : "dragdrop");
                object.addEventListener(eventName, this.mozillaDropCallbackWrapper(callback), false);
            } else if ($.browser.msie) {
                if (callback) {
                    var wrappedCallback = function (e) {
                        callback(e);
                        AJS.DragAndDropUtils.stopPropagation(e);
                    };
                    object.attachEvent("ondrop", wrappedCallback);
                    $(window).unload(function () {
                        object.detachEvent("ondrop", wrappedCallback);
                    });
                }
            } else if ($.browser.safari) {
                callback && object.addEventListener("drop", function (e) {
                    callback(e);
                    AJS.DragAndDropUtils.stopPropagation(e);
                }, false);
            }
        },
        /**
         * Returns the nice display value for the specified number of bytes.
         * (1 kB = 1024 bytes)
         *
         * @param num number of bytes
         */
        niceSize: function (num) {
            var prefix = [" B", " kB", " MB", " GB", " TB", " PB", " EB", " ZB", " YB"];
            for (var i = 0, ii = prefix.length; i < ii; i++) {
                if (num < Math.pow(2, 10 * (i + 1))) {
                    return (!i ? num : (num / Math.pow(2, 10 * i)).toFixed(2)) + prefix[i];
                }
            }
            return (num / Math.pow(2, 10 * (i + 1))).toFixed(2) + prefix[prefix.length - 1];
        },
        /**
         * The 'ondrop' event in IE normally only fires on text elements. To make it fire for non-text elements,
         * the default behaviour for 'ondragenter' and 'ondragover' must be prevented.
         * http://www.webreference.com/programming/javascript/dragdropie/
         */
        ieDragEnterAndDragOverCallbackWrapper: function (callback) {
            return function(e) {
                e = e || window.event;
                if (!e) {
                    return;
                }
                callback && callback(e);
                $.browser.msie && (e.returnValue = false);
            };
        },
        /**
         * Safari requires at minimum that the 'dragover' event be bound and preventDefault() called on the event.
         * http://developer.apple.com/safari/library/documentation/AppleApplications/Conceptual/SafariJSProgTopics/Tasks/DragAndDrop.html
         */
        safariDragOverCallbackWrapper: function (callback) {
            return function(e) {
                e = e || window.event;
                if (!e) {
                    return;
                }
                // We don't want to call preventDefault() (and enable a drop zone) for file upload fields
                if (e.target.type === "file") {
                    return;
                }
                callback && callback(e);
                ($.inArray("public.file-url", e.dataTransfer.types) != -1) && e.preventDefault(); // only indicate a drop zone if we've detected file data in the event
            };
        },
        mozillaDropCallbackWrapper: function (callback) {
            return function(e) {
                if (!e) {
                    return;
                }
                callback && callback(e);
                e.preventDefault();
                if (AJS.DragAndDropUtils.isFireFox35OrLater()) {
                    /**
                     * According to https://developer.mozilla.org/en/DragDrop/Drag_and_Drop,
                     * The drop event should not fire if "the mouse was not over a valid drop target".
                     * In the case of drag events that contain non-file data (such as text and links) and firefox 3.5,
                     * we do not indicate drop targets (see firefox35DragEnterAndOverCallbackWrapper()). Regardless,
                     * FF 3.5 continues to fire the drop event so we have to handle it properly. We need to:
                     * (a) ensure that if there is file data in the event, that we don't propagate to avoid CONF-17666
                     * (b) if there is non-file data (text, links), that we _do_ propagate to preserve native browser handling of text and link dragging.
                     */
                    AJS.DragAndDropUtils.firefox35FileDataInEvent(e) && e.stopPropagation();
                } else {
                    e.stopPropagation();
                }
            };
        },
        /**
         * To indicate a drop target in firefox 3.5.x, the drag enter and over events must be cancelled via preventDefault().
         * Reference: https://developer.mozilla.org/En/DragDrop/Drag_Operations#droptargets
         */
        firefox35DragEnterAndOverCallbackWrapper: function (callback) {
            return function(e) {
                if (!e) {
                    return;
                }
                callback && callback(e);

                /**
                 * To preserve the ability drag other types of data (such as text, links etc. which firefox 3.5 allows)
                 * we should only cancel the default action (and hence indicate a drop zone) if there is actually file data in the event
                 */
                AJS.DragAndDropUtils.firefox35FileDataInEvent(e) && e.preventDefault();
            };
        },
        firefox35FileDataInEvent: function (event) {
            return $.inArray("application/x-moz-file", event.dataTransfer.types) != -1;
        },
        stopPropagation: function (e) {
            e = e || window.event;
            if (!e) {
                return;
            }
            if (e.stopPropagation) {
                e.stopPropagation();
            } else {
                e.cancelBubble = true;
            }
        },
        preventDefault: function (e) {
            e = e || window.event;
            if (!e) {
                return;
            }
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
        },
        isFireFox35OrLater : function () {
            return !this.isFireFox30() && $.browser.version.indexOf('1.9.') != -1;
        },
        isFireFox30: function () {
            return $.browser.version.indexOf('1.9.0') != -1;
        },
        enableDropZoneOn: function (container, dropHandler) {
            if (!container) {
                throw new Error("Cannot enable drop zone on invalid container. Received: " + container);
            }
            dropHandler = dropHandler || AJS.DragAndDrop.defaultDropHandler;
            this.bindDragEnter(container);
            this.bindDragOver(container);
            this.bindDragLeave(container);
            this.bindDrop(container, dropHandler);
        }
    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-drag-and-drop/drag-and-drop-utils', 'AJS.DragAndDropUtils');