/**
 * @module confluence-labels/labels/dialog/labels-dialog
 */
define('confluence-labels/labels/dialog/labels-dialog', [
    'confluence/templates',
    'ajs',
    'confluence-labels/labels/labels',
    'confluence/meta',
    'confluence/legacy',
    'jquery'
], function(
    Templates,
    AJS,
    Labels,
    Meta,
    Confluence,
    $
) {
    "use strict";

    if(!Templates.Labels) {
        return;
    }

    var LabelsDialog = {};

    var dialog = null;

    var close = function () {
        $("#"+dialog.id).find(".label-list").removeClass("editable");
        dialog.hide();
        return false;
    };

    var initDialog = function () {
        dialog = AJS.ConfluenceDialog({
            width : 600,
            height: 250,
            id: "edit-labels-dialog",
            onCancel: close
        });
        dialog.addHeader(AJS.I18n.getText("labels.name"));
        dialog.addPanel("Label Editor", Templates.Labels.dialog());
        dialog.addCancel(AJS.I18n.getText("close.name"), close);
        dialog.addHelpText(AJS.I18n.getText("labels.dialog.shortcut.tip"), {shortcut: "l"});
        // CONFDEV-12853: Add help link via prepend() instead of append() to prevent FF display issue
        dialog.popup.element.find(".dialog-title").prepend(Templates.Labels.helpLink());
        $("#add-labels-form").submit(function(e) {
            var input = $("#labels-string");
            e.preventDefault();
            var dialogLabelList = $("#dialog-label-list");
            Labels.addLabel(input.val(), dialogLabelList.attr("entityid"), dialogLabelList.attr("entitytype"))
                    .always(function() {
                        $("#labels-autocomplete-list").find('.aui-dropdown').addClass("hidden");
                        input.focus();
                    });
        });

        Labels.bindAutocomplete();
    };

    /**
     * Bind the click event for the supplied elements so that it will open
     * the dialog.
     *
     * @param $elements a jQuery wrapped collection of elements to bind the click event for.
     */
    LabelsDialog.bindOpenDialog = function($elements) {
        $elements.click(function (e) {
            e.preventDefault();
            var $target = $(e.target).closest(".labels-section-content");
            if ($target.length) {
                LabelsDialog.openDialog($target);
            } else {
                LabelsDialog.openDialog();
            }
        });
    };

    /**
     * @param labelSectionContent - the element containing the labels to be edited, defined in
     *   labels-content.vm, requires entityid and entitytype attributes, as well as a child node with
     *   class label-list.
     */
    LabelsDialog.openDialog = function(labelSectionContent) {
        var entityType;
        var entityId;
        var labelUrl;
        var dialogLabelList;

        if (!dialog) {
            initDialog();
        }

        if (labelSectionContent){
            entityId = labelSectionContent.attr("entityid");
            entityType = labelSectionContent.attr("entitytype");
        } else {
            //Otherwise, we are in the editor, editing a page/blogpost
            entityType = Meta.get("content-type");
            entityId = Confluence.Editor.Drafts.isNewContent() ? Meta.get("draft-id") : Meta.get("page-id");
        }

        labelUrl = Labels.routes.list(entityType, entityId);
        dialogLabelList = $("#dialog-label-list");

        dialogLabelList.attr("entityid", entityId);
        dialogLabelList.attr("entitytype", entityType);

        var showDialog = function() {
            dialog.show();
            $("#labels-string").val("").focus();
            // to bind label suggestions plugin
            AJS.trigger("labels.dialog.open");
        };

        var populateDialog = function(data) {
            LabelsDialog.updateDialogLabelList(data.labels);
            Meta.set('num-labels', data.labels.length);
            $('#rte-button-labels').trigger("updateLabel");
            showDialog();
        };

        // Labels for new templates and anonymous drafts are not stored on the server
        if (Labels.labelsAreNotPersisted(entityId)) {
            var labelString = Labels.getLabelsInputField();
            var labelList = Labels.parseLabelStringToArray(labelString);
            populateDialog({"labels" : labelList});
        } else {
            $.ajax({
                url: labelUrl,
                cache: false,
                success: function(data) {
                    var labelString = [];
                    $.each(data.labels, function(index, label) {
                        labelString.push(label.name);
                    });
                    Labels.setLabelsInputField(labelString.join(" "));
                    populateDialog(data);
                },
                error: function(request, textStatus) {
                    Labels.setLabelError("Unable to fetch current labels from the server.");
                    showDialog();
                }
            });
        }

        $("#dialog-label-list").attr("data-ready", "true");

    };

    /**
     * Update the list of labels in the dialog. Does not update the dialog if it has never been opened
     * @param labels - an array of label objects containing: id, name and prefix
     */
    LabelsDialog.updateDialogLabelList = function(labels) {
        var $dialogLabelList = $('#dialog-label-list');
        if ($dialogLabelList.length) {
            //Add link to the labels before we call the template
            $.each(labels, function(index, label) {
                label.link = Labels.getLabelLink(Meta.get("space-key"), label);
            });

            $dialogLabelList.html(
                    Templates.Labels.dialogLabelList({
                        "labels": labels,
                        "editable": true
                    })
            );
        }
    };

    return LabelsDialog;
});

require('confluence/module-exporter').safeRequire('confluence-labels/labels/dialog/labels-dialog', function(LabelsDialog) {
    var AJS = require('ajs');
    // TODO: Eventually decommission these globals.
    AJS.Labels.bindOpenDialog = LabelsDialog.bindOpenDialog;
    AJS.Labels.openDialog = LabelsDialog.openDialog;
    AJS.Labels.updateDialogLabelList = LabelsDialog.updateDialogLabelList;

    AJS.toInit(function($) {
        $(document).on('click', '#rte-button-labels', function (e) {
            LabelsDialog.openDialog();
        });

        $(".show-labels-editor").click(function (e) {
            e.preventDefault();
            var target = $(e.target).closest(".labels-section-content");
            LabelsDialog.openDialog(target);
        });
    });
});
