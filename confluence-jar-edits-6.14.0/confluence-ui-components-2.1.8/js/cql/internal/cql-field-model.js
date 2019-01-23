define('confluence-ui-components/js/cql/internal/cql-field-model', [],
    /**
     * Works with back-end QueryField objects.
     */
    function () {

        'use strict';

        function getLabel(field) {
            return field.uiSupport.label.translation;
        }

        return {
            getLabel: getLabel
        };
    });