var OC = OC || {};

OC.Util = {
    // copy of underscore's new pair function in case we are running with an old version of underscore.
    pairs: function(obj) {
        var pairs = [];
        for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
        return pairs;
    },

    queryParams: function(data) {
        return _.map(this.pairs(data), function(pair) {
            return pair.join("=");
        }).join("&");
    },

    decodeUrl: function(str) {
        return decodeURIComponent(str.replace(/\+/g, '%20'));
    },

    /**
     * Retrieves the original image width and height without CSS affecting it. Only works if the image is already cached
     * (otherwise both attributes might be 0).
     *
     * @param img
     * @return {{width: Number, height: Number}}
     */
    imageDimensions: function(img) {
        if (img instanceof jQuery) {
            img = img[0];
        }

        var t = new Image();
        t.src = (img.getAttribute ? img.getAttribute("src") : false) || img.src;

        return {
            width: t.width,
            height: t.height
        }
    }
};

OC.Slide = Backbone.Model.extend({

    initialize: function() {
        this.set("selectedIndex", -1);
    },

    href: function(params) {
        var url = AJS.contextPath() + "/plugins/servlet/pptslide?";
        var queryParams = OC.Util.queryParams(params);

        return url + queryParams;
    },

    ready: function() {
        var params = {
            attachment: this.get("attachment"),
            attachmentId: this.get("attachmentId"),
            attachmentVer: this.get("attachmentVer"),
            pageId: this.get("pageId"),
            ready: true
        };

        var href = this.href(params);
        return AJS.$.ajax(href, {dataType: "json", cache: true});
    },

    /**
     * Query server if slides are ready. If they are not, continue querying until they are. When they are,
     * select the first slide which is then loaded.
     */
    waitUntilReady: function() {
        var self = this;
        this.ready().done(function(data) {
            self.set("numSlides", data.numSlides);
            self.set("selectedIndex", 0);
            self.trigger("ready");
        }).fail(function(jqXHR) {
            try {
                var error = AJS.$.parseJSON(jqXHR.responseText).error;
                if (error === "converting") {
                    // keep polling if still converting
                    // CONFDEV-17268: defer this call in order to avoid having FF loop forever
                    _.defer(_.bind(self.waitUntilReady, self));
                } else if (error != null) {
                    // unknown error
                    self.trigger("error", error);
                }
            }
            catch(e) {
                AJS.log("Error while parsing \"" + jqXHR.responseText + "\": " + e);
            }
        });
    },

    urlForSlide: function(index) {
        var params = {
            attachment: this.get("attachment"),
            attachmentId: this.get("attachmentId"),
            attachmentVer: this.get("attachmentVer"),
            pageId: this.get("pageId"),
            slide: index
        };

        return this.href(params);
    },

    aspectRatio: function() {
        return this.get("width") / this.get("height");
    },


    prev: function() {
        var index = this.get("selectedIndex") - 1;

        if (index < 0) {
            index = 0;
        }

        this.set("selectedIndex", index);
    },

    next: function() {
        var index = this.get("selectedIndex") + 1;

        if (index >= this.get("numSlides")) {
            index = this.get("numSlides") - 1;
        }

        this.set("selectedIndex", index);
    }
});

/**
 * Shows a preview of the slides.
 */
