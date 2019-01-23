/**
 * A control for selecting CQL filter fields to add to the CQL component UI.
 */
define('confluence-ui-components/js/cql/internal/cql-filter-select', [
    'jquery',
    'underscore',
    'ajs',
    'confluence-ui-components/js/cql/internal/cql-ajax',
    'confluence-ui-components/js/cql/internal/cql-field-model',
    'confluence-ui-components/js/cql/internal/cql-soy-templates'
], function (
    $,
    _,
    AJS,
    cqlAjax,
    fieldModel,
    SoyTemplates
) {

    'use strict';

    var filterSelectTemplates = SoyTemplates.FilterSelect;

    /**
     * Builds a filter-select instance.
     *
     * Expected options include:
     *   onSelection - called when a filter is selected
     *   cqlContainer - the jQuery-wrapped DOM element that the filter should append itself to
     *   context - object with the environment the CQL component is running in, may be macro-browser, search-screen
     */
    function build(options) {

        var cqlContainer = options.cqlContainer;
        var cqlFieldContainer = cqlContainer.find('.cql-fields');

        var onSelection = options.onSelection;
        if (!onSelection) {
            throw Error("An onSelection callback must be provided to the FilterSelect.");
        }

        // TODO CRA-421 reinstate or remove.
        //var dupeFieldsAllowed = options.dupeFieldsAllowed || false;

        var $container = $(filterSelectTemplates().container());
        var $trigger = $container.children('button');
        var $inputWrapper = $container.find('.input-wrapper');
        var $input = $container.find('input');

        function showInput(e) {
            e.preventDefault();
            $inputWrapper.removeClass('hidden');    // display the select2 component.
            $trigger.hide();

            // Trigger the select2
            $container.find('.select2-choice').mousedown();
        }

        $trigger.click(showInput);

        function showTrigger() {
            $inputWrapper.addClass('hidden');
            $trigger.show();
        }

        $input.bind('select2-close', function () {
            AJS.debug('CQL Field selector closed');
            showTrigger();

            // If the trigger was shown by cancelling the selector rather than making a selection (in which case the
            // focus would have gone to the newly-added field), then focus the trigger. This makes keyboard navigation
            // consistent when tabbing to the trigger, hitting enter to get the select, then hitting escape to close it.
            // This select2-close binding is invoked before the input-change binding, so delay this check to give the
            // change binding time to run and focus a chosen field.
            setTimeout(function () {
                AJS.log('Checking CQL Field selector focus');
                if (!$(document.activeElement).closest('.cql-filter').length) {
                    AJS.debug('Setting CQL Field selector focus');
                    $trigger.focus();
                }
            }, 1);

        });

        cqlContainer.append($container);

        function onInputChange(e) {
            // This control reverts to its placeholder when a selection is made (ugh, really?) and it's up to
            // the callee to do what it likes with the field object selected.

            if (!e.added) {
                // We don't expect remove events
                return;
            }

            // Clear the selection and show the placeholder.
            $input.auiSelect2("val", "");

            //// Remove added fields from the list of fields that may be added - we need a reversal for this when
            //// fields are removed in the UI.
            //if (!dupeFieldsAllowed) {
            //    fields = _.reject(fields, function (field) {
            //        return field.fieldName == e.added.fieldName;
            //    });
            //}

            // Let the callee go nuts with the value.
            onSelection(e.added);
            AJS.debug('CQL Field selection made');
            showTrigger();
        }

        function setupInput(fields) {

            if (options.context.environment !== 'search-screen' && !AJS.DarkFeatures.isEnabled('cql.search.screen')) {
                fields = _.reject(fields, function (field) {
                    // CRA-692. Hide Date fields from the macro browser until compact date picker is developed.
                    return field.type === 'date';
                });
            }

            // Remove ignored fields
            fields = _.reject(fields, function (field) {
                return _.contains(options.ignoredFields, field.fieldName);
            });

            function calculateResults() {
                // The displayed fields form a registry of CQL fields "in play". Some fields can be duplicated
                // (i.e. contentRelation="many" and not "one") but the rest should be ignored when generating
                // the list to be presented in the Add Filter control.
                // However, doing the lookup this way could be too slow when typing... let's find out.
                //cqlFieldContainer = cqlFieldContainer || $input.closest('.cql-container');
                if (!cqlFieldContainer[0]) {
                    throw new Error('Why no cql-container?');
                }
                var usedFields = cqlFieldContainer.find('.cql-filter').map(function () {
                    return $(this).data('fieldName');
                });

                var results = _.reject(fields, function (field) {
                    //space is rejected as a filter that can be repeated more than once because this component does not
                    //handle it properly, and the cql expression backend does not handle multiple space.type properly as well
                    //see CRA-440, and CONFDEV-36875 for clarification.
                    return _.contains(usedFields, field.fieldName) && !_.contains(['label' /*'space'*/], field.fieldName);
                    // TODO CRA-440 use contentRelation returned from server. dT
                    //return field.contentRelation !== 'many' && _.contains(usedFields, field.fieldName);
                });
                return {
                    results: results,
                    text: fieldModel.getLabel
                };
            }

            $input.auiSelect2({
                id: 'fieldName',
                data: calculateResults,
                formatResult: fieldModel.getLabel,
                formatSelection: fieldModel.getLabel,
                placeholder: AJS.I18n.getText('confluence-ui-components.cql-filter-select.link')
            })
                .change(onInputChange);
        }

        function dieInAFire() {
            // CRA-439 we could show a standard error message / retry, if such a thing existed.
            AJS.log("Couldn't fetch CQL fields - unable to initialise CQL field picker");
        }

        cqlAjax.getFields()
            .done(setupInput)
            .fail(dieInAFire);

        return $input;
    }

    return {
        build: build
    };
});
