define("confluence-dashboard/modules/starred/starred-collection",["module","exports","backbone","configuration","confluence-dashboard/utils/date-utils","../../core/shared/cql-base-collection","ajs","confluence/meta","jquery","underscore"],function(e,t,a,r,o,l,n,s,d,u){"use strict";function i(e){return e&&e.__esModule?e:{default:e}}var c=a.Model,f=r.endpoints,p=r.apiLimit,m=i(o).default,v=i(l).default,h=i(n).default,b=i(s).default,y=i(d).default,x=i(u).default,w=h.contextPath(),_=c.extend({url:f.ADD_FAVOURITE,url_destroy:f.REMOVE_FAVOURITE,defaults:{virtuallyDeleted:!1},parse:function(e){e.entityId=e.id,e.url=w+e._links.webui,e.icon="page"===e.type?"page":"blogpost";var t=e.metadata.currentuser.favourited.favouritedDate;return e.favouritedDateISO=m.toISODate(new Date(t)),e},destroy:function(){return c.prototype.destroy.call(this,{dataType:"json",data:y.param({entityId:this.get("entityId"),atl_token:b.get("atl-token")}),url:this.url_destroy,type:"POST"})}});t.default=v.extend({apiParams:{url:f.STARRED,params:{limit:p},expansions:["metadata.currentuser.favourited","metadata.currentuser.lastcontributed"],cql:"favourite=currentUser()",cqlOrder:"favourite desc",cqlcontext:'{"contentStatuses":["current","draft"]}'},model:_,groupMethod:function(e){return e.get("favouritedDateISO")},parse:function(e,t){return e.results=x.reject(e.results,function(e){return!e.metadata.currentuser.favourited}),v.prototype.parse.apply(this,arguments)}}),e.exports=t.default}),define("confluence-dashboard/modules/starred/starred-item-view",["module","exports","underscore","../list-item/list-item-view","../../behaviors/undo-remove","../../behaviors/list-item-animated","../../behaviors/tooltips"],function(e,t,a,r,o,l,n){"use strict";function s(e){return e&&e.__esModule?e:{default:e}}var d=s(a).default,u=s(r).default,i=s(o).default,c=s(l).default,f=s(n).default;t.default=u.extend({templateHelpers:d.extend({removable:!0},u.prototype.templateHelpers),ui:{tooltips:".top-tooltip"},behaviors:{undoRemove:{behaviorClass:i,eventNamespace:"favourites"},tooltip:{behaviorClass:f,selector:".top-tooltip"},animated:{behaviorClass:c}}}),e.exports=t.default}),define("confluence-dashboard/modules/starred/starred-controller",["module","exports","confluence-dashboard/core/content/content-as-grouped-list-view","confluence-dashboard/core/content/content-controller","./starred-collection","./starred-item-view","confluence-dashboard/soy-templates","configuration","ajs"],function(e,t,a,r,o,l,n,s,d){"use strict";function u(e){return e&&e.__esModule?e:{default:e}}var i=u(a).default,c=u(r).default,f=u(o).default,p=u(l).default,m=u(n).default,v=(s.staticResourceUrl,u(d).default);t.default=c.extend({actionsToFilter:["starred"],starred:function(){this.view=new i({collection:new f,templateHelpers:{title:v.I18n.getText("starred.title"),contentType:this.options.name},childViewOptions:{childView:p},emptyViewOptions:{template:m.Starred.blank},className:"default-list-view starred-list"}),this.view.collection.fetch()}}),e.exports=t.default});