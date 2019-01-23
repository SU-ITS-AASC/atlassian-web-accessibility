define('confluence-collaborative-editor-plugin/btf/service/task-service', [
    'ajs'
], function (AJS) {

    var LONG_TASK_REST_ENDPOINT = AJS.contextPath() + '/rest/api/longtask/<taskId>';
    var INTERVAL = 800;

    /**
     * Processes the task
     * @param {string} taskId The taskId to process
     * @param {function} onUpdate   Function to run on each poll response. Runs even on the last response.
     *                              It gets the task as a parameter.
     * @param {function} onSuccess  Function to run if the task is successful. Runs only once at the end.
     *                              It gets the task as a parameter.
     * @param {function} onFail     Function to run if the task is not successful. Runs only once as soon
     *                              as it encounters that the task has failed.
     *                              It gets the task as a parameter.
     * @returns {undefined}
     */
    function processTask(taskId, onUpdate, onSuccess, onFail) {
        processor();

        function processor() {
            fetchTask(taskId).done(function (task) {
                onUpdate && typeof onUpdate === 'function' && onUpdate(task);
                if (!task.successful) {
                    return onFail && typeof onFail === 'function' && onFail(task);
                }
                if (+task.percentageComplete >= 100) {
                    return onSuccess && typeof onSuccess === 'function' && onSuccess(task);
                }

                setTimeout(processor, INTERVAL);
            });
        }
    }


    /**
     * Fetches the task from the server
     * @param {string} taskId Id of the task
     * @returns {jQuery.Deferred} Promise for when the result returns from the Ajax call.
     */
    function fetchTask(taskId) {
        return AJS.$.ajax({
            url: LONG_TASK_REST_ENDPOINT.replace('<taskId>', taskId)
        });
    }

    return {
        processTask: processTask
    }
});