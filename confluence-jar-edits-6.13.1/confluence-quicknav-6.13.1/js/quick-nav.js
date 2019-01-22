/**
 * @module confluence/quick-nav
 */
define('confluence-quicknav/quick-nav', [
    'ajs',
    'jquery',
    'confluence/api/logger'
], function(AJS, $, logger) {
    'use strict';

    var dropDownPostProcess = [];
    var makeParams;


    /*
     * Append the drop down to the form element with the class quick-nav-drop-down
     */
    var quickNavPlacement = function(input) {
        return function(dropDown) {
            input.closest('form').find('.quick-nav-drop-down').append(dropDown);
        };
    };

    var addDropDownPostProcess = function(dp) {
        if (typeof dp !== 'undefined') {
            dropDownPostProcess.push(dp);
        } else {
            logger.log('WARN: Attempted to add a dropdown post-process function that was undefined.');
        }
    };

    /**
     * Add the space name to the dropdown field.
     * @param {object} dropdown
     */
    var addSpaceName = function(dropdown) {
        $('a', dropdown).each(function() {
            var $a = $(this);
            var $span = $a.find('span');
            // get the hidden space name property from the span
            var properties = $span.data('properties');
            var spaceName = properties ? properties.spaceName : null;
            if (spaceName && !$a.is('.content-type-spacedesc')) {
                // clone the original link for now. This could potentially link to the space?
                $a.after($a.clone().attr('class', 'space-name').html(spaceName));
                // add another class so we can restyle to make room for the space name
                $a.parent().addClass('with-space-name');
            }
        });
    };

    return {
        addDropDownPostProcess: addDropDownPostProcess,
        setMakeParams: function(mp) {
            makeParams = mp;
        },
        init: function() {
            var quickSearchQuery = $('#quick-search-query');
            var dropDownPlacement = quickNavPlacement(quickSearchQuery);
            var spaceBlogSearchQuery = $('#space-blog-quick-search-query');
            var confluenceSpaceKey = $('#confluence-space-key');

            quickSearchQuery.quicksearch('/rest/quicknav/1/search', null, {
                dropdownPlacement: dropDownPlacement,
                dropdownPostprocess: function(dropdown) {
                    $.each(dropDownPostProcess, function(index, postProcessFunction) {
                        if (postProcessFunction) {
                            postProcessFunction(dropdown);
                        }
                    });
                },
                makeParams: function(value) {
                    // if the makeParams function was set use that one instead of the default
                    if (makeParams) {
                        return makeParams(value);
                    }

                    return { query: value };
                },
                ajsDropDownOptions: {
                    className: 'quick-search-dropdown'
                }
            });

            addDropDownPostProcess(addSpaceName);

            if (spaceBlogSearchQuery.length && confluenceSpaceKey.length) {
                spaceBlogSearchQuery.quicksearch('/rest/quicknav/1/search?type=blogpost&spaceKey=' +
                    AJS('i').html(confluenceSpaceKey.attr('content')).text(), null, {
                    dropdownPlacement: quickNavPlacement(spaceBlogSearchQuery)
                });
            }
        }
    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-quicknav/quick-nav', 'Confluence.QuickNav');
require('confluence/module-exporter').safeRequire('confluence-quicknav/quick-nav', function(QuickNav) {
    var AJS = require('ajs');
    var DarkFeatures = require('confluence/dark-features');
    if (DarkFeatures.isEnabled('next.ui.search') === false) {
        AJS.toInit(QuickNav.init);
    }
});
