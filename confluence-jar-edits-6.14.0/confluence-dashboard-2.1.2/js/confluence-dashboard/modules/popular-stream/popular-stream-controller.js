define('confluence-dashboard/modules/popular-stream/popular-stream-collection', ['module', 'exports', '../../core/shared/cql-base-collection', 'backbone', 'configuration'], function (module, exports, _cqlBaseCollection, _backbone, _configuration) {
    'use strict';

    var CqlBaseCollection = _interopRequireDefault(_cqlBaseCollection).default;

    var Collection = _backbone.Collection;
    var endpoints = _configuration.endpoints;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = CqlBaseCollection.extend({
        url: endpoints.POPULAR_STREAM,

        parse: function parse(data, options) {
            this.parseNext(data, options);
            return data.streamItems;
        },


        // Used inside the parse method to detect if there is a next page. This follows the Atlassian REST response format and should be overwritten on your collection if you expect a different format of data.
        parseNext: function parseNext(data, options) {
            if (data.nextPageOffset) {
                this.hasNext = true;
                this.nextUrl = endpoints.POPULAR_STREAM + '&nextPageOffset=' + data.nextPageOffset;
            } else {
                this.hasNext = false;
                this.nextUrl = null;
            }
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/modules/popular-stream/popular-stream-view', ['module', 'exports', 'marionette', 'confluence-dashboard/soy-templates', 'confluence/hover-user'], function (module, exports, _marionette, _soyTemplates, _hoverUser) {
    'use strict';

    var ItemView = _marionette.ItemView;

    var DashboardTemplates = _interopRequireDefault(_soyTemplates).default;

    var userHoverSetup = _interopRequireDefault(_hoverUser).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = ItemView.extend({
        template: DashboardTemplates.PopularStream.compactStreamItem,
        tagName: 'li',
        className: function className() {
            return 'stream-item stream-item-layout ' + this.model.get('contentCssClass');
        },


        onDomRefresh: function onDomRefresh() {
            userHoverSetup();
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/modules/popular-stream/popular-stream-controller', ['module', 'exports', './popular-stream-collection', './popular-stream-view', 'confluence-dashboard/core/content/content-as-stream-view', 'confluence-dashboard/core/content/content-controller', 'confluence-dashboard/soy-templates', 'ajs'], function (module, exports, _popularStreamCollection, _popularStreamView, _contentAsStreamView, _contentController, _soyTemplates, _ajs) {
    'use strict';

    var PopularStreamCollection = _interopRequireDefault(_popularStreamCollection).default;

    var PopularStreamItemView = _interopRequireDefault(_popularStreamView).default;

    var ContentAsStream = _interopRequireDefault(_contentAsStreamView).default;

    var ContentController = _interopRequireDefault(_contentController).default;

    var DashboardTemplates = _interopRequireDefault(_soyTemplates).default;

    var AJS = _interopRequireDefault(_ajs).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = ContentController.extend({
        actionsToFilter: ['popularStream'],

        popularStream: function popularStream() {
            this.view = new ContentAsStream({
                collection: new PopularStreamCollection(),
                templateHelpers: {
                    title: AJS.I18n.getText('popular.stream.title'),
                    contentType: this.options.name
                },
                childView: PopularStreamItemView,
                emptyViewOptions: {
                    template: DashboardTemplates.PopularStream.blank
                }

            });

            this.view.collection.fetch();
        }
    });
    module.exports = exports['default'];
});
