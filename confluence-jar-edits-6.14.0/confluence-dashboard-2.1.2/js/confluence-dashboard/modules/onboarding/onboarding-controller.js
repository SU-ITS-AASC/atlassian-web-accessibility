define('confluence-dashboard/modules/onboarding/onboarding-view', ['module', 'exports', '../../core/shared/base-dialog', 'confluence-dashboard/soy-templates', 'configuration', '../../utils/feature-discovery', 'underscore'], function (module, exports, _baseDialog, _soyTemplates, _configuration, _featureDiscovery, _underscore) {
    'use strict';

    var BaseDialog = _interopRequireDefault(_baseDialog).default;

    var DashboardTemplates = _interopRequireDefault(_soyTemplates).default;

    var pluginKey = _configuration.pluginKey;
    var staticResourceUrl = _configuration.staticResourceUrl;

    var FeatureDiscovery = _interopRequireDefault(_featureDiscovery).default;

    var _ = _interopRequireDefault(_underscore).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = BaseDialog.extend({

        className: 'aui-layer aui-dialog2 aui-dialog2-medium confluence-dialog-no-chrome confluence-dialog-centered simple-onboarding',

        attributes: {
            id: 'dashboard-onboarding-dialog',
            'aria-hidden': true
        },

        ui: {
            btnShow: '.show-onboarding',
            btnSkip: '.skip-onboarding'
        },

        events: {
            'click @ui.btnShow': 'showOnboarding',
            'click @ui.btnSkip': 'skipOnboarding'
        },

        initialize: function initialize() {
            this.featureDiscovery = FeatureDiscovery.forPlugin(pluginKey);

            if (this.featureDiscovery.canShow('dialog')) {
                this.openDialog();
            } else {
                this.remove();
            }
        },
        onDestroy: function onDestroy() {
            this.markAsSkipOnBoarding();
            this.featureDiscovery = null;
        },
        serializeData: function serializeData() {
            return {
                fullUsername: this.options.currentUserFullName
            };
        },
        getTemplate: function getTemplate() {
            return DashboardTemplates.Onboarding.newSimplifyOnboarding;
        },
        showOnboarding: function showOnboarding() {
            this.featureDiscovery.markDiscoveredSafe('dialog');
            this.closeDialog();

            if (this.options.onConfirm && _.isFunction(this.options.onConfirm)) {
                this.options.onConfirm();
            }
        },
        markAsSkipOnBoarding: function markAsSkipOnBoarding() {
            if (this.featureDiscovery) {
                this.featureDiscovery.markDiscoveredSafe('dialog');
                this.featureDiscovery.markDiscoveredSafe('tips');
            }
        },
        skipOnboarding: function skipOnboarding() {
            this.markAsSkipOnBoarding();
            this.closeDialog();
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/modules/onboarding/onboarding-controller', ['../../utils/event-manager', './onboarding-view', '../../utils/module-starter', 'confluence/meta', '../../utils/conditions', 'ajs', 'configuration', '../../utils/feature-discovery'], function (_eventManager, _onboardingView, _moduleStarter, _meta, _conditions, _ajs, _configuration, _featureDiscovery) {
    'use strict';

    var Commands = _eventManager.Commands;

    var OnboardingView = _interopRequireDefault(_onboardingView).default;

    var ModuleStarter = _interopRequireDefault(_moduleStarter).default;

    var Meta = _interopRequireDefault(_meta).default;

    var conditions = _interopRequireDefault(_conditions).default;

    var AJS = _interopRequireDefault(_ajs).default;

    var pluginKey = _configuration.pluginKey;

    var FeatureDiscovery = _interopRequireDefault(_featureDiscovery).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var initOnboarding = function initOnboarding() {
        var isAdmin = Meta.getBoolean('is-confluence-admin');
        var isNewUser = Meta.getBoolean('is-new-user');
        var shouldShowDialog = Meta.getBoolean('show-dashboard-onboarding-dialog');
        var shouldShowTips = Meta.getBoolean('show-dashboard-onboarding-tips');
        var currentUserFullName = Meta.get('current-user-fullname');

        var SAVED_FOR_LATER_TIP_ID = 'transition-saved-for-later';

        var user = {
            isNew: isNewUser
        };

        if (shouldShowDialog && !isAdmin) {
            var dialog = new OnboardingView({
                currentUserFullName: currentUserFullName,
                isNewUser: isNewUser,
                isAdmin: isAdmin,

                onConfirm: function onConfirm() {
                    showTips(user);
                }
            });

            Commands.execute('main-app:showDialog', dialog);
        }

        // new users should never see the saved for later tooltip
        if (isNewUser) {
            var featureDiscovery = FeatureDiscovery.forPlugin(pluginKey);
            featureDiscovery.markDiscovered(SAVED_FOR_LATER_TIP_ID);
        }
    };

    AJS.toInit(function () {
        if (conditions.canShowDashboard()) {
            ModuleStarter.register(initOnboarding);
        }
    });
});

require(["confluence-dashboard/modules/onboarding/onboarding-controller"]);
