define('confluence-dashboard/modules/starred/starred-collection', ['module', 'exports', 'backbone', 'configuration', 'confluence-dashboard/utils/date-utils', '../../core/shared/cql-base-collection', 'ajs', 'confluence/meta', 'jquery', 'underscore'], function (module, exports, _backbone, _configuration, _dateUtils, _cqlBaseCollection, _ajs, _meta, _jquery, _underscore) {
    'use strict';

    var Model = _backbone.Model;
    var endpoints = _configuration.endpoints;
    var apiLimit = _configuration.apiLimit;

    var DateUtils = _interopRequireDefault(_dateUtils).default;

    var CqlBaseCollection = _interopRequireDefault(_cqlBaseCollection).default;

    var AJS = _interopRequireDefault(_ajs).default;

    var Meta = _interopRequireDefault(_meta).default;

    var $ = _interopRequireDefault(_jquery).default;

    var _ = _interopRequireDefault(_underscore).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var context = AJS.contextPath();

    var StarredModel = Model.extend({
        url: endpoints.ADD_FAVOURITE,
        url_destroy: endpoints.REMOVE_FAVOURITE,

        defaults: {
            virtuallyDeleted: false
        },

        parse: function parse(response) {
            // the api expects entityId
            response.entityId = response.id;

            // attributes used for the UI/Templates
            response.url = context + response._links.webui;
            response.icon = response.type === 'page' ? 'page' : 'blogpost';

            var favouritedDate = response.metadata.currentuser.favourited.favouritedDate;
            response.favouritedDateISO = DateUtils.toISODate(new Date(favouritedDate));

            return response;
        },
        destroy: function destroy() {
            return Model.prototype.destroy.call(this, {
                dataType: 'json',
                data: $.param({
                    entityId: this.get('entityId'),
                    atl_token: Meta.get('atl-token')
                }),
                url: this.url_destroy,
                type: 'POST'
            });
        }
    });

    exports.default = CqlBaseCollection.extend({

        apiParams: {
            url: endpoints.STARRED,

            params: {
                limit: apiLimit
            },

            expansions: ['metadata.currentuser.favourited', 'metadata.currentuser.lastcontributed'],

            cql: 'favourite=currentUser()',

            cqlOrder: 'favourite desc',

            cqlcontext: '{"contentStatuses":["current","draft"]}'
        },

        model: StarredModel,

        groupMethod: function groupMethod(item) {
            return item.get('favouritedDateISO');
        },
        parse: function parse(data, options) {
            // for the case where lucene becomes out of sync with the favourite label,
            // remove items that don't have a favouriteDate
            data.results = _.reject(data.results, function (result) {
                return !result.metadata.currentuser.favourited;
            });
            return CqlBaseCollection.prototype.parse.apply(this, arguments);
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/modules/starred/starred-item-view', ['module', 'exports', 'underscore', '../list-item/list-item-view', '../../behaviors/undo-remove', '../../behaviors/list-item-animated', '../../behaviors/tooltips'], function (module, exports, _underscore, _listItemView, _undoRemove, _listItemAnimated, _tooltips) {
    'use strict';

    var _ = _interopRequireDefault(_underscore).default;

    var ListItemView = _interopRequireDefault(_listItemView).default;

    var UndoRemove = _interopRequireDefault(_undoRemove).default;

    var AnimatedList = _interopRequireDefault(_listItemAnimated).default;

    var Tooltip = _interopRequireDefault(_tooltips).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = ListItemView.extend({
        templateHelpers: _.extend({
            removable: true
        }, ListItemView.prototype.templateHelpers),

        ui: {
            'tooltips': '.top-tooltip'
        },

        behaviors: {
            undoRemove: {
                behaviorClass: UndoRemove,
                eventNamespace: 'favourites'
            },

            tooltip: {
                behaviorClass: Tooltip,
                selector: '.top-tooltip'
            },

            animated: {
                behaviorClass: AnimatedList
            }
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/modules/starred/starred-controller', ['module', 'exports', 'confluence-dashboard/core/content/content-as-grouped-list-view', 'confluence-dashboard/core/content/content-controller', './starred-collection', './starred-item-view', 'confluence-dashboard/soy-templates', 'configuration', 'ajs'], function (module, exports, _contentAsGroupedListView, _contentController, _starredCollection, _starredItemView, _soyTemplates, _configuration, _ajs) {
    'use strict';

    var ContentAsGroupedList = _interopRequireDefault(_contentAsGroupedListView).default;

    var ContentController = _interopRequireDefault(_contentController).default;

    var StarredCollection = _interopRequireDefault(_starredCollection).default;

    var StarredItemView = _interopRequireDefault(_starredItemView).default;

    var DashboardTemplates = _interopRequireDefault(_soyTemplates).default;

    var staticResourceUrl = _configuration.staticResourceUrl;

    var AJS = _interopRequireDefault(_ajs).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = ContentController.extend({
        actionsToFilter: ['starred'],

        // route: /starred
        starred: function starred() {
            this.view = new ContentAsGroupedList({
                collection: new StarredCollection(),
                templateHelpers: {
                    title: AJS.I18n.getText('starred.title'),
                    contentType: this.options.name
                },
                childViewOptions: {
                    childView: StarredItemView
                },
                emptyViewOptions: {
                    template: DashboardTemplates.Starred.blank
                },
                className: 'default-list-view starred-list'

            });

            this.view.collection.fetch();
        }
    });
    module.exports = exports['default'];
});
