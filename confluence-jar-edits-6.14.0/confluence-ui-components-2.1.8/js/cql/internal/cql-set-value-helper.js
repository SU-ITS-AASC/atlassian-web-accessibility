define('confluence-ui-components/js/cql/internal/cql-set-value-helper',
    [
        'jquery'
    ],
    /**
     * Sets values into a CQL filter input field and resolves the returned deferred object when the change event has been
     * fired on the input field, indicating it has resolved any ajax requests it needed to correctly populate the field
     */
    function ($) {
        'use strict';

        function setValues($input, values) {
            var fieldDeferred = $.Deferred();
            $input.on('change', function () {
                fieldDeferred.resolve();
            });

            var triggerChangeEvent = true;
            $input.select2("val", values, triggerChangeEvent);
            return fieldDeferred;
        }

        return {
            setValues: setValues
        };
    });