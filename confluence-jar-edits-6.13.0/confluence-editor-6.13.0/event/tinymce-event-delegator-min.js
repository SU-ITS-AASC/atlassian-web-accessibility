define("confluence-editor/event/tinymce-event-delegator",[],function(){return function(h){var c={},f={},i=function(d,b){var a,e;for(e in c)if(c.hasOwnProperty(e)&&c[e].isEnabled)for(var g=0,f=c[e].events.length;g<f;g++)a=c[e].events[g],-1<a.type.toLowerCase().indexOf(b.type)&&(a.shouldTrigger(d,b)?a.callback.apply(this,[b.target]):a.missed&&a.missed())};return{addEventsForComponent:function(d,b){d in c||(c[d]={},c[d].events=[],c[d].isEnabled=!0);for(var a=0,e=b.length;a<e;a++)b[a].type in f||(f[b[a].type]=
!0,h[b[a].type].add(i)),"function"!==typeof b[a].shouldTrigger&&function(c){b[a].shouldTrigger=function(a,b){return b.target.tagName.toLowerCase()==c}}(b[a].shouldTrigger),c[d].events.push(b[a])},disableEventsForComponent:function(d){for(var b=0,a=c.length;b<a;b++)if(d in c)return c[d].isEnabled=!1,!0;return!1},enableEventsForComponent:function(d){for(var b=0,a=c.length;b<a;b++)if(d in c)return c[d].isEnabled=!0;return!1}}}});
require("confluence/module-exporter").exportModuleAsGlobal("confluence-editor/event/tinymce-event-delegator","AJS.Rte.EventDelegator");