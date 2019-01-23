/**
 * Load the Code Macro resources via WRM.require(). This avoids any extra blocking resources being added to the <head>
 */
define('confluence/code-macro/async-loader', [
    'jquery',
    'wrm',
    'underscore'
], function(
    $,
    WRM,
    _
) {
    return function() {
        _.defer(function() {
            var $controlButtons = $(".codeHeader .collapse-source");
            _showSpinner($controlButtons);
            var $codeBlocks = $('#content').find("pre.syntaxhighlighter-pre");

            if ($codeBlocks.length > 0) {

                var codeMacroThemeResourcePrefix = 'wr!com.atlassian.confluence.ext.newcode-macro-plugin:sh-theme-';
                var codeMacroResources = ['wrc!code-macro'];

                $codeBlocks.each(function() {
                    codeMacroResources.push(codeMacroThemeResourcePrefix + $(this).data('theme').toLowerCase());

                    // If the macro is using a custom language, we need to download it
                    var customLanguageResource = $(this).data('custom-language-resource');
                    if (typeof customLanguageResource !== "undefined" && codeMacroResources.indexOf(customLanguageResource) === -1) {
                        codeMacroResources.push("wr!" + customLanguageResource);
                    }
                });

                WRM.require(codeMacroResources).done(function () {
                    window.SyntaxHighlighter.highlight();
                    _hideSpinner($controlButtons);
                });

            }
        });

        /**
         * Hide the expand/collapse buttons until the highlighter is finished, and show a spinner instead
         * @param $controlButtons The expand/collapse buttons
         * @private
         */
        function _showSpinner($controlButtons) {
            $controlButtons.hide();
            // Avoiding searching the entire dom again
            _.forEach($controlButtons, function (button) {
                $(button).next('.collapse-spinner-wrapper').spin();
            });

        }

        /**
         * Show the expand/collapse buttons and hide the spinner once the highlighter is ready.
         * @param $controlButtons The expand/collapse buttons
         * @private
         */
        function _hideSpinner($controlButtons) {
            $controlButtons.show();
            $controlButtons.next('.collapse-spinner-wrapper').remove();
        }
    }
});

require('confluence/module-exporter').safeRequire('confluence/code-macro/async-loader', function(CodeMacroLoader) {
    AJS.toInit(CodeMacroLoader);
});
