(function(a){Confluence.Sidebar={};AJS.toInit(function(C){var I=C(window);var o=C(document);var v=Math.min(285,I.width()/3);var z=285;var c=150;var n=55;var q=640;var E=AJS.storageManager("confluence","sidebar");var p="width";var l=AJS.contextPath();var G=AJS.Meta.get("space-key");var i=AJS.Meta.get("use-keyboard-shortcuts")?" "+AJS.I18n.getText("sidebar.splitter.shortcut.help"):"";Confluence.Sidebar.collapseTooltip=AJS.I18n.getText("sidebar.splitter.collapse.help")+i;Confluence.Sidebar.expandTooltip=AJS.I18n.getText("sidebar.splitter.expand.help")+i;var H=C(".ia-splitter").children();var D=C(".ia-splitter-left");if(D.length<1){return}var h=C(".acs-side-bar");var d=D.find(".ia-fixed-sidebar");var b=C("<div>",{"class":"ia-splitter-handle tipsy-enabled","data-tooltip":Confluence.Sidebar.collapseTooltip}).appendTo(d);C("<div>",{"class":"ia-splitter-handle-highlight"}).appendTo(b);var u=C(".ia-secondary-container");var m=C("#footer, #studio-footer");Confluence.Sidebar.throbberDiv=e;u.length&&k(u.attr("data-tree-type"));I.scroll(y);I.resize(y);I.on("touchend",y);o.ready(y);AJS.bind("confluence.header-resized",y);C("#header-precursor img").load(y);Confluence.Sidebar.applyTooltip=r;t();AJS.bind("sidebar.exit-configure-mode",t);var g=E.getItem(p)||v;var A=g>c?g:n;x(A);K();d.css("visibility","visible");y();J();setTimeout(function(){Confluence.Sidebar.createFlyouts(h)},0);AJS.trigger("sidebar.finished-loading");I.one("pagetree-children-loaded",function(){var L=C(".plugin_pagetree_current");if(L.length){var M=L.offset();if(M.top>h.height()/2){h.scrollTop(M.top-h.height()/3)}if(M.left>h.width()/2){h.scrollLeft(M.left-h.width()/2)}}});AJS.bind("sidebar.enter-configure-mode",function(){s();w();d.addClass("configure-mode")});AJS.bind("sidebar.exit-configure-mode",function(){s();B();d.removeClass("configure-mode")});function s(){AJS.trigger("sidebar.hide-overlays")}function r(L,N){var M={live:true,gravity:"w",title:"data-tooltip",delayIn:500,delayOut:0,offset:5};C(L).tooltip(N?C.extend(M,N):M)}function t(){C(".acs-side-bar .quick-links-section").attr("data-collapsed-tooltip",AJS.I18n.getText("sidebar.main.quick.links"));C("#space-tools-menu-trigger").attr("data-collapsed-tooltip",AJS.I18n.getText("sidebar.main.settings"));if(u.attr("data-tree-type")=="pages"){C(".acs-side-bar .ia-secondary-container").attr("data-collapsed-tooltip",AJS.I18n.getText("sidebar.pages.children"));r(".collapsed .ia-secondary-container.tipsy-enabled",{title:"data-collapsed-tooltip"})}r(".expand-collapse-trigger");r(".ia-splitter-handle.tipsy-enabled");r(".collapsed .quick-links-section.tipsy-enabled, .collapsed .acs-nav-item > a.tipsy-enabled, .collapsed #space-tools-menu-trigger.tipsy-enabled",{title:"data-collapsed-tooltip"});r(".configure-mode .acs-side-bar-space-info.tipsy-enabled",{title:"data-configure-tooltip"});h.on("mousedown click scroll",s);C(window).on("scroll resize",s);AJS.bind("sidebar.hide-overlays",M);AJS.bind("sidebar.disable-tooltip",N);AJS.bind("sidebar.enable-all-tooltips",L);function N(R,Q){var O=C(Q).closest(".tipsy-enabled");if(O.size()!=1){return}O.removeClass("tipsy-enabled").addClass("tipsy-disabled").attr("title","");var P=O.data("tipsy");if(P){P.hoverState="out"}M()}function L(){C(".tipsy-disabled").removeClass("tipsy-disabled").addClass("tipsy-enabled")}function M(){C(".tipsy").remove()}}function K(){o.on("mousewheel",".ia-scrollable-section",function(O,P){var N=C(this).scrollTop();var M=C(this).get(0).scrollHeight-C(this).innerHeight()-1;if((P>0&&N<=0)||(P<0&&N>=M)){O.preventDefault()}else{if(C.browser.msie){O.preventDefault();var L=30;C(this).scrollTop(N+(-1*P*L))}}O.stopPropagation()})}function e(){var M=C(Confluence.Templates.Sidebar.throbber()),N=M.find(".spinner"),L=Raphael.spinner(N[0],10,"#666");M.find(".throbber").bind("remove",function(){L()});return M}function k(L){if(L==="blogs"){j(h,f)}else{if(L==="pages"){Confluence.Sidebar.Pages.installHandlers(h)}}}function f(O,P){var N=O.attr("data-group-type");var L=O.attr("data-group-value");var M=l+"/rest/ia/1.0/pagetree/blog/subtree";C.get(M,{spaceKey:G,groupType:N,groupValue:L}).done(P)}function j(L,M){L.delegate(".acs-tree-item > .icon, .acs-tree-item > .node-title","click",function(){var R=C(this);var Q=R.parent();var N=Q.find("> .icon");if(Q.hasClass("opened")){Q.children("ul").hide();Q.removeClass("opened").addClass("closed");N.removeClass("icon-section-opened").addClass("icon-section-closed")}else{if(Q.hasClass("closed")){var O=Q.children("ul");if(O.length){O.show()}else{var P=C(Confluence.Templates.Sidebar.treeThrobber());Q.append(P);M(Q,function(T){var S=C(Confluence.Templates.Sidebar.pagetreeList({pagetree:T,isSubtree:true}));P.remove();S.appendTo(Q)})}Q.removeClass("closed").addClass("opened");N.removeClass("icon-section-closed").addClass("icon-section-opened")}}})}function y(){var L=D.offset().top,M=I.scrollTop(),N=I.scrollLeft();if(M<0){return}if(M>(o.height()-I.height())){return}if(N<0){return}if(N>(o.width()-I.width())){return}if(C("#header").css("position")!=="fixed"){d.css({top:Math.max(L-M,0)+"px",left:Math.min(N*-1,0)+"px"})}else{d.css({left:Math.min(N*-1,0)+"px"})}}function F(){m.css("margin-left",d.outerWidth()+"px")}function J(){var O=C("body");var M=false;var N=false;var P=function(Q){N=true;Q.preventDefault();H.one("selectstart",function(S){S.preventDefault()});var R=function(){if(d.width()<=c){x(n)}else{v=d.width()}N=false;O.off("mousemove.ia-splitter")};M=false;O.on("mousemove.ia-splitter",function(S){if(Confluence.Sidebar.Configure.mode&&S.pageX<z){return}x(S.pageX);M=true});O.one("mouseup mouseleave",R)};b.on("mousedown.ia-splitter",function(Q){P(Q);s()}).click(function(){if(!M){L()}else{M=false}});Confluence.Sidebar.toggle=L;function L(){if(Confluence.Sidebar.Configure.mode){return}var Q=d.width();if(Q>n){if(Q<=c){v=z;x(v)}else{v=Q;x(n)}}else{x(v)}}}function x(L){L=Math.max(L,n);L=Math.min(L,q);E.setItemQuietly(p,L);if(L<=c){d.addClass("collapsed");b.attr("data-tooltip",Confluence.Sidebar.expandTooltip);AJS.trigger("sidebar.collapsed")}else{if(d.hasClass("collapsed")){d.removeClass("collapsed");b.attr("data-tooltip",Confluence.Sidebar.collapseTooltip);AJS.trigger("sidebar.expanded")}}d.width(L);H.eq(1).css("margin-left",L+"px");F()}function w(){if(d.width()<z){Confluence.Sidebar.widthBeforeConfiguring=d.width();x(z)}}function B(){if(Confluence.Sidebar.widthBeforeConfiguring){x(Confluence.Sidebar.widthBeforeConfiguring);Confluence.Sidebar.widthBeforeConfiguring=undefined}}})})(AJS.$);