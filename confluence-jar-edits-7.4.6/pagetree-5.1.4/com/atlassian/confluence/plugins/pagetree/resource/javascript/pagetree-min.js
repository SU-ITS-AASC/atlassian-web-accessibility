!function(){var e=function(e){this.$=e;var t=this.$,n={},a={},i=function(e,n,a,i,r){var l="true"===e.dataset.expanded;null!=n&&null!=n||(n=!l),null!=a&&null!=a||(a=0);var d="true"===e.getAttribute("data-children-loaded");if(l!==n){var o=e.getAttribute("data-page-id")+"-"+e.getAttribute("data-tree-id"),u=t("#children"+o);d?(1==n?(e.classList.remove("aui-iconfont-chevron-right"),e.classList.add("aui-iconfont-chevron-down"),e.setAttribute("data-expanded",!0),e.setAttribute("aria-expanded",!0)):(e.classList.remove("aui-iconfont-chevron-down"),e.classList.add("aui-iconfont-chevron-right"),e.setAttribute("data-expanded",!1),e.setAttribute("aria-expanded",!1)),1==n?0==r?u.slideDown(300):(u.removeClass("plugin-pagetree-hide-children"),u.animate({opacity:1})):0==r?u.slideUp(300):u.animate({opacity:0},{complete:function(){u.addClass("plugin-pagetree-hide-children")}}),i&&s(o)):f(e,o,new Array,a,"",i,r,!0)}i&&s(o)},r=function(e,t,n){d(e,!0,t,n)},l=function(e,t,n){d(e,!1,t,n)},d=function(e,n,a,r){c(e);var l=t("#"+e).find('a.plugin_pagetree_childtoggle[data-type="toggle"]');l.each(function(e){i(this,n,999,e==l.length-1,r)}),a.preventDefault(),a.stopPropagation()},o=function(e){return e&&null!=e?u(e)[1]:null},u=function(e){return e&&null!=e?e.split("-"):null},c=function(e){var n=o(e);t("div.plugin_pagetree").each(function(e){e==n&&(t(this).find("span.plugin_pagetree_status").removeClass("hidden"),t(this).find("div.plugin_pagetree_expandcollapse").addClass("hidden"))})},s=function(e){var n=o(e);t("div.plugin_pagetree").each(function(e){e==n&&(t(this).find("span.plugin_pagetree_status").addClass("hidden"),t(this).find("div.plugin_pagetree_expandcollapse").removeClass("hidden"))})},p=function(e,a,i,r,l,d,o,u,c,s){var p=n[e];return p+="Orphan"==a?"&hasRoot=false&spaceKey="+l:"&hasRoot=true&pageId="+a,p+="&treeId="+e+"&startDepth="+r+"&mobile="+o,t.each(i,function(){p+="&ancestors="+this}),u&&(p+="&loadMore=true"),null!=c&&(p+="&elementsAfter="+c),null!=s&&(p+="&elementsBefore="+s),p+="&treePageId="+d,0==o&&(p=(AJS.params.serverUrl||"")+p),p},g=function(e){var t=e.children("fieldset"),n=new Object;return t.length>0&&t.children("input").each(function(){n[this.name]=this.value}),n},f=function(e,n,i,r,l,d,o,c,f,v,m,_){var b=n,A=d,C=u(n),y=C[0],P=C[1],w=t("#children"+n),x=g(function(e){var n=e,a=null;return t("div.plugin_pagetree").each(function(e){e==n&&(a=t(this))}),a}(P)),T=!1;function I(){if(v||m)e.innerHTML="Loading...";else{var t=Confluence.Templates.Pagetree.Macro.loadingIndicator();w.find(".plugin_pagetree_children_loading_wrapper .spinner").spin("small"),m?w.html(t+w.html()):w.append(t)}}var k=0;void 0!==_&&_&&(k=t("#"+_).offset().top),c?setTimeout(function(){T||I()},250):I(),t.ajax({type:"GET",url:p(P,y,i,r,x.spaceKey,x.treePageId,o,f,v,m),dataType:"text",success:function(i){if(d=i,(o=t(document.createElement("div"))).html(d),o.find("ul[id^='child_ul']").length){if(t(".plugin_pagetree_children_loading_wrapper").remove(),null!=m){var r=w.html();w.html(i+r)}else w.append(i);if(T=!0,void 0!==_){var l=t("#"+_).offset().top-k;document.getElementsByClassName("acs-side-bar")[0].scrollTop=document.getElementsByClassName("acs-side-bar")[0].scrollTop+l}w.children().length&&w.hasClass("hidden")&&w.removeClass("hidden"),t("#plusminus"+b).addClass("aui-iconfont-chevron-down").removeClass("aui-iconfont-chevron-right").attr("aria-expanded","true"),t("#childrenspan"+a[parseInt(P)]+"-"+P).addClass("plugin_pagetree_current"),A&&s(b),void 0!==e&&(e.setAttribute("data-children-loaded",!0),e.setAttribute("data-expanded",!0)),v&&t("#children"+n+" > ul > .page-tree-load-more-link-after").remove(),m&&t("#children"+n+" > ul > .page-tree-load-more-link-before").remove(),h(w),AJS.PageGadget&&AJS.PageGadget.contentsUpdated&&AJS.PageGadget.contentsUpdated()}else window.location=x.loginUrl;var d,o;AJS.trigger("pagetree-children-loaded")},error:function(e){"403"==e.status?w.text(x["i18n-pagetree.error.permission"]):w.text(x["i18n-pagetree.error.general"])}})},h=function(e){t("div.plugin_pagetree_children_container:empty",e).addClass("hidden")};function v(e){var t=e.target,n=t.getAttribute("data-type"),a="true"===e.currentTarget.getAttribute("data-mobile");if("toggle"===n)e.preventDefault(),e.stopPropagation(),i(e.target,null,null,null,a);else if("load-all-after"===n){var r=t.getAttribute("data-last-rendered-id"),l=t.getAttribute("data-page-id")+"-"+t.getAttribute("data-tree-id");f(e.target,l,new Array,null,"","",a,!1,!0,r,null)}else{if("load-all-before"!==n)return;var d=t.getAttribute("data-first-rendered-id"),o=(l=t.getAttribute("data-page-id")+"-"+t.getAttribute("data-tree-id"),"childrenspan"+d+"-"+t.getAttribute("data-tree-id"));f(e.target,l,new Array,null,"","",a,!1,!1,null,d,o)}e.preventDefault(),e.stopPropagation()}var m=function(e,i,d){e[0].addEventListener("click",v,{passive:!1});var o=g(e),u="true"==o.noRoot,c=u?"Orphan-"+i:o.rootPageId+"-"+i,s="true"==o.mobile;s&&e[0].setAttribute("data-mobile",s),n[i]=o.treeRequestId,a[i]=0==s?AJS.params.pageId:t("div.content-container").parent().attr("data-content-id"),e.children("fieldset").each(function(){var e=t(this);e.children("input[treeId]").attr("value",i),e.children("input[rootPage]").attr("value",c)}),u?(e.find("div.plugin_pagetree_children").attr("id","childrenOrphan-"+i),e.find("a.plugin_pagetree_expandall").click(function(e){return r("childrenOrphan-"+i,e,s),!1}),e.find("a.plugin_pagetree_collapseall").click(function(e){return l("childrenOrphan-"+i,e,s),!1})):(e.find("div.plugin_pagetree_children").attr("id","children"+c),e.find("a.plugin_pagetree_expandall").click(function(e){return r("children"+c,e,s),!1}),e.find("a.plugin_pagetree_collapseall").click(function(e){return l("children"+c,e,s),!1}));var p=function(e){var t=e.children("fieldset"),n=new Array;if(t.length>0){var a=t.children("fieldset");a.length>0&&a.children("input").each(function(){n.push(this.value)})}return n}(e);f(void 0,c,p,o.startDepth,o.spaceKey,"",s,!1,d,null,null)};this.initPageTrees=function(e){t("div.plugin_pagetree").each(function(n){m(t(this),n,e)}),_()};var _=function(){var e=self.placeFocus;e&&(self.placeFocus=function(){var n=t("form[name='pagetreesearchform']");n.attr("name","inlinecommentform"),e(),n.attr("name","pagetreesearchform")})};t(".open-flyout-to-search").bind("click",function(e){t(".fly-out-open").length?setTimeout(function(){ConfluenceMobile.flyout.hide()},400):setTimeout(function(){ConfluenceMobile.flyout.show()},400),e.stopPropagation(),e.preventDefault()})};Confluence=Confluence||{},Confluence.Plugins=Confluence.Plugins||{},Confluence.Plugins.PagetreeMacro={bind:function(t){new e(t).initPageTrees(!1)}}}();