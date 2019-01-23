define('confluence-dashboard/modules/recently-worked/recently-worked-collection', ['module', 'exports', 'backbone', 'configuration', 'confluence-dashboard/utils/date-utils', '../../core/shared/base-collection-with-function', 'underscore', 'ajs'], function (module, exports, _backbone, _configuration, _dateUtils, _baseCollectionWithFunction, _underscore, _ajs) {
    'use strict';

    var Model = _backbone.Model;
    var apiLimit = _configuration.apiLimit;
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

    var RecentWorkedModel = Model.extend({
        parse: function parse(response, options) {
            /** @type 'friendly-date' */
            var lastContributedTime = response.metadata.currentuser.lastcontributed && response.metadata.currentuser.lastcontributed.when || null;
            /** @type 'friendly-date' */
            var lastModifiedTime = response.metadata.currentuser.lastmodified && response.metadata.currentuser.lastmodified.version && response.metadata.currentuser.lastmodified.version.when || null;
            var lastContributedDate = new Date(lastContributedTime || 0);
            var lastModifiedDate = new Date(lastModifiedTime || 0);

            var date = lastContributedDate > lastModifiedDate ? lastContributedDate : lastModifiedDate;
            var time = lastContributedDate > lastModifiedDate ? lastContributedTime : lastModifiedTime;

            var timestamp = date.getTime();

            _.extend(response, {
                'url': response.status === "draft" ? context + response._links.edit : context + response._links.webui,
                'date': time,
                timestamp: timestamp,
                lastContributedISO: DateUtils.toISODate(date),
                'friendlyDate': 'Updated ' + time,
                'updated': time,
                'icon': response.type === 'page' ? 'page' : 'blogpost'
            });

            return response;
        }
    });

    exports.default = BaseCollectionWithFunction.extend({

        model: RecentWorkedModel,

        comparator: function comparator(modelA, modelB) {
            return -DateUtils.compareTimestamps(modelA.get("timestamp"), modelB.get("timestamp"));
        },
        apiParams: function apiParams(options) {
            var query = {
                url: endpoints.RECENTLY_WORKED,

                expansions: ['container', 'metadata.currentuser.lastcontributed', 'metadata.currentuser.lastmodified'],
                //in does not guarantee order so the sort comes back a little weird and needs to be sorted client side
                cql: 'type in (page,blogpost) and id in recentlyModifiedPagesAndBlogPostsByUser(currentUser(), ' + this.getPageOffset(options) + ', ' + this.getPageLimit(options) + ')'
            };

            query.cqlcontext = '{"contentStatuses":["current","draft"]}';
            return query;
        },
        groupMethod: function groupMethod(item) {
            return item.get('lastContributedISO');
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/modules/recently-worked/recently-worked-controller', ['module', 'exports', './recently-worked-collection', '../../core/content/content-as-grouped-list-discovery-view', 'confluence-dashboard/core/content/content-controller', 'confluence-dashboard/soy-templates', 'ajs'], function (module, exports, _recentlyWorkedCollection, _contentAsGroupedListDiscoveryView, _contentController, _soyTemplates, _ajs) {
    'use strict';

    var RecentWorkedCollection = _interopRequireDefault(_recentlyWorkedCollection).default;

    var ContentAsGroupedListDiscovery = _interopRequireDefault(_contentAsGroupedListDiscoveryView).default;

    var ContentController = _interopRequireDefault(_contentController).default;

    var DashboardTemplates = _interopRequireDefault(_soyTemplates).default;

    var AJS = _interopRequireDefault(_ajs).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = ContentController.extend({
        actionsToFilter: ['recentWorked'],

        recentWorked: function recentWorked() {
            this.view = new ContentAsGroupedListDiscovery({
                collection: new RecentWorkedCollection(),
                templateHelpers: {
                    title: AJS.I18n.getText('recently.worked.title'),
                    contentType: this.options.name
                },
                emptyViewOptions: {
                    template: DashboardTemplates.RecentWorked.blank
                },
                className: 'default-list-view starred-list'
            });

            this.view.collection.fetch();
        }
    });
    module.exports = exports['default'];
});