OC.PreviewView = Backbone.View.extend({
    template: OC.Templates.preview,
    className: "vf-preview",

    initialize: function(options) {
        this.slideCache = options.slideCache;
        this.model.on("preview:show", this.showPreview, this);
        this.model.on("preview:hide change:selectedIndex", this.hidePreview, this);
    },

    showPreview: function(model, index) {
        if (index === this.previewIndex) {
            return;
        }

        this.previewIndex = index;
        this.updateDescription(index);
        this.$el.fadeIn(300);
        this.$(".vf-slide-loading").fadeIn(300);

        var self = this;
        this.slideCache.getView(index, function(index, el) {
            // only update the view if we are still previewing this slide
            if (index === self.previewIndex) {
                self.$(".vf-preview-image").html(el);
                self.$(".vf-slide-loading").stop().fadeOut(300);
            }
        });
    },

    updateDescription: function(index) {
        var text = AJS.I18n.getText("com.atlassian.confluence.extra.officeconnector.slideviewer.slidepreview", index + 1, this.model.get("numSlides"));
        this.$("p").html(text);
    },

    hidePreview: function(model, index) {
        this.previewIndex = index;
        this.$el.fadeOut(300);
    },

    render: function() {
        this.$el.html(this.template());
        this.$el.hide();

        // set correct aspect ratio for preview image
        var ratio = this.model.aspectRatio();
        this.$(".vf-preview-image").css({
            width: "200px",
            height: (200 / ratio) + "px"
        });

        var $load = this.$(".vf-slide-loading");
        $load.spin('large');

        return this;
    }
});

/**
 * Renders a single slide.
 */
OC.SlideView = Backbone.View.extend({
    template: OC.Templates.slide,
    className: "vf-slide",

    initialize: function(options) {
        this.href = options.href;
    },

    /**
     * Sets the src attribute of the templates image tag and listens to the load event when the image is ready.
     * It is possible that the slide has not been converted yet on the server and therefore the load will never fire.
     * Therefore we try to load the image again after a short timeout if the event hasn't fired yet.
     *
     * @param $img
     */
    load: function($img) {
        var self = this;
        var ready = false;
        var retryCount = 0;

        function setReady() {
            ready = true;
            self.trigger("ready", self.el);
        }

        (function loadImage() {
            $img.load(setReady).attr("src", self.href);

            setTimeout(function () {
                if (!ready && retryCount < 2) {
                    loadImage();
                    retryCount++;
                } else {
                    // load event didnt fire after 2 retries, trigger ready with possible broken image. don't want to
                    // leave the user waiting forever.
                    setReady();
                }
            }, 1500)
        }());

    },

    render: function() {
        this.$el.html(this.template());

        var $img = this.$(".vf-slide-image");
        this.load($img);

        return this;
    }
});

/**
 * Toolbar controls.
 */
OC.ControlView = Backbone.View.extend({
    template: OC.Templates.controls,
    className: "vf-controls",

    events: {
        "click .prev": "prev",
        "click .next": "next",
        "click .enter.fs": "enterFullscreen",
        "click .leave.fs": "leaveFullscreen",
    },

    initialize: function(options) {
        _.bindAll(this, 'render', 'prev', 'next', 'enterFullscreen', 'leaveFullscreen',
            'onEnterFullscreen', 'onLeaveFullscreen', 'keyboardHandler', 'delegateEvents', 'undelegateEvents');

        this.fullscreenViewer = options.fullscreenViewer;
        this.fullscreenViewer.on("leaveFullscreen", this.onLeaveFullscreen);
        this.fullscreenViewer.on("enterFullscreen", this.onEnterFullscreen);
    },

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));

        // wait until first slide is ready until activating controls
        this.undelegateEvents();
        this.model.on("ready", this.delegateEvents);

        var $placeHolder = this.$el.find('.companion-edit-button-placeholder');
        var embeddedInitializer = require('cp/component/companion/embedded-edit-with');
        if (embeddedInitializer && embeddedInitializer.loadEditButton && $placeHolder.length) {
            embeddedInitializer.loadEditButton($placeHolder).then(function(companionMainView) {
                AJS.trigger('oc-slideviewer-embedded-edit-button-loaded', companionMainView);
            }, function (err) {
                AJS.debug(err)
            });
        }

        return this;
    },

    prev: function() {
        this.model.prev();
    },

    next: function() {
        this.model.next();
    },

    enterFullscreen: function() {
        this.fullscreenViewer.enterFullscreen();
    },

    leaveFullscreen: function() {
        this.fullscreenViewer.leaveFullscreen();
    },

    onEnterFullscreen: function() {
        this.$(".fs").removeClass("enter").addClass("leave");
        this.$(".fs .aui-icon").removeClass("vf-icon-enter-fullscreen").addClass("vf-icon-leave-fullscreen");
        this.$(".prev .aui-icon").removeClass("vf-icon-prev").addClass("vf-icon-prev-fs");
        this.$(".next .aui-icon").removeClass("vf-icon-next").addClass("vf-icon-next-fs");
        this.$(".download, .edit").hide();

        AJS.$(document).on("keydown.vf-keyboard", _.bind(this.keyboardHandler, this));
    },

    onLeaveFullscreen: function() {
        this.$(".fs").removeClass("leave").addClass("enter");
        this.$(".fs .aui-icon").removeClass("vf-icon-leave-fullscreen").addClass("vf-icon-enter-fullscreen");
        this.$(".prev .aui-icon").removeClass("vf-icon-prev-fs").addClass("vf-icon-prev");
        this.$(".next .aui-icon").removeClass("vf-icon-next-fs").addClass("vf-icon-next");
        this.$(".download, .edit").show();

        AJS.$(document).off("keydown.vf-keyboard");
    },

    keyboardHandler: function(e) {
        switch (e.which) {
            case 37:
                this.prev();
                break;
            case 39:
                this.next();
                break;
            case 27:
                this.fullscreenViewer.leaveFullscreen();
                break;
        }

        e.preventDefault();
        e.stopPropagation();
    }
});

