/**
 * @module confluence-drag-and-drop/upload-utils
 */
define('confluence-drag-and-drop/upload-utils', [
    'ajs'
], function(
    AJS
) {
    "use strict";

    /**
     * 4096 bytes is the smallest allocation unit for filesystems.
     * Then OS reserved the size of directory less than or equals to 4096 bytes
     */
    var LIMITED_SIZE_OF_FOLDER = 4096; // bytes

    return {
        ErrorCode : {
            FILE_IS_A_FOLDER_ERROR : -602
        },

        /**
         * This method is used to filter the array of files, and call the callback function with filterd files.
         * If it's a folder, then it will fire an 'Error' event with the ErrorCode is FILE_IS_A_FOLDER_ERROR.
         *
         * @param uploader The uploader is used to trigger the 'Error' event
         * @param files Array of files need to be verified
         * @param callback The callback function when all files are verified
         */
        filterFiles: function(uploader, files, callback) {
            var filteredFiles = [];
            var numberOfCheckedFiles = 0;
            for (var i = 0; i < files.length; i++) {
                if (files[i].nativeFile.size <= LIMITED_SIZE_OF_FOLDER) {
                    // If fileSize is less than 4096, then let's check if it's a file or directory
                    var reader = new FileReader();
                    reader.onload = function() {
                        // Read successful, then it's a file
                        numberOfCheckedFiles++;
                        filteredFiles.push(this.currentFile);
                        if (numberOfCheckedFiles === files.length) {
                            callback(uploader, filteredFiles);
                        }
                    };
                    reader.onerror = function() {
                        // Read error, then it's a directory
                        uploader.removeFile(this.currentFile);
                        uploader.trigger('Error', {
                            code : AJS.UploadUtils.ErrorCode.FILE_IS_A_FOLDER_ERROR,
                            message : 'File is a folder',
                            file : this.currentFile
                        });
                        numberOfCheckedFiles++;
                        if (numberOfCheckedFiles === files.length) {
                            callback(uploader, filteredFiles);
                        }
                    };
                    reader.currentFile = files[i];
                    reader.readAsText(files[i].nativeFile);
                } else {
                    numberOfCheckedFiles++;
                    filteredFiles.push(files[i]);
                    if (numberOfCheckedFiles === files.length) {
                        callback(uploader, filteredFiles);
                    }
                }
            }
        }
    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-drag-and-drop/upload-utils', 'AJS.UploadUtils');
