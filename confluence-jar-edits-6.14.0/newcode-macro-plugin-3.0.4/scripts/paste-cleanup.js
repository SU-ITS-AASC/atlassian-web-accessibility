//This is triggered when a paste happens in TinyMce. If the user has copied a code macro from view to edit then we
//will want to strip it back to plain text. Note that Confluence already has code to remove the standard panel macro divs
AJS.$(document).bind('postPaste', function(e, pl, o) {
    AJS.$(o.node).find('span[class|="code"]').contents().unwrap();

    AJS.$(o.node).find('pre[class|="code"]').each(function(index, e) {
        e.className = e.className.replace(/\bcode-.[^\s]*\b/gi, '');
    });
});