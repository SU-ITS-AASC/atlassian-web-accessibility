define('confluence-collaborative-editor-plugin/btf/dialog/change-mode-dialog', [
    'ajs',
    'confluence/legacy',
    'confluence-collaborative-editor-plugin/btf/action/change-mode-action',
    'confluence-collaborative-editor-plugin/btf/event/event',
    'confluence-collaborative-editor-plugin/btf/service/task-service',
    'confluence-collaborative-editor-plugin/btf/state/state',
    'confluence-collaborative-editor-plugin/btf/static/constants',
    'confluence-collaborative-editor-plugin/btf/util/option-selector',
    'confluence-collaborative-editor-plugin/btf/static/collab-editing-message-options'
], function (AJS,
             Confluence,
             ModeAction,
             Event,
             TaskService,
             state,
             Constant,
             selectOption,
             MessageOptions) {
    var MODE_DIALOG_SELECTOR = '#change-collab-mode-dialog';
    var SUBMIT_BUTTON_SELECTOR = '#dialog-submit-button';
    var CLOSE_BUTTON_SELECTOR = '#dialog-close-button';
    var ENABLE_RADIO_CONTAINER_SELECTOR = '.radio.enabled';
    var LIMITED_RADIO_CONTAINER_SELECTOR = '.radio.limited';
    var DISABLE_RADIO_CONTAINER_SELECTOR = '.radio.disabled';
    var ENABLE_RADIO_SELECTOR = '#mode-enabled';
    var LIMITED_RADIO_SELECTOR = '#mode-limited';
    var DISABLE_RADIO_SELECTOR = '#mode-disabled';

    /**
     * Create and show the dialog to perform the change mode action
     */
    function popActionDialog() {
        AJS.$(MODE_DIALOG_SELECTOR).remove();
        var parameters = {
            options: _generateModeOptions()
        };
        AJS.$('body').append(Confluence.Templates.CollaborativeEditor.Admin.BTF.Config.actionDialog(parameters));
        AJS.dialog2(MODE_DIALOG_SELECTOR).show();

        _setupActionDialog();
    }

    /**
     * Setup the dialog for being interacted with
     * @returns {undefined}
     * @private
     */
    function _setupActionDialog() {
        _bindActions();
        _bindRadioHandlers();
        _setupDialogUI();
    }

    /**
     * Generates the possible options based on the current mode and synchrony status
     * @returns {Array} an Array of the options
     * @private
     */
    function _generateModeOptions() {
        var onOption = _selectNextModeOption(Constant.COLLAB_STATUS_ENABLED);
        var limitedOption = _selectNextModeOption(Constant.COLLAB_STATUS_LIMITED);
        var offOption = _selectNextModeOption(Constant.COLLAB_STATUS_DISABLED);

        return [
            {
                name: 'enabled',
                id: 'mode-enabled',
                label: AJS.I18n.getText('collab.admin.btf.configure.on'),
                descriptionHtml: onOption.body,
                icon: onOption.type
            },
            {
                name: 'limited',
                id: 'mode-limited',
                label: AJS.I18n.getText('collab.admin.btf.configure.limited'),
                descriptionHtml: limitedOption.body,
                icon: limitedOption.type
            },
            {
                name: 'disabled',
                id: 'mode-disabled',
                label: AJS.I18n.getText('collab.admin.btf.configure.off'),
                descriptionHtml: offOption.body,
                icon: offOption.type
            }
        ];
    }

    /**
     * Returns the description and icon for the nextMode selection based on the current synchrony status
     * and collab mode
     * @param {string} nextMode The collab mode the user would choose
     * @private
     */
    function _selectNextModeOption(nextMode) {
        var currentCollabMode = state.getCollabStatus();
        var synchronyStatus = state.getSynchronyStatus();

        return selectOption(MessageOptions.COLLAB_MODE_DESCRIPTORS, {
            collabStatus: currentCollabMode,
            synchronyStatus: synchronyStatus,
            newCollabStatus: nextMode
        }, {body: '', icon: ''});
    }

    /**
     * Setup the dialog UI and show and hide elements as appropriate based on the current status
     * @returns {undefined}
     * @private
     */
    function _setupDialogUI() {
        var $dialog = AJS.$(MODE_DIALOG_SELECTOR);
        var $onModeBox = $dialog.find(ENABLE_RADIO_CONTAINER_SELECTOR);
        var $limitedModeBox = $dialog.find(LIMITED_RADIO_CONTAINER_SELECTOR);
        var $offModeBox = $dialog.find(DISABLE_RADIO_CONTAINER_SELECTOR);
        var $onMode = $dialog.find(ENABLE_RADIO_SELECTOR);
        var $limitedMode = $dialog.find(LIMITED_RADIO_SELECTOR);
        var $offMode = $dialog.find(DISABLE_RADIO_SELECTOR);

        selectOption([{
            option: function () {
                $onMode.prop('checked', true).focus();
                $limitedMode.prop('checked', false);
                $offMode.prop('checked', false);

                _addCurrentModeNotifier($onModeBox);

                state.setNewCollabMode(Constant.COLLAB_STATUS_ENABLED);
            },
            conditions: {
                currentMode: Constant.COLLAB_STATUS_ENABLED
            }
        }, {
            option: function () {
                $onMode.prop('checked', false);
                $limitedMode.prop('checked', true).focus();
                $offMode.prop('checked', false);

                _addCurrentModeNotifier($limitedModeBox);

                state.setNewCollabMode(Constant.COLLAB_STATUS_LIMITED);
            },
            conditions: {
                currentMode: Constant.COLLAB_STATUS_LIMITED
            }
        }, {
            option: function () {
                $limitedModeBox.hide();
                $onMode.prop('checked', false);
                $limitedMode.prop('checked', false);
                $offMode.prop('checked', true).focus();

                _addCurrentModeNotifier($offModeBox);

                state.setNewCollabMode(Constant.COLLAB_STATUS_DISABLED);
            },
            conditions: {
                currentMode: Constant.COLLAB_STATUS_DISABLED
            }
        }], {
            currentMode: state.getCollabStatus()
        })();
        _handleChange();
    }

    /**
     * Adds the "This is your current mode" descriptor to the currently selected mode's description
     * @param {jQuery} $container The container for the selection
     * @private
     */
    function _addCurrentModeNotifier($container) {
        var currentMode = '<span class="current-mode">' + AJS.I18n.getText('collab.admin.btf.configure.current.mode') + '</span> ';
        $container.find('label').after(currentMode);
    }

    /**
     * Bind handlers to the radio buttons for when they get selected.
     * @private
     */
    function _bindRadioHandlers() {
        var $dialog = AJS.$(MODE_DIALOG_SELECTOR);
        var $onMode = $dialog.find(ENABLE_RADIO_SELECTOR);
        var $limitedMode = $dialog.find(LIMITED_RADIO_SELECTOR);
        var $offMode = $dialog.find(DISABLE_RADIO_SELECTOR);

        $onMode.change(function () {
            if ($onMode.prop('checked')) {
                state.setNewCollabMode(Constant.COLLAB_STATUS_ENABLED);
            }

            _handleChange();
        });

        $limitedMode.change(function () {
            if ($limitedMode.prop('checked')) {
                state.setNewCollabMode(Constant.COLLAB_STATUS_LIMITED);
            }

            _handleChange();
        });

        $offMode.change(function () {
            if ($offMode.prop('checked')) {
                state.setNewCollabMode(Constant.COLLAB_STATUS_DISABLED);
            }

            _handleChange();
        });
    }

    /**
     * Handles the change event on a radio button
     * @private
     */
    function _handleChange() {
        if (state.getNewCollabMode() === state.getCollabStatus()) {
            _disableSubmitButton();
        } else {
            _enableSubmitButton();
        }
    }

    /**
     * Bind handlers to the submit and close buttons of the dialog
     * @returns {undefined}
     * @private
     */
    function _bindActions() {
        var $dialog = AJS.$(MODE_DIALOG_SELECTOR);
        var $submitButton = $dialog.find(SUBMIT_BUTTON_SELECTOR);
        var $closeButton = $dialog.find(CLOSE_BUTTON_SELECTOR);

        $closeButton.click(function () {
            AJS.dialog2(MODE_DIALOG_SELECTOR).remove();
        });

        $submitButton.click(_submit);
    }

    /**
     * Handles the submit event on the dialog
     * @returns {undefined}
     * @private
     */
    function _submit() {
        _spin();
        _disableButtons();
        var action;
        switch (state.getNewCollabMode()) {
            case Constant.COLLAB_STATUS_ENABLED:
                action = ModeAction.enable;
                break;
            case Constant.COLLAB_STATUS_DISABLED:
                action = ModeAction.disable;
                break;
            case Constant.COLLAB_STATUS_LIMITED:
                action = ModeAction.limited;
                break;
        }

        action().done(function (data) {
            var taskId = data.taskId;

            TaskService.processTask(taskId, undefined, function () {
                AJS.trigger(Event.CHANGE_COLLAB_MODE_EVENT);
                AJS.dialog2(MODE_DIALOG_SELECTOR).remove();
            });
        });
    }

    /**
     * Disables the action buttons in the dialog
     * @private
     */
    function _disableButtons() {
        var $dialog = AJS.$(MODE_DIALOG_SELECTOR);
        var $closeButton = $dialog.find(CLOSE_BUTTON_SELECTOR);

        $closeButton.prop('disabled', true);
        _disableSubmitButton();
    }

    /**
     * Enables the action buttons in the dialog
     * @private
     */
    function _enableButtons() {
        var $dialog = AJS.$(MODE_DIALOG_SELECTOR);
        var $closeButton = $dialog.find(CLOSE_BUTTON_SELECTOR);

        $closeButton.prop('disabled', false);
        _enableSubmitButton();
    }

    /**
     * Enables the submit button
     * @private
     */
    function _enableSubmitButton() {
        var $dialog = AJS.$(MODE_DIALOG_SELECTOR);
        var $submitButton = $dialog.find(SUBMIT_BUTTON_SELECTOR);

        $submitButton.prop('disabled', false);
    }

    /**
     * Disables the submit button
     * @private
     */
    function _disableSubmitButton() {
        var $dialog = AJS.$(MODE_DIALOG_SELECTOR);
        var $submitButton = $dialog.find(SUBMIT_BUTTON_SELECTOR);

        $submitButton.prop('disabled', true);
    }

    /**
     * Shows the spinner
     * @private
     */
    function _spin() {
        AJS.$(MODE_DIALOG_SELECTOR).find('.button-spinner').spin();
    }

    /**
     * Hides the spinner
     * @private
     */
    function _stopSpinning() {
        AJS.$(MODE_DIALOG_SELECTOR).find('.button-spinner').spinStop();
    }

    return {
        popDialog: popActionDialog
    }

});