/**
 * Component responsible for putting the viewer into and out of fullscreen. Scales the slide to its max size.
 * @param viewer
 * @param model
 * @constructor
 */
OC.FullscreenViewer = function(viewer, model) {
    this.viewer = viewer;
    this.model = model;
    _.bindAll(this, 'leaveFullscreen', 'enterFullscreen', 'changeFullscreen', 'setLayout',
        'showFullscreen', 'hideFullscreen');

    AJS.$(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange', _.bind(function() {
       setTimeout(this.changeFullscreen, 100);
    }, this));
};
_.extend(OC.FullscreenViewer.prototype, Backbone.Events);

/**
 * Browser agnostic way of leaving full screen mode.
 */
OC.FullscreenViewer.prototype.leaveFullscreen = function() {
    if (document.cancelFullScreen) {
        document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
    } else {
        // ie
        this.viewer.$el.removeClass("ie");
        AJS.$("html").css("overflow", "");
        this.hideFullscreen();
    }
};

/**
 * Browser agnostic way of entering full screen.
 */
OC.FullscreenViewer.prototype.enterFullscreen = function() {
    var elem = this.viewer.el;

    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else {
        // ie
        this.viewer.$el.addClass("ie")
        AJS.$("html").css("overflow", "hidden"); // hide scrollbars
        this.showFullscreen();
    }

    this.viewer.on("show:slide", this.setLayout, this);
};

/**
 * Toggle full screen mode.
 */
OC.FullscreenViewer.prototype.changeFullscreen = function() {
    var fsElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement;

    if (fsElement) {
        this.showFullscreen();
    } else {
        this.hideFullscreen();
    }
};

/**
 * Set the correct layout for the slide-outer container to have the image stretch correctly in fullscreen mode. Since
 * the image aspect ratio can change in pdfs from slide to slide we have to do this calculation every time the slide
 * changes.
 *
 * @param img
 */
OC.FullscreenViewer.prototype.setLayout = function(img) {
    var toolbar = this.viewer.$(".vf-toolbar");

    var winWidth = AJS.$(window).width();
    var winHeight = AJS.$(window).height() - toolbar.height();
    var winRatio = winWidth / winHeight;

    var dim = OC.Util.imageDimensions(img);
    var imgRatio = dim.width / dim.height;

    var orientation = imgRatio > winRatio ? "wide" : "narrow";

    var slideOuter = this.viewer.$(".vf-slide-outer");
    slideOuter.css({
        width: "auto",
        height: winHeight + "px"
    }).removeClass("narrow wide").addClass(orientation);
};

