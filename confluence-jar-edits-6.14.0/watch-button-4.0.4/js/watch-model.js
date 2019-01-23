define('confluence-watch-button/watch-model', [
    'ajs',
    'backbone'
], function (
    AJS,
    Backbone
) {
    return Backbone.Model.extend({

        saveSettings: function(url, watching, watchType) {
            this.trigger("request");
            var self = this;
            return AJS.safe.ajax({
                url: url,
                type: watching ? "POST" : "DELETE",
                contentType: "application/json",
                dataType: "json",
                data: {}
            }).done(function() {
                self.set(watchType, watching);
                self.trigger("sync", self);
            }).fail(function() {
                self.trigger("error");
            });
        },

        saveWatchPage: function(watching) {
            var url = AJS.contextPath() + "/rest/api/user/watch/content/" + this.get("pageId");
            return this.saveSettings(url, watching, "watchingPage");
        },

        saveWatchBlogs: function(watching) {
            var url = AJS.contextPath() + "/rest/api/user/watch/space/" + this.get("spaceKey") + "?contentType=blogpost";
            return this.saveSettings(url, watching, "watchingBlogs");
        },

        saveWatchSpace: function(watching) {
            var url = AJS.contextPath() + "/rest/api/user/watch/space/" + this.get("spaceKey");
            return this.saveSettings(url, watching, "watchingSpace");
        }
    });
});