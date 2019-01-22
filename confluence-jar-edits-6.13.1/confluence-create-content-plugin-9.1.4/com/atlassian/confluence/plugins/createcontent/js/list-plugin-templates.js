AJS.toInit(function ($) {

    function toggleTrigger($button, isContentBP, url, blueprintId, blueprintItem) {
        var enabled = $button.attr('data-enabled') === "true"; // if you use $.data here it doesn't update the dom attribute

        AJS.trigger('analytics', { name: 'blueprint.template.' + (enabled ? 'disable' : 'enable') , data: {} });

        $.ajax({
            url: url,
            type: enabled ? "DELETE" : "PUT",
            contentType: "application/vnd.atl.plugins.plugin.module+json",
            success: function (data) {
                $button.attr("data-enabled", !enabled);
                $button.text(enabled ? AJS.I18n.getText("enable.name") : AJS.I18n.getText("disable.name"));
                blueprintItem.toggleClass("disabled", enabled);
                if (isContentBP)
                {
                    var $promoteLink = $button.siblings(".promoted-state-toggle-trigger");
                    enabled ? $promoteLink.disable() : $promoteLink.enable(); // disable promote link if blueprint is disabled and vice versa
                }
            },
            error: function() {
                AJS.log("Could not enable/disable blueprint with id: " + blueprintId);
            }
        });

        return false;
    }

    $("#content-blueprint-templates .module-state-toggle-trigger").click(function () {
        var spaceKey = AJS.Meta.get("space-key") || $('meta[name=confluence-space-key]').attr("content"),
            $button = $(this),
            blueprintItem = $button.closest('.web-item-module'),
            blueprintId = blueprintItem.data("content-blueprint-id"),
            url = Confluence.getContextPath() + "/rest/create-dialog/1.0/modules/" + blueprintId + (spaceKey ? "?spaceKey=" + spaceKey : "");

        return toggleTrigger($button, true, url, blueprintId, blueprintItem);
    });

    $("#space-blueprints-admin-table .module-state-toggle-trigger").click(function () {
        var $button = $(this),
            blueprintItem = $button.closest('.web-item-module'),
            blueprintId = blueprintItem.data("space-blueprint-id"),
            url = Confluence.getContextPath() + "/rest/create-dialog/1.0/modules/space-blueprint/" + blueprintId;

        return toggleTrigger($button, true, url, blueprintId, blueprintItem);
    });

    $(".web-item-module .template-operations a").click(function (e) {
        if ($(this).closest(".web-item-module").is(".disabled")) {
            e.preventDefault();
            e.stopPropagation();
        }
    });

    var $promotedLink = $(".promoted-state-toggle-trigger");
    $promotedLink.tooltip({aria:true});

    $promotedLink.click(function (event) {
        var $button = $(this),
            promoted = $button.attr('data-promoted') === "true"; // if you use $.data here it doesn't fetch it correctly from the dom

        togglePromotedState($button, promoted);
        event.preventDefault();
    });

    var togglePromotedState = function (button, state) {
        var $button = button,
            blueprintId = $button.closest('.web-item-module').data('content-blueprint-id'),
            spaceKey = AJS.Meta.get("space-key");

        if (!spaceKey) {
            // CONFDEV-15964 In Documentation theme space key is defined as meta data with another name
            spaceKey = $('meta[name=confluence-space-key]').attr("content");
        }

        $button.disable();

        AJS.trigger('analytics', { name: 'blueprint.template.' + (state ? 'unpromote' : 'promote') , data: {} });

         $.ajax({
            url: Confluence.getContextPath() + "/rest/create-dialog/1.0/promotion/promote-blueprint/" + blueprintId + (spaceKey ? "?spaceKey=" + spaceKey : ""),
            type: state ? "DELETE" : "PUT",
            contentType: "application/json"
        }).done(function () {
            $button.attr("data-promoted", !state); // if you use $.data here it doesn't update the dom attribute
            $button.text(state ? AJS.I18n.getText("create.content.plugin.templates.promoted.name") : AJS.I18n.getText("create.content.plugin.templates.non.promoted.name"));
        }).fail(function() {
            AJS.log("Could not promote/demote blueprint with id: " + blueprintId);
        }).always(function(){
            $button.enable();
        });
    }
});