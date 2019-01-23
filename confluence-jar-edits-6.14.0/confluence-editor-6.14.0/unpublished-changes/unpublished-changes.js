/**
 * @module confluence-editor/unpublished-changes/unpublished-changes
 */
define('confluence-editor/unpublished-changes/unpublished-changes', [
    'jquery',
    'confluence/legacy',
    'ajs',
    'underscore',
    'tinymce'
], function(
    $,
    Confluence,
    AJS,
    _,
    tinymce
) {
    "use strict";

    return {
        init : function(ed) {
            var $lozengeTemplate = $(Confluence.Templates.UnpublishedChanges.lozenge({
                tooltip: AJS.I18n.getText('editor.unpublished.changes.lozenge.tooltip'),
                label: AJS.I18n.getText('editor.unpublished.changes.lozenge.label')
            }));

            var enablePublishButton = function(enabledState) {
                var state = _.isBoolean(enabledState) ? enabledState : true;

                Confluence.Editor.UI.setButtonState(state, $('#rte-button-publish'));
            };

            var enableLozenge = function(enabledState, callback) {
                var cb = callback || function(){};
                var state = _.isBoolean(enabledState) ? enabledState : true;
                var _visibleClass = "visible";

                if(!state) {
                    $lozengeTemplate.fadeOut('fast', function(){
                        $(this).hide().removeClass(_visibleClass);
                        cb();
                    });
                } else {
                    $lozengeTemplate.addClass(_visibleClass).fadeIn('fast', cb);
                }
            };

            var UnpublishedChangesManager = {
                show: function() {
                    if(!$lozengeTemplate.hasClass('visible')) {
                        enableLozenge(true, enablePublishButton);
                    }
                },
                hide: function() {
                    // we hide the lozenge container
                    enableLozenge(false);

                    // when there are no changes the publish button should be disabled
                    enablePublishButton(false);
                }
            };

            var bindEvents = function() {
                var $titleInputField = $('#content-title');

                $titleInputField.on('keydown change', UnpublishedChangesManager.show);

                // change event is triggered when an undo level is created on tinymce
                ed.onChange.add(UnpublishedChangesManager.show);
                ed.onKeyDown.add(UnpublishedChangesManager.show);

                ed.onLoad.add(function (){
                    /*
                     We don't want to show the lozenge if someone hits edit on a page with no historical draft, though we want it to if someone creates a new page w/ content. (i.e. template)
                     If you create a new page the existing 'existing-draft-id' will be "0", so instead we have to use 'draft-id' here.

                     If the page content is not 'empty', the current editor instance does not represent a draft, the content is considered unpublished.
                     */
                    if ($(ed.startContent).text().trim() && (AJS.Meta.get('draft-id') > 0)) {
                        UnpublishedChangesManager.show();
                    }
                });

                // track user hover over tipsy
                $lozengeTemplate.on('mouseenter.tipsy', function() {
                    AJS.trigger('analytics', { name: 'confluence.editor.unpublished-changes.lozenge.hover' });
                });
            };

            var setup = function() {
                var $titleContainer = $('#content-title-div');

                // The lozenge should be hidden before insertion (to avoid flickering).
                UnpublishedChangesManager.hide();

                // insert before the title, on the future this will be changed since there will be a new container for actions
                $lozengeTemplate.insertBefore($titleContainer);

                // enable the tipsy tooltips
                $lozengeTemplate.tooltip();

                // bind unpublished changes related events
                bindEvents();

                // allowing unpublished changes to be triggered from tinymce exec command
                ed.addCommand('mceConf.UnpublishedChangesLozenge.show', UnpublishedChangesManager.show);
                ed.addCommand('mceConf.UnpublishedChangesLozenge.hide', UnpublishedChangesManager.hide);
            };

            // only setup the lozenge after all plugins and all the editor has been initialized
            AJS.bind('rte-ready', setup);
        },

        getInfo : function() {
            return {
                longname : 'Unpublished Changes',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                version : tinymce.majorVersion + '.' + tinymce.minorVersion
            };
        }
    };
});

require('confluence/module-exporter').safeRequire('confluence-editor/unpublished-changes/unpublished-changes', function(UnpublishedChanges) {
    var tinymce = require('tinymce');

    tinymce.create('tinymce.plugins.UnpublishedChanges', UnpublishedChanges);
    tinymce.PluginManager.add('unpublishedchanges', tinymce.plugins.UnpublishedChanges);
});

