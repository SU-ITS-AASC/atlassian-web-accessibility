AJS.$(function($) {
    var confluenceContextPath = AJS.contextPath(),
        attachmentVersionError = AJS.I18n.getText("confluence.extra.attachments.error.attachmentsversionserror"),

        // CONF-31616 - using tinyMCE user agent detection for IE11 and up
        ie11UP = !!(navigator.userAgent.indexOf('Trident/') != -1 && (navigator.userAgent.indexOf('rv:') != -1 || navigator.appName.indexOf('Netscape') != -1));

    function getFieldSetAsParams(fieldSet) {
        var params = {};

        fieldSet.find("input").each(function() {
            params[this.name] = this.value;
        });

        return params;
    }

    function loadAttachmentHistory($attachmentRow) {
        var attachmentsTableContainer = $attachmentRow.closest('.plugin_attachments_table_container');
        var data = {};
        data.attachmentId = $attachmentRow.data('attachment-id');

        $.ajax({
            cache: false,
            data : data,
            dataType : "html",
            type : "GET",
            url : confluenceContextPath + "/pages/plugins/attachments/loadattachmentversions.action",
            success : function(serverGeneratedHtml) {
                var $serverContent = $(serverGeneratedHtml);

                AJS.Labels.bindOpenDialog($(".show-labels-editor", $serverContent));

                var versionHistory = $attachmentRow.next().find(".attachment-history-wrapper");
                versionHistory.empty();
                versionHistory.append($serverContent);
            },

            error : function(XMLHttpRequest, textStatus, errorThrown) {
                AJS.log("Error retrieving attachment old versions: " + errorThrown);
                var pluginAttachmentsContainer = attachmentsTableContainer.parent('.plugin_attachments_container');
                attachmentsTableContainer.remove();
                $("div.plugin_attachments_upload_container", pluginAttachmentsContainer).remove();
                pluginAttachmentsContainer.append('<div class="attachments-old-version-error error">'+ attachmentVersionError +'</div>');
            }

        });
    }

    // This can go after the new version of the OfficeConnector has been around enough time (this code comes from there)
    function initSlideViewer($selector) {
        var $el = $selector.find(".vf-slide-viewer");
        var $load = $selector.find(".vf-slide-loading");

        // loading indicator
        AJS.$($load[0]).spin({length: 10, radius:10, width: 5});

        var data = {
            width: $selector.data("width"),
            height: $selector.data("height"),
            attachment: $selector.data("attachment"),
            attachmentId: $selector.data("attachment-id"),
            attachmentVer: $selector.data("attachment-ver"),
            pageId: $selector.data("page-id"),
            downloadPath: AJS.contextPath() + $selector.data("download-path"),
            usePathAuth: $selector.data("use-path-auth"),
            editUrl: AJS.contextPath() + OC.Util.decodeUrl($selector.data("edit-url"))
        };
        // for some reason the server sends allow-edit for all pdfs
        data.allowEdit = $selector.data("allow-edit") && data.editUrl.substring(data.editUrl.length - 3) !== "pdf";

        var slide = new OC.Slide(data);
        var slideCache = new OC.SlideCache(slide);

        var view = new OC.SlideViewerView({model: slide, cache: slideCache, el: $el});
        $selector.append(view.render().el);

        // fetch first slide
        slide.waitUntilReady();
    }

    function loadAttachmentPreview($attachmentRow) {
        var attachmentsTableContainer = $attachmentRow.closest('.plugin_attachments_table_container');
        var data = {
            "attachmentId" : $attachmentRow.data('attachment-id')
        };

        $.ajax({
            cache: false,
            data : data,
            dataType : "html",
            type : "GET",
            url : confluenceContextPath + "/rest/attachments/1.0/details/preview",
            success : function(serverGeneratedHtml) {
                var $serverContent = $.trim(serverGeneratedHtml) ? $(serverGeneratedHtml) : null;

                var preview = $attachmentRow.next().find(".attachment-image-preview");
                preview.empty();
                preview.append($serverContent || "<span></span>");

                if ($serverContent.is(".vf-slide-viewer-macro")) {
                    var initFunc = OC.initSlideViewer || initSlideViewer;
                    initFunc($serverContent);
                }
            },

            error : function(XMLHttpRequest, textStatus, errorThrown) {
                AJS.log("Error retrieving attachment preview: " + errorThrown);
                var pluginAttachmentsContainer = attachmentsTableContainer.parent('.plugin_attachments_container');
                attachmentsTableContainer.remove();
                $("div.plugin_attachments_upload_container", pluginAttachmentsContainer).remove();
                pluginAttachmentsContainer.append('<div class="attachments-old-version-error error">'+ attachmentVersionError +'</div>');
            }

        });
    }

    var attachments = {

        getFieldSetAsParams : getFieldSetAsParams,

        initAttachmentTable : function(attachmentsTableContainer) {
            // Prevent events from being bound twice.
            // Most important for the menus because if there are
            // two events the show and hide timer gets out of whack.

            $(".attachment-menu-bar .ajs-menu-item").unbind();
            $(".attachment-menu-bar").ajsMenu();

            $(".attachments .attachment-row .attachment-dropdown-actions .action-dropdown", attachmentsTableContainer).addClass("hide-menu");
            $(".attachments .attachment-row .attachment-dropdown-actions .action-dropdown .aui-dd-parent .aui-dropdown", attachmentsTableContainer).addClass("hidden");
            $(".attachments .attachment-dropdown-actions span", attachmentsTableContainer).addClass("hide-icons");

            AJS.Labels.bindOpenDialog($(".show-labels-editor", attachmentsTableContainer));

            var params = this.getFieldSetAsParams(attachmentsTableContainer.children("fieldset"));

            $(".attachments .attachment-row", attachmentsTableContainer)
            .hover(function() {
                    var $row = $(this);
                    if(!$row.is(".focused"))
                    {
                        $row.addClass("hovered");
                    }
                    $row.find("span").toggleClass("hide-icons hide-menu", false);
                    $row.find(".attachment-dropdown-actions .action-dropdown").dropDown("Standard",  { alignment : "right" });

                    $row.find("a.aui-dropdown2-trigger").show();
                },

                function() {
                    var $row = $(this);
                    $row.removeClass("hovered");

                    var focused = $row.is(".focused");
                    $row.find("span").toggleClass("hide-icons", !focused);
                    $row.find("a.aui-dropdown2-trigger").toggle(focused);
                }
            )
            .on("click", function(e) {
                    if ($(e.target).is("a")) {
                        // don't toggle the summary when clicking on proper links
                        return;
                    }

                    var $icon = $(this).find(".attachment-summary-toggle .icon");
                    $icon.toggleClass("icon-section-opened icon-section-closed");
                    $icon.closest('tr').next().toggleClass("hidden");

                    if ($icon.is('.icon-section-opened')) {
                        var $row = $icon.closest("tr");
                        var attachmentId = $row.data('attachment-id');

                        if ($row.next().find(".attachment-image-preview:empty").length) {
                            loadAttachmentPreview($row);
                        }

                        if (!attachmentsTableContainer.find("tr.history-" + attachmentId).length && $row.next().find(".attachment-history-wrapper").length) {
                            loadAttachmentHistory($row);
                        }
                    }
            });

            // TODO - remove? action-trigger doesn't exist in DOM, or elsewhere in this plugin.
            $(".attachments .action-trigger", attachmentsTableContainer).click(
                function() {
                    var $clickedAttachmentId = $(this).parents("tr:first")[0].id;

                    $(".attachments .attachment-row", attachmentsTableContainer).each(
                        function() {
                            var $attachmentRow = $(this);
                            var $attachmentId = $attachmentRow[0].id;

                            if ($attachmentId == $clickedAttachmentId)
                            {
                                $attachmentRow.addClass("focused");
                                $("span", $attachmentRow).removeClass("hide-icons");
                                $("a.aui-dropdown2-trigger", $attachmentRow).show();
                            }
                            else
                            {
                                if ($attachmentRow.hasClass("focused"))
                                {
                                    $attachmentRow.removeClass("focused");
                                    $("span", $attachmentRow).addClass("hide-icons");
                                    $("a.aui-dropdown2-trigger", $attachmentRow).hide();
                                }
                            }
                            $(".attachment-dropdown-actions .action-dropdown", $attachmentRow).dropDown("Standard",  { alignment : "right" });
                        }
                    );
                }
            );
        },

        markFileCommentFieldModified : function(theCommentField)
        {
            if (theCommentField.hasClass("blank-search")) {
                theCommentField.removeClass("blank-search");
                theCommentField.val("");
            }
        },

        initAttachmentCommentTextFields : function(uploadForm) {
            uploadForm.find("input[name^='comment_']").each(function() {
                $(this).focus(function() {
                    attachments.markFileCommentFieldModified($(this));
                });
            });
        },

        // HACK ALERT!! There's a on-body-load function injected by Confluence that focuses on the first text fields it finds in a page (CONF-14936).
        // Of course, we don't want that.
        // To work around it, the upload form will be named "inlinecommentform". Input fields of forms with that name dont't get autofocused.
        renameForms : function() {
            var oldPlaceFocusFunction = self["placeFocus"];
            if (oldPlaceFocusFunction) {
                self["placeFocus"] = function() {
                    var myPluginForms = $("div.plugin_attachments_upload_container form");
                    myPluginForms.attr("name", "inlinecommentform");
                    oldPlaceFocusFunction();
                    myPluginForms.removeAttr("name");
                };
            }
        },

        refreshOtherAttachmentsMacroInstances : function(contentId, successCallback, errorCallback) {
            $("div.plugin_attachments_table_container > fieldset").each(function() {
                var otherAttachmentInstanceFieldset = $(this);
                var otherAttachmentInstancePageId = $("input[name='pageId']", otherAttachmentInstanceFieldset).val();

                if (otherAttachmentInstancePageId != contentId)
                    return;

                var clonedOtherAttachmentInstanceFieldset = $(this).clone();
                $("input", clonedOtherAttachmentInstanceFieldset).each(function() {
                    if (!$(this).hasClass("plugin_attachments_macro_render_param"))
                        $(this).remove(); // So we don't end up sending extra params
                });
                var data = attachments.getFieldSetAsParams(clonedOtherAttachmentInstanceFieldset);
                data.old = data.old || 'true';  // show a Versions section unless "old" param set in Macro.

                $.ajax({
                    cache: false,
                    type : "GET",
                    url : confluenceContextPath + "/pages/plugins/attachments/rendermacro.action",
                    data: data,
                    success : function(data) {
                        var attachmentsTableContainer = otherAttachmentInstanceFieldset.parent();
                        var attachmentsTableHtml = $(data).find("div.plugin_attachments_table_container").html();

                        attachmentsTableContainer.fadeOut("normal", function() {
                            attachmentsTableContainer.html(attachmentsTableHtml);
                            attachments.initAttachmentTable(attachmentsTableContainer);
                        });


                        attachmentsTableContainer.fadeIn("normal", function() {
                            AJS.Labels.bindOpenDialog(AJS.$(".show-labels-editor", attachmentsTableContainer));
                        });

                        if (successCallback)
                            successCallback();
                    },
                    error : function() {
                        if (errorCallback)
                            errorCallback();
                    }
                });
            });
        },

        initAuiMessageBar : function(){
            if (!$("#aui-message-bar").length){
                $("#com-atlassian-confluence").append('<div id="aui-message-bar"></div>');
            }
        },

        initUploadForm : function(uploadForm) {
            this.initAttachmentCommentTextFields(uploadForm);
            this.initAuiMessageBar();

            var uploadIframe = uploadForm.children("iframe.plugin_attachments_uploadiframe");
            var submitButton = uploadForm.find("input[name='confirm']");
            //FF will keep the file upload value when we refresh the page. this is to remove it from FF
            uploadForm.find("input[name='file_0']").val("");

            var waitIcon = $('img.plugin_attachments_dropzone_uploadwaiticon');

            var formParams = attachments.getFieldSetAsParams(uploadForm.parents("div.plugin_attachments_upload_container").prev("div.plugin_attachments_table_container").children("fieldset"));

            $(".browse-files", uploadForm.parent()).on("click", function(){
                var chooseFileButton = uploadForm.find("input[name='file_0']");
                chooseFileButton.click();
                chooseFileButton.on("change", function(){
                    if(chooseFileButton.val() != ""){
                        uploadForm.submit();
                    }
                });
            });

            uploadForm.submit(function() {
                if (formParams["outputType"] == "preview")
                    return false;

                // Clear out comment hints in the fields that have not been modified.
                uploadForm.find("input[name^='comment_']").each(function() {
                    attachments.markFileCommentFieldModified($(this));
                });

                var uploadFormElement = this;
                uploadFormElement.target = uploadIframe.attr("name");

                submitButton.addClass("hidden");
                waitIcon.css("visibility", "visible");

                uploadIframe.get(0).processUpload = true;
                return true;
            });

            uploadIframe.load(function() {
                if (!this.processUpload) {
                    return;
                }

                var iframeDocument = this.contentWindow || this.contentDocument;
                iframeDocument = iframeDocument.document ? iframeDocument.document : iframeDocument;

                var iframeBodyElement = iframeDocument.body;
                var iframeBody = $(iframeBodyElement);
                var errorBoxInSomeHtml = iframeBody.find("div.aui-message.error");

                if (errorBoxInSomeHtml.length > 0 && $.trim(errorBoxInSomeHtml.html()).length > 0) {
                    AJS.messages.error("#aui-message-bar", {
                        body: errorBoxInSomeHtml.html()
                    });
                    setTimeout(function(){$(".aui-message.error").remove();}, 3000);
                    waitIcon.css("visibility", "hidden");
                    submitButton.removeClass("hidden");

                } else {
                    attachments.refreshOtherAttachmentsMacroInstances(
                        formParams["pageId"],
                        function() {

                            //uncomment the aui success message once the page refresh below is removed. :(
//                            AJS.messages.success("#aui-message-bar", {
//                                body: AJS.I18n.getText('attachments.uploadsuccessful')
//                                });
//                            setTimeout(function(){$(".aui-message.success").remove();}, 3000);
                            waitIcon.css("visibility", "hidden");
                            submitButton.removeClass("hidden");

                            //see CONFDEV-15690. This is a temporary solution to get around resources not being dynamically loaded and run. :(
                            location.reload();
                        },
                        function() {
                            AJS.messages.error("#aui-message-bar", {
                                body: formParams["i18n-notpermitted"]
                            });
                            setTimeout(function(){$(".aui-message.error").remove();}, 3000);
                            waitIcon.css("visibility", "hidden");
                            submitButton.removeClass("hidden");
                        }
                    );
                    uploadForm.find("input[name='file_0']").replaceWith($('<input type="file" name="file_0" size="30">'));
                    uploadForm.find("input[name^='comment_']").val("");
                }
            });
        },

        hideDropdownIcons : function() {
            $('.attachments .attachment-row').each(
                function() {
                    var $attachmentRow = $(this);
                    if ($attachmentRow.hasClass("focused"))
                    {
                        $attachmentRow.removeClass("focused");
                        $("span", $attachmentRow).addClass("hide-icons");
                    }
                });
        }
    };

    $("body").click(function(event) {
        var $target = $(event.target);
        if ($target.parents('td').length && !$target.parents('td').hasClass('attachment-dropdown-actions'))
        {
            attachments.hideDropdownIcons();
        }
    });

    $("div.plugin_attachments_table_container").each(function() {
        var $attachmentsTableContainer = $(this);
        attachments.initAttachmentTable($attachmentsTableContainer);
    });

    if ($.browser.msie || ie11UP) {
        var dropZoneText = $("li.drop-zone-text");
        dropZoneText.find("span").text(AJS.$.trim(dropZoneText.text()));
        $("form.plugin_attachments_uploadform").removeClass("hidden");
    }

    $("form.plugin_attachments_uploadform").each(function() {
        attachments.initUploadForm($(this));
    });

    $(".plugin_attachments_table_container").on('click', ".removeAttachmentLink", function(){
        if (AJS.Attachments.showRemoveAttachmentConfirmDialog) {
            AJS.Attachments.showRemoveAttachmentConfirmDialog(this);
            return false;
        }
    });

    attachments.renameForms();

    // For WebDriver tests - allows us to test the elements created by the File Upload callback without actually
    // uploading a file.
    AJS.bind('attachment-macro.refresh', function(ev, pageId) {
        attachments.refreshOtherAttachmentsMacroInstances(pageId);
    });

});
