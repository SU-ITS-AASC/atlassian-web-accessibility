define('confluence-collaborative-editor-plugin/avatar-list-view', [
    'backbone',
    'confluence-collaborative-editor-plugin/avatar-view',
    'ajs',
    'jquery',
    'underscore'
], function(
    Backbone,
    AvatarView,
    AJS,
    $,
    _
) {
    var MAX_AVATARS = 5;

    return Backbone.View.extend({
        initialize: function() {
            this.collection.on("add", this.addAvatar, this);
            this.collection.on("remove", this.removeAvatar, this);

            this.collection.each(this.addAvatar, this);
        },

        addAvatar: function(userSession) {
            var avatarView = new AvatarView({
                model: userSession
            });

            var avatarContainer;

            if (userSession.get('active')) {
                AJS.log(userSession.get('fullname') + ' joined. (' + userSession.get('origin') + ')');
                var $latestActive = this.$el.find("li.active").last();
                if ($latestActive.length) {
                    avatarContainer = avatarView.render().insertAfter($latestActive);
                } else {
                    avatarContainer = avatarView.render().prependTo(this.$el);
                }
            } else {
                avatarContainer = avatarView.render().appendTo(this.$el);
            }

            var animateAvatar = function (el) {
                el.addClass('show');
                el.children('.avatar').tooltip({
                    fade: true,
                    gravity: 'ne'
                });
            };

            // Avoid the animation when creating the overlay.
            if (this.collection.length === MAX_AVATARS + 1) {
                animateAvatar(avatarContainer);
            } else {
                _.defer(animateAvatar, avatarContainer);
            }

            this._manageOverlayClass();
        },

        removeAvatar: function(userSession) {
            if (userSession.get('active')) {
                AJS.log(userSession.get('fullname') + ' left. (' + userSession.get('origin') + ')');
            }
            this._manageOverlayClass();
        },

        _manageOverlayClass: function() {
            var size = this.collection.length;

            this.collection.each(function(model, index) {
                model.set('hidden', size > MAX_AVATARS && index >= MAX_AVATARS - 1);
            });

            if (size > MAX_AVATARS) {
                this.$el.addClass('has-overlay');
            } else {
                this.$el.removeClass('has-overlay');
            }
        }
    });
});