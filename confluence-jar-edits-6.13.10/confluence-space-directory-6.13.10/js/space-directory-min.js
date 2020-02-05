define("confluence-space-directory/space-directory",["jquery","window","confluence/meta","confluence/legacy","ajs","confluence-space-directory/pagination"],function(e,a,t,s,c,r){"use strict";return function(){var r=e("#space-directory .aui-nav li"),i=e("#space-search-query"),n="",l=function(){var a=e("#space-directory .aui-nav-selected");return{type:a.parent().attr("id"),tabName:a.find("a").data("tab-name")}},o=function(a){a&&a.type&&a.tabName?e("#"+a.type+" a[data-tab-name="+a.tabName+"]").parent().addClass("aui-nav-selected"):e("#space-system-list a[data-tab-name=site]").parent().addClass("aui-nav-selected")};e("#space-search-result").paginate({nameSpace:"space-directory",url:t.get("context-path")+"/rest/spacedirectory/1/search",cache:!1,pageUrl:t.get("context-path")+"/spacedirectory/view.action",getParams:function(){var a,s=t.get("remote-user"),r="current",i=[];s&&e("#favourites-toggle").hasClass("aui-nav-selected")&&(i=["~"+s+":favourite","~"+s+":favorite"],e("#space-search-title-bar .space-search-title").text(c.I18n.getText("favourite.spaces")));var l=e(".team-label.aui-nav-selected a");if(l.length>0&&(i.push("team:"+l.attr("data-tab-name")),r=l.attr("data-status-name"),e("#space-search-title-bar .space-search-title").text(l.text())),!i.length){var o=e(".space-type.aui-nav-selected a");o.length>0&&(a=o.attr("data-type-name"),r=o.attr("data-status-name"),e("#space-search-title-bar .space-search-title").text(o.text())),a||e("#space-search-title-bar .space-search-title").text(c.I18n.getText("spaces.all"))}return{query:n,label:i,type:a,status:r}},pageSize:+c.params.pageSize,startIndex:0,preprocess:function(a){e(".no-results").addClass("hidden"),e("#aui-message-bar").empty()},insertResults:function(a,c){var r,n=a.spaces,o=0===n.length;e(".no-results").toggleClass("hidden",!o||"space-system-list"==(r=l()).type&&"all"==r.tabName&&!i.val()),e(".space-list-section").toggleClass("hidden",o),e("#space-directory-help").toggleClass("hidden",o),0==e("#space-list caption").length&&e("#space-list").prepend("<caption class='assistive' aria-label='Space List'>Space List</caption>");for(var p=0,d=n.length;p<d;p++){var u=n[p],f=s.Templates.SpaceDirectory.spaceListItem({spaceKey:u.key,spaceName:u.name,truncatedSpaceName:u.name,spaceDescHtml:u.description,spaceUrl:u.link[1].href,logoUrl:u.logo.href,remoteUser:t.get("remote-user"),accessMode:t.get("access-mode")}),m=e(f);c.append(m);var g=u.favourite;e(".space-favourites a.aui-iconfont-star-filled",m).toggleClass("hidden",!g),e(".space-favourites a.aui-iconfont-new-star",m).toggleClass("hidden",g);var h=u.labels.label;if(h.length>0){for(var v=e(".space-labels",m),y=0,b=0,C=h.length;b<C;b++)if("team"===h[b].namespace){var S=e(s.Templates.SpaceDirectory.spaceLabel({spaceLabel:h[b].name}));y>2?S.addClass("hidden"):y++,v.append(S)}y>2&&v.append(s.Templates.SpaceDirectory.spaceLabelEllipsis())}}e(".space-favourites").favourites({})},handleError:function(){c.messages.error({body:c.I18n.getText("search.spaces.error"),closeable:!1})}});var p=function(){e("#space-search-result").hasClass("updating-container")||c.trigger("update-list.space-directory",{startIndex:0}),a.localStorage.setItem("lastSelectedSpaceDirectoryTab",JSON.stringify(l()))},d=function(e,a){c.trigger("analytics",{name:"confluence.space-directory."+e,data:a||{}})};r.click(function(a){var t=e(this);a.preventDefault(),r.removeClass("aui-nav-selected"),t.addClass("aui-nav-selected"),e("#space-search-result").focus(),p();var s=e.trim(t.text()).toLowerCase().replace(/\s/g,"-"),c=t.hasClass("team-label");d((c?"category":s+"-filter")+".click",{category:l().tabName})});var u,f=e("#space-list");f.on("click",".space-name a",function(e){d("space.click")}),f.on("click",".space-label",function(a){a.preventDefault(),r.removeClass("aui-nav-selected"),e(".team-label a[data-tab-name='"+e(this).text()+"']").parent().addClass("aui-nav-selected"),p(),e("#space-search-result").focus(),d("space.category.click")}),f.on("click",".entity-info-icon a",function(){d("space.info.click")}),i.keyup(function(a){var t=e.trim(i.val());i.hasClass("placeholded")&&(t=""),/^\S{1,2}$/.test(t)||(""!=t&&(t=t+" OR "+t+"*"),n!=t&&(n=t,clearTimeout(u),u=setTimeout(function(){p(),d("filter")},200)))}),e("#space-search-form").submit(function(t){var s=e("#space-list .space-list-item");if(!e("#space-search-result").hasClass("updating-container")&&1===s.length)return a.location=e(s[0]).find(".space-name a").attr("href"),c.stopEvent(t)});var m=e("#space-directory").data("selected-tab");o(m?{type:"space-labels-list",tabName:m}:JSON.parse(localStorage.getItem("lastSelectedSpaceDirectoryTab"))),p()}}),require("confluence/module-exporter").safeRequire("confluence-space-directory/space-directory",function(e){require("ajs").toInit(e)});