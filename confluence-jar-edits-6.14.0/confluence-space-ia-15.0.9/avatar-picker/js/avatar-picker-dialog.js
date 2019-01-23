/* globals define, AJS, ServiceDesk */
define("confluence-space-ia/avatar-picker/avatar-picker-dialog", [
    "jquery",
    "underscore",
    "confluence-space-ia/avatar-picker/image-upload-and-crop",
    "confluence-space-ia/avatar-picker/text-util"
], function(
    $,
    _,
    ImageUploadAndCrop,
    TextUtil
    ) {

    function AvatarPickerDialog(opts) {
        if (!AvatarPickerDialog.isSupported()) {
            throw new Error("This browser doesn't support AvatarPickerDialog.");
        }
        return this.init(opts);
    }

    AvatarPickerDialog.isSupported = function() {
        return ImageUploadAndCrop.isSupported();
    };

    AvatarPickerDialog.prototype.defaults = {
        dialogTitle: AJS.I18n.getText("sidebar.avatar.picker.space.details"),
        dialogOptions: {
            width:445,
            height:507,
            id:"avatar-picker-dialog",
            closeOnOutsideClick: false
        },
        onCrop: $.noop,
        trigger: null,
        expandedClass: 'expanded'
    };

    AvatarPickerDialog.prototype.init = function(opts){
        _.bindAll(this, "initDialogContent", "_onImageUpload", "_onImageUploadError", "_toggleSaveButtonEnabled", "chooseAvatar",
            "_onUpdateSpaceDetails", "hide", "show", "cancel");
        this.options = $.extend(true, {}, this.defaults, opts);
        this.$dialog = new AJS.Dialog(this.options.dialogOptions);
        this.initDialogContent();
        this.imageUploadAndCrop = new ImageUploadAndCrop(this.$dialog.getCurrentPanel().body.find(".image-upload-and-crop-container"), {
            HiDPIMultiplier: 1, //The mask is already 2x the max size we need
            onCrop: this._onUpdateSpaceDetails,
            onImageUpload: this._onImageUpload,
            onImageUploadError: this._onImageUploadError,
            fallbackUploadOptions: {
                uploadURL: AJS.Meta.get('context-path') + "/rest/ia/1.0/space/uploadLogo",
                uploadFieldName: "upload-logo-input",
                responseHandler: function(iframeBody, uploadPromise){
                    var $iframeBody = $(iframeBody),
                        $jsonResponseField = $iframeBody.find("#json-response");

                    if ($jsonResponseField.length) {
                        var jsonResponse;

                        try {
                            jsonResponse = JSON.parse($jsonResponseField.html());
                        } catch(e) {
                            uploadPromise.reject();
                        }

                        if (jsonResponse && jsonResponse.src) {
                            uploadPromise.resolve(AJS.Meta.get('context-path') + jsonResponse.src);
                        } else {
                            uploadPromise.reject(jsonResponse && jsonResponse.errorMessages && jsonResponse.errorMessages[0]);
                        }
                    } else {
                        // See if we can parse a meaningful error out of the response.
                        // Firstly look for the main text on the 500 error page, then strip out nested exceptions which tend to make for unfriendly messages.
                        // If it can"t find the h2, it will just reject with a blank string
                        var error = $iframeBody.find(".error-image + h2").text();

                        error = error
                            .replace(/; nested exception.*$/, ".") //remove nested exceptions
                            .replace(/(\d+) bytes/, function(match, size){
                                return TextUtil.formatSizeInBytes(size);
                            }); //convert any values in bytes to the most appropriate unit

                        uploadPromise.reject(error);
                    }
                },
                cancelTrigger: this.$saveButton.add(this.$cancelButton)
            }
        });

        // pressing enter in space name should update the space details as well
        this.$spaceNameField.closest('form').on('submit', this.chooseAvatar);

        if (this.options.trigger) {
            this.$trigger = $(this.options.trigger);
            this.$trigger.click(_.bind(function(e){
                e.preventDefault();
                this.show();
            }, this));
        }
        return this;
    };

    AvatarPickerDialog.prototype.initDialogContent = function(){
        this.$dialog
            .addHeader(this.options.dialogTitle)
            .addPanel()
            .addSubmit(AJS.I18n.getText('sidebar.avatar.picker.save'), this.chooseAvatar)
            .addCancel(AJS.I18n.getText('sidebar.avatar.picker.cancel'), this.cancel)
            .getCurrentPanel().body.append(Confluence.Templates.AvatarPicker.imageUploadAndCrop({
                spaceName: AJS.Meta.get('space-name')
            }));


        this.$saveButton = this.$dialog.getCurrentPanel().page.buttonpanel.find(".button-panel-submit-button");
        this.$cancelButton = this.$dialog.getCurrentPanel().page.buttonpanel.find(".button-panel-cancel-link");
        this.$spaceNameField = this.$dialog.getCurrentPanel().page.body.find("#avatar-picker-space-name");
        this.$message = this.$dialog.getCurrentPanel().page.body.find('.image-upload-and-crop-message');
        this.$useDefault = this.$dialog.getCurrentPanel().page.body.find('.image-upload-and-crop-default-image');

        this.$useDefault.click(_.bind(function() {
            $.ajax({
                type:'GET',
                dataType:"json",
                contentType:"application/json",
                url: AJS.Meta.get('context-path') + '/rest/ia/1.0/space/defaultLogo',
                success: _.bind(function(data) {
                    this.imageUploadAndCrop.setImageSrc(AJS.Meta.get('context-path') + data.logoDownloadPath);
                }, this)
            });
        }, this));
    };

    AvatarPickerDialog.prototype._onUpdateSpaceDetails = function(croppedDataURI) {
        this.options.onCrop(croppedDataURI, this.$spaceNameField.val());
    };

    AvatarPickerDialog.prototype._onImageUpload = function() {
        this._toggleExpanded(true);
        this._toggleSaveButtonEnabled(true);
    };

    AvatarPickerDialog.prototype._onImageUploadError = function() {
        this._toggleExpanded(false);
        this._toggleSaveButtonEnabled(false);
    };

    AvatarPickerDialog.prototype._toggleSaveButtonEnabled = function(opt_enable) {
        if (opt_enable === null) {
            opt_enable = this.$saveButton.attr("disabled") !== null;
        }

        if (opt_enable) {
            this.$saveButton.removeAttr("disabled");
        } else {
            this.$saveButton.attr("disabled", "disabled");
        }
    };

    // Current version of the AUI Dialog does not render the submit button as a primary one
    AvatarPickerDialog.prototype._turnSaveButtonIntoPrimary = function() {
        this.$saveButton.removeClass('button-panel-button').addClass('aui-button aui-button-primary');
    };

    AvatarPickerDialog.prototype._removeSaveImageLoadingIcon = function() {
        $("#avatar-picker-dialog .aui-icon-wait").remove();
    };

    AvatarPickerDialog.prototype.chooseAvatar = function() {
        this._toggleSaveButtonEnabled(false);
        this.$saveButton.before("<span class='aui-icon aui-icon-wait'/>");
        this.imageUploadAndCrop.crop();
    };

    AvatarPickerDialog.prototype.hide = function(){
        this.hideMessage();
        this.$dialog.hide();
        this.imageUploadAndCrop.resetState(); //Only resets errors and the file upload element, imageExplorer image is persisted.
    };

    AvatarPickerDialog.prototype.cancel = function() {
        this.imageUploadAndCrop.restoreState();
        this.hide();
    };

    AvatarPickerDialog.prototype.show = function(spaceName){
        if (spaceName) {
            this.$spaceNameField.val(spaceName);
        }
        // save last position in case user moves/zooms image and then clicks cancel
        this.imageUploadAndCrop.saveState();
        this.$dialog.show();
        this._turnSaveButtonIntoPrimary();
        this._removeSaveImageLoadingIcon();
    };

    AvatarPickerDialog.prototype.setMessage = function(message) {
        this.$message.html(aui.message.error({
            content: message,
            closeable: false
        })).show();
    };

    AvatarPickerDialog.prototype.hideMessage = function() {
        this.$message.hide();
    };

    AvatarPickerDialog.prototype._toggleExpanded = function(toggle) {
        AJS.$('#avatar-picker-dialog').toggleClass(this.options.expandedClass, toggle);
    };

    return AvatarPickerDialog;
});