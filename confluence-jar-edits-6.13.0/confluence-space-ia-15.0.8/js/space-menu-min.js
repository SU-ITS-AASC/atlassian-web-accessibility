AJS.toInit(function(e){var n=e(Confluence.Templates.BrowseSpaces.spacesLink());e("#space-directory-link").replaceWith(e(n));var c=function(n){var c=e("#space-menu-link-content");c.html(n.template),AJS&&AJS.Confluence&&AJS.Confluence.Analytics&&AJS.Confluence.Analytics.setAnalyticsSource&&AJS.Confluence.Analytics.setAnalyticsSource(c.find("a"),"spacemenu"),e("#create-space-header").click(function(){return AJS.trigger("analytics",{name:"create-space-from-header"}),Confluence.SpaceBlueprint.Dialog.launch(),!1})};e("#space-menu-link-content").on("aui-dropdown2-show",function(){if(AJS.trigger("analytics",{name:"open-space-menu"}),!e("#space-menu-link-content .aui-dropdown2-section")||!e("#space-menu-link-content .aui-dropdown2-section").length){e.ajax({url:Confluence.getContextPath()+"/rest/ia/1.0/spacesmenu",type:"GET",dataType:"json",cache:!1,success:c});var n=setInterval(function(){console.log("Spaces Button Clicked"),e("#space-menu-link-content div:first-child ul li:first-child a").length&&(clearInterval(n),e("#space-menu-link-content div:first-child ul li:first-child a").attr("tabindex","-1").focus())},50)}return!1})});