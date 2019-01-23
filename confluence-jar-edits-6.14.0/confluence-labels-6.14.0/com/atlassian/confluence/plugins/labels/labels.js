/**
 * @module confluence-labels/labels/labels
 */
define('confluence-labels/labels/labels', [
    'ajs',
    'confluence/legacy',
    'window',
    'document',
    'jquery',
    'confluence/message-controller'
], function(
    AJS,
    Confluence,
    window,
    document,
    $,
    MessageController
) {
    "use strict";

    var Labels = (function($) {

        var initLabelCount = function() {
            var num_labels = 0;
            if (AJS.Meta.get('num-labels')) {
                // existing pages will store num-labels here
                num_labels = AJS.Meta.get('num-labels');
            } else if ($('#createPageLabelsString').val()) {
                // templates, new pages and copied pages will store labels in the create page form
                num_labels = $.trim($('#createPageLabelsString').val()).split(/\s+/).length;
            }
            if (num_labels !== 0) {
                AJS.Meta.set('num-labels', num_labels);
                $('#rte-button-labels').trigger("updateLabel");
            }
        };
        AJS.bind("init.rte-control", initLabelCount);

        /**
         * Converts a space delimited string of labels stored in a form field on new pages into an
         * array of label objects eg ("notes my:label" => [{"name":"notes", "id": 1},{"name":"label","id":2, "prefix":"my"}])
         *
         * @param labelString a space delimited string of labels
         * @return {Array} an array containing labels objects
         */
        var parseLabelStringToArray = function (labelString) {
            labelString = $.trim(labelString);
            if (!labelString) {
                return [];
            }

            var labelList = [];
            var id = new Date().getTime();
            $(labelString.split(/\s+/)).each(function(index, value){
                // check string for prefix delimited by ':'
                var label = value.split(":");
                var prefix;
                var name = label[0];
                if (label.length === 2) {
                    prefix = label[0];
                    name = label[1];
                }
                labelList.push({name: name, prefix: prefix, id: id});
                id++;
            });
            return labelList;
        };

        var parseLabelArrayToString = function(labelArray) {
            var labelString = [];
            $.each(labelArray, function(index, label) {
                if (label.prefix && label.prefix !== 'global') {
                    labelString.push(label.prefix + ":" + label.name);
                } else {
                    labelString.push(label.name);
                }
            });
            return labelString.join(" ");
        };

        var defaults = {
            labelView: ".label-list",
            labelItem: ".aui-label",
            noLabelsMessage: ".no-labels-message",
            idAttribute: "data-label-id",
            labelsFormFieldId: AJS.Meta.get('labels-form-field-id') || "createPageLabelsString"
        };

        var path = AJS.contextPath();

        var routes = {
            "base": path + "/rest/ui/1.0/",
            "getRestEndPoint": function(entityType) {
                var endpoint = (
                    entityType === "attachment" ||
                    entityType === "template" ||
                    entityType === "space"
                ) ? entityType + "/" : "content/";
                return this.base + endpoint;
            },
            "index": path + "/labels/autocompletelabel.action?maxResults=3", // legacy
            "validate": function() {
                return this.getRestEndPoint() + "labels/validate";
            },
            "add": function(entityType, entityId) {
                return this.getRestEndPoint(entityType) + entityId + "/labels";
            },
            "remove": function(entityType, entityId, labelId) {
                return this.getRestEndPoint(entityType) + entityId + "/label/" + labelId;
            },
            "list": function(entityType, entityId) {
                return this.getRestEndPoint(entityType) + entityId + "/labels";
            }
        };

        var setLabelsInputField = function(labelString) {
            var $labelsField = $('#' + defaults.labelsFormFieldId);
            if ($labelsField.length) {
                $labelsField.val(labelString);
            }
        };

        var getLabelsInputField = function() {
            var $labelsField = $('#' + defaults.labelsFormFieldId);
            return $labelsField.length ? $labelsField.val() : "";
        };

        var isNewTemplate = function() {
            return !!document.getElementById("createpagetemplate");
        };

        var isSpaceAdminPage = function() { return $(".space-administration").length; };

        var labelsAreNotPersisted = function(entityId)
        {
            return entityId === "0" || isNewTemplate();
        };

        /**
         * Method finds and returns a jQuery wrapped set containing the label elements
         *
         * @method findLabelView
         * @param {String} entityid ex. 1638430
         * @param {String} entitytype ex. blogpost
         * @return {Object} Returns a jQuery wrapped set
         */
        function findLabelView(entityid, entitytype){
            if(!(entityid && entitytype)){
                var dialogLabelList = $("#dialog-label-list");
                entityid = dialogLabelList.attr("entityid");
                entitytype = dialogLabelList.attr("entitytype");
            }

            // if we have no entityid and no entitytype, assume only one label view on the page, this is the legacy behaviour.
            if(!(entityid && entitytype)) {
                return $(defaults.labelView);
            }

            var labelSection = $(".labels-section-content").filter(function() {
                return this.getAttribute("entityid") === entityid && this.getAttribute("entitytype") === entitytype;
            });
            return labelSection.find(defaults.labelView);
        }


        var labelAction = function(result) {
            setLabelError();

            if (result && result.promise) {
                result.always([resetForm, enableForm]);

                /* show or hide the "No Labels" text depending on whether there are any labels to display */
                result.done(function ($newLabels, $labelLists) {
                    // Trigger label count text update in Editor
                    AJS.Meta.set('num-labels', findLabelView().first().find(defaults.labelItem).size());
                    $("#rte-button-labels").trigger("updateLabel");
                    var $pageLabelList = $labelLists.not(".editable");
                    if ($labelLists.find(".aui-label").length === 0) {
                        $pageLabelList.find(".labels-edit-container").before(Confluence.Templates.Labels.nolabels());
                    } else {
                        $pageLabelList.find(".no-labels-message").remove();
                    }
                });
            }
            return result;
        };

        var disableForm = function() {
            $("#labels-string, #add-labels-editor-button").attr({
                "disabled": "disabled",
                "aria-disabled": true
            });
        };

        var enableForm = function() {
            $('#labels-string, #add-labels-editor-button').removeAttr("disabled aria-disabled");
        };

        var resetForm = function() {
            $("#labels-string").val('');
        };

        var setLabelError = function(message) {
            message = message || null;
            var selector = "#label-operation-error-message";
            $(selector).empty().toggle(!!message);
            AJS.messages.error(selector, { body: message });
        };

        var updatePageLabelsList = function(entityId, entityType, newLabels, spaceKey) {
            var $pageLabelList = findLabelView(entityId, entityType).not(".editable");
            if ($pageLabelList.length) {
                $pageLabelList.find("li.aui-label").remove();
                $pageLabelList.find("li.labels-edit-container").before(Confluence.Templates.Labels.dialogLabels({"labels": newLabels, "spaceKey" : spaceKey}));
            }

            return $pageLabelList;
        };

        var addLabels = function(labelString, entityId, entityType) {
            if (!labelString) { return false; }
            disableForm();

            // If labels are not persisted to the server, they are stored in a hidden input field until the page is saved.
            // Adding new labels appends them to the value of this element
            if (labelsAreNotPersisted(entityId)) {
                var labelsIfField = (getLabelsInputField() + " " + labelString).split(/\s+/);
                var uniqueLabels = [];
                $.each(labelsIfField, function(index, label) {
                    if ($.inArray(label, uniqueLabels) === -1) {
                        uniqueLabels.push(label);
                    }
                });
                labelString = uniqueLabels.join(" ");
            }

            var request = {
                    url: labelsAreNotPersisted(entityId) ? routes.validate() : routes.add(entityType, entityId),
                    type: "POST",
                    dataType: "json",
                    contentType: "application/json",
                    data: JSON.stringify(parseLabelStringToArray(labelString))
                };

            var callback = $.Deferred();
            var labelsTask = $.ajax(request);

            labelsTask.done(function(data) {
                var $dialogLabelList = $("#dialog-label-list").find(".label-list");
                var newLabels = data.labels;
                var newLabelsString = parseLabelArrayToString(newLabels);

                // Labels for new templates and anonymous drafts need a temp id so they can be individually removed
                if (labelsAreNotPersisted()) {
                    var tmpId = new Date().getTime();
                    $.each(newLabels, function(index, label) {
                        label.id = tmpId++;
                    });
                }

                setLabelsInputField(newLabelsString);
                Labels.updateDialogLabelList(newLabels);
                var $pageLabelList = updatePageLabelsList(entityId, entityType, newLabels, AJS.Meta.get("space-key"));

                callback.resolve(newLabels, $pageLabelList.add($dialogLabelList));
            });

            labelsTask.fail(function(xhr, status) {
                var errorMessage;
                if (status === "timeout") {
                    errorMessage = AJS.I18n.getText("xhr.timeout");
                } else if (xhr.status === 405) {
                    errorMessage = MessageController.parseError(xhr);
                } else {
                    try {
                        errorMessage = JSON.parse(xhr.responseText).message;
                    } catch (e) {
                        errorMessage = status;
                        AJS.log("Unexpected error when adding labels: " + e.message);
                    }
                }
                AJS.log("Failed to add labels: " + errorMessage);
                AJS.log("Failed to add labels xhr: " + xhr.responseText);
                setLabelError(errorMessage);
                callback.reject(status);
            });

            return callback.promise();
        };

        var removeLabel = function(label, entityId, entityType) {
            if (!label) { return false; }
            label = label.jquery ? label : $(label);

            // Space admin page does not follow the common labels dialog convention
            // It's just different.
            if (isSpaceAdminPage()) {
                entityId = AJS.Meta.get("space-key");
                entityType = 'space';
            }

            var labelId = label.attr(defaults.idAttribute);
            var removeLabelTask;

            var callback = $.Deferred();

            if (labelsAreNotPersisted(entityId)) {
                removeLabelTask = $.Deferred();
                removeLabelTask.resolve();
            } else {
                var request = {
                    url: routes.remove(entityType, entityId, labelId),
                    type: "DELETE",
                    dataType: "json",
                    contentType: "application/json",
                    data: {}
                };
                removeLabelTask = $.ajax(request);
            }

            removeLabelTask.done(function() {
                // Space admin page does not follow the common labels dialog convention
                // It's just different.
                var labelView = isSpaceAdminPage() ? $('#space-categories-list') : findLabelView(entityId, entityType);
                var list = labelView.find(defaults.labelItem);
                var labels = list.filter("["+defaults.idAttribute+"='"+labelId+"']");
                labels.fadeOut("normal", function() {
                    labels.remove();
                    callback.resolve(label, labelView);
                });

                var removedLabelName = $.trim(label.find("a").text());
                var labelNames = getLabelsInputField().split(/\s+/);
                labelNames = $.grep(labelNames, function(labelName) {
                    return (labelName && labelName !== removedLabelName);
                });
                setLabelsInputField(labelNames.join(' '));
            });

            removeLabelTask.fail(function(xhr, statusText) {
                var errorMessage;
                if (statusText === "timeout") {
                    errorMessage = AJS.I18n.getText("xhr.timeout");
                } else {
                    errorMessage = MessageController.parseError(xhr, statusText);
                }
                AJS.log("Failed to remove label: " + errorMessage);
                AJS.log("Failed to remove label xhr: " + xhr.responseText);
                setLabelError(errorMessage);
                callback.reject(statusText);
            });

            return callback.promise();
        };

        var fetchLabels = function() {
            var entityType = AJS.Meta.get("content-type");
            var entityId = Confluence.Editor.Drafts.isNewContent() ? AJS.Meta.get("draft-id") : AJS.Meta.get("page-id");

            if (labelsAreNotPersisted(entityId)) { return; }

            $.ajax({
                url: routes.list(entityType, entityId),
                cache: false,
                success: function(data) {
                    AJS.Meta.set('num-labels', data.labels.length);
                    $('#rte-button-labels').trigger("updateLabel");
                    Labels.updateDialogLabelList(data.labels);
                },
                error: function(xhr, status) {
                    AJS.logError(status);
                }
            });
        };

        // Binds the autocomplete labels ajax call to the labels input field.
        // Labels are added on select of the autocomplete drop down if the input field is within a form.
        var bindAutocomplete = function() {
            var labelInput = $("#labels-string");
            var addLabelOnSelect = labelInput.parents("#add-labels-form").length;

            if (!labelInput.length) {
                return;
            }

            var dropDownPlacement = function (dropDown) {
                $("#labels-autocomplete-list").append(dropDown);
            };

            var onselect = function (selection) {
                if (selection.find("a.label-suggestion").length) {

                    var span = $("span", selection);
                    var contentProps = $.data(span[0], "properties");
                    var value = labelInput.val();
                    var labelArray = [];

                    if(addLabelOnSelect) {
                        labelArray = value.split(/\s+/);

                        labelArray[labelArray.length - 1] = contentProps.name;
                        labelInput.val(labelArray.join(' '));
                    } else {
                        // this hacky code was copied from uberlabels.js
                        var tokens = Labels.queryTokens;
                        var last_token_pos = -1;
                        var this_token_pos;
                        var token = "";

                        for (var i = 0, ii=tokens.length; i < ii; i++) {
                            token = tokens[i];
                            this_token_pos = value.lastIndexOf(token);

                            if (this_token_pos > last_token_pos) {
                                last_token_pos = this_token_pos;
                            }
                        }

                        if (last_token_pos !== -1) {
                            var new_value = value.substr(0, last_token_pos);
                            var whitespace = value.substr(last_token_pos + token.length).match(/^\s+/);
                            if (whitespace) {
                                new_value += whitespace[0];
                            }
                            labelInput.val(new_value + contentProps.name);
                        }
                        else {
                            labelInput.val(contentProps.name);
                        }
                    }
                }
            };
            var onshow = function() {
                if (!$("#labels-autocomplete-list").find(".label-suggestion").length || labelInput.val() === "") {
                    this.hide();
                }
                else if(!addLabelOnSelect) {
                    // remove hrefs if we're not going to add the label on select
                    var labels = $("#labels-autocomplete-list").find("a.label-suggestion");
                    for(var i = 0; i < labels.length; i++) {
                        labels.get(i).href = "#";
                    }
                }
            };
            var url = "/labels/autocompletelabel.action?maxResults=3";
            $(window).bind("quicksearch.ajax-success", function(e, data) {
                if (data.url === url) {
                    Labels.queryTokens = (data.json && data.json.queryTokens) || [];
                    return false;
                }
            });
            $(window).bind("quicksearch.ajax-error", function(e, data) {
                if (data.url == url) {
                    Labels.queryTokens = [];
                    return false;
                }
            });
            labelInput.quicksearch(url, onshow, {
                makeParams: function(val) {
                    return {
                        query: val,
                        contentId: AJS.params.pageId || ""
                    };
                },
                dropdownPlacement : dropDownPlacement,
                ajsDropDownOptions : {
                    selectionHandler: function (e, selection) {
                        onselect(selection);
                        this.hide();
                        e.preventDefault();
                        labelInput.focus();
                    }
                }
            });
        };

        var getLabelLink = function(spaceKey, label) {
            function getFullLabelName(prefix, labelName) {
                if (prefix === "global" || prefix === "team" || prefix === undefined || prefix === "" || prefix === null) {
                    return labelName;
                } else {
                    return prefix + ":" + labelName;
                }
            }

            var url = "/label/";

            if (spaceKey !== null && spaceKey !== undefined && spaceKey !== "") {
                url += spaceKey + "/";
            }

            return encodeURI(url + getFullLabelName(label.prefix, label.name));
        };

        $(document).on("click", ".label-list.editable .aui-icon-close", function(e) {
            e.preventDefault();
            var dialogLabelList = $("#dialog-label-list");
            Labels.removeLabel($(this).closest('li'), dialogLabelList.attr("entityid"), dialogLabelList.attr("entitytype"));
        });
        // Make the labels on the space admin page editable.
        AJS.toInit(function(){
            if (isSpaceAdminPage()) {
                // bind autocomplete for space admin label field (find a better place for this?)
                Labels.bindAutocomplete();
                $(".label-list").addClass("editable");
            }
        });

        /**
         * Catches any heartbeat event and checks if the label hash has changed. A new hash triggers the client to request the new label data from the server
         */
        var handleHeartbeat = function(event, data) {
            if (typeof data.labelsHash === 'undefined') { return; }

            var $labelsButton = $('#rte-button-labels');
            if ($labelsButton.data('labelsHash') !== data.labelsHash) {
                fetchLabels();
                $labelsButton.data('labelsHash', data.labelsHash);
            }
        };
        AJS.bind('editor-heartbeat', handleHeartbeat);

        return {
            addLabel: function(labelString, entityId, entityType) {
                return labelAction(addLabels(labelString, entityId, entityType));
            },
            removeLabel: function(label, entityId, entityType) {
                return labelAction(removeLabel(label, entityId, entityType));
            },
            bindAutocomplete: bindAutocomplete,
            labelsAreNotPersisted: labelsAreNotPersisted,
            routes: routes,
            setLabelError: setLabelError,
            parseLabelStringToArray: parseLabelStringToArray,
            getLabelLink: getLabelLink,
            setLabelsInputField: setLabelsInputField,
            getLabelsInputField: getLabelsInputField
        };
    })($);

    return Labels;
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-labels/labels/labels', 'AJS.Labels');