define('confluence-dashboard/modules/recently-viewed/recently-viewed-collection', ['module', 'exports', 'backbone', 'configuration', 'confluence-dashboard/utils/date-utils', '../../core/shared/base-collection-with-function', 'underscore', 'ajs'], function (module, exports, _backbone, _configuration, _dateUtils, _baseCollectionWithFunction, _underscore, _ajs) {
    'use strict';

    var Model = _backbone.Model;
    var endpoints = _configuration.endpoints;

    var DateUtils = _interopRequireDefault(_dateUtils).default;

    var BaseCollectionWithFunction = _interopRequireDefault(_baseCollectionWithFunction).default;

    var _ = _interopRequireDefault(_underscore).default;

    var AJS = _interopRequireDefault(_ajs).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var context = AJS.contextPath();

    var RecentViewedModel = Model.extend({
        parse: function parse(response, options) {
            var date = response.metadata.currentuser.viewed.lastSeen;
            var dateObj = new Date(date);
            var timestamp = dateObj.getTime();

            _.extend(response, {
                'url': context + response._links.webui,
                'date': date,
                timestamp: timestamp,
                lastSeenISO: DateUtils.toISODate(dateObj),
                'icon': response.type === 'page' ? 'page' : 'blogpost'
            });

            return response;
        }
    });

    exports.default = BaseCollectionWithFunction.extend({

        model: RecentViewedModel,

        comparator: function comparator(modelA, modelB) {
            return -DateUtils.compareTimestamps(modelA.get("timestamp"), modelB.get("timestamp"));
        },
        apiParams: function apiParams(options) {
            return {
                url: endpoints.RECENTLY_VIEWED,

                expansions: ['container', 'metadata.currentuser.viewed', 'metadata.currentuser.lastcontributed'],

                cql: 'id in recentlyViewedContent(' + this.getPageLimit(options) + ', ' + this.getPageOffset(options) + ')',

                cqlcontext: '{"contentStatuses":["current","draft"]}'
            };
        },
        groupMethod: function groupMethod(item) {
            return item.get('lastSeenISO');
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/modules/recently-viewed/recently-viewed-controller', ['module', 'exports', './recently-viewed-collection', 'confluence-dashboard/core/content/content-as-grouped-list-view', 'confluence-dashboard/core/content/content-controller', 'confluence-dashboard/soy-templates', 'configuration', 'ajs'], function (module, exports, _recentlyViewedCollection, _contentAsGroupedListView, _contentController, _soyTemplates, _configuration, _ajs) {
    'use strict';

    var RecentViewedCollection = _interopRequireDefault(_recentlyViewedCollection).default;

    var ContentAsGroupedList = _interopRequireDefault(_contentAsGroupedListView).default;

    var ContentController = _interopRequireDefault(_contentController).default;

    var DashboardTemplates = _interopRequireDefault(_soyTemplates).default;

    var staticResourceUrl = _configuration.staticResourceUrl;

    var AJS = _interopRequireDefault(_ajs).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = ContentController.extend({
        actionsToFilter: ['recentViewed'],

        recentViewed: function recentViewed() {
            this.view = new ContentAsGroupedList({
                collection: new RecentViewedCollection(),
                templateHelpers: {
                    title: AJS.I18n.getText('recently.viewed.title'),
                    contentType: this.options.name
                },
                emptyViewOptions: {
                    template: DashboardTemplates.RecentViewed.blank
                },
                className: 'default-list-view starred-list'
            });

            this.view.collection.fetch();
        }
    });
    module.exports = exports['default'];
});
