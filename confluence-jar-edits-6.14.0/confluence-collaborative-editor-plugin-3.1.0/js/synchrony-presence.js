define('confluence-collaborative-editor-plugin/synchrony-presence', [
    'backbone',
    'confluence-collaborative-editor-plugin/avatar-list-view',
    'confluence-collaborative-editor-plugin/overlay-view',
    'ajs',
    'confluence/legacy',
    'confluence/meta',
    'confluence/templates',
    'jquery',
    'underscore'
], function (Backbone,
             AvatarListView,
             OverlayView,
             AJS,
             Confluence,
             Meta,
             Templates,
             $,
             _) {
    'use strict';

    var userSessions = new Backbone.Collection();
    userSessions.add(_createAvatarModelFromSession({
        origin: 'current-user',
        fullname: Meta.get('current-user-fullname'),
        name: Meta.get('remote-user'),
        avatarURL: Meta.get('current-user-avatar-url'),
        active: true,
        currentUser: true
    }));

    var initialised = false;
    var currentUserOrigin = "";
    var tinymce;
    var contributors = [];
    var $presenceContainer = null;
    var overlayView;
    var heartbeatBound = false;

    if (AJS.Rte.getEditor() && AJS.Rte.getEditor().initialized) {
        _init();
    } else {
        AJS.bind('rte-collab-ready', _init);
    }

    function _init() {
        $presenceContainer = $(Templates.SynchronyPresence.container({
            docId: Confluence.getContentId()
        }));
        $('#rte-toolbar').append($presenceContainer);

        new AvatarListView({
            el: "#avatar-list",
            collection: userSessions
        });

        overlayView = new OverlayView({
            collection: userSessions
        });
        $('#rte-toolbar').append(overlayView.render());
    }

    // HACK! This only exists so tests can inject a mock tinymce. Apparently we can't mock inline requires with squire.
    // Note: tinymce needs to be required late to avoid issues with how it is loaded.
    function setTinyMce(newTinymce) {
        tinymce = newTinymce;
    }

    /**
     * Creates a new Avatar model given the parameters.
     * @param {string} session.origin
     * @param {string} session.fullname
     * @param {string} session.name
     * @param {string} session.avatarURL
     * @param {boolean} [session.active]
     * @param {boolean} [session.currentUser]
     * @returns {Object}
     * @private
     */
    function _createAvatarModelFromSession(session) {
        var avatarModel = $.extend({}, session);
        avatarModel.id = session.origin;
        avatarModel.fullname = session.fullname || AJS.I18n.getText("anonymous.name");
        avatarModel.name = session.name || "anonymous";
        avatarModel.username = session.name;
        avatarModel.avatarURL = AJS.contextPath() + session.avatarURL;
        avatarModel.active = session.active || true;
        avatarModel.currentUser = session.currentUser || currentUserOrigin === session.origin;

        return avatarModel;
    }

    function appendPresenceTo(currentUser, entity, lastKnownContributors) {
        // We always want to update this variable.
        currentUserOrigin = currentUser;

        if (!initialised) {
            tinymce = tinymce || require('tinymce');

            initialised = true; // Prevent further initialisation.

            // Add the last known contributors.
            contributors = lastKnownContributors;

            entity.on('presence', function (event) {
                overlayView.hideInlineDialog();
                event.joined.filter(
                    function (userSession) {
                        return userSession.origin !== currentUserOrigin;
                    }
                ).forEach(
                    function (userSession) {
                        var avatarModel = _createAvatarModelFromSession(userSession);
                        _removeAssociatedContributor(avatarModel);
                        userSessions.add(avatarModel, {at: _getActiveCount()});
                    }
                );

                event.left.forEach(function (userSession) {
                    userSession.id = userSession.origin;
                    userSessions.remove(userSession);
                    _renderContributors();
                });

                _renderContributors();

                if(!heartbeatBound) {
                    AJS.bind('editor-heartbeat', function (e, data) {
                        if (_.isArray(data.contributors)) {
                            contributors = data.contributors;
                            _renderContributors();
                        }
                    });
                    heartbeatBound = true;
                }

                AJS.trigger('analyticsEvent', {
                    name: 'confluence.synchrony.user.in.session',
                    data: {
                        numOtherUsers: userSessions.length,
                        draftId: Meta.get('draft-id'),
                        contentId: Meta.get('content-id')
                    }
                });
            });

            // Hide inline dialog on editor interaction.
            tinymce.EditorManager.activeEditor.onClick.add(_.bind(OverlayView.prototype.hideInlineDialog, overlayView));
        }

        return $presenceContainer;
    }

    function _getActiveCount() {
        return userSessions.filter(function (c) {
            return c.get('active');
        }).length;
    }

    function _removeAssociatedContributor(contributor) {
        var matching = userSessions.findWhere({active: false, id: contributor.name});
        if (matching) {
            userSessions.remove(matching);
        }
    }

    function _renderContributors() {
        var toRemove = [];

        // Remove historical contributors from dom if they don't appear in the contributors array.
        userSessions.each(function (contributorDOM) {
            if (!(contributorDOM.get('active') || _.some(contributors, function (contributorReal) {
                    return contributorDOM.get('id') === contributorReal.name
                }))) {
                toRemove.push(contributorDOM);
            }
        });

        // We can't remove these whilst iterating over the collection, so we remove them here.
        _.each(toRemove, function (user) {
            userSessions.remove(user);
        });

        // Insert historical contributors that aren't already in the DOM.
        _.each(contributors, function (contributorReal) {
            if (!(contributorReal.name === Meta.get('remote-user') || userSessions.any(
                    function (contributorDOM) {
                        return contributorDOM.get('id') === contributorReal.name || contributorDOM.get('name') === contributorReal.name
                    }
                ))
            ) {
                contributorReal.active = false;
                contributorReal.id = contributorReal.name;
                userSessions.add(contributorReal);
            }
        });
    }

    return {
        appendTo: appendPresenceTo,
        setTinyMce: setTinyMce
    };
});