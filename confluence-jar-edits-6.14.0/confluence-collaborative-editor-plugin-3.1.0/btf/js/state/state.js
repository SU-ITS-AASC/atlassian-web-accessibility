define('confluence-collaborative-editor-plugin/btf/state/state', [], function () {
    var COLLAB_STATUS = 'COLLAB_STATUS';
    var SYNCHRONY_STATUS = 'SYNCHRONY_STATUS';
    var NEW_COLLAB_MODE = 'NEW_COLLAB_MODE';
    var TASK_ID = 'TASK_ID';
    var TASK_NAME = 'TASK_NAME';
    var EXTERNAL_SYNCHRONY = 'EXTERNAL_SYNCHRONY';

    var state = Object.create(null);

    /**
     * Function that binds a getter function for the given key in the internal state.
     * @param {string} key The key
     * @returns {Function} The getter function
     * @private
     */
    function _getValue(key) {
        return function () {
            return state[key];
        }
    }

    /**
     * Function that binds a setter function for the given key in the internal state
     * @param {string} key The key
     * @returns {Function} The setter function which takes the new value as a parameter
     * @private
     */
    function _setValue(key) {
        return function (value) {
            state[key] = value;
        }
    }


    return {
        getCollabStatus: _getValue(COLLAB_STATUS),
        setCollabStatus: _setValue(COLLAB_STATUS),
        getSynchronyStatus: _getValue(SYNCHRONY_STATUS),
        setSynchronyStatus: _setValue(SYNCHRONY_STATUS),
        getNewCollabMode: _getValue(NEW_COLLAB_MODE),
        setNewCollabMode: _setValue(NEW_COLLAB_MODE),
        getTaskId: _getValue(TASK_ID),
        setTaskId: _setValue(TASK_ID),
        getTaskName: _getValue(TASK_NAME),
        setTaskName: _setValue(TASK_NAME),
        isExternalSynchrony: _getValue(EXTERNAL_SYNCHRONY),
        setExternalSynchrony: _setValue(EXTERNAL_SYNCHRONY)
    }
});