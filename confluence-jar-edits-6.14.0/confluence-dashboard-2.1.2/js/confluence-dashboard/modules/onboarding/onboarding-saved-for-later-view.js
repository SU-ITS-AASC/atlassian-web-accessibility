define('confluence-dashboard/modules/onboarding/onboarding-saved-for-later-view', ['module', 'exports', './onboarding-tooltip-view'], function (module, exports, _onboardingTooltipView) {
    'use strict';

    var TooltipView = _interopRequireDefault(_onboardingTooltipView).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = TooltipView.extend({
        showNext: function showNext() {},
        skipTooltips: function skipTooltips() {
            this.featureDiscovery.markDiscovered(this.tipId);
            this.close();
            this.destroy();
        }
    });
    module.exports = exports['default'];
});