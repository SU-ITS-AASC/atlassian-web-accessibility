define("confluence-collaborative-editor-plugin/btf/state/state",[],function(){var a="COLLAB_STATUS";var g="SYNCHRONY_STATUS";var i="NEW_COLLAB_MODE";var h="TASK_ID";var e="TASK_NAME";var d="EXTERNAL_SYNCHRONY";var b=Object.create(null);function f(j){return function(){return b[j]}}function c(j){return function(k){b[j]=k}}return{getCollabStatus:f(a),setCollabStatus:c(a),getSynchronyStatus:f(g),setSynchronyStatus:c(g),getNewCollabMode:f(i),setNewCollabMode:c(i),getTaskId:f(h),setTaskId:c(h),getTaskName:f(e),setTaskName:c(e),isExternalSynchrony:f(d),setExternalSynchrony:c(d)}});