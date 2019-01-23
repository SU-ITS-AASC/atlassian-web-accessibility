define('confluence-ui-components/js/cql/internal/filterfields/cql-type-suggestions',
    [
        'ajs'
    ],
    /**
     * Provides suggested options for CQL 'Type' filter fields.
     */
    function (AJS) {
        'use strict';

        /**
         * Returns a list of hard-coded Type suggestions for the Search screen CQL component.
         *
         * This method should in future be able to load suggestions from some data in the DOM, such as via AJS.Data.
         * Reasoning for not using AJAX for this list is that the Search page needs to be able to display the suggestion
         * list as the page renders, not later.
         */

        var hardcodedList = [
            {
                type: '',
                label: AJS.I18n.getText('confluence-ui-components.type-picker.suggestion.all')
            },
            {
                type: 'page',
                label: AJS.I18n.getText('confluence-ui-components.type-picker.suggestion.page')
            },
            {
                type: 'blogpost',
                label: AJS.I18n.getText('confluence-ui-components.type-picker.suggestion.blogpost')
            },
            {
                type: 'attachment',
                label: AJS.I18n.getText('confluence-ui-components.type-picker.suggestion.attachment')
            },
            {
                type: 'space',
                label: AJS.I18n.getText('confluence-ui-components.type-picker.suggestion.space')
            }
        ];

        function getList() {
            return hardcodedList;
        }

        return {
            getList: getList
        };
    });
