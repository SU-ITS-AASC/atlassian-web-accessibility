define('confluence-dashboard/modules/buttons-web-items/buttons-web-items-view', ['module', 'exports', 'backbone', 'jquery', 'ajs', 'aui/templates'], function (module, exports, _backbone, _jquery, _ajs, _templates) {
    'use strict';

    var View = _backbone.View;

    var $ = _interopRequireDefault(_jquery).default;

    var AJS = _interopRequireDefault(_ajs).default;

    var aui = _interopRequireDefault(_templates).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = View.extend({
        el: '.aui-buttons',

        initialize: function initialize(options) {
            var _this = this;

            this.$buttonGroup = options.target;
            this.buttons = this.getButtons(options.hideLastElementsFirst ? options.hideLastElementsFirst : false);

            this.totalButtonWidth = 0;
            this.buttons.forEach(function (b) {
                return _this.totalButtonWidth += b.outerWidth;
            });

            this.moreMenuWidth = 0;
            this.lastButtonVisibleIndex = this.buttons.length - 1;

            this.handleResize();

            $(window).on('resize.aui-responsive-header', AJS.debounce(function () {
                _this.handleResize();
            }, 100));
        },
        getAvailableWidth: function getAvailableWidth() {
            return this.$buttonGroup.parent().width();
        },
        getButtons: function getButtons(isReverseOrder) {
            var buttons = [];
            this.$buttonGroup.find('.aui-button').each(function (i, button) {
                var $button = $(button);

                var cachedElement = {
                    $element: $button,
                    outerWidth: $button.outerWidth(true)
                };

                if (!isReverseOrder) {
                    buttons.push(cachedElement);
                } else {
                    buttons.unshift(cachedElement);
                }
            });
            return buttons;
        },
        showResponsiveDropdown: function showResponsiveDropdown() {
            if (this.$moreMenu === undefined) {
                this.$moreMenu = this.createResponsiveDropdownTrigger();
            } else {
                this.$moreMenu.appendTo(this.$buttonGroup);
            }
        },
        createResponsiveDropdownTrigger: function createResponsiveDropdownTrigger() {
            //create the trigger
            var id = this.$buttonGroup[0].id;
            var $responsiveTrigger = $(aui.dropdown2.trigger({
                menu: { id: 'aui-responsive-button-group-dropdown-content-' + id },
                content: '<span class="aui-icon aui-icon-small aui-iconfont-more"></span>',
                extraAttributes: {
                    href: '#'
                },
                extraClasses: 'aui-button aui-dropdown2-trigger-arrowless',
                id: 'aui-responsive-button-group-dropdown-trigger-' + id
            }));

            //create the dropdown content container
            $responsiveTrigger.append(aui.dropdown2.contents({
                id: 'aui-responsive-button-group-dropdown-content-' + id,
                extraClasses: 'aui-style-default',
                content: aui.dropdown2.section({ content: '<ul id="aui-responsive-button-group-dropdown-list-' + id + '"></ul>' })
            }));

            $responsiveTrigger.appendTo(this.$buttonGroup);

            this.moreMenuWidth = $responsiveTrigger.outerWidth(true);
            return $responsiveTrigger;
        },
        handleResize: function handleResize() {
            if (!this.buttons.length) {
                return;
            }

            var availableWidth = this.getAvailableWidth();

            if (availableWidth > this.totalButtonWidth) {
                this.showAllButtons();
            } else {
                this.showResponsiveDropdown();
                var remainingWidth = availableWidth - this.moreMenuWidth;

                // Figure out how many nav menu items fit into the available space.
                var newLastButtonVisibleIndex = -1;
                while (remainingWidth - this.buttons[newLastButtonVisibleIndex + 1].outerWidth >= 0) {
                    remainingWidth -= this.buttons[newLastButtonVisibleIndex + 1].outerWidth;
                    newLastButtonVisibleIndex++;
                }

                if (newLastButtonVisibleIndex < this.lastButtonVisibleIndex) {
                    this.moveToResponsiveDropdown(this.lastButtonVisibleIndex - newLastButtonVisibleIndex);
                } else if (newLastButtonVisibleIndex > this.lastButtonVisibleIndex) {
                    this.moveOutOfResponsiveDropdown(newLastButtonVisibleIndex - this.lastButtonVisibleIndex);
                }
            }
        },
        moveOutOfResponsiveDropdown: function moveOutOfResponsiveDropdown(numItems) {
            if (numItems <= 0) {
                return;
            }

            var id = this.$buttonGroup[0].id;

            var $moreDropdownTrigger = this.$moreMenu.children('.aui-dropdown2-trigger');
            if ($moreDropdownTrigger.hasClass('active')) {
                $moreDropdownTrigger.trigger('aui-button-invoke');
            }

            // Move items (working top-to-bottom) from the more menu into the nav bar.
            var firstIndexToMove = this.lastButtonVisibleIndex + 1;
            var lastIndexToMove = this.lastButtonVisibleIndex + numItems;
            for (var i = firstIndexToMove; i <= lastIndexToMove; i++) {
                var $navItem = this.buttons[i].$element;
                $navItem.addClass('aui-button');
                $navItem.appendTo(this.$buttonGroup);
            }

            this.lastButtonVisibleIndex += numItems;
        },
        moveToResponsiveDropdown: function moveToResponsiveDropdown(numItems) {
            if (numItems <= 0) {
                return;
            }

            var id = this.$buttonGroup[0].id;

            var moreDropdownSectionEl = document.querySelector('#aui-responsive-button-group-dropdown-list-' + id);

            // Move items (working right-to-left) from the nav bar to the more menu.
            var firstIndexToMove = this.lastButtonVisibleIndex;
            var lastIndexToMove = this.lastButtonVisibleIndex - numItems + 1;
            for (var i = firstIndexToMove; i >= lastIndexToMove; i--) {
                var $navItem = this.buttons[i].$element;
                $navItem.removeClass('aui-button');
                moreDropdownSectionEl.insertBefore($navItem[0], moreDropdownSectionEl.firstChild);
            }

            this.lastButtonVisibleIndex -= numItems;
        },
        hideResponsiveDropdown: function hideResponsiveDropdown() {
            if (this.$moreMenu !== undefined) {
                this.$moreMenu.detach();
            }
        },
        showAllButtons: function showAllButtons() {
            this.hideResponsiveDropdown();
            this.moveOutOfResponsiveDropdown(this.buttons.length - 1 - this.lastButtonVisibleIndex);
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/modules/buttons-web-items/buttons-web-items-controller', ['./buttons-web-items-view', 'jquery', '../../utils/module-starter'], function (_buttonsWebItemsView, _jquery, _moduleStarter) {
    'use strict';

    var ButtonsWebItemsView = _interopRequireDefault(_buttonsWebItemsView).default;

    var $ = _interopRequireDefault(_jquery).default;

    var ModuleStarter = _interopRequireDefault(_moduleStarter).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var initButtons = function initButtons() {
        new ButtonsWebItemsView({
            target: $('.dashboard-buttons .aui-buttons')
        });
    };

    ModuleStarter.register(initButtons);
});

require(["confluence-dashboard/modules/buttons-web-items/buttons-web-items-controller"]);
