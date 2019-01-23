define('confluence-dashboard/utils/event-manager', ['module', 'exports', 'backbone', 'marionette'], function (module, exports, _backbone, _marionette) {
    'use strict';

    var Wreqr = _backbone.Wreqr;

    var Marionette = _interopRequireDefault(_marionette).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    // Refer to https://github.com/marionettejs/backbone.wreqr
    // for more details of usage

    // for now we have only one channel
    var globalChannel = Wreqr.radio.channel('global');
    // importing marionette here because karma isn't loading Wreqr correctly
    exports.default = {
        EventManager: globalChannel.vent,
        Commands: globalChannel.commands,
        ReqRes: globalChannel.reqres
    };
    module.exports = exports['default'];
});
define('confluence-dashboard/behaviors/aui-sidebar-resizable', ['module', 'exports', 'marionette', '../utils/event-manager', 'jquery', 'ajs', 'confluence/storage-manager'], function (module, exports, _marionette, _eventManager, _jquery, _ajs, _storageManager) {
    'use strict';

    var Behavior = _marionette.Behavior;
    var EventManager = _eventManager.EventManager;

    var $ = _interopRequireDefault(_jquery).default;

    var AJS = _interopRequireDefault(_ajs).default;

    var StorageManager = _interopRequireDefault(_storageManager).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var SIDEBAR_WIDTH_KEY = 'width';
    var COLLAPSED_SIZE = 55;
    var DEFAULT_SIZE = 280;

    var TOGGLE_SIDEBAR_WIDTH = 130;
    var MAXIMUM_SIDEBAR_WIDTH = 640;
    var MINIMUM_SIDEBAR_WIDTH = COLLAPSED_SIZE;

    // this value is the same we have on AUI sidebar.
    var FORCE_COLLAPSE_WIDTH = 1240;

    exports.default = Behavior.extend({
        ui: {
            resizeHandle: '.aui-sidebar-handle'
        },

        events: {
            'mousedown @ui.resizeHandle': 'onResizeStart',
            'mouseup @ui.resizeHandle': 'onResizeEnd'
        },

        dragging: false,

        initialize: function initialize() {
            this.EXPANDED_SIZE = DEFAULT_SIZE;
            this.sidebarSettings = StorageManager('confluence', 'sidebar');
            this.listenTo(this.view, 'sidebar-attached', this.createAuiSidebar, this);
            this.listenTo(EventManager, 'window:resize', this.resetSidebar, this);
        },
        createAuiSidebar: function createAuiSidebar() {
            var _this = this;

            // central event to fire sidebar changes
            this.AUISidebar = AJS.sidebar(this.view.$el.selector);

            this.AUISidebar.on('expand-start.sidebar', function () {
                return _this.onExpand();
            });
            this.AUISidebar.on('collapse-start.sidebar', function () {
                return _this.onCollapse();
            });

            this.$footer = $('#footer, #studio-footer');

            this.currentWidth = parseInt(this.sidebarSettings.getItem(SIDEBAR_WIDTH_KEY));

            this.setInitialState();
        },
        resetSidebar: function resetSidebar() {
            var shouldAutoCollapse = $('body').hasClass('aui-sidebar-collapsed');
            var sidebarWasOpenedWhenCollapsed = this.AUISidebar.$el.hasClass('aui-sidebar-fly-out');

            if (shouldAutoCollapse && !sidebarWasOpenedWhenCollapsed) {
                this.AUISidebar.collapse();
            } else if (!this.isFlyOut() && !this.AUISidebar.isCollapsed()) {
                // if the page is wide enough to not be in fly-out mode, and the sidebar is expanded,
                // we need to make sure the panel padding gets changed to make the sidebar appear "docked"
                // if we don't do this, the sidebar remains in flyout mode if you re-widen the window.
                this.setPanelWidth(this.EXPANDED_SIZE, this.EXPANDED_SIZE);
            }
        },
        setInitialState: function setInitialState() {
            if (this.currentWidth) {
                if (this.currentWidth > TOGGLE_SIDEBAR_WIDTH) {
                    this.EXPANDED_SIZE = this.currentWidth;
                }

                this.adjustSize();
            } else {
                this.currentWidth = DEFAULT_SIZE;
            }
        },
        onBeforeDestroy: function onBeforeDestroy() {
            this.AUISidebar.off('.sidebar');
        },
        triggerToggleSidebar: function triggerToggleSidebar(event) {
            EventManager.trigger('sidebar:' + event);
        },
        isFlyOut: function isFlyOut() {
            return FORCE_COLLAPSE_WIDTH > window.innerWidth;
        },
        onExpand: function onExpand() {
            this.triggerToggleSidebar('expand');
            this.setPanelWidth(this.EXPANDED_SIZE, this.EXPANDED_SIZE);
            this.persistSidebarSize();
        },
        onCollapse: function onCollapse() {
            // if we collapses the sidebar after a resize, we should be able to return to the previous size
            // if the previous size is less than the TOGGLE_SIDEBAR_WIDTH we will just use the DEFAULT_SIZE
            this.EXPANDED_SIZE = this.currentWidth < TOGGLE_SIDEBAR_WIDTH ? DEFAULT_SIZE : this.currentWidth;

            this.triggerToggleSidebar('collapse');
            this.setPanelWidth(COLLAPSED_SIZE, 'inherit');
            this.persistSidebarSize();
        },
        onResizeStart: function onResizeStart(e) {
            var _this2 = this;

            e.preventDefault();

            this.AUISidebar.$body.on('mousemove.sidebar', function (e) {
                var currentWidth = e.pageX;

                _this2.dragging = true;

                if (currentWidth > TOGGLE_SIDEBAR_WIDTH) {
                    _this2.EXPANDED_SIZE = currentWidth;
                }

                _this2.adjustSize();

                if (currentWidth > MINIMUM_SIDEBAR_WIDTH && currentWidth < MAXIMUM_SIDEBAR_WIDTH) {
                    _this2.setPanelWidth(currentWidth);
                }
            });

            this.AUISidebar.$body.one('mouseup.sidebar', function () {
                return _this2.onResizeEnd();
            });
        },
        onResizeEnd: function onResizeEnd() {
            this.AUISidebar.$body.off('.sidebar');

            if (this.dragging) {
                this.adjustSize();
                this.persistSidebarSize();
                this.dragging = false;
            } else {
                // if it's not dragging, it's a click and should toggle
                this.AUISidebar.toggle();
            }
        },
        setPanelWidth: function setPanelWidth(width, maxWidth) {
            var widthPx = width + 'px';
            var paddingPx = widthPx;

            if (this.isFlyOut()) {
                paddingPx = COLLAPSED_SIZE + 'px';
            }

            this.AUISidebar.$wrapper.css({
                'width': widthPx,
                'maxWidth': maxWidth || widthPx
            });

            this.AUISidebar.$el.siblings('.aui-page-panel').css({
                'paddingLeft': paddingPx
            });

            this.$footer.css('padding-left', paddingPx);

            this.currentWidth = width;
        },
        persistSidebarSize: function persistSidebarSize() {
            this.sidebarSettings.setItemQuietly(SIDEBAR_WIDTH_KEY, this.currentWidth);
        },
        _collapse: function _collapse() {
            if (!this.AUISidebar.isCollapsed()) {
                this.AUISidebar.collapse();
            } else {
                // if the sidebar is not expanded, collapse won't fire, so we need to fire it manually.
                this.onCollapse();
            }
        },
        _expand: function _expand() {
            if (this.AUISidebar.isCollapsed()) {
                this.AUISidebar.expand();
            } else {
                // if the sidebar is not collapsed, expand won't fire, so we need to fire it manually.
                this.onExpand();
            }
        },
        adjustSize: function adjustSize() {
            if (this.currentWidth < TOGGLE_SIDEBAR_WIDTH) {
                this._collapse();
            } else {
                this._expand();
            }
        }
    });
    module.exports = exports['default'];
});
define('configuration', ['ajs', 'confluence/meta'], function(AJS, Meta) {
    var contextPath = AJS.contextPath();
    var pluginKey = 'com.atlassian.confluence.plugins.confluence-dashboard';
    var assetsResourceKey = 'confluence-dashboard-resources';

    return {

        // the 'limit' parameter to send to the server on each page request
        apiLimit: 20,

        visibleItemLimit: 200,

        pluginKey: pluginKey,

        staticResourceUrl: Meta.get('static-resource-url-prefix') + '/download/resources/' + pluginKey + ':' + assetsResourceKey,

        backboneHistoryConfig: {
            pushState: false,
            root: contextPath + '/dashboard.action',
            silent: false
        },

        // DARK FEATURES
        DARK_FEATURES: {
            USER_DISABLED_DASHBOARD_DARK_FEATURE: 'simple.dashboard.disabled',
            RECOMMENDED_FOR_YOU_DARK_FEATURE: 'recommended.for.you'
        },

        // ENDPOINTS
        endpoints: {
            ALL_UPDATES: contextPath + '/rest/dashboardmacros/1.0/updates',

            POPULAR_STREAM: contextPath + '/rest/popular/1/stream/content?days=7&pageSize=20',

            RECOMMENDED_STREAM: contextPath + '/rest/recommender/1.0/stream/content',

            RECENTLY_VIEWED: contextPath + '/rest/api/content/search',

            RECENTLY_WORKED: contextPath + '/rest/api/content/search',

            STARRED: contextPath + '/rest/api/content/search',

            FAVOURITE_SPACES: contextPath + '/rest/experimental/search?cql=type=space and space.type=favourite order by favourite desc&expand=space.icon&limit=100',

            ALL_SPACES: contextPath + '/rest/experimental/search?cql=type = space&expand=space.icon',

            TOGGLE_FAVOURITE_SPACE: function(key) {
                return contextPath + '/rest/experimental/relation/user/current/favourite/toSpace/' + key;
            },

            WEB_ITEMS: function(section) {
                return Meta.get('static-resource-url-prefix') + '/download/resources/com.atlassian.confluence.plugins.confluence-dashboard:confluence-dashboard-nav-items/api/web-items/' + section + '.json';
            },

            ADD_FAVOURITE: contextPath + '/json/addfavourite.action',

            REMOVE_FAVOURITE: contextPath + '/json/removefavourite.action',

            FEATURE_DISCOVERY: contextPath + '/rest/feature-discovery/latest/discovered'
        },

        sections: {
            webItems: {
                sidebar: {
                    MY_WORK: 'my-work',
                    DISCOVER: 'discover',
                    MY_SPACES: 'my-spaces',
                    MY_TEAM: 'my-team'
                }
            }
        },

        URLS: {
            LOGIN_PAGE: contextPath + '/login.action'
        }
    };
});

