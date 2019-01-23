/**
 * Provides custom behaviour in the macro browser for the code macro.
 */
(function($) {

    var CodeMacroConfig = function() {};

    CodeMacroConfig.prototype.fields = {
        "string" : {
            "language" : function(param, options) {

                var paramDiv = $(Confluence.Templates.MacroBrowser.macroParameterSelect());
                var input = $("select", paramDiv);

                // we need to do some trickery when the value is first set, and when the value is subsequently changed,
                // so set this up.
                if (options == null)
                    options = {};
                options.setValue = function(value) {

                    var targetOption = input.find("option[value='" + value + "']");
                    if (targetOption.length == 0) {
                        var option = $("<option/>");
                        option.val(value);
                        option.text(value);
                        input.append(option);
                    }
                };

                bindAsyncDropDown(input);
                return new AJS.MacroBrowser.Field(paramDiv, input, options);
            }
        }
    };

    AJS.MacroBrowser.Macros["code"] = new CodeMacroConfig();

    /**
     * Populates an HTML Select element with the list of configured syntax highlighters.
     * @param dropDown JQuery selector for the HTML select element to be populated.
     */
    function bindAsyncDropDown(dropDown) {
        // Load the languages from Confluence
        getLanguagesAsync(function(languages) {
                    if (!languages.length)
                    {
                        AJS.log("Configured code macro languages result was not in the expected format.");
                        return;
                    }

                    var currentValue = dropDown.val();

                    dropDown.empty();
                    dropDown.append($("<option/>").attr("value", ""));

                    $.each(languages, function(index, lang) {
                        var option = $("<option />");
                        option.val(lang.aliases[0]);
                        option.text(lang.friendlyName);

                        dropDown.append(option);
                    });

                    // restore the currently selected value.
                    dropDown.val(currentValue);
                },
                function(xhr, textStatus, errorThrown) {
                    AJS.log("Failed to retrieve syntax highlighters from Confluence " + textStatus + " - " + errorThrown);
                });
    }

    /**
     * Asynchronously retrieves the current set of syntax highlighters currently installed for the Code macro.
     *
     * @param successHandler Callback to invoke if the retrieval is successful
     * @param errorHandler Callback to invoke if the retrieval fails.
     */
    function getLanguagesAsync(successHandler, errorHandler) {
        AJS.$.ajax({
            async: true,
            url: AJS.contextPath() + "/plugins/newcode/getlanguages.action",
            dataType: "json",
            timeout: 10000, // 10 seconds,
            error: function(xhr, textStatus, errorThrown) {
                if (errorHandler && typeof(errorHandler) == "function") {
                    errorHandler(xhr, textStatus, errorThrown);
                }
            },
            success: function(data) {
                if (successHandler && typeof(successHandler) == "function") {
                    successHandler(data);
                }
            }
        });
    }
})(AJS.$);