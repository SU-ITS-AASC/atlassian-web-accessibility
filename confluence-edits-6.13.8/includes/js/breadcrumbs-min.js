define("confluence/breadcrumbs",["jquery","ajs","document","confluence/templates"],function(a,c,d,f){return{init:function(){a(d).on("click","#ellipsis",function(){try{a("#breadcrumbs .hidden-crumb").removeClass("hidden-crumb"),a(this).addClass("hidden-crumb"),c.trigger("breadcrumbs.expanded")}catch(e){c.log(e)}})},update:function(e,d){a.ajax({type:"GET",dataType:"json",data:{spaceKey:e,title:d},url:c.contextPath()+"/pages/breadcrumb.action",error:function(){},success:function(b){b&&b.breadcrumbs&&
a("ol#breadcrumbs").html(f.Breadcrumbs.render({breadcrumbs:b.breadcrumbs,ellipsisIndex:b.ellipsisIndex,ellipsisLength:b.ellipsisLength}))}})}}});require("confluence/module-exporter").safeRequire("confluence/breadcrumbs",function(a){require("ajs").toInit(a.init)});