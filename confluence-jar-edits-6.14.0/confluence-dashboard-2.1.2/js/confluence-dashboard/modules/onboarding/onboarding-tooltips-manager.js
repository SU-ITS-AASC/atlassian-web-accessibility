define('confluence-dashboard/modules/onboarding/onboarding-tooltips-manager', ['module', 'exports', 'marionette', 'confluence-dashboard/soy-templates', './onboarding-tooltip-view', 'underscore', 'configuration', '../../utils/feature-discovery', '../../utils/event-manager', 'window'], function (module, exports, _marionette, _soyTemplates, _onboardingTooltipView, _underscore, _configuration, _featureDiscovery, _eventManager, _window) {
    'use strict';

    var Object = _marionette.Object;

    var DashboardTemplates = _interopRequireDefault(_soyTemplates).default;

    var Tooltip = _interopRequireDefault(_onboardingTooltipView).default;

    var _ = _interopRequireDefault(_underscore).default;

    var pluginKey = _configuration.pluginKey;

    var FeatureDiscovery = _interopRequireDefault(_featureDiscovery).default;

    var ReqRes = _eventManager.ReqRes;

    var window = _interopRequireDefault(_window).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = Object.extend({
        initialize: function initialize() {
            // we still need to load inline-dialog2 manually
            window.require(['aui/inline-dialog2']);
            var app = ReqRes.request("app");
            app.expandSidebar();
            this.featureDiscovery = FeatureDiscovery.forPlugin(pluginKey);
        },
        getTooltipDefinitions: function getTooltipDefinitions(data) {
            return [{
                element: '.sidebar-discover',
                tipId: 'tour-step-sidebar',
                template: DashboardTemplates.Onboarding[data.isNew ? 'newUserStep1' : 'existingUserStep1']
            }, {
                element: '.sidebar-spaces',
                tipId: 'tour-step-favourite-spaces',
                template: DashboardTemplates.Onboarding[data.isNew ? 'newUserStep2' : 'existingUserStep2']
            }];
        },
        showTips: function showTips(data) {
            var tourInlineDialogs = this.getTooltipDefinitions(data);

            this.createSteps(tourInlineDialogs);
        },
        createSteps: function createSteps(steps) {
            var _this = this;

            if (!steps) {
                return false;
            }
            // if 'tips' is marked as discovered, we don't show it
            if (!this.featureDiscovery.canShow('tips')) {
                return false;
            }

            this.steps = [];

            _.each(steps, function (step) {
                // each specific tip can be marked as discovered. If it's true, we don't show it again
                if (_this.featureDiscovery.canShow(step.tipId)) {
                    // we add it to a list so we can perform batch operations later
                    _this.steps.push(_this.createTooltip(step));
                }
            });

            // the first one should be open
            this.openFirst();
        },
        createTooltip: function createTooltip(step) {
            var tooltip = new Tooltip({
                tipId: step.tipId,
                placedNextTo: step.element,
                template: step.template,
                templateHelpers: {
                    id: step.tipId
                }
            });

            this.listenTo(tooltip, 'skip', this.onSkip);
            this.listenTo(tooltip, 'next', this.onNext);

            return tooltip;
        },
        openFirst: function openFirst() {
            if (this.steps.length > 0) {
                this.steps[0].open();
            }
        },
        onSkip: function onSkip() {
            this.featureDiscovery.markDiscovered('tips');
            _.invoke(this.steps, 'destroy');
            this.destroy();
        },
        onNext: function onNext(target) {
            var index = this.steps.indexOf(target);
            this.steps.splice(index, 1);
            this.openFirst();
        }
    });
    module.exports = exports['default'];
});