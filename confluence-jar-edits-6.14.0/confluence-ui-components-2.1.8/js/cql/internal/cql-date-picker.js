/**
 * A picker for dates that supports picking from a set list of ranges or entering one manually.
 *
 * Manually-entered date ranges can be open at either end.
 */
define('confluence-ui-components/js/cql/internal/cql-date-picker',
    [
        'ajs',
        'jquery',
        'confluence-ui-components/js/internal/soy-templates'
    ],
    function (AJS,
              $,
              SoyTemplates) {
        'use strict';

        function build($input) {

            var $picker = $(SoyTemplates.DatePicker().input());
            var $options = $picker.find('.aui-nav li');
            var $absolutePickerWrapper = $picker.find('.absolute-date-pickers').hide(); // start hidden
            var $fromPickerInput = $picker.find('.from-date-picker');
            var $toPickerInput = $picker.find('.to-date-picker');
            var triggerDateChanged = function () {
            };
            this.onChange = function (callback) {
                triggerDateChanged = callback;
                $fromPickerInput.change(callback);
                $toPickerInput.change(callback);
            };

            $picker.on('click', '.aui-nav a', function () {
                var currentlySelectedLi = $options.filter('li.aui-nav-selected');
                var newLi = $(this).closest('li');
                if (currentlySelectedLi[0] !== newLi[0]) {
                    $options.not(newLi).removeClass('aui-nav-selected');
                    newLi.addClass('aui-nav-selected');
                    triggerDateChanged();
                }

                if ($(this).data('value') === 'custom') {
                    $absolutePickerWrapper.slideDown('fast');
                } else {
                    $absolutePickerWrapper.slideUp('fast');
                }
            });

            var auiDatePickerOptions = {
                overrideBrowserDefault: true
            };
            AJS.DatePicker($fromPickerInput, auiDatePickerOptions);
            AJS.DatePicker($toPickerInput, auiDatePickerOptions);

            // Need to override the defaults set by AUI.
            $fromPickerInput.attr('placeholder', AJS.I18n.getText('confluence-ui-components.date-picker.custom.from'));
            $toPickerInput.attr('placeholder', AJS.I18n.getText('confluence-ui-components.date-picker.custom.to'));

            $input.replaceWith($picker);

            return {
                getSelectedOption: function () {
                    var $selected = $options.filter('.aui-nav-selected').find('a');
                    return $selected.data('value');
                },

                selectOption: function (value) {
                    var $selectedRelative = $options.find('a[data-value="' + value + '"]');
                    $selectedRelative.click();
                },

                getFromDate: function () {
                    return $fromPickerInput.val();
                },

                getToDate: function () {
                    return $toPickerInput.val();
                },

                setFromDate: function (dateStr) {
                    $fromPickerInput.val(dateStr);
                    $options.find("a[data-value='custom']").click();
                },

                setToDate: function (dateStr) {
                    $toPickerInput.val(dateStr);
                    $options.find("a[data-value='custom']").click();
                }
            };
        }

        return {
            build: build
        };
    });