ConfluenceMobile.contentEventAggregator.on("displayed", function() {
    Confluence.Plugins.ExpandMacro.bind(Zepto, $(".container"), "touchstart"); 
});    
