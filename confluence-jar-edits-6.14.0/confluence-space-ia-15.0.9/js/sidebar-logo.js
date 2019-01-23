AJS.toInit(function($) {
    Confluence.Sidebar.Configure.Logo = {};

    var $spaceNameLink = $('.acs-side-bar-space-info div.name a');
    var avatarPickerDialog;
    var flyout;

    var updateLogo = function(logoPath) {
        $('.space-logo .avatar-img').attr('src', AJS.Meta.get('context-path') + logoPath);
    };

    var updateSpaceName = function(spaceName) {
        $spaceNameLink.attr('title', spaceName).text(spaceName);
    };

    var showConfigureLogoDialog = function (AvatarPickerDialog) {
        if (!avatarPickerDialog) {
            avatarPickerDialog = new AvatarPickerDialog({
                onCrop: function(croppedDataURI, spaceName) {

                    // send off the croppedDataURI to Java land...
                    $.ajax({
                        type:'POST',
                        dataType:"json",
                        contentType:"application/json",
                        data: JSON.stringify({
                            spaceKey: AJS.Meta.get('space-key'),
                            spaceName: spaceName,
                            logoDataURI: croppedDataURI
                        }),
                        url: AJS.Meta.get('context-path') + '/rest/ia/1.0/space/setLogo',
                        success: function(data) {
                            updateLogo(data.logoDownloadPath);
                            updateSpaceName(data.name);
                            avatarPickerDialog.hide();
                        },
                        error:function (xhr) {
                            avatarPickerDialog.setMessage(AJS.I18n.getText('sidebar.avatar.picker.upload.error'));
                            avatarPickerDialog._removeSaveImageLoadingIcon();
                        }
                    });
                }
            });
        }
        avatarPickerDialog.show($('.acs-side-bar-space-info div.name a').text());
        return false;
    };

    var showFlyoutPrompt = function() {
        var dialogLoadOverride = function (content, trigger, showPopup) {
            $(content).addClass('acs-side-bar-flyout');
            $(content).empty();
            content.html(AJS.template.load('logo-config-content'));

            content.unbind('mouseover mouseout');
            AJS.trigger('sidebar.disable-tooltip', trigger);
            showPopup();
        };

        if (!flyout) {
            flyout = AJS.InlineDialog($('.acs-side-bar-space-info'), 'space-logo-config', dialogLoadOverride, {
                gravity: 'w',
                calculatePositions: calculateFlyoutPositions,
                useLiveEvents: true,
                hideCallback: function () {AJS.trigger('sidebar.enable-all-tooltips');},
                hideDelay: null,
                noBind: true,
                width: 635 // Image max width + 20px flyout padding + 145px fieldset padding
            });
        }

        function calculateFlyoutPositions(popup, targetPosition, mousePosition, opts) {
            var targetOffset = targetPosition.target.offset();
            var targetWidth = targetPosition.target.width();
            var targetHeight = targetPosition.target.height();
            var popupCss = {
                top: targetOffset.top + targetHeight / 2 - 15,
                left: targetOffset.left + targetWidth + 5,
                right: 'auto'
            };
            var arrowCss = {
                top: 9
            };

            return {
                popupCss: popupCss,
                arrowCss: arrowCss,
                gravity: 'w'
            };
        }

        flyout.show();
    };

    AJS.bind("sidebar-before-enter-configure-mode", function() {
        AJS.bind("deferred.spaceia.open.configure.space", function (e) {
            if (AJS.Meta.get('space-key') == '~' + AJS.Meta.get('remote-user')) {
                showFlyoutPrompt();
            } else {
                // This is due for a refactoring. This is a fix for async loading
                // of avatar picker. Turns out we were loading the avatar picker on
                // every page. This is fixed now.
                require([
                    'confluence-space-ia/avatar-picker/avatar-picker-dialog',
                ], showConfigureLogoDialog);
            }
            e.preventDefault();
            return false;
        });
    });

    Confluence.Sidebar.Configure.Logo.unbind = function () {
        // cancel anything that the dialog has not saved (eg. user set to use default icon but hasn't saved it)
        $('#inline-dialog-space-logo-config .cancel').click();
        $('.acs-side-bar-space-info').off('click.configurelogo');

        // unbind the events
        AJS.unbind("deferred.spaceia.open.configure.space");
    };
});