/**
 * @module confluence-drag-and-drop/drag-and-drop-tip
 */
define('confluence-drag-and-drop/drag-and-drop-tip', [
    'ajs',
    'confluence/legacy'
], function(
    AJS,
    Confluence
) {
    return function ($) {
        var SHOW_DRAG_AND_DROP_TIP_PREFERENCE_KEY = "show-drag-and-drop-tip";

        var confluenceLocalStorage = Confluence.storageManager("confluence-editor");

        /***
         * Get show-drag-and-drop-tip from server to check if we show drag and drop tip or not
         * After getting setting from server => store it to local storage to re-use later
         * @param panel
         */
        function showDragAndDropTip(panel) {
            if (!AJS.Meta.getBoolean("can-attach-files")) {
                return;
            }

            var isShowDragAndDropTip = confluenceLocalStorage.getItem(SHOW_DRAG_AND_DROP_TIP_PREFERENCE_KEY);

            if (isShowDragAndDropTip === null) {
                $.ajax({
                    url: AJS.contextPath() + "/rest/drag-and-drop/1/tip/setting",
                    contentType: 'application/json',
                    dataType: 'json',
                    success: function (data) {
                        isShowDragAndDropTip = (!(data === false)).toString();
                        confluenceLocalStorage.setItem(SHOW_DRAG_AND_DROP_TIP_PREFERENCE_KEY, isShowDragAndDropTip);

                        _appendDragAndDropTip(panel, isShowDragAndDropTip);
                    }
                });
            } else {
                _appendDragAndDropTip(panel, isShowDragAndDropTip);
            }
        }

        /**
         * Append tip message to panel
         * @param panel
         * @param isShowDragAndDropTip
         * @private
         */
        function _appendDragAndDropTip(panel, isShowDragAndDropTip) {
            if (isShowDragAndDropTip === "true") {
                panel.append(AJS.DragAndDrop.Templates.dragAndDropTip());

                //bind event click for close button
                panel.find(".attach-tip-discovery .close-tip").on("click", function (e) {
                    e.preventDefault();
                    $(this).closest(".attach-tip-discovery").remove();
                    panel.sizeToFit();
                    _disableDragAndDropTipSetting();
                });
            }
        }

        /**
         * Set "show-drag-and-drop-tip" to false
         * @private
         */
        function _disableDragAndDropTipSetting() {
            $.ajax({
                url: AJS.contextPath() + "/rest/drag-and-drop/1/tip/disable",
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                success: function () {
                    confluenceLocalStorage.setItem(SHOW_DRAG_AND_DROP_TIP_PREFERENCE_KEY, false);
                }
            });
        }

        Confluence.Editor.ImageDialog.beforeShowListeners.push(function(){
            showDragAndDropTip($("#attached-files"));
        });
    };
});

require('confluence/module-exporter').safeRequire('confluence-drag-and-drop/drag-and-drop-tip', function(DragAndDropTip) {
    require('ajs').toInit(DragAndDropTip);
});