define('confluence-dashboard/utils/dark-features', ['module', 'exports', 'confluence/dark-features', 'confluence/api/ajax', 'ajs', 'jquery'], function (module, exports, _darkFeatures, _ajax, _ajs, _jquery) {
    'use strict';

    var DarkFeatures = _interopRequireDefault(_darkFeatures).default;

    var Ajax = _interopRequireDefault(_ajax).default;

    var AJS = _interopRequireDefault(_ajs).default;

    var $ = _interopRequireDefault(_jquery).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var contextPath = AJS.contextPath();

    function remoteDarkFeature(action, type, key) {
        var actions = {
            'enable': 'PUT',
            'disable': 'DELETE'
        };

        return Ajax.ajax({
            type: actions[action],
            contentType: 'application/json',
            url: contextPath + '/rest/feature/1/' + type + '/' + key,
            data: {} // ajax module needs it
        });
    }

    exports.default = $.extend(DarkFeatures, {
        remotely: {
            user: {
                enable: function enable(key) {
                    DarkFeatures.enable(key);
                    return remoteDarkFeature('enable', 'user', key);
                },
                disable: function disable(key) {
                    DarkFeatures.disable(key);
                    return remoteDarkFeature('disable', 'user', key);
                }
            }
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/modules/nav/nav-definitions', ['module', 'exports', 'ajs', '../../utils/dark-features', 'configuration'], function (module, exports, _ajs, _darkFeatures, _configuration) {
    'use strict';

    var AJS = _interopRequireDefault(_ajs).default;

    var DarkFeatures = _interopRequireDefault(_darkFeatures).default;

    var DARK_FEATURES = _configuration.DARK_FEATURES;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var RECOMMENDED_FOR_YOU_DARK_FEATURE = DARK_FEATURES.RECOMMENDED_FOR_YOU_DARK_FEATURE;


    var MY_WORK = [{
        "key": "recently-worked",
        "url": "recently-worked",
        "label": AJS.I18n.getText("recently.worked.title"),
        "icon": "confluence-icon-recently-worked-on",
        "controllerModule": "confluence-dashboard/modules/recently-worked/recently-worked-controller",
        "controllerMethod": "recentWorked",
        "spa": true
    }, {
        "key": "recently-viewed",
        "url": "recently-viewed",
        "label": AJS.I18n.getText("recently.viewed.title"),
        "icon": "confluence-icon-recently-viewed",
        "controllerModule": "confluence-dashboard/modules/recently-viewed/recently-viewed-controller",
        "controllerMethod": "recentViewed",
        "spa": true
    }, {
        "key": "starred",
        "url": "starred",
        "label": AJS.I18n.getText("starred.title"),
        "icon": "confluence-icon-starred",
        "controllerModule": "confluence-dashboard/modules/starred/starred-controller",
        "controllerMethod": "starred",
        "spa": true
    }];

    var DISCOVER = [{
        "key": "all-updates",
        "url": "all-updates",
        "icon": "confluence-icon-all-updates",
        "label": AJS.I18n.getText('all.updates.title'),
        "controllerModule": "confluence-dashboard/modules/all-updates/all-updates-controller",
        "controllerMethod": "allUpdates",
        "spa": true
    }, {
        "key": "popular-stream",
        "url": "popular",
        "icon": "confluence-icon-popular",
        "label": AJS.I18n.getText('popular.stream.title'),
        "controllerModule": "confluence-dashboard/modules/popular-stream/popular-stream-controller",
        "controllerMethod": "popularStream",
        "spa": true
    }];

    if (DarkFeatures.isEnabled(RECOMMENDED_FOR_YOU_DARK_FEATURE)) {
        DISCOVER.push({
            "key": "recommended-stream",
            "url": "recommended",
            "icon": "confluence-icon-recommended",
            "label": "Recommended for you",
            "controllerModule": "confluence-dashboard/modules/recommended-stream/recommended-stream-controller",
            "controllerMethod": "recommendedStream",
            "spa": true
        });
    }

    exports.default = { MY_WORK: MY_WORK, DISCOVER: DISCOVER };
    module.exports = exports['default'];
});
define('confluence-dashboard/soy-templates', ['module', 'exports'], function (module, exports) {
  'use strict';

  exports.default = window['DashboardTemplates'];
  module.exports = exports['default'];
});
define('confluence-dashboard/behaviors/tooltips', ['module', 'exports', 'marionette'], function (module, exports, _marionette) {
    'use strict';

    var Behavior = _marionette.Behavior;
    exports.default = Behavior.extend({
        defaults: {
            selector: '.tooltip',
            configs: {
                gravity: 's'
            }
        },

        onRender: function onRender() {
            this.$(this.options.selector).tooltip(this.options.configs);
        },
        onBeforeDestroy: function onBeforeDestroy() {
            // make sure we remove the tooltip so it won't be
            // floating forever alone in the screen
            this.$(this.options.selector).tooltip('hide');
        }
    });
    module.exports = exports['default'];
});
define("confluence-dashboard/behaviors/tooltips.js", function(){});

define('confluence-dashboard/modules/nav/nav-item-view', ['module', 'exports', 'marionette', 'confluence-dashboard/soy-templates', '../../utils/event-manager', 'backbone', '../../behaviors/tooltips'], function (module, exports, _marionette, _soyTemplates, _eventManager, _backbone, _tooltips) {
    'use strict';

    var ItemView = _marionette.ItemView;

    var Templates = _interopRequireDefault(_soyTemplates).default;

    var EventManager = _eventManager.EventManager;

    var Backbone = _interopRequireDefault(_backbone).default;

    var Tooltip = _interopRequireDefault(_tooltips).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var SELECTED_CLASS = 'aui-nav-selected';

    exports.default = ItemView.extend({
        tagName: 'li',
        template: Templates.Nav.item,
        behaviors: {
            tooltip: {
                behaviorClass: Tooltip,
                selector: '.aui-nav-item',
                configs: {
                    gravity: 'w'
                }
            }
        },

        modelEvents: {
            'change selected': 'render'
        },

        events: {
            'click a': 'onClick'
        },

        onClick: function onClick() {
            this.model.set('selected', true);
        },
        initialize: function initialize() {
            this.onChangeRoute();
            this.listenTo(EventManager, 'onRoute', this.onChangeRoute);
        },
        onChangeRoute: function onChangeRoute() {
            this.model.set('selected', this.model.get('url') === Backbone.history.fragment);
        },
        onBeforeRender: function onBeforeRender() {
            this.$el.attr({
                'class': 'nav-item-container-' + this.model.get('key') + ' ' + (this.model.get('selected') ? SELECTED_CLASS : '')
            });
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/core/shared/base-collection', ['module', 'exports', 'backbone'], function (module, exports, _backbone) {
    'use strict';

    var Collection = _backbone.Collection;
    exports.default = Collection.extend({
        // Defined just to remember you that you need to implement it on your collection if you want grouping
        groupMethod: function groupMethod(item) {
            // implement your own group method
            throw 'groupMethod method missing - check this collection !!!';
        },


        // safe fetch abort previous requests (created by itself) if they haven't been completed yet to avoid race conditions
        safeFetch: function safeFetch(options) {
            // if there is a previous filterXHR object and its readyState is between 1 and 3, cancel it!
            if (this.filterXHR && /[1-3]/.test(this.filterXHR.readyState)) {
                this.filterXHR.abort();
                this.filterXHR = null;
            }

            this.filterXHR = this.fetch(options);

            return this.filterXHR;
        },
        sync: function sync(method, model, options) {
            // make sure results aren't cached (required for IE 10)
            if (!options.cache) {
                options.cache = false;
            }
            return Collection.prototype.sync.apply(this, arguments);
        }
    });
    module.exports = exports['default'];
});
define("confluence-dashboard/core/shared/base-collection.js", function(){});

define('confluence-dashboard/core/web-fragments/web-item/web-item-collection', ['module', 'exports', '../../shared/base-collection', 'backbone', 'configuration'], function (module, exports, _baseCollection, _backbone, _configuration) {
    'use strict';

    var BaseCollection = _interopRequireDefault(_baseCollection).default;

    var Model = _backbone.Model;
    var endpoints = _configuration.endpoints;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var WebItemModel = Model.extend({
        defaults: {
            weight: 1,
            urlWithoutContextPath: true
        }
    });

    exports.default = BaseCollection.extend({
        model: WebItemModel,

        setContainer: function setContainer(container) {
            this.container = container;
        },
        url: function url() {
            return endpoints.WEB_ITEMS(this.container);
        },
        extractUrls: function extractUrls() {
            return this.invoke('pick', ['url', 'key']);
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/core/web-fragments/web-item/web-item-views', ['module', 'exports', 'marionette', 'confluence-dashboard/soy-templates', './web-item-collection'], function (module, exports, _marionette, _soyTemplates, _webItemCollection) {
    'use strict';

    var CollectionView = _marionette.CollectionView;
    var CompositeView = _marionette.CompositeView;
    var ItemView = _marionette.ItemView;

    var DashboardTemplates = _interopRequireDefault(_soyTemplates).default;

    var WebItemsCollection = _interopRequireDefault(_webItemCollection).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    // represents an individual web-item, i.e: a link
    var WebItemView = ItemView.extend({
        tagName: 'li',
        template: DashboardTemplates.WebFragments.webItem
    });

    // represents a list of web-items, i.e: a menu
    var WebItemCollectionView = CollectionView.extend({
        tagName: 'ul',
        childView: WebItemView,

        initialize: function initialize(options) {
            if (!options.container) {
                throw 'A container should be defined for a web item';
            }

            this.collection = new WebItemsCollection();
        }
    });

    // the same as WebItemCollectionView but allows you to add a
    // template for the container
    var WebItemCompositeView = CompositeView.extend({
        childView: WebItemView,

        initialize: function initialize(options) {
            if (!options.container) {
                throw 'A container should be defined for a web item';
            }

            this.collection = new WebItemsCollection();
        }
    });

    exports.default = { WebItemView: WebItemView, WebItemCollectionView: WebItemCollectionView, WebItemCompositeView: WebItemCompositeView };
    module.exports = exports['default'];
});
define('confluence-dashboard/modules/nav/nav-composite-view', ['module', 'exports', 'confluence-dashboard/soy-templates', './nav-item-view', '../../core/web-fragments/web-item/web-item-views'], function (module, exports, _soyTemplates, _navItemView, _webItemViews) {
    'use strict';

    var DashboardTemplates = _interopRequireDefault(_soyTemplates).default;

    var NavItemView = _interopRequireDefault(_navItemView).default;

    var WebItemCompositeView = _webItemViews.WebItemCompositeView;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = WebItemCompositeView.extend({
        template: DashboardTemplates.Nav.container,
        childViewContainer: '.nav-items',
        className: 'backbone-view',
        childView: NavItemView
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/core/shared/base-controller', ['module', 'exports', 'marionette', 'underscore'], function (module, exports, _marionette, _underscore) {
    'use strict';

    var Object = _marionette.Object;

    var _ = _interopRequireDefault(_underscore).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = Object.extend({
        initialize: function initialize() {
            // setup your views and router when needed
            this.wrapActions();
        },


        // list of actions to be wrapped, should be defined in each controller specifying the actions
        actionsToFilter: [],
        // noop methods to be implemented in each controller
        beforeAction: function beforeAction() {},
        afterAction: function afterAction() {},


        // wrap actions from this.actions including beforeAction and afterAction
        wrapActions: function wrapActions() {
            var _this = this;

            this.actionsToFilter.forEach(function (action) {
                if (!_this[action] || !_.isFunction(_this[action])) {
                    throw 'Method \'' + action + '\' not found!';
                }

                var originalMethod = _this[action];

                // wrap all the listed actions
                _this[action] = function () {
                    // if beforeAction returns false, it stops the execution,
                    // if you need to throw an error or show a dialog, do it
                    // inside the beforeAction
                    if (this.beforeAction.apply(this, arguments) !== false) {

                        // call the original method with the original arguments
                        originalMethod.apply(this, arguments);

                        // and finally the afterAction
                        this.afterAction.apply(this, arguments);
                    }
                };
            });
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/modules/nav/nav-controller', ['module', 'exports', 'configuration', './nav-definitions', '../../utils/event-manager', './nav-composite-view', '../../core/shared/base-controller', 'ajs', 'jquery'], function (module, exports, _configuration, _navDefinitions, _eventManager, _navCompositeView, _baseController, _ajs, _jquery) {
    'use strict';

    var sections = _configuration.sections;
    var DISCOVER = _navDefinitions.DISCOVER;
    var MY_WORK = _navDefinitions.MY_WORK;
    var Commands = _eventManager.Commands;

    var NavCompositeView = _interopRequireDefault(_navCompositeView).default;

    var Controller = _interopRequireDefault(_baseController).default;

    var AJS = _interopRequireDefault(_ajs).default;

    var $ = _interopRequireDefault(_jquery).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = Controller.extend({
        createDiscoverView: function createDiscoverView() {
            var discoverView = this.createDefaultNavContainer({
                container: sections.webItems.sidebar.DISCOVER,
                templateHelpers: {
                    title: AJS.I18n.getText('nav.controller.discover')
                }
            });

            discoverView.collection.add(DISCOVER);

            // Don't repeat it at home - quick fix for sidebar bug where the
            // sidebar doesn't fit the whole screen before you scroll.
            // TODO: investigate how to solve it properly
            var fixSidebar = function fixSidebar() {
                $('body').animate({ scrollTop: 0 });
            };

            discoverView.on('dom:refresh', fixSidebar);

            return discoverView;
        },
        createMyWorkView: function createMyWorkView() {
            var myWorkView = this.createDefaultNavContainer({
                container: sections.webItems.sidebar.MY_WORK,
                templateHelpers: {
                    title: AJS.I18n.getText('nav.controller.my.work')
                }
            });

            myWorkView.collection.add(MY_WORK);

            return myWorkView;
        },
        createDefaultNavContainer: function createDefaultNavContainer(menuConfig) {
            var menuView = new NavCompositeView(menuConfig);

            this.listenTo(menuView.collection, 'add', this.bootstrapWebItem, this);

            menuView.collection.setContainer(menuConfig.container);

            return menuView;
        },


        // calls the factory to bind the route
        bootstrapWebItem: function bootstrapWebItem(webItemModel) {
            Commands.execute('app:setupWebItem', webItemModel.toJSON());
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/modules/nav-spaces/nav-spaces-collection', ['module', 'exports', '../../core/shared/base-collection', 'backbone', 'configuration', 'ajs'], function (module, exports, _baseCollection, _backbone, _configuration, _ajs) {
    'use strict';

    var BaseCollection = _interopRequireDefault(_baseCollection).default;

    var Model = _backbone.Model;
    var Collection = _backbone.Collection;
    var endpoints = _configuration.endpoints;

    var AJS = _interopRequireDefault(_ajs).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var contextPath = AJS.contextPath();

    var SpaceModel = Model.extend({
        idAttribute: 'key',

        url: function url() {
            return endpoints.TOGGLE_FAVOURITE_SPACE(this.get('key'));
        },
        parse: function parse(data) {
            data.url = contextPath + data.url;
            data.logo = contextPath + data.space.icon.path;
            data.name = data.title;
            data.key = data.space.key;
            return data;
        }
    });

    var FavouriteSpacesCollection = BaseCollection.extend({
        url: endpoints.FAVOURITE_SPACES,
        model: SpaceModel,

        parse: function parse(data) {
            return data.results;
        }
    });

    var AllSpacesCollection = FavouriteSpacesCollection.extend({
        url: endpoints.ALL_SPACES
    });

    exports.default = { FavouriteSpacesCollection: FavouriteSpacesCollection, AllSpacesCollection: AllSpacesCollection };
    module.exports = exports['default'];
});
define('confluence-dashboard/core/shared/base-composite-view', ['module', 'exports', 'marionette', 'configuration'], function (module, exports, _marionette, _configuration) {
    'use strict';

    var CompositeView = _marionette.CompositeView;
    var staticResourceUrl = _configuration.staticResourceUrl;
    exports.default = CompositeView.extend({
        // the view starts with a collection not fetched
        fetched: false,

        // we need to detect the first fetch and mark the collection
        collectionEvents: {
            'sync': 'onCollectionSync'
        },

        getOption: function getOption(name) {
            if (name === 'emptyViewOptions') {
                return this.selectEmptyViewOptions();
            }
            return CompositeView.prototype.getOption.call(this, name);
        },
        isFiltered: function isFiltered() {
            return false;
        },
        onCollectionSync: function onCollectionSync() {
            var becameFetched = !this.fetched;

            // after sync we set it as fetched
            this.fetched = true;

            // re-render is required when switching between empty views (loadingView, emptyView, noMatchesView)
            if (becameFetched || this.collection.length === 0) {
                this._renderChildren();
            }
        },


        // Overrides CompositeView.getEmptyView to return the desired empty view
        getEmptyView: function getEmptyView() {
            var emptyViewType = this.selectEmptyViewType();
            var emptyView = this.getOption(emptyViewType);
            if (!emptyView) {
                throw 'Missing ' + emptyViewType;
            }
            return emptyView;
        },


        // Choose the empty view to use
        selectEmptyViewType: function selectEmptyViewType() {
            if (!this.fetched) {
                return 'loadingView';
            } else if (this.isFiltered()) {
                return 'noMatchesView';
            }
            return 'emptyView';
        },


        // Choose the empty view options to use
        selectEmptyViewOptions: function selectEmptyViewOptions() {
            var emptyViewType = this.selectEmptyViewType();
            return CompositeView.prototype.getOption.call(this, emptyViewType + "Options");
        }
    });
    module.exports = exports['default'];
});
define("confluence-dashboard/core/shared/base-composite-view.js", function(){});

define('confluence-dashboard/core/shared/loading-view', ['module', 'exports', 'marionette', 'confluence-dashboard/soy-templates'], function (module, exports, _marionette, _soyTemplates) {
    'use strict';

    var ItemView = _marionette.ItemView;

    var DashboardTemplates = _interopRequireDefault(_soyTemplates).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = ItemView.extend({
        tagName: 'li',
        className: 'empty-view loading-view',

        getTemplate: function getTemplate() {
            return DashboardTemplates.Default.loading;
        }
    });
    module.exports = exports['default'];
});
define("confluence-dashboard/core/shared/loading-view.js", function(){});

define('confluence-dashboard/utils/analytics', ['module', 'exports', 'ajs', 'backbone'], function (module, exports, _ajs, _backbone) {
    'use strict';

    var AJS = _interopRequireDefault(_ajs).default;

    var Backbone = _interopRequireDefault(_backbone).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var ANALYTICS_DASHBOARD_PREFIX = 'confluence.spa';

    exports.default = {
        publish: function publish(name) {
            var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            var tagName = ANALYTICS_DASHBOARD_PREFIX + '.' + name;

            data.currentSection = Backbone.history.fragment;

            AJS.trigger('analytics', { name: tagName, data: data });
            // debug options to help making the whitelist
            //console.log(`"${tagName}":[],`);
            //console.log(`"${tagName}":[
            // _.keys(data)
            // ],`);
        }
    };
    module.exports = exports['default'];
});
define('confluence-dashboard/behaviors/undo-remove', ['module', 'exports', 'marionette', 'jquery', '../utils/analytics'], function (module, exports, _marionette, _jquery, _analytics) {
    'use strict';

    var Behavior = _marionette.Behavior;

    var $ = _interopRequireDefault(_jquery).default;

    var analytics = _interopRequireDefault(_analytics).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    /**
     * Undo Remove
     *
     * Add this behaviour to the view if you want to keep it visible after removing.
     *
     * It will call the model.destroy but won't remove from the screen so you can add
     * it again simulating an 'undo' action.
     *
     * Usage:
     * ItemView.extend({
     *  behaviors: {
     *       undoRemove: {
     *           behaviorClass: UndoRemove
     *       }
     *   }
     * })
     *
     * TODO: write tests
     */

    var $win = $(window);
    var ON_UNLOAD_EVENT = 'beforeunload.remove';

    exports.default = Behavior.extend({
        defaults: {
            timeToDestroy: 3000 // 10000
        },

        ui: {
            'remove': '.remove',
            'undo': '.undo-remove'
        },

        events: {
            'click @ui.remove': 'virtualRemove',
            'click @ui.undo': 'undoVirtualRemove'
        },

        modelEvents: {
            'change:virtuallyDeleted': 'onVirtualDelete'
        },

        onVirtualDelete: function onVirtualDelete() {
            this.view.render();
        },
        virtualRemove: function virtualRemove() {
            var _this = this;

            this.view.model.set('virtuallyDeleted', true);

            // set the model to be destroyed in a moment
            this.timeout = setTimeout(function () {
                _this.sendRemove();
            }, this.options.timeToDestroy);

            this.bindToUnload();

            analytics.publish(this.options.eventNamespace + '.remove-favourite.clicked');
        },
        undoVirtualRemove: function undoVirtualRemove() {
            // avoid the model destruction
            clearTimeout(this.timeout);

            this.unbindFromUnload();

            this.view.model.set('virtuallyDeleted', false);

            analytics.publish(this.options.eventNamespace + '.remove-favourite.undo');
        },


        // as the action happens after a few seconds, we need to make sure that if the user
        // leave the page before the time the action still happens.
        bindToUnload: function bindToUnload() {
            var _this2 = this;

            var id = this.view.model.get('id');

            // the event has a unique identifier so we can remove it if needed
            $win.on(ON_UNLOAD_EVENT + '.' + id, function () {
                _this2.sendRemove();

                // we return empty so the browser won't confirm anything
                return;
            });
        },


        // clean up to be called if undo or timeout happens
        unbindFromUnload: function unbindFromUnload() {
            var id = this.view.model.get('id');

            $win.off(ON_UNLOAD_EVENT + '.' + id);
        },
        sendRemove: function sendRemove() {
            this.view.model.destroy();
            this.unbindFromUnload();
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/utils/conditions', ['module', 'exports', 'confluence/meta', 'ajs'], function (module, exports, _meta, _ajs) {
    'use strict';

    var Meta = _interopRequireDefault(_meta).default;

    var AJS = _interopRequireDefault(_ajs).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = {
        canShowDashboard: function canShowDashboard() {
            var simplifyDashboardPresent = document.querySelector('.confluence-dashboard');
            if (!simplifyDashboardPresent) {
                AJS.log("Simplify dashboard disabled.", { simplifyDashboardPresent: simplifyDashboardPresent });
            }
            return simplifyDashboardPresent;
        },
        isAnonymousUser: function isAnonymousUser() {
            return !Meta.get('remote-user');
        }
    };
    module.exports = exports['default'];
});
define('confluence-dashboard/modules/nav-spaces/nav-spaces-item-view', ['module', 'exports', 'marionette', '../../behaviors/undo-remove', '../../behaviors/tooltips', 'confluence-dashboard/soy-templates', '../../utils/conditions'], function (module, exports, _marionette, _undoRemove, _tooltips, _soyTemplates, _conditions) {
    'use strict';

    var ItemView = _marionette.ItemView;

    var UndoRemove = _interopRequireDefault(_undoRemove).default;

    var Tooltip = _interopRequireDefault(_tooltips).default;

    var DashboardTemplates = _interopRequireDefault(_soyTemplates).default;

    var conditions = _interopRequireDefault(_conditions).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = ItemView.extend({
        template: DashboardTemplates.NavSpaces.space,

        tagName: 'li',

        className: 'item',

        templateHelpers: function templateHelpers() {
            return {
                isAnonymousUser: conditions.isAnonymousUser()
            };
        },


        behaviors: {
            undoRemove: {
                behaviorClass: UndoRemove,
                eventNamespace: 'global-sidebar.spaces-menu'
            },

            tooltip: {
                behaviorClass: Tooltip,
                selector: '.aui-nav-item',
                configs: {
                    gravity: 'w'
                }
            }
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/core/shared/no-content-view', ['module', 'exports', 'marionette', 'confluence-dashboard/soy-templates', '../../utils/analytics', 'confluence/legacy', 'confluence/meta'], function (module, exports, _marionette, _soyTemplates, _analytics, _legacy, _meta) {
    'use strict';

    var ItemView = _marionette.ItemView;

    var DashboardTemplates = _interopRequireDefault(_soyTemplates).default;

    var analytics = _interopRequireDefault(_analytics).default;

    var Confluence = _interopRequireDefault(_legacy).default;

    var Meta = _interopRequireDefault(_meta).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = ItemView.extend({
        tagName: 'li',
        className: 'empty-view no-content-view',
        template: DashboardTemplates.Default.blank,

        templateHelpers: function templateHelpers() {
            return {
                userCanCreateContent: Meta.getBoolean('user-can-create-content')
            };
        },

        events: {
            'click a': 'onActionClick',
            'click .create-page': 'openCreatePage'
        },

        openCreatePage: function openCreatePage() {
            Confluence.Blueprint.loadDialogAndOpenTemplate({});
        },
        onActionClick: function onActionClick() {
            analytics.publish('blank-experience.action.clicked');
        }
    });
    module.exports = exports['default'];
});
define("confluence-dashboard/core/shared/no-content-view.js", function(){});

define('confluence-dashboard/modules/nav-spaces/nav-spaces-empty-view', ['module', 'exports', 'confluence-dashboard/soy-templates', '../../core/shared/no-content-view', 'ajs'], function (module, exports, _soyTemplates, _noContentView, _ajs) {
    'use strict';

    var DashboardTemplates = _interopRequireDefault(_soyTemplates).default;

    var NoContentView = _interopRequireDefault(_noContentView).default;

    var AJS = _interopRequireDefault(_ajs).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = NoContentView.extend({
        tagName: 'li',
        template: DashboardTemplates.NavSpaces.mySpacesBlank,
        className: 'nav-space-blank',
        templateHelpers: {
            text: AJS.I18n.getText('nav.controller.my.spaces.blank'),
            callToActionText: AJS.I18n.getText('nav.controller.my.spaces.blank.callToAction'),
            callToActionLink: AJS.contextPath() + '/spacedirectory/view.action'
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/behaviors/analytics-tracking', ['module', 'exports', 'marionette', '../utils/analytics', 'backbone', 'underscore'], function (module, exports, _marionette, _analytics, _backbone, _underscore) {
    'use strict';

    var Behavior = _marionette.Behavior;

    var analytics = _interopRequireDefault(_analytics).default;

    var Backbone = _interopRequireDefault(_backbone).default;

    var _ = _interopRequireDefault(_underscore).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = Behavior.extend({
        defaults: {
            prefix: ''
        },

        events: {
            'click a': 'trackItemClick'
        },

        trackItemClick: function trackItemClick() {
            var eventName = 'item.clicked';

            if (this.options.prefix) {
                eventName = this.options.prefix + '.' + eventName;
            }

            analytics.publish(eventName);
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/modules/nav-spaces/nav-spaces-composite-view', ['module', 'exports', '../../core/shared/base-composite-view', '../../core/shared/loading-view', 'confluence-dashboard/soy-templates', './nav-spaces-item-view', './nav-spaces-empty-view', '../../behaviors/analytics-tracking', '../../utils/analytics'], function (module, exports, _baseCompositeView, _loadingView, _soyTemplates, _navSpacesItemView, _navSpacesEmptyView, _analyticsTracking, _analytics) {
    'use strict';

    var BaseCompositeView = _interopRequireDefault(_baseCompositeView).default;

    var LoadingView = _interopRequireDefault(_loadingView).default;

    var DashboardTemplates = _interopRequireDefault(_soyTemplates).default;

    var SpaceItemView = _interopRequireDefault(_navSpacesItemView).default;

    var SpaceEmptyView = _interopRequireDefault(_navSpacesEmptyView).default;

    var AnalyticsTracking = _interopRequireDefault(_analyticsTracking).default;

    var analytics = _interopRequireDefault(_analytics).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = BaseCompositeView.extend({
        template: DashboardTemplates.Nav.container,
        childViewContainer: '.nav-items',
        childView: SpaceItemView,
        emptyView: SpaceEmptyView,
        loadingView: LoadingView,
        className: 'aui-navgroup-inner',

        behaviors: {
            analyticsTracking: {
                behaviorClass: AnalyticsTracking,
                prefix: 'global-sidebar.spaces-menu'
            }
        },

        events: {
            'click .all-spaces-link': 'onSpaceDirectoryClick'
        },

        onSpaceDirectoryClick: function onSpaceDirectoryClick() {
            analytics.publish('space-directory.clicked');
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/modules/nav-spaces/nav-spaces-controller', ['module', 'exports', 'configuration', './nav-spaces-collection', './nav-spaces-composite-view', '../../core/shared/base-controller', 'ajs'], function (module, exports, _configuration, _navSpacesCollection, _navSpacesCompositeView, _baseController, _ajs) {
    'use strict';

    var sections = _configuration.sections;
    var AllSpacesCollection = _navSpacesCollection.AllSpacesCollection;
    var FavouriteSpacesCollection = _navSpacesCollection.FavouriteSpacesCollection;

    var NavSpacesView = _interopRequireDefault(_navSpacesCompositeView).default;

    var Controller = _interopRequireDefault(_baseController).default;

    var AJS = _interopRequireDefault(_ajs).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = Controller.extend({
        createAllSpacesView: function createAllSpacesView() {
            var spacesMenu = new NavSpacesView({
                container: sections.webItems.sidebar.MY_SPACES,
                collection: new AllSpacesCollection(),
                templateHelpers: {
                    title: AJS.I18n.getText('nav.controller.all.spaces'),
                    anchorName: AJS.I18n.getText('nav.controller.my.spaces.anchor'),
                    anchorLink: AJS.contextPath() + '/spacedirectory/view.action',
                    anchorTitle: AJS.I18n.getText('sidebar.header.spaces.menu.view.all')
                }
            });

            return spacesMenu;
        },
        createMySpacesView: function createMySpacesView() {
            var spacesMenu = new NavSpacesView({
                container: sections.webItems.sidebar.MY_SPACES,
                collection: new FavouriteSpacesCollection(),
                templateHelpers: {
                    title: AJS.I18n.getText('nav.controller.my.spaces'),
                    anchorName: AJS.I18n.getText('nav.controller.my.spaces.anchor'),
                    anchorLink: AJS.contextPath() + '/spacedirectory/view.action',
                    anchorTitle: AJS.I18n.getText('sidebar.header.spaces.menu.view.all')
                }
            });

            spacesMenu.collection.fetch();

            return spacesMenu;
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/modules/sidebar/sidebar-view', ['module', 'exports', 'marionette', 'ajs', '../../behaviors/aui-sidebar-resizable', '../../modules/nav/nav-controller', '../../modules/nav-spaces/nav-spaces-controller', '../../utils/conditions'], function (module, exports, _marionette, _ajs, _auiSidebarResizable, _navController, _navSpacesController, _conditions) {
    'use strict';

    var LayoutView = _marionette.LayoutView;

    var AJS = _interopRequireDefault(_ajs).default;

    var AuiSidebarResizable = _interopRequireDefault(_auiSidebarResizable).default;

    var NavController = _interopRequireDefault(_navController).default;

    var NavSpacesController = _interopRequireDefault(_navSpacesController).default;

    var conditions = _interopRequireDefault(_conditions).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = LayoutView.extend({
        template: false,

        el: '.aui-sidebar',

        regions: {
            'sidebar-discover': '#sidebar-discover',
            'sidebar-my-work': '#sidebar-my-work',
            'sidebar-spaces': '#sidebar-spaces'
        },

        behaviors: {
            AuiSidebarResizable: {
                behaviorClass: AuiSidebarResizable
            }
        },

        initialize: function initialize() {
            this.setNavContent();
            this.trigger('sidebar-attached');
        },
        setNavContent: function setNavContent() {
            var _this = this;

            var navController = new NavController();
            var navSpacesController = new NavSpacesController();

            this.getRegion('sidebar-discover').show(navController.createDiscoverView());

            if (!conditions.isAnonymousUser()) {
                this.getRegion('sidebar-my-work').show(navController.createMyWorkView());
                this.getRegion('sidebar-spaces').show(navSpacesController.createMySpacesView());
            } else {
                // only show list of spaces for anonymous users if there are some spaces
                var allSpacesView = navSpacesController.createAllSpacesView();

                allSpacesView.collection.fetch().then(function () {
                    if (allSpacesView.collection.length > 0) {
                        _this.getRegion('sidebar-spaces').show(allSpacesView);
                    }
                });
            }
        },
        expand: function expand() {
            AJS.sidebar(this.el).expand();
        },
        collapse: function collapse() {
            AJS.sidebar(this.el).collapse();
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/modules/welcome-message/welcome-message-view', ['module', 'exports', 'marionette', 'jquery', '../../utils/analytics'], function (module, exports, _marionette, _jquery, _analytics) {
    'use strict';

    var ItemView = _marionette.ItemView;

    var $ = _interopRequireDefault(_jquery).default;

    var analytics = _interopRequireDefault(_analytics).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var HIGHLIGHTED_CLASS = 'welcome-message-highlight';
    var EDIT_BUTTON = '.aui-button.welcome-message-edit-button';

    exports.default = ItemView.extend({
        el: '.welcome-message',

        template: false,

        events: {
            'mouseenter a.welcome-message-edit-button': 'highlightOn',
            'mouseleave a.welcome-message-edit-button': 'highlightOff',
            'click a.welcome-message-edit-button': 'onEditButtonClick'
        },

        highlightOn: function highlightOn() {
            this.$el.addClass(HIGHLIGHTED_CLASS);
        },
        highlightOff: function highlightOff() {
            this.$el.removeClass(HIGHLIGHTED_CLASS);
        },
        onEditButtonClick: function onEditButtonClick() {
            analytics.publish('edit-welcome-message.clicked');
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/core/main/main-router', ['module', 'exports', 'marionette', '../../utils/event-manager', 'backbone', 'confluence/storage-manager', 'underscore', 'jquery', '../../utils/analytics'], function (module, exports, _marionette, _eventManager, _backbone, _storageManager, _underscore, _jquery, _analytics) {
    'use strict';

    var AppRouter = _marionette.AppRouter;
    var EventManager = _eventManager.EventManager;

    var Backbone = _interopRequireDefault(_backbone).default;

    var StorageManager = _interopRequireDefault(_storageManager).default;

    var _ = _interopRequireDefault(_underscore).default;

    var $ = _interopRequireDefault(_jquery).default;

    var analytics = _interopRequireDefault(_analytics).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var dashboardHistory = StorageManager('dashboard', 'route');

    var DEFAULT_PAGE = 'all-updates';

    // debouncing so we don't track redirects
    var trackPageView = _.debounce(function (lastPath) {

        analytics.publish('view', {
            previousSection: lastPath
        });
    }, 100);

    exports.default = AppRouter.extend({
        initialize: function initialize() {
            this.listenTo(Backbone.history, 'route', this.onRoute);
        },
        onRoute: function onRoute() {
            trackPageView(dashboardHistory.getItem('last'));

            var path = Backbone.history.fragment;

            dashboardHistory.setItemQuietly('last', path);
            EventManager.trigger('onRoute', path);
        },


        appRoutes: {
            // '' -> empty key means root - the same defined on our main-app.js
            '': 'index'
        },

        controller: {
            index: function index() {
                var initialPage = DEFAULT_PAGE;

                if (dashboardHistory.doesContain('last')) {
                    initialPage = dashboardHistory.getItem('last');
                }

                analytics.publish('root-loaded', {
                    redirectedTo: initialPage
                });

                Backbone.history.navigate(initialPage, { trigger: true, replace: true });
            }
        },

        handleClicks: function handleClicks(evt) {
            var href = $(evt.currentTarget).attr('href'); //.replace('/content', '');
            var protocol = window.location.protocol + '//';

            if (href.slice(protocol.length) !== protocol) {
                var metric = 'global-sidebar.clicked.using-meta';

                if (!evt.ctrlKey && !evt.metaKey) {
                    evt.preventDefault();
                    //need to slice the href to cause the fragment won't have the #
                    if (Backbone.history.fragment === href.slice(1)) {
                        Backbone.history.loadUrl();
                    } else {
                        this.navigate(href, true);
                    }

                    metric = 'global-sidebar.clicked';
                }

                analytics.publish(metric);
            }
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/core/content/content-factory', ['module', 'exports'], function (module, exports) {
    'use strict';

    var factory = function factory(options) {
        if (!options) {
            throw 'Missing options!';
        }

        var name = options.name,
            scope = options.scope,
            routes = options.routes,
            controllerModule = options.controllerModule;


        if (!controllerModule) {
            throw 'Missing controller module!';
        }

        if (!routes) {
            throw 'Missing route definitions!';
        }

        // TODO: in production it should be async so we will load the controller when loading the web item
        var Controller = require(controllerModule);

        if (!Controller) {
            throw 'Controller not found!';
        }

        return new Controller({
            name: name,
            scope: scope || '/',
            routes: routes
        });
    };

    exports.default = factory;
    module.exports = exports['default'];
});
define('confluence-dashboard/core/main/main-controller', ['module', 'exports', './main-router', '../../utils/event-manager', 'backbone', '../shared/base-controller', '../content/content-factory'], function (module, exports, _mainRouter, _eventManager, _backbone, _baseController, _contentFactory) {
    'use strict';

    var MainRouter = _interopRequireDefault(_mainRouter).default;

    var Commands = _eventManager.Commands;

    var Backbone = _interopRequireDefault(_backbone).default;

    var Controller = _interopRequireDefault(_baseController).default;

    var contentFactory = _interopRequireDefault(_contentFactory).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _defineProperty(obj, key, value) {
        if (key in obj) {
            Object.defineProperty(obj, key, {
                value: value,
                enumerable: true,
                configurable: true,
                writable: true
            });
        } else {
            obj[key] = value;
        }

        return obj;
    }

    exports.default = Controller.extend({
        initialize: function initialize() {
            this.router = new MainRouter();

            // handle the navigation between spa linsk
            this.on('navigate', this.onNavigate, this);

            // allow web-items to create their rotes
            Commands.setHandler('app:setupWebItem', this.setupWebItem, this);
        },
        onNavigate: function onNavigate(href) {
            // all navigate events go through here
            this.router.navigate(href, true);
        },
        setupWebItem: function setupWebItem(webItem) {
            if (!webItem) {
                throw 'No web item data';
            }

            if (webItem.spa) {

                if (!webItem.url) {
                    throw 'Web Item missing an url';
                }

                if (!webItem.controllerMethod) {
                    throw 'Web Item missing its controller method';
                }

                if (!webItem.controllerModule) {
                    throw 'Web Item missing controller';
                }

                // if it's an spa, create a content router
                var routes = _defineProperty({}, webItem.url, webItem.controllerMethod);

                // call the factoty. If everything is ok it will return a controller
                this.webItemController = contentFactory({
                    name: webItem.key,
                    scope: webItem.scope,
                    routes: routes,
                    controllerModule: webItem.controllerModule
                });

                // make sure that this route triggers if it's created
                // after the router is started
                if (webItem.url === Backbone.history.fragment) {
                    Backbone.history.loadUrl();
                }
            }
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/core/content/content-region-animation', ['module', 'exports', 'marionette', 'jquery'], function (module, exports, _marionette, _jquery) {
    'use strict';

    var Region = _marionette.Region;

    var $ = _interopRequireDefault(_jquery).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    /*eslint-disable */
    $.extend($.easing, {
        def: 'easeOutQuad',
        easeOutQuad: function easeOutQuad(x, t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        }
    });
    /*eslint-enable */

    var animationOptions = {
        easing: 'easeOutQuad',
        duration: 200,
        queue: false // queue false to avoid blocking other animations
    };

    var scrollToTheTop = function scrollToTheTop() {
        // Scroll back to the top if the user has scrolled down more than the height of the header.
        // It returns a promise so we can queue with the other animations.
        var defer = $.Deferred();
        var hh = $('#header').height();

        var doc = document.documentElement;
        var scrollPosition = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

        if (scrollPosition > hh) {
            var animationProperties = $.extend({}, animationOptions, {
                complete: function complete() {
                    defer.resolve();
                }
            });

            $('html, body').animate({
                scrollTop: hh
            }, animationProperties);
        } else {
            defer.resolve();
        }

        return defer.promise();
    };

    exports.default = Region.extend({
        // animation that will run for content coming in
        // opacity is not here because it would cause a flash in slow
        // connections when the loading view appear before the content.
        // For changes in the opacity settings, go to
        // shared/base-composite-view.js#attachBuffer method
        in: function _in(el) {
            el.css({
                position: 'relative',
                top: '15px',
                opacity: 0
            }).animate({
                top: 0,
                opacity: 1
            }, animationOptions);
        },


        // animation that will run when removing content
        out: function out(el) {
            var defer = $.Deferred();

            el.animate({
                opacity: 0
            }, $.extend({}, animationOptions, {
                complete: function complete() {
                    defer.resolve();
                }
            }));

            return defer.promise();
        },


        // overriding the Region show method so we can run animations in between each view
        show: function show() {
            var _this = this;

            var self = this;
            var args = arguments;

            if (this.currentView) {
                scrollToTheTop().then(function () {
                    _this.out(_this.$el.find(_this.options.selectorToAnimate)).then(function () {
                        Region.prototype.show.apply(self, args);
                        _this.in(_this.$el.find(_this.options.selectorToAnimate));
                    });
                });
            } else {
                Region.prototype.show.apply(this, arguments);
                this.in(this.$el.find(this.options.selectorToAnimate));
            }
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/core/main/main-app', ['module', 'exports', 'marionette', '../../utils/event-manager', '../../modules/sidebar/sidebar-view', '../../modules/welcome-message/welcome-message-view', './main-controller', '../content/content-region-animation', 'underscore', 'jquery'], function (module, exports, _marionette, _eventManager, _sidebarView, _welcomeMessageView, _mainController, _contentRegionAnimation, _underscore, _jquery) {
    'use strict';

    var Application = _marionette.Application;
    var ReqRes = _eventManager.ReqRes;
    var EventManager = _eventManager.EventManager;
    var Commands = _eventManager.Commands;

    var SidebarView = _interopRequireDefault(_sidebarView).default;

    var EditWelcomeMessageView = _interopRequireDefault(_welcomeMessageView).default;

    var MainController = _interopRequireDefault(_mainController).default;

    var ContentRegion = _interopRequireDefault(_contentRegionAnimation).default;

    var _ = _interopRequireDefault(_underscore).default;

    var $ = _interopRequireDefault(_jquery).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var $win = $(window);

    exports.default = Application.extend({
        el: '.PageContent',

        isStarted: false,

        regions: {
            'page': '.confluence-dashboard',
            'content': {
                el: '.content-body',
                selectorToAnimate: '.list-container',
                regionClass: ContentRegion
            },
            'dialogs': '.dialogs',
            'right-sidebar': '.content-sidebar',
            'welcome-message': '.welcome-message-wrapper'
        },

        initialize: function initialize() {
            this.controller = new MainController();

            this.router = this.controller.router;

            // Returns this instance so you can get it from anywhere in the app
            ReqRes.setHandler('app', this.getApp, this);

            // Global command called from the controllers to switch the layout
            Commands.setHandler('main-app:swapContent', this.swapContent, this);

            // Global command called from the controllers to switch the layout
            Commands.setHandler('main-app:showDialog', this.showDialog, this);

            // binding an event to window scroll, so instead of listening to scroll you can listen to window:scroll.
            $win.on('scroll.window.main-layout', this.triggerWindowScroll);

            // the same goes for the resize event. Just listen to window:resize on your view
            $win.on('resize.window.main-layout', _.debounce(this.triggerWindowResize.bind(this), 16));
        },
        getApp: function getApp() {
            return this;
        },
        onStart: function onStart() {
            this.isStarted = true;
            this.attachServerRenderedViews();
            this.attachWelcomeMessage();
        },
        onBeforeDestroy: function onBeforeDestroy() {
            $win.off('scroll.window.main-layout');
            $win.off('resize.window.main-layout');
        },
        triggerWindowScroll: function triggerWindowScroll() {
            // TODO: if we need to calculate the scroll position in more than two places it make sense to send it here as parameter
            EventManager.trigger('window:scroll', window);
        },
        triggerWindowResize: function triggerWindowResize() {
            // TODO: if we need to calculate the window size in more than two places it make sense to send it here as parameter
            EventManager.trigger('window:resize', window);
        },
        expandSidebar: function expandSidebar() {
            if (this.sidebarView) {
                this.sidebarView.expand();
            }
        },


        // Global command called from the controllers to switch the layout
        swapContent: function swapContent(contentView) {
            this.getRegion('content').show(contentView);
        },


        // Global command called from anywhere to add a dialog
        showDialog: function showDialog(dialogView) {
            this.getRegion('dialogs').show(dialogView);
        },
        attachServerRenderedViews: function attachServerRenderedViews() {
            this.sidebarView = new SidebarView();
            this.getRegion('page').attachView(this.sidebarView);
        },
        attachWelcomeMessage: function attachWelcomeMessage() {
            this.getRegion('welcome-message').attachView(new EditWelcomeMessageView());
        }
    });
    module.exports = exports['default'];
});
define('confluence-dashboard/utils/single-flag', ['module', 'exports', 'confluence/flag', 'underscore', 'jquery'], function (module, exports, _flag, _underscore, _jquery) {
    'use strict';

    var flag = _interopRequireDefault(_flag).default;

    var _ = _interopRequireDefault(_underscore).default;

    var $ = _interopRequireDefault(_jquery).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    /**
     * Single flag makes sure that you won't show more than one flag each time.
     * The last created takes precedence and removes the last one.
     *
     * @type {{currentFlag: null, closePreviousFlags: Function, create: Function}}
     */

    var SingleFlag = {
        currentFlag: null,

        closePreviousFlags: function closePreviousFlags() {
            if (SingleFlag.currentFlag) {
                SingleFlag.currentFlag.flag.close();
                SingleFlag.currentFlag = null;
            }
        },
        shouldShow: function shouldShow(options) {
            if (!SingleFlag.currentFlag || !SingleFlag.currentFlag.flag) {
                return true;
            }

            var isOpen = $(SingleFlag.currentFlag.flag).attr('aria-hidden') === 'false';
            var hasTheSameProps = _.isEqual(SingleFlag.currentFlag.options, options);

            // compare the set of options and if they are the same, don't show
            if (isOpen && hasTheSameProps) {
                return false;
            }

            return true;
        },
        create: function create(options) {
            var defaults = {
                type: 'error',
                close: 'auto',
                persistent: false,
                stack: 'dashboard'
            };

            var config = _.extend(defaults, options);

            if (!this.shouldShow(config)) {
                return;
            }

            SingleFlag.closePreviousFlags();
            var freshFlag = flag(config);

            SingleFlag.currentFlag = {
                flag: freshFlag,
                options: config
            };

            if (config.callback && _.isFunction(config.callback)) {
                config.callback();
            }
        }
    };

    exports.default = SingleFlag;
    module.exports = exports['default'];
});
define('confluence-dashboard/utils/navigation', ['module', 'exports', 'window'], function (module, exports, _window) {
    'use strict';

    var window = _interopRequireDefault(_window).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = {
        /**
         * Provides an easy to test facade for window.location.href = 'foo-bar';
         */
        redirect: function redirect(url) {
            window.location.href = url;
        }
    };
    module.exports = exports['default'];
});
define('confluence-dashboard/utils/error-handlers', ['module', 'exports', 'backbone', 'jquery', 'ajs', './analytics', './single-flag', './navigation', 'configuration'], function (module, exports, _backbone, _jquery, _ajs, _analytics, _singleFlag, _navigation, _configuration) {
    'use strict';

    var Backbone = _interopRequireDefault(_backbone).default;

    var $ = _interopRequireDefault(_jquery).default;

    var AJS = _interopRequireDefault(_ajs).default;

    var analytics = _interopRequireDefault(_analytics).default;

    var SingleFlag = _interopRequireDefault(_singleFlag).default;

    var navigation = _interopRequireDefault(_navigation).default;

    var URLS = _configuration.URLS;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var $win = $(window);
    var contextPath = AJS.contextPath();
    var EVENT_NAMESPACE = 'dashboard-error-handler';

    var FLAG_DEFINITIONS = {
        NOT_FOUND: {
            type: 'error',
            title: AJS.I18n.getText('error.notfound.title'),
            close: 'auto'
        },

        SERVER_ERROR: {
            type: 'error',
            title: AJS.I18n.getText('error.server-error.title'),
            body: AJS.I18n.getText('error.server-error.body'),
            close: 'auto'
        },

        SESSION_EXPIRED: {
            type: 'error',
            title: AJS.I18n.getText('error.session.expired.title'),
            body: AJS.I18n.getText('error.session.expired.body'),
            close: 'never'
        },

        OFFLINE: {
            type: 'error',
            title: AJS.I18n.getText('error.connection.lost.title'),
            body: AJS.I18n.getText('error.connection.lost.body'),
            close: 'never'
        },

        ONLINE: {
            type: 'success',
            title: AJS.I18n.getText('error.connection.recovered.title'),
            body: '<button class="aui-button aui-button-link btn-reload-content">' + AJS.I18n.getText('error.connection.recovered.action') + '</button>',
            close: 'auto',
            callback: function callback() {
                $(SingleFlag.currentFlag).on('click', '.btn-reload-content', function () {
                    SingleFlag.closePreviousFlags();
                    Backbone.history.loadUrl();
                });
            }
        }
    };

    var handle404 = function handle404() {
        SingleFlag.create(FLAG_DEFINITIONS.NOT_FOUND);
        analytics.publish('error-handler.not-found');
    };

    var handleServerErrors = function handleServerErrors() {
        SingleFlag.create(FLAG_DEFINITIONS.SERVER_ERROR);
        analytics.publish('error-handler.server-error');
    };

    var handleSessionIssues = function handleSessionIssues(xhr) {
        // request not completed and alike
        if (xhr.status === 0) {
            handleServerErrors();
        } else if (/(401|403)/.test(xhr.status)) {
            SingleFlag.create(FLAG_DEFINITIONS.SESSION_EXPIRED);
            analytics.publish('error-handler.session.expired');

            var destination = window.location.pathname.replace(contextPath, '');
            navigation.redirect(URLS.LOGIN_PAGE + '?os_destination=' + destination);
        }
    };

    var handleConnectionIssues = function handleConnectionIssues() {
        SingleFlag.create(FLAG_DEFINITIONS.OFFLINE);
        analytics.publish('error-handler.connection.lost');

        // after showing a message saying you're offline, we listen to the online event;
        // when it happens, we remove the message and reload the current view
        $win.one('online.' + EVENT_NAMESPACE, function () {
            SingleFlag.create(FLAG_DEFINITIONS.ONLINE);
            analytics.publish('error-handler.connection.recovered');
        });
    };

    var BackboneAjaxBackup = Backbone.ajax;

    exports.default = {
        interceptBackboneErrors: function interceptBackboneErrors() {
            // overriding backbone.ajax to include statusCode error handlers.
            // this way we only affect ajax requests started by backbone.
            Backbone.ajax = function () {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                options.statusCode = $.extend({
                    401: handleSessionIssues,
                    403: handleSessionIssues,
                    404: handle404,
                    400: handleServerErrors,
                    500: handleServerErrors
                }, options.statusCode || {});

                return Backbone.$.ajax.call(Backbone.$, options);
            };
        },
        interceptConnectionErrors: function interceptConnectionErrors() {
            $win.on('offline.' + EVENT_NAMESPACE, handleConnectionIssues);
        },
        stopIntercepting: function stopIntercepting() {
            $win.off('.' + EVENT_NAMESPACE);
            Backbone.ajax = BackboneAjaxBackup;
        }
    };
    module.exports = exports['default'];
});
define('confluence-dashboard/app', ['module', 'exports', 'backbone', 'jquery', './core/main/main-app', './utils/error-handlers', './utils/analytics', 'configuration'], function (module, exports, _backbone, _jquery, _mainApp, _errorHandlers, _analytics, _configuration) {
    'use strict';

    var Backbone = _interopRequireDefault(_backbone).default;

    var $ = _interopRequireDefault(_jquery).default;

    var MainApp = _interopRequireDefault(_mainApp).default;

    var errorHandler = _interopRequireDefault(_errorHandlers).default;

    var analytics = _interopRequireDefault(_analytics).default;

    var backboneHistoryConfig = _configuration.backboneHistoryConfig;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    // Create our Application
    var app = new MainApp();

    app.on('before:start', function () {
        // collection / Api errors 401, 403, 404 and 500
        errorHandler.interceptBackboneErrors();
        // offline / online
        errorHandler.interceptConnectionErrors();

        // start the router
        Backbone.history.start(backboneHistoryConfig);
    });

    // Start history when our application is ready
    app.on('start', function () {

        // send all the links to the router
        $(document).on('click', '.confluence-dashboard .aui-sidebar-body .spa a', app.router.handleClicks.bind(app.router));

        analytics.publish('rendered');
    });

    exports.default = app;
    module.exports = exports['default'];
});
define('confluence-dashboard/index', ['./app', './utils/conditions', 'ajs'], function (_app, _conditions, _ajs) {
    'use strict';

    var app = _interopRequireDefault(_app).default;

    var conditions = _interopRequireDefault(_conditions).default;

    var AJS = _interopRequireDefault(_ajs).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    AJS.toInit(function () {
        if (conditions.canShowDashboard()) {
            app.start();
        }
    });
});
define('confluence-dashboard/core/shared/no-matches-view', ['module', 'exports', 'marionette', 'confluence-dashboard/soy-templates'], function (module, exports, _marionette, _soyTemplates) {
    'use strict';

    var ItemView = _marionette.ItemView;

    var DashboardTemplates = _interopRequireDefault(_soyTemplates).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = ItemView.extend({
        tagName: 'li',
        className: 'empty-view no-matches-view',
        template: DashboardTemplates.Default.noMatches
    });
    module.exports = exports['default'];
});
define("confluence-dashboard/core/shared/no-matches-view.js", function(){});

define('confluence-dashboard/core/shared/cql-base-collection', ['module', 'exports', './base-collection', 'jquery', 'ajs', 'underscore'], function (module, exports, _baseCollection, _jquery, _ajs, _underscore) {
    'use strict';

    var BaseCollection = _interopRequireDefault(_baseCollection).default;

    var $ = _interopRequireDefault(_jquery).default;

    var AJS = _interopRequireDefault(_ajs).default;

    var _ = _interopRequireDefault(_underscore).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var context = AJS.contextPath();

    /**
     * Cql-Base-Collection
     * ===================
     *
     * It's a basic Backbone Collection that reads data from an Atlassian REST API using a CQL query.
     *
     * This implementation will provide the methods for infinite loading, filtering
     * and parsing the results
     */

    exports.default = BaseCollection.extend({
        // generic url for collections. It will concatenate all the attributes inside apiParams. Override it on your collection if you need something different.
        url: function url() {
            return this.buildUrlFromParams();
        },


        // build your url from params. Your collection should have an attribute
        // like the following one:
        //      ...
        //      apiParams: {
        //          url: endpoints.RECENTLY_WORKED,
        //          params: 'limit=20',
        //          expansions: [
        //              'container',
        //              'metadata.currentuser.lastmodified'
        //          ],
        //          cqlcontext: `{"contentStatuses":["current","draft"]}`
        //          cql: 'type in (page,blogpost) and contributor=currentUser()',
        //      },
        //      ...
        // it will make easier and more readable building compound urls that rely on
        // a certain order of the parameters
        buildUrlFromParams: function buildUrlFromParams(options) {
            if (!this.apiParams) {
                throw 'apiParams attribute missing';
            }

            var _getApiParams = this.getApiParams(options),
                url = _getApiParams.url,
                params = _getApiParams.params,
                expansions = _getApiParams.expansions,
                cqlcontext = _getApiParams.cqlcontext,
                cql = _getApiParams.cql,
                cqlOrder = _getApiParams.cqlOrder;

            var queryAttributes = [];

            if (!url) {
                throw 'CqlBaseCollection:buildUrlFromParams: missing URL!';
            }

            if (params) {
                queryAttributes.push($.param(params));
            }

            if (expansions) {
                queryAttributes.push('expand=' + expansions.join(','));
            }

            if (cqlcontext) {
                queryAttributes.push('cqlcontext=' + encodeURI(cqlcontext));
            }

            if (cql) {
                if (options && options.cqlQuery) {
                    cql += ' ' + options.cqlQuery;
                }
                if (cqlOrder) {
                    cql += ' order by ' + cqlOrder;
                }

                queryAttributes.push('cql=' + cql);
            }

            if (queryAttributes.length) {
                url = url + '?' + queryAttributes.join('&');
            }

            return url;
        },
        getApiParams: function getApiParams(options) {
            return _.isFunction(this.apiParams) ? this.apiParams(options) : this.apiParams;
        },


        // default parse method for Atlassian REST response format. It also detects if there is a next page and persist this information
        parse: function parse(data, options) {
            this.parseNext(data, options);
            return data.results;
        },


        // Used inside the parse method to detect if there is a next page. This follows the Atlassian REST response format and should be overwritten on your collection if you expect a different format of data.
        parseNext: function parseNext(data, options) {
            if (data._links && data._links.next) {
                this.hasNext = true;
                this.nextUrl = context + data._links.next;
            } else {
                this.hasNext = false;
                this.nextUrl = null;
            }
        },


        // Used by the infinite loading if the parseNext detected the next page. It will return a promise. If there is no next page it will reject the promise immediatelly.
        loadMore: function loadMore() {
            if (this.hasNext) {
                return this.safeFetch({
                    url: this.nextUrl,
                    remove: false,
                    loadingMore: true
                });
            } else {
                var defer = $.Deferred();
                defer.reject();
                return defer.promise();
            }
        },


        // Used by the filter. It assumes you have cql on your endpoint and just adds one more clause at the end. If your endpoint doesn't have cql on the url, override this method on your collection with the right path
        search: function search(params) {
            // params.query should be CQL safe (see utils/strings.normalizeForCQL)
            var url = this.buildUrlFromParams({ cqlQuery: 'and title ~ \'' + params.query + '*\'', isFiltered: true });

            return this.safeFetch({
                url: url,
                isFiltered: true
            });
        }
    });
    module.exports = exports['default'];
});
define("confluence-dashboard/core/shared/cql-base-collection.js", function(){});

define('confluence-dashboard/core/shared/base-collection-with-function', ['module', 'exports', './cql-base-collection', 'configuration', 'underscore'], function (module, exports, _cqlBaseCollection, _configuration, _underscore) {
    'use strict';

    var CqlBaseCollection = _interopRequireDefault(_cqlBaseCollection).default;

    var apiLimit = _configuration.apiLimit;
    var visibleItemLimit = _configuration.visibleItemLimit;

    var _ = _interopRequireDefault(_underscore).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = CqlBaseCollection.extend({
        // the currently displayed page offset for infinite scrolling
        pageOffset: 0,

        sync: function sync(method, model, options) {
            // if not an infinite scroll load (eg. collection.fetch is called manually), start from page 1
            if (!options.loadingMore) {
                this.pageOffset = 0;
            }
            return CqlBaseCollection.prototype.sync.apply(this, arguments);
        },
        parseNext: function parseNext(data, options) {
            // the next infinite scroll load will fetch the next page
            this.pageOffset += data.results.length;
            this.hasNext = !(options && options.isFiltered) && data.results.length > 0 // CONFSERVER-53408 Look up more as long as we haven't had 0 returned.
            && this.getPageLimit(options) > 0;
            this.nextUrl = this.hasNext ? this.buildUrlFromParams(options) : null;
        },
        getPageOffset: function getPageOffset(options) {
            // infinite scrolling doesn't play nice with offset+limit within the function, and filtering
            return options && options.isFiltered ? 0 : this.pageOffset;
        },
        getPageLimit: function getPageLimit(options) {
            // infinite scrolling doesn't play nice with offset+limit within the function, and filtering
            return options && options.isFiltered ? visibleItemLimit : _.min([apiLimit, visibleItemLimit - this.getPageOffset(options)]);
        }
    });
    module.exports = exports['default'];
});
define("confluence-dashboard/core/shared/base-collection-with-function.js", function(){});

define('confluence-dashboard/core/shared/base-dialog', ['module', 'exports', 'marionette', 'ajs'], function (module, exports, _marionette, _ajs) {
    'use strict';

    var ItemView = _marionette.ItemView;

    var AJS = _interopRequireDefault(_ajs).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = ItemView.extend({
        tagName: 'section',

        className: 'aui-layer aui-dialog2 aui-dialog2-medium confluence-dialog-no-chrome confluence-dialog-centered',

        attributes: {
            'aria-hidden': true
        },

        openDialog: function openDialog() {
            var _this = this;

            this.initDialog();
            this.dialog.on('show', function () {
                return _this.delegateEvents();
            });
            this.dialog.on('hide', function () {
                return _this.destroy();
            });
            this.dialog.show();
        },
        closeDialog: function closeDialog() {
            if (this.dialog) {
                this.dialog.hide();
            }
        },
        onRender: function onRender() {
            this.initDialog();
        },
        initDialog: function initDialog() {
            if (!this.dialog) {
                this.dialog = AJS.dialog2(this.el);
            }
        }
    });
    module.exports = exports['default'];
});
define("confluence-dashboard/core/shared/base-dialog.js", function(){});

define('confluence-dashboard/core/shared/scope-router', ['module', 'exports', 'marionette', 'backbone', 'underscore'], function (module, exports, _marionette, _backbone, _underscore) {
    'use strict';

    var AppRouter = _marionette.AppRouter;

    var Backbone = _interopRequireDefault(_backbone).default;

    var _ = _interopRequireDefault(_underscore).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    /**
     * Scoped Router
     * =============
     *
     * Let you define routes per scope avoiding a monolitic huge router;
     *
     * Usage:
     *
     * import ScopeRouter from '../shared/scope-router';
     *
     * let Router = ScopeRouter.extend({
     * 		scope: 'name-of-the-feature',
     * 		scopedRoutes: {
     * 			'action1': 'doAction1'
     * 		},
     * 		controller: new MyFeatureController()
     * })
     *
     * It will create the url 'name-of-the-feature/action1' and bound to the
     * method 'doAction1' from the controller 'MyFeatureController'.
     *
     * If you need to reuse any of the components outside of this app, change your controller
     * to extend 'Marionette.AppRouter' and change the key from 'scopedRoutes' to 'appRoutes'
     * or copy this file.
     */

    // Overriding history.route to avoid duplicated routes.
    Backbone.History.prototype.route = function (route, callback) {
        // We can't compare regexps so let's convert it to string
        var name = String(route);
        // Now we can use it to search in the existent routes
        var handler = _.findWhere(this.handlers, { name: name });

        // if there is a route for the current handler, just update the handler
        if (handler) {
            handler.callback = callback;
        } else {
            this.handlers.unshift({ name: name, route: route, callback: callback });
        }
    };

    exports.default = AppRouter.extend({
        initialize: function initialize(options) {
            var scope = this.options.scope || this.scope;
            var scopedRoutes = this.options.scopedRoutes || this.scopedRoutes;

            if (!scope) {
                throw 'Scope router requires a scope!';
            }

            if (!scopedRoutes) {
                throw 'Scope router requires a scopedRoutes object!';
            }

            if (!this.controller && !this.options.controller) {
                throw 'Scope router requires a controller!';
            }

            if (scope === '/') {
                scope = '';
            } else {
                scope = scope + '/';
            }

            var appRoutes = {};

            _.each(scopedRoutes, function (method, route) {
                appRoutes['' + scope + route] = method;
            });

            this.scope = scope;
            this.appRoutes = appRoutes;
        }
    }

    // scopedRoutes: {},

    // controller: featureController
    );
    module.exports = exports['default'];
});
define("confluence-dashboard/core/shared/scope-router.js", function(){});

define('confluence-dashboard/core/content/content-as-grouped-list-view', ['module', 'exports', '../shared/base-composite-view', 'confluence-dashboard/soy-templates', '../../utils/event-manager', '../../behaviors/stickable/stickable', '../../behaviors/infinite-loading', '../../behaviors/filterable', '../../behaviors/progress-indicator', '../../behaviors/analytics-tracking', '../shared/no-content-view', '../shared/loading-view', '../shared/no-matches-view', '../../modules/group/group-composite-view', '../../modules/group/group-collection', '../../modules/list-item/list-item-view'], function (module, exports, _baseCompositeView, _soyTemplates, _eventManager, _stickable, _infiniteLoading, _filterable, _progressIndicator, _analyticsTracking, _noContentView, _loadingView, _noMatchesView, _groupCompositeView, _groupCollection, _listItemView) {
    'use strict';

    var BaseCompositeView = _interopRequireDefault(_baseCompositeView).default;

    var DashboardTemplates = _interopRequireDefault(_soyTemplates).default;

    var EventManager = _eventManager.EventManager;

    var Stickable = _interopRequireDefault(_stickable).default;

    var InfiniteLoading = _interopRequireDefault(_infiniteLoading).default;

    var Filterable = _interopRequireDefault(_filterable).default;

    var ProgressIndicator = _interopRequireDefault(_progressIndicator).default;

    var AnalyticsTracking = _interopRequireDefault(_analyticsTracking).default;

    var NoContentView = _interopRequireDefault(_noContentView).default;

    var LoadingView = _interopRequireDefault(_loadingView).default;

    var NoMatchesView = _interopRequireDefault(_noMatchesView).default;

    var GroupView = _interopRequireDefault(_groupCompositeView).default;

    var GroupCollection = _interopRequireDefault(_groupCollection).default;

    var ListItemView = _interopRequireDefault(_listItemView).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = BaseCompositeView.extend({
        template: DashboardTemplates.Content.groupedListWithFilter,
        childViewContainer: '.list-container',

        childView: GroupView,
        childViewOptions: {
            childView: ListItemView
        },

        emptyView: NoContentView,
        loadingView: LoadingView,
        noMatchesView: NoMatchesView,
        noMatchesViewOptions: {
            templateHelpers: function templateHelpers() {
                return {
                    filter: this._parent.getFilterString()
                };
            }
        },

        ui: {
            filter: '[name=filter]'
        },

        behaviors: {
            // adds ios like appearance to the headers
            stickMainHeader: {
                behaviorClass: Stickable,
                element: '.content-header',
                autoRun: true
            },

            // infinite loading based on the collection methods / response
            infiniteLoading: {
                behaviorClass: InfiniteLoading,
                target: '.list-container'
            },

            // progress indicator (spinner) based on the collection methods / response
            progressIndicator: {
                behaviorClass: ProgressIndicator,
                dataSource: 'collection',
                // once loadingView is embedded into groupedListWithFilter / streamList, the page gets two
                // 'spinner-container' elements so just take the first one
                container: '.spinner-container:first',
                size: 'medium'
            },

            // adding filter capabilities
            filterable: {
                behaviorClass: Filterable
            },

            analyticsTracking: {
                behaviorClass: AnalyticsTracking
            }

        },

        events: {
            'submit .content-filter': 'onFilterSubmit'
        },

        // if we are using a group collection inside, it won't trigger the default event collection:render so we should trigger it ourselves
        initialize: function initialize() {
            var collection = this.collection;
            this.collection = new GroupCollection([], {
                collectionToGroup: collection
            });
        },
        isFiltered: function isFiltered() {
            return this.getFilterString().length > 0;
        },
        getFilterString: function getFilterString() {
            return this.ui.filter.val();
        },
        onFilterSubmit: function onFilterSubmit(e) {
            // disable filter submit, including on enter keypress
            e.preventDefault();
        }
    });
    module.exports = exports['default'];
});
define("confluence-dashboard/core/content/content-as-grouped-list-view.js", function(){});

define('confluence-dashboard/behaviors/stickable/stickable', ['module', 'exports', 'marionette', '../../utils/event-manager', 'underscore'], function (module, exports, _marionette, _eventManager, _underscore) {
    'use strict';

    var Behavior = _marionette.Behavior;
    var EventManager = _eventManager.EventManager;

    var _ = _interopRequireDefault(_underscore).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = Behavior.extend({
        defaults: {
            offset: 0,
            gap: 0,
            autoRun: false
        },

        onRender: function onRender() {
            var opts = this.options;

            if (!opts.element) {
                throw 'Behavior:Stickable: Missing `element` attribute';
            }

            this.$target = this.view.$el.find(opts.element);
            this.target = this.$target[0];

            this.listenTo(EventManager, 'window:resize', this.onResize, this);
            this.listenTo(EventManager, 'window:scroll', this.stick, this);
            this.listenTo(EventManager, 'list:change', this.stick, this);

            if (opts.autoRun) {
                _.defer(this.stick.bind(this));
            }

            this.view.$el.addClass('stickable');
        },
        stick: function stick() {
            var _options = this.options,
                gap = _options.gap,
                offset = _options.offset;


            var doc = document.documentElement;
            var scrollPosition = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
            var positionFromTop = this.view.$el.offset().top;
            var limitBottom = positionFromTop + this.view.$el.outerHeight();
            var collisionPosition = scrollPosition + offset + gap;

            // if the scroll is reaching the container (this.view.el)
            if (collisionPosition >= positionFromTop && collisionPosition <= limitBottom) {
                var width = this.target.clientWidth;
                // creates a clone with the same dimension as when you have position fixed the element is dettached from its container
                if (!this.clone) {
                    this.clone = this.$target.clone();
                    this.$target.before(this.clone);
                    this.$target.addClass('stick').css({
                        width: width + 'px'
                    });
                }

                // if you are close to the bottom of the container, changes its class to .stuck (position: absolute; bottom: 0). We expect the container to have position: relative;
                if (collisionPosition >= limitBottom - this.$target.outerHeight()) {
                    this.$target.removeClass('stick').addClass('stuck');

                    // if it's not close to the bottom of the container, it will have the class .stick (position: fixed) and the top will be the offset
                } else {
                    this.$target.removeClass('stuck').addClass('stick').css({
                        top: offset + 'px',
                        width: width + 'px'
                    });
                }
            } else {
                this.removeClone();
            }
        },
        onResize: function onResize() {
            if (this.clone) {
                var width = this.clone.width();
                this.$target.css({
                    width: width + 'px'
                });
            }
        },
        removeClone: function removeClone(isDestroying) {
            if (this.clone) {
                this.$target.removeClass('stick').removeClass('stuck');
                this.$target.css({
                    width: '100%'
                });
                this.clone.remove();
                this.clone = null;
            }
        },
        onBeforeDestroy: function onBeforeDestroy() {
            this.removeClone();
        }
    });
    module.exports = exports['default'];
});
define("confluence-dashboard/behaviors/stickable/stickable.js", function(){});

define('confluence-dashboard/behaviors/infinite-loading', ['module', 'exports', 'marionette', '../utils/event-manager', 'jquery', 'underscore'], function (module, exports, _marionette, _eventManager, _jquery, _underscore) {
    'use strict';

    var Behavior = _marionette.Behavior;
    var EventManager = _eventManager.EventManager;
    var Commands = _eventManager.Commands;

    var $ = _interopRequireDefault(_jquery).default;

    var _ = _interopRequireDefault(_underscore).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = Behavior.extend({
        defaults: {
            offset: 50
        },

        initialize: function initialize() {
            this.listenToOnce(this.view, 'render:collection', this.setup);
        },
        setup: function setup() {
            var _this = this;

            if (!this.view.collection.loadMore) {
                return;
            }
            this.$target = $(this.options.target, this.$el);
            this.$window = $(window);

            // basic status to skip execution when there is one request running;
            this.loading = false;

            // check for more loading on scroll
            this.listenTo(EventManager, 'window:scroll', this.checkPosition, this);

            // if there is space after a fetch, fetch some moar and then some moar..
            this.listenTo(this.view.collection, 'sync', this.checkPosition);

            // if there is space immediately, load more.. but only after the sync event has finished raised to other behaviours
            _.defer(function () {
                return _this.checkPosition();
            });
        },
        checkPosition: function checkPosition() {
            var _this2 = this;

            if (this.loading) {
                return;
            }

            var scrollPosition = this.$window.scrollTop() + this.$window.height();
            var targetHeight = this.$target.height();

            var positionFromTop = this.$target.offset().top + targetHeight;

            var waypoint = positionFromTop - this.options.offset;

            if (scrollPosition > waypoint) {
                this.loadMore().then(function () {
                    return _this2.checkPosition();
                });
            }
        },
        loadMore: function loadMore() {
            var _this3 = this;

            // lock while performing this request
            this.loading = true;
            return this.view.collection.loadMore()
            // unlock on complete or reject
            .always(function () {
                _this3.loading = false;
            });
        }
    });
    module.exports = exports['default'];
});
define("confluence-dashboard/behaviors/infinite-loading.js", function(){});

define('confluence-dashboard/utils/strings', ['module', 'exports', 'jquery'], function (module, exports, _jquery) {
    'use strict';

    var $ = _interopRequireDefault(_jquery).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var CQL_NOT_ALLOWED = /[\+\-&\|!\(\)\{}\[\]\^~\*\?\\\/:"']/g;

    exports.default = {
        // strip special chars and spaces around
        normalizeForCQL: function normalizeForCQL(str) {
            return $.trim(str.replace(CQL_NOT_ALLOWED, ' '));
        }
    };
    module.exports = exports['default'];
});
define('confluence-dashboard/behaviors/filterable', ['module', 'exports', 'marionette', '../utils/event-manager', 'underscore', 'jquery', 'ajs', '../utils/analytics', '../utils/strings'], function (module, exports, _marionette, _eventManager, _underscore, _jquery, _ajs, _analytics, _strings) {
    'use strict';

    var Behavior = _marionette.Behavior;
    var EventManager = _eventManager.EventManager;

    var _ = _interopRequireDefault(_underscore).default;

    var $ = _interopRequireDefault(_jquery).default;

    var AJS = _interopRequireDefault(_ajs).default;

    var analytics = _interopRequireDefault(_analytics).default;

    var normalizeForCQL = _strings.normalizeForCQL;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = Behavior.extend({
        ui: {
            filter: '[name=filter]'
        },

        events: {
            'input @ui.filter': 'doFilter'
        },

        initialize: function initialize() {
            // behaviors are initialized before the view so collections and models are not available yet. Because of that we should use options.model / options.collection within initialize.

            if (!this.view.options.collection || !this.view.options.collection.search) {
                console.warn('Behavior:Filterable: The collection is missing or not implementing a search method');
            }

            this.doFilter = _.debounce(this.doFilter, 400);
        },
        onShow: function onShow() {
            var _this = this;

            this.listenTo(this.view.collection, 'sync', this.updateFilterString);
            this.listenTo(this.view.collection, 'error', function () {
                return _this.view.collection.reset([]);
            });
        },
        updateFilterString: function updateFilterString(options) {
            // this field is used for the webdriver test - do not remove;
            this.view.$el.find('.list-container').attr('data-filter-string', this.view.getFilterString());
            this.fixAuiSidebar();
        },
        fixAuiSidebar: function fixAuiSidebar() {
            // hack to fix the sidebar not re-docking itself after the page height decreases and becomes non-scrolling
            AJS.sidebar('.aui-sidebar').setPosition();
        },
        doFilter: function doFilter() {
            var query = this.ui.filter.val();
            query = normalizeForCQL(query);
            var view = this.view;

            if (query.length) {
                if (query === this.lastQuery) {
                    return;
                }

                this.lastQuery = query;

                view.collection.search({
                    query: query
                });

                analytics.publish('filter.submit');
            } else {
                // if the search field is empty, let's load the original results
                view.collection.safeFetch();
                analytics.publish('filter.clear');

                this.lastQuery = null;
            }
        }
    });
    module.exports = exports['default'];
});
define("confluence-dashboard/behaviors/filterable.js", function(){});

define('confluence-dashboard/behaviors/progress-indicator', ['module', 'exports', 'marionette', 'ajs'], function (module, exports, _marionette, _ajs) {
    'use strict';

    var Behavior = _marionette.Behavior;

    var AJS = _interopRequireDefault(_ajs).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = Behavior.extend({
        defaults: {
            size: 'small',
            dataSource: 'collection'
        },

        // will become modelEvents or collectionEvents depending on the dataSource option
        dataEvents: {
            'request': 'onRequest',
            'sync': 'spinStop',
            'error': 'spinStop'
        },

        initialize: function initialize() {
            if (!this.options.dataSource) {
                throw "Behavior:ProgressIndicator: A dataSource should be defined. Use 'collection' or 'model'";
            }

            // define modelEvents or collectionEvents depending on the dataSource
            this[this.options.dataSource + 'Events'] = this.dataEvents;
        },
        onAttach: function onAttach() {
            if (this.options.autoRun) {
                this.spin();
            }
        },
        onRequest: function onRequest(model, xhr, options) {
            if (options.type !== 'POST' && options.type !== 'DELETE') {
                this.spin();
            }
        },
        spin: function spin() {
            var _this = this;

            // if spin is called before the view is available, listen to the view 'show' event to show the loader
            if (!this.view._isShown) {
                this.listenToOnce(this.view, 'show', this.spin, this);
            } else {
                // required for webdriver tests
                this.$el.addClass('loading');

                // avoid showing the spinner for requests that finish quickly
                this._currentSpinDelay = setTimeout(function () {
                    AJS.$(_this.options.container, _this.view.el).spin({
                        size: _this.options.size,
                        zIndex: 2000
                    });
                }, 200);
            }
        },
        spinStop: function spinStop() {
            // clear the spin delay, if one is set
            if (this._currentSpinDelay) {
                clearTimeout(this._currentSpinDelay);
                this._currentSpinDelay = null;
            }

            // if spinStop is called before the view is available, remove the listener to the view 'show' so it won't show the loader
            if (!this.view._isShown) {
                this.stopListening(this.view, 'show', this.spin, this);
            }

            this.options.autoRun = false;

            // required for webdriver tests
            this.$el.removeClass('loading');

            AJS.$(this.options.container, this.view.el).spinStop();
        }
    });
    module.exports = exports['default'];
});
define("confluence-dashboard/behaviors/progress-indicator.js", function(){});

define('confluence-dashboard/modules/group/group-composite-view', ['module', 'exports', 'marionette', 'confluence-dashboard/soy-templates', '../../utils/event-manager', '../../behaviors/stickable/stickable'], function (module, exports, _marionette, _soyTemplates, _eventManager, _stickable) {
    'use strict';

    var CompositeView = _marionette.CompositeView;

    var DashboardTemplates = _interopRequireDefault(_soyTemplates).default;

    var EventManager = _eventManager.EventManager;

    var Stickable = _interopRequireDefault(_stickable).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = CompositeView.extend({
        template: DashboardTemplates.Groups.group,
        childViewContainer: '.group-container',
        tagName: 'li',
        className: 'group-wrapper',

        behaviors: {
            stickSubHeaders: {
                behaviorClass: Stickable,
                element: '.sticky-header',
                autoRun: true,
                offset: 75
            }
        },

        initialize: function initialize() {
            this.collection = this.model.get('items');
        },
        onRenderCollection: function onRenderCollection() {
            this.trigger('group:rendered');
        }
    });
    module.exports = exports['default'];
});
define("confluence-dashboard/modules/group/group-composite-view.js", function(){});

define('confluence-dashboard/utils/date-utils', ['module', 'exports', 'underscore', 'ajs'], function (module, exports, _underscore, _ajs) {
    'use strict';

    var _ = _interopRequireDefault(_underscore).default;

    var AJS = _interopRequireDefault(_ajs).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _today() {
        var date = new Date();
        return date;
    }

    function parseUserTime(userTime) {
        return new Date(userTime).toDateString();
    }

    function weekPeriod(time) {
        // 0 = sunday - 7 = saturday
        var weekDay = time.getDay();
        // determine when was sunday
        time.setDate(time.getDate() - weekDay);

        var sunday = new Date(time.getTime());
        sunday.setHours(0, 0, 0, 0);

        var saturday = new Date(time.getTime() + 60 * 60 * 24 * 6 * 1000);
        saturday.setHours(23, 59, 59, 999);

        return {
            begin: sunday,
            end: saturday
        };
    }

    var periodTitles = {
        today: AJS.I18n.getText("period.today"),
        yesterday: AJS.I18n.getText("period.yesterday"),
        lastSevenDays: AJS.I18n.getText("period.lastSevenDays"),
        lastThirtyDays: AJS.I18n.getText("period.lastThirtyDays"),
        older: AJS.I18n.getText("period.older")
    };

    // function monthPeriod
    var DateUtils = {
        today: function today(userTime) {
            var parsedUserTime = parseUserTime(userTime);
            var time = _today();
            return parsedUserTime === time.toDateString();
        },
        yesterday: function yesterday(userTime) {
            var parsedUserTime = parseUserTime(userTime);
            var time = _today();
            time.setDate(time.getDate() - 1);
            return parsedUserTime === time.toDateString();
        },
        lastSevenDays: function lastSevenDays(userTime) {
            var time = _today();
            var sevenDaysAgo = _today().setDate(time.getDate() - 7);
            var userDate = new Date(userTime);
            return userDate >= sevenDaysAgo && userDate <= time;
        },
        lastThirtyDays: function lastThirtyDays(userTime) {
            var time = _today();
            var thirtyDaysAgo = _today().setDate(time.getDate() - 30);
            var userDate = new Date(userTime);
            return userDate >= thirtyDaysAgo && userDate <= time;
        },
        getPeriod: function getPeriod(userTime) {
            var methods = _.pick(DateUtils, 'today', 'yesterday', 'lastSevenDays', 'lastThirtyDays');

            var match = _.find(methods, function (method, key) {
                return method(userTime);
            });

            if (match) {
                var key = _.invert(methods)[match];
                return key;
            }

            return 'older';
        },
        getPeriodTitle: function getPeriodTitle(period) {
            return periodTitles[period];
        },
        getPeriodOrder: function getPeriodOrder(period) {
            return _.keys(periodTitles).indexOf(period);
        },
        compareTimestamps: function compareTimestamps(firstDate, secondDate) {
            return Math.max(-1, Math.min(1, firstDate - secondDate));
        },
        toISODate: function toISODate(dateObj) {
            var paddedDate = dateObj.getDate();
            paddedDate = paddedDate <= 9 ? "0" + paddedDate : paddedDate;
            var paddedMonth = dateObj.getMonth() + 1;
            paddedMonth = paddedMonth <= 9 ? "0" + paddedMonth : paddedMonth;

            // Constructing a Date object with an ISO format date without a timezone makes it assume UTC.
            // When the local timezone is less than UTC that will lead to the date changing to yesterday.
            // However, we want this to be in the current user's timezone, so we append the local timezone so the date is
            // always midnight today in local time.
            var localTimezoneOffset = new Date().getTimezoneOffset();
            var timezoneHours = Math.abs(Math.floor(localTimezoneOffset / 60));
            timezoneHours = timezoneHours <= 9 ? "0" + timezoneHours : timezoneHours;
            var timezoneMinutes = Math.abs(localTimezoneOffset % 60);
            timezoneMinutes = timezoneMinutes <= 9 ? "0" + timezoneMinutes : timezoneMinutes;
            var timezoneString = (localTimezoneOffset < 0 ? "+" : "-") + timezoneHours + ":" + timezoneMinutes;
            return dateObj.getFullYear() + "-" + paddedMonth + "-" + paddedDate + "T00:00:00" + timezoneString;
        }
    };

    exports.default = DateUtils;
    module.exports = exports['default'];
});
define("confluence-dashboard/utils/date-utils.js", function(){});

define('confluence-dashboard/modules/group/group-collection', ['module', 'exports', '../../core/shared/base-collection', 'backbone', 'underscore', '../../utils/date-utils'], function (module, exports, _baseCollection, _backbone, _underscore, _dateUtils) {
    'use strict';

    var BaseCollection = _interopRequireDefault(_baseCollection).default;

    var Model = _backbone.Model;
    var Collection = _backbone.Collection;

    var _ = _interopRequireDefault(_underscore).default;

    var historyDates = _interopRequireDefault(_dateUtils).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = BaseCollection.extend({
        idAttribute: 'periodKey',

        comparator: 'periodOrder',

        // define the methods that should be proxy'ed to the collectionToGroup
        methodsToProxy: ['url', 'fetch', 'safeFetch', 'loadMore', 'search'],

        initialize: function initialize(col, options) {
            if (!options.collectionToGroup) {
                throw 'Grouped Collection requires a collection to group';
            }

            if (!options.collectionToGroup.groupMethod) {
                throw 'The target collection should implement a groupMethod';
            }

            this.collectionToGroup = options.collectionToGroup;

            this.proxyMethods();
            this.proxyEvents();
        },


        // in order to keep marionette bindings, this collection should have all these methods and just proxy to the sub collection
        proxyMethods: function proxyMethods() {
            var groupInstance = this;

            this.methodsToProxy.forEach(function (method) {
                groupInstance[method] = function () {
                    return groupInstance.collectionToGroup[method].apply(groupInstance.collectionToGroup, arguments);
                };
            });
        },
        proxyEvents: function proxyEvents() {
            this.listenTo(this.collectionToGroup, 'request', this._request);
            this.listenTo(this.collectionToGroup, 'sync', this._sync);
            this.listenTo(this.collectionToGroup, 'remove', this._remove);
            this.listenTo(this.collectionToGroup, 'add', this._add);
            this.listenTo(this.collectionToGroup, 'error', this._error);
        },
        _request: function _request(model, xhr, options) {
            this.trigger('request', this, xhr, options);
        },
        _sync: function _sync(model, data, options) {
            this._group();
            this.trigger('sync', this, data, options);
        },
        _remove: function _remove(model, originalCollection) {
            var existent = this.filter(function (periodModel) {
                return periodModel.get('items').indexOf(model) !== -1;
            });

            if (existent.length) {
                var collection = existent[0].get('items');
                collection.remove(model);

                if (!collection.length) {
                    existent[0].destroy();
                }
            }
        },
        _add: function _add() {
            // add will be triggered many times at once so we need to debounce to do only one grouping.
            _.debounce(this._group, 50);
        },
        _error: function _error() {
            this.trigger('error');
        },
        _group: function _group() {
            var _this = this;

            var periods = {};

            var groups = this.collectionToGroup.groupBy(this.collectionToGroup.groupMethod);

            // join all the days in groups by period
            _.each(groups, function (models, day) {
                var period = historyDates.getPeriod(day);
                periods[period] = periods[period] || [];
                periods[period] = periods[period].concat(models);
            });

            // create a model for each period
            _.each(periods, function (items, period) {
                var model = _this.findWhere({ periodKey: period });

                if (model) {
                    model.get('items').set(periods[period], { remove: false });
                } else {
                    _this.add({
                        periodKey: period,
                        periodOrder: historyDates.getPeriodOrder(period),
                        title: historyDates.getPeriodTitle(period),
                        items: new Collection(periods[period], {
                            comparator: _this.collectionToGroup.comparator
                        })
                    });
                }
            });
        }
    });
    module.exports = exports['default'];
});
define("confluence-dashboard/modules/group/group-collection.js", function(){});

define('confluence-dashboard/modules/list-item/list-item-view', ['module', 'exports', 'marionette', '../../behaviors/tooltips', 'confluence-dashboard/soy-templates', 'ajs', 'confluence/meta'], function (module, exports, _marionette, _tooltips, _soyTemplates, _ajs, _meta) {
    'use strict';

    var ItemView = _marionette.ItemView;

    var Tooltip = _interopRequireDefault(_tooltips).default;

    var DashboardTemplates = _interopRequireDefault(_soyTemplates).default;

    var AJS = _interopRequireDefault(_ajs).default;

    var Meta = _interopRequireDefault(_meta).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = ItemView.extend({
        template: DashboardTemplates.Lists.item,
        className: 'item',
        tagName: 'li',

        templateHelpers: function templateHelpers() {

            var pageStatus = void 0;
            var currentUserMetadata = this.model.get("metadata").currentuser;
            if (currentUserMetadata.hasOwnProperty("lastcontributed")) {
                pageStatus = currentUserMetadata.lastcontributed.status;
            } else {
                pageStatus = 'current';
            }

            var enabledFeatures = Meta.get('enabled-dark-features');
            var isCollabEditingEnabled = typeof enabledFeatures !== 'undefined' && enabledFeatures.indexOf('site-wide.synchrony.disable') === -1 && enabledFeatures.indexOf('site-wide.shared-drafts.disable') === -1;

            var contentType = this.model.get("type");

            return {
                isCollabEditingEnabled: isCollabEditingEnabled,
                contentType: contentType,
                pageStatus: pageStatus
            };
        },

        behaviors: {
            tooltip: {
                behaviorClass: Tooltip,
                selector: '.aui-lozenge.aui-lozenge-subtle'
            }
        },

        events: {
            'click a': 'onClick'
        },

        ui: {
            lozenge: '.aui-lozenge'
        },

        onClick: function onClick() {
            if (this.ui.lozenge.length === 1) {
                AJS.trigger('analytics', { name: 'confluence.drafts.referrer', data: {
                        referrerPage: "recentlyWorkedOn",
                        lozengeType: this.ui.lozenge[0].getAttribute("data-type") === "unpublished" ? "Unpublished changes" : "Draft"
                    } });
            }
        }
    });
    module.exports = exports['default'];
});
define("confluence-dashboard/modules/list-item/list-item-view.js", function(){});

define('confluence-dashboard/utils/feature-discovery', ['module', 'exports', 'confluence/legacy', 'confluence/storage-manager'], function (module, exports, _legacy, _storageManager) {
    'use strict';

    var FeatureDiscovery = _legacy.FeatureDiscovery;

    var StorageManager = _interopRequireDefault(_storageManager).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var storage = StorageManager('dashboard', 'feature-discovery');

    exports.default = {
        forPlugin: function forPlugin(pluginKey) {
            var dashboardFeatureDiscovery = FeatureDiscovery.forPlugin(pluginKey);

            // The original method is shouldShow but it only allows ONE feature discovery per page pop.
            // The new dashboard is a single page app and we want to show many features at once, so this method
            // will just return true if the item has not been discovered yet.
            dashboardFeatureDiscovery.canShow = function (feature) {
                if (storage.getItem(feature)) {
                    return false;
                }

                return !dashboardFeatureDiscovery.listDiscovered().some(function (item) {
                    return item === feature;
                });
            };

            dashboardFeatureDiscovery.markDiscoveredSafe = function (featureKey, callback) {
                // to avoid showing features again when the back button is pressed, we save it on local storage too.
                var oneDayInSeconds = 60 * 60 * 24;
                storage.setItemQuietly(featureKey, true, oneDayInSeconds);

                dashboardFeatureDiscovery.markDiscovered(featureKey, callback);
            };

            return dashboardFeatureDiscovery;
        }
    };
    module.exports = exports['default'];
});
define('confluence-dashboard/modules/list-item/list-item-discovery-view', ['module', 'exports', './list-item-view', 'configuration', '../../utils/feature-discovery', 'jquery'], function (module, exports, _listItemView, _configuration, _featureDiscovery, _jquery) {
    'use strict';

    var ListItemView = _interopRequireDefault(_listItemView).default;

    var pluginKey = _configuration.pluginKey;

    var FeatureDiscovery = _interopRequireDefault(_featureDiscovery).default;

    var $ = _interopRequireDefault(_jquery).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var RECENTLY_WORKED_ON_DRAFTS = 'recently-worked-on-drafts';

    var fromResumeDraft = document.referrer.indexOf("resumedraft.action") > -1 || document.referrer.indexOf("createpage.action") > -1;
    var draftDiscoveryEnabled = fromResumeDraft && FeatureDiscovery.forPlugin(pluginKey).canShow(RECENTLY_WORKED_ON_DRAFTS);

    exports.default = ListItemView.extend({
        initialize: function initialize() {
            this.draftDiscovery = draftDiscoveryEnabled === true && this.model.collection.findWhere({ status: 'draft' }) === this.model;
        },
        templateHelpers: function templateHelpers() {
            var itemData = ListItemView.prototype.templateHelpers.call(this);
            itemData.draftDiscovery = this.draftDiscovery;
            return itemData;
        },
        onBeforeRender: function onBeforeRender() {
            if (this.draftDiscovery === false) {
                return;
            }
            $(document).on('click', '#draft-discovery-button', function () {
                FeatureDiscovery.forPlugin(pluginKey).markDiscovered(RECENTLY_WORKED_ON_DRAFTS);
                var dialog = $("#draft-discovery-dialog");
                dialog.remove();
            });
        },
        onDestroy: function onDestroy() {
            $("#draft-discovery-dialog").remove();
        }
    });
    module.exports = exports['default'];
});
define("confluence-dashboard/modules/list-item/list-item-discovery-view.js", function(){});

define('confluence-dashboard/core/content/content-as-grouped-list-discovery-view', ['module', 'exports', './content-as-grouped-list-view', '../../modules/list-item/list-item-discovery-view'], function (module, exports, _contentAsGroupedListView, _listItemDiscoveryView) {
    'use strict';

    var ContentAsGroupedListView = _interopRequireDefault(_contentAsGroupedListView).default;

    var ListItemDiscovery = _interopRequireDefault(_listItemDiscoveryView).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = ContentAsGroupedListView.extend({

        childViewOptions: {
            childView: ListItemDiscovery
        }

    });
    module.exports = exports['default'];
});
define('confluence-dashboard/core/content/content-as-stream-view', ['module', 'exports', '../shared/base-composite-view', 'confluence-dashboard/soy-templates', '../../behaviors/stickable/stickable', '../../behaviors/infinite-loading', '../../behaviors/progress-indicator', '../../behaviors/analytics-tracking', '../shared/no-content-view', '../shared/loading-view', '../shared/no-matches-view', '../../modules/stream-item/stream-item-view'], function (module, exports, _baseCompositeView, _soyTemplates, _stickable, _infiniteLoading, _progressIndicator, _analyticsTracking, _noContentView, _loadingView, _noMatchesView, _streamItemView) {
    'use strict';

    var BaseCompositeView = _interopRequireDefault(_baseCompositeView).default;

    var DashboardTemplates = _interopRequireDefault(_soyTemplates).default;

    var Stickable = _interopRequireDefault(_stickable).default;

    var InfiniteLoading = _interopRequireDefault(_infiniteLoading).default;

    var ProgressIndicator = _interopRequireDefault(_progressIndicator).default;

    var AnalyticsTracking = _interopRequireDefault(_analyticsTracking).default;

    var NoContentView = _interopRequireDefault(_noContentView).default;

    var LoadingView = _interopRequireDefault(_loadingView).default;

    var NoMatchesView = _interopRequireDefault(_noMatchesView).default;

    var StreamItemView = _interopRequireDefault(_streamItemView).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = BaseCompositeView.extend({
        template: DashboardTemplates.Content.streamList,
        childViewContainer: '.list-container',

        emptyView: NoContentView,
        loadingView: LoadingView,
        noMatchesView: NoMatchesView,
        childView: StreamItemView,

        behaviors: {
            // adds ios like appearance to the headers
            stickMainHeader: {
                behaviorClass: Stickable,
                element: '.content-header',
                autoRun: true
            },

            // progress indicator (spinner) based on the collection methods / response
            progressIndicator: {
                behaviorClass: ProgressIndicator,
                dataSource: 'collection',
                // once loadingView is embedded into groupedListWithFilter / streamList, the page gets two
                // 'spinner-container' elements so just take the first one
                container: '.spinner-container:first',
                size: 'medium'
            },

            infiniteLoading: {
                behaviorClass: InfiniteLoading,
                target: '.list-container'
            },

            analyticsTracking: {
                behaviorClass: AnalyticsTracking
            }
        }
    });
    module.exports = exports['default'];
});
define("confluence-dashboard/core/content/content-as-stream-view.js", function(){});

define('confluence-dashboard/core/content/content-controller', ['module', 'exports', '../../utils/event-manager', '../shared/scope-router', '../shared/base-controller'], function (module, exports, _eventManager, _scopeRouter, _baseController) {
    'use strict';

    var Commands = _eventManager.Commands;

    var ScopeRouter = _interopRequireDefault(_scopeRouter).default;

    var BaseController = _interopRequireDefault(_baseController).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = BaseController.extend({
        beforeAction: function beforeAction() {},
        afterAction: function afterAction() {
            Commands.execute('main-app:swapContent', this.view);
        },
        initialize: function initialize(options) {
            if (!options || !options.routes) {
                throw 'ContentController is missing its route';
            }

            this.wrapActions();

            this.router = new ScopeRouter({
                scopedRoutes: options.routes,
                scope: options.scope || '/',
                controller: this
            });
        }
    });
    module.exports = exports['default'];
});
define("confluence-dashboard/core/content/content-controller.js", function(){});

define('confluence-dashboard/behaviors/list-item-animated', ['module', 'exports', 'marionette', '../utils/event-manager', 'jquery'], function (module, exports, _marionette, _eventManager, _jquery) {
    'use strict';

    var View = _marionette.View;
    var Behavior = _marionette.Behavior;
    var EventManager = _eventManager.EventManager;

    var $ = _interopRequireDefault(_jquery).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    exports.default = Behavior.extend({
        initialize: function initialize() {
            this.overrideViewDestroyMethod();
        },
        onRender: function onRender() {
            this.$el.addClass('animated show');
        },
        overrideViewDestroyMethod: function overrideViewDestroyMethod() {
            var self = this;

            // override view's destroy method to wait for the animation
            this.view.destroy = function () {
                var _this = this,
                    _arguments = arguments;

                if (this.isDestroyed) {
                    return this;
                }

                var originalDestroy = View.prototype.destroy;
                var runAnimation = self.onBeforeDestroyWithAnimation();

                runAnimation.then(function () {
                    return originalDestroy.apply(_this, _arguments);
                }).fail(function () {
                    return originalDestroy.apply(_this, _arguments);
                });
            };

            // keep the scope bound to the view instance
            this.view.destroy.bind(this.view);
        },
        onBeforeDestroyWithAnimation: function onBeforeDestroyWithAnimation() {
            var _this2 = this;

            var defer = $.Deferred();

            var transitionEnd = 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend';

            // resolve promises on transition end
            this.view.$el.one(transitionEnd, function () {
                defer.resolve();
                EventManager.trigger('list:change', _this2.view);
            });

            // the class removing should be associated to an animation
            this.view.$el.removeClass('show').addClass('removing');

            // reject promise if nothing happen in 10 seconds
            setTimeout(function () {
                if (!defer.isResolved) {
                    defer.reject('time-out');
                }
            }, 10000);

            return defer.promise();
        }
    });
    module.exports = exports['default'];
});
define("confluence-dashboard/behaviors/list-item-animated.js", function(){});

define('confluence-dashboard/modules/stream-item/stream-item-view', ['module', 'exports', 'marionette', 'confluence-dashboard/soy-templates', 'confluence/hover-user'], function (module, exports, _marionette, _soyTemplates, _hoverUser) {
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
        template: DashboardTemplates.Stream.item,
        tagName: 'li',
        className: 'grouping',

        onDomRefresh: function onDomRefresh() {
            userHoverSetup();
        }
    });
    module.exports = exports['default'];
});
define("confluence-dashboard/modules/stream-item/stream-item-view.js", function(){});

define('confluence-dashboard/utils/ensure-component', ['module', 'exports', 'jquery'], function (module, exports, _jquery) {
    'use strict';

    var $ = _interopRequireDefault(_jquery).default;

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var executeUntilTrue = function executeUntilTrue(obj) {
        if (!obj.condition()) {
            setTimeout(function () {
                executeUntilTrue(obj);
            }, obj.interval);
        } else {
            obj.callback();
        }
    };

    var isResolved = function isResolved(component) {
        // The current version of skate on confluence uses __skate as class to identify that
        // the component has been resolved while new versions of skate are adding a resolved
        // attribute;
        return $(component).hasClass('__skate') || component.hasAttribute('resolved');
    };

    exports.default = function (component) {
        var interval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 200;

        var deferred = $.Deferred();

        if (isResolved(component)) {
            deferred.resolve();
        } else {

            executeUntilTrue({
                interval: interval,

                condition: function condition() {
                    return isResolved(component);
                },
                callback: function callback() {
                    deferred.resolve();
                }
            });
        }

        return deferred.promise();
    };

    module.exports = exports['default'];
});
define('confluence-dashboard/utils/module-starter', ['module', 'exports', './event-manager'], function (module, exports, _eventManager) {
    'use strict';

    var ReqRes = _eventManager.ReqRes;
    exports.default = {
        /**
         * Registers a callback to run after the app is started.
         * @param initMethod - The function to be called.
         */
        register: function register(initMethod) {
            var app = ReqRes.request('app');

            if (!(initMethod && typeof initMethod === 'function')) {
                throw 'ModuleStarter.register needs a function as callback';
            }

            if (!app) {
                throw 'ModuleStarter is being called before the app is available, please review your dependencies';
            }

            if (app.isStarted) {
                // if it' already started we start the module immediately
                initMethod();
            } else {
                // if not, we listen to the event that will be fired when it starts
                app.on('start', initMethod);
            }
        }
    };
    module.exports = exports['default'];
});

define("confluence-dashboard", function(){});

require(["confluence-dashboard/index"]);
