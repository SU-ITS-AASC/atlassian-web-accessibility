define('confluence-watch-button/watch-view', [
    'jquery',
    'ajs',
    'underscore',
    'backbone',
    'confluence/flag'
], function (
    $,
    AJS,
    _,
    Backbone,
    Flag
) {
    return Backbone.View.extend({
        events: {
            "change #cw-watch-page": "changeWatchPage",
            "change #cw-watch-blogs": "changeWatchBlogs",
            "change #cw-watch-space": "changeWatchSpace"
        },

        initialize: function() {
            _.bindAll(this, 'render', 'initTooltips', 'changeWatchPage', 'changeWatchBlogs', 
                'changeWatchSpace', 'togglePageEnabledState', 'toggleBlogsEnabledState', 
                'startLoading', 'stopLoading', 'setTitle', '_restoreCheckboxState', '_disableAllElements', '_rememberLastState', '_revertToLastState');
            this.model.on("sync change:watchingSpace", this.togglePageEnabledState, this);
            this.model.on("change:watchingSpace", this.toggleBlogsEnabledState, this);

            this.model.on("request", this.startLoading, this);
            this.model.on("sync", this.setTitle, this);
            this.model.on("sync", this.stopLoading, this);
            this.model.on("sync", this._restoreCheckboxState, this);
            this.model.on("error", this._revertToLastState, this);
        },

        render: function() {
            this.$el.html(Confluence.Watch.Templates.dialogBody(this.model.toJSON()));
            this.initTooltips();
            this.setTitle(this.model);
            if (AJS.Meta.get("access-mode") === "READ_ONLY") {
                this._disableAllElements();
            }

            return this;
        },
        _revertToLastState: function() {
            var watchingPage = this.currentModel.get("watchingPage");
            var watchingSpace = this.currentModel.get("watchingSpace");
            var watchingBlogs = this.currentModel.get("watchingBlogs");

            var $watchPageCheckBox = this.$("#cw-watch-page");
            $watchPageCheckBox.prop("checked", watchingPage || watchingSpace);
            $watchPageCheckBox.prop("disabled", this.currentModel.get("watchPageDisabled"));

            var $watchSpaceCheckbox = this.$("#cw-watch-space");
            $watchSpaceCheckbox.prop("checked", watchingSpace);
            $watchSpaceCheckbox.prop("disabled", this.currentModel.get("watchSpaceDisabled"));

            var $watchBlogsCheckBox = this.$("#cw-watch-blogs");

            $watchBlogsCheckBox.prop("checked", watchingBlogs);
            $watchBlogsCheckBox.prop("disabled", this.currentModel.get("watchBlogsDisabled"));
            this.$(".cw-manage-watchers").removeClass("disabled");

            this.model.set("watchingPage", watchingPage);
            this.model.set("watchingBlogs", watchingBlogs);
            this.model.set("watchingSpace", watchingSpace);

            this.stopLoading();
            var flagDefaults = {
                close: 'manual',
                type: 'error',
                extraClasses: 'confluence-menu-flag',
                fifo: true,
                stack: 'menu'
            };
            this.errorFlag = new Flag($.extend({}, flagDefaults, {
                body: AJS.I18n.getText('read.only.mode.default.error.short.message')
            }));
        },
        _rememberLastState: function() {
            if (!!this.errorFlag) {
                this.errorFlag.close();
            }
            this.currentModel = this.model.clone();
            this.currentModel.set("watchPageDisabled", this.$("#cw-watch-page").prop("disabled"));
            this.currentModel.set("watchSpaceDisabled", this.$("#cw-watch-space").prop("disabled"));
            this.currentModel.set("watchBlogsDisabled", this.$("#cw-watch-blogs").prop("disabled"));
            this.$targetCheckbox.prop("disabled", true);
        },
        _disableAllElements: function() {
            this.$("input[type='checkbox']").prop("disabled", true);
            this.$(".cw-manage-watchers").addClass("disabled");
        },

        _restoreCheckboxState: function() {
            this.$targetCheckbox.prop("disabled", false);
        },

        initTooltips: function() {
            this.$(".cw-tooltip").tooltip({
                gravity: 'e',
                offset: 5,
                delayIn: 0
            });
            this.togglePageEnabledState(this.model);
            this.toggleBlogsEnabledState(this.model);
        },

        changeWatchPage: function (e) {
            this.$targetCheckbox = $(e.target);
            this._rememberLastState();
            var checked = this.$targetCheckbox.is(":checked");
            this.model.saveWatchPage(checked);
        },

        changeWatchBlogs: function (e) {
            this.$targetCheckbox = $(e.target);
            this._rememberLastState();
            var checked = this.$targetCheckbox.is(":checked");
            this.model.saveWatchBlogs(checked);
        },

        changeWatchSpace: function (e) {
            this.$targetCheckbox = $(e.target);
            this._rememberLastState();
            var checked = this.$targetCheckbox.is(":checked");
            this.model.saveWatchSpace(checked);
        },

        togglePageEnabledState: function(model) {
            var watchingPage    = model.get("watchingPage");
            var watchingSpace   = model.get("watchingSpace");

            // set disabled state
            this.$("#cw-watch-page").prop("disabled", watchingSpace);

            // fake check watch page when space is watched
            this.$("#cw-watch-page").prop("checked", watchingPage || watchingSpace);

            // set or reset tooltip depending when we watch a space
            var tooltip = watchingSpace ? AJS.I18n.getText("confluence.watch.disabledpage.tooltip") : "";
            this.$(".cw-tooltip-watch-page").attr("original-title", tooltip);
        },

        toggleBlogsEnabledState: function(model) {
            var watchingBlogs = model.get("watchingBlogs");
            var watchingSpace = model.get("watchingSpace");

            // set disabled state
            this.$("#cw-watch-blogs").prop("disabled", watchingSpace);

            // fake check watch blogs when space is watched
            this.$("#cw-watch-blogs").prop("checked", watchingBlogs || watchingSpace);

            // set tooltip
            var tooltip = watchingSpace ? AJS.I18n.getText("confluence.watch.disabledblogs.tooltip") : "";
            this.$(".cw-tooltip-watch-blogs").attr("original-title", tooltip);
        },

        startLoading: function() {
            this.$(".cw-status").addClass("loading");
        },

        stopLoading: function() {
            this.$(".cw-status").removeClass("loading");
        },

        /**
         * Sets the view's title according to what is being watched.
         */
        setTitle: function() {
            var watchingPage    = this.model.get("watchingPage");
            var watchingBlogs   = this.model.get("watchingBlogs");
            var watchingSpace   = this.model.get("watchingSpace");
            var isBlogPost      = this.model.get("isBlogPost");

            /**
             * Returns the title and description depending on which combination of watch status we have. This is a bit
             * verbose but if we want to make use of the i18n transformer then we have to spell out the whole i18n key
             * and can't build it "cleverly". We used to do that before but that comes with the cost of an extra XHR
             * request to get the i18n strings to the client.
             *
             */
            function getTitleAndDescription() {
                if (watchingSpace) {
                    return {
                        title: AJS.I18n.getText("confluence.watch.title.watching.space"),
                        description: AJS.I18n.getText("confluence.watch.title.watching.space.description"),
                    };
                }
                if (watchingPage && isBlogPost && watchingBlogs) {
                    return {
                        title: AJS.I18n.getText("confluence.watch.title.watching.blog.and.blogs"),
                        description: AJS.I18n.getText("confluence.watch.title.watching.blog.and.blogs.description"),
                    };
                }
                if (watchingPage && isBlogPost) {
                    return {
                        title: AJS.I18n.getText("confluence.watch.title.watching.blog"),
                        description: AJS.I18n.getText("confluence.watch.title.watching.blog.description"),
                    };
                }
                if (watchingPage) {
                    return {
                        title: AJS.I18n.getText("confluence.watch.title.watching.page"),
                        description: AJS.I18n.getText("confluence.watch.title.watching.page.description"),
                    };
                }
                if (isBlogPost && watchingBlogs) {
                    return {
                        title: AJS.I18n.getText("confluence.watch.title.watching.blogs"),
                        description: AJS.I18n.getText("confluence.watch.title.watching.blogs.description"),
                    };
                }
                if (isBlogPost) {
                    return {
                        title: AJS.I18n.getText("confluence.watch.title.watching.nothing.blog"),
                        description: AJS.I18n.getText("confluence.watch.title.watching.nothing.blog.description"),
                    };
                }

                return {
                    title: AJS.I18n.getText("confluence.watch.title.watching.nothing.page"),
                    description: AJS.I18n.getText("confluence.watch.title.watching.nothing.page.description"),
                };
            }

            var i18n = getTitleAndDescription();
            this.$(".cw-title").text(i18n.title);
            this.$(".cw-title-description").text(i18n.description);
        }
    });
});