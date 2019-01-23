/**
 * Converts space keys and "special" space keys into UI-friendly display names.
 */
define('confluence-ui-components/js/internal/space-resolver', [
    'underscore',
    'jquery',
    'ajs'
], function (
    _,
    $,
    AJS
) {
    'use strict';

    /**
     * Mapping of space category keys to name.
     */
    var SPACE_CATEGORIES = {
        "conf_all": AJS.I18n.getText("confluence-ui-components.space-picker.categories.all-spaces"),
        "conf_current": AJS.I18n.getText("confluence-ui-components.space-picker.categories.current-space"),
        "conf_favorites": AJS.I18n.getText("confluence-ui-components.space-picker.categories.favourite-spaces"),
        "conf_global": AJS.I18n.getText("confluence-ui-components.space-picker.categories.site-spaces"),
        "conf_personal": AJS.I18n.getText("confluence-ui-components.space-picker.categories.personal-spaces")
    };

    function makeSpaceKeyParamString(spaceKeys) {
        var params = _.map(spaceKeys, function (spaceKey) {
            return 'spaceKey=' + encodeURI(spaceKey);
        });
        return params.join('&');
    }

    function makeDisplayItem(key, value) {
        var idOnly = typeof value === 'undefined';
        var text = _.escape(idOnly ? key : value);
        return {
            id: key,
            text: text,
            // This could later be used to render 'missing' spaces in red, have a tooltip, etc.
            idOnly: idOnly
        };
    }

    function getSpaceDisplayItems(spaceKeys, callback) {

        var displayItemMap = {};
        var keysToFetch = [];

        _.each(spaceKeys, function (spaceKey) {

            // Try a local category lookup first
            var categoryText = getSpaceCategoryDisplayName(spaceKey);
            if (categoryText) {
                displayItemMap[spaceKey] = makeDisplayItem(spaceKey, categoryText);
            }
            else {
                keysToFetch.push(spaceKey);
            }
        });

        var deferred;
        if (keysToFetch.length) {
            var url = AJS.contextPath() + '/rest/api/space?' + makeSpaceKeyParamString(keysToFetch);
            deferred = $.getJSON(url);
        }
        else {
            deferred = new $.Deferred();
            deferred.resolve({
                results: []
            });
        }

        function renderSpaces(response) {
            var spaces = response.results;
            _.each(spaces, function (space) {
                displayItemMap[space.key] = makeDisplayItem(space.key, space.name);
            });

            // Now that all known spaces and categories are accounted for, build an array of items with the same order
            // as the incoming space keys. Unmatched space keys get added with the display name just the key.
            var displayItems = _.map(spaceKeys, function (spaceKey) {
                return displayItemMap[spaceKey] || makeDisplayItem(spaceKey);
            });

            callback(displayItems);
        }

        deferred.done(renderSpaces);
    }

    function getSpaceCategoryDisplayName(categoryKey) {
        return SPACE_CATEGORIES[categoryKey];
    }

    var spaceTypeKeys = ['conf_favorites', 'conf_global', 'conf_personal'];

    return {
        getSpaceDisplayItems: getSpaceDisplayItems,
        getSpaceCategoryDisplayName: getSpaceCategoryDisplayName,

        getSpaceTypeKeys: function () {
            return spaceTypeKeys;
        }
    };
});