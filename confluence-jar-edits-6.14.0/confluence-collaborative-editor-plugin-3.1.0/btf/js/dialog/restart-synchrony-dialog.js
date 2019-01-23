define('confluence-collaborative-editor-plugin/btf/dialog/restart-synchrony-dialog', [
    'ajs',
    'confluence/legacy',
    'confluence-collaborative-editor-plugin/btf/action/restart-synchrony-action',
    'confluence-collaborative-editor-plugin/btf/event/event',
    'confluence-collaborative-editor-plugin/btf/service/task-service'
], function (AJS,
             Confluence,
             restartSynchrony,
             Event,
             TaskService) {
    var RESTART_DIALOG_SELECTOR = '#restart-synchrony-dialog';
    var SUBMIT_BUTTON_SELECTOR = '#dialog-submit-button';
    var CLOSE_BUTTON_SELECTOR = '#dialog-close-button';
    var SHOW_DIALOG_DURATION = 10000;

    /**
     * Create and show the dialog to perform the synchrony restart
     */
    function popRestartDialog() {
        AJS.$(RESTART_DIALOG_SELECTOR).remove();
        AJS.$('body').append(Confluence.Templates.CollaborativeEditor.Admin.BTF.Config.restartSynchronyDialog());
        AJS.dialog2(RESTART_DIALOG_SELECTOR).show();

        _bindActions();
    }

    /**
     * Bind handlers to the submit and close buttons of the dialog
     * @returns {undefined}
     * @private
     */
    function _bindActions() {
        var $dialog = AJS.$(RESTART_DIALOG_SELECTOR);
        var $submitButton = $dialog.find(SUBMIT_BUTTON_SELECTOR);
        var $closeButton = $dialog.find(CLOSE_BUTTON_SELECTOR);

        $closeButton.click(function () {
            AJS.dialog2(RESTART_DIALOG_SELECTOR).remove();
        });

        $submitButton.click(_submit);
    }

    /**
     * Submit handler when the submit button is clicked.
     * @private
     */
    function _submit() {
        _spin();
        _disableButtons();
        var timeout;

        restartSynchrony().done(function (data) {
            var taskId = data.taskId;

            TaskService.processTask(taskId, undefined, function () {
                clearTimeout(timeout);
                AJS.dialog2(RESTART_DIALOG_SELECTOR).remove();
                AJS.trigger(Event.SYNCHRONY_RESTARTED_EVENT);
            });
        });

        // Hide the dialog after a while and just show the "Synchrony is still restarting message"
        timeout = setTimeout(function () {
            AJS.dialog2(RESTART_DIALOG_SELECTOR).remove();
            AJS.trigger(Event.SYNCHRONY_RESTARTED_EVENT);
        }, SHOW_DIALOG_DURATION);
    }

    /**
     * Disables the action buttons in this dialog
     */
    function _disableButtons() {
        var $dialog = AJS.$(RESTART_DIALOG_SELECTOR);
        var $submitButton = $dialog.find(SUBMIT_BUTTON_SELECTOR);
        var $closeButton = $dialog.find(CLOSE_BUTTON_SELECTOR);

        $submitButton.prop('disabled', true);
        $closeButton.prop('disabled', true);
    }

    /**
     * Enables the action buttons in this dialog
     * @private
     */
    function _enableButtons() {
        var $dialog = AJS.$(RESTART_DIALOG_SELECTOR);
        var $submitButton = $dialog.find(SUBMIT_BUTTON_SELECTOR);
        var $closeButton = $dialog.find(CLOSE_BUTTON_SELECTOR);

        $submitButton.prop('disabled', false);
        $closeButton.prop('disabled', false);
    }

    /**
     * Shows the spinner
     * @private
     */
    function _spin() {
        AJS.$(RESTART_DIALOG_SELECTOR).find('.button-spinner').spin();
    }

    /**
     * Hides the spinner
     * @private
     */
    function _stopSpinning() {
        AJS.$(RESTART_DIALOG_SELECTOR).find('.button-spinner').spinStop();
    }

    return {
        popDialog: popRestartDialog
    }

});