define("confluence-space-ia/avatar-picker/drag-drop-file-target",["jquery","underscore"],function(c,a){function b(d,e){return this.init.apply(this,arguments)}b.prototype.getDefaults=function(){return{activeDropTargetClass:"active-drop-target",uploadPrompt:AJS.I18n.getText("sidebar.avatar.picker.drag.image"),clientFileHandler:null}};b.prototype.init=function(d,e){a.bindAll(this,"onDragOver","onDragEnd","onDrop");this.$target=c(d);this.options=c.extend({},this.getDefaults(),e);this.$target.attr("data-upload-prompt",this.options.uploadPrompt);this.$target.on("dragover",this.onDragOver);this.$target.on("dragleave",this.onDragEnd);this.$target.on("dragend",this.onDragEnd);this.$target.on("drop",this.onDrop)};b.prototype.onDragOver=function(d){d.preventDefault();this.$target.addClass(this.options.activeDropTargetClass)};b.prototype.onDragEnd=function(d){d.preventDefault();this.$target.removeClass(this.options.activeDropTargetClass)};b.prototype.onDrop=function(d){d.preventDefault();d.originalEvent.preventDefault();this.$target.removeClass(this.options.activeDropTargetClass);if(this.options.clientFileHandler){this.options.clientFileHandler.handleFiles(d.originalEvent.dataTransfer.files,d.originalEvent.target)}};return b});