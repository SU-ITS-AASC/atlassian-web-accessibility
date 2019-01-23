define('confluence-collaborative-editor-plugin/lib/SyncManager', [
    'ajs',
    'jquery'
], function(
    AJS,
    $
) {
    'use strict';

    // prefix used for synchrony events
    var SYNCHRONY_EVENT_PREFIX = 'synchrony.';

    // required properties to be set on the data object from the DOM triggred events, used to pass to entity start/stop
    var REQUIRED_PAYLOAD_PROPERTIES = ['id'];

    // SyncManager default settings that can be modified during instantiation
    var DEFAULT_OPTIONS = {
        START_SYNCHRONIZING_EVENT_NAME: 'start',
        STOP_SYNCHRONIZING_EVENT_NAME: 'stop',
        MAX_CONSECUTIVE_AUTO_RECOVERY_TRIGGERED: 10,
        MAX_WAIT_TIME_TO_RESTART: 30000, // 30 seconds
        DEBUG_MODE: false
    };

    var DEBUG_MESSAGES = {
        AUTO_RECOVERY_TIMER_TRIGGERED: 'Auto recovery has been triggered',
        AUTO_RECOVERY_TIMER_TRIGGERED_TOO_MANY_TIMES: 'Auto recovery has been triggered too many times for the same action',
        INVALID_EVENT_PAYLOAD: 'Invalid payload, missing required params',
        START_ENTITY: 'Starting entity synchronization',
        STOP_ENTITY: 'Stoping entity synchronization'
    };

    var createControlState = function() {
        return {
            DISABLED_SYNC_STATUS: false,
            RECOVERY_TIMER_RUNNING: false,
            CONSECUTIVE_AUTO_RECOVERY_TRIGGERED: 0
        };
    };

    var validatePayload = function(payload) {
        return REQUIRED_PAYLOAD_PROPERTIES.every(function(prop) {
            return typeof payload[prop] !== 'undefined';
        });
    };

    /**
     * SyncManager
     *
     * @param {SynchronyEntity} entity - synchrony entity
     * @param {Object} options - optional params to override defaults} options
     */
    var SyncManager = function(entity, options) {
        this.entity = entity;
        this.settings = $.extend({}, DEFAULT_OPTIONS, options || {});
        this.controlSyncState = {}; // hashMap used to store cached states
        this.recoveryTimeoutTasks = {}; // hashMap used to cache on going timeout requests for the auto-recovery
        var eventDispatcher = function(func, e, payload) {
            if (!validatePayload(payload)) {
                this.displayLogMessage(DEBUG_MESSAGES.INVALID_EVENT_PAYLOAD, e, payload);
            } else {
                func(payload);
            }
        };

        AJS.bind(SYNCHRONY_EVENT_PREFIX + this.settings.START_SYNCHRONIZING_EVENT_NAME,
            eventDispatcher.bind(this, this.enableSynchronization.bind(this)));

        AJS.bind(SYNCHRONY_EVENT_PREFIX + this.settings.STOP_SYNCHRONIZING_EVENT_NAME,
            eventDispatcher.bind(this, this.disableSynchronization.bind(this)));
    };

    SyncManager.prototype.getOrCreateControlSyncState = function(id) {
        var controlSyncState = this.controlSyncState[id] = this.controlSyncState[id] || createControlState();
        return controlSyncState;
    };

    SyncManager.prototype.enableDebug = function(enabledFlag) {
        this.settings.DEBUG_MODE = typeof enabledFlag !== 'undefined' ? enabledFlag : true;
    };

    SyncManager.prototype.displayLogMessage = function() {
        if (this.settings.DEBUG_MODE) {
            var args = Array.prototype.slice.call(arguments);
            args.splice(0, 0, 'DEBUG: ' + new Date().toLocaleTimeString());
            console.log.apply(console, args);
        }
    };

    SyncManager.prototype.disableSynchronization = function(payload) {
        var id = payload.id;
        var controlSyncState = this.getOrCreateControlSyncState(id);

        // update the controlState map status
        controlSyncState.DISABLED_SYNC_STATUS = true;

        // remove previously queued timedActions
        this.clearAutoRecoveryTimer(id);

        // if we disable synchronization we need to make sure we will auto start it if something goes wrong
        this.setAutoRecoveryTimer(payload);

        // call synchrony entity stop
        this.entity.stop(id);

        // we also log all the hashmap of syncStates
        this.displayLogMessage(DEBUG_MESSAGES.STOP_ENTITY, id, $.extend(true, {}, this.controlSyncState));
    };

    SyncManager.prototype.enableSynchronization = function(payload) {
        var id = payload.id;
        var controlSyncState = this.getOrCreateControlSyncState(id);

        // update the controlState map status
        controlSyncState.DISABLED_SYNC_STATUS = false;

        // remove previously queued timedActions
        this.clearAutoRecoveryTimer(id);

        // call synchrony entity start
        this.entity.start(id);

        // we also log all the hashmap of syncStates
        this.displayLogMessage(DEBUG_MESSAGES.START_ENTITY, id, $.extend(true, {}, this.controlSyncState));
    };

    SyncManager.prototype.clearAutoRecoveryTimer = function(id) {
        var controlSyncState = this.getOrCreateControlSyncState(id);

        // clear any existing que timers
        clearTimeout(this.recoveryTimeoutTasks[id]);

        // delete form the cashed hash to avoid leaks
        delete this.recoveryTimeoutTasks[id];

        // update the controlState map about the running status
        controlSyncState.RECOVERY_TIMER_RUNNING = false;
    };

    SyncManager.prototype.setAutoRecoveryTimer = function(options) {
        var id = options.id;
        var controlSyncState = this.getOrCreateControlSyncState(id);

        controlSyncState.RECOVERY_TIMER_RUNNING = true;

        this.recoveryTimeoutTasks[id] = setTimeout(function() {
            this.displayLogMessage(DEBUG_MESSAGES.AUTO_RECOVERY_TIMER_TRIGGERED, id);

            this.clearAutoRecoveryTimer(id);

            // update the controlState map status
            controlSyncState.DISABLED_SYNC_STATUS = false;
            controlSyncState.RECOVERY_TIMER_RUNNING = false;
            controlSyncState.CONSECUTIVE_AUTO_RECOVERY_TRIGGERED++;

            // we want to keep the metrics of recovered actions
            AJS.trigger('analyticsEvent', {
                name: 'confluence.synchrony.syncmanager.failed-to-restart',
                data: {
                    id: id
                }
            });

            // we want to keep track of actions that fail too many time in the same session
            if (controlSyncState.CONSECUTIVE_AUTO_RECOVERY_TRIGGERED >= this.settings.MAX_CONSECUTIVE_AUTO_RECOVERY_TRIGGERED) {
                this.displayLogMessage(DEBUG_MESSAGES.AUTO_RECOVERY_TIMER_TRIGGERED_TOO_MANY_TIMES, id, this.controlSyncState[id].CONSECUTIVE_AUTO_RECOVERY_TRIGGERED);

                AJS.trigger('analyticsEvent', {
                    name: 'confluence.synchrony.syncmanager.consecutive-failed-to-restart',
                    data: {
                        id: id
                    }
                });
            }

            this.entity.start(id);
        }.bind(this), options.maxWaitTimeToRestart || this.settings.MAX_WAIT_TIME_TO_RESTART);
    };

    return SyncManager;
});
