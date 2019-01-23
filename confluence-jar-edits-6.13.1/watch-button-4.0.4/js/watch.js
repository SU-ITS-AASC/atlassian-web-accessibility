require([
    'jquery',
    'underscore',
    'ajs',
    'confluence-watch-button/watch-model',
    'confluence-watch-button/watch-view',
    'confluence-watch-button/watch-notification'
], function (
    $,
    _,
    AJS,
    WatchModel,
    WatchView,
    watchNotification
) {
    // MAIN
    AJS.toInit(function () {
        // bootstrap params
        var $trigger = $("#watch-content-button");
        if (!$trigger.length) {
            // if there is no watch button on the page, abort.
            return;
        }
        // disable clicks on the watch button before we have a chance to handle it properly
        $trigger.click(function(e) {
            e.preventDefault();
            $('#watch-title').focus();
        });
        $trigger.keyup(function(e) {
            if (event.keyCode === 13) {
                $(this).click();
            }
        });

        var pageId = AJS.Meta.get("page-id");

        $.getJSON(AJS.contextPath() + "/rest/watch-button/1.0/watchState/" + pageId, function(data) {
            _.extend(data, {
                pageId: pageId,
                spaceKey: AJS.Meta.get("space-key"),
                spaceName: AJS.Meta.get("space-name")
            });

            configureButtonAndDialog($trigger, data);

            // this gives the pageobjects a hook to wait for before they try to interact with the button
            $trigger.addClass('watch-state-initialised');
        })
    });

    function configureButtonAndDialog($trigger, params) {
        // set initial state of the watch icon
        setWatchIcon($trigger, params);

        // init backbone
        var watchModel = new WatchModel(params);
        var watchView = new WatchView({model: watchModel});

        // wire up dialog
        AJS.InlineDialog($trigger, "confluence-watch", function(content, trigger, showPopup) {
            watchView.setElement(content);
            watchView.render();
            showPopup();
        }, {
            width: 325,
            offsetX: -180,
            cacheContent: false,
            hideDelay: null,
            hideCallback: function() {
                // hide all stuck tooltips (happens on disabled elements sometimes)
                $(".tipsy").hide();
            }
        });

        // change icon state when model changes
        watchModel.on("change:watchingPage change:watchingBlogs change:watchingSpace", function (model) {
            setWatchIcon($trigger, model.toJSON());
        });

        watchModel.on("change:watchingPage", function (model, watching) {
            var event = watching ? "watch-page" : "unwatch-page";
            AJS.trigger("analytics", {name: event});
        });

        watchModel.on("change:watchingBlogs", function (model, watching) {
            var event = watching ? "watch-blogs" : "unwatch-blogs";
            AJS.trigger("analytics", {name: event});
        });

        watchModel.on("change:watchingSpace", function (model, watching) {
            var event = watching ? "watch-space" : "unwatch-space";
            AJS.trigger("analytics", {name: event});
        });

        triggerPageOperationEventOnWatch(watchModel);

        // keyboard shortcut trigger
        // Have the keyPressed flag to avoid triggering watch when holding down the W key
        // the atlassian keyboard library uses the 'keypress' event and it's triggered constantly when holding down a key
        var keyPressed = false;
        $(document).on("keyup", function () {
            keyPressed = false;
        });
        window.CW_watchPage = function() {
            if (keyPressed) {
                return;
            }
            keyPressed = true;

            var watchingSpace = watchModel.get("watchingSpace");
            var watchingPage = watchModel.get("watchingPage");

            if (watchingSpace) {
                // scroll to top, open dialog and show tooltip
                // (#splitter-content is for scrolling in doc-theme)
                $("body, #splitter-content").animate({scrollTop: 0}, 300, function() {
                    $trigger.click();
                    setTimeout(function () {
                        $(".cw-tooltip-watch-page").tipsy("show");
                    }, 50);
                });
            } else {
                var newWatchState = !watchingPage;
                watchModel.saveWatchPage(newWatchState);
                var message = newWatchState
                        ? AJS.I18n.getText("confluence.watch.notification.start.watching.page")
                        : AJS.I18n.getText("confluence.watch.notification.stop.watching.page");
                watchNotification(message);
            }
        };
    }

    /**
     * Shows the 'watching' icon when the user watches this page directly or indirectly through blogs/space.
     *
     * @param $trigger
     * @param params
     */
    function setWatchIcon($trigger, params) {
        var watchingPage = params.watchingPage;
        var isBlogAndWatchingAllBlogs = params.isBlogPost && params.watchingBlogs;
        var watchingSpace = params.watchingSpace;


        if (watchingPage || isBlogAndWatchingAllBlogs || watchingSpace) {
            var $icon = $trigger.find('.aui-icon').removeClass("aui-iconfont-unwatch").addClass("aui-iconfont-watch");
            var stopButtonText = AJS.I18n.getText("confluence.watch.stop.button", "<u>","</u>");
            $trigger.prop('title', AJS.I18n.getText("confluence.watch.stop.button.tooltip"))
                    .children('span').empty().append($icon).append(" " + stopButtonText);
        } else {
            var $icon = $trigger.find('.aui-icon').removeClass("aui-iconfont-watch").addClass("aui-iconfont-unwatch");
            var startButtonText = AJS.I18n.getText("confluence.watch.start.button", "<u>","</u>");
            $trigger.prop('title', AJS.I18n.getText("confluence.watch.start.button.tooltip"))
                    .children('span').empty().append($icon).append(" " + startButtonText);
        }
    }

    /**
     * When we watch/unwatch a page trigger an event over AJS that the editor listens to, as in the old menu implementation.
     *
     * This event toggles the 'watch this page' checkbox in the editor.
     *
     * @param model
     */
    function triggerPageOperationEventOnWatch(model) {
        model.on("change:watchingPage", function (model, watching) {
            var event = watching ? "watchpage.pageoperation" : "unwatchpage.pageoperation";
            AJS.trigger(event);
        });
    }

});