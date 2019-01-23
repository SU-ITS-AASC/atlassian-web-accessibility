define('confluence-ui-components/js/cql/internal/filterfields/cql-user-filter-field',
    [
        'jquery',
        'ajs',
        'confluence-ui-components/js/user-group-select2'
    ],
    /**
     * Provides setup and behaviour for User CQL filter fields
     */
    function ($,
              AJS,
              autocompleteMultiUser) {

        'use strict';

        function build() {

            var $input;

            function extractUser(response) {
                var user = response[0].result[0];    // first AJAX response arg, first user in search result...
                return {
                    id: user.username,
                    text: user.title,
                    imgSrc: user.thumbnailLink.href
                };
            }

            return {
                setupInput: function (input) {
                    $input = input;

                    input.addClass('select2-input autocomplete-multiusergroup');

                    autocompleteMultiUser.bind(input.parent());
                },

                /**
                 Setting user values is a little bit interesting. The values stored in CQL are only usernames and don't
                 include things required for rendering, i.e. Full Name and Avatar.

                 This filter field delegates to the autocompleteMultiUser component. The component uses our legacy
                 prototype REST API user search for its User data, so we call the API manually here to retrieve the
                 User render data.

                 The legacy API only allows searching on one string at a time (natch), so we must make a separate AJAX
                 request for each user to display. Crappy, right? Bring on RA's common Atlassian User REST API, right?

                 @param expression CQL query expression
                 */
                setValues: function (expression) {
                    var values = expression.values;
                    if (!values || !values[0]) {
                        return;
                    }

                    var deferreds = values.map(function (username) {
                        return $.getJSON(AJS.contextPath() + "/rest/prototype/1/search/user.json?query=" + encodeURI(username));
                    });

                    function renderUsers() {
                        // jQuery.when.done function will receive an array of responses if more than one request, but just
                        // the response object if only one. Wrap the single response in an array... and everything matches.
                        var responses = deferreds.length > 1 ? arguments : [arguments];

                        var data = responses.map(extractUser);
                        $input.auiSelect2("data", data);
                    }

                    return $.when.apply($, deferreds).done(renderUsers);
                }
            };
        }

        return {
            build: build
        };
    });
