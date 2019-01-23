AJS.$(function(){
    // We only need to include the adapter when we are on the configure space look and fell
    if(!$("body").hasClass("with-space-sidebar")) {
        return;
    }

	Confluence = Confluence || {};
	Confluence.Editor = Confluence.Editor || {};
	
	AJS.Rte = AJS.Rte || {};
	AJS.Rte.BookmarkManager = AJS.Rte.BookmarkManager || {};
	AJS.Rte.BookmarkManager.storeBookmark = AJS.$.noop;
	AJS.Rte.BookmarkManager.restoreBookmark = AJS.$.noop;
});