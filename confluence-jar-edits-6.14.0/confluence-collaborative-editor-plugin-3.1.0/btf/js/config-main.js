require([
    'ajs',
    'confluence/legacy',
    'confluence-collaborative-editor-plugin/btf/dialog/change-mode-dialog',
    'confluence-collaborative-editor-plugin/btf/dialog/restart-synchrony-dialog',
    'confluence-collaborative-editor-plugin/btf/event/event',
    'confluence-collaborative-editor-plugin/btf/fetch/fetch-collab-status',
    'confluence-collaborative-editor-plugin/btf/fetch/fetch-synchrony-configuration',
    'confluence-collaborative-editor-plugin/btf/fetch/fetch-synchrony-status',
    'confluence-collaborative-editor-plugin/btf/state/state',
    'confluence-collaborative-editor-plugin/btf/static/constants',
    'confluence-collaborative-editor-plugin/btf/static/collab-editing-message-options',
    'confluence-collaborative-editor-plugin/btf/util/option-selector'
], function (AJS,
             Confluence,
             ChangeModeDialog,
             RestartSynchronyDialog,
             Event,
             fetchCollabStatus,
             fetchSynchronyConfiguration,
             fetchSynchronyStatus,
             state,
             Constant,
             MessageOptions,
             selectOption) {
    var POLL_INTERVAL = 5000;
    var ACTION_CHANGE_MODE = 'change';

    AJS.toInit(function () {
        var isExternal = !WRM.data.claim('com.atlassian.confluence.plugins.confluence-collaborative-editor-plugin:btf-config-resources.synchrony-self-managed-cluster');
        state.setExternalSynchrony(isExternal);
        _main();
        // Setup the poller for the state
        setInterval(function () {
            _main(true);
        }, POLL_INTERVAL);
    });

    AJS.bind(Event.CHANGE_COLLAB_MODE_EVENT, _main.bind(this, true));
    AJS.bind(Event.SYNCHRONY_RESTARTED_EVENT, _main.bind(this, true));


    /**
     * Main method
     * @private
     */
    function _main(skipLoad) {
        if (!skipLoad) {
            AJS.$(Constant.COLLAB_STATUS_SPINNER_SELECTOR).spin();
            AJS.$(Constant.SYNCHRONY_STATUS_SPINNER_SELECTOR).spin();
        }

        _doCheckStatus();
        _doUpdateSynchronyConfigurationDisplay();
    }

    /**
     * Makes a request to check Collab Status and Synchrony Status and processes the results
     * @returns {undefined}
     * @private
     */
    function _doCheckStatus() {
        AJS.$.when(fetchCollabStatus(), fetchSynchronyStatus()).done(function (collabResponse, synchronyResponse) {
            AJS.$(Constant.COLLAB_STATUS_SPINNER_SELECTOR).spinStop();
            AJS.$(Constant.SYNCHRONY_STATUS_SPINNER_SELECTOR).spinStop();

            var collabStatus = _determineCollabMode(collabResponse);
            var synchronyStatus = _determineSynchronyStatus(synchronyResponse);
            state.setCollabStatus(collabStatus);
            state.setSynchronyStatus(synchronyStatus);
            state.setTaskId(collabResponse.longRunningTaskId);
            state.setTaskName(collabResponse.longRunningTaskName);


            _createCollabModeDisplay(collabStatus);
            _createSynchronyStatusDisplay(synchronyStatus, collabStatus);
            _updateMessage(collabStatus, synchronyStatus);
            _bindCollabActions();
            _bindSynchronyActions();
            _adjustLozengeStyles();
        });
    }

    /**
     * Adjusts the styles of the status lozenges for collab editing mode and synchrony status.
     * If Synchrony is still restarting the lozenges show up as faint.
     * @returns {undefined}
     * @private
     */
    function _adjustLozengeStyles() {
        AJS.$(Constant.COLLAB_CONFIG_SELECTOR).find(Constant.STATUS_LOZENGE_SELECTOR)
            .css('opacity', _isSynchronyRestarting() ? 0.5 : 1);
    }

    /**
     * Fetches the configuration setup for Synchrony and displays the results on the page
     * @returns {undefined}
     * @private
     */
    function _doUpdateSynchronyConfigurationDisplay() {
        fetchSynchronyConfiguration().done(function (data) {
            var portProperty = {
                name: AJS.I18n.getText('collab.admin.btf.configure.synchrony.configuration.property.port'),
                value: data.port
            };
            var memoryProperty = {
                name: AJS.I18n.getText('collab.admin.btf.configure.synchrony.configuration.property.memory'),
                value: data.memory.toUpperCase() + "B"
            };
            var driverProperty = {
                name: AJS.I18n.getText('collab.admin.btf.configure.synchrony.configuration.property.driver'),
                value: data.driver
            };
            var serviceUrlProperty = {
                name: AJS.I18n.getText('collab.admin.btf.configure.synchrony.configuration.property.serviceUrl'),
                value: data.serviceUrl
            };
            var properties = state.isExternalSynchrony()
                ? [serviceUrlProperty, driverProperty]
                : [portProperty, memoryProperty, driverProperty];

            AJS.$(Constant.SYNCHRONY_PROPERTIES_SELECTOR).html(
                Confluence.Templates.CollaborativeEditor.Admin.BTF.Config.synchronyConfig({
                    properties: properties
                }));
        });
    }

    /**
     * Binds handlers to the Collab Editing mode action buttons
     * @returns {undefined}
     * @private
     */
    function _bindCollabActions() {
        var $container = AJS.$(Constant.COLLAB_STATUS_SELECTOR);
        var $actionLink = $container.find(Constant.ACTION_BUTTON_SELECTOR);

        $actionLink.click(function () {
            ChangeModeDialog.popDialog();
        });

        $actionLink.prop('disabled', _isSynchronyRestarting());
    }

    /**
     * Binds handlers to the synchrony action buttons
     * @returns {undefined}
     * @private
     */
    function _bindSynchronyActions() {
        var $container = AJS.$(Constant.SYNCHRONY_STATUS_SELECTOR);
        var $actionLink = $container.find(Constant.ACTION_BUTTON_SELECTOR);

        if (state.isExternalSynchrony() || state.getCollabStatus() === Constant.COLLAB_STATUS_DISABLED) {
            return $actionLink.remove();
        }

        $actionLink.click(function () {
            RestartSynchronyDialog.popDialog();
        });

        $actionLink.prop('disabled', _isSynchronyRestarting());
    }

    /**
     * Selects and displays a message if one is available
     * @param {string} collabMode Current collab editing mode
     * @param {string} synchronyStatus Current Synchrony status
     * @returns {undefined}
     * @private
     */
    function _updateMessage(collabMode, synchronyStatus) {
        var $messageBox = AJS.$(Constant.COLLAB_MESSAGE_SELECTOR);
        $messageBox.find('.aui-message').remove();
        $messageBox.hide();

        var message = _determineCollabMessage(collabMode, synchronyStatus);
        if (!message || !message.body) {
            return;
        }
        AJS.messages[message.type || 'generic'](Constant.COLLAB_MESSAGE_SELECTOR, {
            title: message.title,
            body: '<p>' + message.body + '</p>'
            + (message.action ? _createActionHtml(message.action) : ''),
            closeable: false
        });
        $messageBox.show();

        _bindAction($messageBox, message.action);
    }

    /**
     * Creates the HTML for the action to take as part of a warning/error message
     * @param action
     * @private
     */
    function _createActionHtml(action) {
        return Confluence.Templates.CollaborativeEditor.Admin.BTF.Config.actionLink({action: action});
    }

    /**
     * Binds the action to the action link from _createActionHtml
     * @param $container
     * @param action
     * @private
     */
    function _bindAction($container, action) {
        var $button = $container.find('.action-link').first();
        switch (action) {
            case ACTION_CHANGE_MODE:
                $button.click(function () {
                    ChangeModeDialog.popDialog();
                });
        }
    }

    /**
     * Determines a warning/error message to display if something isn't quite right
     * @param {string} collabMode Current Collab Editing mode
     * @param {string} synchronyStatus Current synchrony status
     * @returns {object} The message to display if one is found, or undefined
     * @private
     */
    function _determineCollabMessage(collabMode, synchronyStatus) {
        return selectOption(MessageOptions.COLLAB_STATUS_MESSAGE, {
            collabStatus: collabMode,
            synchronyStatus: synchronyStatus,
            externalSynchrony: state.isExternalSynchrony(),
            synchronyRestarting: _isSynchronyRestarting()
        });
    }

    /**
     * Figures out if Synchrony is still restarting based on the state
     * @returns {boolean} true if it's restarting
     * @private
     */
    function _isSynchronyRestarting() {
        var isSynchronyRestartTask = state.getTaskName() === Constant.ENABLE_TASK_NAME
            || state.getTaskName() === Constant.RESTART_SYNCHRONY_TASK_NAME;
        var synchronyRestarting = state.getSynchronyStatus() !== Constant.SYNCHRONY_STATUS_RUNNING
            && state.getTaskId() && isSynchronyRestartTask;

        return !!synchronyRestarting;
    }

    /**
     * Calls the template to display the Collab Editing mode
     * @param {string} mode The current Collab Editing mode
     * @returns {undefined}
     * @private
     */
    function _createCollabModeDisplay(mode) {
        var $container = AJS.$(Constant.COLLAB_STATUS_SELECTOR);
        $container.html(Confluence.Templates.CollaborativeEditor.Admin.BTF.Config.collabStatus({mode: mode}));
    }

    /**
     * Calls the template to display the Synchrony Status
     * @param {string} status   Current Synchrony Status
     * @param {string} collabMode Current Collab Editing mode
     * @returns {undefined}
     * @private
     */
    function _createSynchronyStatusDisplay(status, collabMode) {
        var $container = AJS.$(Constant.SYNCHRONY_STATUS_SELECTOR);
        $container.html(Confluence.Templates.CollaborativeEditor.Admin.BTF.Config.synchronyStatus({
            status: status,
            collabMode: collabMode
        }));

        _chooseSynchronyDescriptionToDisplay();
    }

    /**
     * Based on current Synchrony Mode (managed/external), chooses a Synchrony description to display,
     * and removes the other one.
     * @returns {undefined}
     * @private
     */
    function _chooseSynchronyDescriptionToDisplay() {
        var $container = AJS.$(Constant.SYNCHRONY_STATUS_SELECTOR);
        var $managedDescription = $container.find(Constant.SYNCHRONY_DESCRIPTION_MANAGED_SELECTOR);
        var $externalDescription = $container.find(Constant.SYNCHRONY_DESCRIPTION_EXTERNAL_SELECTOR);

        if (state.isExternalSynchrony()) {
            $externalDescription.show();
            $managedDescription.remove();
        } else {
            $externalDescription.remove();
            $managedDescription.show();
        }
    }

    /**
     * Determines the current Collab Editing Mode based on the response from the server
     * @param {object} response Json Response
     * @returns {string} The current mode
     * @private
     */
    function _determineCollabMode(response) {
        if (response.synchronyEnabled && response.sharedDraftsEnabled) {
            return Constant.COLLAB_STATUS_ENABLED;
        }

        if (!response.synchronyEnabled && response.sharedDraftsEnabled) {
            return Constant.COLLAB_STATUS_LIMITED;
        }

        return Constant.COLLAB_STATUS_DISABLED;
    }

    /**
     * Determines the current status of Synchrony based on the response from the server
     * @param {object} response Json Response
     * @returns {string} Current Synchrony status
     * @private
     */
    function _determineSynchronyStatus(response) {
        if (response.status === 'running') {
            return Constant.SYNCHRONY_STATUS_RUNNING;
        }

        if (response.status === 'stopped') {
            return Constant.SYNCHRONY_STATUS_STOPPED;
        }

        return Constant.SYNCHRONY_STATUS_ERROR;
    }
});