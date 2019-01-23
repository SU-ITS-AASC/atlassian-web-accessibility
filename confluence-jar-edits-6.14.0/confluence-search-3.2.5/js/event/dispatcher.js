define('confluence-search/event/dispatcher', [
    'underscore',
    'backbone'
], function(
    _,
    Backbone
) {
    return _.clone(Backbone.Events);
});