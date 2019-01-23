AJS.toInit(function ($) {
    var contentBlueprintId = AJS.Meta.get('content-blueprint-id');

    if (contentBlueprintId) {
        var hiddenField = '<input id="contentBlueprintId" type="hidden" name="contentBlueprintId" value="' + contentBlueprintId + '">';
        var form = $('#createpageform');
        form.append(hiddenField);
    }
});