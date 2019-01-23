AJS.toInit(function () {
    AJS.$(".toc-macro a").click(function() {
        AJS.trigger('analyticsEvent', {name: 'confluence.toc-macro.heading-click'});
    });
});