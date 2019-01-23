define('confluence-dashboard/modules/recommended-stream/recommended-stream-collection', ['module', 'exports', 'underscore', '../../core/shared/cql-base-collection', 'backbone', 'configuration'], function (module, exports, _underscore, _cqlBaseCollection, _backbone, _configuration) {
    'use strict';

    var _ = _interopRequireDefault(_underscore).default;

    var CqlBaseCollection = _interopRequireDefault(_cqlBaseCollection).default;

    var Collection = _backbone.Collection;
    var Model = _backbone.Model;
    var endpoints = _configuration.endpoints;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var RecommendedItemModel = Model.extend({
        destroy: function destroy() {
            return Model.prototype.destroy.call(this, {
                dataType: 'json',
                url: endpoints.RECOMMENDED_STREAM + '/' + this.get('id'),
                type: 'DELETE'
            });
        }
    });

    exports.default = CqlBaseCollection.extend({
        url: endpoints.RECOMMENDED_STREAM,
        model: RecommendedItemModel,

        parse: function parse(data, options) {
            this.parseNext(data, options);

            // inject data.model for each item
            var items = _.map(data.streamItems, function (item) {
                item.model = data.model;
                return item;
            });

            return items;
        },


        // Used inside the parse method to detect if there is a next page. This follows the Atlassian REST response format and should be overwritten on your collection if you expect a different format of data.
        parseNext: function parseNext(data, options) {
            if (data.nextPageOffset) {
                this.hasNext = true;
                this.nextUrl = endpoints.RECOMMENDED_STREAM + '?nextPageOffset=' + data.nextPageOffset;
            } else {
                this.hasNext = false;
                this.nextUrl = null;
            }
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/modules/recommended-stream/recommended-stream-view', ['module', 'exports', 'marionette', 'confluence-dashboard/soy-templates', 'confluence/hover-user', '../../utils/analytics', 'configuration'], function (module, exports, _marionette, _soyTemplates, _hoverUser, _analytics, _configuration) {
    'use strict';

    var ItemView = _marionette.ItemView;

    var DashboardTemplates = _interopRequireDefault(_soyTemplates).default;

    var userHoverSetup = _interopRequireDefault(_hoverUser).default;

    var analytics = _interopRequireDefault(_analytics).default;

    var endpoints = _configuration.endpoints;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = ItemView.extend({
        template: DashboardTemplates.RecommendedStream.compactStreamItem,
        tagName: 'li',

        events: {
            'click a.stream-item-heading-link': 'onItemClick',
            'mousedown a.stream-item-heading-link': 'onItemClick',
            'click a.delete-button': 'onItemDelete'
        },

        className: function className() {
            return 'stream-item stream-item-layout ' + this.model.get('contentCssClass');
        },


        onDomRefresh: function onDomRefresh() {
            userHoverSetup();
        },

        onItemClick: function onItemClick(event) {
            analytics.publish('recommended.item.clicked', {
                model: this.model.get('model') || '',
                id: this.model.get('id')
            });
        },
        onItemDelete: function onItemDelete(event) {
            this.model.destroy();
            analytics.publish('recommended.item.deleted', {
                model: this.model.get('model') || '',
                id: this.model.get('id')
            });
            event.preventDefault();
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/modules/recommended-stream/recommended-stream-controller', ['module', 'exports', './recommended-stream-collection', './recommended-stream-view', 'confluence-dashboard/core/content/content-as-stream-view', 'confluence-dashboard/core/content/content-controller', 'confluence-dashboard/soy-templates'], function (module, exports, _recommendedStreamCollection, _recommendedStreamView, _contentAsStreamView, _contentController, _soyTemplates) {
    'use strict';

    var RecommendedStreamCollection = _interopRequireDefault(_recommendedStreamCollection).default;

    var RecommendedStreamItemView = _interopRequireDefault(_recommendedStreamView).default;

    var ContentAsStream = _interopRequireDefault(_contentAsStreamView).default;

    var ContentController = _interopRequireDefault(_contentController).default;

    var DashboardTemplates = _interopRequireDefault(_soyTemplates).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = ContentController.extend({
        actionsToFilter: ['recommendedStream'],

        recommendedStream: function recommendedStream() {
            this.view = new ContentAsStream({
                collection: new RecommendedStreamCollection(),
                templateHelpers: {
                    title: "Recommended for you",
                    contentType: this.options.name
                },
                childView: RecommendedStreamItemView,
                emptyViewOptions: {
                    template: DashboardTemplates.RecommendedStream.blank
                }

            });

            this.view.collection.fetch();
        }
    });
    module.exports = exports['default'];
});
