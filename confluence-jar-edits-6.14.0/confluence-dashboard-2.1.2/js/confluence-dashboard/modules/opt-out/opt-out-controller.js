define('confluence-dashboard/modules/opt-out/opt-out-action-view', ['module', 'exports', '../../utils/event-manager', 'marionette', 'configuration', 'confluence-dashboard/soy-templates', '../../utils/dark-features', 'ajs', 'jquery', 'window', '../../utils/ensure-component', '../../utils/analytics'], function (module, exports, _eventManager, _marionette, _configuration, _soyTemplates, _darkFeatures, _ajs, _jquery, _window, _ensureComponent, _analytics) {
    'use strict';

    var EventManager = _eventManager.EventManager;
    var ItemView = _marionette.ItemView;
    var DARK_FEATURES = _configuration.DARK_FEATURES;

    var DashboardTemplates = _interopRequireDefault(_soyTemplates).default;

    var DarkFeatures = _interopRequireDefault(_darkFeatures).default;

    var AJS = _interopRequireDefault(_ajs).default;

    var $ = _interopRequireDefault(_jquery).default;

    var window = _interopRequireDefault(_window).default;

    var ensureComponent = _interopRequireDefault(_ensureComponent).default;

    var analytics = _interopRequireDefault(_analytics).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var USER_DISABLED_DASHBOARD_DARK_FEATURE = DARK_FEATURES.USER_DISABLED_DASHBOARD_DARK_FEATURE;


    var BTF_FLAVOUR = 'VANILLA';

    var ANALYTICS_PREFIX = 'opt-out';

    exports.default = ItemView.extend({
        template: DashboardTemplates.OptOut.sidebarButton,

        className: 'sidebar-opt-out',

        initialize: function initialize() {
            // inline dialog isn't available by default.
            window.require(['aui/inline-dialog2']);
        },
        shouldShow: function shouldShow() {
            return false;
        },
        addTo: function addTo(target) {
            var _this = this;

            $(target).append(this.render().el);

            var inlineDialog = this.$('.opt-out-dialog');

            // Skate components are initialized asynchronous so we need to check if they are ready before
            // binding callbacks for click event on buttons.
            // There were issues about no event callbacks for buttons in most of browsers except for Chrome.
            // And this issue happened with AUI^5.9.
            ensureComponent(inlineDialog[0]).then(function () {
                inlineDialog.find('.btn-send-feedback').on('click', _this.sendFeedback.bind(_this));
            });

            this.listenTo(EventManager, 'sidebar:collapse', this.closeInlineDialog.bind(this));
            this.listenTo(EventManager, 'window:scroll', this.closeInlineDialog.bind(this));

            this.inlineDialog = inlineDialog;
        },
        closeInlineDialog: function closeInlineDialog() {
            var _this2 = this;

            if (this.inlineDialog.length) {
                ensureComponent(this.inlineDialog[0]).then(function () {
                    _this2.inlineDialog.open = false;
                });
            }
        },
        sendFeedback: function sendFeedback(e) {
            var _this3 = this;

            // Don't submit the form
            e.preventDefault();

            //reverse dark feature
            DarkFeatures.remotely.user.enable(USER_DISABLED_DASHBOARD_DARK_FEATURE).then(function () {
                return _this3.onDisableDashboard();
            });
        },
        onDisableDashboard: function onDisableDashboard() {
            var message = this.inlineDialog.find('[name=feedback]').val();

            analytics.publish(ANALYTICS_PREFIX + '.confirm', {
                message: message
            });

            window.location = AJS.contextPath();
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/modules/opt-out/opt-out-controller', ['./opt-out-action-view', '../../utils/module-starter', '../../utils/conditions', 'ajs'], function (_optOutActionView, _moduleStarter, _conditions, _ajs) {
    'use strict';

    var OptOutView = _interopRequireDefault(_optOutActionView).default;

    var ModuleStarter = _interopRequireDefault(_moduleStarter).default;

    var conditions = _interopRequireDefault(_conditions).default;

    var AJS = _interopRequireDefault(_ajs).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var initOptOut = function initOptOut() {
        var optOutView = new OptOutView({});

        if (optOutView.shouldShow()) {
            optOutView.addTo('.aui-sidebar-footer');
        }
    };

    AJS.toInit(function () {
        if (conditions.canShowDashboard()) {
            ModuleStarter.register(initOptOut);
        }
    });
});

require(["confluence-dashboard/modules/opt-out/opt-out-controller"]);
