AJS.toInit(function($) {
    var liveSearchIcons = {
        userinfo: "icon-user",
        personalspace: "icon-personal-space"
    };

    var transformResult = function(result) {
        var obj = {
            title: result.title,
            link: [
                {"type": "text/html",
                    "rel": "alternate",
                    "href": AJS.contextPath() + decodeURI(result.url)}
            ],
            type: result.contentType
        };

        //if this result belongs to a space, add it
        if (result.searchResultContainer) obj.space = { "name": result.searchResultContainer.name }

        //if the api provides an icon, use it.
        if (result.metadata && result.metadata.cssClass) obj.livesearchIconClass = result.metadata.cssClass;

        //add livesearch specific icons
        var contentType = result.contentType;
        if (contentType && liveSearchIcons[contentType]) obj.livesearchIconClass = liveSearchIcons[contentType];

        //add body text highlights
        if (result.bodyTextHighlights) obj.bodyTextHighlights = result.bodyTextHighlights;

        return obj;
    };

    var addAdditionalData = function(container, data) {
        container.after(container.clone().attr("class", "additional").html(data));
        container.parent().addClass("with-additional");
    };

    var buildSearchLink = function(query, where, message) {
        return [{
            title: message,
            link: [
                {"type": "text/html",
                 "rel": "alternate",
                 "href": AJS.params.baseUrl + '/dosearchsite.action?queryString=' + query + "&where=" + where
                }
            ],
            iconClass: 'search-for'
        }];
    };

    $('.search-macro-query input').each(function() {
        var $input = $(this),
            $form = $input.closest('form'),
            $searchButton = $form.find('.aui-icon.aui-iconfont-search'),
            where = $form.find("input[name='where']").val(),
            additional = $form.find("input[name='additional']").val(),
            labels = $form.find("input[name='labels']").val(),
            contentType = $form.find("input[name='contentType']").val();

        $input.quicksearch("/rest/searchv3/1.0/search", null, {
            minLengthForGetData: 3,
            dropdownPlacement : function(dropdown) {
                var ddParent = $form.siblings('.aui-dd-parent');
                var relativePos = $form.parent(".search-macro").position();
                ddParent.css({
                    position: 'absolute',
                    top: relativePos.top + $input.outerHeight(),
                    width: $input.outerWidth()
                });
                dropdown.width($input.outerWidth());
                ddParent.append(dropdown);
            },
            makeParams: function(value) {
                return {
                    queryString : value,
                    where : where,
                    labels: labels ? labels.split(',') : undefined,
                    type: contentType,
                    user : AJS.Meta.get('remote-user'),
                    pageSize: 5,
                    highlight: false,
                    sessionUuid: '0-0-0-0'
                };
            },
            makeRestMatrixFromData: function(data) {
                var results = [],
                    query = $input.val();
                if (data.results && data.results.length) {
                    results = _.map(data.results, transformResult);
                    return [results, buildSearchLink(query, where, AJS.I18n.getText("confluence.extra.livesearch.searchfor", query))];
                } else {
                    results = buildSearchLink(query, where, AJS.I18n.getText("confluence.extra.livesearch.no.results", query));
                    return results ? [results] : []
                }
            },
            dropdownPostprocess: function(dd) {
                AJS.$("a", dd).each(function () {
                    var $a = $(this),
                        $span = $a.find("span"),
                        $li = $a.parent("li"),
                        result = AJS.dropDown.getAdditionalPropertyValue($span, "restObj");

                    //prefer livesearchIcon over quicksearch generated class (when provided)
                    if (result && result.livesearchIconClass) {
                        var currentClass = AJS.dropDown.getAdditionalPropertyValue($span, "iconClass");
                        $a.removeClass(currentClass);
                        $span.addClass(result.livesearchIconClass);
                    }

                    // add additional data
                    if (additional === "space name") {
                        var spaceName = AJS.dropDown.getAdditionalPropertyValue($span, "spaceName");
                        if (spaceName && !$a.is(".content-type-spacedesc")) {
                            addAdditionalData($a, spaceName);
                        }
                    } else if (additional === "page excerpt") {
                        if(result.bodyTextHighlights) addAdditionalData($a, result.bodyTextHighlights);
                    }

                    //add content type as data attribute
                    $li.attr("data-content-type", result.type);

                });
            },
            ajsDropDownOptions: {
                className: "search-macro-dropdown"
            }
        });

        $input.on({
            "quick-search-loading-start" : function() {
                $searchButton.addClass("aui-icon-wait").removeClass("aui-iconfont-search");
            },
            "quick-search-loading-stop" : function() {
                $searchButton.removeClass("aui-icon-wait").addClass("aui-iconfont-search");
            }
        });
    });
});
