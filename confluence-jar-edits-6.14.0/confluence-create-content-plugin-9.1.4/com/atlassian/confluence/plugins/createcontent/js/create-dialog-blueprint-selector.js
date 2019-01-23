(function($) {
    var selectors = [];

    Confluence.Blueprint.Selector = {
        /**
         * The create dialog accepts arbitrary parameters via the init-dialog action. You can register a handler function
         * that checks these parameters and attempts to 'select' a particular blueprint when the create dialog is triggered.
         *
         * When the create dialog's items are loaded, this function is passed the create dialog's initContext property.
         * If a default blueprint selection should be made based on the parameters in the initContext, this function
         * should return the item module complete key of the blueprint to select.
         *
         * @param fn A handler that specifies the blueprint to select once the create dialog is loaded
         */
        registerSelector: function(fn) {
            if (fn && typeof(fn) === "function") {
                selectors.push(fn);
            }
        },
        /**
         * @return {Array} Selectors that have been registered
         */
        getSelectors: function() {
            return selectors;
        }
    };
})(AJS.$);