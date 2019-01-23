/**
 * @module confluence-editor/utils/tinymce-node-utils
 */
define('confluence-editor/utils/tinymce-node-utils', [
    'tinymce',
    'ajs',
    'jquery'
], function(
    tinymce,
    AJS,
    $
) {
    "use strict";

    var uniqueIdCounter = 0;

    var that;
    that = {

        /**
         * Controls the editor while updating placeholder nodes with new data and attributes.
         *
         * - Handles data and attribute update requests to the server.
         * - Provides feedback to the user as to the progress of a placeholder's update.
         *
         * @param node The existing DOM node that will be updated
         * @returns a jQuery promise object to which you can attach callbacks.
         *
         * @note You will need to create your own undo steps before and/or after you call this function.
         */
        updateNode: function (node, newNode) {
            var ed = tinymce.activeEditor;
            var $oldNode = $(node, ed.getDoc());
            var synchronyId = 'confluence.update-node-' + uniqueIdCounter++;

            AJS.trigger('synchrony.stop', { id: synchronyId });

            var revertNodeState = that.prepareNodeForUpdate($oldNode);

            return that.replaceNode($oldNode, newNode)
                    .fail(revertNodeState)
                    .always(function() {
                        AJS.trigger('synchrony.start', { id: synchronyId });
                    })
                    .promise();
        },

        storeNodeState: function ($node, attrs) {
            var attributeCache = {};
            var attr;
            for (var i = 0, ii = attrs.length; i < ii; i++) {
                attr = attrs[i];
                attributeCache[attr] = $node.attr(attr);
            }
            return function() {
                for (var attr in attributeCache) {
                    $node.attr(attr, attributeCache[attr]);
                }
            };
        },

        prepareNodeForUpdate: function ($node) {
            var restoreNodeState = null;

            if ($node.is("img")) {
                restoreNodeState = that.storeNodeState($node, ["width", "height", "src", "class"]);

                // Update the image node to indicate we're doing something.
                $node.addClass("image-hotswap").attr({
                    "src": AJS.contextPath() + "/images/border/spacer.gif",
                    "width": $node.attr("width"),
                    "height": $node.attr("height")
                });
            }
            return restoreNodeState;
        },

        /**
         * Controls the replacement of old nodes in the editor with new ones.
         *
         * Handles replacement such that there should be no flashes of unstyled content,
         * as could be the case with images.
         *
         * @param oldNode The existing DOM node that will be replaced
         * @param newNode The html for a new node, the DOM element or a jQuery wrapped DOM node
         * @returns a jQuery promise object to which you can attach callbacks.
         */
        replaceNode: function (oldNode, newNode) {
            var ed = tinymce.activeEditor;
            var doc = that.getDoc();
            var $newNode = $(newNode, doc);
            var $oldNode = $(oldNode, doc);
            var synchronyId = 'confluence.replace-node-' + uniqueIdCounter++;

            AJS.trigger('synchrony.stop', { id: synchronyId });

            /**
             * Waiting for an image to be fully loaded into the DOM in the background is an asynchronous operation - hence use a jQuery.Deferred here.
             */
            return $.Deferred(function () {
                var deferred = this;

                if ($newNode.is("img")) {
                    /**
                     * Here we're delaying the replacement of the node until the image's src has been
                     * fully loaded by the browser.
                     */
                    $newNode[0].onload = function() {
                        AJS.debug("replaceNode: new node's src has been loaded by the browser.");
                        this.onload = null;
                        deferred.resolve(this);
                    };
                    // In Opera, the src has to be defined after the onLoad callback or it won't work.
                    if ($.browser.opera) {
                        $newNode[0].src = $newNode.attr('src');
                    }
                    /**
                     * Trigger rendering of the new DOM node, in turn requesting the image's src,
                     * ultimately triggering the onLoad event above.
                     */
                    doc.createDocumentFragment().appendChild($newNode[0]);
                } else {
                    deferred.resolve($newNode[0]);
                }
            }).always(function() {
                AJS.trigger('synchrony.start', { id: synchronyId });
            }).done(function(newNode) {
                $oldNode.replaceWith(newNode);
            }).promise();
        },

        /**
         * Replaces whatever the active range in the editor is with the node.
         * If no text is selected in the editor, the node will be placed at the cursor position,
         * and the cursor will be placed after the new node.
         * @param newNode element to put into the editor.
         */
        replaceSelection: function(newNode) {
            var ed = tinymce.activeEditor;
            var range = ed.selection.getRng(true);
            var node;
            var tmpNode;
            var selectRange;

            selectRange =  ed.getDoc().createRange();

            //we have a mess off event handlers, so we need to make sure we clone them too.
            node = $(newNode).clone(true,false)[0];
            // Delete the currently-selected content
            range.deleteContents();
            //the text node can not be empty for some reason in ie
            if(range.startContainer.nodeType === 3 && range.startContainer.nodeValue === "") {
                range.startContainer.nodeValue = AJS.Rte.HIDDEN_CHAR;
            }
            // Replace it with the new node
            range.insertNode(node);

            var text = ed.getDoc().createTextNode(AJS.Rte.HIDDEN_CHAR);
            ed.dom.insertAfter(text,node);
            tmpNode = text;

            selectRange.setStartBefore(tmpNode);
            selectRange.setEndAfter(tmpNode);
            selectRange.collapse(false);
            ed.selection.setRng(selectRange);
            return node;
        },

        /**
         * Wraps the browser's implementation of node.normalize()
         * and preserves the user's cursor position or text selection.
         *
         * Prevents CONF-23457, CONF-23461, CONF-23601 and CONFDEV-6141.
         * Sidesteps http://code.google.com/p/chromium/issues/detail?id=100687
         */
        normalize: function(node) {
            var ed = tinymce.activeEditor;
            var range = ed.selection.getRng(true);
            var newRange;
            var childNodeGraph = [];
            var values;
            var oldContainer;

            if (!node || !node.childNodes) { return; }

            /**
             * Returns an array of data about each child node of the node to be normalized.
             *
             * Each entry will contain an object with three values:
             *     isTextNode: whether the child @ this index is a text node or not.
             *     textNodesBefore: How many text nodes will be consolidated before this child.
             *     precedingTextLength: The cumulative length of all the *consecutive*
             *     text nodes prior to this one.
             *
             * These values can be used to determine the equivalence between children of
             * the node once it's been normalized.
             */
            function getChildNodeGraph(node) {
                var graph = [];
                var runningLength = 0;
                $.each(node.childNodes, function(i, child) {
                    var data = {};
                    var lastChild = (graph[i-1] || {});

                    // Set our values.
                    data.isTextNode = (child.nodeType === 3);
                    data.textNodesBefore = ((data.isTextNode && lastChild.isTextNode) ? 1 : 0) + ~~lastChild.textNodesBefore;
                    data.precedingTextLength = runningLength;

                    // Increment or reset our counters as required.
                    runningLength = (data.isTextNode) ? runningLength + child.nodeValue.length : 0;

                    graph.push(data);
                });
                return graph;
            }

            if (tinymce.isWebKit) {
                // Webkit's saving grace is that it updates the previous range's offsets to match the new normalized nodes.
                newRange = range;
            } else if (tinymce.isGecko) {
                // Firefox just places the cursor at the end of the consolidated node, which isn't useful.
                // Calculate what the new range's offsets should be after the nodes are consolidated.
                newRange = range.cloneRange();
                values = {
                    startIndex: $.inArray(range.startContainer, node.childNodes),
                    startOffset: newRange.startOffset,
                    endIndex: $.inArray(range.endContainer, node.childNodes),
                    endOffset: newRange.endOffset
                };
                if (values.startIndex > -1 || values.endIndex > -1) {
                    // the cursor/selection is inside an element that will be normalized.
                    // we will need to derive the correct containers later.
                    childNodeGraph = getChildNodeGraph(node);
                }
            }

            // Run the browser's Node.normalize() function
            node.normalize();

            /*
             * If the user's cursor was inside a text node,
             * Firefox will have just jumped the cursor to the end of the consolidated text node.
             *
             * We'll check the start and end containers of the original range.
             * If the original cursor/selection's container was in line to be normalized,
             * Use the graph created earlier to determine the index of the new equivalent text node,
             * and the cumulative length of the text that preceded the cursor/selection's boundary.
             */
            if (tinymce.isGecko) {
                // Adjust the start container+offset if required
                if (oldContainer = childNodeGraph[values.startIndex]) {
                    values.newStartIndex = values.startIndex - oldContainer.textNodesBefore;
                    values.newStartOffset = values.startOffset + oldContainer.precedingTextLength;
                    newRange.setStart(node.childNodes[values.newStartIndex], values.newStartOffset);
                }
                // Adjust the end container+offset if required
                if (oldContainer = childNodeGraph[values.endIndex]) {
                    values.newEndIndex = values.endIndex - oldContainer.textNodesBefore;
                    values.newEndOffset = values.endOffset + oldContainer.precedingTextLength;
                    newRange.setEnd(node.childNodes[values.newEndIndex], values.newEndOffset);
                }
            }

            // Put the cursor/selection back in the appropriate spot.
            newRange && ed.selection.setRng(newRange);
        },

        /**
         * For when you need to create elements on the correct document object.
         *
         * - Firefox and Opera won't fire callbacks or add nodes to the editor
         *   unless you use the page's document.
         * - Webkit works with either document object, but has an issue
         *   with the page's document where it will re-create the node when
         *   passing it to the editor's iframe, which will in turn cause its
         *   callbacks and handles to fire twice.
         * - IE needs to use the editor's document.
         *
         * @returns the best document object to create nodes on, depending on the browser.
         */
        getDoc: function() {
            var ed = tinymce.activeEditor;
            return ($.browser.mozilla || $.browser.opera) ? document : ed.getDoc();
        },

        /**
         * Dissects the DOM at the boundaries of the editor's currently selected range
         * to create a standalone, contextually valid document fragment. Adjusts the editor's
         * selection to wholly contain this document fragment.
         *
         * This is analogous to taking a mountain range and cutting it in two places,
         * running from the tip of a peak down to ground level.
         *
         *    /\|           |                /\    |                  |
         *   /  |\  /\      |/\             /  \   |   /\  /\         |   /\
         *  /   | \/  \    /|  \     ===>  /    \  |  /  \/  \    /\  |  /  \
         * /    |      \/\/ |   \         /      \ | /        \/\/  \ | /    \
         *      |           |    \                \|/                \|/      \
         *
         */
        isolateSelectedRange: function () {
            var ed = tinymce.activeEditor;
            var doc = that.getDoc();
            var selection = ed.selection;
            var r = selection.getRng(true);
            var start = r.startContainer;
            var startOffset = r.startOffset;
            var end = r.endContainer;
            var endOffset = r.endOffset;
            var adjustedEndOffset;
            var rangeStartNode;
            var rangeEndNode;

            // If there's nothing selected, there's no point doing anything at all.
            if (r.collapsed) {
                return r;
            }

            /**
             * Finds the optimal gap between two DOM nodes at which to
             * dissect the DOM and split it in to two parts.
             * If such a gap does not exist (such as inside a text node), it will be created.
             *
             * Returns an array of two nodes: the outside node and the inside node.
             * The inside node is always the first result in the array.
             * Returns undefined if no dissection needs to occur.
             *
             * @param start the node in which the content to dissect resides.
             * @param offset the position inside the start node at which the content must be dissected.
             * @param root the node at which dissection would go no further down.
             * @param outsideOnRight if true, the outside node will be the node to the immediate right of the inside node.
             *                       otherwise, it will be the node to the immediate left of the inside node.
             */
            function findIncisionPoint(start, offset, root, outsideOnRight) {
                var outside = null;
                var inside = null;
                var direction;
                var boundary;
                var temp;

                outsideOnRight = (outsideOnRight) ? true : false;
                direction = (outsideOnRight) ? "nextSibling" : "previousSibling";

                // determine if our incision point starts at a boundary point between two nodes.
                boundary = (offset === 0); // boundary is on the left edge of the node
                if (!boundary && outsideOnRight) {
                    // check if the split point is at the right edge of the node
                    if (start.nodeType === 3) {
                        boundary = (offset === start.length);
                    } else {
                        boundary = (offset === start.childNodes.length);
                    }
                }

                if (boundary) {
                    // our offset is already placed between two nodes.
                    // Just grab references to those two nodes.
                    outside = start[direction];
                    inside = start;

                    // Move the incision point as high as possible in the DOM
                    while (outside === null) {
                        if (inside === root) {
                            return;
                        } else if (inside.parentNode === root) {
                            // our incision point rests against the edge of the root node,
                            // so there's no outside node.
                            break;
                        }
                        inside = inside.parentNode;
                        outside = inside[direction];
                    }
                } else {
                    // we might need to split a node in half.
                    if (start.nodeType === 3) {
                        temp = start.data;
                        start.data = temp.slice(offset); // take end
                        outside = doc.createTextNode(temp.slice(0, offset)); // take start
                        inside = start;
                        $(outside).insertBefore(inside);

                        if (outsideOnRight) {
                            // Swap the two sides around.
                            temp = inside;
                            inside = outside;
                            outside = temp;
                        }
                    } else {
                        inside = start.childNodes[offset - (outsideOnRight ? 1 : 0)];
                        outside = inside[direction];
                    }
                }

                return [inside, outside];
            }

            /**
             * Splits the DOM in to two distinct and correctly-nested halves, using
             * the gap between the 'outside' and 'inside' node as the fulcrum to split around.
             *
             * @param root the node at which the dissection will stop at.
             * @param outsideOnRight if true, the outside node is considered to be the node to the immediate right of the inside node.
             *                       otherwise, it is considered to be the node to the immediate left of the inside node.
             */
            function dissect(outside, inside, root, outsideOnRight) {
                var outsideContainer;
                var insideContainer;
                var t1;
                var t2;
                outsideOnRight = (outsideOnRight) ? true : false;

                while (inside !== root && inside.parentNode !== root) {
                    insideContainer = inside.parentNode;
                    outsideContainer = insideContainer.cloneNode(false); // clones attribute, not children
                    if (outsideOnRight) {
                        $(outsideContainer).insertAfter(insideContainer);
                        t1 = outside;
                        while(t1) {
                            t2 = t1.nextSibling;
                            outsideContainer.appendChild(t1);
                            t1 = t2;
                        }
                    } else {
                        $(outsideContainer).insertBefore(insideContainer);
                        t1 = insideContainer.firstChild;
                        while(t1 !== inside) {
                            t2 = t1.nextSibling;
                            outsideContainer.appendChild(t1);
                            t1 = t2;
                        }
                    }

                    outside = outsideContainer;
                    inside = insideContainer;
                }
                return inside;
            }

            function split(start, offset, outsideOnRight) {
                var root;
                var halves;
                var rangeBoundaryNode;

                root = ed.dom.getParent(start, ed.dom.isBlock);

                if (!root) {
                    // tinyMce does not consider <body> to be a block-level element,
                    // which is actually always the highest block-level element available.
                    // So if root is null, manually set root to the <body>
                    root = ed.getBody();
                }

                // Find out if we need to split the DOM at all.
                halves = findIncisionPoint(start, offset, root, outsideOnRight);
                if (!halves) {
                    // no dissection is required.
                    rangeBoundaryNode = undefined;
                } else if (!halves[1]) {
                    // there is no outer content to be concerned with,
                    // so the range should be adjusted to include the inside node.
                    rangeBoundaryNode = halves[0];
                } else {
                    // dissect the DOM between the inside and outside node.
                    rangeBoundaryNode = dissect(halves[1], halves[0], root, outsideOnRight);
                }
                return rangeBoundaryNode;
            }


            if (start === end) {
                // Assuming the first split happens,
                // We need to adjust the offset for the end, as it will change.
                adjustedEndOffset = endOffset - startOffset;
            }

            rangeStartNode = split(start, startOffset);
            rangeStartNode && r.setStartBefore(rangeStartNode);
            if (start !== r.startContainer) {
                // If the start container has changed, affect the endOffset if required.
                endOffset = adjustedEndOffset || endOffset;
            }
            rangeEndNode = split(end, endOffset, true);
            rangeEndNode && r.setEndAfter(rangeEndNode);

            selection.setRng(r);
            return r;
        }
    };

    return that;
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/utils/tinymce-node-utils', 'tinymce.confluence.NodeUtils');
