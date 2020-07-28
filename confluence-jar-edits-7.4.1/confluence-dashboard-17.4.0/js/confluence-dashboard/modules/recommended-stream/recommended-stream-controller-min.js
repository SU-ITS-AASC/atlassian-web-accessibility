define("confluence-dashboard/modules/recommended-stream/recommended-stream-collection",["module","exports","underscore","../../core/shared/cql-base-collection","backbone","configuration"],function(e,t,o,n,d,l){"use strict";var a=c(o).default,m=c(n).default,r=(d.Collection,d.Model),s=l.endpoints;function c(e){return e&&e.__esModule?e:{default:e}}var i=r.extend({destroy:function(){return r.prototype.destroy.call(this,{dataType:"json",url:s.RECOMMENDED_STREAM+"/"+this.get("id"),type:"DELETE"})}});t.default=m.extend({url:s.RECOMMENDED_STREAM,model:i,parse:function(t,e){return this.parseNext(t,e),a.map(t.streamItems,function(e){return e.model=t.model,e})},parseNext:function(e){e.nextPageOffset?(this.hasNext=!0,this.nextUrl=s.RECOMMENDED_STREAM+"?nextPageOffset="+e.nextPageOffset):(this.hasNext=!1,this.nextUrl=null)}}),e.exports=t.default}),define("confluence-dashboard/modules/recommended-stream/recommended-stream-view",["module","exports","marionette","confluence-dashboard/soy-templates","confluence/hover-user","../../utils/analytics","configuration"],function(e,t,o,n,d,l,a){"use strict";var m=o.ItemView,r=i(n).default,s=i(d).default,c=i(l).default;a.endpoints;function i(e){return e&&e.__esModule?e:{default:e}}t.default=m.extend({template:r.RecommendedStream.compactStreamItem,tagName:"li",events:{"click a.stream-item-heading-link":"onItemClick","mousedown a.stream-item-heading-link":"onItemClick","click a.delete-button":"onItemDelete"},className:function(){return"stream-item stream-item-layout "+this.model.get("contentCssClass")},onDomRefresh:function(){s()},onItemClick:function(){c.publish("recommended.item.clicked",{model:this.model.get("model")||"",id:this.model.get("id")})},onItemDelete:function(e){this.model.destroy(),c.publish("recommended.item.deleted",{model:this.model.get("model")||"",id:this.model.get("id")}),e.preventDefault()}}),e.exports=t.default}),define("confluence-dashboard/modules/recommended-stream/recommended-stream-controller",["module","exports","./recommended-stream-collection","./recommended-stream-view","confluence-dashboard/core/content/content-as-stream-view","confluence-dashboard/core/content/content-controller","confluence-dashboard/soy-templates"],function(e,t,o,n,d,l,a){"use strict";var m=u(o).default,r=u(n).default,s=u(d).default,c=u(l).default,i=u(a).default;function u(e){return e&&e.__esModule?e:{default:e}}t.default=c.extend({actionsToFilter:["recommendedStream"],recommendedStream:function(){this.view=new s({collection:new m,templateHelpers:{title:"Recommended for you",contentType:this.options.name},childView:r,emptyViewOptions:{template:i.RecommendedStream.blank}}),this.view.collection.fetch()}}),e.exports=t.default});