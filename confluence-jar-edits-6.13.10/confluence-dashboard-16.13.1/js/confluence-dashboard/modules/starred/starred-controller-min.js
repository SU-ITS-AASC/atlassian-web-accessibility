define("confluence-dashboard/modules/starred/starred-collection",["module","exports","backbone","configuration","confluence-dashboard/utils/date-utils","../../core/shared/cql-base-collection","ajs","confluence/meta","jquery","underscore"],function(e,t,a,r,o,l,n,s,d,u){"use strict";var i=a.Model,c=r.endpoints,f=r.apiLimit,p=x(o).default,m=x(l).default,v=x(n).default,h=x(s).default,b=x(d).default,y=x(u).default;function x(e){return e&&e.__esModule?e:{default:e}}var w=v.contextPath(),_=i.extend({url:c.ADD_FAVOURITE,url_destroy:c.REMOVE_FAVOURITE,defaults:{virtuallyDeleted:!1},parse:function(e){e.entityId=e.id,e.url=w+e._links.webui,e.icon="page"===e.type?"page":"blogpost";var t=e.metadata.currentuser.favourited.favouritedDate;return e.favouritedDateISO=p.toISODate(new Date(t)),e},destroy:function(){return i.prototype.destroy.call(this,{dataType:"json",data:b.param({entityId:this.get("entityId"),atl_token:h.get("atl-token")}),url:this.url_destroy,type:"POST"})}});t.default=m.extend({apiParams:{url:c.STARRED,params:{limit:f},expansions:["metadata.currentuser.favourited","metadata.currentuser.lastcontributed"],cql:"favourite=currentUser()",cqlOrder:"favourite desc",cqlcontext:'{"contentStatuses":["current","draft"]}'},model:_,groupMethod:function(e){return e.get("favouritedDateISO")},parse:function(e,t){return e.results=y.reject(e.results,function(e){return!e.metadata.currentuser.favourited}),m.prototype.parse.apply(this,arguments)}}),e.exports=t.default}),define("confluence-dashboard/modules/starred/starred-item-view",["module","exports","underscore","../list-item/list-item-view","../../behaviors/undo-remove","../../behaviors/list-item-animated","../../behaviors/tooltips"],function(e,t,a,r,o,l,n){"use strict";var s=f(a).default,d=f(r).default,u=f(o).default,i=f(l).default,c=f(n).default;function f(e){return e&&e.__esModule?e:{default:e}}t.default=d.extend({templateHelpers:s.extend({removable:!0},d.prototype.templateHelpers),ui:{tooltips:".top-tooltip"},behaviors:{undoRemove:{behaviorClass:u,eventNamespace:"favourites"},tooltip:{behaviorClass:c,selector:".top-tooltip"},animated:{behaviorClass:i}}}),e.exports=t.default}),define("confluence-dashboard/modules/starred/starred-controller",["module","exports","confluence-dashboard/core/content/content-as-grouped-list-view","confluence-dashboard/core/content/content-controller","./starred-collection","./starred-item-view","confluence-dashboard/soy-templates","configuration","ajs"],function(e,t,a,r,o,l,n,s,d){"use strict";var u=v(a).default,i=v(r).default,c=v(o).default,f=v(l).default,p=v(n).default,m=(s.staticResourceUrl,v(d).default);function v(e){return e&&e.__esModule?e:{default:e}}t.default=i.extend({actionsToFilter:["starred"],starred:function(){this.view=new u({collection:new c,templateHelpers:{title:m.I18n.getText("starred.title"),contentType:this.options.name},childViewOptions:{childView:f},emptyViewOptions:{template:p.Starred.blank},className:"default-list-view starred-list"}),this.view.collection.fetch()}}),e.exports=t.default});