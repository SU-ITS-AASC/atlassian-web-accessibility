define('confluence-collaborative-editor-plugin/overlay-view', [
    'backbone',
    'aui/inline-dialog2',
    'confluence-collaborative-editor-plugin/avatar-view',
    'confluence/templates',
    'ajs',
    'jquery',
    'underscore'
], function(
    Backbone,
    InlineDialog2,
    AvatarView,
    Templates,
    AJS,
    $,
    _
) {
    return Backbone.View.extend({
        initialize: function() {
            this.collection.on("add remove", this.reconcile, this);
            this.inlineDialog2 = document.querySelector('#more-avatars');
        },

        render: function() {
            this.$el = $(Templates.SynchronyPresence.overlay());
            this.$el.children('a').tooltip({
                fade: true,
                gravity: 'ne'
            });
            this.$el.on('click', function() {
                $('.tipsy').remove();
            });
            return this.$el;
        },

        reconcile: function() {
            var overflow = this.collection.where({
                hidden: true
            });

            if (overflow.length > 0) {
                this.$el.addClass('show');
                this.$el.children('.aui-button').html('+' + overflow.length).attr('title', overflow.length + ' ' + AJS.I18n.getText('collab.presence.overlay.tooltip'));

                // Remove all existing avatars from the overflow menu.
                $("#more-avatars-list").children().remove();

                overflow.forEach(function(model) {
                    var avatarView = new AvatarView({
                        model: model
                    });
                    $("#more-avatars-list").append(avatarView.render());
                });
            } else {
                this.$el.removeClass('show');
                this.hideInlineDialog();
            }
        },

        hideInlineDialog: function() {
            // Clean up any existing, skated dialogs.
            if (this.inlineDialog2 && this.inlineDialog2.isVisible && this.inlineDialog2.isVisible()) {
                this.inlineDialog2.open = false;
            }
        }
    });
});