// src/js/aui/internal/attributes.js
(typeof window === 'undefined' ? global : window).__ab489eda548cad099ce93b60faa6a3d5 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.computeBooleanValue = computeBooleanValue;
  exports.setBooleanAttribute = setBooleanAttribute;
  exports.computeEnumValue = computeEnumValue;
  exports.setEnumAttribute = setEnumAttribute;
  /**
   * Like el.hasAttribute(attr) but designed for use within a skate attribute
   * change handler where you only have access to change.oldValue.
   */
  function computeBooleanValue(attrValue) {
      return attrValue !== null;
  }
  
  function setBooleanAttribute(el, attr, newValue) {
      if (newValue) {
          el.setAttribute(attr, '');
      } else {
          el.removeAttribute(attr);
      }
  }
  
  function computeEnumValue(enumOptions, value) {
      var matchesEnumValue = function matchesEnumValue(enumValue) {
          return enumValue.toLowerCase() === value.toLowerCase();
      };
  
      var isMissing = value === null;
      var isInvalid = !isMissing && !enumOptions.values.filter(matchesEnumValue).length;
  
      if (isMissing) {
          if (enumOptions.hasOwnProperty('missingDefault')) {
              return enumOptions.missingDefault;
          }
          return null;
      }
  
      if (isInvalid) {
          if (enumOptions.hasOwnProperty('invalidDefault')) {
              return enumOptions.invalidDefault;
          } else if (enumOptions.hasOwnProperty('missingDefault')) {
              return enumOptions.missingDefault;
          }
          return null;
      }
  
      return enumOptions.values.length ? enumOptions.values.filter(matchesEnumValue)[0] : null;
  }
  
  function setEnumAttribute(el, enumOptions, newValue) {
      el.setAttribute(enumOptions.attribute, newValue);
  }
  
  /**
   * Helper functions useful for implementing reflected boolean and enumerated
   * attributes and properties.
   *
   * @see https://html.spec.whatwg.org/multipage/infrastructure.html#reflecting-content-attributes-in-idl-attributes
   * @see https://html.spec.whatwg.org/multipage/infrastructure.html#boolean-attribute
   * @see https://html.spec.whatwg.org/multipage/infrastructure.html#enumerated-attribute
   */
  exports.default = {
      computeBooleanValue: computeBooleanValue,
      setBooleanAttribute: setBooleanAttribute,
  
      computeEnumValue: computeEnumValue,
      setEnumAttribute: setEnumAttribute
  };
  
  return module.exports;
}).call(this);