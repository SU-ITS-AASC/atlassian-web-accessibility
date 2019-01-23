AJS.toInit(function ($) {


    var spaceKey = AJS.Meta.get("space-key");

    if (!spaceKey) {
        // CONFDEV-15964 In Documentation theme space key is defined as meta data with another name
        spaceKey = $('meta[name=confluence-space-key]').attr("content");
    }

    var promoteTemplatePath = "/rest/create-dialog/1.0/promotion/promote-template/";

    $.ajax({
        url: Confluence.getContextPath() + promoteTemplatePath,
        data: {spaceKey: spaceKey},
        type: "GET",
        contentType: "application/json"
    }).done(function(data) {
         // Add promoted/ demoted link to page templates
        $('#pagetemplates-table').find('tr[data-pagetemplate-id]').each(function(){
            var template = $(this),
                templateId = template.data('pagetemplate-id'),
                operationsTag = template.find('.template-operations'),
                middot = Confluence.Templates.Blueprints.Promoted.middot(),
                promoteTemplateLink = Confluence.Templates.Blueprints.Promoted.promoteTemplateLink({
                    templatePromoted: _.contains(data, templateId)
                });

            if (!operationsTag.is(':empty')){
                operationsTag.prepend(middot);
            }

            operationsTag.prepend(promoteTemplateLink);
            template.find('.promoted-template-link').tooltip({aria:true});
        });
    });

    $('#pagetemplates-table').on('click', ".promoted-template-link", function () {
        var $button = $(this),
            promoted = $button.attr("data-promoted") === "true", // if you use $.data here it doesn't fetch it correctly from the dom
            templateId = $button.parents('tr[data-pagetemplate-id]').data('pagetemplate-id');
        togglePromotedState($button, promoted, templateId);

        event.preventDefault();
    });

    var togglePromotedState = function ($button, state, templateId) {
        $button.disable();

        AJS.trigger('analytics', { name: 'blueprint.user.template.' + (state ? 'unpromote' : 'promote') , data: {} });

        $.ajax({
            url: Confluence.getContextPath() + promoteTemplatePath + templateId + '?' + jQuery.param({spaceKey: spaceKey}),
            type: state ? "DELETE" : "PUT",
            contentType: "application/json"
        }).done(function () {
            $button.attr("data-promoted", !state); // if you use $.data here it doesn't update the dom attribute
            $button.text(state ? AJS.I18n.getText("create.content.plugin.templates.promoted.name") : AJS.I18n.getText("create.content.plugin.templates.non.promoted.name"));
        }).fail(function() {
            AJS.log("Could not promote/demote template with id: " + templateId);
        }).always(function(){
            $button.enable();
        });
    }
});