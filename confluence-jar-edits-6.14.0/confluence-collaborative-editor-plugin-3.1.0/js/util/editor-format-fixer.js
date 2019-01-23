define('confluence-collaborative-editor-plugin/util/editor-format-fixer', [
    'underscore',
    'confluence/meta',
    'confluence-collaborative-editor-plugin/util/url-parser'
], function (_,
             Meta,
             urlparser) {
    'use strict';

    var fixAttachmentImages = function (htmlDoc) {
        var changeCount = 0;
        var attachmentImage = "img[data-base-url]";
        var baseUrl = Meta.get("base-url");
        var newBaseUrl = urlparser.parseUrl(baseUrl);
        var nodeList = htmlDoc.querySelectorAll(attachmentImage);
        for (var i = 0; i < nodeList.length; i++) {
            var elem = nodeList[i];
            var oldBaseUrl = urlparser.parseUrl(elem.attributes['data-base-url'].value);
            if (!_.isEqual(oldBaseUrl, newBaseUrl)) {
                var oldDataImageSrc = elem.attributes['data-image-src'].value;
                var oldSrc = elem.attributes['src'].value;
                var newDataImageSrc = oldDataImageSrc.replace(oldBaseUrl.pathname, newBaseUrl.pathname);
                var newSrc = oldSrc.replace(oldBaseUrl.pathname, newBaseUrl.pathname);
                elem.setAttribute('data-base-url', baseUrl);
                elem.setAttribute('data-image-src', newDataImageSrc);
                elem.setAttribute('src', newSrc);
                changeCount++;
            }
        }
        return changeCount;
    };

    var fixInternalPageLinks = function (htmlDoc) {
        var changeCount = 0;
        var internalLinksSelectors = [
            "a[data-base-url][href][data-linked-resource-type='page']",
            "a[data-base-url][href][data-linked-resource-type='blogpost']",
            "a[data-base-url][href][data-linked-resource-type='comment']",
            "a[data-base-url][href][data-linked-resource-type='space']",
            "a[data-base-url][href][data-linked-resource-type='attachment']",
            "a[data-base-url][href][data-linked-resource-type='custom']"
        ].join(",");
        var newBaseUrl = Meta.get("base-url");
        var parsedBaseUrl = urlparser.parseUrl(newBaseUrl);
        var nodeList = htmlDoc.querySelectorAll(internalLinksSelectors);
        for (var i = 0; i < nodeList.length; i++) {
            var elem = nodeList[i];
            var oldBaseUrl = urlparser.parseUrl(elem.attributes['data-base-url'].value);
            if (!_.isEqual(oldBaseUrl, parsedBaseUrl)) {
                var oldHref = urlparser.parseUrl(elem.attributes['href'].value);
                // reconstruct the url, but switch the protocol, host and port to the newBaseUrl's (but keep everything else)
                var newHref = newBaseUrl + oldHref.pathname.replace(oldBaseUrl.pathname, "") + oldHref.search + (oldHref.hash ? "#" + oldHref.hash : "");
                elem.setAttribute('data-base-url', newBaseUrl);
                elem.setAttribute('href', newHref);
                changeCount++;
            }
        }
        return changeCount;
    };

    var fixViewFileMacro = function (htmlDoc) {
        var changeCount = 0;
        var fixViewFileMacroImages = "img[data-macro-name='view-file']";
        var newBaseUrl = urlparser.parseUrl(Meta.get("base-url"));
        var nodeList = htmlDoc.querySelectorAll(fixViewFileMacroImages);
        for (var i = 0; i < nodeList.length; i++) {
            var elem = nodeList[i];
            var oldSrc = elem.attributes['src'].value;
            var possibleMatches = [
                //this is hardcoded in com.atlassian.confluence.plugins.conversion.impl.DefaultConversionManager.BASE_REST_PATH
                "/rest/documentConversion/latest/",
                //this is hardcoded in com.atlassian.confluence.plugins.viewfile.macro.marshaller.UnknownAttachmentFilePlaceholderMarshaller.UNKNOWN_ATTACHMENT_PLACEHOLDER
                "/plugins/servlet/confluence/placeholder/unknown-attachment?"
            ];
            for (var j = 0; j < possibleMatches.length; j++) {
                var possibleMatch = possibleMatches[j];
                var restApiIdx = oldSrc.indexOf(possibleMatch);
                if (restApiIdx != -1) {
                    var oldContextPath = oldSrc.substr(0, restApiIdx);
                    if (oldContextPath !== newBaseUrl.pathname) {
                        var newSrc = newBaseUrl.pathname + oldSrc.substr(restApiIdx);
                        elem.setAttribute('src', newSrc);
                        changeCount++;
                    }
                }
            }
        }
        return changeCount;
    };

    var _fixMentions = function (htmlDoc) {
        var userMentionSelector = "a[data-linked-resource-id][data-linked-resource-type='userinfo'][userkey]";
        var mentionsList = htmlDoc.querySelectorAll(userMentionSelector);
        Array.prototype.forEach.call(mentionsList, function (it) {
            it.removeAttribute("data-linked-resource-id");
        });
        return mentionsList.length;
    };

    return {
        /**
         * Fix the base url of the given htmlDoc object, from the stale base url, to the new base url.
         *
         * @param htmlDoc {HTMLBodyElement} a HTMLBodyElement object containing the confluence editor-format to be fixed. This object will be mutated.
         * @returns {Number} the number of mutations made
         */
        fixStaleBaseUrl: function (htmlDoc) {
            var imagesMutated = fixAttachmentImages(htmlDoc);
            var macrosMutated = fixViewFileMacro(htmlDoc);
            var internalPageLinksMutabed = fixInternalPageLinks(htmlDoc);
            return imagesMutated + macrosMutated + internalPageLinksMutabed;
        },
        /**
         * Fix up mentions by stripping the resource id, and force the marshalling to use the userkey to marshall to storage format.
         * @param htmlDoc the dom to modify
         * @returns {Number} the number of updates performed
         */
        fixMentions: function (htmlDoc) {
            return _fixMentions(htmlDoc);
        }
    };
});
