define("confluence-dashboard/modules/all-updates/all-updates-collection",["module","exports","backbone","../../core/shared/base-collection","configuration"],function(e,t,l,a,o){"use strict";var n=u(l).default,s=u(a).default,c=o.endpoints;function u(e){return e&&e.__esModule?e:{default:e}}t.default=s.extend({url:c.ALL_UPDATES,sync:function(e,t,l){if("read"===e)return l.data={maxResults:40,tab:"all",showProfilePic:!0,labels:"",spaces:"",users:"",types:"",category:"",spaceKey:""},n.sync.call(this,e,t,l);console.log("Method not implemented for all updates",e)},parse:function(e){return e.changeSets}}),e.exports=t.default}),define("confluence-dashboard/modules/all-updates/all-updates-controller",["module","exports","./all-updates-collection","confluence-dashboard/core/content/content-controller","confluence-dashboard/core/content/content-as-stream-view","confluence-dashboard/soy-templates","configuration","ajs"],function(e,t,l,a,o,n,s,c){"use strict";var u=p(l).default,d=p(a).default,r=p(o).default,i=p(n).default,f=(s.staticResourceUrl,p(c).default);function p(e){return e&&e.__esModule?e:{default:e}}t.default=d.extend({actionsToFilter:["allUpdates"],allUpdates:function(){this.view=new r({collection:new u,templateHelpers:{title:f.I18n.getText("all.updates.title"),contentType:this.options.name},emptyViewOptions:{template:i.AllUpdates.blank}}),this.view.collection.fetch()}}),e.exports=t.default});