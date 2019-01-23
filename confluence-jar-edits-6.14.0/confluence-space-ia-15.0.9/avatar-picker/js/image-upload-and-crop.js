define("confluence-space-ia/avatar-picker/image-upload-and-crop", [
    "jquery",
    "underscore",
    "confluence-space-ia/avatar-picker/image-explorer",
    "confluence-space-ia/avatar-picker/client-file-reader",
    "confluence-space-ia/avatar-picker/drag-drop-file-target",
    "confluence-space-ia/avatar-picker/client-file-iframe-uploader",
    "confluence-space-ia/avatar-picker/upload-interceptor",
    "confluence-space-ia/avatar-picker/canvas-cropper",
    "confluence-space-ia/avatar-picker/text-util"
], function(
    $,
    _,
    ImageExplorer,
    ClientFileReader,
    DragDropFileTarget,
    ClientFileIframeUploader,
    UploadInterceptor,
    CanvasCropper,
    TextUtil
    ) {

    function ImageUploadAndCrop($container, opts){
        if (!ImageUploadAndCrop.isSupported()) {
            throw new Error("This browser doesn't support ImageUploadAndCrop.");
        }
        this.init.apply(this, arguments);
    }

    ImageUploadAndCrop.isSupported = function() {
        return CanvasCropper.isSupported();
    };

    ImageUploadAndCrop.prototype.defaults = {
        HiDPIMultiplier: 2,  //The canvas crop size is multiplied by this to support HiDPI screens
        dragDropUploadPrompt: AJS.I18n.getText('sidebar.avatar.picker.drag.image'),
        onImageUpload: $.noop,
        onImageUploadError: $.noop,
        onCrop: $.noop,
        outputFormat: 'image/png',
        fallbackUploadOptions: {},
        initialScaleMode: ImageExplorer.scaleModes.containAndFill,
        scaleMax: 1,
        fileSizeLimit: 5 * 1024 * 1024, //5MB
        maxImageDimension: 2000 //In pixels
    };

    ImageUploadAndCrop.prototype.init = function($container, opts){
        this.options = $.extend({}, this.defaults, opts);
        this.$container = $container;
        this.$imageContainer = $container.find('.image-explorer-image-view');

        _.bindAll(this, "crop", "resetState", "_onFileProcessed", "setImageSrc", "validateImageResolution", "_onFilesError",
            "_onFileError", "_resetFileUploadField", "_onErrorReset");

        this.imageExplorer = new ImageExplorer(this.$container.find('.image-explorer-container'), {
            initialScaleMode: this.options.initialScaleMode,
            scaleMax: this.options.scaleMax,
            onErrorReset: this._onErrorReset
        });

        if (ClientFileReader.isSupported()) {
            this.clientFileReader = new ClientFileReader({
                onRead: this._onFileProcessed,
                onError: this._onFilesError,
                fileTypeFilter: ClientFileReader.typeFilters.imageWeb,
                fileCountLimit: 1,
                fileSizeLimit: this.options.fileSizeLimit
            });

            //drag drop uploading is only possible in browsers that support the fileReaderAPI
            this.dragDropFileTarget = new DragDropFileTarget(this.imageExplorer.get$ImageView(), {
                uploadPrompt: this.options.dragDropUploadPrompt,
                clientFileHandler: this.clientFileReader
            });
        } else {
            //Fallback for older browsers. TODO: Client side filetype filtering?

            this.$container.addClass("filereader-unsupported");

            var fallbackOptions = $.extend({
                onUpload: this._onFileProcessed,
                onError: this._onFileError
            }, this.options.fallbackUploadOptions);

            this.clientFileReader = new ClientFileIframeUploader(fallbackOptions);
        }

        this.uploadIntercepter = new UploadInterceptor(this.$container.find('.image-upload-field'), {
            replacementEl: this.$container.find('.image-upload-field-replacement'),
            clientFileHandler: this.clientFileReader
        });

        var mask = this.imageExplorer.get$Mask();

        this.canvasCroppper = new CanvasCropper(
            mask.width() * this.options.HiDPIMultiplier,
            mask.height() * this.options.HiDPIMultiplier,
            {
                outputFormat: this.options.outputFormat
            }
        );

        this.options.cropButton && $(this.options.cropButton).click(this.crop);
    };

    ImageUploadAndCrop.prototype.crop = function(){
        var croppedDataURI = "";
        if (!this.imageExplorer.$container.hasClass('empty')) {
            var cropProperties = this.imageExplorer.getMaskedImageProperties();
            croppedDataURI = this.canvasCroppper.cropToDataURI(
                    this.imageExplorer.get$SourceImage()[0],
                    cropProperties.maskedAreaImageX,
                    cropProperties.maskedAreaImageY,
                    cropProperties.maskedAreaWidth,
                    cropProperties.maskedAreaHeight
                );
        }

        _.isFunction(this.options.onCrop) && this.options.onCrop(croppedDataURI);
    };

    ImageUploadAndCrop.prototype.resetState = function(){
        this.imageExplorer.clearError();
        this._resetFileUploadField();
    };

    ImageUploadAndCrop.prototype.saveState = function() {
        if (this.imageExplorer.$container.hasClass('empty')) {
            return;
        }
        var $sourceImage = this.imageExplorer.get$SourceImage();
        if ($sourceImage.length) {
            this.imageState = {
                top: $sourceImage.css('top'),
                left: $sourceImage.css('left'),
                marginTop: $sourceImage.css('margin-top'),
                marginLeft: $sourceImage.css('margin-left'),
                zoom: $('.image-explorer-scale-slider').val()
            }
        }
    };

    ImageUploadAndCrop.prototype.restoreState = function() {
        if (this.imageExplorer.$container.hasClass('empty') || !this.imageState) {
            return;
        }
        var $sourceImage = this.imageExplorer.get$SourceImage();
        if ($sourceImage.length) {
            this.imageExplorer.$scaleSlider.val(this.imageState.zoom).trigger('change');
            $sourceImage.css({
                top: this.imageState.top,
                left: this.imageState.left,
                "margin-top": this.imageState.marginTop,
                "margin-left": this.imageState.marginLeft
            });
        }
    };

    ImageUploadAndCrop.prototype._renderSpinner = function() {
        this.$imageContainer.removeAttr('data-upload-prompt');
        this.$imageContainer.append("<div class='throbber'></div>");
        this.throbber = AJS.$('.image-explorer-image-view .throbber');
        AJS.$('.throbber').spin('large');
    };

    ImageUploadAndCrop.prototype._hideSpinner = function() {
        AJS.$('.throbber').spinStop();
        this.throbber.addClass("hidden");
    };

    ImageUploadAndCrop.prototype._onFileProcessed = function(imageSrc) {
        // As we are selecting a new image, remove any previous image upload error message
        $("#avatar-picker-dialog .image-upload-and-crop-message").hide();
        this._renderSpinner();

        if (imageSrc){
            var validateImagePromise = this.validateImage(imageSrc);
            var self = this;
            validateImagePromise
                    .done(function() {
                        if (!isNaN(self.options.maxImageDimension)) {
                            var validateResolutionPromise = self.validateImageResolution(imageSrc);
                            validateResolutionPromise
                                    .done(function(imageWidth, imageHeight){
                                        self.setImageSrc(imageSrc);
                                        AJS.$("#avatar-picker-dialog .aui-button-primary").removeAttr("disable");
                                    })
                                    .fail(function(imageWidth, imageHeight){
                                        self._onFileError(AJS.I18n.getText('sidebar.avatar.picker.error.resolution', imageWidth, imageHeight, self.options.maxImageDimension));
                                    })
                                    .always(function() {
                                        self._hideSpinner();
                                    });
                        } else {
                            // If imageResolutionMax isn't valid, skip the validation and just set the image src.
                            self.setImageSrc(imageSrc);
                        }
                    })
                    .fail(function() {
                        self._onFileError(AJS.I18n.getText('sidebar.avatar.picker.error.file.desc'));
                        self._hideSpinner();
                    })
        } else {
            this._onFileError();
        }
    };

    ImageUploadAndCrop.prototype.validateImage = function(imageSrc) {
        var validatePromise = $.Deferred(),
                tmpImage = new Image();

        tmpImage.onerror = function() {
            validatePromise.reject();
        };

        tmpImage.onload = function() {
            validatePromise.resolve();
        };

        tmpImage.src = imageSrc;

        return validatePromise;
    };

    ImageUploadAndCrop.prototype.setImageSrc = function(imageSrc) {
        this.imageExplorer.setImageSrc(imageSrc);
        _.isFunction(this.options.onImageUpload) && this.options.onImageUpload(imageSrc);
        this._resetFileUploadField();
    };

    ImageUploadAndCrop.prototype.validateImageResolution = function(imageSrc){
        var validatePromise = $.Deferred(),
            tmpImage = new Image(),
            self = this;

        tmpImage.onload = function(){
            if (this.naturalWidth > self.options.maxImageDimension ||  this.naturalHeight > self.options.maxImageDimension) {
                validatePromise.reject(this.naturalWidth, this.naturalHeight);
            } else {
                validatePromise.resolve(this.naturalWidth, this.naturalHeight);
            }
        };

        tmpImage.src = imageSrc;

        return validatePromise;
    };

    ImageUploadAndCrop.prototype._onFilesError = function(invalidFiles) {
        // Work out the most appropriate error to display. Because drag and drop uploading can accept multiple files and we can't restrict this,
        // it's not an all or nothing situation, we need to try and find the most correct file and base the error on that.
        // If there was at least 1 valid file, then this wouldn't be called, so we don't need to worry about files rejected because of the fileCountLimit

        if (invalidFiles && invalidFiles.bySize && invalidFiles.bySize.length){
            //Some image files of the correct type were filtered because they were too big. Pick the first one to use as an example.
            var file = _.first(invalidFiles.bySize);
            this._onFileError(AJS.I18n.getText('sidebar.avatar.picker.error.too.big', TextUtil.abbreviateText(file.name, 50),
                    TextUtil.formatSizeInBytes(file.size), TextUtil.formatSizeInBytes(this.options.fileSizeLimit)));
        } else {
            //No files of the correct type were uploaded. The default error message will cover this.
            this._onFileError();
        }
    };

    ImageUploadAndCrop.prototype._onFileError = function(error){
        var title = AJS.I18n.getText('sidebar.avatar.picker.error.file.title'),
            contents = error || AJS.I18n.getText('sidebar.avatar.picker.error.file.desc');

        this.imageExplorer.showError(title, contents);
        // Hides any previous upload image error message (showed in the image container)
        this._resetFileUploadField();
        // Hides any previous save image error message (displayed at the top of the dialog)
        $("#avatar-picker-dialog .image-upload-and-crop-message").hide();
        _.isFunction(this.options.onImageUploadError) && this.options.onImageUploadError(error);
    };

    ImageUploadAndCrop.prototype._resetFileUploadField = function(){
        //clear out the fileUpload field so the user could select the same file again to "reset" the imageExplorer
        var form = this.$container.find("#image-upload-and-crop-upload-field").prop('form');
        form && form.reset();
    };

    ImageUploadAndCrop.prototype._onErrorReset = function(imgSrc){
        //If we have a valid image after resetting from the error, notify the calling code.
        if (imgSrc) {
            _.isFunction(this.options.onImageUpload) && this.options.onImageUpload(imgSrc);
        }
    };

    return ImageUploadAndCrop;
});