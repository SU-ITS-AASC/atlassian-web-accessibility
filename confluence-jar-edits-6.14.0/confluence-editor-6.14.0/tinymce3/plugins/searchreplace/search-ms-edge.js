/**
 * @module confluence-editor/tinymce3/plugins/searchreplace/search-ms-edge
 */
define('confluence-editor/tinymce3/plugins/searchreplace/search-ms-edge', [], function() {
    "use strict";

    // Get all text nodes from the editor area
    function getTextNodes(node) {
        var textNodes = [];
        if (node.nodeType === Node.TEXT_NODE) {
            textNodes.push(node);
        } else {
            var children = node.childNodes;
            for (var i = 0, len = children.length; i < len; ++i) {
                textNodes.push.apply(textNodes, getTextNodes(children[i]));
            }
        }
        return textNodes;
    }
    // Get all text node values from the editor area
    function getTextNodeValue(textNode) {
        return textNode.nodeValue.toLowerCase();
    }
    // Get current position of cursor or marker
    function getCurrentPositionOffset(selection, currentLocation, joinedText) {
        var selectedRange = selection.getRng();

        if (selectedRange.endContainer.nodeValue) {
            var currentCursor = joinedText.indexOf(selectedRange.endContainer.nodeValue.toLowerCase()) + selectedRange.endOffset;
            currentLocation = (currentLocation !== currentCursor && currentLocation !== -1) ? currentCursor : currentLocation;
        }
        return currentLocation;
    }
    // Search for the next or previous match
    function searchForMatches(fullText, searchText, currentLocation, searchPrevious) {
        var matchLocation = searchPrevious ? fullText.lastIndexOf(searchText, currentLocation - 1) : fullText.indexOf(searchText, currentLocation + 1);
        // If not found means being at the beginning or end of the text
        if (matchLocation < 0 && !searchPrevious) {
            matchLocation = fullText.indexOf(searchText);
        } else if (matchLocation === 0 && currentLocation === 0 && searchPrevious) {
            matchLocation = fullText.lastIndexOf(searchText);
        }
        return matchLocation;
    }
    // Get the position to create the selected range
    function getNextPositionOffset(matchStart, textNodes, textToSearch) {
        var startNode;
        var endNode;
        var startIndex;
        var endIndex;
        var atIndex = 0;

        for (var i = 0; i < textNodes.length; i++) {
            if (textNodes[i].nodeType === Node.TEXT_NODE) {
                var matchEnd = matchStart + textToSearch.length;
                if (!endNode && (textNodes[i].length + atIndex) >= matchEnd) {
                    endNode = textNodes[i];
                    endIndex = matchEnd - atIndex;
                }

                if (!startNode && (textNodes[i].length + atIndex) > matchStart) {
                    startNode = textNodes[i];
                    startIndex = matchStart - atIndex;
                }

                atIndex = atIndex + textNodes[i].length;
            }

            if (startNode && endNode) {
                return {
                    startNode: startNode,
                    startIndex: startIndex,
                    endNode: endNode,
                    endIndex: endIndex
                };
            }
        }
    }
    return {
        /**
         * An alternative for window.find which has not been supported on MS Edge.
         * @param {Selection} selection - represents the range of text selected or the current position of the caret.
         * @param {string} textToSearch - a search keyword.
         * @param {number} searchFrom - the save of last found position or the caret.
         * @param {HTMLObject} elementToSearch - the HTML object to search on.
         * @param {boolean} backwards - indicate the search direction, search next or previous.
         *
         * @return {Array} [found, position] - Returns an array containing a boolean indicating whether the keyword is found or not
         * and the position where the current selection begins
         */
        search: function(selection, textToSearch, searchFrom, elementToSearch, backwards) {
            var sel = selection.getSel();

            var textNodes = getTextNodes(elementToSearch);
            textToSearch = textToSearch.replace(/\s/g, '').toLowerCase();

            var joinedText = textNodes.map(getTextNodeValue).join('');
            searchFrom = getCurrentPositionOffset(selection, searchFrom, joinedText);

            var currentMatch = searchForMatches(joinedText, textToSearch, searchFrom, backwards);

            if (currentMatch < 0) {
                return [false, currentMatch];
            }

            var matchOffset = getNextPositionOffset(currentMatch, textNodes, textToSearch);

            var range = document.createRange();
            range.setStart(matchOffset.startNode, matchOffset.startIndex);
            range.setEnd(matchOffset.endNode, matchOffset.endIndex);
            sel.removeAllRanges();
            sel.addRange(range);
            range.startContainer.parentNode.scrollIntoView();
            return [true, currentMatch];
        }
    };
});