/**
 * Show the full screen view.
 */
OC.FullscreenViewer.prototype.showFullscreen = function() {
    this.viewer.$el.addClass("vf-fullscreen");
    this.setLayout(this.viewer.getSlideImage());
    this.trigger("enterFullscreen");
};

/**
 * Hide the fullscreen view.
 */
OC.FullscreenViewer.prototype.hideFullscreen = function() {
    this.viewer.$el.removeClass("vf-fullscreen");

    this.viewer.$(".vf-slide-outer").css({
        width: this.model.get("width"),
        height: this.model.get("height")
    }).removeClass("narrow wide");

    this.viewer.off("show:slide");
    this.trigger("leaveFullscreen");
};


OC.ProgressView = Backbone.View.extend({
    template: OC.Templates.progress,
    className: "vf-progress",
    events: {
        "mousedown .vf-progress-wrapper": "onMousedown",
        "mousemove .vf-progress-wrapper": "showPreview",
        "mouseleave .vf-progress-wrapper": "hidePreview"
    },

    initialize: function() {
        _.bindAll(this, 'updateStatus', 'render', 'showPreview', 'hidePreview', 'onMousedown',
            'getSlideIndex', 'selectSlide', 'delegateEvents', 'undelegateEvents');

        this.model.on("change:selectedIndex", this.updateStatus);
        this.futurePreview = null;
    },

    updateStatus: function() {
        var width = (100 / this.model.get("numSlides")) * (this.model.get("selectedIndex") + 1) ;
        this.$(".vf-progress-indicator").css("width", width + "%");
    },

    render: function() {
        this.$el.html(this.template());

        // wait until first slide is ready until activating controls
        this.undelegateEvents();
        this.model.on("ready", this.delegateEvents);

        return this;
    },

    /**
     * Show preview after not moving the mouse for 300ms.
     * @param e
     */
    showPreview: function(e) {
        clearTimeout(this.futurePreview);

        this.futurePreview = setTimeout(_.bind(function () {
            var slideIndex = this.getSlideIndex(e);
            this.model.trigger("preview:show", this.model, slideIndex);
        }, this), 300);
    },

    hidePreview: function(e) {
        clearTimeout(this.futurePreview);

        this.model.trigger("preview:hide", this.model);
    },

    onMousedown: function(e) {
        this.selectSlide(e);
    },

    getSlideIndex: function (e) {
        var offsetX = e.pageX - this.$el.offset().left;
        var numSlides = this.model.get("numSlides");
        var width = this.$el.width();
        var slideIndex = Math.floor(offsetX / (width / numSlides));
        return slideIndex;
    },

    selectSlide: function(e) {
        var slideIndex = this.getSlideIndex(e);
        this.model.set("selectedIndex", slideIndex);
    }
});

/**
 * Component that preloads and caches all slide views.
 *
 *
 * @param model
 * @constructor
 */
