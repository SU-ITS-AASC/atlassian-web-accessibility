define('confluence-dashboard/modules/onboarding/onboarding-tooltip-view', ['module', 'exports', 'marionette', 'configuration', 'jquery', '../../utils/feature-discovery', '../../utils/ensure-component', '../../utils/event-manager'], function (module, exports, _marionette, _configuration, _jquery, _featureDiscovery, _ensureComponent, _eventManager) {
    'use strict';

    var ItemView = _marionette.ItemView;
    var pluginKey = _configuration.pluginKey;

    var $ = _interopRequireDefault(_jquery).default;

    var FeatureDiscovery = _interopRequireDefault(_featureDiscovery).default;

    var ensureComponent = _interopRequireDefault(_ensureComponent).default;

    var EventManager = _eventManager.EventManager;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = ItemView.extend({

        className: 'onboarding-tooltip-wrapper',

        initialize: function initialize() {
            this.featureDiscovery = FeatureDiscovery.forPlugin(pluginKey);

            this.target = this.options.placedNextTo;
            this.tipId = this.options.tipId;

            this.addToScreen();
        },
        addToScreen: function addToScreen() {
            var _this = this;

            if (this.featureDiscovery.canShow(this.tipId)) {
                $(this.target).append(this.render().el);

                var inlineDialog = this.$('.onboarding-tooltips');

                // Skate components are initialized asynchronous so we need to check if they are ready before
                // binding callbacks for click event on buttons.
                // There were issues about no event callbacks for buttons in most of browsers except for Chrome.
                // And this issue happened with AUI^5.9 .
                ensureComponent(inlineDialog[0]).then(function () {
                    inlineDialog.find('.btn-next').on('click', _this.showNext.bind(_this));
                    inlineDialog.find('.btn-skip').on('click', _this.skipTooltips.bind(_this));
                });

                this.listenTo(EventManager, 'sidebar:collapse', this.close.bind(this));
                this.listenTo(EventManager, 'window:scroll', this.close.bind(this));

                this.inlineDialog = inlineDialog[0];
            } else {
                this.destroy();
            }
        },
        open: function open() {
            var _this2 = this;

            // Skate components are initialized asynchronous so we need to check if they are ready before
            ensureComponent(this.inlineDialog).then(function () {
                _this2.inlineDialog.open = true;
            });
        },
        close: function close() {
            var _this3 = this;

            ensureComponent(this.inlineDialog).then(function () {
                _this3.inlineDialog.open = false;
            });
        },
        showNext: function showNext() {
            this.featureDiscovery.markDiscovered(this.tipId);
            this.close();
            this.trigger('next', this);
            this.destroy();
        },
        skipTooltips: function skipTooltips() {
            this.trigger('skip', this);
        },
        onDestroy: function onDestroy() {
            var _this4 = this;

            // make sure we remove it from the DOM
            if (this.inlineDialog) {
                ensureComponent(this.inlineDialog).then(function () {
                    return _this4.inlineDialog.remove();
                });
            }
        }
    });
    module.exports = exports['default'];
});