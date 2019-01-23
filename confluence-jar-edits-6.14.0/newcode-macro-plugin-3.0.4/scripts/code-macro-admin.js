(AJS.toInit(function($) {

    $("#add-language").click(function(event) {

        var max_length = 30;

        var popup = new AJS.Dialog(600, 450);
        popup.addHeader(AJS.I18n.getText("newcode.config.language.add.link"));
        popup.addPanel("", Confluence.Templates.NewCode.addLanguageDialog({token: AJS.Meta.get("atl-token")}), "panel-body");
        popup.addButton(AJS.I18n.getText("newcode.config.language.add.add"), submit);
        popup.addCancel(AJS.I18n.getText("newcode.config.language.add.cancel"), cancel);
        popup.show();

        var fileInput = $("#languageFile");
        var nameInput = $("#newLanguageName");
        var form = $("#addLanguageForm");

        function validate()
        {
            var success = true;

            // Validate file input
            var fileError = findErrorDiv(fileInput);
            if (fileInput.val() == '')
            {
                // Locate the error div and show it.
                fileError.text(AJS.I18n.getText("newcode.config.language.add.filename.required"));
                fileError.removeClass("hidden");
                success = false;
            }
            else
            {
                fileError.addClass("hidden");
            }

            // Validate name input
            var nameError = findErrorDiv(nameInput);
            if (nameInput.val() == '')
            {
                nameError.text(AJS.I18n.getText("newcode.config.language.add.friendlyname.required"));
                nameError.removeClass("hidden");
                success = false;
            }
            else if (nameInput.val().length > max_length)
            {
                nameError.text(AJS.I18n.getText("newcode.config.language.add.friendlyname.length"));
                nameError.removeClass("hidden");
                success = false;
            }
            else
            {
                nameError.addClass("hidden");
            }

            return success;
        }

        function submit()
        {
            if (validate())
            {
                form.submit();
                unbind();
                popup.remove();
            }
        }

        function cancel()
        {
            unbind();
            popup.remove();
        }

        function findErrorDiv(input)
        {
            return $(".error", input.parent());
        }

        var handler = function() {
            errorDiv = findErrorDiv($(this));
            if (!errorDiv.hasClass("hidden"))
                errorDiv.addClass("hidden");

        };

        fileInput.change(handler);
        nameInput.focus(handler);

        function unbind()
        {
            fileInput.unbind("change", handler);
            nameInput.unbind("focus", handler);
        }
    });
}))(AJS.$);
