define("confluence-page-banner/page-banner",["ajs","jquery","confluence/templates","confluence/legacy","skate"],function(i,c,n,j,d){function l(){var o=c("#system-content-items");if(o.children(":not(.hidden)").length==0){o.addClass("hidden")}else{o.removeClass("hidden")}}function e(){c("#page-metadata-banner").hide()}function k(){var o=c("#system-content-items a:not(.tipsy-disabled),.page-metadata-item a:not(.tipsy-disabled),.page-metadata-modification-info a.last-modified:not(tipsy-disabled),#draft-status-lozenge");a(o);o.click(function(p){g(c(p.target).closest("a"))});c(window).on("click scroll resize",g)}function a(o){c(o).tooltip({live:true,gravity:"n",title:"title",delayIn:500})}function g(o){c(".tipsy").remove();if(o){var p=c(o).data("tipsy");if(p){p.hoverState="out"}}}var f=function(q,s){var r=c("#content-metadata-page-restrictions");var o="";r.removeClass("aui-iconfont-locked aui-iconfont-unlocked restricted");var p=s.hasRestrictions&&!(s.hasExplicitRestrictions||s.hasInheritedRestrictions);if(s.hasExplicitRestrictions||p){r.addClass("aui-icon aui-icon-small aui-iconfont-locked restricted");o=i.I18n.getText("page.restrictions.apply")}else{if(s.hasInheritedRestrictions){r.addClass("aui-icon aui-icon-small aui-iconfont-unlocked restricted");o=i.I18n.getText("page.restrictions.apply")}else{r.addClass("aui-icon aui-icon-small aui-iconfont-unlocked");o=s.hasAnyExplicitRestrictions?i.I18n.getText("page.restrictions.apply"):i.I18n.getText("page.restrictions.none")}}r.attr("title",o);a(r);l()};var b=function(){l();i.bind("system-content-metadata.toggled-restrictions",f);i.bind("breadcrumbs.expanded",e);c("#page-metadata-banner").css("visibility","visible");k()};var h=function(){i.unbind("system-content-metadata.toggled-restrictions",f);i.unbind("breadcrumbs.expanded",e)};var m=function(){d("system-metadata-restrictions",{type:d.types.CLASS,events:{click:function(p,o){o.preventDefault();i.trigger("system-content-metadata.open-restrictions-dialog")}},attached:b,detached:h})};m()});require("confluence/module-exporter").safeRequire("confluence-page-banner/page-banner");