/**
 * @module confluence-editor/utils/file-types-utils
 */
define('confluence-editor/utils/file-types-utils', [
], function(
) {
    "use strict";

    var FileTypesUtils = {
        getAUIIconFromMime: function (mime) {
            return mimeToAUIIconMap[mime] || DEFAULT_ICON;
        },

        // If it's supported and started with "/image"
        isImage: function (mime) {
            return mimeToAUIIconMap[mime] && mime.indexOf("image/") === 0;
        }
    };

    var DEFAULT_ICON = "aui-iconfont-file-generic";

    var AUI_ICON_TO_MIMES_MAP = {
        "aui-iconfont-file-image": [
            "image/gif",
            "image/jpeg",
            "image/pjpeg",
            "image/png",
            "image/tiff",
            "image/bmp"
        ],

        "aui-iconfont-file-pdf": ["application/pdf"],

        "aui-iconfont-file-video": [
            "audio/mpeg",
            "audio/x-wav",
            "audio/mp3",
            "audio/mp4",
            "video/mpeg",
            "video/quicktime",
            "video/mp4",
            "video/x-m4v",
            "video/x-flv",
            "video/x-ms-wmv",
            "video/avi",
            "video/webm",
            "video/vnd.rn-realvideo"
        ],

        "aui-iconfont-file-code": [
            "text/html",
            "text/xml",
            "text/javascript",
            "application/javascript",
            "application/x-javascript",
            "text/css",
            "text/x-java-source"
        ],

        "aui-iconfont-file-doc": [
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ],

        "aui-iconfont-file-xls": [
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ],

        "aui-iconfont-file-ppt": [
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        ],

        "aui-iconfont-file-txt": ["text/plain"],
        "aui-iconfont-file-zip": [
            "application/zip",
            "application/java-archive"
        ]
    };

    var mimeToAUIIconMap = {};
    var buildMimeToAUIIconMap = function () {
        for (var key in AUI_ICON_TO_MIMES_MAP) {
            var mimes = AUI_ICON_TO_MIMES_MAP[key];
            for (var i = 0, length = mimes.length; i < length; i++) {
                mimeToAUIIconMap[mimes[i]] = key;
            }
        }
    };

    buildMimeToAUIIconMap();

    return FileTypesUtils;
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/utils/file-types-utils', 'AJS.Confluence.FileTypesUtils');