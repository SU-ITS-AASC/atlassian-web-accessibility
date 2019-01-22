/**
 * @module confluence-editor/wiki-autoformat
 */
define('confluence-editor/wiki-autoformat', [
    'ajs',
    'jquery',
    'document',
    'window'
], function(
    AJS,
    $,
    document,
    window
) {
    "use strict";

    var WikiAutoformat = function (jQueryEvent, data) {

        var tinymce = require('tinymce');

        var rangeAfterAutoFormat;

        if (AJS.Meta.get('remote-user') && AJS.Meta.get('confluence.prefs.editor.disable.autoformat')) {
            return; //autoformat enabled by default and for anon-users
        }

        function encodeDomNode(domNode){
            return $('<div>').append( domNode.cloneNode(true) ).html();
        }
        function getStartContainer(lengthOfMatch, currentTextNode, currentOffset) {
            var siblingParent;
            var siblingIndex;
            if (!currentTextNode) {
                throw new Error("text node is null");
            }
            if (currentTextNode.nodeType !== 3) {
                currentTextNode = currentTextNode.childNodes[currentOffset - 1];
                currentOffset = currentTextNode.length;
            }

            for (var ps = currentTextNode, runningOffset = currentOffset; ps && ps.nodeType === 3; ps = ps.previousSibling) {
                if (runningOffset == -1) {
                    runningOffset = ps.nodeValue.length;
                }

                if (runningOffset > lengthOfMatch) {
                    return {
                        container: ps,
                        offset: runningOffset - lengthOfMatch
                    };
                } else if (runningOffset == lengthOfMatch) {
                    siblingIndex = 0;
                    siblingParent = ps.parentNode;
                    while (ps = ps.previousSibling) {
                        siblingIndex++;
                    }
                    return {
                        container: siblingParent,
                        offset: siblingIndex
                    };
                } else {
                    lengthOfMatch -= runningOffset;
                    runningOffset = -1;
                }
            }

            return null;
        }

        /**
         * Assuming | is the caret marker the caret could be positioned as such:
         * <p><textNode>content of text node|</textNode></p>
         *                                  ^
         * or (less obviously) as such:
         * <p><textNode>content of text node</textNode>|</p>
         *                                             ^
         */
        function getTextFromPreviousSiblingTextNodes(range) {
            var currentNode;
            var currentOffset;
            if (!range || !range.collapsed) {
                throw new Error("range is null or not collapsed");
            }
            currentNode = range.startContainer;
            currentOffset = range.startOffset;

            if (currentNode.nodeType === 1 && currentOffset > 0) {
                //descend into the relevent child node
                currentNode = currentNode.childNodes[range.startOffset - 1];
                if (currentNode.nodeType === 3) {
                    //It's a text node so we'll use it.
                    currentOffset = currentNode.nodeValue.length;
                } else {
                    //We're working under the assumption that the start container will never be
                    // higher than textnode.parentNode.
                    return "";
                }
            } else if (currentNode.nodeType !== 3) {
                //not a text node or element, we can assume "".
                return "";
            }

            var result = currentNode.nodeValue.substring(0, currentOffset);

            for (var ps = currentNode.previousSibling; ps && ps.nodeType === 3; ps = ps.previousSibling) {
                result = ps.nodeValue + result;
            }

            return result;
        }


        function createHandler(regex, fragmentCreator, swallowTriggerChar, containerFilter) {
            return {
                handles: function (ed) {
                    var result = false;
                    var range = ed.selection.getRng(true);
                    var candidateTextNode = range.commonAncestorContainer || {};

                    if (!range.collapsed) {
                        return false;
                    }

                    // CONFDEV-4376: Autoformat should be disabled in preformatted text.
                    if ($(candidateTextNode).closest("pre,.text-placeholder").length) {
                        return false;
                    }

                    if (containerFilter && $(candidateTextNode).closest(containerFilter).length) {
                        return false;
                    }

                    result = regex.test(getTextFromPreviousSiblingTextNodes(range));

                    return result;
                },
                execute: function (ed, nativeEvent, jQueryEvent) {
                    var range;
                    var combinedText;
                    var matchGroups;
                    var matchGroupsOffset = 1;
                    var startContainerData;
                    var commonAncestor;
                    var charCode = getCharCode(nativeEvent);

                    if (charCode === 32) {
                        ed.execCommand('mceInsertContent', false, '&nbsp;'); //spaces don't stick around for undos (it's tragic, I know)
                    } else {
                        ed.execCommand('mceInsertContent', false, String.fromCharCode(charCode));
                    }
                    ed.undoManager.beforeChange();
                    ed.undoManager.add();

                    range = ed.selection.getRng(true);
                    combinedText = getTextFromPreviousSiblingTextNodes(range);

                    //CONFDEV-4771 Just for tables, add a space at the end and change the offset for matchGroups
                    //This fixes and IE8 issue where the table autoformat didn't always work
                    if(combinedText[combinedText.length-1] == '|') {
                        combinedText += ' ';
                        matchGroupsOffset = 0;
                    }

                    matchGroups = regex.exec(combinedText.substring(0, combinedText.length-1)); // regexes need to work for handles() where trigger character has not been appended
                    startContainerData = getStartContainer(matchGroups[1].length+matchGroupsOffset, range.commonAncestorContainer, range.startOffset);
                    range.setStart(startContainerData.container, startContainerData.offset);
                    commonAncestor = $(range.commonAncestorContainer);
                    ed.selection.setRng(range); //we have to set the editors selection now that we have modified the range to have text selected

                    if (commonAncestor.closest(".wysiwyg-macro-body").length && range.toString() == commonAncestor.text()){
                        //if the entire text of container node is selected and we're in a macro, don't let let the macro get deleted
                        commonAncestor[0].innerHTML = "<br>";
                        ed.selection.select(commonAncestor[0].childNodes[0]);
                        ed.selection.collapse(true);//mceInsertContent throws an exception when only <br> is selected
                    } else {
                        //else delete the selection since the area will be kept cursor targetable by whatever else is there.
                        ed.execCommand('delete', false, {}, {skip_undo: true});
                    }

                    fragmentCreator(matchGroups, ed.selection.getRng(true));
                    rangeAfterAutoFormat = ed.selection.getRng(true);

                    if (swallowTriggerChar) {
                        jQueryEvent.preventDefault();
                        jQueryEvent.stopPropagation();
                        tinymce.dom.Event.cancel(nativeEvent);
                        // CONFDEV-2503 - cancelling the event stops the browser from scrolling to the new content
                        // so manually scroll there.
                        AJS.Rte.showElement(rangeAfterAutoFormat.startContainer);
                        return false;
                    }
                }
            };
        }

        function getCharCode (nativeEvent) {
            return $.browser.msie ? nativeEvent.keyCode : nativeEvent.which;
        }

        function HandlerManager () {
            this.handlers = {};
        }
        HandlerManager.prototype = {
            registerHandler: function (triggerCharCode, handler) {
                if (!this.handlers[triggerCharCode]) {
                    this.handlers[triggerCharCode] = [];
                }

                this.handlers[triggerCharCode].push(handler);
            },
            executeHandlers: function (triggerCharCode, ed, nativeEvent, jQueryEvent) {
                var result = true;
                $.each(this.handlers[triggerCharCode] || [], function (i, handler) {
                    if (handler.handles(ed)) {
                        result = handler.execute(ed, nativeEvent, jQueryEvent);
                        return false; // signal end of iteration
                    }
                });

                return result;
            }
        };

        var ed = data.editor;
        var handlerManager = new HandlerManager();

        /* Emoticons */

        /** Create an Emoticon object and register it with the handlerManager */
        function Emoticon(triggerChar, handlerRegex, emoticon, title, image, secret) {
            var triggerCharCode = triggerChar.charCodeAt(0);
            var imagePath = AJS.Rte.getResourceUrlPrefix() + "/images/icons/emoticons/" + image;
            var handler;

            handler = createHandler(handlerRegex, function() {
                var img = ed.dom.createHTML("img", {
                    "src" : imagePath,
                    "alt" : ed.getLang(title),
                    "title" : ed.getLang(title),
                    "border" : 0,
                    "class" : "emoticon emoticon-" + emoticon,
                    "data-emoticon-name" : emoticon
                });
                ed.execCommand('mceInsertContent', false, img, {skip_undo: true});
            }, true);
            this.imagePath = imagePath;
            handlerManager.registerHandler(triggerCharCode, handler);
        }

        var emoticons = [
            new Emoticon(")", WikiAutoformat.regularExpressions._REGEXES_EMOTICON.SMILE, "smile", "emotions_dlg.smile", "smile.svg"),
            new Emoticon("(", WikiAutoformat.regularExpressions._REGEXES_EMOTICON.SAD, "sad", "emotions_dlg.sad", "sad.svg"),
            new Emoticon("P", WikiAutoformat.regularExpressions._REGEXES_EMOTICON.CHEEKY, "cheeky", "emotions_dlg.tongue", "tongue.svg"),
            new Emoticon("p", WikiAutoformat.regularExpressions._REGEXES_EMOTICON.CHEEKY_2, "cheeky", "emotions_dlg.tongue", "tongue.svg"),
            new Emoticon("D", WikiAutoformat.regularExpressions._REGEXES_EMOTICON.LAUGH, "laugh", "emotions_dlg.biggrin", "biggrin.svg"),
            new Emoticon(")", WikiAutoformat.regularExpressions._REGEXES_EMOTICON.WINK, "wink", "emotions_dlg.wink", "wink.svg"),
            new Emoticon(")", WikiAutoformat.regularExpressions._REGEXES_EMOTICON.THUMBS_UP, "thumbs-up", "emotions_dlg.thumbs_up", "thumbs_up.svg"),
            new Emoticon(")", WikiAutoformat.regularExpressions._REGEXES_EMOTICON.THUMBS_DOWN, "thumbs-down", "emotions_dlg.thumbs_down", "thumbs_down.svg"),
            new Emoticon(")", WikiAutoformat.regularExpressions._REGEXES_EMOTICON.INFORMATION, "information", "emotions_dlg.information", "information.svg"),
            new Emoticon(")", WikiAutoformat.regularExpressions._REGEXES_EMOTICON.TICK, "tick", "emotions_dlg.check", "check.svg"),
            new Emoticon(")", WikiAutoformat.regularExpressions._REGEXES_EMOTICON.CROSS, "cross", "emotions_dlg.error", "error.svg"),
            new Emoticon(")", WikiAutoformat.regularExpressions._REGEXES_EMOTICON.WARNING, "warning", "emotions_dlg.warning", "warning.svg"),
            new Emoticon(")", WikiAutoformat.regularExpressions._REGEXES_EMOTICON.PLUS, "plus", "emotions_dlg.add", "add.svg"),
            new Emoticon(")", WikiAutoformat.regularExpressions._REGEXES_EMOTICON.MINUS, "minus", "emotions_dlg.forbidden", "forbidden.svg"),
            new Emoticon(")", WikiAutoformat.regularExpressions._REGEXES_EMOTICON.QUESTION, "question", "emotions_dlg.help_16", "help_16.svg"),
            new Emoticon(")", WikiAutoformat.regularExpressions._REGEXES_EMOTICON.LIGHT_ON, "light-on", "emotions_dlg.lightbulb_on", "lightbulb_on.svg"),
            new Emoticon(")", WikiAutoformat.regularExpressions._REGEXES_EMOTICON.LIGHT_OFF, "light-off", "emotions_dlg.lightbulb", "lightbulb.svg"),
            new Emoticon(")", WikiAutoformat.regularExpressions._REGEXES_EMOTICON.YELLOW_STAR, "yellow-star", "emotions_dlg.star_yellow", "star_yellow.svg"),
            new Emoticon(")", WikiAutoformat.regularExpressions._REGEXES_EMOTICON.YELLOW_STAR_2, "yellow-star", "emotions_dlg.star_yellow", "star_yellow.svg"),
            new Emoticon(")", WikiAutoformat.regularExpressions._REGEXES_EMOTICON.RED_STAR, "red-star", "emotions_dlg.star_red", "star_red.svg"),
            new Emoticon(")", WikiAutoformat.regularExpressions._REGEXES_EMOTICON.GREEN_STAR, "green-star", "emotions_dlg.star_green", "star_green.svg"),
            new Emoticon(")", WikiAutoformat.regularExpressions._REGEXES_EMOTICON.BLUE_STAR, "blue-star", "emotions_dlg.star_blue", "star_blue.svg"),
            new Emoticon("3", WikiAutoformat.regularExpressions._REGEXES_EMOTICON.HEART, "heart", "emotions_dlg.heart", "heart.svg"),
            new Emoticon("3", WikiAutoformat.regularExpressions._REGEXES_EMOTICON.BROKEN_HEAR, "broken-heart", "emotions_dlg.broken_heart", "broken_heart.svg")
        ];

        var i;

        // Preload the emoticon images for faster auto-complete response
        var emoticonImages = [];
        for (i=0; i < emoticons.length; i++) {
            emoticonImages[i] = new window.Image();
            emoticonImages[i].src = emoticons[i].imagePath;
        }

        /* End Emoticons */
        function formatInlineText (inlineFormat, content) {
            var format = ed.formatter.get(inlineFormat)[0];
            var domNode = ed.dom.create(format.inline, {style: format.styles});
            domNode.appendChild(document.createTextNode(content + "{$caret}"));
            ed.execCommand('mceInsertContent', false, encodeDomNode(domNode), {skip_undo: true});
            ed.formatter.remove(inlineFormat); //disable the format so that typing after doesn't come out formatted
        }

        //add handlers for common inline wikimarkup styling
        var handlerFormatMap = {'*':'bold', '_':'italic', '~':'subscript', '^':'superscript', '+':'underline', '-':'strikethrough'};
        $.each(handlerFormatMap, function(handler, format){
            var regex = new RegExp('(?:[\\s\\xA0\\u200b\\uFEFF]+|^)(\\' + handler + '(?=[^\\s' + handler + '])([^' + handler + ']*?[^\\s]))$'); //\\xA0 is &nbsp; which is used in ie to create cursor targets
            handlerManager.registerHandler(handler.charCodeAt(0), createHandler(regex, function (matchGroups) { // require a space before asterisk to handle people using asterisk to denote footnotes
                formatInlineText(format, matchGroups[2]);
            }, true));
        });

        //register the code element with tiny's text formatter engine (move this into tinymce.init config)
        ed.formatter.register('code', {inline : 'code'});
        handlerManager.registerHandler("}".charCodeAt(0), createHandler(/(?:[\s\xA0\u200b]+|^)({{(?=[^\s])([^}]*?[^\s])})$/, function (matchGroups) {
            formatInlineText('code', matchGroups[2]);
        }, true));

        //headers h1-h6
        for (i = 1; i <= 6; i++) {
            (function (count) {
                handlerManager.registerHandler(" ".charCodeAt(0), createHandler(new RegExp("^\\u200b?(h" + count + "\\.)$"), function () {
                    ed.execCommand('formatBlock', false, 'h' + count, {skip_undo: true});
                }, true));
            })(i);
        }

        handlerManager.registerHandler(" ".charCodeAt(0), createHandler(/^\u200b?(bq\.)$/, function () {
            ed.execCommand('formatBlock', false, 'blockquote', {skip_undo: true});
        }, true));

        handlerManager.registerHandler(" ".charCodeAt(0), createHandler(/^\u200b?(\*)$/, function () {
            ed.plugins.lists.applyList('UL', 'OL');
        }, true));

        handlerManager.registerHandler(" ".charCodeAt(0), createHandler(/^\u200b?(\#)$/, function () {
            ed.plugins.lists.applyList('OL', 'UL');
        }, true));

        handlerManager.registerHandler(" ".charCodeAt(0), createHandler(/^\u200b?(1\.)$/, function () {
            ed.plugins.lists.applyList('OL', 'UL');
        }, true));

        handlerManager.registerHandler(" ".charCodeAt(0), createHandler(/^\u200b?(\-)$/, function () {
            var dom = ed.dom;
            var list;
            ed.plugins.lists.applyList('UL', 'OL');
            list = dom.getParent(ed.selection.getNode(), 'OL,UL');
            if (list) {
                dom.setStyles(list, {listStyleType:'square'});
                list.removeAttribute('data-mce-style');
            }
        }, true));

        AJS.trigger("confluence.editor.registerHandlers", {handlerManager: handlerManager, createHandler: createHandler, ed: ed});
        /**
         * Handle "->" to be an arrow for left and right or both.
         */

        var bothArrowHandler = createHandler(/((\<\-\-?\>)([^\s-]*))$/, function (matchGroups) {
            var bothArrow = "\u2194";
            ed.execCommand('mceInsertContent', false, bothArrow + matchGroups[3], {skip_undo: true});
        }, false);
        handlerManager.registerHandler(" ".charCodeAt(0), bothArrowHandler);
        handlerManager.registerHandler(13, bothArrowHandler);

        var rightArrowHandler = createHandler(/((\-\-?\>)([^\s-]*))$/, function (matchGroups) {
            var rightArrow = "\u2192";
            ed.execCommand('mceInsertContent', false, rightArrow + matchGroups[3], {skip_undo: true});
        }, false);
        handlerManager.registerHandler(" ".charCodeAt(0), rightArrowHandler);
        handlerManager.registerHandler(13, rightArrowHandler);

        var leftArrowHandler = createHandler(/((\<\-\-?)([^\s-]*))$/, function (matchGroups) {
            var leftArrow = "\u2190";
            ed.execCommand('mceInsertContent', false, leftArrow + matchGroups[3], {skip_undo: true});
        }, false);
        handlerManager.registerHandler(" ".charCodeAt(0), leftArrowHandler);
        handlerManager.registerHandler(13, leftArrowHandler);

        /**
         * Handle em and en dashes where there are surrounding spaces
         */
        handlerManager.registerHandler(" ".charCodeAt(0), createHandler(/[^-]*[\s](\-\-\-?)$/, function (matchGroups) {
            var dash = matchGroups[1].length === 2 ? "\u2013" : "\u2014";
            ed.execCommand('mceInsertContent', false, dash, {skip_undo: true});
        }, false));
        /**
         * Handle em and en dashes with words on either side of the dashes. Delay the autoformat until a space or enter is
         * pressed after the last word has been typed. That is, for "foo--bar", only trigger when a space or enter is
         * pressed after "bar".
         */
        var dashHandler = createHandler(/(([^\s-]+)(\-\-\-?)([^\s-]+))$/, function (matchGroups) {
            var dash = matchGroups[3].length === 2 ? "\u2013" : "\u2014";
            ed.execCommand('mceInsertContent', false, matchGroups[2] + dash + matchGroups[4], {skip_undo: true});
        }, false);
        handlerManager.registerHandler(" ".charCodeAt(0), dashHandler);
        handlerManager.registerHandler(13, dashHandler);

        var hrHandler = createHandler(/^\u200b?(\-\-\-\-)$/, function () {
            ed.execCommand('mceInsertContent', false, '<hr />', {skip_undo: true});
        }, true);

        handlerManager.registerHandler(" ".charCodeAt(0), hrHandler);
        handlerManager.registerHandler(13, hrHandler);

        handlerManager.registerHandler(13, createHandler(/(^\u200b?\|\|\s*(?:[^|]*\s?\|\|\s?)+$)/, function (matchGroups) {
            var tableMarkup = "<table class='confluenceTable'><tr>";
            var tableRows = "";
            var cellsEmpty = true;
            var cellWords = $(matchGroups[1].slice(2,-2).split('||')).map(function(cellWord){
                cellWord = $.trim(this);
                cellsEmpty = cellsEmpty && cellWord == "";
                return cellWord;
            });
            if (cellsEmpty) {
                cellWords[0] = AJS.I18n.getText("editor.autoformat.sampletext.firstcell");
            }

            for (var k = 0, l = cellWords.length; k < l; k++) {
                tableMarkup += "<th class='confluenceTh'>" + cellWords[k] + "</th>";
                tableRows += "<td class='confluenceTd'>" + AJS.Rte.ZERO_WIDTH_WHITESPACE + "</td>";
            }
            tableMarkup += "</tr><tr>" + tableRows + "</tr></table>";
            ed.execCommand('mceInsertContent', false, tableMarkup, {skip_undo: true});
            ed.selection.select($(ed.selection.getRng(true).commonAncestorContainer).parents('table').find(cellsEmpty ? 'th' : 'td')[0].childNodes[0]);
            $(ed.selection.getRng().startContainer).parent().closest('[contenteditable="true"]').focus();
        }, true));

        handlerManager.registerHandler(13, createHandler(/(^\u200b?\|\s?(?:[^|]*\s?\|\s?)+$)/, function (matchGroups) {
            var tableMarkup = "<table class='confluenceTable'><tr>";
            var cellsEmpty = true;
            var cellWords = $(matchGroups[1].slice(1,-1).split('|')).map(function(cellWord){
                cellWord = $.trim(this);
                cellsEmpty = cellsEmpty && cellWord == "";
                return cellWord;
            });
            if (cellsEmpty) {
                cellWords[0] = AJS.I18n.getText('editor.autoformat.sampletext.firstcell');
            }
            for (var k = 0, l = cellWords.length; k < l; k++) {
                tableMarkup += "<td class='confluenceTd'>" + cellWords[k] + "</td>";
            }
            tableMarkup += "</tr></table>";
            ed.execCommand('mceInsertContent', false, tableMarkup, {skip_undo: true});
            cellsEmpty && ed.selection.select($(ed.selection.getRng(true).commonAncestorContainer).parents('table').find('td')[0].childNodes[0]);
            $(ed.selection.getRng().startContainer).parent().closest('[contenteditable="true"]').focus();
        }, true));

        var urlHandler = createHandler(/\b(((https?|ftp):\/\/|(www\.))[\w\.\$\-_\+!\*'\(\),/\?:@=&%#~;\[\]]+)$/, function (matchGroups) {
            //if a protocol is not provided, add http:// to the url.
            var url = matchGroups[3] ? matchGroups[1] : "http://" + matchGroups[1];
            var domNode = ed.dom.create('a', {href: url});
            domNode.appendChild(document.createTextNode(matchGroups[1]));
            ed.execCommand('mceInsertContent', false, encodeDomNode(domNode), {skip_undo: true});
            ed.getDoc().execCommand('unlink', false, {});
        }, false, 'a');
        handlerManager.registerHandler(" ".charCodeAt(0), urlHandler);
        handlerManager.registerHandler(13, urlHandler);

        var emailHandler = createHandler(
                /*eslint-disable max-len*/
                /\b((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)$/i,
                /*eslint-enable max-len*/
                function (matchGroups) {
                    var domNode = ed.dom.create('a', {href: 'mailto:' + matchGroups[1]});
                    domNode.appendChild(document.createTextNode(matchGroups[1]));
                    ed.execCommand('mceInsertContent', false, encodeDomNode(domNode), {skip_undo: true});
                    ed.getDoc().execCommand('unlink', false, {});
                }, false, 'a');
        handlerManager.registerHandler(" ".charCodeAt(0), emailHandler);
        handlerManager.registerHandler(13, emailHandler);

        var addQuickCorrect = function(regexLiteral, replacement) {
            var handler = createHandler(regexLiteral, function () {
                ed.execCommand('mceInsertContent', false, replacement, {skip_undo: true});
            }, false);
            handlerManager.registerHandler(" ".charCodeAt(0), handler);
            handlerManager.registerHandler(13, handler);
        };

        addQuickCorrect(/(?:\b|^)(jira)$/, "Jira");
        addQuickCorrect(/(?:\b|^)(bitbucket)$/, "Bitbucket");
        addQuickCorrect(/(?:\b|^)(atlassian)$/, "Atlassian");
        addQuickCorrect(/(?:\b|^)(hipchat)$/, "Hipchat");
        addQuickCorrect(/(?:\b|^)(statuspage)$/, "Statuspage");
        addQuickCorrect(/(?:\b|^)(sourcetree)$/, "Sourcetree");
        addQuickCorrect(/(?:\b|^)(trello)$/, "Trello");

        var WIKI_TRIGGER_TO_REGEX = {
            "]" : WikiAutoformat.regularExpressions._REGEXES.WIKI_LINK,
            "}" : WikiAutoformat.regularExpressions._REGEXES.WIKI_MACRO,
            "!" : WikiAutoformat.regularExpressions._REGEXES.WIKI_EMBED
        };
        $.each(WIKI_TRIGGER_TO_REGEX, function (trigger, regex) {
            handlerManager.registerHandler(trigger.charCodeAt(0), createHandler(regex, function (matchGroups, range) {
                var wiki = matchGroups[1] + trigger;
                var request = {
                    type : "POST",
                    contentType : "application/json; charset=utf-8",
                    url : AJS.Meta.get("context-path") + "/rest/tinymce/1/wikixhtmlconverter",
                    data : $.toJSON({
                        wiki : wiki,
                        entityId :  AJS.Meta.get("content-id"),
                        spaceKey : AJS.Meta.get("space-key"),
                        suppressFirstParagraph : true
                    }),
                    dataType : "text", // if this is switched back to json be sure to use "text json". See CONFDEV-4799 for details.
                    timeout : 5000
                };

                if (trigger == "}") {
                    tinymce.confluence.MacroUtils.insertMacro(request);
                } else if (trigger == "!") {
                    $.ajax(request).done(function (data) {
                        if (!wiki === data) {
                            tinymce.confluence.ImageUtils.insertImagePlaceholder(data);
                        }
                        else {
                            // insertImagePlaceholder doesn't handle unchanged text
                            ed.execCommand('mceInsertContent', false, data, {skip_undo: true});
                        }
                    });
                } else {
                    $.ajax(request).done(function (data) {
                        /**
                         * Skip undo here because the editor at this point is not in a state that we want to "undo" to.
                         * (specifically, the editor has just had the wiki text the user just typed in removed - in
                         * preparation for the insertion of the actual markup returned by the server.
                         */
                        ed.execCommand('mceInsertContent', false, data, {skip_undo: true});
                    });
                }

            }, true));
        });

        ed.onKeyPress.addToTop(function (ed, nativeEvent) {
            return handlerManager.executeHandlers(getCharCode(nativeEvent), ed, nativeEvent, jQueryEvent);
        });

        return {

        };
    };

    WikiAutoformat.regularExpressions = {
        /**
         * An internal map of regexes. Expose for testing.
         */
        _REGEXES : {
            WIKI_MACRO : /(?:\s|^)(\{[^{^}]+)$/,
            WIKI_LINK : /(?:\s|^)(\[[^\[^\]]+)$/,
            WIKI_EMBED : /(?:\s|^)(![^!]{5,})$/  // Wiki renderer says image names have to be at least 5 chars long
        },

        _REGEXES_EMOTICON: {
            SMILE: /\B(:-?)$/,
            SAD: /\B(:-?)$/,
            CHEEKY: /\B(:-?)$/,
            CHEEKY_2: /\B(:-?)$/,
            LAUGH: /\B(:-?)$/,
            WINK: /\B(;-?)$/,
            THUMBS_UP: /\B(\(y)$/,
            THUMBS_DOWN: /\B(\(n)$/,
            INFORMATION: /\B(\(i)$/,
            TICK: /\B(\(\/)$/,
            CROSS: /\B(\(x)$/,
            WARNING: /\B(\(!)$/,
            PLUS: /\B(\(\+)$/,
            MINUS: /\B(\(-)$/,
            QUESTION: /\B(\(\?)$/,
            LIGHT_ON: /\B(\(on)$/,
            LIGHT_OFF: /\B(\(off)$/,
            YELLOW_STAR: /\B(\(\*)$/,
            YELLOW_STAR_2: /\B(\(\*y)$/,
            RED_STAR: /\B(\(\*r)$/,
            GREEN_STAR: /\B(\(\*g)$/,
            BLUE_STAR: /\B(\(\*b)$/,
            HEART: /\B(<)$/,
            BROKEN_HEAR: /\B(<\/)$/
        }
    };

    return WikiAutoformat;
});

require('confluence/module-exporter').safeRequire('confluence-editor/wiki-autoformat', function(WikiAutoformat) {
    require('confluence/module-exporter').namespace("AJS.Rte.autoformat", WikiAutoformat.regularExpressions);
    require('ajs').bind("init.rte", WikiAutoformat);
});
