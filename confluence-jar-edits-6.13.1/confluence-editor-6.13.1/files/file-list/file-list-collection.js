/**
 * @module confluence-editor/files/file-list/file-list-collection
 */
define('confluence-editor/files/file-list/file-list-collection', [
    'backbone',
    'confluence-editor/files/file-item/file-item-model',
    'underscore'
], function(
    Backbone,
    FileItemModel,
    _
) {
    "use strict";

    var FileListCollection = Backbone.Collection.extend({
        model: FileItemModel,

        clearSelection: function () {
            this.each(function (model) {
                model.get("isSelect") && model.set("isSelect", false);
            });
            this.trigger("clear.selection");
        },

        getAllSelectItems: function () {
            return this.filter(function (model) {
                return model.get("isSelect");
            });
        },

        setSelection: function (models) {
            _.each(models, function (model) {
                return model.set("isSelect", true);
            });
        },

        resetFiles: function(models) {
            this.reset();
            for (var i = 0; i < models.length; i++) {
                this.addFile(models[i]);
            }
        },

        addFile: function(model) {
            var addedModels = this.add(model);
            this.trigger("add-file", addedModels.at(addedModels.length - 1));
        },

        removeFile: function(model) {
            this.remove(model);
            this.trigger("remove-file", model);
        },

        replaceFile: function(oldModel, newModel) {
            this.remove(oldModel);
            this.add(newModel);
            this.trigger("replace-file", oldModel, newModel);
        }
    });

    return FileListCollection;
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/files/file-list/file-list-collection', 'Confluence.Editor.FileDialog.FileListCollection');
