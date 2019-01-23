/**
 * A CQL-generating component that combines CQL Filter fields and an Add Filter button to display and store CQL
 * clauses.
 */
define('confluence-ui-components/js/cql/cql-component', [
    'jquery',
    'underscore',
    'ajs',
    'confluence-ui-components/js/cql/internal/cql-ajax',
    'confluence-ui-components/js/cql/internal/cql-filter-field',
    'confluence-ui-components/js/cql/internal/cql-filter-select',
    'confluence-ui-components/js/cql/internal/cql-space-expression-aggregator',
    'confluence-ui-components/js/cql/internal/cql-date-expression-aggregator',
    'confluence-ui-components/js/cql/internal/cql-negation-aggregator',
    'confluence-ui-components/js/cql/internal/cql-ignored-field-expression-converter',
    'confluence-ui-components/js/cql/internal/cql-soy-templates'
], function (
    $,
    _,
    AJS,
    cqlAjax,
    filterField,
    filterSelect,
    spaceExpressionAggregator,
    dateExpressionAggregator,
    negationAggregator,
    ignoredFieldExpressionConverter,
    SoyTemplates
) {
    'use strict';

    var templates = SoyTemplates.CQL;

    /**
     * Walks CQL-flagged fields in the Macro details form and aggregates the clauses.
     */
    function generateCqlMacroParamValue(fieldRegistry) {
        var clauses = [];
        _.each(fieldRegistry, function (fieldArray) {
            fieldArray.forEach(function (field) {
                if (!field) {
                    return;  // can happen if fields have been removed
                }

                var cqlClause = field.asCql();
                if (cqlClause) {
                    clauses.push(cqlClause);
                }
            });
        });

        return clauses.join(" and ");
    }

    function findFieldByFieldName(fields, fieldName) {
        return _.find(fields, function (item) {
            return item.fieldName === fieldName;
        });
    }

    function build(options) {

        var context = options.context || {
            environment: 'macro-browser'  // will be passed in the future, and this default can go
        };

        var defaultFieldNames = options.defaultFieldNames;
        if (!defaultFieldNames) {
            // TODO CRA-609 options.defaultFieldNames will be going away soon, at which this line
            // becomes the default assignment. dT
            defaultFieldNames = options.defaultFields ? options.defaultFields.split(',') : [];
        }

        var $cqlContainer = $(templates().container());
        if (options.container) {
            // Appending the container to the DOM early allows bindings up the DOM tree to be triggered as this
            // component is built.
            $(options.container).append($cqlContainer);
        }

        var cqlFieldsContainer = $cqlContainer.find('.cql-fields');

        // WARNING - async land! We need the field definitions and CQL clauses
        // before we can display their UI components successfully.
        var clauseREST;
        var cql = options.value || options.defaultValue;
        if (cql) {
            // Need to parse the CQL into fields we can display.
            clauseREST = cqlAjax.parseClauses(cql);
        } else {
            clauseREST = new $.Deferred();
            clauseREST.resolve();
        }

        var fieldRegistry = {};
        var ignoredFields = {};

        var loading = new $.Deferred();
        // Triggered when any CQL field changes, calls the callback function without the current CQL string value.
        // Call component.getValue to get the value as desired.
        var changeCallback = options.onChange || function () {
        };

        function removeField(fieldComponent) {
            var fieldName = fieldComponent.fieldName;
            fieldRegistry[fieldName] = _.without(fieldRegistry[fieldName], fieldComponent);
            if (fieldRegistry[fieldName].length === 0) {
                delete fieldRegistry[fieldName];
                changeCallback();
            }
        }

        // t is "this", the instance object to be returned from this builder.
        var t = {
            element: $cqlContainer,
            loading: loading,
            context: options.context || {
                // The place where this UI component is located, currently
                // 'macro-browser' or 'search-screen'
                environment: 'macro-browser',
                // The type of search results that are expected, currently
                // includes 'content', 'all', 'user', 'space'
                searchType: 'content'
            },

            /**
             * Return the CQL filter expressions represented by this components Filter fields.
             * @returns String
             */
            getValue: function () {
                return generateCqlMacroParamValue(fieldRegistry);
            },

            getIgnoredFields: function () {
                return ignoredFields;
            },

            removeField: removeField,

            // TODO - temp var to allow Steve demo without updating macro-browser.js in core
            fieldArrays: fieldRegistry,
            fieldRegistry: fieldRegistry
        };

        function addComponent(field) {
            var fieldComponent = filterField.build(field, t);

            fieldComponent.onChange(changeCallback);

            // Register the component
            var fieldName = field.fieldName;
            fieldRegistry[fieldName] = fieldRegistry[fieldName] || [];
            fieldRegistry[fieldName].push(fieldComponent);

            // Gives calling code a chance to manipulate the element before it is added to the DOM.
            $cqlContainer.trigger('cql-field-adding', fieldComponent);

            // Add to the UI
            var $lastMatchingField = cqlFieldsContainer.find('.cql-field-' + fieldName + ':last');
            if ($lastMatchingField.length) {
                // Put this field after other fields with the same name.
                $lastMatchingField.after(fieldComponent.element);
            } else {
                // First field with this name - add to end.
                cqlFieldsContainer.append(fieldComponent.element);
            }

            return fieldComponent;
        }

        // Retrieve a component from the registry - may return undefined.
        function getComponent(field, index) {
            index = index || 0;
            var fieldName = field.fieldName;

            return fieldRegistry[fieldName] && fieldRegistry[fieldName][index];
        }

        var fields;

        function loadClauses(clauses) {
            var loadClausesDeferred = $.Deferred();
            if (!clauses) {
                loadClausesDeferred.resolve();
                return loadClausesDeferred;
            }

            // To handle cases where the same field appears multiple times, e.g. "label = foo and label = bar"
            var clauseIndex = {};

            function nextClauseIndex(fieldName) {
                var index = clauseIndex[fieldName];
                if (typeof index === 'number') {
                    clauseIndex[fieldName] = index + 1;
                } else {
                    clauseIndex[fieldName] = 0;
                }
                return clauseIndex[fieldName];
            }

            // Existing data needs filling in the fields, and new fields may need to be added to the UI.

            // CQL expressions may not map 1-to-1 with UI fields, so perform any necessary aggregation.
            var spaceField = _.findWhere(fields, {fieldName: 'space'});
            clauses = spaceExpressionAggregator.aggregate(clauses, spaceField);
            clauses = dateExpressionAggregator.aggregate(clauses);
            clauses = negationAggregator.aggregate(clauses);
            ignoredFields = ignoredFieldExpressionConverter.getFieldsByName(clauses, options.ignoredFields);
            clauses = ignoredFieldExpressionConverter.removeFieldsByName(clauses, options.ignoredFields);

            var fieldDeferreds = [];
            _.each(clauses, function (clause) {
                /* Clause object has: field, values, e.g.
                 {
                 field: {
                 fieldName: "label",
                 type: "equality",
                 valueType: "label",
                 supportedOps: [ ]
                 },
                 values: [
                 "foo"
                 ]
                 }
                 */
                var fieldName = clause.field.fieldName;

                // Find the "real" field in the field map because the field returned from the clause parser
                // doesn't include i18n information.
                var field = findFieldByFieldName(fields, fieldName);

                // Some fields like "Label" may appear multiple times. Add new components as necessary.
                var index = nextClauseIndex(fieldName);
                var fieldComponent = getComponent(field, index) || addComponent(field);

                // The clause may hold values in multiple properties (e.g. functionValues) so pass in the whole
                // thing.
                var fieldDeferred = fieldComponent.setValues(clause);
                // Field components return a deferred which is resolved when values are set
                if (fieldDeferred) {
                    fieldDeferreds.push(fieldDeferred);
                }
            });

            // Once all fields have resolved their deferred calls, resolve our own deferred object
            $.when.apply($, fieldDeferreds).then(function () {
                loadClausesDeferred.resolve();
            });
            return loadClausesDeferred;
        }

        function showError(failedCql) {
            var title;
            var body;
            if (failedCql) {
                // Failed during CQL parse AJAX
                var escapedCql = _.escape(failedCql);  // nice try, XSS fiend!
                title = AJS.I18n.getText('confluence-ui-components.cql-component.parse.error.title');
                body = AJS.I18n.getText('confluence-ui-components.cql-component.parse.error.body', escapedCql);
            } else {
                // Failed during field lookup, super-rare.
                title = AJS.I18n.getText('confluence-ui-components.cql-component.fields.ajax.error.title');
                body = AJS.I18n.getText('confluence-ui-components.cql-component.fields.ajax.error.body');
            }
            AJS.messages.error(".cql-error-container", {
                title: title,
                body: body,
                closeable: true
            });
        }

        /*
         Activate a newly-created field.
         */
        function focusComponent(fieldComponent) {

            // Multi select fields are triggered by a click event on the inner <input> element
            // Single select fields are triggered via a mousedown event on the inner <a> element
            var $input;
            // Pick list, don't focus the input field
            if (fieldComponent.element.find('.aui-nav-selected').length !== 0) {
                return;
            }
            if (fieldComponent.element.find(".select2-container-multi").length !== 0) {
                // Select2 multi-select
                $input = fieldComponent.element.find('input.select2-input');
                // focus() is required because not all fields response to the click trigger.
                $input.focus().click();
            } else {
                // Select2 single-select
                $input = fieldComponent.element.find('a.select2-choice.select2-default');
                if (!$input.length) {
                    // Just a text or other input field?
                    $input = $(':input:visible', fieldComponent.element).first();
                }
                if (!$input.length) {
                    AJS.log("Unable to focus CQL field: " + fieldComponent.fieldName);
                }
                $input.focus().mousedown();
            }
        }

        /*
         Called when a selection is made from the filterSelect component. Adds the new field and focuses it.
         */
        function fieldSelectedForAddition(field) {
            // Fields added from the filter-select can always be removed again - they are not fixed.
            var unfixed = $.extend({}, field, {fixed: false});
            var fieldComponent = addComponent(unfixed);

            focusComponent(fieldComponent);
        }

        function loadFields(result) {

            // Get the fields into a scope that other functions can access.
            fields = result;

            defaultFieldNames.forEach(function (fieldName) {
                var field = findFieldByFieldName(fields, fieldName);
                if (!field) {
                    throw Error("Unknown fieldname: " + fieldName);
                }

                // Default fields cannot be removed from the UI. Clone the common field so that other instances
                // of this field aren't set as fixed.
                var fixedField = $.extend({
                    fixed: true
                }, field);
                addComponent(fixedField);
            });

            filterSelect.build({
                onSelection: fieldSelectedForAddition,
                cqlContainer: $cqlContainer,
                context: context,
                ignoredFields: options.ignoredFields
            });

            // The clause AJAX may already be resolved but we delay the callback until the fields are known.
            clauseREST
                .done(function (clauses) {
                    loadClauses(clauses).done(function () {
                        loading.resolve();
                    })
                })
                .fail(function () {
                    // On the search screen don't hit the user with multiple error messages when the CQL in the
                    // URL cannot be parsed: they'll get a parse error message in the search result area.
                    if (context.environment === 'search-screen') {
                        AJS.log("Error parsing CQL param from search screen URL: " + options.value);
                    } else {
                        showError(options.value);
                    }
                    loading.resolve();
                });
        }

        cqlAjax.getFields()
            .done(loadFields)
            .fail(function () {
                showError();
            });

        return t;
    }

    return {
        build: build
    };

});
