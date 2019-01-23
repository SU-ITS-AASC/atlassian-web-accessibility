define('confluence-ui-components/js/user-group-select2', [
    'ajs',
    'confluence-ui-components/js/internal/soy-templates',
    'jquery'
], function (
    AJS,
    SoyTemplates,
    $
) {
    'use strict';

    /**
     * Locates inputs marked as multi-user autocompletes in the container and initialises them.
     *
     * @param scope to find unbound autocomplete inputs in
     */
    function bind(scope) {
        scope = scope || document.body;
        var showNoResultsIfAllResultsDisabled = function () {
            var $results = $('.select2-drop-active > .select2-results');
            if ($results.children('.select2-result-selectable').length === 0 &&
                $results.children('.select2-disabled').length) {

                $results.append('<li class="select2-no-results">' +
                    AJS.escapeHtml(AJS.I18n.getText('usersearch.no.results')) + '</li>');
            }
        };

        $("input.autocomplete-multiusergroup[data-autocomplete-bound != 'true']", scope).each(function () {
            var picker = $(this);
            picker.attr('data-autocomplete-bound', 'true');
            var includeGroups = picker.attr('data-include-groups');

            picker.auiSelect2({
                multiple: true,
                minimumInputLength: 2,
                formatInputTooShort: function () {
                    return includeGroups ? AJS.I18n.getText("confluence-ui-components.user-group-select2.usergroup.prompt")
                        : AJS.I18n.getText("confluence-ui-components.user-group-select2.user.prompt");
                },
                ajax: {
                    transport: function (opts) {
                        // Workaround for Select2 bug: https://github.com/ivaynberg/select2/issues/381
                        // Select2 does not display "no results found" if the only results are already selected.
                        var success = opts.success;
                        delete opts.success;

                        return $.ajax.apply($.ajax, arguments).done(success).done(showNoResultsIfAllResultsDisabled);
                    },
                    data: function (searchTerm) {
                        return {
                            "max-results": 6,
                            query: searchTerm
                        };
                    },
                    dataType: 'json',
                    url: AJS.contextPath() + "/rest/prototype/1/search/user" + (includeGroups ? "-or-group" : "") + ".json",
                    results: function (data) {
                        var results = [];
                        $.each(data.result, function () {
                            if (this.type === "user") {
                                results.push({
                                    id: this.username,
                                    text: this.title,
                                    imgSrc: this.thumbnailLink.href,
                                    entity: this
                                });
                            } else {
                                results.push({
                                    id: this.name,
                                    text: this.name,
                                    imgSrc: AJS.contextPath() + "/images/icons/avatar_group_48.png",
                                    entity: this
                                });
                            }
                        });
                        return {
                            results: results
                        };
                    },
                    quietMillis: 300
                },
                formatResult: function (result) {
                    return SoyTemplates.UserGroupSelect2().avatarWithName({
                        size: 'small',
                        displayName: result.text,
                        userId: result.id,
                        avatarImageUrl: result.imgSrc
                    });
                },
                // common.Widget.avatarWithName handles escaping so this doesn't have to
                escapeMarkup: function (markup) {
                    return markup;
                },
                formatSelection: function (result) {
                    return SoyTemplates.UserGroupSelect2().avatarWithName({
                        size: 'xsmall',
                        displayName: result.text,
                        userId: result.id,
                        avatarImageUrl: result.imgSrc
                    });
                },
                dropdownCssClass: 'users-dropdown',
                containerCssClass: 'users-autocomplete',
                hasAvatar: true
            });

            // Logged in user will appear by default if this attribute is defined
            if (!picker.data("autofill-user")) {
                return;
            }
            var loggedInUser = AJS.Meta.get('remote-user');
            var loggedInUserFullName = AJS.Meta.get('current-user-fullname');
            var loggedInUserAvatarUrl = AJS.Meta.get('current-user-avatar-uri-reference');

            if (loggedInUser && loggedInUserFullName && loggedInUserAvatarUrl) {
                picker.auiSelect2('data',
                    [{id: loggedInUser, text: loggedInUserFullName, imgSrc: loggedInUserAvatarUrl}]
                );
            }
        });
    }

    return {
        bind: bind
    }
});
