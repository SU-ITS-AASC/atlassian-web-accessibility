/**
 * @module confluence-editor/event/tinymce-event-delegator
 */
define('confluence-editor/event/tinymce-event-delegator', [
], function(
) {
    "use strict";
    //TODO: this needs a better data structure, not happy with the two loops in the eventHandler.
    //i think i might sacrifice creation time for event speed and unpack the component events a little bit.
    //

    //Window exists so we can parse in a test window, or even the editor window if we really want to

    return function(ed) {

        var eventRegister = {};
        var boundEvents = {};
        var eventHandler = function(ed,e) {
            var eventType;
            var event;
            for(event in eventRegister) {
                if(eventRegister.hasOwnProperty(event) &&  eventRegister[event].isEnabled) {
                    for (var i = 0, ii = eventRegister[event].events.length; i < ii; i++) {
                        eventType = eventRegister[event].events[i];
                        if(eventType.type.toLowerCase().indexOf(e.type) > -1) {
                            if(eventType.shouldTrigger(ed,e)) {
                                eventType.callback.apply(this,[e.target]);
                            }
                            else {
                                eventType.missed && eventType.missed();
                            }
                        }
                    }
                }
            }
        };

        return {
            //takes an array of {type: tinymceEvent, shouldTrigger: tagname|function(e.target), callback: function, missed: function()}
            addEventsForComponent : function(component,events){
                if(!(component in eventRegister)) {
                    eventRegister[component] = {};
                    eventRegister[component].events = [];
                    eventRegister[component].isEnabled = true;
                }
                var item;
                var triggerTag;
                for(var i = 0, ii = events.length; i < ii; i++) {
                    item = null;
                    !(events[i].type in boundEvents) &&  (function() {
                        boundEvents[events[i].type] = true;
                        ed[events[i].type].add(eventHandler);
                    })();
                    if(!(typeof(events[i].shouldTrigger) === "function")) {

                        (function(triggerTag) {
                            events[i].shouldTrigger = function(ed,e) {
                                return e.target.tagName.toLowerCase() == triggerTag;
                            };
                        })(events[i].shouldTrigger);

                    }
                    eventRegister[component].events.push(events[i]);
                }
            },
            disableEventsForComponent : function(component) {
                for(var i = 0, ii = eventRegister.length; i < ii; i++) {
                    if(component in eventRegister) {
                        eventRegister[component].isEnabled = false;
                        return true;
                    }
                }
                return false;
            },
            enableEventsForComponent : function(component) {
                for(var i = 0, ii = eventRegister.length; i < ii; i++) {
                    if(component in eventRegister) {
                        eventRegister[component].isEnabled = true;
                        return true;
                    }
                }
                return false;
            }
        };
    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/event/tinymce-event-delegator', 'AJS.Rte.EventDelegator');
