(function ($) {
    Confluence.Sidebar.LinkAdapter = {
        setLink: function(link) {
            var contextPath = AJS.Meta.get('context-path');
            var linkTitle = Confluence.unescapeEntities(link.getHtml());
            var linkData = {
                spaceKey: AJS.Meta.get('space-key'),
                resourceId: link.attrs['data-linked-resource-id'],
                resourceType: link.attrs['data-linked-resource-type'],
                customTitle: linkTitle == link.getDefaultAlias() ? "" : linkTitle,
                url: link.attrs['href']
            };
            $.ajax({
                type: 'POST',
                url: contextPath + '/rest/ia/1.0/link',
                data: $.toJSON(linkData),
                dataType: 'json',
                contentType: 'application/json',
                success: function(data){
                    AJS.Confluence.Sidebar.Configure.QuickLinks.addRow({
                        id: data.id, title: data.title, styleClass: data.styleClass, canHide: data.canHide, hidden: data.hidden
                    });
                }
            });
        },
        getLink: function(){
            return Confluence.Link.fromData({
                attrs: {},
                body: {
                    isEditable: true,
                    isImage: false,
                    html: "",
                    imgName: "",
                    text: ""
                }
            });
        },
        hijackedLinkBrowser: false,
        hijackLinkBrowser: function() {
            var sidebarLinkAdapter = Confluence.Sidebar.LinkAdapter;

            if (!sidebarLinkAdapter.hijackedLinkBrowser) {
                sidebarLinkAdapter.storeBookmark = AJS.Rte.BookmarkManager.storeBookmark;
                sidebarLinkAdapter.restoreBookmark = AJS.Rte.BookmarkManager.restoreBookmark;
                AJS.Rte.BookmarkManager.storeBookmark = $.noop;
                AJS.Rte.BookmarkManager.restoreBookmark = $.noop;

                sidebarLinkAdapter.oldLinkAdapter = Confluence.Editor.LinkAdapter;
                Confluence.Editor.LinkAdapter = sidebarLinkAdapter;

                sidebarLinkAdapter.$oldTabItems = $('#link-browser-tab-items div');
                sidebarLinkAdapter.$oldTabItems.each(function() {
                    AJS.debug('while iterating over tab items: ' + $(this));
                    var panelId = $(this).text();
                    if (panelId != 'search' && panelId != 'recentlyviewed' && panelId != 'weblink') {
                        $(this).remove();
                    }
                });

                sidebarLinkAdapter.hijackedLinkBrowser = true;
            }
        },
        releaseLinkBrowser: function() {
            var sidebarLinkAdapter = Confluence.Sidebar.LinkAdapter;

            if (sidebarLinkAdapter.hijackedLinkBrowser) {
                AJS.Rte.BookmarkManager.storeBookmark = sidebarLinkAdapter.storeBookmark;
                AJS.Rte.BookmarkManager.restoreBookmark = sidebarLinkAdapter.restoreBookmark;

                $('#link-browser-tab-items').empty().append(sidebarLinkAdapter.$oldTabItems);

                Confluence.Editor.LinkAdapter = sidebarLinkAdapter.oldLinkAdapter;
                sidebarLinkAdapter.hijackedLinkBrowser = false;
            }
        }
    };

    AJS.bind('closed.link-browser', function() {
        if (Confluence.Sidebar.LinkAdapter.hijackedLinkBrowser) {
            Confluence.Sidebar.LinkAdapter.releaseLinkBrowser();
        }
    });
    AJS.bind('updated.link-browser-recently-viewed', function() {
        var pageTitle = AJS.Meta.get('page-title'),
            spaceName = AJS.Meta.get('space-name');

        if (pageTitle && spaceName) {
            $('#insert-link-dialog .recently-viewed-panel .data-table tr').each(function() {
                var $this = $(this);
                if ($this.find('.title-field').text() == pageTitle && $this.find('.space-field').text() == spaceName) {
                    $this.click();
                }
            });
        }
    });
})(AJS.$);