// src/js/aui/form-validation/validator-register.js
(typeof window === 'undefined' ? global : window).__5746c3dc0d9d4c30df5b0c1dc2a92a90 = (function () {
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
  
  var _log = __c1e961001275c079e48525ad3a48c8c2;
  
  var logger = _interopRequireWildcard(_log);
  
  var _amdify = __65ca28a9d6b0f244027266ff8e6a6d1c;
  
  var _amdify2 = _interopRequireDefault(_amdify);
  
  function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var ATTRIBUTE_RESERVED_ARGUMENTS = ['displayfield', 'watchfield', 'when', 'novalidate', 'state'];
  var _validators = [];
  
  function getReservedArgument(validatorArguments) {
      var reservedArgument = false;
  
      validatorArguments.some(function (arg) {
          var isReserved = _jquery2.default.inArray(arg, ATTRIBUTE_RESERVED_ARGUMENTS) !== -1;
  
          if (isReserved) {
              reservedArgument = arg;
          }
  
          return isReserved;
      });
  
      return reservedArgument;
  }
  
  /**
   * Register a validator that can be used to validate fields. The main entry point for validator plugins.
   * @param trigger - when to run the validator. Can be an array of arguments, or a selector
   * @param validatorFunction - the function that will be called on the field to determine validation. Receives
   *      field - the field that is being validated
   *      args - the arguments that have been specified in HTML markup.
   */
  function registerValidator(trigger, validatorFunction) {
      var triggerSelector;
  
      if (typeof trigger === 'string') {
          triggerSelector = trigger;
      } else {
          var reservedArgument = getReservedArgument(trigger);
  
          if (reservedArgument) {
              logger.warn('Validators cannot be registered with the argument "' + reservedArgument + '", as it is a reserved argument.');
              return false;
          }
  
          triggerSelector = '[data-aui-validation-' + trigger.join('],[data-aui-validation-') + ']';
      }
  
      var validator = {
          validatorFunction: validatorFunction,
          validatorTrigger: triggerSelector
      };
  
      _validators.push(validator);
  
      return validator;
  }
  
  var validatorRegister = {
      register: registerValidator,
      validators: function validators() {
          return _validators;
      }
  };
  
  (0, _amdify2.default)('aui/form-validation/validator-register', validatorRegister);
  
  exports.default = validatorRegister;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);