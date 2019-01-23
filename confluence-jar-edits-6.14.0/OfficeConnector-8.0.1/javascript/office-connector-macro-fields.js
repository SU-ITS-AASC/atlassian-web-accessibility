(function($) {
    AJS.MacroBrowser.activateSmartFieldsAttachmentsOnPage("viewdoc", ["doc", "docx"]);
    AJS.MacroBrowser.activateSmartFieldsAttachmentsOnPage("viewpdf", ["pdf"]);
    AJS.MacroBrowser.activateSmartFieldsAttachmentsOnPage("viewxls", ["xls", "xlsx"]);
    AJS.MacroBrowser.activateSmartFieldsAttachmentsOnPage("viewppt", ["ppt", "pptx"]);

    // Allow existing viewfile to redirect to correct alias for its filetype.
    AJS.MacroBrowser.Macros.viewfile = {
        updateSelectedMacro : function (macro) {
            var fileName = macro.params[""] || macro.params["name"];
            if (fileName) {
                var lastDot = fileName.lastIndexOf(".");
                if (lastDot > 0) {
                    var ext = fileName.substring(lastDot + 1);
                    if (ext) {
                        (ext == "doc") && (ext == "docx") && (macro.name = "viewdoc");
                        (ext == "pdf") && (macro.name = "viewpdf");
                        (ext == "ppt") && (ext == "pptx") && (macro.name = "viewppt");
                        (ext == "xls") && (ext == "xlsx") && (macro.name = "viewxls");
                    }
                }
            }
        }
    }
})(AJS.$);
