AJS.toInit(function(d){var f=require("confluence/form-state-control"),a=AJS.Meta.get("space-key");a||(a=d("meta[name\x3dconfluence-space-key]").attr("content"));d.ajax({url:Confluence.getContextPath()+"/rest/create-dialog/1.0/promotion/promote-template/",data:{spaceKey:a},type:"GET",contentType:"application/json"}).done(function(b){d("#pagetemplates-table").find("tr[data-pagetemplate-id]").each(function(){var c=d(this),e=c.data("pagetemplate-id"),a=c.find(".template-operations"),f=Confluence.Templates.Blueprints.Promoted.middot();
e=Confluence.Templates.Blueprints.Promoted.promoteTemplateLink({templatePromoted:_.contains(b,e)});a.is(":empty")||a.prepend(f);a.prepend(e);c.find(".promoted-template-link").tooltip({aria:!0})})});d("#pagetemplates-table").on("click",".promoted-template-link",function(){var b=d(this),c="true"===b.attr("data-promoted"),a=b.parents("tr[data-pagetemplate-id]").data("pagetemplate-id");g(b,c,a);event.preventDefault()});var g=function(b,c,e){f.disableElement(b);AJS.trigger("analytics",{name:"blueprint.user.template."+
(c?"unpromote":"promote"),data:{}});d.ajax({url:Confluence.getContextPath()+"/rest/create-dialog/1.0/promotion/promote-template/"+e+"?"+jQuery.param({spaceKey:a}),type:c?"DELETE":"PUT",contentType:"application/json"}).done(function(){b.attr("data-promoted",!c);b.text(c?AJS.I18n.getText("create.content.plugin.templates.promoted.name"):AJS.I18n.getText("create.content.plugin.templates.non.promoted.name"))}).fail(function(){AJS.log("Could not promote/demote template with id: "+e)}).always(function(){f.enableElement(b)})}});