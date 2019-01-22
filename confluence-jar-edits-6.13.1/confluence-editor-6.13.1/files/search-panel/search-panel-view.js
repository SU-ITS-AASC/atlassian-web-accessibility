/**
 * @module confluence-editor/files/search-panel/search-panel-view
 */
define('confluence-editor/files/search-panel/search-panel-view', [
    'confluence-editor/files/file-item/file-item-model',
    'confluence-editor/files/file-list/file-list-view',
    'confluence-editor/files/file-list/file-list-collection',
    'confluence-editor/files/base-panel/base-panel-view',
    'confluence/templates',
    'confluence/meta',
    'confluence/defaults',
    'confluence/highlighter',
    'confluence/api/constants',
    'underscore',
    'ajs',
    'jquery'
], function(
    FileItemModel,
    FileListView,
    FileListCollection,
    BasePanel,
    Templates,
    Meta,
    Defaults,
    Highlighter,
    CONSTANTS,
    _,
    AJS,
    $
) {
    "use strict";

    var SearchPanelView = BasePanel.extend({
        id: "search",
        panelId: "",
        cssPanel: ".search-panel",
        cssContainer: "#searched-images",

        template: Templates.File.searchPanel,

        events: {
            "submit form": "_submit"
        },

        initialize: function () {
            BasePanel.prototype.initialize.call(this);

            //context will be assigned a value in 'createPanel' method
            this.context = null;
            this.collection = new FileListCollection();
            this.fileListView = new FileListView({
                collection: this.collection
            });
        },

        getPanel: function() {
            this.$el = $(this.template({
                spaceKey: Meta.get("space-key"),
                spaceName: Meta.get("space-name")
            }));
            this.el = this.$el[0];

            this.delegateEvents();

            return this.el;
        },

        render: function () {
            this.fileListView.updateDialogContext(this.context);
            this.panelId = this.context.addPanel(
                    AJS.I18n.getText("file.browser.search.title"),
                    this.getPanel(),
                    "search-panel");

            //should call updatePanelContext when we have ready 'this.el'
            this.fileListView.updatePanelContext({
                fileContainer: this.getContainer(),
                noFileMessage: AJS.I18n.getText("image.browser.search.no.attachments"),
                showContainerInfo: true
            });
        },

        _submit: function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (this._getQuery()) {
                this.clearContainer();
                this.collection.reset();
                this._loadImages()
                        .then(
                        _.bind(this._onSuccessLoadFiles, this),
                        _.bind(this._onErrorLoadFiles, this));
            }
        },

        _loadImages: function() {
            var spaceKey = this.getForm().find('.search-space').val();
            var searchQuery = this._getQuery();
            var cql = '(title ~ "' + searchQuery + '*" OR parent.title ~ "' + searchQuery + '*") AND type = attachment';
            if (spaceKey && spaceKey !== '') {
                cql += ' AND space.key = ' + spaceKey;
            }
            return $.ajax({
                type: "GET",
                dataType: "json",
                url: CONSTANTS.CONTEXT_PATH + '/rest/api/search',
                data: {
                    cql: cql,
                    expand: 'content.version,content.container,content.space',
                    limit: Defaults.maxResults
                }
            });
        },

        _onSuccessLoadFiles: function (json) {
            var files = json.results.map(function(item) {
                return item.content;
            });
            this.fileListView.highlighter = new Highlighter(this._getQuery().split(" "));
            this.fileListView.resetFileList(files, {shouldClearSelection: true});
        },

        _onErrorLoadFiles: function () {
            var searchContainer = this.getContainer();
            searchContainer.find(".loading-message").addClass("hidden");
            searchContainer.append($("<p class='warning'>" + $(this.textErrorSearch).text() +"</p>"));
        },

        _getSearchText: function() {
            return $("input.search-image-text", this.getForm());
        },

        _getQuery: function() {
            return this._getSearchText().val() || "";
        },

        focus: function() {
            this.collection.clearSelection();
            this._getSearchText().focus();
        }
    });

    return SearchPanelView;
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/files/search-panel/search-panel-view', 'Confluence.Editor.FileDialog.SearchPanelView');
