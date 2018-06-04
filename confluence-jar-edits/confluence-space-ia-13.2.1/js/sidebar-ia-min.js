AJS.$,Confluence.Sidebar={},AJS.toInit(function(e){var t=e(window),i=e(document),a=Math.min(285,t.width()/3),o=285,n=150,s=55,l=640,r=AJS.storageManager("confluence","sidebar"),d="width",c=AJS.contextPath(),p=AJS.Meta.get("space-key"),f=AJS.Meta.get("use-keyboard-shortcuts")?" "+AJS.I18n.getText("sidebar.splitter.shortcut.help"):"";Confluence.Sidebar.collapseTooltip=AJS.I18n.getText("sidebar.splitter.collapse.help")+f,Confluence.Sidebar.expandTooltip=AJS.I18n.getText("sidebar.splitter.expand.help")+f;var u=e(".ia-splitter").children(),g=e(".ia-splitter-left");if(!(g.length<1)){var b=e(".acs-side-bar"),h=g.find(".ia-fixed-sidebar"),m=e("<div>",{class:"ia-splitter-handle tipsy-enabled","data-tooltip":Confluence.Sidebar.collapseTooltip}).appendTo(h);e("<div>",{class:"ia-splitter-handle-highlight"}).appendTo(m);var v,C,S=e(".ia-secondary-container"),y=e("#footer, #studio-footer");Confluence.Sidebar.throbberDiv=function(){var t=e(Confluence.Templates.Sidebar.throbber()),i=t.find(".spinner"),a=Raphael.spinner(i[0],10,"#666");return t.find(".throbber").bind("remove",function(){a()}),t},S.length&&("blogs"===(v=S.attr("data-tree-type"))?(C=J,b.delegate(".acs-tree-item > .icon, .acs-tree-item > .node-title","click",function(){var t=e(this),i=t.parent(),a=i.find("> .icon");if(i.hasClass("opened"))i.children("ul").hide(),i.removeClass("opened").addClass("closed"),a.removeClass("icon-section-opened").addClass("icon-section-closed");else if(i.hasClass("closed")){var o=i.children("ul");if(o.length)o.show();else{var n=e(Confluence.Templates.Sidebar.treeThrobber());i.append(n),C(i,function(t){var a=e(Confluence.Templates.Sidebar.pagetreeList({pagetree:t,isSubtree:!0}));n.remove(),a.appendTo(i)})}i.removeClass("closed").addClass("opened"),a.removeClass("icon-section-closed").addClass("icon-section-opened")}})):"pages"===v&&Confluence.Sidebar.Pages.installHandlers(b)),t.scroll(k),t.resize(k),t.on("touchend",k),i.ready(k),AJS.bind("confluence.header-resized",k),e("#header-precursor img").load(k),Confluence.Sidebar.applyTooltip=T,A(),AJS.bind("sidebar.exit-configure-mode",A);var x=r.getItem(d)||a;I(x>n?x:s),i.on("mousewheel",".ia-scrollable-section",function(t,i){var a=e(this).scrollTop(),o=e(this).get(0).scrollHeight-e(this).innerHeight()-1;i>0&&a<=0||i<0&&a>=o?t.preventDefault():e.browser.msie&&(t.preventDefault(),e(this).scrollTop(a+-1*i*30)),t.stopPropagation()}),h.css("visibility","visible"),k(),function(){var t=e("body"),i=!1;function l(){if(!Confluence.Sidebar.Configure.mode){var e=h.width();e>s?e<=n?I(a=o):(a=e,I(s)):I(a)}}m.on("mousedown.ia-splitter",function(e){e.preventDefault(),u.one("selectstart",function(e){e.preventDefault()}),i=!1,t.on("mousemove.ia-splitter",function(e){Confluence.Sidebar.Configure.mode&&e.pageX<o||(I(e.pageX),i=!0)}),t.one("mouseup mouseleave",function(){h.width()<=n?I(s):a=h.width(),t.off("mousemove.ia-splitter")}),w()}).click(function(){i?i=!1:l()}),Confluence.Sidebar.toggle=l}(),setTimeout(function(){Confluence.Sidebar.createFlyouts(b)},0),AJS.trigger("sidebar.finished-loading"),t.one("pagetree-children-loaded",function(){var t=e(".plugin_pagetree_current");if(t.length){var i=t.offset();i.top>b.height()/2&&b.scrollTop(i.top-b.height()/3),i.left>b.width()/2&&b.scrollLeft(i.left-b.width()/2)}}),AJS.bind("sidebar.enter-configure-mode",function(){w(),h.width()<o&&(Confluence.Sidebar.widthBeforeConfiguring=h.width(),I(o)),h.addClass("configure-mode")}),AJS.bind("sidebar.exit-configure-mode",function(){w(),Confluence.Sidebar.widthBeforeConfiguring&&(I(Confluence.Sidebar.widthBeforeConfiguring),Confluence.Sidebar.widthBeforeConfiguring=void 0),h.removeClass("configure-mode")}),e(function(){e(".expand-collapse-trigger").keypress(function(e){13==e.keyCode&&Confluence.Sidebar.toggle()})}),e("div.ia-fixed-sidebar.collapsed .space-logo a").focusin(function(){Confluence.Sidebar.toggle()})}function w(){AJS.trigger("sidebar.hide-overlays")}function T(t,i){var a={live:!0,gravity:"w",title:"data-tooltip",delayIn:500,delayOut:0,offset:5};e(t).tooltip(i?e.extend(a,i):a)}function A(){function t(){e(".tipsy").remove()}e(".acs-side-bar .quick-links-section").attr("data-collapsed-tooltip",AJS.I18n.getText("sidebar.main.quick.links")),e("#space-tools-menu-trigger").attr("data-collapsed-tooltip",AJS.I18n.getText("sidebar.main.settings")),"pages"==S.attr("data-tree-type")&&(e(".acs-side-bar .ia-secondary-container").attr("data-collapsed-tooltip",AJS.I18n.getText("sidebar.pages.children")),T(".collapsed .ia-secondary-container.tipsy-enabled",{title:"data-collapsed-tooltip"})),T(".expand-collapse-trigger"),T(".ia-splitter-handle.tipsy-enabled"),T(".collapsed .quick-links-section.tipsy-enabled, .collapsed .acs-nav-item > a.tipsy-enabled, .collapsed #space-tools-menu-trigger.tipsy-enabled",{title:"data-collapsed-tooltip"}),T(".configure-mode .acs-side-bar-space-info.tipsy-enabled",{title:"data-configure-tooltip"}),b.on("mousedown click scroll",w),e(window).on("scroll resize",w),AJS.bind("sidebar.hide-overlays",t),AJS.bind("sidebar.disable-tooltip",function(i,a){var o=e(a).closest(".tipsy-enabled");if(1==o.size()){o.removeClass("tipsy-enabled").addClass("tipsy-disabled").attr("title","");var n=o.data("tipsy");n&&(n.hoverState="out"),t()}}),AJS.bind("sidebar.enable-all-tooltips",function(){e(".tipsy-disabled").removeClass("tipsy-disabled").addClass("tipsy-enabled")})}function J(t,i){var a=t.attr("data-group-type"),o=t.attr("data-group-value"),n=c+"/rest/ia/1.0/pagetree/blog/subtree";e.get(n,{spaceKey:p,groupType:a,groupValue:o}).done(i)}function k(){var a=g.offset().top,o=t.scrollTop(),n=t.scrollLeft();o<0||o>i.height()-t.height()||n<0||n>i.width()-t.width()||("fixed"!==e("#header").css("position")?h.css({top:Math.max(a-o,0)+"px",left:Math.min(-1*n,0)+"px"}):h.css({left:Math.min(-1*n,0)+"px"}))}function I(e){e=Math.max(e,s),e=Math.min(e,l),r.setItemQuietly(d,e),e<=n?(h.addClass("collapsed"),h.attr("aria-expanded","false"),m.attr("data-tooltip",Confluence.Sidebar.expandTooltip),AJS.trigger("sidebar.collapsed")):h.hasClass("collapsed")&&(h.removeClass("collapsed"),h.attr("aria-expanded","true"),m.attr("data-tooltip",Confluence.Sidebar.collapseTooltip),AJS.trigger("sidebar.expanded")),h.width(e),u.eq(1).css("margin-left",e+"px"),y.css("margin-left",h.outerWidth()+"px")}});