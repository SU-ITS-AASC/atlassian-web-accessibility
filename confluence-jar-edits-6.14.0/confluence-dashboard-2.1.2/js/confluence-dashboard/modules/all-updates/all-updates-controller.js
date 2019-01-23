define('confluence-dashboard/modules/all-updates/all-updates-collection', ['module', 'exports', 'backbone', '../../core/shared/base-collection', 'configuration'], function (module, exports, _backbone, _baseCollection, _configuration) {
    'use strict';

    var Backbone = _interopRequireDefault(_backbone).default;

    var BaseCollection = _interopRequireDefault(_baseCollection).default;

    var endpoints = _configuration.endpoints;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = BaseCollection.extend({
        url: endpoints.ALL_UPDATES,

        // override the fetch method as this old api isn't REST
        sync: function sync(method, model, options) {
            if (method !== 'read') {
                console.log('Method not implemented for all updates', method);
                return;
            }

            options.data = {
                maxResults: 40,
                tab: 'all',
                showProfilePic: true,
                labels: '',
                spaces: '',
                users: '',
                types: '',
                category: '',
                spaceKey: ''
            };

            return Backbone.sync.call(this, method, model, options);
        },
        parse: function parse(data) {
            return data.changeSets;
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/modules/all-updates/all-updates-controller', ['module', 'exports', './all-updates-collection', 'confluence-dashboard/core/content/content-controller', 'confluence-dashboard/core/content/content-as-stream-view', 'confluence-dashboard/soy-templates', 'configuration', 'ajs'], function (module, exports, _allUpdatesCollection, _contentController, _contentAsStreamView, _soyTemplates, _configuration, _ajs) {
    'use strict';

    var AllUpdatesCollection = _interopRequireDefault(_allUpdatesCollection).default;

    var ContentController = _interopRequireDefault(_contentController).default;

    var ContentAsStream = _interopRequireDefault(_contentAsStreamView).default;

    var DashboardTemplates = _interopRequireDefault(_soyTemplates).default;

    var staticResourceUrl = _configuration.staticResourceUrl;

    var AJS = _interopRequireDefault(_ajs).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = ContentController.extend({
        actionsToFilter: ['allUpdates'],

        allUpdates: function allUpdates() {
            this.view = new ContentAsStream({
                collection: new AllUpdatesCollection(),
                templateHelpers: {
                    title: AJS.I18n.getText('all.updates.title'),
                    contentType: this.options.name
                },
                emptyViewOptions: {
                    template: DashboardTemplates.AllUpdates.blank
                }
            });

            this.view.collection.fetch();
        }
    });
    module.exports = exports['default'];
});
