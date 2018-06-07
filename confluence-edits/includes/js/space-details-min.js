define("confluence/space-details",["document","ajs","jquery","confluence/templates"],function(d,b,j,g){return{"interface":{setUsersToAddTextField:function(c){var b=d.forms.convertspace.usersToAdd;""!=c&&(b.value=""==b.value?c:b.value+", "+c)}},initialiser:function(c){function d(a,h,e,f,i){c.ajax({url:b.contextPath()+"/spaces/"+e+"?"+c.param({contentType:h,key:b.Meta.get("space-key"),atl_token:b.Meta.get("atl-token")}),success:function(){!0===f?a.removeClass("stop-watching").addClass("watch"):a.removeClass("watch").addClass("stop-watching");
a.html(g.SpaceDetails.watchButton({watch:f,text:i}))}})}c(".spacetools-nav-secondary").on("click",".menu-item a",function(){var a=c(this).parent(),d=a.attr("data-web-item-key"),a=a.attr("data-web-section-key"),e=b.contextPath()||"/";c.cookie("confluence.last-web-item-clicked",a+"/"+d,{path:e})});c(".spacetools-nav").on("click","li a",function(){var a=c(this).parent(),d=a.attr("data-web-section-key"),a=a.attr("data-first-web-item-key"),e=b.contextPath()||"/";c.cookie("confluence.last-web-item-clicked",
d+"/"+a,{path:e})});c(".content-navigation.pages-collector").on("click","a.watch",function(a){a.preventDefault();d(c(this),"","addspacenotification.action",!1,b.I18n.getText("remove.space.notification"));b.trigger("analytics",{name:"watch-space"})});c(".content-navigation.pages-collector").on("click","a.stop-watching",function(a){a.preventDefault();d(c(this),"","removespacenotification.action",!0,b.I18n.getText("add.space.notification"));b.trigger("analytics",{name:"unwatch-space"})});c(".content-navigation.view-blogposts").on("click",
"a.watch",function(a){a.preventDefault();d(c(this),"blogpost","addspacenotification.action",!1,b.I18n.getText("space.watches.blogs.stop"));b.trigger("analytics",{name:"watch-blogs"})});c(".content-navigation.view-blogposts").on("click","a.stop-watching",function(a){a.preventDefault();d(c(this),"blogpost","removespacenotification.action",!0,b.I18n.getText("space.watches.blogs.start"));b.trigger("analytics",{name:"unwatch-blogs"})})}}});
require("confluence/module-exporter").safeRequire("confluence/space-details",function(d){var b=require("ajs");b.Confluence.SpaceDetails=d.interface;b.toInit(d.initialiser)});
