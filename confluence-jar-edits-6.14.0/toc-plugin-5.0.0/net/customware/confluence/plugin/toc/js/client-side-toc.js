require([
            'ajs'
        ],
        function (AJS) {
            AJS.toInit(function ($) {

                function dummyElement(precedenceLevel) {
                    var $element = $({});
                    $element.data('precedenceLevel', precedenceLevel);
                    return $element;
                }

                function getPrecedenceLevel(element) {
                    return $(element).data('precedenceLevel');
                }

                function setPrecedenceLevel(element, precedenceLevel) {
                    $(element).data('precedenceLevel', precedenceLevel);
                    return element;
                }

                function hasPrecedenceLevel(element, precedenceLevel) {
                    return precedenceLevel === getPrecedenceLevel(element);
                }

                /**
                 * Builds a table of contents based on the supplied list of elements.
                 * @param elementsArray The HTML elements to derive the TOC from. Each element is expected to have been pre-populated
                 * with a tocLevel data attribute which indicates its relative position in the TOC hierarchy.
                 * @param elementFactory Used to instantiate the various HTML elements used to build the TOC
                 * @param parentOutline The outline inherited from the parent TOC level
                 */
                function buildTocTree(elementsArray, elementFactory, parentOutline) {
                    if (elementsArray.length === 0) {
                        return $();
                    }

                    var highestElementPrecedence = elementsArray
                            .map(getPrecedenceLevel)
                            .reduce(function (a, b) {
                                return Math.min(a, b);
                            });

                    // Make sure the first element in the list matches the highest precedence level.
                    // If it doesn't, then prepend the list with a synthetic blank element that does.
                    // With properly-structured document headers this shouldn't be necessary, but we need to guard against wacky data.
                    if (!hasPrecedenceLevel(elementsArray[0], highestElementPrecedence)) {
                        elementsArray.unshift(dummyElement(highestElementPrecedence));
                    }

                    var currentList = elementFactory.createTocLevelContainer();

                    // This buffers up "sub-headers" of the current TOC level until they need to be written out as a sub-toc
                    var subListBuffer = {
                        subElements: [],
                        currentItem: undefined,
                        outline: undefined,

                        flush: function () {
                            if (this.subElements.length > 0 && this.currentItem) {
                                buildTocTree(this.subElements, elementFactory, this.outline).appendTo(this.currentItem);
                                this.subElements = [];
                            }
                        },

                        add: function (element) {
                            this.subElements.push(element);
                        },

                        resetItem: function (currentOutlineItem) {
                            this.outline = (parentOutline || []).slice(0);
                            this.outline.push(currentOutlineItem);

                            this.currentItem = elementFactory.createTocItemContainer();
                            this.currentItem.appendTo(currentList);
                            return this.currentItem;
                        }
                    };

                    var outlineCounter = 0;

                    elementsArray.forEach(function (element) {
                        if (hasPrecedenceLevel(element, highestElementPrecedence)) {
                            outlineCounter++;
                            subListBuffer.flush();
                            subListBuffer.resetItem(outlineCounter);
                            if (element.textContent) {
                                createTocItemBody(element, subListBuffer.outline.join('.'))
                                        .appendTo(subListBuffer.currentItem);
                            } else {
                                subListBuffer.currentItem.addClass('toc-empty-item');
                            }
                        } else {
                            subListBuffer.add(element);
                        }
                    });
                    subListBuffer.flush();

                    if (parentOutline.length === 0 && elementFactory.decorateToc) {
                        elementFactory.decorateToc(currentList);
                    }

                    return currentList;
                }

                /**
                 * Creates an HTML element representing a single item in the TOC, including outline level and a link.
                 */
                function createTocItemBody(element, outline) {
                    return $(Confluence.Plugins.TableOfContents.Client.tocItemBody({
                        outline: outline,
                        linkHref: '#' + element.id,
                        linkText: element.textContent
                    }));
                }

                /**
                 * Creates HTML elements for use in building a flat-style TOC
                 */
                function flatTocElementFactory(config) {
                    return {
                        createTocLevelContainer: function () {
                            return this.createTocItemContainer();
                        },
                        createTocItemContainer: function () {
                            return $(Confluence.Plugins.TableOfContents.Client.flatStyleTocItemContainer({cssClass: 'toc-item-container'}));
                        },
                        decorateToc: function (tocElement) {
                            function appendSeparator(configKey, defaultValue) {
                                var separator = configKey in config ? config[configKey] : defaultValue;
                                if (separator) {
                                    var $separatorElement = $(Confluence.Plugins.TableOfContents.Client.flatStyleTocSeparator({
                                        separator: separator
                                    }));
                                    $separatorElement.appendTo(tocElement);
                                }
                            }

                            // At this point the various to items are in nested spans, so to be tidy we want to flatten those out.
                            // We pick each item out of the DOM tree and move it to the top level of the TOC node, decorating them
                            // with pre/mid/post separators as we go
                            appendSeparator('preseparator', '[ ');

                            $(tocElement).find('span.toc-item-body').each(function (idx, element) {
                                if (idx > 0) appendSeparator('midseparator', ' ] [ ');
                                $(element).appendTo(tocElement);
                            });

                            appendSeparator('postseparator', ' ]');

                            // Finally we remove all of the intermediate spans that are now empty
                            $(tocElement).find('.toc-item-container').remove();
                        }
                    };
                }

                /**
                 * Creates HTML elements for use in building a list-style TOC
                 */
                function listTocElementFactory(config) {
                    return {
                        createTocLevelContainer: function () {
                            return $(Confluence.Plugins.TableOfContents.Client.listStyleTocLevelContainer({
                                cssliststyle: config['cssliststyle'],
                                csslistindent: config['csslistindent']
                            }));
                        },
                        createTocItemContainer: function () {
                            return $(Confluence.Plugins.TableOfContents.Client.listStyleTocItemContainer());
                        }
                    };
                }

                function headerRegexFilter(config) {
                    var includeRegex;
                    if (config['includeheaderregex']) includeRegex = new RegExp(config['includeheaderregex']);
                    var excludeRegex;
                    if (config['excludeheaderregex']) excludeRegex = new RegExp(config['excludeheaderregex']);

                    return function () {
                        var headerText = $(this).text();
                        if (includeRegex && !includeRegex.test(headerText)) {
                            return false;
                        }
                        if (excludeRegex && excludeRegex.test(headerText)) {
                            return false;
                        }
                        return true;
                    }
                }

                /**
                 * Builds a table of contents based on the current page content's header elements.
                 */
                function buildTocTreeFromHeaders(elementFactory, config) {
                    var headerElementsSelector = config['headerelements'];
                    var elementPrecedence = headerElementsSelector.split(',');
                    var regexFilter = headerRegexFilter(config);

                    var headerElements = $("#main-content")
                            .find(headerElementsSelector)
                            .filter(regexFilter)
                            .each(function () {
                                setPrecedenceLevel(this, elementPrecedence.indexOf(this.nodeName))
                            })
                            .toArray();

                    return buildTocTree(headerElements, elementFactory, []);
                }

                $(".client-side-toc-macro").each(function () {
                    var $tocContainer = $(this);
                    var config = $tocContainer.data() || {};

                    var elementFactory;
                    if (config['structure'] === 'flat') {
                        elementFactory = flatTocElementFactory(config);
                    } else {
                        elementFactory = listTocElementFactory(config);
                    }

                    if (config['numberedoutline'] !== true) {
                        $tocContainer.addClass('hidden-outline');
                    }

                    $tocContainer.html(buildTocTreeFromHeaders(elementFactory, config));
                });
            });
        }
);