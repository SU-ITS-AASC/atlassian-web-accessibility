define('confluence-ui-components/js/cql/internal/cql-special-spaces',
    [
        'underscore'
    ],
    /**
     * Helper method for handling special spaces (such as "Current Space" and "Favourite Spaces"), which takes into account
     * the current context. For example: "Current Space" is not applicable when on the search screen.
     * @module confluence-ui-components/js/cql/internal/cql-special-spaces
     */
    function (_) {

        'use strict';

        // This is a duplication of the key/values from BooleanQueryConverter.getSpaceType() in confluence-advanced-macros,
        // which should always stay in sync.
        var spaceIDToJSPropMapping = {
            //'conf_all',
            'conf_current': 'currentSpace()',
            'conf_favorites': 'favourite',
            'conf_global': 'global',
            'conf_personal': 'personal'
        };
        var JSPropToSpaceIDMapping = _.invert(spaceIDToJSPropMapping);

        function _getSpecialSpacesMapInContext(environment) {
            if (environment === 'search-screen') {
                return _.omit(spaceIDToJSPropMapping, 'conf_current');
            }
            return spaceIDToJSPropMapping;
        }

        function _getSpecialSpacesKeysInContext(environment) {
            return _.keys(_getSpecialSpacesMapInContext(environment));
        }

        function _getSpecialSpaceIDFromJSProp(property) {
            return JSPropToSpaceIDMapping[property];
        }

        return {
            getMap: _getSpecialSpacesMapInContext,
            getKeys: _getSpecialSpacesKeysInContext,
            getUIValue: _getSpecialSpaceIDFromJSProp
        };
    });