/**
 * @module confluence-editor/tinymce3/plugins/propertypanel/js/property-panel-images
 */
define('confluence-editor/tinymce3/plugins/propertypanel/js/property-panel-images', [
    'jquery',
    'ajs',
    'tinymce',
    'confluence-editor/utils/tinymce-image-utils',
    'confluence/meta',
    'confluence/legacy',
    'confluence/api/browser',
    'confluence/property-panel'
], function(
    $,
    AJS,
    tinymce,
    TinyMCEImageUtils,
    Meta,
    Confluence,
    Browser,
    PropertyPanel
) {
    "use strict";

    var ImageUtils = TinyMCEImageUtils.ImageUtils;

    var isScaledByWidth = ImageUtils.isScaledByWidth();
    /**
     * Pixel sizes for image resize buttons.
     */
    var sizes;

    if (isScaledByWidth) {
        sizes = {
            small: 100,
            medium: 300,
            large: 500
        };
    } else {
        sizes = {
            small: 150,
            medium: 250,
            large: 400
        };
    }

    /**
     * Image resizing button classes.
     */
    var buttons = {
        small: ".image-size-small",
        medium: ".image-size-medium",
        large: ".image-size-large",
        original: ".image-size-original"
    };

    var lowerImageSizeBound = 16;  // The lower bound for an image size in pixels.
    var upperImageSizeBound = 90000; // The upper bound for an image size in pixels.

    /**
     * Unselects all sizing buttons on the property panel.
     */
    function clearImageSizeButtons() {
        var arr = [];
        $.each(buttons, function(i, val) {
            arr.push(val);
        });
        PropertyPanel.current.panel.find(arr.join(", ")).removeClass("active");
    }

    /**
     * Returns the displayed image size. Example - '200px'.
     */
    function getImageSizeText() {
        return ($("#image-size-input").val());
    }

    /**
     * Resizes an image's width/height to the specified size. The image proportions will be constrained.
     * when widthpx is set => resizeImage by width
     * when height is set => resizeImage by Height
     * @param imageProps The image properties
     * @param widthpx The resize in pixels to resize the width to
     * @param heightpx The resize in pixels to resize the height to
     * @return true if the image was resized, false otherwise
     */
    function resizeImage(imageProps, widthpx, heightpx) {
        var requiredWidth = validateSize(imageProps, widthpx);
        var requiredHeight = validateSize(imageProps, heightpx);

        var sizepx = requiredWidth || requiredHeight;

        if (sizepx) {
            var $image = PropertyPanel.getAnchor();
            var width = $image.width();
            var height = $image.height();
            var maxThumbWidth = Meta.get("max-thumb-width");
            var maxThumbHeight = Meta.get("max-thumb-height");
            var isNotRemoteImage = !ImageUtils.isRemoteImg(imageProps.destination);

            if (isNotRemoteImage) {
                imageProps.thumbnail = ImageUtils.isThumbnailUsable(requiredWidth, requiredHeight, width, height, maxThumbWidth, maxThumbHeight);

            } else {
                imageProps.thumbnail = false;
            }

            imageProps.originalSelected = false;

            if (widthpx) {
                delete imageProps["height"];
                imageProps["width"] = sizepx;
            } else {
                delete imageProps["width"];
                imageProps["height"] = sizepx;
            }
            updateImageElement(imageProps);
            clearImageSizeButtons();
            return true;
        }

        return false;
    }

    /**
     * Given a size name, resizes the image width/height correspondingly. The proportions will be constrained.
     * @param imageProps The image properties
     * @param size The size - can be small, medium or large
     * @return true if the image was resized, false otherwise
     */
    function resizeImageToPresetSize(imageProps, size) {
        var result;
        if (isScaledByWidth) {
            result = resizeImage(imageProps, sizes[size]);
        }
        else {
            result = resizeImage(imageProps, null, sizes[size]);
        }

        if (result) {
            selectButton(size);
            updateImageElement(imageProps);
            return true;
        }
        return false;
    }

    /**
     * Resizes an image to its original width and height.
     * @param imageProps
     * @return true if the image was resized
     */
    function resizeImageToOriginalWidth(imageProps) {
        delete imageProps.width;
        delete imageProps.height;
        imageProps.thumbnail = false;
        imageProps.originalSelected = true;
        clearImageSizeButtons();
        selectButton("original");
        updateImageElementForOriginal(imageProps);
        return true;
    }

    var rebindAndSnap = function (ppanel) {
        ppanel.current.updating = false;
        ppanel.current.snapToElement({
            animate: true,
            animateDuration: 100
        });
    };

    function updateImageElementForOriginal(imageProps) {
        var ppanel = PropertyPanel;
        var $img = ppanel.getAnchor();

        // Turn off scroll binding, in case an img resize causes a scroll event, and rebind after the resize.
        ppanel.current.updating = true;

        $img.one('load', function () {
            rebindAndSnap(ppanel);
            updateImageSizeText(imageProps);
            imageProps["width"] = Math.floor($img.width());
            imageProps["height"] = Math.floor($img.height());
        });

        // This updates the image src attribute, which triggers the load event.
        // Note: the src can point to the original image or the image's thumbnail.
        ImageUtils.updateImageElement($img, imageProps);
        if (tinymce.isGecko) {
            // Repaint to clear the image handles from their old positions.
            AJS.Rte.getEditor().execCommand('mceRepaint', false);
        }

        $img.each(function () {
            // Cache fix for browsers that don't trigger .load()
            if (this.complete) {
                $(this).trigger('load');
            }
        });
    }

    /**
     * Given a size, selects the corresponding button.
     * @param size Can be small, medium, large or original.
     */
    function selectButton(size) {
        var selectedButton = PropertyPanel.current.panel.find(buttons[size]);
        selectedButton.addClass("active");
    }

    /**
     * Toggles the image's border.
     * @param imageProps The image properties
     */
    function toggleBorder(imageProps) {
        $(".image-border-toggle").toggleClass("active", !imageProps.border);
        imageProps.border = +!imageProps.border || false;
        updateImageElement(imageProps);
    }

    /**
     * Update the image element to match the ImageProperties passed in, relocate the property panel to match the
     * resized image, and cleanup any image-selection handles.
     */
    function updateImageElement(imageProps) {
        var ppanel = PropertyPanel;
        var $img = ppanel.getAnchor();
        var oldSrc = $img.attr("src");
        var oldHeight = $img.height();

        // Turn off scroll binding, in case an img resize causes a scroll event, and rebind after the resize.
        ppanel.current.updating = true;

        ImageUtils.updateImageElement($img, imageProps);
        if (tinymce.isGecko) {
            // Repaint to clear the image handles from their old positions.
            AJS.Rte.getEditor().execCommand('mceRepaint', false);
        }

        if (imageProps.src != oldSrc) {
            // Image source changed - may have to wait for height to change to snapToElement
            var snapInterval = setInterval(function() {
                var newHeight = $img.height();
                if (newHeight != oldHeight) {
                    AJS.debug("updateImageElement : height changed after image src change - " + oldHeight + " to " + newHeight);
                    clearTimeout(snapInterval);
                    snapInterval = null;
                    rebindAndSnap(ppanel);
                }
            }, 10);
            setTimeout(function() {
                if (snapInterval) {
                    clearTimeout(snapInterval);
                    snapInterval = null;
                    rebindAndSnap(ppanel);
                }
            }, 1000);
        } else {
            rebindAndSnap(ppanel);
        }

        updateImageSizeText(imageProps);
    }

    /**
     * Updates the image-size field with the current image width. If this is not available in
     * the imageProps, the image element's width is used.
     * @param imageProps The image properties.
     */
    function updateImageSizeText(imageProps) {
        var width = (imageProps.width) ? imageProps.width : PropertyPanel.getAnchor().width();
        width = Math.floor(width);
        $("#image-size-input").val(width + 'px');
    }

    /**
     * Validates a provided image size. The image size must be numeric. If it is greater than the upper
     * bound for image size, the upper bound is returned. If it is less than the lower bound for image
     * size, the lower bound is returned.
     * @param imageProps The image properties
     * @param sizepx The size in pixels to validate
     * return The validated image size, or null if the provided size could not be parsed.
     */
    function validateSize(imageProps, sizepx) {
        sizepx = parseInt(sizepx);
        if (!isNaN(sizepx)) {
            // Restrict the size to the upper and lower bounds.
            if (sizepx < lowerImageSizeBound) {
                sizepx = lowerImageSizeBound;
            } else if (sizepx > upperImageSizeBound) {
                sizepx = upperImageSizeBound;
            }
            return sizepx;
        } else {
            return null;
        }
    }

    function makeController(imageProps) {
        return {
            setPresetSize: function (size) {
                resizeImageToPresetSize(imageProps, size);
            },

            setPixelSize: function (size) {
                resizeImage(imageProps, size);
            },

            setToOriginalSize: function () {
                resizeImageToOriginalWidth(imageProps);
            },

            toggleBorder: function () {
                toggleBorder(imageProps);
            },

            getWidth: function () {
                return imageProps["width"];
            },

            getHeight: function () {
                return imageProps["height"];
            },

            getDisplayWidth: function () {
                return getImageSizeText();
            },

            isButtonSelected: function(button) {
                return PropertyPanel.current.panel.find(buttons[button]).hasClass("active");
            }
        };
    }

    return {
        _resizeImage: resizeImage,
        pluginButtons: [],

        name : "image",

        getPresetImageSize: function(size) {
            return sizes[size];
        },

        canHandleElement : function ($element) {
            return ($element.is("img")
            && !$element.hasClass("editor-inline-macro")
            && !$element.hasClass("template-variable"));
        },

        handle : function (data) {
            // This function may be called directly or via an event handler. If it is called
            // directly, the image node can be passed in.
            var img;
            if (data.nodeName === "IMG") {
                img = data;
            } else {
                img = data.containerEl;
            }

            var $img = $(img);
            var imageProps = tinymce.confluence.ImageProperties(img);
            if (!imageProps) {
                return; // not a "proper" image, e.g. an emoticon, some non-image placeholder
            }

            var isUnknownAttachment = $img.attr('data-resource-id'); // only unknown attachment has "data-resource-id" attribute

            if (isUnknownAttachment) {
                return;
            }

            var ed = AJS.Rte.getEditor();
            var getLang = function(key) { return ed.getLang(key); };

            var imageSizeButton = function (size) {
                return {
                    className: ["image-size-" + size, "editor-resize", "resize-" + size].join(" "),
                    text: getLang("propertypanel.images_" + size),
                    tooltip: getLang("propertypanel.images_" + size + "_tooltip"),
                    iconClass: "aui-icon aui-icon-small aui-iconfont-image-resize",
                    click : function (a) {
                        resizeImageToPresetSize(imageProps, size);
                        AJS.trigger('analyticsEvent', {name: 'confluence.editor.image.resize.' + size});
                    },
                    selected: isScaledByWidth ? imageProps["width"] == sizes[size] : imageProps["height"] == sizes[size]
                };
            };
            var buttons = [
                {
                    className: "editable",
                    tooltip: getLang("propertypanel.images_sizing_tooltip"),
                    html: "<input id=\"image-size-input\"/>"
                },
                null,
                imageSizeButton("small"),
                imageSizeButton("medium"),
                imageSizeButton("large"),
                {
                    className: "image-size-original",
                    text: getLang("propertypanel.images_original"),
                    tooltip: getLang("propertypanel.images_original_tooltip"),
                    click: function (a) {
                        resizeImageToOriginalWidth(imageProps);
                        AJS.trigger('analyticsEvent', {name: 'confluence.editor.image.resize.original'});
                    },
                    selected: imageProps.originalSelected
                },
                null,   // separator
                {
                    className: "image-border-toggle",
                    text: getLang("propertypanel.images_border"),
                    tooltip: getLang("propertypanel.images_border_tooltip"),
                    click: function (a) {
                        toggleBorder(imageProps);
                    },
                    selected: (imageProps.border || imageProps.border == 1)
                }
            ];

            buttons.push(null);     // spacer

            var parent = $img.parent();
            if (parent.is("a[href]")) {
                // An already-linked image. Show buttons for Editing and Removing the link.
                buttons.push({
                    className: "image-link-edit",
                    text: getLang("propertypanel.images_link_edit"),
                    tooltip: getLang("propertypanel.images_link_edit_tooltip"),
                    click: function () {
                        PropertyPanel.destroy();
                        ed.selection.select(parent[0]);
                        Confluence.Editor.LinkBrowser.open();
                    }
                });
                buttons.push({
                    className: "image-link-remove",
                    text: getLang("propertypanel.images_link_remove"),
                    tooltip: getLang("propertypanel.images_link_remove_tooltip"),
                    click: function () {
                        PropertyPanel.destroy();
                        ed.execCommand("mceConfUnlink", false, img);
                        ed.focus();
                    }
                });
            } else {
                // Not a linked image - show 'Link' creation button
                buttons.push({
                    className: "image-make-link",
                    text: getLang("propertypanel.images_link_create"),
                    tooltip: getLang("propertypanel.images_link_create_tooltip"),
                    iconClass: "aui-icon aui-icon-small aui-iconfont-link",
                    click: function () {
                        PropertyPanel.destroy();
                        ed.selection.select(img);
                        Confluence.Editor.LinkBrowser.open();
                    }
                });
            }

            var pluginButtons = PropertyPanel.Image.pluginButtons;
            for (var i = 0; i < pluginButtons.length; i++){
                if (pluginButtons[i] === null){
                    buttons.push(null);
                }
                else{
                    var nextButton = pluginButtons[i].create($img);
                    if (nextButton){
                        buttons.push(nextButton);
                    }
                }
            }

            PropertyPanel.createFromButtonModel(this.name, img, buttons, { anchorIframe: AJS.Rte.getEditorFrame() });

            var imageSizeInput = $("#image-size-input");

            imageSizeInput.bind("focus", function() {
                $(this).select();
            });

            function onLoseFocusOrEnterKey() {
                resizeImage(imageProps, getImageSizeText()) ? true : updateImageSizeText(imageProps);
                AJS.trigger('analyticsEvent', {name: 'confluence.editor.image.resize.custom'});
            }

            imageSizeInput.bind('change', function() {
                onLoseFocusOrEnterKey();
            });

            var browser = new Browser(window.navigator.userAgent);
            if (browser.isIE()) {
                imageSizeInput.bind('keyup', function (event) {
                    if (event.keyCode === 13) {
                        onLoseFocusOrEnterKey();
                    }
                });
            }

            // Store the state of the image so it can be updated later
            PropertyPanel.current.imageProps = imageProps;
            updateImageSizeText(imageProps);

            return makeController(imageProps);
        }
    };
});

require('confluence/module-exporter')
        .exportModuleAsGlobal('confluence-editor/tinymce3/plugins/propertypanel/js/property-panel-images', 'AJS.Confluence.PropertyPanel.Image', function(PropertyPanelImages) {
            var AJS = require('ajs');
            AJS.bind("init.rte", function() {
                // defer trigger to ensure any listeners have had a chance to load.
                AJS.trigger("add-handler.property-panel", PropertyPanelImages);
            });
        });