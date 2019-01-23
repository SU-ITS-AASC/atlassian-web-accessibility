// src/js-vendor/jquery/serializetoobject.js
(typeof window === 'undefined' ? global : window).__a66ae57438a6301a66d32681106ab1de = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  /**
   * Serializes form fields within the given element to a JSON object
   *
   * {
   *    fieldName: "fieldValue"
   * }
   *
   * @returns {Object}
   */
  jQuery.fn.serializeObject = function () {
  
      var data = {};
  
      this.find(":input:not(:button):not(:submit):not(:radio):not('select[multiple]')").each(function () {
  
          if (this.name === "") {
              return;
          }
  
          if (this.value === null) {
              this.value = "";
          }
  
          data[this.name] = this.value.match(/^(tru|fals)e$/i) ?
                              this.value.toLowerCase() == "true" : this.value;
      });
  
      this.find("input:radio:checked").each(function(){
          data[this.name] = this.value;
      });
  
      this.find("select[multiple]").each(function(){
  
          var $select = jQuery(this),
              val = $select.val();
  
          if ($select.data("aui-ss")) {
              if (val) {
                  data[this.name] = val[0];
              } else {
                  data[this.name] = "";
              }
          } else {
  
              if (val !== null) {
                  data[this.name] = val;
              } else {
                  data[this.name] = [];
              }
          }
      });
  
      return data;
  };
  
  return module.exports;
}).call(this);