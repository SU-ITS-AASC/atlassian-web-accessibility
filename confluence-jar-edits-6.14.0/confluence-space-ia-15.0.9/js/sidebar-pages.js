(function($) {
    var contextPath = AJS.Meta.get('context-path');

    Confluence.Sidebar.Pages = {
        installHandlers: function($sidebar) {
            $sidebar.find('.more-children-link').click(function(e) {
                e.preventDefault();
                $sidebar.find('ul.more-children').show();
                $(this).hide();
            });
        },
        quickLinksContent: function() {
            return new $.Deferred().resolve($('.acs-side-bar .quick-links-wrapper').html());
        },
        childPageCollapsedContent: function() {
            var $header = $('.acs-side-bar .ia-secondary-header');
            var $parentPage = $('.acs-side-bar .ia-secondary-parent-content');
            var $currentPage = $('.acs-side-bar .ia-secondary-current-content');
            var $contextualNav = $('.acs-side-bar .ia-secondary-content');

            return new $.Deferred().resolve($('<div>')
                .append($('<div>')
                    .addClass('acs-side-bar-flyout-wiki-wrapper')
                    .append($header.clone())
                    .append($parentPage.clone())
                    .append($currentPage.clone())
                    .append($contextualNav.clone()))
                .html());
        },
        pageTreeCollapsedContent: function() {
            var pageTreeFlyoutContent = $('.page-tree-flyout-content');

            if (pageTreeFlyoutContent.length == 0) {
                return getPageTreeFlyoutContent().pipe(function(contextualNavData) {
                    var renderedContent = $('<div>').addClass('acs-side-bar-flyout-wiki-wrapper').append(
                        Confluence.Templates.Sidebar.Pages.renderPageContextualNav({
                            pageContextualNav: contextualNavData,
                            hasCreatePermission: $('.acs-nav').data('has-create-permission')
                        })
                    );

                    $('body').append($('<div>')
                        .addClass('page-tree-flyout-content hidden')
                        .append(renderedContent.clone()));

                    return renderedContent;
                });
            } else {
                return new $.Deferred().resolve(pageTreeFlyoutContent.html());
            }
        }
    };

    function getPageTreeFlyoutContent() {
        return $.ajax({
            url: contextPath + "/rest/ia/1.0/space/childPagesContextualNav",
            data: {pageId: AJS.Meta.get('page-id')}
        });
    }
})(AJS.$);