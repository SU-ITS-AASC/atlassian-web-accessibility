// src/js/aui/restful-table/events.js
(typeof window === 'undefined' ? global : window).__b912ac75391ff799576d1dfdc1dc3c70 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.default = {
      // AJS
      REORDER_SUCCESS: 'RestfulTable.reorderSuccess',
      ROW_ADDED: 'RestfulTable.rowAdded',
      ROW_REMOVED: 'RestfulTable.rowRemoved',
      EDIT_ROW: 'RestfulTable.switchedToEditMode',
      SERVER_ERROR: 'RestfulTable.serverError',
  
      // Backbone
      CREATED: 'created',
      UPDATED: 'updated',
      FOCUS: 'focus',
      BLUR: 'blur',
      SUBMIT: 'submit',
      SAVE: 'save',
      MODAL: 'modal',
      MODELESS: 'modeless',
      CANCEL: 'cancel',
      CONTENT_REFRESHED: 'contentRefreshed',
      RENDER: 'render',
      FINISHED_EDITING: 'finishedEditing',
      VALIDATION_ERROR: 'validationError',
      SUBMIT_STARTED: 'submitStarted',
      SUBMIT_FINISHED: 'submitFinished',
      INITIALIZED: 'initialized',
      ROW_INITIALIZED: 'rowInitialized',
      ROW_EDIT: 'editRow'
  };
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);