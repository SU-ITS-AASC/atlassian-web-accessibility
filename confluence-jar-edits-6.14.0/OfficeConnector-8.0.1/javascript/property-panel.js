/**
 * Handling of the Office Connector property panel buttons in the editor.
 */
(function() {
    AJS.Confluence.PropertyPanel.Macro.registerButtonHandler("office-connector-download-file-button", function(e, macroNode) {
        // read the macro properties from the macro
        var macroParameters = AJS.$(macroNode).attr("data-macro-parameters");
        
        var paramPairs = macroParameters.split("|");
        var params = {};
        var i;
        for (i = 0; i < paramPairs.length; i++) {
            var nameAndValue = paramPairs[i];
            var parts = nameAndValue.split("=");
            if (parts.length > 1) {
                params[parts[0]] = parts[1];
            }
        }
                
        var pageId = AJS.Meta.get("page-id");
        var contextType = AJS.Meta.get("content-type");
        
        // space key is required in the case where the context page is a new draft
        if (!params["space"]) {
            params["space"] = AJS.Meta.get("space-key");
        }
        
        addToUrlIfDefined = function(name, value, url) {
            if (name && value) {
                if (url.charAt(url.length - 1) != "?") {
                    url += "&";
                }

                url = url + name + "=" + encodeURI(value);
            }
            
            return url;
        };
        
        var baseUrl = AJS.Meta.get("context-path");
        var servletPath = "/plugins/servlet/oc/getattachment?";
        var url = baseUrl + servletPath;
        url = addToUrlIfDefined("title", params["page"], url);
        url = addToUrlIfDefined("date", params["date"], url);
        url = addToUrlIfDefined("space", params["space"], url);
        url = addToUrlIfDefined("filename", params["name"], url);
        url = addToUrlIfDefined("contextid", pageId, url);
        url = addToUrlIfDefined("contexttype", contextType, url);
        
        var windowName = (AJS.$.browser && AJS.$.browser.msie) ? "_blank" : "download-office-attachment";
        var win = window.open(url, windowName);
    });
})();

