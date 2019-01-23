// Create a status indicator like so:
// new StatusIndicator({el: '#pluggable-status', model: new Backbone.Model({ minActiveTime: 500 })});
// Where minActiveTime is the minimum time the status indicator
// You should then call onConnectedState(entity) providing a Synchrony Entity to start the ui.

define('confluence-collaborative-editor-plugin/status-indicator-view', [
    'confluence/templates',
    'backbone',
    'ajs',
    'jquery',
    'underscore'
], function(
    Templates,
    Backbone,
    AJS,
    $,
    _
) {
    'use strict';
    return Backbone.View.extend({
        initialize: function() {
            this.$el.addClass('synchrony');

            this.listenTo(this.model, "change:saving change:error", this.render);

            // We begin in a very optimistic state.
            this.model.set('confluenceUnreachable', false);
            this.model.set('synchronyUnreachable', false);
            this.model.set('tokenExpired', false);

            AJS.bind("rte.heartbeat", _.bind(this.onConfluenceConnectedState, this));
            AJS.bind("rte.safe-save.error", _.bind(this._errorPublishing, this));
            AJS.bind("rte.preview.error", _.bind(this._errorPublishing, this));

            this.model.set('connecting', true);
            this._setProgressState();
        },

        render: function() {
            $('.tipsy').remove(); // Here we need to remove the tooltip in case the content changes.
            this.$el.html(Templates.CollaborativeEditor.StatusIndicator.container(this.model.attributes));
        },

        onConnectedState: function(entity) {
            this.model.set('synchronyUnreachable', false);

            if (!this.model.has('synchronyEntity')) {
                this.model.set('synchronyEntity', entity);

                var view = this;
                this.model.get('synchronyEntity').on('update', function(event) {
                    view._handleSynchronyUpdateEvent(event, view);
                });

                this.model.get('synchronyEntity').on('ack', function(event) {
                    view._handleSynchronyAckEvent(event, view);
                });
            }

            this._setSavedState();
        },

        onDisconnectedState: function() {
            this.model.set('synchronyUnreachable', true);
            this.model.set('connecting', true);
            this._setErrorState();
        },

        onConfluenceConnectedState: function() {
            if (this.model.get('confluenceUnreachable')) {
                this.model.set('confluenceUnreachable', false);
                this._setSavedState();
            }
        },

        onConfluenceDisconnectedState: function() {
            this.model.set('confluenceUnreachable', true);
            this.model.set('connecting', true);
            this._setErrorState();
        },

        onTokenRenewedState: function() {
            if (this.model.get('tokenExpired')) {
                this.model.set('tokenExpired', false);
                this._setSavedState();
            }
        },

        onTokenExpiredState: function() {
            this.model.set('tokenExpired', true);
            this.model.set('connecting', true);
            this._setErrorState();
        },

        // Please see https://extranet.atlassian.com/display/SYNC/API+documentation for a description of the
        // Synchrony API.
        _handleSynchronyUpdateEvent: function(event, view) {
            if (event.updateType === 'local') {
                view.model.set('pendingChanges', true);
                view._saving();
            }
        },

        _handleSynchronyAckEvent: function(event, view) {
            var pendingChanges = event.pending.length > 0;

            view.model.set('pendingChanges', pendingChanges);

            if (!pendingChanges) {
                view.model.set('lastSavedTime', new Date().getTime());
            }
        },

        _saving: function() {
            var view = this;
            var poll = function() {
                setTimeout(function() {
                    if (view.model.get('pendingChanges') || new Date().getTime() - view.model.get('lastSavedTime') < view.model.get('minActiveTime')) {
                        poll();
                    } else {
                        view._setSavedState();
                    }
                }, view.model.get('minActiveTime'));
            };

            if (this.model.get('saving')) {
                return; // We are already showing the 'saving...' message, no need to do anything.
            }

            this.model.set('connecting', false);
            this._setProgressState();

            poll();
        },

        _reachable: function() {
            return !this.model.get('confluenceUnreachable') && !this.model.get('synchronyUnreachable') && !this.model.get('tokenExpired');
        },

        _errorPublishing: function(e, data) {
            // Using a switch here and leaving in all the error codes so we can change this down the track easily.
            switch (data.status) {
                case 0: // Unreachable / no response.
                    this.onConfluenceDisconnectedState();
                    break;
                case 500: // Internal server error.
                case 503: // Request not recognised.
                    this.onConfluenceDisconnectedState();
                    break;
                case 400: // Duplicate/no title etc.
                case 403: // Not logged in.
                case 404: // Page could not be found.
                case 409: // Conflict.
                case 410: // Page no longer exists/deleted.
                case 413: // Page content too large.
                default:
                    break;
            }
        },

        _setSavedState: function() {
            if (this._reachable() && AJS.Meta.get('access-mode') !== 'READ_ONLY') {
                this.model.set('statusMessage', this.model.get('connecting') ? AJS.I18n.getText("collab.status.connected") : AJS.I18n.getText("collab.status.saved"));
                this.model.set('isReadyToGo', !!this.model.get('connecting'));
                this.model.set('tooltipMessage', AJS.I18n.getText("collab.status.tooltip.success"));
                this.model.set('connecting', false);
                this.model.set('saving', false);
                this.model.set('error', false);
            } else {
                this._setErrorState();
            }
        },

        _setErrorState: function() {
            var isReadWrite = AJS.Meta.get('access-mode') !== 'READ_ONLY';
            this.model.set('statusMessage', AJS.I18n.getText("collab.status.error"));
            this.model.set('tooltipMessage', isReadWrite ? AJS.I18n.getText("collab.status.tooltip.failure") : AJS.I18n.getText("read.only.mode.default.error.short.message"));
            this.model.set('saving', false);
            this.model.set('error', true);
        },

        _setProgressState: function() {
            if (this._reachable()) {
                this.model.set('statusMessage', this.model.get('connecting') ? AJS.I18n.getText("collab.status.connecting") : AJS.I18n.getText("collab.status.saving"));
                this.model.set('tooltipMessage', AJS.I18n.getText("collab.status.tooltip.success"));
                this.model.set('saving', true);
                this.model.set('error', false);
            } else {
                this._setErrorState();
            }
        }
    });
});