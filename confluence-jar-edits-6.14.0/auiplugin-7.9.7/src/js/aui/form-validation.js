// src/js/aui/form-validation.js
(typeof window === 'undefined' ? global : window).__276ead0c2b803a087db4ce7a0d05053e = (function () {
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
  
  __4e3ec9eab102d61251e1822630f72c09;
  
  __bd17153ec513fce3d14cee034d5c4bee;
  
  var _amdify = __65ca28a9d6b0f244027266ff8e6a6d1c;
  
  var _amdify2 = _interopRequireDefault(_amdify);
  
  var _deprecation = __921ad9514d56376fef992861d9ec0f51;
  
  var deprecate = _interopRequireWildcard(_deprecation);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _skate = __0ac9a2c09f995a9c0a478af8742f59b7;
  
  var _skate2 = _interopRequireDefault(_skate);
  
  var _validatorRegister = __5746c3dc0d9d4c30df5b0c1dc2a92a90;
  
  var _validatorRegister2 = _interopRequireDefault(_validatorRegister);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  //Attributes
  var ATTRIBUTE_VALIDATION_OPTION_PREFIX = 'aui-validation-';
  var ATTRIBUTE_NOTIFICATION_PREFIX = 'data-aui-notification-';
  
  var ATTRIBUTE_FIELD_STATE = 'aui-validation-state';
  var INVALID = 'invalid';
  var VALID = 'valid';
  var VALIDATING = 'validating';
  var UNVALIDATED = 'unvalidated';
  
  var ATTRIBUTE_VALIDATION_FIELD_COMPONENT = 'data-aui-validation-field';
  
  //Classes
  var CLASS_VALIDATION_INITIALISED = '_aui-form-validation-initialised';
  
  //Events
  var EVENT_FIELD_STATE_CHANGED = '_aui-internal-field-state-changed';
  
  function isFieldInitialised($field) {
      return $field.hasClass(CLASS_VALIDATION_INITIALISED);
  }
  
  function initValidation($field) {
      if (!isFieldInitialised($field)) {
          initialiseDisplayField($field);
          prepareFieldMarkup($field);
          bindFieldEvents($field);
          changeFieldState($field, UNVALIDATED);
      }
  }
  
  function initialiseDisplayField($field) {
      getDisplayField($field).attr('data-aui-notification-field', '');
  }
  
  function prepareFieldMarkup($field) {
      $field.addClass(CLASS_VALIDATION_INITIALISED);
  }
  
  function bindFieldEvents($field) {
      bindStopTypingEvent($field);
      bindValidationEvent($field);
  }
  
  function bindStopTypingEvent($field) {
      var keyUpTimer;
  
      var triggerStopTypingEvent = function triggerStopTypingEvent() {
          $field.trigger('aui-stop-typing');
      };
  
      $field.on('keyup', function () {
          clearTimeout(keyUpTimer);
          keyUpTimer = setTimeout(triggerStopTypingEvent, 1500);
      });
  }
  
  function bindValidationEvent($field) {
      var validateWhen = getValidationOption($field, 'when');
      var watchedFieldID = getValidationOption($field, 'watchfield');
  
      var elementsToWatch = watchedFieldID ? $field.add('#' + watchedFieldID) : $field;
  
      elementsToWatch.on(validateWhen, function startValidation() {
          validationTriggeredHandler($field);
      });
  }
  
  function validationTriggeredHandler($field) {
      var noValidate = getValidationOption($field, 'novalidate');
  
      if (noValidate) {
          changeFieldState($field, VALID);
          return;
      }
  
      return startValidating($field);
  }
  
  function getValidationOption($field, option) {
      var defaults = {
          'when': 'change'
      };
      var optionValue = $field.attr('data-' + ATTRIBUTE_VALIDATION_OPTION_PREFIX + option);
      if (!optionValue) {
          optionValue = defaults[option];
      }
  
      return optionValue;
  }
  
  function startValidating($field) {
      clearFieldMessages($field);
  
      var validatorsToRun = getActivatedValidators($field);
  
      changeFieldState($field, VALIDATING);
  
      var deferreds = runValidatorsAndGetDeferred($field, validatorsToRun);
      var fieldValidators = _jquery2.default.when.apply(_jquery2.default, deferreds);
      fieldValidators.done(function () {
          changeFieldState($field, VALID);
      });
  
      return fieldValidators;
  }
  
  function clearFieldMessages($field) {
      setFieldNotification(getDisplayField($field), 'none');
  }
  
  function getValidators() {
      return _validatorRegister2.default.validators();
  }
  
  function getActivatedValidators($field) {
      var callList = [];
      getValidators().forEach(function (validator, index) {
          var validatorTrigger = validator.validatorTrigger;
          var runThisValidator = $field.is(validatorTrigger);
          if (runThisValidator) {
              callList.push(index);
          }
      });
  
      return callList;
  }
  
  function runValidatorsAndGetDeferred($field, validatorsToRun) {
      var allDeferreds = [];
  
      validatorsToRun.forEach(function (validatorIndex) {
          var validatorFunction = getValidators()[validatorIndex].validatorFunction;
          var deferred = new _jquery2.default.Deferred();
          var validatorContext = createValidatorContext($field, deferred);
          validatorFunction(validatorContext);
  
          allDeferreds.push(deferred);
      });
  
      return allDeferreds;
  }
  
  function createValidatorContext($field, validatorDeferred) {
      var context = {
          validate: function validate() {
              validatorDeferred.resolve();
          },
          invalidate: function invalidate(message) {
              changeFieldState($field, INVALID, message);
              validatorDeferred.reject();
          },
          args: createArgumentAccessorFunction($field),
          el: $field[0],
          $el: $field
      };
  
      deprecate.prop(context, '$el', {
          sinceVersion: '5.9.0',
          removeInVersion: '8.0.0',
          alternativeName: 'el',
          extraInfo: 'See https://ecosystem.atlassian.net/browse/AUI-3263.'
      });
  
      return context;
  }
  
  function createArgumentAccessorFunction($field) {
      return function (arg) {
          return $field.attr('data-' + ATTRIBUTE_VALIDATION_OPTION_PREFIX + arg) || $field.attr(arg);
      };
  }
  
  function changeFieldState($field, state, message) {
      $field.attr('data-' + ATTRIBUTE_FIELD_STATE, state);
  
      if (state === UNVALIDATED) {
          return;
      }
  
      $field.trigger(_jquery2.default.Event(EVENT_FIELD_STATE_CHANGED));
  
      var $displayField = getDisplayField($field);
  
      var stateToNotificationTypeMap = {};
      stateToNotificationTypeMap[VALIDATING] = 'wait';
      stateToNotificationTypeMap[INVALID] = 'error';
      stateToNotificationTypeMap[VALID] = 'success';
  
      var notificationType = stateToNotificationTypeMap[state];
  
      if (state === VALIDATING) {
          showSpinnerIfSlow($field);
      } else {
          setFieldNotification($displayField, notificationType, message);
      }
  }
  
  function showSpinnerIfSlow($field) {
      setTimeout(function () {
          var stillValidating = getFieldState($field) === VALIDATING;
          if (stillValidating) {
              setFieldNotification($field, 'wait');
          }
      }, 500);
  }
  
  function setFieldNotification($field, type, message) {
      var spinnerWasVisible = isSpinnerVisible($field);
      removeIconOnlyNotifications($field);
      var skipShowingSuccessNotification = type === 'success' && !spinnerWasVisible;
      if (skipShowingSuccessNotification) {
          return;
      }
  
      if (type === 'none') {
          removeFieldNotification($field, 'error');
      } else {
          var previousMessage = $field.attr(ATTRIBUTE_NOTIFICATION_PREFIX + type) || '[]';
          var newMessage = message ? combineJSONMessages(message, previousMessage) : '';
          $field.attr(ATTRIBUTE_NOTIFICATION_PREFIX + type, newMessage);
      }
  }
  
  function removeIconOnlyNotifications($field) {
      removeFieldNotification($field, 'wait');
      removeFieldNotification($field, 'success');
  }
  
  function removeFieldNotification($field, type) {
      $field.removeAttr(ATTRIBUTE_NOTIFICATION_PREFIX + type);
  }
  
  function isSpinnerVisible($field) {
      return $field.is('[' + ATTRIBUTE_NOTIFICATION_PREFIX + 'wait]');
  }
  
  function combineJSONMessages(newString, previousString) {
      var previousStackedMessageList = JSON.parse(previousString);
      var newStackedMessageList = previousStackedMessageList.concat([newString]);
      var newStackedMessage = JSON.stringify(newStackedMessageList);
      return newStackedMessage;
  }
  
  function getDisplayField($field) {
      var displayFieldID = getValidationOption($field, 'displayfield');
      var notifyOnSelf = displayFieldID === undefined;
      return notifyOnSelf ? $field : (0, _jquery2.default)('#' + displayFieldID);
  }
  
  function getFieldState($field) {
      return $field.attr('data-' + ATTRIBUTE_FIELD_STATE);
  }
  
  /**
   * Trigger validation on a field manually
   * @param $field the field that validation should be triggered for
   */
  function validateField($field) {
      $field = (0, _jquery2.default)($field);
      validationTriggeredHandler($field);
  }
  
  /**
   * Form scrolling and submission prevent based on validation state
   * -If the form is unvalidated, validate all fields
   * -If the form is invalid, go to the first invalid element
   * -If the form is validating, wait for them to validate and then try submitting again
   * -If the form is valid, allow form submission
   */
  (0, _jquery2.default)(document).on('submit', function (e) {
      var form = e.target;
      var $form = (0, _jquery2.default)(form);
  
      var formState = getFormStateName($form);
      if (formState === UNVALIDATED) {
          delaySubmitUntilStateChange($form, e);
          validateUnvalidatedFields($form);
      } else if (formState === VALIDATING) {
          delaySubmitUntilStateChange($form, e);
      } else if (formState === INVALID) {
          e.preventDefault();
          selectFirstInvalid($form);
      } else if (formState === VALID) {
          var validSubmitEvent = _jquery2.default.Event('aui-valid-submit');
          $form.trigger(validSubmitEvent);
          var preventNormalSubmit = validSubmitEvent.isDefaultPrevented();
          if (preventNormalSubmit) {
              e.preventDefault(); //users can bind to aui-valid-submit for ajax forms
          }
      }
  });
  
  function delaySubmitUntilStateChange($form, event) {
      event.preventDefault();
      $form.one(EVENT_FIELD_STATE_CHANGED, function () {
          $form.trigger('submit');
      });
  }
  
  function getFormStateName($form) {
      var $fieldCollection = $form.find('.' + CLASS_VALIDATION_INITIALISED);
      var fieldStates = getFieldCollectionStateNames($fieldCollection);
      var wholeFormState = mergeStates(fieldStates);
      return wholeFormState;
  }
  
  function getFieldCollectionStateNames($fields) {
      var states = _jquery2.default.map($fields, function (field) {
          return getFieldState((0, _jquery2.default)(field));
      });
      return states;
  }
  
  function mergeStates(stateNames) {
      var containsInvalidState = stateNames.indexOf(INVALID) !== -1;
      var containsUnvalidatedState = stateNames.indexOf(UNVALIDATED) !== -1;
      var containsValidatingState = stateNames.indexOf(VALIDATING) !== -1;
  
      if (containsInvalidState) {
          return INVALID;
      } else if (containsUnvalidatedState) {
          return UNVALIDATED;
      } else if (containsValidatingState) {
          return VALIDATING;
      } else {
          return VALID;
      }
  }
  
  function validateUnvalidatedFields($form) {
      var $unvalidatedElements = getFieldsInFormWithState($form, UNVALIDATED);
      $unvalidatedElements.each(function (index, el) {
          validator.validate((0, _jquery2.default)(el));
      });
  }
  
  function selectFirstInvalid($form) {
      var $firstInvalidField = getFieldsInFormWithState($form, INVALID).first();
      $firstInvalidField.focus();
  }
  
  function getFieldsInFormWithState($form, state) {
      var selector = '[data-' + ATTRIBUTE_FIELD_STATE + '=' + state + ']';
      return $form.find(selector);
  }
  
  var validator = {
      register: _validatorRegister2.default.register,
      validate: validateField
  };
  
  (0, _skate2.default)(ATTRIBUTE_VALIDATION_FIELD_COMPONENT, {
      attached: function attached(field) {
          if (field.form) {
              field.form.setAttribute('novalidate', 'novalidate');
          }
          var $field = (0, _jquery2.default)(field);
          initValidation($field);
          _skate2.default.init(field); //needed to kick off form notification skate initialisation
      },
      type: _skate2.default.type.ATTRIBUTE
  });
  
  (0, _amdify2.default)('aui/form-validation', validator);
  (0, _globalize2.default)('formValidation', validator);
  exports.default = validator;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);