OC.SlideCache = function(model) {
    var cache = {};
    var PRELOAD_COUNT = 2;

    /**
     * For every slide change we query the next PRELOAD_COUNT slides and preload them.
     *
     * @param model
     * @param index
     */
    this.preload = function(model, index) {
        var numSlides = model.get("numSlides");
        _.times(PRELOAD_COUNT, function(i) {
            if (index + i < numSlides) {
                // just warm the cache by retrieving the view
                this.getView(index + i);
            }
        }, this);
    };

    /**
     * Retrieve the rendered element of a SlideView for the given slide index.
     *
     * If the view has not been retrieved yet we will fetch it async and call any callback registered
     * with this slide index when the image is ready.
     *
     * If the view is already cached the callback will be called immediately.
     *
     * @param index
     * @param callback
     * @return {*}
     */
    this.getView = function(index, callback) {
        if (!cache[index] || cache[index].status !== "loaded") {
            var entry = cache[index] || (cache[index] = {});
            var callbacks = entry.callbacks || (entry.callbacks = []);
            callback && callbacks.push(callback);

            if (entry.status !== "loading") {
                entry.status = "loading";

                var slideView = new OC.SlideView({href: model.urlForSlide(index)});
                slideView.on("ready", function (el) {
                    entry.status = "loaded";
                    entry.getElement = function () {
                        return AJS.$(el).clone();
                    };

                    // execute and delete callbacks
                    _.each(callbacks, function (callback) {
                        callback.call(callback, index, entry.getElement());
                    });
                    callbacks.length = 0;
                });
                slideView.render();
            }
        } else {
            callback && callback.call(callback, index, cache[index].getElement());
        }
    };

    // listen to the changes on the model for the current index to change
    model.on("change:selectedIndex", this.preload, this);
};

OC.SlideViewerView = Backbone.View.extend({

    initialize: function(options) {
        _.bindAll(this, 'showError', 'selectSlide', 'render', 'getSlideImage');

        this.loadingSlide = options.loadingSlide;
        this.slideCache = options.cache;
        this.model.on("change:selectedIndex", this.selectSlide);
        this.model.on("error", this.showError);
    },

    showError: function(error) {
        this.$(".vf-error").html(error);
    },

    selectSlide: function(model, index) {
        var loadingSlide = this.$(".vf-slide-loading").first();
        loadingSlide.fadeIn(900);

        this.slideCache.getView(index, _.bind(function(index, el) {
            // only update the view if we are still on this selected slide
            if (index === this.model.get("selectedIndex")) {
                this.$(".vf-slide-outer").html(el);

                // fade out deferred for smoother transition between browser-cached slides
                setTimeout(_.bind(function () {
                    loadingSlide.stop().fadeOut(300, function () {
                        // for some reason the fadeOut is interrupted when the viewer is placed in the attachments macro.
                        // hide manually.
                        loadingSlide.hide();
                    });

                    this.trigger("show:slide", this.getSlideImage());
                }, this), 10);
            }
        }, this));
    },

    render: function() {
        this.$(".vf-preview-placeholder").replaceWith(new OC.PreviewView({model: this.model, slideCache: this.slideCache}).render().el);
        this.$(".vf-progress-placeholder").replaceWith(new OC.ProgressView({model: this.model}).render().el);

        var fullscreenViewer = new OC.FullscreenViewer(this, this.model);
        this.$(".vf-controls-placeholder").replaceWith(new OC.ControlView({model: this.model, fullscreenViewer: fullscreenViewer}).render().el);
        return this;
    },

    getSlideImage: function() {
        return this.$(".vf-slide-outer .vf-slide-image");
    }
});

AJS.$(function() {
    AJS.$(".vf-slide-viewer-macro").each(function () {
        // initialize each pdf viewer
        var $this = AJS.$(this);
        var $el = $this.find(".vf-slide-viewer");
        var $load = $this.find(".vf-slide-loading");

        // loading indicator
        $load.spin('large');

        var data = {
            width: $this.data("width"),
            height: $this.data("height"),
            attachment: $this.data("attachment"),
            attachmentId: $this.data("attachment-id"),
            attachmentVer: $this.data("attachment-ver"),
            pageId: $this.data("page-id"),
            downloadPath: AJS.contextPath() + $this.data("download-path"),
            usePathAuth: $this.data("use-path-auth"),
            editUrl: AJS.contextPath() + OC.Util.decodeUrl($this.data("edit-url")),
            allowEdit: $this.data("allow-edit")
        };

        var slide = new OC.Slide(data);
        var slideCache = new OC.SlideCache(slide);

        var view = new OC.SlideViewerView({model: slide, cache: slideCache, el: $el});
        $this.append(view.render().el);

        // fetch first slide
        slide.waitUntilReady();
    });
});