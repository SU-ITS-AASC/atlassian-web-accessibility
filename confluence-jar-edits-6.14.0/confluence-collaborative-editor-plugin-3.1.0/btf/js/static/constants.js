define('confluence-collaborative-editor-plugin/btf/static/constants', [], function () {
    return {
        COLLAB_STATUS_ENABLED: 'enabled',
        COLLAB_STATUS_LIMITED: 'limited',
        COLLAB_STATUS_DISABLED: 'disabled',

        SYNCHRONY_STATUS_RUNNING: 'running',
        SYNCHRONY_STATUS_ERROR: 'error',
        SYNCHRONY_STATUS_STOPPED: 'stopped',

        COLLAB_CONFIG_SELECTOR: '#collab-editing-config',
        COLLAB_MESSAGE_SELECTOR: '#collab-editing-message',
        COLLAB_STATUS_SELECTOR: '#collab-status',
        COLLAB_STATUS_SPINNER_SELECTOR: '#collab-spinner',

        SYNCHRONY_STATUS_SELECTOR: '#synchrony-status',
        SYNCHRONY_STATUS_SPINNER_SELECTOR: '#synchrony-spinner',
        SYNCHRONY_PROPERTIES_SELECTOR: '#synchrony-config',

        SYNCHRONY_DESCRIPTION_MANAGED_SELECTOR: '#synchrony-description-managed',
        SYNCHRONY_DESCRIPTION_EXTERNAL_SELECTOR: '#synchrony-description-external',

        ACTION_BUTTON_SELECTOR: '.action-button',
        STATUS_LOZENGE_SELECTOR: '.status-lozenge',

        DISABLE_TASK_NAME: 'DisableTask',
        ENABLE_TASK_NAME: 'EnableTask',
        LIMITED_TASK_NAME: 'LimitedTask',
        RESTART_SYNCHRONY_TASK_NAME: 'Restart Synchrony Task'
    }
});
