/**
 * @module confluence-editor/utils/tinymce-image-utils
 */
define('confluence-editor/utils/tinymce-image-utils', [
    'jquery',
    'confluence/api/logger',
    'confluence/meta',
    'ajs',
    'tinymce',
    'confluence/api/constants'
], function(
    $,
    logger,
    Meta,
    AJS,
    tinymce,
    CONSTANTS
) {
    "use strict";

    /**
     *  Keys of properties that should be stored as attributes of the image element.
     */
    var imageElementAttributeKeys =  ["imagetext", "src", "align", "border", "width", "height"];

    /**
     * Regex matches if an image is attached to Confluence content
     */
    var contentImageRegex = /\/download\/(thumbnails|attachments)\/([0-9]+)\//;

    /**
     * The pageId for the content owning the image attachment is not
     * stored against the image element directly, so we extract it from the
     * image element's src attribute.
     *
     * e.g. /confluence/download/attachments/2129935/ca5.gif extracts "2129935"
     *      /confluence/download/thumbnails/2129935/ca5.gif ALSO extracts "2129935"
     */
    var getPageIdFromImageElement = function (imgEl) {
        var src = $(imgEl).attr("src");
        var matches = src.match(contentImageRegex);
        if (matches && matches.length === 3) {
            return matches[2];
        }
        logger.log("ERROR: could not parse page id from image url " + src);
        return "0";
    };

    /**
     * Creates the string to store in the src attribute of the img element.
     *
     * e.g. /confluence/download/attachments/884738/hedgehog.jpg
     */
    var getSrc = function (imgProps) {
        var destination = imgProps.destination;
        if (ImageUtils.isRemoteImg(destination)) {
            return destination;
        }
        var thumbnailDir = '/thumbnails/';
        var attachmentsDir = '/attachments/';
        return (imgProps.thumbnail) ? destination.replace(attachmentsDir, thumbnailDir) :
                destination.replace(thumbnailDir, attachmentsDir);
    };

    /**
     * Returns true iff this is a Confluence image tag with a wiki-markup "imagetext" attribute.
     */
    var isEmbeddedImage = function(imgEl) {
        return imgEl && $.nodeName(imgEl, 'img') && $(imgEl).hasClass("confluence-embedded-image");
    };

    /**
     * Resize embedded image to default size if it is bigger that default size
     * @param image
     * @param width image's width
     * @param height image's height
     * @param isScaledByWidth
     * @param defaultSize
     */
    var resizeImage = function (image, width, height, isScaledByWidth, defaultSize) {
        if (isScaledByWidth) {
            if (width >= defaultSize) {
                image.width = defaultSize;
            } else {
                image.width = width;
            }
            image.style.maxWidth = ""; //this is necessary so that user can resize image to bigger size using property panel
        } else {
            if (height >= defaultSize) {
                image.height = defaultSize;
            } else {
                image.height = height;
            }
            image.style.maxHeight = ""; //this is necessary so that user can resize image to bigger size using property panel
        }
    };

    var newImageCounter = 0;

    var ImageUtils;

    /**
     * ImageProperties class represents all of the attributes of an image in the
     * RTE:
     *      imageFileName
     *      thumbnail
     *      border
     *      width
     *      height
     *      url (optional) the full url of the image for an external image
     *      pageId (optional if url exists) the id of the page owning the image attachment
     *      destination (optional) the full "wiki" path to the image, eg "TST:Foo^bar.jpg"
     *
     *  It can return calculated values, such as:
     *      src
     *      imagetext
     */
    var ImageProperties = function (props) {
        if (isEmbeddedImage(props)) {
            // props is an img element
            var imgEl = $(props);

            props = {
                destination: imgEl.attr("src"),
                url: imgEl.attr("src"),
                border: (imgEl.attr("class") && imgEl.attr("class").indexOf("confluence-content-image-border") !== -1) ? 1 : 0,
                width: imgEl.prop("width"),
                height: imgEl.prop("height"),
                originalSelected: !imgEl.attr("width") && !imgEl.attr("height")
            };

            if (!ImageUtils.isRemoteImg(props.destination)  && (!$(imgEl).hasClass("confluence-external-resource"))) {
                props.pageId = getPageIdFromImageElement(imgEl);
            }

            return $.extend({}, props);

        } else if (props.destination) {
            // props is a map of ImageProperties values
            props.imageFileName = props.imageFileName || props.destination;

            return $.extend({}, props);
        }
        // not an image element and not a valid properties object - return nothing
        return null;
    };

    ImageUtils = {
        isScaledByWidth: function () {
            return false;
        },

        /**
         * Loads the image properties into the passed img element.
         * @param img an HtmlImageElement or a jQuery wrapping one.
         * @param imgProps the image properties to update the element with.
         */
        updateImageElement: function (img, imgProps) {

            var $img = $(img);

            imgProps.src = getSrc(imgProps);

            // Renderer & TinyMCE both add style tags to show borders - these both need updating, if present, or they'll
            // override any border attribute set.
            $img.toggleClass("confluence-content-image-border", !!imgProps.border);
            $img.toggleClass("confluence-thumbnail", !!imgProps.thumbnail);

            for (var i = 0, ii = imageElementAttributeKeys.length; i < ii; i++) {
                var key = imageElementAttributeKeys[i];
                var val = imgProps[key];
                if (val !== false && val != null) {
                    $img.attr(key, val);
                } else {
                    $img.removeAttr(key);
                }
            }
            tinymce.activeEditor.undoManager.add();
        },

        /**
         * Insert an external image or an image placeholder with the specified properties.
         * @param properties {Object} Required fields: filename, contentId, url (if external).
         *                            Optional: thumbnail, alignment, border
         * @param hidePropertiesPanel {boolean} hide the properties panel
         */
        insertFromProperties: function (properties, hidePropertiesPanel) {
            $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: CONSTANTS.CONTEXT_PATH + "/rest/tinymce/1/embed/placeholder/image",
                data: $.toJSON(properties),
                dataType: "text",
                success: function (data) {
                    ImageUtils.insertImagePlaceholder(data, hidePropertiesPanel);
                }
            });
        },
        /**
         * Insert an image element to the editor
         * @param imagePlaceholderHtml {HTML} image element
         * @param hidePropertiesPanel {boolean} hide the properties panel
         */
        insertImagePlaceholder: function (imagePlaceholderHtml, hidePropertiesPanel) {
            var defaultSize;
            var isScaledByWidth = ImageUtils.isScaledByWidth();
            var $image = $(imagePlaceholderHtml);

            if (isScaledByWidth) {
                defaultSize = AJS.Confluence.PropertyPanel.Image.getPresetImageSize("large");
            } else {
                defaultSize = (Meta.get("content-type") === "comment") ?
                        AJS.Confluence.PropertyPanel.Image.getPresetImageSize("small") : AJS.Confluence.PropertyPanel.Image.getPresetImageSize("medium");
            }

            var propertyName = isScaledByWidth ? "max-width" : "max-height";
            $image.css(propertyName, defaultSize + "px");

            // there is no simple way to get back at the inserted image, so we put
            // a temporary id on it before inserting
            var ed = tinymce.activeEditor;
            var id = "_" + (+new Date());
            var div = $("<div></div>").append($image.attr("id", id));

            ed.selection.setContent(div.html());

            var imgElem = ed.dom.get(id);
            ed.dom.setAttrib(imgElem, "id", "");

            if (!$image.hasClass("confluence-external-resource")) {
                var dataImageWidth = $image.attr("data-image-width");
                var dataImageHeight = $image.attr("data-image-height");
                if (dataImageWidth === undefined && dataImageHeight === undefined) {
                    dataImageWidth = $image.attr("width");
                    dataImageHeight = $image.attr("height");
                }
                resizeImage(imgElem, dataImageWidth, dataImageHeight, isScaledByWidth, defaultSize);
                this.updateThumbnailAttribute(imgElem);
            }

            // CONFDEV-5735: In IE8 only, the load event fires multiple times, i.e. when clicking
            // the Preview button. Ensure that the property panel is only triggered once.
            $(imgElem).one("load", function () {
                if ($image.hasClass("confluence-external-resource")) {
                    resizeImage(this, this.width, this.height, isScaledByWidth, defaultSize);
                }

                // CONFDEV-3749 - make sure new element is visible
                AJS.Rte.showSelection(function () {
                    if (!hidePropertiesPanel) {
                        AJS.trigger("trigger.property-panel", {elem: imgElem});
                    }
                    ed.undoManager.add();
                });

                ed.onChange.dispatch();
            });
        },

        updateThumbnailAttribute: function(imageElement) {
            var requiredWidth = imageElement.width;
            var requiredHeight = imageElement.height;

            var requiredSize = requiredWidth || requiredHeight;

            if (requiredSize) {
                var image = $(imageElement);
                var imageWidth = image.attr("data-image-width");
                var imageHeight = image.attr("data-image-height");
                var maxThumbWidth = Meta.get("max-thumb-width");
                var maxThumbHeight = Meta.get("max-thumb-height");
                var isNotRemoteImage = !this.isRemoteImg(imageElement.src);

                var isThumbnail = isNotRemoteImage && this.isThumbnailUsable(requiredWidth, requiredHeight, imageWidth, imageHeight, maxThumbWidth, maxThumbHeight);
                image.attr('thumbnail', isThumbnail);
                image.toggleClass("confluence-thumbnail", isThumbnail);
            }
        },

    /**
         * Checks if an image has a url as its destination instead of a wiki link.
         * @return true if image text starts with http or https protocol
         */
        isRemoteImg: function (destination) {
            var currentbaseurl = AJS.Rte.getCurrentBaseUrl();
            return destination.match('(https?://)') && destination.indexOf(currentbaseurl) === -1;
        },

        /**
         * Check whether a thumbnail should be loaded
         * @returns {boolean} true if the image is a landscape image and requiredSize
         * is less than or equal maxThumbWidth/maxThumbHeight, or the image is a portrait/landscape image and
         * requiredWidth/requiredHeight is less than or equal the thumbnail width/height.
         * Otherwise, return false.
         */
        isThumbnailUsable: function(requiredWidth, requiredHeight, imageWidth, imageHeight, maxThumbWidth, maxThumbHeight) {
            var requiredSize;
            if (requiredWidth) {
                requiredSize = requiredWidth;
                if (requiredSize > maxThumbWidth) {
                    // The maximum thumbnail width is less than the required width,
                    // so there is no option to use a thumbnail.
                    return false;
                }
                if (imageWidth === undefined && imageHeight === undefined) {
                    return true;
                }

                var imageWidthHeightRatio = imageWidth / imageHeight;
                if (imageWidthHeightRatio >= 1) {
                    // This image has landscape orientation, so its thumbnail width
                    // must be greater than or equal the requested width and the
                    // thumbnail can be used.
                    return true;
                }

                // If the image has portrait orientation, its thumbnail width may be
                // greater or less than the required width.
                var thumbnailWidth = imageWidthHeightRatio * maxThumbHeight;
                return thumbnailWidth >= requiredSize;
            } else {
                // when scale by height, input requiredSize can be width (when user input custom size)
                // or height (when user click on small/meidum/large buttons
                requiredSize = requiredHeight;
                if (requiredSize > maxThumbHeight) {
                    // The maximum thumbnail height is less than the required height,
                    // so there is no option to use a thumbnail.
                    return false;
                }
                if (imageWidth === undefined && imageHeight === undefined) {
                    return true;
                }

                var imageHeightWidthRatio = imageHeight / imageWidth;
                if (imageHeightWidthRatio >= 1) {
                    // This image has portrait orientation, so its thumbnail height
                    // must be greater than or equal the requested height and the
                    // thumbnail can be used.
                    return true;
                }

                // If the image has landscape orientation, its thumbnail height may be
                // greater or less than the required height.
                var thumbnailHeight = imageHeightWidthRatio * maxThumbWidth;
                return thumbnailHeight >= requiredSize;
            }
        }
    };

    return {
        "ImageProperties": ImageProperties,
        "ImageUtils": ImageUtils
    };
});

require('confluence/module-exporter').safeRequire('confluence-editor/utils/tinymce-image-utils', function(ImageUtils) {
    var tinymce = require('tinymce');

    tinymce.confluence.ImageProperties = ImageUtils.ImageProperties;
    tinymce.confluence.ImageUtils = ImageUtils.ImageUtils;
});
