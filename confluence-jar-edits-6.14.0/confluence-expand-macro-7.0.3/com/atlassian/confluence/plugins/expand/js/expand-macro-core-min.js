(function(){var a=function(b){this.$=b;this.createToggleFunction=function(e){var d=this.$;return function c(i){if(typeof e!="undefined"&&!e(i)){return}var f=d(this),g=d(".expand-icon",f),h=d(".expand-content",f.closest(".expand-container")).first();var j;if(h.hasClass("expand-hidden")){g.removeClass("aui-iconfont-chevron-right").addClass("aui-iconfont-chevron-down");h.css("display","block");h.animate({opacity:1});j="expand"}else{g.removeClass("aui-iconfont-chevron-down").addClass("aui-iconfont-chevron-right");h.animate({opacity:0},{complete:function(){h.hide()}});j="collapse"}h.toggleClass("expand-hidden");if(j==="expand"){AJS.trigger("confluence.expand-macro.expanded")}else{AJS.trigger("confluence.expand-macro.collapsed")}AJS.trigger("analyticsEvent",{name:"confluence.expand-macro.expand-click",data:{userAction:j}})}};this.getExpandElements=function(c){return this.$(".expand-control",c)}};if(typeof Confluence==="undefined"){Confluence={}}if(typeof Confluence.Plugins==="undefined"){Confluence.Plugins={}}Confluence.Plugins.ExpandMacro={bind:function(b,c,g,f){var e=new a(b);var d=e.getExpandElements(c);d.length&&d.bind(g,e.createToggleFunction(f))}}})();