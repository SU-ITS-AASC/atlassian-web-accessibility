define('confluence-dashboard/utils/footer-analytics', ['jquery', 'ajs', 'confluence/meta'], function (_jquery, _ajs, _meta) {
    'use strict';

    var $ = _interopRequireDefault(_jquery).default;

    var AJS = _interopRequireDefault(_ajs).default;

    var Meta = _interopRequireDefault(_meta).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    AJS.toInit(function () {
        var eventName = 'confluence.footer.item.click';
        var pageId = Meta.get('page-id');
        var isDashboard = $('body').hasClass('dashboard');

        $('#footer').on('click', 'a', function () {
            AJS.trigger('analytics', { name: eventName, data: {
                    pageId: pageId,
                    isDashboard: isDashboard
                } });
        });
    });
});

require(["confluence-dashboard/utils/footer-analytics"]);
