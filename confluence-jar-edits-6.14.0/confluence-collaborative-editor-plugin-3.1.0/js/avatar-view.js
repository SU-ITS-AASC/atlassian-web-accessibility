define('confluence-collaborative-editor-plugin/avatar-view', [
    'backbone',
    'ajs',
    'confluence/templates',
    'jquery'
], function (Backbone,
             AJS,
             Templates,
             $) {
    return Backbone.View.extend({
        initialize: function () {
            this.model.on("remove", this.remove, this);
        },

        render: function () {
            this.$el = $(Templates.SynchronyPresence.avatar({
                title: this._determineTitle(),
                initial: this.model.get('fullname').charAt(0).toUpperCase(),
                fullname: this.model.get('fullname'),
                username: this.model.get('username'),
                avatarUrl: this.model.get('avatarURL'),
                origin: this.model.get('origin'),
                active: this.model.get('active'),
                currentUser: this.model.get('currentUser'),
                telepointer: this._synchronyTelepointerId()
            }));

            return this.$el;
        },

        remove: function () {
            this.$el.removeClass().addClass('avatar-item animate');

            if (!this.model.get('hidden')) {
                this.$el.addClass('removing');
            }

            this.$el.one(this._getSupportedTransition(),
                function () {
                    $(this).removeClass('animate removing');
                    $(this).remove();
                }
            );
        },
        _determineTitle: function () {
            if (this.model.get('currentUser')) {
                // We take this opportunity to be a bit fun, and have a moment of delight.
                var choices = [
                    AJS.I18n.getText('collab.presence.avatar.you.1'),
                    AJS.I18n.getText('collab.presence.avatar.you.2')
                ];
                return choices[Math.floor(Math.random() * choices.length)];
            }

            return this.model.get('fullname') + ' ' + (this.model.get('active')
                ? AJS.I18n.getText('collab.presence.avatar.editing')
                : AJS.I18n.getText('collab.presence.avatar.historical'));
        },
        _getSupportedTransition: function () {
            var transitionList = {
                'transition': 'transitionend',
                'MozTransition': 'transitionend',
                'OTransition': 'oTransitionEnd',
                'MsTransition': 'msTransitionEnd',
                'WebkitTransition': 'webkitTransitionEnd'
            };

            var mockElement = document.createElement("_");

            for (var transition in transitionList) {
                if (mockElement.style[transition] !== undefined) {
                    return transitionList[transition];
                }
            }
        },

        // This function is used to calculate the telepointer colour for avatar matching.
        _synchronyTelepointerId: function () {
            var str = '' + (this.model.get('sub') || this.model.get('origin') || '');
            var hash = 0;

            for (var i = 0; i < str.length; i++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(i);
                hash = hash & hash; // Convert to 32bit integer
            }

            return (Math.abs(hash) % 10);
        }
    });
});