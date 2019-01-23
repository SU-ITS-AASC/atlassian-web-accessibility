define('confluence-collaborative-editor-plugin/btf/static/collab-editing-message-options', [
    'confluence-collaborative-editor-plugin/btf/static/constants'
], function (Constant) {
    return {
        /**
         * Message to display for each combination of collab mode and synchrony status that requires a specific
         * message. For use with the option-selector.
         */
        COLLAB_STATUS_MESSAGE: [
            {
                option: {
                    type: 'warning',
                    title: AJS.I18n.getText('collab.admin.btf.configure.synchrony.restarting.title'),
                    body: AJS.I18n.getText('collab.admin.btf.configure.synchrony.restarting.body'),
                    action: 'troubleshoot'
                },
                conditions: {
                    synchronyRestarting: true
                }
            },
            // Managed Synchrony
            {
                option: {
                    type: 'error',
                    title: AJS.I18n.getText('collab.admin.btf.configure.collab.on.synchrony.stopped.title'),
                    body: AJS.I18n.getText('collab.admin.btf.configure.collab.on.synchrony.stopped'),
                    action: 'change'
                },
                conditions: {
                    collabStatus: Constant.COLLAB_STATUS_ENABLED,
                    synchronyStatus: [Constant.SYNCHRONY_STATUS_STOPPED, Constant.SYNCHRONY_STATUS_ERROR],
                    externalSynchrony: false
                }
            }, {
                option: {
                    type: 'warning',
                    title: AJS.I18n.getText('collab.admin.btf.configure.collab.limited.synchrony.running.title'),
                    body: AJS.I18n.getText('collab.admin.btf.configure.collab.limited.synchrony.running'),
                    action: 'change'
                },
                conditions: {
                    collabStatus: Constant.COLLAB_STATUS_LIMITED,
                    synchronyStatus: Constant.SYNCHRONY_STATUS_RUNNING,
                    externalSynchrony: false
                }
            }, {
                option: {
                    type: 'warning',
                    title: AJS.I18n.getText('collab.admin.btf.configure.collab.limited.synchrony.stopped.title'),
                    body: AJS.I18n.getText('collab.admin.btf.configure.collab.limited.synchrony.stopped'),
                    action: 'troubleshoot'
                },
                conditions: {
                    collabStatus: Constant.COLLAB_STATUS_LIMITED,
                    synchronyStatus: [Constant.SYNCHRONY_STATUS_STOPPED, Constant.SYNCHRONY_STATUS_ERROR],
                    externalSynchrony: false
                }
            },
            // External Synchrony
            {
                option: {
                    type: 'error',
                    title: AJS.I18n.getText('collab.admin.btf.configure.collab.on.synchrony.stopped.title.external'),
                    body: AJS.I18n.getText('collab.admin.btf.configure.collab.on.synchrony.stopped.external'),
                    action: 'change'
                },
                conditions: {
                    collabStatus: Constant.COLLAB_STATUS_ENABLED,
                    synchronyStatus: [Constant.SYNCHRONY_STATUS_STOPPED, Constant.SYNCHRONY_STATUS_ERROR],
                    externalSynchrony: true
                }
            }, {
                option: {
                    type: 'warning',
                    title: AJS.I18n.getText('collab.admin.btf.configure.collab.limited.synchrony.running.title'), // same title
                    body: AJS.I18n.getText('collab.admin.btf.configure.collab.limited.synchrony.running.external'),
                    action: 'change'
                },
                conditions: {
                    collabStatus: Constant.COLLAB_STATUS_LIMITED,
                    synchronyStatus: Constant.SYNCHRONY_STATUS_RUNNING,
                    externalSynchrony: true
                }
            }, {
                option: {
                    type: 'warning',
                    title: AJS.I18n.getText('collab.admin.btf.configure.collab.limited.synchrony.stopped.title.external'),
                    body: AJS.I18n.getText('collab.admin.btf.configure.collab.limited.synchrony.stopped.external'),
                    action: 'troubleshoot'
                },
                conditions: {
                    collabStatus: Constant.COLLAB_STATUS_LIMITED,
                    synchronyStatus: [Constant.SYNCHRONY_STATUS_STOPPED, Constant.SYNCHRONY_STATUS_ERROR],
                    externalSynchrony: true
                }
            }
        ],
        /**
         * Message to display for each combination of collab mode and synchrony status when changing modes.
         * For use with the option-selector.
         */
        COLLAB_MODE_DESCRIPTORS: [
            {
                option: {
                    type: 'success',
                    body: AJS.I18n.getText('collab.admin.btf.configure.collab.on.synchrony.running.on.prompt')
                },
                conditions: {
                    collabStatus: Constant.COLLAB_STATUS_ENABLED,
                    newCollabStatus: Constant.COLLAB_STATUS_ENABLED,
                    synchronyStatus: Constant.SYNCHRONY_STATUS_RUNNING
                }
            },
            {
                option: {
                    type: 'warning',
                    body: AJS.I18n.getText('collab.admin.btf.configure.collab.on.synchrony.running.limited.prompt')
                },
                conditions: {
                    collabStatus: Constant.COLLAB_STATUS_ENABLED,
                    newCollabStatus: Constant.COLLAB_STATUS_LIMITED,
                    synchronyStatus: Constant.SYNCHRONY_STATUS_RUNNING
                }
            },
            {
                option: {
                    type: 'error',
                    body: AJS.I18n.getText('collab.admin.btf.configure.collab.on.synchrony.running.off.prompt')
                },
                conditions: {
                    collabStatus: Constant.COLLAB_STATUS_ENABLED,
                    newCollabStatus: Constant.COLLAB_STATUS_DISABLED,
                    synchronyStatus: Constant.SYNCHRONY_STATUS_RUNNING
                }
            },
            {
                option: {
                    type: 'error',
                    body: AJS.I18n.getText('collab.admin.btf.configure.collab.on.synchrony.stopped.on.prompt')
                },
                conditions: {
                    collabStatus: Constant.COLLAB_STATUS_ENABLED,
                    newCollabStatus: Constant.COLLAB_STATUS_ENABLED,
                    synchronyStatus: [Constant.SYNCHRONY_STATUS_STOPPED, Constant.SYNCHRONY_STATUS_ERROR]
                }
            },
            {
                option: {
                    type: 'warning',
                    body: AJS.I18n.getText('collab.admin.btf.configure.collab.on.synchrony.stopped.limited.prompt')
                },
                conditions: {
                    collabStatus: Constant.COLLAB_STATUS_ENABLED,
                    newCollabStatus: Constant.COLLAB_STATUS_LIMITED,
                    synchronyStatus: [Constant.SYNCHRONY_STATUS_STOPPED, Constant.SYNCHRONY_STATUS_ERROR]
                }
            },
            {
                option: {
                    type: 'error',
                    body: AJS.I18n.getText('collab.admin.btf.configure.collab.on.synchrony.stopped.off.prompt')
                },
                conditions: {
                    collabStatus: Constant.COLLAB_STATUS_ENABLED,
                    newCollabStatus: Constant.COLLAB_STATUS_DISABLED,
                    synchronyStatus: [Constant.SYNCHRONY_STATUS_STOPPED, Constant.SYNCHRONY_STATUS_ERROR]
                }
            },
            {
                option: {
                    type: 'success',
                    body: AJS.I18n.getText('collab.admin.btf.configure.collab.limited.synchrony.running.on.prompt')
                },
                conditions: {
                    collabStatus: Constant.COLLAB_STATUS_LIMITED,
                    newCollabStatus: Constant.COLLAB_STATUS_ENABLED,
                    synchronyStatus: Constant.SYNCHRONY_STATUS_RUNNING
                }
            },
            {
                option: {
                    type: 'warning',
                    body: AJS.I18n.getText('collab.admin.btf.configure.collab.limited.synchrony.running.limited.prompt')
                },
                conditions: {
                    collabStatus: Constant.COLLAB_STATUS_LIMITED,
                    newCollabStatus: Constant.COLLAB_STATUS_LIMITED,
                    synchronyStatus: Constant.SYNCHRONY_STATUS_RUNNING
                }
            },
            {
                option: {
                    type: 'error',
                    body: AJS.I18n.getText('collab.admin.btf.configure.collab.limited.synchrony.running.off.prompt')
                },
                conditions: {
                    collabStatus: Constant.COLLAB_STATUS_LIMITED,
                    newCollabStatus: Constant.COLLAB_STATUS_DISABLED,
                    synchronyStatus: Constant.SYNCHRONY_STATUS_RUNNING
                }
            },
            {
                option: {
                    type: 'error',
                    body: AJS.I18n.getText('collab.admin.btf.configure.collab.limited.synchrony.stopped.on.prompt')
                },
                conditions: {
                    collabStatus: Constant.COLLAB_STATUS_LIMITED,
                    newCollabStatus: Constant.COLLAB_STATUS_ENABLED,
                    synchronyStatus: [Constant.SYNCHRONY_STATUS_STOPPED, Constant.SYNCHRONY_STATUS_ERROR]
                }
            },
            {
                option: {
                    type: 'warning',
                    body: AJS.I18n.getText('collab.admin.btf.configure.collab.limited.synchrony.stopped.limited.prompt')
                },
                conditions: {
                    collabStatus: Constant.COLLAB_STATUS_LIMITED,
                    newCollabStatus: Constant.COLLAB_STATUS_LIMITED,
                    synchronyStatus: [Constant.SYNCHRONY_STATUS_STOPPED, Constant.SYNCHRONY_STATUS_ERROR]
                }
            },
            {
                option: {
                    type: 'error',
                    body: AJS.I18n.getText('collab.admin.btf.configure.collab.limited.synchrony.stopped.off.prompt')
                },
                conditions: {
                    collabStatus: Constant.COLLAB_STATUS_LIMITED,
                    newCollabStatus: Constant.COLLAB_STATUS_DISABLED,
                    synchronyStatus: [Constant.SYNCHRONY_STATUS_STOPPED, Constant.SYNCHRONY_STATUS_ERROR]
                }
            },
            {
                option: {
                    type: 'success',
                    body: AJS.I18n.getText('collab.admin.btf.configure.collab.off.synchrony.stopped.on.prompt')
                },
                conditions: {
                    collabStatus: Constant.COLLAB_STATUS_DISABLED,
                    newCollabStatus: Constant.COLLAB_STATUS_ENABLED,
                    synchronyStatus: [Constant.SYNCHRONY_STATUS_RUNNING, Constant.SYNCHRONY_STATUS_STOPPED, Constant.SYNCHRONY_STATUS_ERROR]
                }
            },
            {
                option: {
                    type: 'error',
                    body: AJS.I18n.getText('collab.admin.btf.configure.collab.off.synchrony.stopped.off.prompt')
                },
                conditions: {
                    collabStatus: Constant.COLLAB_STATUS_DISABLED,
                    newCollabStatus: Constant.COLLAB_STATUS_DISABLED,
                    synchronyStatus: [Constant.SYNCHRONY_STATUS_RUNNING, Constant.SYNCHRONY_STATUS_STOPPED, Constant.SYNCHRONY_STATUS_ERROR]
                }
            }
        ]
    }
});