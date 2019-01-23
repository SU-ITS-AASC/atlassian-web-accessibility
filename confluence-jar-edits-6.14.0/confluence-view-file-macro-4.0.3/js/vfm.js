require([
    "jquery",
    "ajs",
    "vfm/components/embedded-file-view"
],
function (
    $,
    AJS,
    embeddedFileView
) {
    "use strict";

    // prevent click event on file placeholder of unknown attachment
    $(document).on("click", ".confluence-embedded-file.unknown-attachment", function (e) {
        e.preventDefault();
    });

    AJS.toInit(function () {
        $(".confluence-embedded-file-wrapper").each(function () {
            embeddedFileView.render({
                el: this
            });
        });
    });
});