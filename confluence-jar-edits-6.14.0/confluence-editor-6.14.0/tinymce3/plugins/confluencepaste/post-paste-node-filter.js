/**
 * @module confluence-editor/tinymce3/plugins/confluencepaste/post-paste-node-filter
 */
define('confluence-editor/tinymce3/plugins/confluencepaste/post-paste-node-filter', [
    'jquery',
    'confluence/legacy',
    'confluence-editor/tinymce3/plugins/confluencepaste/linkify',
    'ajs',
    'document',
    'tinymce'
],
function(
    $,
    Confluence,
    linkify,
    AJS,
    document,
    tinymce
) {
    "use strict";

    /**
     * We are adapting linkify to behave like a regex object with
     * 'exec' and 'test' behaviors, so that it can be replaced by a regex if needed
     * in the future.
     */
    var URL_REGEX = (function() {

        linkify.init();

        var FULL_URL = new RegExp(linkify.RE_FULL_URL);
        var OTHER_URL = new RegExp(linkify.RE_OTHER_URL);

        return {
            exec:function(str) {
                var ret = FULL_URL.exec(str);

                return ret ? ret : OTHER_URL.exec(str);
            },
            test: function(str) {
                return FULL_URL.test(str) || OTHER_URL.test(str);
            }
        };
    })();

    // once issue 'HC-3169' is resolved this function won't be required and we will be able to just use:
    // var EMAIL_REGEX = new RegExp(linkify.RE_EMAIL_PATTERN);
    var EMAIL_REGEX = (function() {

        var emailRegex = new RegExp(linkify.RE_EMAIL_PATTERN);

        return {
            exec: function(str) {
                var match = emailRegex.exec(str);

                if (match && /\s/.test(match[0][0])) {
                    // HC-3169 - We have a match however since we are using hipchat's linkify for the regex in case of
                    // the first character being an empty space we will need to strip it and update the index of the match.
                    match[0] = match[0].replace(/\s/, '');
                    match.index++;
                }

                return match;
            },
            test: function(str) {
                return emailRegex.test(str);
            }
        };
    }());

    function filterRelativePath(element, attribute) {
        var items = $(element).find('[' + attribute + ']');
        var item = '';
        var attr = '';
        var mceAttr = '';

        for(var i=0, ii=items.length; i<ii; i++) {
            item = $(items[i]);
            attr = item && ['/', item.attr(attribute)].join('');
            mceAttr = item && ['/', item.attr('data-mce-' + attribute)].join('');

            if(AJS.contextPath() && attr.indexOf(AJS.contextPath()) === 0) {
                items[i] = item.attr(attribute, attr);
            }

            if(AJS.contextPath() && mceAttr.indexOf(AJS.contextPath()) === 0) {
                items[i] = item.attr('data-mce-' + attribute, mceAttr);
            }
        }

        return items;
    }

    function createCssFromWhiteList(item, whiteList) {
        var newCss = [];
        var regex = '';
        var matchedValue;
        var styleAttr = item.attr('style');
        var mceStyleAttr = item.attr('data-mce-style');

        for(var i=0, ii=whiteList.length; i < ii; i++) {
            if(styleAttr && styleAttr.toLowerCase().indexOf(whiteList[i]) > -1) {
                newCss.push(whiteList[i] + ': ' + item.css(whiteList[i]) + ';');
            } else if(mceStyleAttr && mceStyleAttr.toLowerCase().indexOf(whiteList[i]) > -1) {
                regex = new RegExp(whiteList[i] + ':.+?(?:;|$)');
                matchedValue = mceStyleAttr.match(regex);
                newCss.push(matchedValue[0].indexOf(';') > -1 ? matchedValue : matchedValue + ';');
            }
        }
        return newCss.join(' ');

    }

    function createFromWhiteList(item, attribute, whiteList) {
        var newList = [];

        if(whiteList) {
            for(var i=0, ii=whiteList.length; i < ii; i++) {
                if(item.is('[' + attribute + '~=' + whiteList[i] + ']')) {
                    newList.push(whiteList[i]);
                }
            }
        }
        return newList.join(' ');
    }

    function filterAttribute(element, attribute, whiteList) {
        var items = $(element).find('[' + attribute + ']');
        var list = '';
        var item;
        var whiteListForItem;

        if(items) {
            for(var i=0, ii=items.length; i<ii; i++) {
                item = $(items[i]);

                whiteListForItem = whiteList.standard;
                for (var selector in whiteList) {
                    if(whiteList.hasOwnProperty(selector) && item.is(selector)) {
                        whiteListForItem = whiteList[selector];
                        break;
                    }
                }

                if(attribute.indexOf('style') > -1) {
                    list = createCssFromWhiteList(item, whiteListForItem);
                } else {
                    list = createFromWhiteList(item, attribute, whiteListForItem);
                }

                item.removeAttr(attribute);
                if(list.length) {
                    item.attr(attribute, list);
                }
            }
        }
    }

    function filterAttributes(element, attributes) {
        var cssWhiteList = {};

        cssWhiteList.standard = ['text-decoration', 'text-align', 'margin-left'];
        cssWhiteList['.wysiwyg-macro'] = ['background-image'];
        cssWhiteList['p'] = ['margin-left', 'text-align'];
        cssWhiteList['span'] = ['color', 'text-decoration'];
        cssWhiteList['pre'] = ['margin-left'];
        cssWhiteList['td'] = cssWhiteList['th'] = ['text-align'];
        cssWhiteList['li'] = ['list-style-type', 'background-image'];
        /**
         * CONFDEV-39345: keep CSS width of <col> to avoid breaking UI of table
         * Table resize feature need this CSS
         */
        cssWhiteList['col'] = ['width'];
        //CONFDEV-40037
        cssWhiteList['table.confluenceTable.relative-table'] = ['width'];

        if(attributes.indexOf('style') > -1) {
            filterAttribute(element, 'style', cssWhiteList);
            filterAttribute(element, 'data-mce-style', cssWhiteList);
        }

        //Confusion with path names when pasting between pages within
        //the same domain. Add / to relative path in order to make absolute.
        //Gecko browsers only
        if ($.browser.mozilla) {
            if(attributes.indexOf('src') > -1) {
                filterRelativePath(element, 'src');
            }

            if(attributes.indexOf('href') > -1) {
                filterRelativePath(element, 'href');
            }
        }

        filterAttribute(element, 'face', { standard: []});
        filterAttribute(element, 'id', { standard: []});
        filterAttribute(element, 'data-mce-href', { standard: []});
        return element;
    }

    function removeNode(node, selector) {
        $(selector, node).contents().unwrap();
    }

    //Remove <br> tags from plain text and replace with paragraphs
    function processPlainText(element) {
        var node;
        var newHtml;
        node = $(element);
        newHtml = "<p>" + node.html().replace(/<br>/gi, "</p><p>") + "</p>";
        node.html(newHtml);
    }

    //If the only tags are <br> tags then we assume that we are pasting plain text
    function isPlainText(element) {
        var node = $(element);
        return node.children("br").length && !node.find(":not(br)").length;
    }

    function isInPlainTextMacro() {
        return $(tinymce.activeEditor.selection.getStart()).closest("[data-macro-body-type='PLAIN_TEXT']").length;
    }

    //Search for things that should always be removed but keep the content that these
    //elements may contain
    function filterNodes(node) {
        var toRemove = [".contentLayout", ".contentLayout2", ".columnLayout", ".header", ".footer", ".cell", ".innerCell", ".panelContent", ".panel", ".panelHeader", ".Apple-converted-space", "font", ".jira-status", ".jira-issue", ".diff-html-removed", ".diff-html-added", ".diff-html-changed"];
        $.each(toRemove, function(i, selector){
            removeNode(node, selector);
        });

        $('img', node).map(function() {
            $(this).attr('data-attachment-copy', '');

            //CONFDEV-4487 Pasting empty <img> tag breaks the editor
            !$(this).attr('src') && $(this).remove();
        });

        //CONF-27225 Confluence does not support definition lists <dl>. Pasting <dl>'s breaks the editor
        //Pasting a <dl> only inserts the text content and removes the offending markup
        $('dl', node).map(function() {
            $(this).replaceWith($('<p/>').text($(this).text()));
        });

        $('a', node).map(function() {
            // CONF-32907 if a link has any of those classes we want to remove it since it means the user copied and pasted
            // an already marshalled link.
            $(this).removeClass("confluence-userlink userLogoLink");
        });

    }

    /**
     * Check a single node link matches if found, wrap the link-part of the node in
     * an anchor.  Text on either side of the link part is re-added to nodesToTest.
     *
     * Note, this function adds more content to the nodesToTest stack. This mild nastiness avoids having
     * to do slow array concats or ugly looped pushes in makeLinks.
     */
    function makeLinkProcess(node, nodesToTest) {
        var match;
        var emailMatch;
        var urlMatch;
        var prefix;

        function applyRegex(prefix) {
            var endOfNode;
            var nodeWithoutStart;
            if (match.index) {
                nodeWithoutStart = node.splitText(match.index);
                node && nodesToTest.push(node);
                node = nodeWithoutStart;
            }
            endOfNode = node.splitText(match[0].length);
            endOfNode && nodesToTest.push(endOfNode);
            $(node).wrap("<a href='" + prefix + node.data + "'></a>");
        }

        emailMatch = EMAIL_REGEX.exec(node.data);
        urlMatch = URL_REGEX.exec(node.data);

        // foo.com.au matches as url so we need to check match as email first.
        if (emailMatch) {
            match = emailMatch;
            prefix = 'mailto:';
            applyRegex(prefix);
        } else if (urlMatch) {
            match = urlMatch;
            prefix = match && match[0].indexOf('://') === -1 ? 'http://' : '';
            applyRegex(prefix);
        }
    }

    function makeLinks(node) {
        var nodesToTest = $.makeArray(node.childNodes);
        var currentNode;

        while (nodesToTest.length) {
            currentNode = nodesToTest.pop();
            if (!$(currentNode).is("a")) {
                if (currentNode.nodeType === 3) {
                    makeLinkProcess(currentNode, nodesToTest);
                } else if (currentNode.nodeType === 1 && currentNode.childNodes && currentNode.nodeName.toLowerCase() !== "pre") {
                    nodesToTest = nodesToTest.concat($.makeArray(currentNode.childNodes));
                }
            }
        }
    }

    //CONFDEV-43284
    function removeBlacklistAttribute(element) {
        var blackListRule = [];
        blackListRule.push({
            elements: ["div"],
            attribute: "class",
            blackValue: "aui-buttons"
        });
        for (var i = 0; i < blackListRule.length; i++) {
            var rule = blackListRule[i];
            for (var j = 0; j < rule.elements.length; j++) {
                var $items = $(element).find(rule.elements[j] + '[' + rule.attribute + ']');
                for (var k = 0; k < $items.length; k++) {
                    var attValue = $items.eq(k).attr(rule.attribute);
                    attValue = attValue.replace(rule.blackValue, '');
                    $items.eq(k).attr(rule.attribute, attValue);
                }
            }
        }
    }

    $(document).bind('postPaste', function(e, pl, o) {
        filterAttributes(o.node, 'style,src,href');
        removeBlacklistAttribute(o.node);

        filterNodes(o.node);
        if (!$.browser.msie) { //IE does this for us automatically
            makeLinks(o.node);
        }

        //If we are in firefox and the only tags in the paste are <br> tags then lets fix up the
        //formatting so we are not pasting in one giant paragraph
        if ($.browser.mozilla && isPlainText(o.node) && !isInPlainTextMacro() ) {
            processPlainText(o.node);
        }
    });

    return {
        URL: URL_REGEX,
        EMAIL: EMAIL_REGEX
    };
});

require('confluence/module-exporter').exportModuleAsGlobal('confluence-editor/tinymce3/plugins/confluencepaste/post-paste-node-filter', 'Confluence.Editor.regex');
