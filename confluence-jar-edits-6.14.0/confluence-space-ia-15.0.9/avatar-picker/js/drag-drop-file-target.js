define("confluence-space-ia/avatar-picker/drag-drop-file-target", [
    "jquery",
    "underscore"
], function($, _) {

    function DragDropFileTarget(el, opts){
        return this.init.apply(this, arguments);
    }

    DragDropFileTarget.prototype.getDefaults = function() {
        return {
            activeDropTargetClass: 'active-drop-target',
            uploadPrompt: AJS.I18n.getText('sidebar.avatar.picker.drag.image'),
            clientFileHandler: null
        };
    };

    DragDropFileTarget.prototype.init = function(el, opts){
        _.bindAll(this, 'onDragOver', 'onDragEnd', 'onDrop');

        this.$target = $(el);
        this.options = $.extend({}, this.getDefaults(), opts);

        this.$target.attr('data-upload-prompt', this.options.uploadPrompt);

        //bind drag & drop events
        this.$target.on('dragover', this.onDragOver);
        this.$target.on('dragleave', this.onDragEnd);
        this.$target.on('dragend', this.onDragEnd);
        this.$target.on('drop', this.onDrop);
    };

    DragDropFileTarget.prototype.onDragOver = function(e){
        e.preventDefault();
        this.$target.addClass(this.options.activeDropTargetClass);
    };

    DragDropFileTarget.prototype.onDragEnd = function(e){
        e.preventDefault();
        this.$target.removeClass(this.options.activeDropTargetClass);
    };

    DragDropFileTarget.prototype.onDrop = function(e){
        e.preventDefault();
        e.originalEvent.preventDefault();

        this.$target.removeClass(this.options.activeDropTargetClass);

        if (this.options.clientFileHandler) {
            this.options.clientFileHandler.handleFiles(e.originalEvent.dataTransfer.files, e.originalEvent.target);
        }
    };

    return DragDropFileTarget;
});