// src/js/aui/date-picker.js
(typeof window === 'undefined' ? global : window).__2161c8b46b76ed8a6a727aee28d771d3 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  __347ac96a6ad2b250ea1034298314c7d4;
  
  var _log = __c1e961001275c079e48525ad3a48c8c2;
  
  var logger = _interopRequireWildcard(_log);
  
  var _browser = __7a2976c482edfafd9b5879a49ffe0535;
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _inlineDialog = __b25d88f7d8f364347fd8fafd71054d2b;
  
  var _inlineDialog2 = _interopRequireDefault(_inlineDialog);
  
  var _keyCode = __e246bf93af36eb4453f35afeb1c302d9;
  
  var _keyCode2 = _interopRequireDefault(_keyCode);
  
  var _i18n = __fa714f1b12d7502957e4e0b6196321bf;
  
  var _i18n2 = _interopRequireDefault(_i18n);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var datePickerCounter = 0;
  
  function DatePicker(field, options) {
      var datePicker;
      var initPolyfill;
      var $field;
      var datePickerUUID;
      var parentPopup;
  
      datePicker = {};
      datePickerUUID = datePickerCounter++;
  
      // ---------------------------------------------------------------------
      // fix up arguments ----------------------------------------------------
      // ---------------------------------------------------------------------
  
      $field = (0, _jquery2.default)(field);
      $field.attr('data-aui-dp-uuid', datePickerUUID);
      options = _jquery2.default.extend(undefined, DatePicker.prototype.defaultOptions, options);
  
      // ---------------------------------------------------------------------
      // expose arguments with getters ---------------------------------------
      // ---------------------------------------------------------------------
  
      datePicker.getField = function () {
          return $field;
      };
  
      datePicker.getOptions = function () {
          return options;
      };
  
      // ---------------------------------------------------------------------
      // exposed methods -----------------------------------------------------
      // ---------------------------------------------------------------------
  
      initPolyfill = function initPolyfill() {
  
          var calendar;
          var handleDatePickerFocus;
          var handleFieldBlur;
          var handleFieldFocus;
          var handleFieldUpdate;
          var initCalendar;
          var isSuppressingShow;
          var isTrackingDatePickerFocus;
          var popup;
          var popupContents;
  
          // -----------------------------------------------------------------
          // expose methods for controlling the popup ------------------------
          // -----------------------------------------------------------------
  
          datePicker.hide = function () {
              popup.hide();
          };
  
          datePicker.show = function () {
              popup.show();
          };
  
          datePicker.setDate = function (value) {
              if (typeof calendar !== 'undefined') {
                  calendar.datepicker('setDate', value);
              }
          };
  
          datePicker.getDate = function () {
              if (typeof calendar !== 'undefined') {
                  return calendar.datepicker('getDate');
              }
          };
  
          // -----------------------------------------------------------------
          // initialise the calendar -----------------------------------------
          // -----------------------------------------------------------------
  
          initCalendar = function initCalendar(i18nConfig) {
  
              popupContents.off();
              if (options.hint) {
                  var $hint = (0, _jquery2.default)('<div/>').addClass('aui-datepicker-hint');
                  $hint.append('<span/>').text(options.hint);
                  popupContents.append($hint);
              }
              calendar = (0, _jquery2.default)('<div/>');
              calendar.attr('data-aui-dp-popup-uuid', datePickerUUID);
              popupContents.append(calendar);
  
              var config = {
                  'dateFormat': options.dateFormat,
                  'defaultDate': $field.val(),
                  'maxDate': $field.attr('max'),
                  'minDate': $field.attr('min'),
                  'nextText': '>',
                  'onSelect': function onSelect(dateText) {
                      $field.val(dateText);
                      $field.change();
                      datePicker.hide();
                      isSuppressingShow = true;
                      $field.focus();
                      options.onSelect && options.onSelect.call(this, dateText);
                  },
                  onChangeMonthYear: function onChangeMonthYear() {
                      // defer rehresh call until current stack has cleared (after month has rendered)
                      setTimeout(popup.refresh, 0);
                  },
                  'prevText': '<'
              };
  
              _jquery2.default.extend(config, i18nConfig);
  
              if (options.firstDay > -1) {
                  config.firstDay = options.firstDay;
              }
  
              if (typeof $field.attr('step') !== 'undefined') {
                  logger.log('WARNING: The date picker polyfill currently does not support the step attribute!');
              }
  
              calendar.datepicker(config);
  
              // bind additional field processing events
              (0, _jquery2.default)('body').on('keydown', handleDatePickerFocus);
              $field.on('focusout keydown', handleFieldBlur);
              $field.on('propertychange keyup input paste', handleFieldUpdate);
          };
  
          // -----------------------------------------------------------------
          // event handler wrappers ------------------------------------------
          // -----------------------------------------------------------------
  
          handleDatePickerFocus = function handleDatePickerFocus(event) {
              var $eventTarget = (0, _jquery2.default)(event.target);
              var isTargetInput = $eventTarget.closest(popupContents).length || $eventTarget.is($field);
              var isTargetPopup = $eventTarget.closest('.ui-datepicker-header').length;
  
              // Hide if we're clicking anywhere else but the input or popup OR if esc is pressed.
              if (!isTargetInput && !isTargetPopup || event.keyCode === _keyCode2.default.ESCAPE) {
                  datePicker.hide();
                  return;
              }
  
              if ($eventTarget[0] !== $field[0]) {
                  event.preventDefault();
              }
          };
  
          handleFieldBlur = function handleFieldBlur() {
              // Trigger blur if event is keydown and esc OR is focusout.
              if (!isTrackingDatePickerFocus) {
                  (0, _jquery2.default)('body').on('focus blur click mousedown', '*', handleDatePickerFocus);
                  isTrackingDatePickerFocus = true;
              }
          };
  
          handleFieldFocus = function handleFieldFocus() {
              if (!isSuppressingShow) {
                  datePicker.show();
              } else {
                  isSuppressingShow = false;
              }
          };
  
          handleFieldUpdate = function handleFieldUpdate() {
              var val = (0, _jquery2.default)(this).val();
              // IE10/11 fire the 'input' event when internally showing and hiding
              // the placeholder of an input. This was cancelling the inital click
              // event and preventing the selection of the first date. The val check here
              // is a workaround to assure we have legitimate user input that should update
              // the calendar
              if (val) {
                  calendar.datepicker('setDate', $field.val());
                  calendar.datepicker('option', {
                      'maxDate': $field.attr('max'),
                      'minDate': $field.attr('min')
                  });
              }
          };
  
          // -----------------------------------------------------------------
          // undo (almost) everything ----------------------------------------
          // -----------------------------------------------------------------
  
          datePicker.destroyPolyfill = function () {
  
              // goodbye, cruel world!
              datePicker.hide();
  
              $field.attr('placeholder', null);
  
              $field.off('propertychange keyup input paste', handleFieldUpdate);
              $field.off('focus click', handleFieldFocus);
              $field.off('focusout keydown', handleFieldBlur);
              (0, _jquery2.default)('body').off('keydown', handleFieldBlur);
  
              if (DatePicker.prototype.browserSupportsDateField) {
                  $field[0].type = 'date';
              }
  
              if (typeof calendar !== 'undefined') {
                  calendar.datepicker('destroy');
              }
  
              // TODO: figure out a way to tear down the popup (if necessary)
  
              delete datePicker.destroyPolyfill;
  
              delete datePicker.show;
              delete datePicker.hide;
          };
  
          // -----------------------------------------------------------------
          // polyfill bootstrap ----------------------------------------------
          // -----------------------------------------------------------------
  
          isSuppressingShow = false; // used to stop the popover from showing when focus is restored to the field after a date has been selected
          isTrackingDatePickerFocus = false; // used to prevent multiple bindings of handleDatePickerFocus within handleFieldBlur
  
          if (!(options.languageCode in DatePicker.prototype.localisations)) {
              options.languageCode = '';
          }
          var i18nConfig = DatePicker.prototype.localisations;
  
          var containerClass = '';
          var width = 240;
  
          if (i18nConfig.size === 'large') {
              width = 325;
              containerClass = 'aui-datepicker-dialog-large';
          }
          var dialogOptions = {
              'hideCallback': function hideCallback() {
                  (0, _jquery2.default)('body').off('focus blur click mousedown', '*', handleDatePickerFocus);
                  isTrackingDatePickerFocus = false;
                  if (parentPopup && parentPopup._datePickerPopup) {
                      delete parentPopup._datePickerPopup;
                  }
              },
              'hideDelay': null,
              'noBind': true,
              'persistent': true,
              'closeOthers': false,
              'width': width
          };
  
          if (options.position) {
              dialogOptions.calculatePositions = function (popup, targetPosition) {
                  // create a jQuery object from the internal
                  var vanilla = (0, _jquery2.default)(popup[0]);
                  return options.position.call(this, vanilla, targetPosition);
              };
          }
  
          popup = (0, _inlineDialog2.default)($field, undefined, function (contents, trigger, showPopup) {
              if (typeof calendar === 'undefined') {
                  popupContents = contents;
                  initCalendar(i18nConfig);
              }
              parentPopup = (0, _jquery2.default)(trigger).closest('.aui-inline-dialog').get(0);
              if (parentPopup) {
                  parentPopup._datePickerPopup = popup; // AUI-2696 - hackish coupling to control inline-dialog close behaviour.
              }
  
              showPopup();
          }, dialogOptions);
  
          popup.addClass('aui-datepicker-dialog');
          popup.addClass(containerClass);
  
          // bind what we need to start off with
          $field.on('focus click', handleFieldFocus); // the click is for fucking opera... Y U NO FIRE FOCUS EVENTS PROPERLY???
  
          // give users a hint that this is a date field; note that placeholder isn't technically a valid attribute
          // according to the spec...
          $field.attr('placeholder', options.dateFormat);
  
          // override the browser's default date field implementation (if applicable)
          // since IE doesn't support date input fields, we should be fine...
          if (options.overrideBrowserDefault && DatePicker.prototype.browserSupportsDateField) {
              $field[0].type = 'text';
  
              //workaround for this issue in Edge: https://connect.microsoft.com/IE/feedback/details/1603512/changing-an-input-type-to-text-does-not-set-the-value
              var value = $field[0].getAttribute('value'); //can't use jquery to get the attribute because it doesn't work in Edge
              if (value) {
                  $field[0].value = value;
              }
          }
      };
  
      datePicker.reset = function () {
  
          if (typeof datePicker.destroyPolyfill === 'function') {
              datePicker.destroyPolyfill();
          }
  
          if (!DatePicker.prototype.browserSupportsDateField || options.overrideBrowserDefault) {
              initPolyfill();
          }
      };
  
      // ---------------------------------------------------------------------
      // bootstrap -----------------------------------------------------------
      // ---------------------------------------------------------------------
  
      datePicker.reset();
  
      return datePicker;
  };
  
  // -------------------------------------------------------------------------
  // things that should be common --------------------------------------------
  // -------------------------------------------------------------------------
  
  DatePicker.prototype.browserSupportsDateField = (0, _browser.supportsDateField)();
  
  DatePicker.prototype.defaultOptions = {
      overrideBrowserDefault: false,
      firstDay: -1,
      languageCode: (0, _jquery2.default)('html').attr('lang') || 'en-AU',
      dateFormat: _jquery2.default.datepicker.W3C // same as $.datepicker.ISO_8601
  };
  
  // adapted from the jQuery UI Datepicker widget (v1.8.16), with the following changes:
  //   - dayNamesShort -> dayNamesMin
  //   - unnecessary attributes omitted
  /*
  CODE to extract codes out:
  
  var langCode, langs, out;
  langs = jQuery.datepicker.regional;
  out = {};
  
  for (langCode in langs) {
      if (langs.hasOwnProperty(langCode)) {
          out[langCode] = {
              'dayNames': langs[langCode].dayNames,
              'dayNamesMin': langs[langCode].dayNamesShort, // this is deliberate
              'firstDay': langs[langCode].firstDay,
              'isRTL': langs[langCode].isRTL,
              'monthNames': langs[langCode].monthNames,
              'showMonthAfterYear': langs[langCode].showMonthAfterYear,
              'yearSuffix': langs[langCode].yearSuffix
          };
      }
  }
  
   */
  
  DatePicker.prototype.localisations = {
      "dayNames": [_i18n2.default.getText('ajs.datepicker.localisations.day-names.sunday'), _i18n2.default.getText('ajs.datepicker.localisations.day-names.monday'), _i18n2.default.getText('ajs.datepicker.localisations.day-names.tuesday'), _i18n2.default.getText('ajs.datepicker.localisations.day-names.wednesday'), _i18n2.default.getText('ajs.datepicker.localisations.day-names.thursday'), _i18n2.default.getText('ajs.datepicker.localisations.day-names.friday'), _i18n2.default.getText('ajs.datepicker.localisations.day-names.saturday')],
      "dayNamesMin": [_i18n2.default.getText('ajs.datepicker.localisations.day-names-min.sunday'), _i18n2.default.getText('ajs.datepicker.localisations.day-names-min.monday'), _i18n2.default.getText('ajs.datepicker.localisations.day-names-min.tuesday'), _i18n2.default.getText('ajs.datepicker.localisations.day-names-min.wednesday'), _i18n2.default.getText('ajs.datepicker.localisations.day-names-min.thursday'), _i18n2.default.getText('ajs.datepicker.localisations.day-names-min.friday'), _i18n2.default.getText('ajs.datepicker.localisations.day-names-min.saturday')],
      "firstDay": _i18n2.default.getText('ajs.datepicker.localisations.first-day'),
      "isRTL": _i18n2.default.getText('ajs.datepicker.localisations.is-RTL') === "true" ? true : false,
      "monthNames": [_i18n2.default.getText('ajs.datepicker.localisations.month-names.january'), _i18n2.default.getText('ajs.datepicker.localisations.month-names.february'), _i18n2.default.getText('ajs.datepicker.localisations.month-names.march'), _i18n2.default.getText('ajs.datepicker.localisations.month-names.april'), _i18n2.default.getText('ajs.datepicker.localisations.month-names.may'), _i18n2.default.getText('ajs.datepicker.localisations.month-names.june'), _i18n2.default.getText('ajs.datepicker.localisations.month-names.july'), _i18n2.default.getText('ajs.datepicker.localisations.month-names.august'), _i18n2.default.getText('ajs.datepicker.localisations.month-names.september'), _i18n2.default.getText('ajs.datepicker.localisations.month-names.october'), _i18n2.default.getText('ajs.datepicker.localisations.month-names.november'), _i18n2.default.getText('ajs.datepicker.localisations.month-names.december')],
      "showMonthAfterYear": _i18n2.default.getText('ajs.datepicker.localisations.show-month-after-year') === "true" ? true : false,
      "yearSuffix": _i18n2.default.getText('ajs.datepicker.localisations.year-suffix')
  
      // -------------------------------------------------------------------------
      // finally, integrate with jQuery for convenience --------------------------
      // -------------------------------------------------------------------------
  
  };_jquery2.default.fn.datePicker = function (options) {
      return new DatePicker(this, options);
  };
  
  (0, _globalize2.default)('DatePicker', DatePicker);
  
  exports.default = DatePicker;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);