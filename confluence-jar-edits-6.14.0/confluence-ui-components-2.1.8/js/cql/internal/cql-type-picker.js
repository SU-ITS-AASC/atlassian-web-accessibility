/**
 * A picker for extensible content types, e.g. page, blogpost, comment, attachment, question, file...
 */
define('confluence-ui-components/js/cql/internal/cql-type-picker', [
    'jquery',
    'underscore',
    'ajs',
    'confluence-ui-components/js/cql/internal/cql-ajax',
    'confluence-ui-components/js/cql/internal/cql-set-value-helper',
    'confluence-ui-components/js/cql/internal/cql-soy-templates',
    'confluence-ui-components/js/include-exclude-picker'
], function (
    $,
    _,
    AJS,
    cqlAjax,
    setValueHelper,
    SoyTemplates,
    includeExcludePicker
) {
    'use strict';

    // CQL content types Deferred object. Cached to avoid unnecessary lookups, as it shouldn't change during a single
    // page view.
    var typesDeferred;

    // Stores the transformed result from the typesDeferred. Empty until the deferred returns.
    var data = [];

    function cacheData(results) {
        data = _.map(results, function (result) {
            return {
                id: result.type,
                text: result.label
            };
        });
    }

    // Private method used in testing, resets 'static' state.
    function _clearCache() {
        typesDeferred = null;
        data = [];
    }

    function _getPicklistKey(values, suggestions) {
        if (values.length === 0) {
            return '';
        }

        if (values.length === 1 && _.contains(_.pluck(suggestions, 'type'), values[0])) {
            return values[0];
        }
        return 'custom';
    }

    function build(suggestions, contentTypesOnly) {

        var $input;
        var $options;
        var $customTypesContainer;
        var allOptions = [];

        if (!typesDeferred) {
            // Lazy-load and cache the types from the server.
            typesDeferred = contentTypesOnly ? cqlAjax.getContentTypes() : cqlAjax.getTypes();
            typesDeferred.done(cacheData);
        }

        typesDeferred.done(function () {
            if (suggestions.length) {
                // Add any suggestions not already in the option list.
                var allDataIds = _.pluck(data, 'id');
                allOptions = [].concat(data);
                suggestions.forEach(function (suggestion) {
                    // Any 'new' types such as Spaces and Users need adding to the dropdown.
                    if (suggestion.type !== '' && !_.contains(allDataIds, suggestion.type)) {
                        allOptions.push({
                            id: suggestion.type,
                            text: suggestion.label
                        });
                    }
                });
            }
            else {
                allOptions = data;
            }
        });

        var select2Options = {
            query: function (query, stripPrefix, formatResult) {
                // Defer query execution until types from server are returned. If we don't do this, when a newly-created
                // type field is triggered it will show "No results" instead of the expected Type suggestions.
                typesDeferred.done(function () {
                    // Need to use the strip function to get
                    // the search term prefix which will be applied
                    // to all search results with the formatResult
                    stripPrefix(query.term);
                    // The 'local' function is what is responsible for
                    // the standard filtering behaviour when using the 'data' options of Select2
                    var filterFn = window.Select2.query.local({
                        results: _.map(allOptions, formatResult)
                    });
                    filterFn(query);
                });
            },
            initSelection: function (element, callback) {
                var initValues = element.val().split(',');
                var prefix = '';
                // We need to check if the result has a prefix and strip it out
                // This is ugly but it's the only solution for now for some reason, sez CI.
                var initValuesWithoutPrefix = _.map(initValues, function (type) {
                    var firstChar = type.charAt(0);
                    if (firstChar === '-') {
                        prefix = '-';
                        return type.substring(1);
                    }
                    return type;
                });
                typesDeferred.done(function () {
                    var initData = _.filter(allOptions, function (result) {
                        return _.contains(initValuesWithoutPrefix, result.id);
                    });
                    // Add prefix back
                    callback(_.map(initData, function (result) {
                        return {
                            id: prefix + result.id,
                            text: prefix + result.text
                        };
                    }));
                });
            },
            multiple: true,
            placeholder: AJS.I18n.getText('confluence-ui-components.type-picker.placeholder')
        };

        function setupInput(input) {
            $input = input;

            // Trace when field changes to assist webdriver tests
            if (AJS.trace) {
                $input.on('change', function () {
                    AJS.trace("type.field.changed");
                });
            }

            // If pick list suggestions have been provided. Render them before the input field
            if (suggestions.length) {
                var $suggestions = $(SoyTemplates.TypePicker().suggestions({
                    types: suggestions
                }));
                $options = $suggestions.find('.aui-nav li');
                $input.before($suggestions);

                $suggestions.on('click', '.aui-nav a', function () {
                    // Set styling for selected pick list item
                    var myLi = $(this).closest('li');
                    var $previousOption = $options.filter('.aui-nav-selected');
                    // We have selected the same pick list option, do nothing
                    if (myLi[0] === $previousOption[0]) {
                        return;
                    }
                    $previousOption.removeClass('aui-nav-selected');
                    //$options.not(myLi).removeClass('aui-nav-selected');
                    myLi.addClass('aui-nav-selected');

                    // Show input field if 'custom' pick list item selected
                    // Otherwise hide it
                    var selection = $(this).attr('data-value');
                    if (selection === 'custom') {
                        $customTypesContainer.slideDown('fast');
                    } else {
                        $customTypesContainer.hide();
                    }

                    var triggerChangeEvent = true;
                    $input.select2("val", [selection], triggerChangeEvent);
                });
            }

            $input.auiSelect2(includeExcludePicker.build(select2Options));

            if (suggestions.length) {
                $customTypesContainer = $input.closest('.cql-filter').find('.select2-container');
                $customTypesContainer.hide();
            }
        }

        return {
            setupInput: setupInput,

            // Allows callers to define their own code for setting values; it will only run after typesDeferred
            // has been resolved and we have a list of types.
            //
            // It returns another deferred which is resolved when new values have been set to the input field
            // and a change event has been fired
            setValues: function (values) {
                if ($options) {
                    // Show selected value in picklist
                    var pickerKey = _getPicklistKey(values, suggestions);
                    var $option = $options.find('[data-value="' + pickerKey + '"]').parent();
                    $options.not($option).removeClass('aui-nav-selected');
                    $option.addClass('aui-nav-selected');
                    if (pickerKey === 'custom') {
                        $customTypesContainer.show();
                    }
                }
                var setValuesDeferred = $.Deferred();
                typesDeferred.done(function () {
                    setValueHelper.setValues($input, values).done(function () {
                        setValuesDeferred.resolve();
                    });
                });
                return setValuesDeferred;
            }
        };
    }

    return {
        build: build,
        _clearCache: _clearCache,
        _getPicklistKey: _getPicklistKey
    };
});
