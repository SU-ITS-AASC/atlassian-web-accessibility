/**
 * Locates inputs marked as multi-user autocompletes in the container and initialises them.
 *
 * @param scope to find unbound autocomplete inputs in
 */
Confluence.Binder.autocompleteMultiUser = function(scope) {
    scope = scope || document.body;
    var $ = AJS.$;
    var showNoResultsIfAllResultsDisabled = function() {
        var $results = $('.select2-drop-active > .select2-results');
        if ($results.children('.select2-result-selectable').length === 0 &&
            $results.children('.select2-disabled').length) {

            $results.append('<li class="select2-no-results">' +
                AJS.escapeHtml(AJS.I18n.getText('usersearch.no.results')) + '</li>');
        }
    };

    $("input.autocomplete-multiuser[data-autocomplete-bound != 'true']", scope).each(function() {
        var picker = $(this);

        picker.auiSelect2({
            multiple: true,
            minimumInputLength: 2,
            formatInputTooShort: function () {
                return AJS.I18n.getText("common.widget.user.multiselect.prompt");
            },
            ajax: {
                transport: function(opts) {
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
                url: Confluence.getContextPath() + "/rest/prototype/1/search/user.json",
                results: function (data) {
                    // Should be a $.map or something fancy. dT
                    var results = [];
                    $.each(data.result, function () {
                        results.push({
                            id: this.username,
                            text: this.title,
                            imgSrc: this.thumbnailLink.href
                        });
                    });
                    return {
                        results: results
                    };
                },
                quietMillis: 300
            },
            formatResult: function (result) {
                return CreateContent.avatar.avatarWithName({
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
            formatSelection: function(result) {
                return CreateContent.avatar.avatarWithName({
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
        if (!picker.data("autofill-user"))
            return;

        var loggedInUser = AJS.Meta.get('remote-user'),
            loggedInUserFullName = AJS.Meta.get('current-user-fullname'),
            loggedInUserAvatarUrl = AJS.Meta.get('current-user-avatar-url');

        if (loggedInUser && loggedInUserFullName && loggedInUserAvatarUrl) {
            picker.auiSelect2('data',
                [{id: loggedInUser, text: loggedInUserFullName, imgSrc: AJS.contextPath() + loggedInUserAvatarUrl}]
            );
        }
    });
};
