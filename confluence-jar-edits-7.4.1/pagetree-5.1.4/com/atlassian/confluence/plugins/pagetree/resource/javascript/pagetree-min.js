(function(){var a=function(j){this.$=j;var f=this.$;var y=999;var z=true;var i=false;var u={};var c={};var k=function(I,E,J,D,B){var G=I.dataset.expanded==="true";if(E==undefined||E==null){E=!G}if(J==undefined||J==null){J=0}var F=I.getAttribute("data-children-loaded")==="true";if(G!==E){var C=I.getAttribute("data-page-id")+"-"+I.getAttribute("data-tree-id");var H=f("#children"+C);if(F){if(E==z){I.classList.remove("aui-iconfont-chevron-right");I.classList.add("aui-iconfont-chevron-down");I.setAttribute("data-expanded",true)}else{I.classList.remove("aui-iconfont-chevron-down");I.classList.add("aui-iconfont-chevron-right");I.setAttribute("data-expanded",false)}if(E==z){if(B==false){H.slideDown(300)}else{H.removeClass("plugin-pagetree-hide-children");H.animate({opacity:1})}}else{if(B==false){H.slideUp(300)}else{H.animate({opacity:0},{complete:function(){H.addClass("plugin-pagetree-hide-children")}})}}if(D){p(C)}}else{h(I,C,new Array(),J,"",D,B,true)}}if(D){p(C)}};var g=function(D,C,B){x(D,z,C,B)};var v=function(D,C,B){x(D,i,C,B)};var x=function(G,E,D,C){e(G);var F=f("#"+G);var B=F.find('a.plugin_pagetree_childtoggle[data-type="toggle"]');B.each(function(H){k(this,E,y,H==B.length-1,C)});D.preventDefault();D.stopPropagation()};var s=function(B){if(!B||B==undefined){return null}if(B.indexOf("plusminus")!=-1){return B.substring("plusminus".length)}if(B.indexOf("children")!=-1){return B.substring("children".length)}return null};var b=function(B){if(!B||B==undefined){return null}return o(B)[1]};var o=function(B){if(!B||B==undefined){return null}return B.split("-")};var e=function(C){var B=b(C);f("div.plugin_pagetree").each(function(D){if(D==B){f(this).find("span.plugin_pagetree_status").removeClass("hidden");f(this).find("div.plugin_pagetree_expandcollapse").addClass("hidden")}})};var p=function(C){var B=b(C);f("div.plugin_pagetree").each(function(D){if(D==B){f(this).find("span.plugin_pagetree_status").addClass("hidden");f(this).find("div.plugin_pagetree_expandcollapse").removeClass("hidden")}})};var d=function(G,E,L,I,H,D,C,J,F,K){var B=u[G];if(E=="Orphan"){B+="&hasRoot=false&spaceKey="+H}else{B+="&hasRoot=true&pageId="+E}B+="&treeId="+G+"&startDepth="+I+"&mobile="+C;f.each(L,function(){B+="&ancestors="+this});if(J){B+="&loadMore=true"}if(F!=null){B+="&elementsAfter="+F}if(K!=null){B+="&elementsBefore="+K}B+="&treePageId="+D;if(C==false){B=(AJS.params.serverUrl||"")+B}return B};var n=function(D){var C=D;var B=null;f("div.plugin_pagetree").each(function(E){if(E==C){B=f(this)}});return B};var m=function(B){var C=B.children("fieldset");var D=new Object();if(C.length>0){C.children("input").each(function(){D[this.name]=this.value})}return D};var l=function(B){var D=B.children("fieldset");var E=new Array();if(D.length>0){var C=D.children("fieldset");if(C.length>0){C.children("input").each(function(){E.push(this.value)})}}return E};var r=function(B){var C=f(document.createElement("div"));C.html(B);return C.find("ul[id^='child_ul']").length};var h=function(F,J,B,U,K,E,C,S,G,O,L,H){var Q=J;var I=E;var R=o(J);var M=R[0];var D=R[1];var V=f("#children"+J);var P=m(n(D));var T=false;function W(){if(O||L){F.innerHTML="Loading..."}else{var X=Confluence.Templates.Pagetree.Macro.loadingIndicator();V.find(".plugin_pagetree_children_loading_wrapper .spinner").spin("small");if(L){V.html(X+V.html())}else{V.append(X)}}}var N=0;if(typeof H!=="undefined"&&H){N=f("#"+H).offset().top}if(S){setTimeout(function(){if(!T){W()}},250)}else{W()}f.ajax({type:"GET",url:d(D,M,B,U,P.spaceKey,P.treePageId,C,G,O,L),dataType:"text",success:function(Y){if(r(Y)){f(".plugin_pagetree_children_loading_wrapper").remove();if(L!=null){var X=V.html();V.html(Y+X)}else{V.append(Y)}T=true;if(typeof H!=="undefined"){var Z=f("#"+H).offset().top-N;document.getElementsByClassName("acs-side-bar")[0].scrollTop=document.getElementsByClassName("acs-side-bar")[0].scrollTop+Z}if(V.children().length&&V.hasClass("hidden")){V.removeClass("hidden")}f("#plusminus"+Q).addClass("aui-iconfont-chevron-down").removeClass("aui-iconfont-chevron-right");f("#childrenspan"+c[parseInt(D)]+"-"+D).addClass("plugin_pagetree_current");if(I){p(Q)}if(typeof F!=="undefined"){F.setAttribute("data-children-loaded",true);F.setAttribute("data-expanded",true)}if(O){f("#children"+J+" > ul > .page-tree-load-more-link-after").remove()}if(L){f("#children"+J+" > ul > .page-tree-load-more-link-before").remove()}q(V);if(AJS.PageGadget&&AJS.PageGadget.contentsUpdated){AJS.PageGadget.contentsUpdated()}}else{window.location=P.loginUrl}AJS.trigger("pagetree-children-loaded")},error:function(X){if(X.status=="403"){V.text(P["i18n-pagetree.error.permission"])}else{V.text(P["i18n-pagetree.error.general"])}}})};var q=function(B){f("div.plugin_pagetree_children_container:empty",B).addClass("hidden")};function t(F){var E=F.target;var D=E.getAttribute("data-type");var C=F.currentTarget.getAttribute("data-mobile")==="true";if(D==="toggle"){F.preventDefault();F.stopPropagation();k(F.target,null,null,null,C)}else{if(D==="load-all-after"){var I=E.getAttribute("data-last-rendered-id");var H=E.getAttribute("data-page-id")+"-"+E.getAttribute("data-tree-id");h(F.target,H,new Array(),null,"","",C,false,true,I,null)}else{if(D==="load-all-before"){var B=E.getAttribute("data-first-rendered-id");var H=E.getAttribute("data-page-id")+"-"+E.getAttribute("data-tree-id");var G="childrenspan"+B+"-"+E.getAttribute("data-tree-id");h(F.target,H,new Array(),null,"","",C,false,false,null,B,G)}else{return}}}F.preventDefault();F.stopPropagation()}var w=function(B,G,I){B[0].addEventListener("click",t,{passive:false});var E=m(B);var H=E.noRoot=="true";var D=H?"Orphan-"+G:E.rootPageId+"-"+G;var C=E.mobile=="true";if(C){B[0].setAttribute("data-mobile",C)}u[G]=E.treeRequestId;if(C==false){c[G]=AJS.params.pageId}else{c[G]=f("div.content-container").parent().attr("data-content-id")}B.children("fieldset").each(function(){var J=f(this);J.children("input[treeId]").attr("value",G);J.children("input[rootPage]").attr("value",D)});if(H){B.find("div.plugin_pagetree_children").attr("id","childrenOrphan-"+G);B.find("a.plugin_pagetree_expandall").click(function(J){g("childrenOrphan-"+G,J,C);return false});B.find("a.plugin_pagetree_collapseall").click(function(J){v("childrenOrphan-"+G,J,C);return false})}else{B.find("div.plugin_pagetree_children").attr("id","children"+D);B.find("a.plugin_pagetree_expandall").click(function(J){g("children"+D,J,C);return false});B.find("a.plugin_pagetree_collapseall").click(function(J){v("children"+D,J,C);return false})}var F=l(B);h(undefined,D,F,E.startDepth,E.spaceKey,"",C,false,I,null,null)};this.initPageTrees=function(B){f("div.plugin_pagetree").each(function(C){w(f(this),C,B)});A()};var A=function(){var B=self.placeFocus;if(B){self.placeFocus=function(){var C=f("form[name='pagetreesearchform']");C.attr("name","inlinecommentform");B();C.attr("name","pagetreesearchform")}}};f(".open-flyout-to-search").bind("click",function(B){if(f(".fly-out-open").length){setTimeout(function(){ConfluenceMobile.flyout.hide()},400)}else{setTimeout(function(){ConfluenceMobile.flyout.show()},400)}B.stopPropagation();B.preventDefault()})};Confluence=Confluence||{};Confluence.Plugins=Confluence.Plugins||{};Confluence.Plugins.PagetreeMacro={bind:function(b){var c=new a(b);c.initPageTrees(false)}}})();