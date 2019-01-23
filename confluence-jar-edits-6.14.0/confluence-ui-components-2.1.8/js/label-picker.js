/**
 * A generic, reusable label picker component. The component itself is just select2 (http://ivaynberg.github.io/select2/)
 * with a custom placeholder/formatting/createSearchChoice properties. You can customize the component in the same way as you could
 * customize a standard select2.
 *
 * The default behaviour searches across all labels in the site. You can restrict it by passing in a data object to ajaxOpts.
 *
 * Usage:
 *
 * Minimum case: $("#label-search").auiSelect2(require('confluence-ui-components/js/label-picker').build());
 *
 * If you want to customize the behaviour of the picker or the underlying select2, pass in an opts object
 * that has the additional options for select2.
 *
 * $("#label-search").auiSelect2(require('confluence-ui-components/js/label-picker').build({
 *   placeholder: "my-placeholder"
 * }));
 *
 * If you want to pass extra options to the labels autocomplete endpoint query, use the queryOpts option
 *
 * $("#label-search").auiSelect2(require('confluence-ui-components/js/label-picker').build({
 *   queryOpts : {
 *     spaceKey : 'ABCD'
 *   }
 * }));
 *
 * Legacy usage is via Confluence.UI.Components.LabelPicker
 */
define('confluence-ui-components/js/label-picker',
    [
        'ajs',
        'confluence-ui-components/js/internal/soy-templates',
        'jquery',
        'underscore'
    ],
    function (AJS,
              SoyTemplates,
              $,
              _) {
        'use strict';

        // Colon : is allowed
        var invalidCharactersRegex = /[;,\.\?&\[\(\)#\^\*@!<>\]]/g;

        function validateLabelName(labelName) {
            var uniqueInvalidCharacters = _.uniq(labelName.match(invalidCharactersRegex));
            return uniqueInvalidCharacters.join(' ');
        }

        function matchToLabel(contentNameMatch) {
            return {
                id: contentNameMatch.name,
                text: contentNameMatch.name
            };
        }

        // Sort selection order by label name
        function convertAndSortLabelMatches(matches) {
            if (!matches || !matches.length) {
                return null;
            }

            var labels = _.map(matches, matchToLabel);
            return _.sortBy(labels, function (label) {
                return label.text.toLowerCase();
            });
        }

        function processResponseData(data) {
            var matches = data.contentNameMatches;
            var suggestedLabels = convertAndSortLabelMatches(matches[0]);
            var otherLabels = convertAndSortLabelMatches(matches[1]);

            // NOTE: The autocompletelabel.action is currently only returning the "other" results array for performance
            // reasons, but when suggested labels are reinstated this component should support them.
            if (suggestedLabels && otherLabels) {
                return [
                    {
                        text: AJS.I18n.getText('confluence-ui-components.label-picker.suggested'),
                        children: suggestedLabels
                    },
                    {
                        text: AJS.I18n.getText('confluence-ui-components.label-picker.other'),
                        children: otherLabels
                    }
                ];
            }

            return suggestedLabels || otherLabels || [];
        }

        function buildAjaxDataFunction(ajaxQueryOpts) {
            return function (searchTerm) {
                return $.extend({
                    query: searchTerm,
                    // Don't search for suggested labels - causes performance issues.
                    ignoreRelated: true,
                    maxResults: 10
                }, ajaxQueryOpts);
            };
        }

        var select2Opts = {
            placeholder: AJS.I18n.getText('confluence-ui-components.label-picker.placeholder'),

            multiple: true,
            minimumInputLength: 1,
            maximumSelectionSize: 20,
            tokenSeparators: [' ', ','],
            formatInputTooShort: function (term, minLength) {
                return AJS.I18n.getText("confluence-ui-components.label-picker.prompt");
            },
            formatSelectionTooBig: function (maxSize) {
                return AJS.I18n.getText("confluence-ui-components.label-picker.maximum.reached", maxSize);
            },
            formatResult: function (result) {
                return SoyTemplates.LabelPicker().labelResult({
                    label: {
                        labelName: result.text,
                        isNew: result.isNew
                    }
                });
            },
            formatNoMatches: function (term) {
                var invalidCharacters = validateLabelName(term);
                if (invalidCharacters) {
                    return SoyTemplates.LabelPicker().labelInvalid({
                        "inputValue": term,
                        "invalidCharacters": invalidCharacters
                    });
                }

                return this.noMatches;
            },
            createSearchChoice: function (term) {
                if (!term) {
                    return null;
                }

                // validate input value. If validated add into the select list
                var invalidCharacters = validateLabelName(term);
                if (invalidCharacters) {
                    return null;
                }
                return {
                    id: term,
                    text: term,
                    isNew: true
                };
            },
            ajax: {
                data: buildAjaxDataFunction(),
                dataType: "json",
                url: AJS.contextPath() + "/labels/autocompletelabel.action",
                results: function (data) {
                    return {
                        results: processResponseData(data)
                    };
                },
                quietMillis: 300
            },
            dropdownCssClass: 'labels-dropdown',
            containerCssClass: 'labels-autocomplete',

            // Required so that val() can be called on the select2 element. This simple implementation just uses the same
            // string for the id and text used for each value being set.
            initSelection: function (element, callback) {
                var labels = element.val().split(',');
                var data = _.map(labels, function (label) {
                    return {id: label, text: label};
                });
                callback(data);
            }
        };

        /**
         * @param opts Options from the select2 API. They will override the defaults that are provided by the Label Picker. Include a queryOpts object to pass extra parameters to the ajax query.
         */
        function build(opts) {
            var extendedOpts = $.extend({}, select2Opts, opts);

            if (opts && opts.queryOpts) {
                extendedOpts.ajax.data = buildAjaxDataFunction(opts.queryOpts);
                delete extendedOpts.queryOpts;
            }

            if (!opts || !opts.noMatches) {
                /*
                 The text displayed when the search term is legit but no results are found.
                 We use a separate option to allow callers to override the displayed text, but the default is the
                 placeholder string.
                 */
                extendedOpts.noMatches = extendedOpts.placeholder;
            }

            return extendedOpts;
        }

        return {
            build: build
        };
    });
