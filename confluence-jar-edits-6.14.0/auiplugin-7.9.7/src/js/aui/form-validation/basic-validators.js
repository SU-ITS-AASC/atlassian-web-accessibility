// src/js/aui/form-validation/basic-validators.js
(typeof window === 'undefined' ? global : window).__bd17153ec513fce3d14cee034d5c4bee = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _amdify = __65ca28a9d6b0f244027266ff8e6a6d1c;
  
  var _amdify2 = _interopRequireDefault(_amdify);
  
  var _format = __d31562b45156ec0db003c1af006240d5;
  
  var _format2 = _interopRequireDefault(_format);
  
  var _i18n = __fa714f1b12d7502957e4e0b6196321bf;
  
  var _i18n2 = _interopRequireDefault(_i18n);
  
  var _validatorRegister = __5746c3dc0d9d4c30df5b0c1dc2a92a90;
  
  var _validatorRegister2 = _interopRequireDefault(_validatorRegister);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  //Input length
  // eslint-disable-line no-unused-vars
  function minMaxLength(field) {
      var fieldValueLength = field.el.value.length;
      var fieldIsEmpty = fieldValueLength === 0;
      var minlength = parseInt(field.args('minlength'), 10);
      var maxlength = parseInt(field.args('maxlength'), 10);
  
      if (minlength && maxlength && minlength === maxlength && !fieldIsEmpty && fieldValueLength !== minlength) {
          var exactlengthMessage = makeMessage('exactlength', field.args, [minlength]);
          field.invalidate(exactlengthMessage);
      } else if (minlength && fieldValueLength < minlength && !fieldIsEmpty) {
          var minlengthMessage = makeMessage('minlength', field.args);
          field.invalidate(minlengthMessage);
      } else if (maxlength && fieldValueLength > maxlength) {
          var maxlengthMessage = makeMessage('maxlength', field.args);
          field.invalidate(maxlengthMessage);
      } else {
          field.validate();
      }
  } // eslint-disable-line no-unused-vars
  
  _validatorRegister2.default.register(['maxlength', 'minlength'], minMaxLength); //AUI-prefixed attribute is deprecated as of 5.9.0
  _validatorRegister2.default.register('[maxlength],[minlength]', minMaxLength);
  
  //Field matching
  _validatorRegister2.default.register(['matchingfield'], function (field) {
      var thisFieldValue = field.el.value;
      var matchingField = document.getElementById(field.args('matchingfield'));
      var matchingFieldValue = matchingField.value;
  
      var matchingFieldMessage = makeMessage('matchingfield', field.args, [thisFieldValue, matchingFieldValue]);
  
      var shouldHidePasswords = isPasswordField(field.el) || isPasswordField(matchingField);
      if (shouldHidePasswords) {
          matchingFieldMessage = makeMessage('matchingfield-novalue', field.args);
      }
  
      if (!thisFieldValue || !matchingFieldValue) {
          field.validate();
      } else if (matchingFieldValue !== thisFieldValue) {
          field.invalidate(matchingFieldMessage);
      } else {
          field.validate();
      }
  });
  
  function isPasswordField(field) {
      return field.getAttribute('type') === 'password';
  }
  
  //Banned words
  _validatorRegister2.default.register(['doesnotcontain'], function (field) {
      var doesNotContainMessage = makeMessage('doesnotcontain', field.args);
  
      if (field.el.value.indexOf(field.args('doesnotcontain')) === -1) {
          field.validate();
      } else {
          field.invalidate(doesNotContainMessage);
      }
  });
  
  //Matches regex
  
  function matchesRegex(val, regex) {
      var matches = val.match(regex);
      if (!matches) {
          return false;
      }
      var isExactMatch = val === matches[0];
      return isExactMatch;
  }
  
  function pattern(field) {
      var patternMessage = makeMessage('pattern', field.args);
  
      if (matchesRegex(field.el.value, new RegExp(field.args('pattern')))) {
          field.validate();
      } else {
          field.invalidate(patternMessage);
      }
  }
  
  _validatorRegister2.default.register(['pattern'], pattern); //AUI-prefixed attribute is deprecated as of 5.9.0
  _validatorRegister2.default.register('[pattern]', pattern);
  
  //Native Required
  function required(field) {
      var requiredMessage = makeMessage('required', field.args);
      if (field.el.value) {
          field.validate();
      } else {
          field.invalidate(requiredMessage);
      }
  }
  _validatorRegister2.default.register(['required'], required); //AUI-prefixed attribute is deprecated as of 5.9.0
  _validatorRegister2.default.register('[required]', required);
  
  //Field value range (between min and max)
  
  function minOrMax(field) {
      var validNumberMessage = makeMessage('validnumber', field.args);
  
      var fieldValue = parseInt(field.el.value, 10);
      if (isNaN(fieldValue)) {
          field.invalidate(validNumberMessage);
          return;
      }
  
      var minValue = field.args('min');
      var maxValue = field.args('max');
  
      if (minValue && fieldValue < parseInt(minValue, 10)) {
          field.invalidate(makeMessage('min', field.args));
      } else if (maxValue && fieldValue > parseInt(maxValue, 10)) {
          field.invalidate(makeMessage('max', field.args));
      } else {
          field.validate();
      }
  }
  _validatorRegister2.default.register(['min', 'max'], minOrMax); //AUI-prefixed attribute is deprecated as of 5.9.0
  _validatorRegister2.default.register('[min],[max]', minOrMax);
  
  //Date format
  _validatorRegister2.default.register(['dateformat'], function (field) {
      var dateFormatSymbolic = field.args('dateformat');
      var dateFormatMessage = makeMessage('dateformat', field.args);
  
      var symbolRegexMap = {
          'Y': '[0-9]{4}',
          'y': '[0-9]{2}',
          'm': '(0?[1-9]|10|11|12)',
          'M': '[Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec]',
          'D': '[Mon|Tue|Wed|Thu|Fri|Sat|Sun]',
          'd': '([0-2]?[1-9]|10|20|30|31)'
      };
  
      var dateFormatSymbolArray = dateFormatSymbolic.split('');
      var dateFormatRegexString = '';
  
      dateFormatSymbolArray.forEach(function (dateSymbol) {
          var isRecognisedSymbol = symbolRegexMap.hasOwnProperty(dateSymbol);
          if (isRecognisedSymbol) {
              dateFormatRegexString += symbolRegexMap[dateSymbol];
          } else {
              dateFormatRegexString += dateSymbol;
          }
      });
  
      var dateFormatRegex = new RegExp(dateFormatRegexString + '$', 'i');
      var isValidDate = matchesRegex(field.el.value, dateFormatRegex);
  
      if (isValidDate) {
          field.validate();
      } else {
          field.invalidate(dateFormatMessage);
      }
  });
  
  //Checkbox count
  _validatorRegister2.default.register(['minchecked', 'maxchecked'], function (field) {
      var amountChecked = (0, _jquery2.default)(field.el).find(':checked').length;
      var aboveMin = !field.args('minchecked') || amountChecked >= field.args('minchecked');
      var belowMax = !field.args('maxchecked') || amountChecked <= field.args('maxchecked');
  
      var belowMinMessage = makeMessage('minchecked', field.args);
      var aboveMaxMessage = makeMessage('maxchecked', field.args);
  
      if (aboveMin && belowMax) {
          field.validate();
      } else if (!aboveMin) {
          field.invalidate(belowMinMessage);
      } else if (!belowMax) {
          field.invalidate(aboveMaxMessage);
      }
  });
  
  /*
       Retrieves a message for a plugin validator through the data attributes or the default (which is in the i18n file)
   */
  function makeMessage(key, accessorFunction, customTokens) {
      var inFlatpackMode = AJS.I18n.keys !== undefined;
      var defaultMessage;
      if (inFlatpackMode) {
          defaultMessage = AJS.I18n.keys['aui.validation.message.' + key];
      } else {
          defaultMessage = pluginI18nMessages[key];
      }
  
      var messageTokens = customTokens;
      if (!customTokens) {
          messageTokens = [accessorFunction(key)];
      }
  
      var customMessageUnformatted = accessorFunction(key + '-msg');
      var formattingArguments;
  
      if (customMessageUnformatted) {
          formattingArguments = [customMessageUnformatted].concat(messageTokens);
      } else {
          formattingArguments = [defaultMessage].concat(messageTokens);
      }
  
      return AJS.format.apply(null, formattingArguments);
  }
  
  /*
   The value AJS.I18n.getText('aui.validation.message...') (defaultMessage) cannot be refactored as it
   must appear verbatim for the plugin I18n transformation to pick it up
   */
  var pluginI18nMessages = {
      minlength: AJS.I18n.getText('aui.validation.message.minlength'),
      maxlength: AJS.I18n.getText('aui.validation.message.maxlength'),
      exactlength: AJS.I18n.getText('aui.validation.message.exactlength'),
      matchingfield: AJS.I18n.getText('aui.validation.message.matchingfield'),
      'matchingfield-novalue': AJS.I18n.getText('aui.validation.message.matchingfield-novalue'),
      doesnotcontain: AJS.I18n.getText('aui.validation.message.doesnotcontain'),
      pattern: AJS.I18n.getText('aui.validation.message.pattern'),
      required: AJS.I18n.getText('aui.validation.message.required'),
      validnumber: AJS.I18n.getText('aui.validation.message.validnumber'),
      min: AJS.I18n.getText('aui.validation.message.min'),
      max: AJS.I18n.getText('aui.validation.message.max'),
      dateformat: AJS.I18n.getText('aui.validation.message.dateformat'),
      minchecked: AJS.I18n.getText('aui.validation.message.minchecked'),
      maxchecked: AJS.I18n.getText('aui.validation.message.maxchecked')
  };
  
  (0, _amdify2.default)('aui/form-validation/basic-validators');
  
  return module.exports;
}).call(this);