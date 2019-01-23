(function() {

    var MobileMacroHelper = function(jz) {
        this.$ = jz;
        var $ = this.$;

        var MAX_DEPTH = 999;
        var MODE_EXPAND = true;
        var MODE_COLLAPSE = false;

        var treeRequests = {};
        var targetPages = {};

        /**
         * mode: true=expand, false=collapse
         */
        var toggleChild = function (id, mode, startDepth, clearStatusMessage, mobile) {
            // if no mode is set, toggle current mode
            if (mode == undefined || mode == null)
                mode = !getMode(id);

            //if no startDepth is set, default to zero
            if (startDepth == undefined || startDepth == null)
                startDepth = 0;

            // execute only if current state is different with target mode
            if (!isSimilarState(id, mode)) {
                var childrenDiv = $("#children" + id);
                if (hasChild(childrenDiv)) {
                    // toggle images
                    var link = $("#plusminus" + id);
                    if (mode == MODE_EXPAND) {
                        link.removeClass("aui-iconfont-chevron-right").addClass("aui-iconfont-chevron-down");
                    } else {
                        link.removeClass("aui-iconfont-chevron-down").addClass("aui-iconfont-chevron-right");
                    }

                    if (mode == MODE_EXPAND) {
                        if(mobile == false)
                        {
                            childrenDiv.slideDown(300);
                        }
                        else
                        {
                            childrenDiv.removeClass("plugin-pagetree-hide-children");
                            childrenDiv.animate({opacity:1});
                        }
                    }
                    else {
                        if(mobile == false)
                        {
                            childrenDiv.slideUp(300);
                        }
                        else
                        {
                            childrenDiv.animate({opacity:0}, {
                                complete : function() {
                                    childrenDiv.addClass("plugin-pagetree-hide-children");
                                }
                            });
                        }

                    }
                    if (clearStatusMessage)
                        finishLoadingMessage(id);

                } else {
                    loadChildren(id, new Array(), startDepth, "", clearStatusMessage, mobile);
                }
            }

            if (clearStatusMessage) {
                finishLoadingMessage(id);
            }
        };

        /**
         * returns true if the given <div> element has a <ul> child node.
         */
        var hasChild = function(childDiv) {
            return childDiv.children("ul[id]").length > 0;
        };

        /**
         * returns true if tree is already expanded, and false if it is already collapsed
         */
        var getMode = function(id) {
            var icon = $("#plusminus" + id);

            return (icon.length > 0)
                ? (icon.hasClass("icon-minus") || icon.hasClass("aui-iconfont-chevron-down"))
                : MODE_COLLAPSE;
        };

        var isSimilarState = function(id, mode) {
            return getMode(id) == mode;
        };

        var expandAll = function(id, e, mobile) {
            doExpandCollapseAll(id, MODE_EXPAND, e, mobile);
        };

        var collapseAll = function(id, e, mobile) {
            doExpandCollapseAll(id, MODE_COLLAPSE, e, mobile);
        };

        /**
         * mode: true=expand, false=collapse
         */
        var doExpandCollapseAll = function(id, mode, e, mobile) {
            startLoadingMessage(id);
            var containerDiv = $("#" + id);
            var childDivs = containerDiv.find("div.plugin_pagetree_children_container");

            childDivs.each(
                function(index) {
                    var childId = getIdFromElementName(this.id);
                    // check if last item before removing the loading message
                    toggleChild(childId, mode, MAX_DEPTH, index == childDivs.length - 1, mobile);
                }
            );
            e.preventDefault();
            e.stopPropagation();
        };

        /**
         * name would be in a format like "children393219-1" or "plusminus393219-1".
         * This function would just extract the "393219-1" part and return it.
         */
        var getIdFromElementName = function(name) {
            if (!name || name == undefined) return null;

            if (name.indexOf("plusminus") != -1) return name.substring("plusminus".length);
            if (name.indexOf("children") != -1) return name.substring("children".length);
            return null;
        };

        /**
         * elementId would be in a format like "393219-1".
         * This function would just extract the "1" part and return it.
         */
        var getTreeIdFromElementId = function(elementId) {
            if (!elementId || elementId == undefined) return null;

            // split the elementId and return the pageId
            return parseId(elementId)[1];
        };

        /**
         * elementId would be in a format like "393219-1".
         * This function would just return an array with format ["393219", "1"]
         */
        var parseId = function(elementId) {
            if (!elementId || elementId == undefined) return null;

            // split the elementId and return the pageId
            return elementId.split("-");
        };

        var startLoadingMessage = function(id) {
            var treeId = getTreeIdFromElementId(id);

            $("div.plugin_pagetree").each(
                function(pagetreeId) {
                    if (pagetreeId == treeId) {
                        $(this).find("span.plugin_pagetree_status").removeClass("hidden");
                        $(this).find("div.plugin_pagetree_expandcollapse").addClass("hidden");
                    }
                }
            );
        };

        var finishLoadingMessage = function(id) {
            var treeId = getTreeIdFromElementId(id);

            $("div.plugin_pagetree").each(
                function(pagetreeId) {
                    if (pagetreeId == treeId) {
                        $(this).find("span.plugin_pagetree_status").addClass("hidden");
                        $(this).find("div.plugin_pagetree_expandcollapse").removeClass("hidden");
                    }
                }
            );
        };

        var generateRequestString = function(treeId, pageId, ancestors, startDepth, spaceKey, treePageId, mobile) {
            var reqString = treeRequests[treeId];

            if (pageId == "Orphan")
                reqString += "&hasRoot=false&spaceKey=" + spaceKey;
            else
                reqString += "&hasRoot=true&pageId=" + pageId;

            reqString += "&treeId=" + treeId + "&startDepth=" + startDepth + "&mobile=" + mobile;

            $.each(ancestors, function() {
                reqString += "&ancestors=" + this;
            });

            reqString += "&treePageId=" + treePageId;

            if(mobile == false)
            {
                reqString = (AJS.params.serverUrl || "") + reqString;
            }

            return reqString;
        };

        var getPageTreeDiv = function(treeId) {
            var pagetreeId = treeId;
            var pagetreeDiv = null;

            $("div.plugin_pagetree").each(
                function(index) {
                    if (index == pagetreeId)
                        pagetreeDiv = $(this);
                }
            );

            return pagetreeDiv;
        };

        var getPageTreeParams = function(pagetreeDiv) {
            var paramsFieldSet = pagetreeDiv.children("fieldset");
            var params = new Object();

            if (paramsFieldSet.length > 0) {
                paramsFieldSet.children("input").each(function() {
                    params[this.name] = this.value;
                });
            }

            return params;
        };

        var getPageTreeAncestorIds = function(pagetreeDiv) {
            var paramsFieldSet = pagetreeDiv.children("fieldset");
            var ancestorIds = new Array();

            if (paramsFieldSet.length > 0) {
                var ancestorIdFieldset = paramsFieldSet.children("fieldset");
                if (ancestorIdFieldset.length > 0) {
                    ancestorIdFieldset.children("input").each(function() {
                        ancestorIds.push(this.value);
                    });
                }
            }

            return ancestorIds;
        };

        var makePlusMinusButtonsClickable = function (pagetreeChildrenDiv, mobile) {
            var expandIcon = $("a.plugin_pagetree_childtoggle", pagetreeChildrenDiv);
            expandIcon.each(
                function() {
                    var jQueryThis = $(this);

                    jQueryThis.attr("href", "#").bind("click" ,
                        function(e) {
                            var childDiv = jQueryThis.parent().parent().children("div.plugin_pagetree_children_container");
                            var childId = childDiv.attr("id");
                            var id = childId.substring(8);
                            toggleChild(id, null, null, null, mobile);
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    );
                }
            );
        };

        var isChildrenHtml = function(html) {
            var testDiv = $(document.createElement("div"));

            testDiv.html(html);
            return testDiv.find("ul[id^='child_ul']").length;
        };

        var loadChildren= function(rootPage, ancestorIds, startDepth, spaceKey, clearStatusMessage, mobile, delaySpinner) {
            var _rootPage = rootPage;
            var _clearStatusMesssage = clearStatusMessage;
            var ids = parseId(rootPage);
            var pageId = ids[0];
            var treeId = ids[1];
            var pagetreeChildrenDiv = $("#children" + rootPage);
            var pagetreeParams = getPageTreeParams(getPageTreeDiv(treeId));
            var requestComplete = false;

            function initSpinner() {
                pagetreeChildrenDiv.find('.plugin_pagetree_children_loading_wrapper .spinner').spin('small');
            }

            pagetreeChildrenDiv.append(Confluence.Templates.Pagetree.Macro.loadingIndicator());

            if (delaySpinner) {
                setTimeout(function () {
                    if (!requestComplete) {
                        initSpinner()
                    }
                }, 250);
            } else {
                initSpinner();
            }

            $.ajax({
                type : "GET",
                url :  generateRequestString(treeId, pageId, ancestorIds, startDepth, spaceKey, pagetreeParams["treePageId"], mobile),
                dataType : 'text',
                success : function(responseText) {
                    if (isChildrenHtml(responseText)) {
                        pagetreeChildrenDiv.html(responseText);
                        requestComplete = true;

                        // In IE, empty divs have height and it causes the UI to look like shit, which will be hidden by hideEmptyChildrenContainers() and unhidden here
                        if (pagetreeChildrenDiv.children().length && pagetreeChildrenDiv.hasClass("hidden"))
                            pagetreeChildrenDiv.removeClass("hidden");
                        makePlusMinusButtonsClickable(pagetreeChildrenDiv, mobile);

                        /* Make the + a - */
                        $("#plusminus" + _rootPage).addClass("aui-iconfont-chevron-down").removeClass("aui-iconfont-chevron-right");

                        /* Highlight target page if it exists */
                        $("#childrenspan" + targetPages[parseInt(treeId)] + "-" + treeId).addClass("plugin_pagetree_current");

                        if (_clearStatusMesssage)
                            finishLoadingMessage(_rootPage);


                        hideEmptyChildrenContainers(pagetreeChildrenDiv);
                        if (AJS.PageGadget && AJS.PageGadget.contentsUpdated) {AJS.PageGadget.contentsUpdated();}
                    } else {
                        window.location = pagetreeParams["loginUrl"];
                    }
                    AJS.trigger('pagetree-children-loaded');
                },
                error : function(request) {
                    if (request.status == "403") {
                        // PGTR-76 - If current user doesn't has view permission to the root page, the page will keep refreshing. To fix that, we'll be displaying a message.
                        pagetreeChildrenDiv.text(pagetreeParams["i18n-pagetree.error.permission"]);
                    } else {
                        pagetreeChildrenDiv.text(pagetreeParams["i18n-pagetree.error.general"]);
                    }
                }
            });
        };

        var hideEmptyChildrenContainers = function(pagetreeChildrenDiv) {
            $("div.plugin_pagetree_children_container:empty", pagetreeChildrenDiv).addClass("hidden");
        };

        var initPageTree = function(pagetreeDiv, pagetreeId) {
            var pagetreeParams = getPageTreeParams(pagetreeDiv);
            var noRoot = pagetreeParams["noRoot"] == "true";
            var rootPage =  noRoot ? "Orphan-" + pagetreeId : pagetreeParams["rootPageId"] + "-" + pagetreeId;
            var mobile = pagetreeParams["mobile"] == "true";

            treeRequests[pagetreeId] = pagetreeParams["treeRequestId"];

            if(mobile == false)
            {
                targetPages[pagetreeId] = AJS.params.pageId;
            }
            else
            {
                targetPages[pagetreeId] = $("div.content-container").parent().attr('data-content-id');
            }

            pagetreeDiv.children("fieldset").each(
                function() {
                    var jQueryThis = $(this);

                    jQueryThis.children("input[treeId]").attr("value", pagetreeId);
                    jQueryThis.children("input[rootPage]").attr("value", rootPage);
                }
            );

            if (noRoot) {
                pagetreeDiv.find("div.plugin_pagetree_children").attr("id", "childrenOrphan-" + pagetreeId);
                pagetreeDiv.find("a.plugin_pagetree_expandall").click(
                    function(e) {
                        expandAll("childrenOrphan-" + pagetreeId, e, mobile);
                        return false;
                    }
                );
                pagetreeDiv.find("a.plugin_pagetree_collapseall").click(
                    function(e) {
                        collapseAll("childrenOrphan-" + pagetreeId, e, mobile);
                        return false;
                    }
                );
            } else {
                pagetreeDiv.find("div.plugin_pagetree_children").attr("id", "children" + rootPage);
                pagetreeDiv.find("a.plugin_pagetree_expandall").click(
                    function(e) {
                        expandAll("children" + rootPage, e, mobile);
                        return false;
                    }
                );
                pagetreeDiv.find("a.plugin_pagetree_collapseall").click(
                    function(e) {
                        collapseAll("children" + rootPage, e, mobile);
                        return false;
                    }
                );
            }

            var pagetreeAncestorIds = getPageTreeAncestorIds(pagetreeDiv);
            loadChildren(
                rootPage, pagetreeAncestorIds, pagetreeParams["startDepth"], pagetreeParams["spaceKey"], "", mobile, true
            );
        };

        this.initPageTrees = function() {
            $("div.plugin_pagetree").each(function(pagetreeId) {
                initPageTree($(this), pagetreeId);
            });
            avoidBeingFocusedByBodyLoadFunction();
        };

        // The placeFocus() function won't focus on fields belonging to the form 'inlinecommentform'
        var avoidBeingFocusedByBodyLoadFunction = function() {
            var placeFocusFunction = self["placeFocus"];
            if (placeFocusFunction) {
                self["placeFocus"] = function() {
                    var pagetreeSearchForms = $("form[name='pagetreesearchform']");

                    pagetreeSearchForms.attr("name", "inlinecommentform");
                    placeFocusFunction();
                    pagetreeSearchForms.attr("name", "pagetreesearchform");
                };
            }
        };

        $(".open-flyout-to-search").bind("click",
            function(event) {
                if($(".fly-out-open").length)
                {
                    setTimeout(function() {
                        ConfluenceMobile.flyout.hide();
                    }, 400);
                }
                else
                {
                    setTimeout(function() {
                        ConfluenceMobile.flyout.show();

                    }, 400);
                }
                event.stopPropagation();
                event.preventDefault();
            }
        );
    };

    Confluence = Confluence || {};
    Confluence.Plugins = Confluence.Plugins || {};

    Confluence.Plugins.PagetreeMacro = {
        bind: function(jz) {
            var helper = new MobileMacroHelper(jz);
            helper.initPageTrees();
        }
    };

})();