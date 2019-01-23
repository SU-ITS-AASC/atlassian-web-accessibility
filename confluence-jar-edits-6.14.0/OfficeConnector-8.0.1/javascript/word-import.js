AJS.toInit(function ($) {
    OfficeConnector = {
        enableSubmission: function() {
            var adv = $("#next").attr("disabled", false);
        },

        doLvlSelect: function() {
            var lvl = parseInt($('#lvl-select').val());

            var options = $(".optionLevels");
            var maxLvl = parseInt(options.get(options.length-1).value);

            var finding = "";
            var targets = null;

            for(var i = 0; i<=maxLvl; i++) {
                finding = ".level" + i;
                if(i <= lvl) {
                    $(finding).removeClass("hidden");
                }
                else {
                    $(finding).addClass("hidden");
                }
            }
        },

        flipDelete: function(deleteAll) {
            $("#deleteall").attr("disabled", !deleteAll);
            $("#deletealllabel").toggleClass("cannot-execute", !deleteAll);
        },

        showLoading: function() {
            $("#loading").removeClass("hidden");
            $("#next").addClass("hidden");
        },

        loadDisplay: function() {
            $(".radiobutton").val(["true", "1"]);
            OfficeConnector.flipDelete(false);
            $("#lvl-select").val(0);
            $("#next").attr("disabled", true);
        }

    };

    $(window).load(function(){
        OfficeConnector.loadDisplay();
    });

    $(".flip-delete").click(function(){
        OfficeConnector.flipDelete($(this).val() == "false");
    });

    $("#lvl-select").change(function(){
        OfficeConnector.doLvlSelect();
        return false;
    });

    $("#filename").change(function(){
        OfficeConnector.enableSubmission();
    });

    $("#uploadimportform").submit(function(){
        OfficeConnector.showLoading();
    });

    $('#importwordform').submit(function(event) {
        // at the moment, we only concern about the feature to split the pages by heading
        var properties = {
            splittingLevel: $('#lvl-select').val()
        };

        Confluence.OfficeConnector.Analytics.importWord(properties);
    });

});
