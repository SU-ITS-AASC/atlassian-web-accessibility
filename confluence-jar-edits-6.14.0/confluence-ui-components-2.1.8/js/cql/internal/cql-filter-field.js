/**
 * A CQL Filter field is a component that represents a CQL filter in the UI.
 *
 * A CQL filter is a clause such as "space in (key1, key2)" or "title ~ sometitle" in a CQL expression, and can be
 * represented in the UI via three main UI components:
 *
 *   1. Label
 *   2. Description
 *   3. Input control
 *
 * The input control used will depend on the type of field - a space filter might have a SpacePicker control, while a
 * title filter might have a simple text field.
 *
 * Every CQL filter field provides an "asCql" method that takes the current value of the field and returns a CQL clause.
 */
define('confluence-ui-components/js/cql/internal/cql-filter-field', [
    'jquery',
    'underscore',
    'ajs',
    'confluence-ui-components/js/cql/internal/cql-field-model',
    'confluence-ui-components/js/cql/internal/cql-expression-builder',
    'confluence-ui-components/js/cql/internal/filterfields/cql-filter-field-configs',
    'confluence-ui-components/js/cql/internal/cql-soy-templates'
], function (
    $,
    _,
    AJS,
    fieldModel,
    expressionBuilder,
    filterFieldConfigs,
    SoyTemplates
) {
    'use strict';

    // Temporary until these components are registered with define().
    var fieldTemplates = SoyTemplates.Filters;

    /*
     To ensure that all fields have unique ids for <label for="id">, add a counter suffix to each id.
     This id could be anything - e.g. a UUID - and shouldn't be targeted by any JS or WebDriver code.
     */
    var fieldCounter = 0;

    function makeField(field) {

        var label = fieldModel.getLabel(field);

        var fieldDiv = $(fieldTemplates().baseFilterField({
            label: label,
            field: field,
            counter: fieldCounter++
        }));

        var input = fieldDiv.find('input');
        fieldDiv.data('fieldName', field.fieldName);

        return $.extend({
            input: input,
            element: fieldDiv,
            onChange: function (callback) {
                input.change(callback);
            }
        }, field);
    }

    /**
     * Creates a new filter-field control. The field parameter has:
     * <ul>
     *     <li>fieldName (required): The name of the field (e.g. creator), not i18ned. </li>
     *     <li>valueType (required): The type of the field (e.g. user, space, label, text). </li>
     *     <li>fixed (optional): Determines if the field can be removed - if fixed, no; if not, yes. </li>
     * </ul>
     * @param field the definition of the CQL field to create a component for
     * @param cqlComponent the cql-component instance containing this field
     * @returns {*}
     */
    function build(field, cqlComponent) {

        var uiSupport = field.uiSupport;
        var valueType = uiSupport.valueType;
        var fieldName = field.fieldName;
        if (!valueType) {
            throw new Error("Can't create filter without valueType.");
        }
        if (!fieldName) {
            throw new Error("Can't create filter without fieldName.");
        }

        var config = filterFieldConfigs.getConfig(field);

        var filterField = makeField(field);

        filterField.asCql = _.bind(config.asCqlFunc || function () {
            return expressionBuilder.buildExpression(filterField, this.input.val());
        }, filterField);

        var input = filterField.element.find('input');

        if (typeof config.setupInput === 'function') {
            filterField.setupInput = config.setupInput;
            filterField.setupInput(input, cqlComponent.context);
        }

        filterField.setValues = config.setValues || function (clause) {
            input.val(clause.values.join(','));
        };

        filterField.element.find('.aui-iconfont-remove').click(function () {
            filterField.element.remove();

            // Let the owning component know that this field can be deregistered.
            cqlComponent.removeField(filterField);
        });

        return filterField;
    }

    return {
        build: build
    };
});
