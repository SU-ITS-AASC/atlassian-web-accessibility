Confluence.Blueprint.setDirectCallback('com.atlassian.confluence.plugins.confluence-create-content-plugin:create-blog-post', function(e, state) {
    var createBlogPostUrl = Confluence.getContextPath() + "/pages/createblogpost.action?spaceKey=" + encodeURIComponent(state.spaceKey);

    if (state.initContext) {
        for (var key in state.initContext) {
            createBlogPostUrl += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(state.initContext[key]);
        }
    }

    state.finalUrl = createBlogPostUrl;
});