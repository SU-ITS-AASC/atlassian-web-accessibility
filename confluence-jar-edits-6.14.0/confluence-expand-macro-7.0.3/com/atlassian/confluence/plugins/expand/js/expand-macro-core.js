(function(){
    /**
     * Constructor for the MobileMacroHelper
     * 
     * @param jz the jQuery or Zepto type object to be used in the toggle function.
     */
    var MobileMacroHelper = function(jz) {
        this.$ = jz;

        /**
         * @param eventMatcher an optional function taking a single event argument which is used to decide whether the
         * toggle function should operate or not.
         * @return the function that will be executed when the macro is toggled on the displayed page
         */        
        this.createToggleFunction = function(eventMatcher) {
            var $ = this.$;
            
            return function expand(e) {
                if (typeof eventMatcher != "undefined" && !eventMatcher(e)) {
                    return;                    
                }

                var $expander = $(this),
                    $expanderIcon = $(".expand-icon", $expander),
                    $expanderContent = $(".expand-content", $expander.closest(".expand-container")).first(); // avoid any nested expand-content

                var userAction;
                if ($expanderContent.hasClass("expand-hidden")) {
                    $expanderIcon.removeClass("aui-iconfont-chevron-right").addClass("aui-iconfont-chevron-down");
                    $expanderContent.css("display","block");
                    $expanderContent.animate({opacity:1});
                    userAction = 'expand';
                } else {
                    $expanderIcon.removeClass("aui-iconfont-chevron-down").addClass("aui-iconfont-chevron-right");
                    $expanderContent.animate({opacity:0}, {
                        complete : function() {
                            $expanderContent.hide();
                        }
                    });
                    userAction = 'collapse';
                }
                
                $expanderContent.toggleClass("expand-hidden");

                if (userAction === 'expand') {
                    AJS.trigger('confluence.expand-macro.expanded');
                } else {
                    AJS.trigger('confluence.expand-macro.collapsed');
                }

                AJS.trigger('analyticsEvent', {
                    name: 'confluence.expand-macro.expand-click',
                    data: {
                        userAction: userAction
                    }
                });
            };
        };

        /**
         * @param context the node to search within.
         * @return a $ wrapped collection of elements that are expand controls scoped
         * to the supplied DOM element
         */        
        this.getExpandElements = function(context) {
            return this.$(".expand-control", context);
        };        
    };

    if (typeof Confluence === 'undefined') {
        Confluence = {};
    }

    if (typeof Confluence.Plugins === 'undefined') {
        Confluence.Plugins = {};
    }

    Confluence.Plugins.ExpandMacro = {

        /**
         * Connect the elements in the page to the event handler for expanding and collapsing.
         * 
         * @param jz the jQuery or Zepto type object to be used in the toggle function.
         * @param context the node to search within.
         * @param eventNames a space separated String of event names to bind
         * @param eventMatcher an optional function taking a single event argument which is used to decide whether the
         * toggle function should operate or not.
         */
        bind: function(jz, context, eventNames, eventMatcher) {
            var helper = new MobileMacroHelper(jz);
            var $elements = helper.getExpandElements(context);
            
            $elements.length && $elements.bind(eventNames, helper.createToggleFunction(eventMatcher));
        }
    };    
})();